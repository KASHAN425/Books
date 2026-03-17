(function () {
  const KEY = 'shah_writes_books';
  const AUTH_KEY = 'shah_writes_admin_auth';
  const ADMIN_USER = 'kashanabbasi';
  const ADMIN_PASS = 'kashanabbabb';

  function getBooks() {
    const stored = localStorage.getItem(KEY);
    if (!stored) {
      localStorage.setItem(KEY, JSON.stringify(window.defaultBooks));
      return window.defaultBooks;
    }
    return JSON.parse(stored);
  }

  function saveBooks(books) {
    localStorage.setItem(KEY, JSON.stringify(books));
  }

  function resetForm() {
    $('#bookForm')[0].reset();
    $('#bookId').val('');
    $('#formTitle').text('Add New Book');
    $('#cancelEdit').addClass('d-none');
  }

  function renderTable() {
    const books = getBooks();
    const rows = books.map((b) => `
      <tr>
        <td>
          <strong>${b.title}</strong><br>
          <small class="text-muted">${b.author}</small>
        </td>
        <td>${b.category}</td>
        <td>$${b.price}</td>
        <td>${b.hidden ? '<span class="badge text-bg-secondary">Hidden</span>' : '<span class="badge text-bg-success">Visible</span>'}</td>
        <td>
          <div class="d-flex flex-wrap gap-1">
            <button class="btn btn-sm btn-outline-primary edit-btn" data-id="${b.id}">Edit</button>
            <button class="btn btn-sm btn-outline-warning toggle-btn" data-id="${b.id}">${b.hidden ? 'Show' : 'Hide'}</button>
            <button class="btn btn-sm btn-outline-danger delete-btn" data-id="${b.id}">Remove</button>
          </div>
        </td>
      </tr>
    `).join('');

    $('#adminBookTable').html(rows || '<tr><td colspan="5" class="text-muted">No books found.</td></tr>');
  }

  function showDashboard() {
    $('#adminLoginWrap').addClass('d-none');
    $('#adminDashboard').removeClass('d-none');
    renderTable();
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

    $('#adminLoginForm').on('submit', function (e) {
      e.preventDefault();
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

    $('#bookForm').on('submit', function (e) {
      e.preventDefault();
      const books = getBooks();
      const payload = {
        id: $('#bookId').val() || crypto.randomUUID(),
        title: $('#title').val().trim(),
        author: $('#author').val().trim(),
        price: Number($('#price').val()),
        rating: Number($('#rating').val()),
        category: $('#category').val().trim(),
        cover: $('#cover').val().trim(),
        pdf: $('#pdf').val().trim(),
        description: $('#description').val().trim(),
        hidden: false
      };

      const idx = books.findIndex((b) => b.id === payload.id);
      if (idx > -1) {
        payload.hidden = books[idx].hidden;
        books[idx] = payload;
      } else {
        books.push(payload);
      }

      saveBooks(books);
      renderTable();
      resetForm();
    });

    $(document).on('click', '.edit-btn', function () {
      const book = getBooks().find((b) => b.id === $(this).data('id'));
      if (!book) return;
      $('#formTitle').text('Edit Book');
      $('#cancelEdit').removeClass('d-none');
      Object.entries(book).forEach(([k, v]) => {
        if ($('#' + k).length) $('#' + k).val(v);
      });
    });

    $(document).on('click', '.toggle-btn', function () {
      const id = $(this).data('id');
      const books = getBooks().map((b) => b.id === id ? { ...b, hidden: !b.hidden } : b);
      saveBooks(books);
      renderTable();
    });

    $(document).on('click', '.delete-btn', function () {
      const id = $(this).data('id');
      const books = getBooks().filter((b) => b.id !== id);
      saveBooks(books);
      renderTable();
    });

    $('#cancelEdit').on('click', resetForm);
  });
})();
