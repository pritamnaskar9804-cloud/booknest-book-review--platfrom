/**
 * Book Model — BookNest
 * Rehan'Z Digital Network
 */

const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    author: {
      type: String,
      required: [true, 'Author is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    genre: [
      {
        type: String,
        trim: true,
      },
    ],
    coverImage: {
      type: String,
      default: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&q=80',
    },
    isbn: {
      type: String,
      trim: true,
      default: '',
    },
    publishedYear: {
      type: Number,
      min: [1000, 'Invalid year'],
      max: [new Date().getFullYear(), 'Year cannot be in the future'],
    },
    pages: {
      type: Number,
      min: [1, 'Pages must be positive'],
    },
    language: {
      type: String,
      default: 'English',
    },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    // ── Denormalized rating cache (updated on review create/delete) ──
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    totalReviews: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ── Indexes for search & filter ─────────────────────────────
bookSchema.index({ title: 'text', author: 'text', description: 'text' });
bookSchema.index({ genre: 1 });
bookSchema.index({ averageRating: -1 });
bookSchema.index({ publishedYear: -1 });

module.exports = mongoose.model('Book', bookSchema);
