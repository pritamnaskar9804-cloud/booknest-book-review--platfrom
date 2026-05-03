/**
 * Review Routes — BookNest
 * GET    /api/reviews/book/:bookId  — reviews for a book
 * POST   /api/reviews               — create review
 * PUT    /api/reviews/:id           — update review
 * DELETE /api/reviews/:id           — delete review
 * POST   /api/reviews/:id/like      — toggle like
 */

const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Review = require('../models/Review');
const { protect } = require('../middleware/auth');

// ── GET /api/reviews/book/:bookId ───────────────────────────
router.get('/book/:bookId', async (req, res) => {
  try {
    const reviews = await Review.find({ book: req.params.bookId })
      .populate('user', 'name avatar')
      .sort('-createdAt')
      .lean();

    res.json({ success: true, data: reviews, total: reviews.length });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── GET /api/reviews/user/:userId ───────────────────────────
router.get('/user/:userId', async (req, res) => {
  try {
    const reviews = await Review.find({ user: req.params.userId })
      .populate('book', 'title author coverImage averageRating')
      .sort('-createdAt')
      .lean();

    res.json({ success: true, data: reviews, total: reviews.length });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── POST /api/reviews ───────────────────────────────────────
router.post(
  '/',
  protect,
  [
    body('book').notEmpty().withMessage('Book ID is required'),
    body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be 1–5'),
    body('body').isLength({ min: 10 }).withMessage('Review must be at least 10 characters'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
      const existing = await Review.findOne({ book: req.body.book, user: req.user._id });
      if (existing) {
        return res.status(400).json({
          success: false,
          message: 'You have already reviewed this book.',
        });
      }

      const review = await Review.create({ ...req.body, user: req.user._id });
      await review.populate('user', 'name avatar');

      res.status(201).json({ success: true, data: review });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  }
);

// ── PUT /api/reviews/:id ────────────────────────────────────
router.put('/:id', protect, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ success: false, message: 'Review not found' });

    if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const { rating, title, body } = req.body;
    if (rating) review.rating = rating;
    if (title !== undefined) review.title = title;
    if (body) review.body = body;

    await review.save();
    await review.populate('user', 'name avatar');

    res.json({ success: true, data: review });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// ── DELETE /api/reviews/:id ─────────────────────────────────
router.delete('/:id', protect, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ success: false, message: 'Review not found' });

    if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await Review.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Review deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── POST /api/reviews/:id/like ──────────────────────────────
router.post('/:id/like', protect, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ success: false, message: 'Review not found' });

    const userId = req.user._id.toString();
    const likeIndex = review.likes.findIndex((id) => id.toString() === userId);

    if (likeIndex === -1) {
      review.likes.push(req.user._id);
    } else {
      review.likes.splice(likeIndex, 1);
    }

    await review.save();
    res.json({ success: true, likes: review.likes.length, liked: likeIndex === -1 });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
