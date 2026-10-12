const Movie = require('../models/Movie');
const Show = require('../models/Show');

// @desc    Get all movies with search, filter, and pagination
// @route   GET /api/movies
// @access  Public
exports.getAllMovies = async (req, res, next) => {
  try {
    const { search, genre, language, sort, page = 1, limit = 12 } = req.query;

    const query = { isActive: true };

    // Text search or regex title search
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Genre filter
    if (genre && genre !== 'All') {
      query.genre = { $in: [genre] };
    }

    // Language filter
    if (language && language !== 'All') {
      query.language = { $in: [language] };
    }

    // Sorting
    let sortBy = { releaseDate: -1 };
    if (sort === 'rating') sortBy = { rating: -1 };
    if (sort === 'title') sortBy = { title: 1 };
    if (sort === 'oldest') sortBy = { releaseDate: 1 };

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const total = await Movie.countDocuments(query);
    const movies = await Movie.find(query)
      .sort(sortBy)
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      count: movies.length,
      total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      movies
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single movie by ID
// @route   GET /api/movies/:id
// @access  Public
exports.getMovieById = async (req, res, next) => {
  try {
    const movie = await Movie.findById(req.params.id);

    if (!movie) {
      return res.status(404).json({
        success: false,
        message: 'Movie not found'
      });
    }

    res.status(200).json({
      success: true,
      movie
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new movie
// @route   POST /api/movies
// @access  Private/Admin
exports.createMovie = async (req, res, next) => {
  try {
    const movie = await Movie.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Movie added successfully',
      movie
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update movie
// @route   PUT /api/movies/:id
// @access  Private/Admin
exports.updateMovie = async (req, res, next) => {
  try {
    let movie = await Movie.findById(req.params.id);

    if (!movie) {
      return res.status(404).json({
        success: false,
        message: 'Movie not found'
      });
    }

    movie = await Movie.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      message: 'Movie updated successfully',
      movie
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete movie (soft or hard delete)
// @route   DELETE /api/movies/:id
// @access  Private/Admin
exports.deleteMovie = async (req, res, next) => {
  try {
    const movie = await Movie.findById(req.params.id);

    if (!movie) {
      return res.status(404).json({
        success: false,
        message: 'Movie not found'
      });
    }

    // Set isActive to false or delete
    await Movie.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Movie removed successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all distinct genres and languages for filter bars
// @route   GET /api/movies/filters/metadata
// @access  Public
exports.getFilterMetadata = async (req, res, next) => {
  try {
    const genres = await Movie.distinct('genre', { isActive: true });
    const languages = await Movie.distinct('language', { isActive: true });

    res.status(200).json({
      success: true,
      genres,
      languages
    });
  } catch (error) {
    next(error);
  }
};
