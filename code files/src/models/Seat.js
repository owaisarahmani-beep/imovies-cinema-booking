const mongoose = require('mongoose');

const seatSchema = new mongoose.Schema(
  {
    show: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Show',
      required: [true, 'Show reference is required'],
      index: true
    },
    seatNumber: {
      type: String, // e.g. "A1", "C5", "H10"
      required: true,
      trim: true
    },
    row: {
      type: String, // "A", "B", ... "H"
      required: true,
      trim: true
    },
    number: {
      type: Number, // 1 to 10
      required: true
    },
    tier: {
      type: String,
      enum: ['VIP', 'Premium', 'Standard'],
      default: 'Standard'
    },
    price: {
      type: Number,
      required: true
    },
    status: {
      type: String,
      enum: ['available', 'locked', 'booked'],
      default: 'available',
      index: true
    },
    lockedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    lockExpiresAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

// Unique compound index: each seat in a show can only exist once
seatSchema.index({ show: 1, seatNumber: 1 }, { unique: true });

// High-speed index for real-time seat availability queries
seatSchema.index({ show: 1, status: 1 });

module.exports = mongoose.model('Seat', seatSchema);
