(function () {
  let books = [];

  function setStatus(message, variant) {
    const $status = $('#storeStatus');
    if (!message) {
      $status.addClass('d-none').removeClass('alert-danger alert-success alert-warning').text('');
      return;
    }

    $status
      .removeClass('d-none alert-danger alert-success alert-warning')
      .addClass(`alert-${variant || 'light'}`)
      .text(message);
  }

  function getFilteredBooks() {
    const search = $('#searchInput').val().toLowerCase().trim();
    const selectedCategory = $('#categoryFilter').val();

    return books.filter((book) => {
      const passVisibility = !book.hidden;
      const passSearch = book.title.toLowerCase().includes(search) || book.author.toLowerCase().includes(search);
      const passCategory = selectedCategory === 'all' || book.category === selectedCategory;
      return passVisibility && passSearch && passCategory;
    });
  }

  function renderBooks() {
    const filtered = getFilteredBooks();

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
                <a class="btn btn-outline-secondary" href="${book.pdf}" target="_blank" rel="noreferrer">Preview PDF</a>
              </div>
            </div>
          </div>
        </div>
      `).join('')
      : '<p class="text-muted">No books match your filters.</p>';

    $('#bookGrid').html(html);
  }

  function renderCategories() {
    const categories = [...new Set(books.map((book) => book.category))];
    const options = ['<option value="all">All Categories</option>']
      .concat(categories.map((category) => `<option value="${category}">${category}</option>`))
      .join('');
    $('#categoryFilter').html(options);
  }

  async function loadBooks() {
    try {
      books = await window.bookApi.getBooks();
      setStatus('Books are loading from Vercel Blob storage.', 'success');
      renderCategories();
      renderBooks();
    } catch (error) {
      books = window.defaultBooks;
      setStatus(`${error.message} Showing fallback demo books.`, 'warning');
      renderCategories();
      renderBooks();
    }
  }

  $(document).ready(function () {
    $('#year').text(new Date().getFullYear());
    loadBooks();

    $('#searchInput, #categoryFilter').on('input change', renderBooks);

    $(document).on('click', '.buy-btn', function () {
      const id = $(this).data('id');
      const book = books.find((item) => item.id === id);
      if (!book) {
        setStatus('Book details could not be loaded.', 'danger');
        return;
      }

      $('#checkoutContent').html(`
        <p>Thank you for purchasing <strong>${book.title}</strong>.</p>
        <p>Total paid: <strong>$${book.price}</strong></p>
        <p><a href="${book.pdf}" target="_blank" rel="noreferrer" class="btn btn-sm btn-brand">Download eBook PDF</a></p>
      `);
      new bootstrap.Modal('#checkoutModal').show();
    });
  });
})();
