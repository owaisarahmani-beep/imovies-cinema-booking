const express = require('express');
const router = express.Router();
const {
  lockSeats,
  releaseSeats,
  createBooking,
  getUserBookings,
  cancelBooking,
  getAllBookingsAdmin
} = require('../controllers/bookingController');
const { protect, authorize } = require('../middleware/auth');

router.post('/lock-seats', protect, lockSeats);
router.post('/release-seats', protect, releaseSeats);
router.post('/', protect, createBooking);
router.get('/my-bookings', protect, getUserBookings);
router.post('/:id/cancel', protect, cancelBooking);
router.get('/admin/all', protect, authorize('admin'), getAllBookingsAdmin);

module.exports = router;
