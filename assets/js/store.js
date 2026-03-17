(function () {
  const KEY = 'shah_writes_books';

  function getBooks() {
    const stored = localStorage.getItem(KEY);
    if (!stored) {
      localStorage.setItem(KEY, JSON.stringify(window.defaultBooks));
      return window.defaultBooks;
    }
    return JSON.parse(stored);
  }

  function renderBooks() {
    const search = $('#searchInput').val().toLowerCase().trim();
    const selectedCategory = $('#categoryFilter').val();

    const filtered = getBooks().filter((b) => {
      const passVisibility = !b.hidden;
      const passSearch = b.title.toLowerCase().includes(search) || b.author.toLowerCase().includes(search);
      const passCategory = selectedCategory === 'all' || b.category === selectedCategory;
      return passVisibility && passSearch && passCategory;
    });

    const html = filtered.length
      ? filtered.map((book) => `
        <div class="col-md-6 col-xl-4">
          <div class="book-card h-100 shadow-sm">
            <img src="${book.cover}" class="w-100 book-cover" alt="${book.title}">
            <div class="p-3 d-flex flex-column">
              <h5 class="mb-1">${book.title}</h5>
              <small class="text-muted mb-2">${book.author} • ${book.category}</small>
              <p class="small text-muted flex-grow-1">${book.description}</p>
              <div class="d-flex justify-content-between align-items-center">
                <span class="price-tag">$${book.price}</span>
                <span>⭐ ${book.rating}/5</span>
              </div>
              <div class="d-grid mt-3 gap-2">
                <button class="btn btn-brand buy-btn" data-id="${book.id}">Buy & Download</button>
                <a class="btn btn-outline-secondary" href="${book.pdf}" target="_blank">Preview PDF</a>
              </div>
            </div>
          </div>
        </div>
      `).join('')
      : '<p class="text-muted">No books match your filters.</p>';

    $('#bookGrid').html(html);
  }

  function renderCategories() {
    const categories = [...new Set(getBooks().map((b) => b.category))];
    const options = ['<option value="all">All Categories</option>']
      .concat(categories.map((c) => `<option value="${c}">${c}</option>`))
      .join('');
    $('#categoryFilter').html(options);
  }

  $(document).ready(function () {
    $('#year').text(new Date().getFullYear());
    renderCategories();
    renderBooks();

    $('#searchInput, #categoryFilter').on('input change', renderBooks);

    $(document).on('click', '.buy-btn', function () {
      const id = $(this).data('id');
      const book = getBooks().find((b) => b.id === id);
      $('#checkoutContent').html(`
        <p>Thank you for purchasing <strong>${book.title}</strong>.</p>
        <p>Total paid: <strong>$${book.price}</strong></p>
        <p><a href="${book.pdf}" target="_blank" class="btn btn-sm btn-brand">Download eBook PDF</a></p>
      `);
      new bootstrap.Modal('#checkoutModal').show();
    });
  });
})();
