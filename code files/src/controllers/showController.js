const Show = require('../models/Show');
const Seat = require('../models/Seat');
const Theatre = require('../models/Theatre');
const Movie = require('../models/Movie');

// Helper to generate seat matrix for a new show (Rows A-H, Seats 1-10)
const generateSeatsForShow = async (showId, pricing) => {
  const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
  const seatsPerRow = 10;
  const seats = [];

  for (const row of rows) {
    let tier = 'Standard';
    let price = pricing.standard || 180;

    if (row === 'A' || row === 'B') {
      tier = 'VIP';
      price = pricing.vip || 350;
    } else if (row === 'C' || row === 'D' || row === 'E') {
      tier = 'Premium';
      price = pricing.premium || 250;
    }

    for (let num = 1; num <= seatsPerRow; num++) {
      seats.push({
        show: showId,
        seatNumber: `${row}${num}`,
        row,
        number: num,
        tier,
        price,
        status: 'available'
      });
    }
  }

  await Seat.insertMany(seats);
};

// @desc    Get shows for a specific movie grouped by theatre
// @route   GET /api/shows/movie/:movieId
// @access  Public
exports.getShowsByMovie = async (req, res, next) => {
  try {
    const { movieId } = req.params;
    const { date, city } = req.query;

    const movie = await Movie.findById(movieId);
    if (!movie) {
      return res.status(404).json({ success: false, message: 'Movie not found' });
    }

    // Filter by date range (start of day to end of day)
    let dateFilter = {};
    if (date) {
      const selectedDate = new Date(date);
      const startOfDay = new Date(selectedDate.setHours(0, 0, 0, 0));
      const endOfDay = new Date(selectedDate.setHours(23, 59, 59, 999));
      dateFilter = { showDate: { $gte: startOfDay, $lte: endOfDay } };
    } else {
      // Default: today onwards
      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);
      dateFilter = { showDate: { $gte: startOfToday } };
    }

    const shows = await Show.find({
      movie: movieId,
      isActive: true,
      ...dateFilter
    })
      .populate('theatre')
      .sort({ showDate: 1, showTime: 1 });

    // Filter by city if requested
    let filteredShows = shows;
    if (city && city !== 'All') {
      filteredShows = shows.filter(
        (show) => show.theatre && show.theatre.city.toLowerCase() === city.toLowerCase()
      );
    }

    // Group shows by Theatre for a BookMyShow style display
    const theatreMap = {};
    filteredShows.forEach((show) => {
      if (!show.theatre) return;
      const tId = show.theatre._id.toString();
      if (!theatreMap[tId]) {
        theatreMap[tId] = {
          theatre: show.theatre,
          shows: []
        };
      }
      theatreMap[tId].shows.push({
        _id: show._id,
        screenName: show.screenName,
        showDate: show.showDate,
        showTime: show.showTime,
        format: show.format,
        pricing: show.pricing,
        availableSeatsCount: show.availableSeatsCount,
        totalSeats: show.totalSeats
      });
    });

    res.status(200).json({
      success: true,
      movie,
      theatres: Object.values(theatreMap)
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single show details and its live seat matrix
// @route   GET /api/shows/:id
// @access  Public
exports.getShowByIdAndSeats = async (req, res, next) => {
  try {
    const show = await Show.findById(req.params.id)
      .populate('movie')
      .populate('theatre');

    if (!show) {
      return res.status(404).json({ success: false, message: 'Show not found' });
    }

    // Self-healing: release any expired locks
    const now = new Date();
    await Seat.updateMany(
      {
        show: show._id,
        status: 'locked',
        lockExpiresAt: { $lt: now }
      },
      {
        $set: { status: 'available', lockedBy: null, lockExpiresAt: null }
      }
    );

    // Fetch all seats for this show sorted logically
    const seats = await Seat.find({ show: show._id }).sort({ row: 1, number: 1 });

    // Update real-time available seat count
    const availableCount = seats.filter((s) => s.status === 'available').length;
    if (show.availableSeatsCount !== availableCount) {
      show.availableSeatsCount = availableCount;
      await show.save();
    }

    res.status(200).json({
      success: true,
      show,
      seats
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new show & generate seat layout
// @route   POST /api/shows
// @access  Private/Admin
exports.createShow = async (req, res, next) => {
  try {
    const { movie, theatre, screenName, showDate, showTime, format, pricing } = req.body;

    const defaultPricing = pricing || { vip: 350, premium: 250, standard: 180 };

    const show = await Show.create({
      movie,
      theatre,
      screenName: screenName || 'Screen 1',
      showDate: new Date(showDate),
      showTime,
      format: format || '2D',
      pricing: defaultPricing,
      totalSeats: 80,
      availableSeatsCount: 80
    });

    // Auto-generate the 80 individual seats
    await generateSeatsForShow(show._id, defaultPricing);

    res.status(201).json({
      success: true,
      message: 'Show created with 80-seat matrix generated',
      show
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete show and associated seats
// @route   DELETE /api/shows/:id
// @access  Private/Admin
exports.deleteShow = async (req, res, next) => {
  try {
    const show = await Show.findByIdAndDelete(req.params.id);
    if (!show) {
      return res.status(404).json({ success: false, message: 'Show not found' });
    }

    // Delete associated seats
    await Seat.deleteMany({ show: req.params.id });

    res.status(200).json({
      success: true,
      message: 'Show and related seat data removed successfully'
    });
  } catch (error) {
    next(error);
  }
};
