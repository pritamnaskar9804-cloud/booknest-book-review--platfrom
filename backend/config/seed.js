/**
 * BookNest — Database Seed Script
 * Run: node config/seed.js
 * Rehan'Z Digital Network
 */

require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const Book = require('../models/Book');
const connectDB = require('./db');

const books = [
  {
    title: 'The Pragmatic Programmer',
    author: 'David Thomas & Andrew Hunt',
    description: 'Your journey to mastery. This book helps you become a better programmer through a collection of tips and techniques that address the full breadth of software development.',
    genre: ['Technology', 'Programming'],
    coverImage: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&q=80',
    isbn: '978-0201616224',
    publishedYear: 1999,
    pages: 352,
    language: 'English',
  },
  {
    title: 'Atomic Habits',
    author: 'James Clear',
    description: 'An Easy & Proven Way to Build Good Habits & Break Bad Ones. Tiny Changes, Remarkable Results.',
    genre: ['Self-Help', 'Psychology'],
    coverImage: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&q=80',
    isbn: '978-0735211292',
    publishedYear: 2018,
    pages: 320,
    language: 'English',
  },
  {
    title: 'Dune',
    author: 'Frank Herbert',
    description: 'Set in the distant future amidst a feudal interstellar society, Dune tells the story of young Paul Atreides on the desert planet Arrakis.',
    genre: ['Science Fiction', 'Fantasy'],
    coverImage: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=400&q=80',
    isbn: '978-0441013593',
    publishedYear: 1965,
    pages: 896,
    language: 'English',
  },
  {
    title: 'Clean Code',
    author: 'Robert C. Martin',
    description: 'A Handbook of Agile Software Craftsmanship. Even bad code can function, but if code isn\'t clean, it can bring a development organization to its knees.',
    genre: ['Technology', 'Programming'],
    coverImage: 'https://images.unsplash.com/photo-1587620962725-abab7fe55159?w=400&q=80',
    isbn: '978-0132350884',
    publishedYear: 2008,
    pages: 431,
    language: 'English',
  },
  {
    title: 'The Great Gatsby',
    author: 'F. Scott Fitzgerald',
    description: 'A story of the fabulously wealthy Jay Gatsby and his love for Daisy Buchanan, set during the Roaring Twenties.',
    genre: ['Fiction', 'Classic'],
    coverImage: 'https://images.unsplash.com/photo-1476275466078-4007374efbbe?w=400&q=80',
    isbn: '978-0743273565',
    publishedYear: 1925,
    pages: 180,
    language: 'English',
  },
  {
    title: 'Sapiens',
    author: 'Yuval Noah Harari',
    description: 'A Brief History of Humankind. How did our species succeed in the battle for dominance? Why did our foraging ancestors come together to create cities and kingdoms?',
    genre: ['History', 'Non-Fiction'],
    coverImage: 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=400&q=80',
    isbn: '978-0062316097',
    publishedYear: 2011,
    pages: 443,
    language: 'English',
  },
  {
    title: 'Deep Work',
    author: 'Cal Newport',
    description: 'Rules for Focused Success in a Distracted World. The ability to perform deep work is becoming increasingly rare at exactly the same time it is becoming increasingly valuable.',
    genre: ['Self-Help', 'Productivity'],
    coverImage: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=400&q=80',
    isbn: '978-1455586691',
    publishedYear: 2016,
    pages: 296,
    language: 'English',
  },
  {
    title: '1984',
    author: 'George Orwell',
    description: 'A dystopian novel set in a totalitarian society where Big Brother watches every move and the Thought Police can read minds.',
    genre: ['Fiction', 'Dystopian', 'Classic'],
    coverImage: 'https://images.unsplash.com/photo-1495640388908-05fa85288e61?w=400&q=80',
    isbn: '978-0451524935',
    publishedYear: 1949,
    pages: 328,
    language: 'English',
  },
  {
    title: 'Zero to One',
    author: 'Peter Thiel',
    description: 'Notes on Startups, or How to Build the Future. Every moment in business happens only once. The next Bill Gates will not build an operating system.',
    genre: ['Business', 'Entrepreneurship'],
    coverImage: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=400&q=80',
    isbn: '978-0804139021',
    publishedYear: 2014,
    pages: 224,
    language: 'English',
  },
  {
    title: 'The Alchemist',
    author: 'Paulo Coelho',
    description: 'A magical story about Santiago, an Andalusian shepherd boy, who yearns to travel in search of a worldly treasure as extraordinary as any ever found.',
    genre: ['Fiction', 'Philosophy'],
    coverImage: 'https://images.unsplash.com/photo-1509266272358-7701da638078?w=400&q=80',
    isbn: '978-0062315007',
    publishedYear: 1988,
    pages: 197,
    language: 'English',
  },
  {
    title: 'Thinking, Fast and Slow',
    author: 'Daniel Kahneman',
    description: 'In this bold and sweeping work, Kahneman takes us on a groundbreaking tour of the mind and explains the two systems that drive the way we think.',
    genre: ['Psychology', 'Non-Fiction'],
    coverImage: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&q=80',
    isbn: '978-0374533557',
    publishedYear: 2011,
    pages: 499,
    language: 'English',
  },
  {
    title: 'The Lean Startup',
    author: 'Eric Ries',
    description: 'How Today\'s Entrepreneurs Use Continuous Innovation to Create Radically Successful Businesses. A guide to building startups using lean principles.',
    genre: ['Business', 'Entrepreneurship'],
    coverImage: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&q=80',
    isbn: '978-0307887894',
    publishedYear: 2011,
    pages: 336,
    language: 'English',
  },
];

const seed = async () => {
  await connectDB();
  try {
    await Book.deleteMany({});
    const created = await Book.insertMany(books);
    console.log(`✅ Seeded ${created.length} books successfully!`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed error:', err);
    process.exit(1);
  }
};

seed();
