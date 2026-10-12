const mongoose = require('mongoose');

const showSchema = new mongoose.Schema(
  {
    movie: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Movie',
      required: [true, 'Movie reference is required'],
      index: true
    },
    theatre: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Theatre',
      required: [true, 'Theatre reference is required'],
      index: true
    },
    screenName: {
      type: String,
      required: true,
      default: 'Screen 1'
    },
    showDate: {
      type: Date,
      required: [true, 'Show date is required'],
      index: true
    },
    showTime: {
      type: String,
      required: [true, 'Show time is required'] // e.g., '10:30 AM', '02:00 PM', '06:30 PM'
    },
    format: {
      type: String,
      enum: ['2D', '3D', 'IMAX 3D', '4DX'],
      default: '2D'
    },
    pricing: {
      vip: { type: Number, default: 350 },
      premium: { type: Number, default: 250 },
      standard: { type: Number, default: 180 }
    },
    totalSeats: {
      type: Number,
      default: 80
    },
    availableSeatsCount: {
      type: Number,
      default: 80
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

// High performance compound indexes for show filtering by movie, theatre, and date
showSchema.index({ movie: 1, showDate: 1, theatre: 1 });
showSchema.index({ theatre: 1, showDate: 1 });

module.exports = mongoose.model('Show', showSchema);
