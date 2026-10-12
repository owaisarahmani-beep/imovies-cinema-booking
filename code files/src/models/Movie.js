const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Movie title is required'],
      trim: true,
      index: true
    },
    description: {
      type: String,
      required: [true, 'Movie description is required'],
      trim: true
    },
    poster: {
      type: String,
      required: [true, 'Movie poster URL is required']
    },
    banner: {
      type: String,
      default: ''
    },
    trailerUrl: {
      type: String,
      default: ''
    },
    genre: {
      type: [String],
      required: [true, 'At least one genre is required'],
      index: true
    },
    language: {
      type: [String],
      required: [true, 'At least one language is required'],
      index: true
    },
    duration: {
      type: Number, // in minutes
      required: [true, 'Duration in minutes is required']
    },
    releaseDate: {
      type: Date,
      default: Date.now
    },
    rating: {
      type: Number,
      default: 8.5,
      min: 0,
      max: 10
    },
    director: {
      type: String,
      default: ''
    },
    cast: {
      type: [String],
      default: []
    },
    certificate: {
      type: String,
      default: 'U/A' // U, U/A, A, PG-13, R
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true
    }
  },
  {
    timestamps: true
  }
);

// Indexing for high performance queries
movieSchema.index({ title: 1, genre: 1 });

module.exports = mongoose.model('Movie', movieSchema);
