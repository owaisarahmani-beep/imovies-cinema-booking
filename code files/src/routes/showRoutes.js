const express = require('express');
const router = express.Router();
const {
  getShowsByMovie,
  getShowByIdAndSeats,
  createShow,
  deleteShow
} = require('../controllers/showController');
const { protect, authorize } = require('../middleware/auth');

router.get('/movie/:movieId', getShowsByMovie);
router.get('/:id', getShowByIdAndSeats);
router.post('/', protect, authorize('admin'), createShow);
router.delete('/:id', protect, authorize('admin'), deleteShow);

module.exports = router;
