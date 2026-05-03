/**
 * Book Routes — BookNest
 * GET    /api/books          — list/search/filter books
 * POST   /api/books          — add book (admin)
 * GET    /api/books/:id      — single book
 * PUT    /api/books/:id      — update book (admin)
 * DELETE /api/books/:id      — delete book (admin)
 * GET    /api/books/genres   — all genres
 */

const express = require('express');
const router = express.Router();
const Book = require('../models/Book');
const Review = require('../models/Review');
const { protect, adminOnly, optionalAuth } = require('../middleware/auth');

// ── GET /api/books/genres ───────────────────────────────────
router.get('/genres', async (req, res) => {
  try {
    const genres = await Book.distinct('genre');
    res.json({ success: true, genres: genres.sort() });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── GET /api/books ──────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const {
      search,
      genre,
      sort = '-createdAt',
      page = 1,
      limit = 12,
    } = req.query;

    const query = {};

    // Full-text search
    if (search) {
      query.$text = { $search: search };
    }

    // Genre filter
    if (genre && genre !== 'All') {
      query.genre = genre;
    }

    const pageNum  = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, parseInt(limit));
    const skip     = (pageNum - 1) * limitNum;

    // Valid sort options
    const sortOptions = {
      '-createdAt': { createdAt: -1 },
      createdAt: { createdAt: 1 },
      '-averageRating': { averageRating: -1 },
      '-totalReviews': { totalReviews: -1 },
      title: { title: 1 },
    };
    const sortObj = sortOptions[sort] || { createdAt: -1 };

    const [books, total] = await Promise.all([
      Book.find(query).sort(sortObj).skip(skip).limit(limitNum).lean(),
      Book.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: books,
      pagination: {
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum),
        limit: limitNum,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── GET /api/books/:id ──────────────────────────────────────
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const book = await Book.findById(req.params.id).lean();
    if (!book) return res.status(404).json({ success: false, message: 'Book not found' });

    // Fetch reviews with user info
    const reviews = await Review.find({ book: req.params.id })
      .populate('user', 'name avatar')
      .sort('-createdAt')
      .lean();

    res.json({ success: true, data: { ...book, reviews } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── POST /api/books (admin) ─────────────────────────────────
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const book = await Book.create({ ...req.body, addedBy: req.user._id });
    res.status(201).json({ success: true, data: book });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// ── PUT /api/books/:id (admin) ──────────────────────────────
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const book = await Book.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!book) return res.status(404).json({ success: false, message: 'Book not found' });
    res.json({ success: true, data: book });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// ── DELETE /api/books/:id (admin) ──────────────────────────
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const book = await Book.findByIdAndDelete(req.params.id);
    if (!book) return res.status(404).json({ success: false, message: 'Book not found' });
    await Review.deleteMany({ book: req.params.id });
    res.json({ success: true, message: 'Book deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
