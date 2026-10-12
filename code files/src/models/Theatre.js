const mongoose = require('mongoose');

const screenSchema = new mongoose.Schema({
  screenName: {
    type: String,
    required: true,
    trim: true
  },
  totalRows: {
    type: Number,
    default: 8 // Rows A through H
  },
  seatsPerRow: {
    type: Number,
    default: 10 // Seats 1 through 10
  },
  seatCapacity: {
    type: Number,
    default: 80
  }
});

const theatreSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Theatre name is required'],
      trim: true,
      index: true
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true,
      index: true
    },
    location: {
      type: String,
      required: [true, 'Location address is required'],
      trim: true
    },
    totalScreens: {
      type: Number,
      default: 1
    },
    screens: [screenSchema],
    facilities: {
      type: [String],
      default: ['Dolby Atmos', '4K Projection', 'Recliner Seats', 'Cafeteria']
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

// Compound index for filtering theatres by city
theatreSchema.index({ city: 1, name: 1 });

module.exports = mongoose.model('Theatre', theatreSchema);
