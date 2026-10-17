const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    bookingId: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      index: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      index: true
    },
    show: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Show',
      required: [true, 'Show reference is required'],
      index: true
    },
    movie: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Movie',
      required: true
    },
    theatre: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Theatre',
      required: true
    },
    seats: {
      type: [String], // Array of seat numbers e.g. ["D4", "D5"]
      required: [true, 'At least one seat must be selected']
    },
    seatCount: {
      type: Number,
      required: true
    },
    baseAmount: {
      type: Number,
      required: true
    },
    convenienceFee: {
      type: Number,
      default: 30
    },
    taxes: {
      type: Number,
      default: 20
    },
    snacks: [
      {
        id: String,
        name: String,
        price: Number,
        count: Number,
        emoji: String
      }
    ],
    snacksTotal: {
      type: Number,
      default: 0
    },
    grandTotal: {
      type: Number,
      required: true
    },
    bookingStatus: {
      type: String,
      enum: ['confirmed', 'cancelled'],
      default: 'confirmed',
      index: true
    },
    paymentStatus: {
      type: String,
      enum: ['paid', 'refunded', 'failed'],
      default: 'paid'
    },
    paymentMethod: {
      type: String,
      default: 'Credit/Debit Card'
    },
    transactionId: {
      type: String,
      default: ''
    },
    cancellationReason: {
      type: String,
      default: ''
    },
    cancelledAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

// High performance index for user's booking history timeline
bookingSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('Booking', bookingSchema);
