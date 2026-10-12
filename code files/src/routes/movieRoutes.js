const express = require('express');
const router = express.Router();
const {
  getAllMovies,
  getMovieById,
  createMovie,
  updateMovie,
  deleteMovie,
  getFilterMetadata
} = require('../controllers/movieController');
const { protect, authorize } = require('../middleware/auth');

router.get('/filters/metadata', getFilterMetadata);
router.route('/')
  .get(getAllMovies)
  .post(protect, authorize('admin'), createMovie);

router.route('/:id')
  .get(getMovieById)
  .put(protect, authorize('admin'), updateMovie)
  .delete(protect, authorize('admin'), deleteMovie);

module.exports = router;
