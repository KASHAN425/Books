const { readBooks, writeBooks } = require('./lib/blob-store');
const defaultBooks = require('../data/default-books.json');

module.exports = async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'no-store');

  try {
    if (req.method === 'GET') {
      const books = await readBooks(defaultBooks);
      return res.status(200).end(JSON.stringify({ books }));
    }

    if (req.method === 'POST') {
      const books = Array.isArray(req.body?.books) ? req.body.books : null;
      if (!books) {
        return res.status(400).end(JSON.stringify({ error: 'Expected payload: { books: [...] }' }));
      }

      const savedBooks = await writeBooks(books);
      return res.status(200).end(JSON.stringify({ books: savedBooks }));
    }

    return res.status(405).end(JSON.stringify({ error: 'Method not allowed' }));
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).end(JSON.stringify({ error: error.message || 'Unexpected server error' }));
  }
};
