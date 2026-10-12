const express = require('express');
const router = express.Router();
const {
  getAllTheatres,
  getTheatreById,
  createTheatre,
  updateTheatre,
  deleteTheatre,
  getCities
} = require('../controllers/theatreController');
const { protect, authorize } = require('../middleware/auth');

router.get('/cities', getCities);

router.route('/')
  .get(getAllTheatres)
  .post(protect, authorize('admin'), createTheatre);

router.route('/:id')
  .get(getTheatreById)
  .put(protect, authorize('admin'), updateTheatre)
  .delete(protect, authorize('admin'), deleteTheatre);

module.exports = router;
