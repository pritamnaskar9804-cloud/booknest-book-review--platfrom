/**
 * User Routes — BookNest
 * GET  /api/users/reading-list          — get reading list
 * POST /api/users/reading-list          — add to reading list
 * PUT  /api/users/reading-list/:bookId  — update status
 * DELETE /api/users/reading-list/:bookId — remove
 * POST /api/users/saved/:bookId         — toggle saved book
 * GET  /api/users/stats                 — user stats
 */

const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Review = require('../models/Review');
const { protect } = require('../middleware/auth');

// ── GET /api/users/stats ────────────────────────────────────
router.get('/stats', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const reviewCount = await Review.countDocuments({ user: req.user._id });

    res.json({
      success: true,
      stats: {
        reviews: reviewCount,
        saved: user.savedBooks.length,
        readingList: user.readingList.length,
        booksRead: user.readingList.filter((r) => r.status === 'read').length,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── GET /api/users/reading-list ─────────────────────────────
router.get('/reading-list', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate(
      'readingList.book',
      'title author coverImage averageRating totalReviews genre'
    );
    res.json({ success: true, data: user.readingList });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── POST /api/users/reading-list ────────────────────────────
router.post('/reading-list', protect, async (req, res) => {
  try {
    const { bookId, status = 'want-to-read' } = req.body;
    const user = await User.findById(req.user._id);

    const exists = user.readingList.find((r) => r.book.toString() === bookId);
    if (exists) {
      return res.status(400).json({ success: false, message: 'Book already in reading list' });
    }

    user.readingList.push({ book: bookId, status });
    await user.save();
    res.status(201).json({ success: true, message: 'Added to reading list' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── PUT /api/users/reading-list/:bookId ─────────────────────
router.put('/reading-list/:bookId', protect, async (req, res) => {
  try {
    const { status } = req.body;
    const user = await User.findById(req.user._id);

    const item = user.readingList.find((r) => r.book.toString() === req.params.bookId);
    if (!item) return res.status(404).json({ success: false, message: 'Book not in reading list' });

    item.status = status;
    await user.save();
    res.json({ success: true, message: 'Status updated' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── DELETE /api/users/reading-list/:bookId ──────────────────
router.delete('/reading-list/:bookId', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.readingList = user.readingList.filter(
      (r) => r.book.toString() !== req.params.bookId
    );
    await user.save();
    res.json({ success: true, message: 'Removed from reading list' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── POST /api/users/saved/:bookId (toggle) ──────────────────
router.post('/saved/:bookId', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const bookId = req.params.bookId;
    const idx = user.savedBooks.findIndex((id) => id.toString() === bookId);

    let saved;
    if (idx === -1) {
      user.savedBooks.push(bookId);
      saved = true;
    } else {
      user.savedBooks.splice(idx, 1);
      saved = false;
    }

    await user.save();
    res.json({ success: true, saved });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── GET /api/users/saved ────────────────────────────────────
router.get('/saved', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate(
      'savedBooks',
      'title author coverImage averageRating totalReviews genre'
    );
    res.json({ success: true, data: user.savedBooks });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
