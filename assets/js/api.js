window.bookApi = (function () {
  async function request(url, options) {
    const response = await fetch(url, options);
    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(payload.error || 'Request failed.');
    }

    return payload;
  }

  async function getBooks() {
    const payload = await request('/api/books');
    return payload.books || [];
  }

  async function saveBooks(books) {
    const payload = await request('/api/books', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ books }),
    });

    return payload.books || [];
  }

  return {
    getBooks,
    saveBooks,
  };
})();
