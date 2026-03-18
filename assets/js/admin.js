(function () {
  const AUTH_KEY = 'shah_writes_admin_auth';
  const ADMIN_USER = 'kashanabbasi';
  const ADMIN_PASS = 'kashanabbabb';
  let books = [];

  function setStatus(message, variant) {
    const $status = $('#adminStatus');
    if (!message) {
      $status.addClass('d-none').removeClass('alert-danger alert-success alert-warning alert-info').html('');
      return;
    }

    $status
      .removeClass('d-none alert-danger alert-success alert-warning alert-info')
      .addClass(`alert-${variant || 'light'}`)
      .html(message);
  }

  function resetForm() {
    $('#bookForm')[0].reset();
    $('#bookId').val('');
    $('#formTitle').text('Add New Book');
    $('#cancelEdit').addClass('d-none');
  }

  function renderTable() {
    const rows = books.map((book) => `
      <tr>
        <td>
          <strong>${book.title}</strong><br>
          <small class="text-muted">${book.author}</small>
        </td>
        <td>${book.category}</td>
        <td>$${book.price}</td>
        <td>${book.hidden ? '<span class="badge text-bg-secondary">Hidden</span>' : '<span class="badge text-bg-success">Visible</span>'}</td>
        <td>
          <div class="d-flex flex-wrap gap-1">
            <button class="btn btn-sm btn-outline-primary edit-btn" data-id="${book.id}">Edit</button>
            <button class="btn btn-sm btn-outline-warning toggle-btn" data-id="${book.id}">${book.hidden ? 'Show' : 'Hide'}</button>
            <button class="btn btn-sm btn-outline-danger delete-btn" data-id="${book.id}">Remove</button>
          </div>
        </td>
      </tr>
    `).join('');

    $('#adminBookTable').html(rows || '<tr><td colspan="5" class="text-muted">No books found.</td></tr>');
  }

  async function loadBooks() {
    try {
      books = await window.bookApi.getBooks();
      setStatus('Connected to Vercel Blob. Book data is loading from <code>data/books.json</code>.', 'info');
      renderTable();
    } catch (error) {
      books = [...window.defaultBooks];
      setStatus(`${error.message}<br>Using fallback demo data until Blob is configured in Vercel.`, 'warning');
      renderTable();
    }
  }

  async function persistBooks() {
    books = await window.bookApi.saveBooks(books);
    renderTable();
  }

  function showDashboard() {
    $('#adminLoginWrap').addClass('d-none');
    $('#adminDashboard').removeClass('d-none');
    loadBooks();
  }

  function showLogin() {
    $('#adminDashboard').addClass('d-none');
    $('#adminLoginWrap').removeClass('d-none');
  }

  function isAuthenticated() {
    return sessionStorage.getItem(AUTH_KEY) === '1';
  }

  $(document).ready(function () {
    if (isAuthenticated()) {
      showDashboard();
    } else {
      showLogin();
    }

    $('#adminLoginForm').on('submit', function (event) {
      event.preventDefault();
      const username = $('#adminUsername').val().trim();
      const password = $('#adminPassword').val();

      if (username === ADMIN_USER && password === ADMIN_PASS) {
        sessionStorage.setItem(AUTH_KEY, '1');
        $('#loginError').addClass('d-none');
        $('#adminLoginForm')[0].reset();
        showDashboard();
        return;
      }

      $('#loginError').removeClass('d-none');
    });

    $('#logoutBtn').on('click', function () {
      sessionStorage.removeItem(AUTH_KEY);
      showLogin();
    });

    $('#bookForm').on('submit', async function (event) {
      event.preventDefault();
      const payload = {
        id: $('#bookId').val() || `book-${crypto.randomUUID()}`,
        title: $('#title').val().trim(),
        author: $('#author').val().trim(),
        price: Number($('#price').val()),
        rating: Number($('#rating').val()),
        category: $('#category').val().trim(),
        cover: $('#cover').val().trim(),
        pdf: $('#pdf').val().trim(),
        description: $('#description').val().trim(),
        hidden: false,
      };

      const index = books.findIndex((book) => book.id === payload.id);
      if (index > -1) {
        payload.hidden = books[index].hidden;
        books[index] = payload;
      } else {
        books.push(payload);
      }

      try {
        await persistBooks();
        setStatus('Book data saved to Vercel Blob successfully.', 'success');
        resetForm();
      } catch (error) {
        setStatus(error.message, 'danger');
      }
    });

    $(document).on('click', '.edit-btn', function () {
      const book = books.find((item) => item.id === $(this).data('id'));
      if (!book) {
        setStatus('Unable to load book for editing.', 'danger');
        return;
      }

      $('#formTitle').text('Edit Book');
      $('#cancelEdit').removeClass('d-none');
      Object.entries(book).forEach(([key, value]) => {
        if ($('#' + key).length) {
          $('#' + key).val(value);
        }
      });
    });

    $(document).on('click', '.toggle-btn', async function () {
      const id = $(this).data('id');
      books = books.map((book) => book.id === id ? { ...book, hidden: !book.hidden } : book);

      try {
        await persistBooks();
        setStatus('Visibility updated in Vercel Blob.', 'success');
      } catch (error) {
        setStatus(error.message, 'danger');
      }
    });

    $(document).on('click', '.delete-btn', async function () {
      const id = $(this).data('id');
      books = books.filter((book) => book.id !== id);

      try {
        await persistBooks();
        setStatus('Book removed from Vercel Blob.', 'success');
      } catch (error) {
        setStatus(error.message, 'danger');
      }
    });

    $('#cancelEdit').on('click', function () {
      resetForm();
      setStatus('', 'light');
    });
  });
})();
