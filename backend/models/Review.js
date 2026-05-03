/**
 * Review Model — BookNest
 * Rehan'Z Digital Network
 */

const mongoose = require('mongoose');
const Book = require('./Book');

const reviewSchema = new mongoose.Schema(
  {
    book: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Book',
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5'],
    },
    title: {
      type: String,
      trim: true,
      maxlength: [150, 'Review title cannot exceed 150 characters'],
      default: '',
    },
    body: {
      type: String,
      required: [true, 'Review body is required'],
      minlength: [10, 'Review must be at least 10 characters'],
      maxlength: [2000, 'Review cannot exceed 2000 characters'],
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ── One review per user per book ────────────────────────────
reviewSchema.index({ book: 1, user: 1 }, { unique: true });

// ── Virtuals ────────────────────────────────────────────────
reviewSchema.virtual('likeCount').get(function () {
  return this.likes.length;
});

// ── Static: recalculate book's averageRating ────────────────
reviewSchema.statics.calcAverageRating = async function (bookId) {
  const stats = await this.aggregate([
    { $match: { book: bookId } },
    {
      $group: {
        _id: '$book',
        avgRating: { $avg: '$rating' },
        count: { $sum: 1 },
      },
    },
  ]);

  if (stats.length > 0) {
    await Book.findByIdAndUpdate(bookId, {
      averageRating: Math.round(stats[0].avgRating * 10) / 10,
      totalReviews: stats[0].count,
    });
  } else {
    await Book.findByIdAndUpdate(bookId, {
      averageRating: 0,
      totalReviews: 0,
    });
  }
};

// ── Post-save hook: recalculate ─────────────────────────────
reviewSchema.post('save', function () {
  this.constructor.calcAverageRating(this.book);
});

// ── Post-remove hook: recalculate ──────────────────────────
reviewSchema.post('findOneAndDelete', function (doc) {
  if (doc) doc.constructor.calcAverageRating(doc.book);
});

module.exports = mongoose.model('Review', reviewSchema);
