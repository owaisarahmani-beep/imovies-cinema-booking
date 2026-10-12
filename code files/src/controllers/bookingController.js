const Booking = require('../models/Booking');
const Seat = require('../models/Seat');
const Show = require('../models/Show');
const Payment = require('../models/Payment');
const Notification = require('../models/Notification');

// Helper to calculate total amount for selected seats
const calculateSeatTotal = async (showId, seatNumbers) => {
  const seats = await Seat.find({
    show: showId,
    seatNumber: { $in: seatNumbers }
  });

  if (seats.length !== seatNumbers.length) {
    throw new Error('One or more selected seats could not be found.');
  }

  const baseAmount = seats.reduce((sum, seat) => sum + seat.price, 0);
  const convenienceFee = 30;
  const taxes = 20;
  const grandTotal = baseAmount + convenienceFee + taxes;

  return { seats, baseAmount, convenienceFee, taxes, grandTotal };
};

// @desc    Lock seats temporarily for 5 minutes during checkout
// @route   POST /api/bookings/lock-seats
// @access  Private
exports.lockSeats = async (req, res, next) => {
  try {
    const { showId, seatNumbers } = req.body;

    if (!showId || !seatNumbers || !seatNumbers.length) {
      return res.status(400).json({
        success: false,
        message: 'Show ID and seat numbers are required'
      });
    }

    const now = new Date();

    // Check if any seat is already booked or currently locked by another user
    const existingSeats = await Seat.find({
      show: showId,
      seatNumber: { $in: seatNumbers }
    });

    const unavailableSeats = [];
    for (const seat of existingSeats) {
      if (seat.status === 'booked') {
        unavailableSeats.push(seat.seatNumber);
      } else if (
        seat.status === 'locked' &&
        seat.lockExpiresAt > now &&
        seat.lockedBy &&
        seat.lockedBy.toString() !== req.user.id
      ) {
        unavailableSeats.push(seat.seatNumber);
      }
    }

    if (unavailableSeats.length > 0) {
      return res.status(409).json({
        success: false,
        message: `Seats ${unavailableSeats.join(', ')} are already taken or locked by another customer.`,
        unavailableSeats
      });
    }

    // Lock seats for 5 minutes
    const lockExpiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await Seat.updateMany(
      {
        show: showId,
        seatNumber: { $in: seatNumbers }
      },
      {
        $set: {
          status: 'locked',
          lockedBy: req.user.id,
          lockExpiresAt
        }
      }
    );

    // Broadcast seat lock event via Socket.io
    const io = req.app.get('io');
    if (io) {
      io.to(showId.toString()).emit('seats_locked', {
        seatNumbers,
        lockedBy: req.user.id,
        lockExpiresAt
      });
    }

    res.status(200).json({
      success: true,
      message: 'Seats reserved for checkout (5-minute hold)',
      seatNumbers,
      lockExpiresAt
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Release locked seats (e.g. user leaves checkout)
// @route   POST /api/bookings/release-seats
// @access  Private
exports.releaseSeats = async (req, res, next) => {
  try {
    const { showId, seatNumbers } = req.body;

    if (!showId || !seatNumbers || !seatNumbers.length) {
      return res.status(400).json({ success: false, message: 'Missing parameters' });
    }

    await Seat.updateMany(
      {
        show: showId,
        seatNumber: { $in: seatNumbers },
        lockedBy: req.user.id
      },
      {
        $set: {
          status: 'available',
          lockedBy: null,
          lockExpiresAt: null
        }
      }
    );

    // Broadcast seat release event via Socket.io
    const io = req.app.get('io');
    if (io) {
      io.to(showId.toString()).emit('seats_released', {
        seatNumbers
      });
    }

    res.status(200).json({
      success: true,
      message: 'Seats released back to available pool'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Confirm booking and process simulated payment
// @route   POST /api/bookings
// @access  Private
exports.createBooking = async (req, res, next) => {
  try {
    const { showId, seatNumbers, paymentMethod, cardDetails } = req.body;

    if (!showId || !seatNumbers || !seatNumbers.length) {
      return res.status(400).json({
        success: false,
        message: 'Show and seat numbers are required to book'
      });
    }

    const show = await Show.findById(showId).populate('movie').populate('theatre');
    if (!show) {
      return res.status(404).json({ success: false, message: 'Show not found' });
    }

    // Verify seats
    const { seats, baseAmount, convenienceFee, taxes, grandTotal } =
      await calculateSeatTotal(showId, seatNumbers);

    const now = new Date();
    // Verify none are already booked or locked by someone else
    for (const seat of seats) {
      if (seat.status === 'booked') {
        return res.status(409).json({
          success: false,
          message: `Seat ${seat.seatNumber} has already been booked by another customer.`
        });
      }
      if (
        seat.status === 'locked' &&
        seat.lockExpiresAt > now &&
        seat.lockedBy &&
        seat.lockedBy.toString() !== req.user.id
      ) {
        return res.status(409).json({
          success: false,
          message: `Seat ${seat.seatNumber} is currently held by someone else.`
        });
      }
    }

    // Generate unique Booking ID and Transaction ID
    const randomNum = Math.floor(100000 + Math.random() * 900000);
    const bookingId = `IMOV-${randomNum}`;
    const transactionId = `TXN_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    // Create Booking record
    const booking = await Booking.create({
      bookingId,
      user: req.user.id,
      show: show._id,
      movie: show.movie._id,
      theatre: show.theatre._id,
      seats: seatNumbers,
      seatCount: seatNumbers.length,
      baseAmount,
      convenienceFee,
      taxes,
      grandTotal,
      bookingStatus: 'confirmed',
      paymentStatus: 'paid',
      paymentMethod: paymentMethod || 'Card',
      transactionId
    });

    // Create Payment record
    const payment = await Payment.create({
      booking: booking._id,
      user: req.user.id,
      amount: grandTotal,
      currency: 'INR',
      paymentMethod: paymentMethod || 'Card',
      transactionId,
      status: 'success',
      details: {
        cardLast4: cardDetails?.last4 || '4242',
        cardBrand: cardDetails?.brand || 'Visa',
        upiId: cardDetails?.upiId || ''
      }
    });

    // Mark seats as permanently booked
    await Seat.updateMany(
      {
        show: showId,
        seatNumber: { $in: seatNumbers }
      },
      {
        $set: {
          status: 'booked',
          lockedBy: null,
          lockExpiresAt: null
        }
      }
    );

    // Decrement available seat count on show
    show.availableSeatsCount = Math.max(0, show.availableSeatsCount - seatNumbers.length);
    await show.save();

    // Create confirmation Notification
    await Notification.create({
      user: req.user.id,
      title: '🎟️ Booking Confirmed!',
      message: `Your tickets for "${show.movie.title}" (${seatNumbers.join(', ')}) at ${show.theatre.name} are confirmed! Booking ID: ${bookingId}`,
      type: 'booking_confirmed',
      metadata: { bookingId: booking._id }
    });

    // Broadcast seat booked event via Socket.io
    const io = req.app.get('io');
    if (io) {
      io.to(showId.toString()).emit('seats_booked', {
        seatNumbers
      });
    }

    // Populate booking response
    const populatedBooking = await Booking.findById(booking._id)
      .populate('movie')
      .populate('theatre')
      .populate('show');

    res.status(201).json({
      success: true,
      message: 'Movie tickets booked successfully!',
      booking: populatedBooking,
      payment
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's personal booking history
// @route   GET /api/bookings/my-bookings
// @access  Private
exports.getUserBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ user: req.user.id })
      .populate('movie')
      .populate('theatre')
      .populate('show')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      bookings
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel a booking and process refund
// @route   POST /api/bookings/:id/cancel
// @access  Private
exports.cancelBooking = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const booking = await Booking.findById(req.params.id)
      .populate('movie')
      .populate('theatre');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Check ownership or admin status
    if (booking.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to cancel this booking' });
    }

    if (booking.bookingStatus === 'cancelled') {
      return res.status(400).json({ success: false, message: 'This booking has already been cancelled' });
    }

    // Update booking status
    booking.bookingStatus = 'cancelled';
    booking.paymentStatus = 'refunded';
    booking.cancellationReason = reason || 'Customer requested cancellation';
    booking.cancelledAt = new Date();
    await booking.save();

    // Update payment record to refunded
    await Payment.findOneAndUpdate(
      { booking: booking._id },
      { $set: { status: 'refunded' } }
    );

    // Release seats back to available
    await Seat.updateMany(
      {
        show: booking.show,
        seatNumber: { $in: booking.seats }
      },
      {
        $set: {
          status: 'available',
          lockedBy: null,
          lockExpiresAt: null
        }
      }
    );

    // Increase available seats count on show
    const show = await Show.findById(booking.show);
    if (show) {
      show.availableSeatsCount = Math.min(show.totalSeats, show.availableSeatsCount + booking.seats.length);
      await show.save();
    }

    // Create cancellation notification
    await Notification.create({
      user: booking.user,
      title: 'Booking Cancelled',
      message: `Your booking ${booking.bookingId} for "${booking.movie.title}" has been cancelled. Full refund of ₹${booking.grandTotal} initiated.`,
      type: 'booking_cancelled',
      metadata: { bookingId: booking._id }
    });

    // Broadcast seat availability via Socket.io
    const io = req.app.get('io');
    if (io) {
      io.to(booking.show.toString()).emit('seats_released', {
        seatNumbers: booking.seats
      });
    }

    res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully. Refund initiated.',
      booking
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all bookings (Admin view with analytics)
// @route   GET /api/bookings/admin/all
// @access  Private/Admin
exports.getAllBookingsAdmin = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = {};
    if (status) query.bookingStatus = status;

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const total = await Booking.countDocuments(query);
    const bookings = await Booking.find(query)
      .populate('user', 'name email phone')
      .populate('movie', 'title poster')
      .populate('theatre', 'name city')
      .populate('show', 'showDate showTime')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    // Calculate total revenue from active bookings
    const revenueAgg = await Booking.aggregate([
      { $match: { bookingStatus: 'confirmed' } },
      { $group: { _id: null, totalRevenue: { $sum: '$grandTotal' } } }
    ]);
    const totalRevenue = revenueAgg[0]?.totalRevenue || 0;

    res.status(200).json({
      success: true,
      count: bookings.length,
      total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      totalRevenue,
      bookings
    });
  } catch (error) {
    next(error);
  }
};
