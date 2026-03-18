const { put, list } = require('@vercel/blob');

const DATA_PATH = 'data/books.json';
const TOKEN = process.env.BLOB_READ_WRITE_TOKEN || process.env.SHAH_WRITES_BLOB_READ_WRITE_TOKEN;

function ensureToken() {
  if (!TOKEN) {
    const error = new Error('Missing Vercel Blob token. Add BLOB_READ_WRITE_TOKEN in Vercel project settings.');
    error.statusCode = 500;
    throw error;
  }
}

async function getBooksBlob() {
  ensureToken();
  const { blobs } = await list({
    prefix: DATA_PATH,
    limit: 1,
    token: TOKEN,
  });

  return blobs.find((blob) => blob.pathname === DATA_PATH) || null;
}

async function readBooks(defaultBooks) {
  const blob = await getBooksBlob();

  if (!blob) {
    return writeBooks(defaultBooks);
  }

  const response = await fetch(blob.url, { cache: 'no-store' });
  if (!response.ok) {
    throw new Error('Unable to download books data from Vercel Blob.');
  }

  return response.json();
}

async function writeBooks(books) {
  ensureToken();
  await put(DATA_PATH, JSON.stringify(books, null, 2), {
    access: 'public',
    addRandomSuffix: false,
    contentType: 'application/json',
    token: TOKEN,
  });

  return books;
}

module.exports = {
  readBooks,
  writeBooks,
};
