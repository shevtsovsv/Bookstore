/**
 * Catalog page with filtering and pagination
 * Connects to the backend API for books, categories, and authors
 */
(function () {
  'use strict';

  // State management
  const state = {
    books: [],
    categories: [],
    currentPage: 1,
    itemsPerPage: 10,
    totalPages: 1,
    totalItems: 0,
    filters: {
      category: null,
      minPrice: null,
      maxPrice: null,
      authorType: null,
    },
  };

  // DOM elements
  const elements = {
    booksContainer: null,
    paginationContainer: null,
    itemsPerPageSelect: null,
    categoryFilter: null,
    priceFilter: null,
    authorTypeFilter: null,
    pageInfo: null,
    loading: null,
  };

  /**
   * Initialize the catalog page
   */
  async function init() {
    console.log('Initializing book catalog...');

    // Get DOM elements
    elements.booksContainer = document.getElementById('books-container');
    elements.paginationContainer = document.getElementById('pagination-controls');
    elements.itemsPerPageSelect = document.getElementById('items-per-page');
    elements.pageInfo = document.getElementById('page-info');
    elements.loading = document.getElementById('loading');

    // Load initial data
    await loadCategories();
    setupEventListeners();
    await loadBooks();
  }

  /**
   * Load categories from API
   */
  async function loadCategories() {
    try {
      const response = await fetch('/api/categories?limit=100');
      const data = await response.json();

      if (data.success && data.data.categories) {
        state.categories = data.data.categories;
        renderCategoryFilters();
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  }

  /**
   * Render category filter options
   */
  function renderCategoryFilters() {
    const container = document.getElementById('category-filters');
    if (!container) return;

    const html = `
      <label>
        <input type="radio" name="category" value="" checked>
        Все жанры
      </label>
      ${state.categories
        .map(
          (cat) => `
        <label>
          <input type="radio" name="category" value="${cat.id}">
          ${cat.name}
        </label>
      `
        )
        .join('')}
    `;

    container.innerHTML = html;

    // Add event listeners
    container.querySelectorAll('input[name="category"]').forEach((input) => {
      input.addEventListener('change', handleCategoryChange);
    });
  }

  /**
   * Setup event listeners
   */
  function setupEventListeners() {
    // Items per page selector
    if (elements.itemsPerPageSelect) {
      elements.itemsPerPageSelect.addEventListener('change', (e) => {
        state.itemsPerPage = parseInt(e.target.value);
        state.currentPage = 1;
        loadBooks();
      });
    }

    // Price filter
    const priceFilters = document.querySelectorAll('input[name="price"]');
    priceFilters.forEach((input) => {
      input.addEventListener('change', handlePriceChange);
    });

    // Author type filter
    const authorTypeFilters = document.querySelectorAll('input[name="authorType"]');
    authorTypeFilters.forEach((input) => {
      input.addEventListener('change', handleAuthorTypeChange);
    });
  }

  /**
   * Handle category filter change
   */
  function handleCategoryChange(e) {
    state.filters.category = e.target.value || null;
    state.currentPage = 1;
    loadBooks();
  }

  /**
   * Handle price filter change
   */
  function handlePriceChange(e) {
    const value = e.target.value;
    
    if (value === 'all') {
      state.filters.minPrice = null;
      state.filters.maxPrice = null;
    } else if (value === 'low') {
      state.filters.minPrice = 0;
      state.filters.maxPrice = 1000;
    } else if (value === 'medium') {
      state.filters.minPrice = 1000;
      state.filters.maxPrice = 2000;
    } else if (value === 'high') {
      state.filters.minPrice = 2000;
      state.filters.maxPrice = null;
    }

    state.currentPage = 1;
    loadBooks();
  }

  /**
   * Handle author type filter change
   */
  function handleAuthorTypeChange(e) {
    const value = e.target.value;
    state.filters.authorType = value === 'all' ? null : value;
    state.currentPage = 1;
    loadBooks();
  }

  /**
   * Load books from API
   */
  async function loadBooks() {
    try {
      showLoading();

      // Build query string
      const params = new URLSearchParams({
        page: state.currentPage,
        limit: state.itemsPerPage,
        sortBy: 'popularity',
        sortOrder: 'DESC',
      });

      if (state.filters.category) {
        params.append('category', state.filters.category);
      }
      if (state.filters.minPrice !== null) {
        params.append('minPrice', state.filters.minPrice);
      }
      if (state.filters.maxPrice !== null) {
        params.append('maxPrice', state.filters.maxPrice);
      }
      if (state.filters.authorType) {
        params.append('authorType', state.filters.authorType);
      }

      const response = await fetch(`/api/books?${params}`);
      const data = await response.json();

      if (data.success && data.data) {
        state.books = data.data.books;
        state.totalPages = data.data.pagination.totalPages;
        state.totalItems = data.data.pagination.totalItems;
        state.currentPage = data.data.pagination.currentPage;

        renderBooks();
        renderPagination();
        updatePageInfo();
      } else {
        showError('Не удалось загрузить книги');
      }
    } catch (error) {
      console.error('Error loading books:', error);
      showError('Ошибка при загрузке книг');
    } finally {
      hideLoading();
    }
  }

  /**
   * Render books in the catalog
   */
  function renderBooks() {
    if (!elements.booksContainer) return;

    if (state.books.length === 0) {
      elements.booksContainer.innerHTML = `
        <div class="no-results">
          <p>По заданным фильтрам книги не найдены</p>
        </div>
      `;
      return;
    }

    const html = state.books
      .map(
        (book) => `
      <div class="book-card">
        <img
          src="/img/${book.image || 'placeholder.jpg'}"
          alt="${book.title}"
          class="book-cover"
          loading="lazy"
          onerror="this.src='/img/placeholder.jpg'"
        />
        <div class="book-info">
          <h3>${book.title}</h3>
          <p><strong>Жанр:</strong> ${book.category?.name || 'Не указан'}</p>
          ${
            book.authors && book.authors.length > 0
              ? `<p><strong>Автор:</strong> ${book.authors.map((a) => a.name).join(', ')}</p>`
              : ''
          }
          <p><strong>Цена:</strong> ${book.price} руб.</p>
          <p class="book-description">${book.shortDescription || ''}</p>
          <div class="book-actions">
            <a href="/html/book-detail.html?id=${book.id}" class="btn btn-details">
              Подробнее
            </a>
            <button class="btn btn-order" onclick="orderBook(${book.id}, '${book.title}')">
              Заказать
            </button>
          </div>
        </div>
      </div>
    `
      )
      .join('');

    elements.booksContainer.innerHTML = html;
  }

  /**
   * Render pagination controls
   */
  function renderPagination() {
    if (!elements.paginationContainer) return;

    if (state.totalPages <= 1) {
      elements.paginationContainer.innerHTML = '';
      return;
    }

    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, state.currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(state.totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // Previous button
    pages.push(`
      <button 
        class="page-btn" 
        ${state.currentPage === 1 ? 'disabled' : ''}
        onclick="goToPage(${state.currentPage - 1})"
      >
        ← Назад
      </button>
    `);

    // First page
    if (startPage > 1) {
      pages.push(`
        <button class="page-btn" onclick="goToPage(1)">1</button>
      `);
      if (startPage > 2) {
        pages.push('<span class="page-ellipsis">...</span>');
      }
    }

    // Page numbers
    for (let i = startPage; i <= endPage; i++) {
      pages.push(`
        <button 
          class="page-btn ${i === state.currentPage ? 'active' : ''}" 
          onclick="goToPage(${i})"
        >
          ${i}
        </button>
      `);
    }

    // Last page
    if (endPage < state.totalPages) {
      if (endPage < state.totalPages - 1) {
        pages.push('<span class="page-ellipsis">...</span>');
      }
      pages.push(`
        <button class="page-btn" onclick="goToPage(${state.totalPages})">
          ${state.totalPages}
        </button>
      `);
    }

    // Next button
    pages.push(`
      <button 
        class="page-btn" 
        ${state.currentPage === state.totalPages ? 'disabled' : ''}
        onclick="goToPage(${state.currentPage + 1})"
      >
        Вперёд →
      </button>
    `);

    elements.paginationContainer.innerHTML = pages.join('');
  }

  /**
   * Update page info text
   */
  function updatePageInfo() {
    if (!elements.pageInfo) return;

    const start = (state.currentPage - 1) * state.itemsPerPage + 1;
    const end = Math.min(state.currentPage * state.itemsPerPage, state.totalItems);

    elements.pageInfo.textContent = `Показаны ${start}-${end} из ${state.totalItems} книг`;
  }

  /**
   * Go to specific page
   */
  window.goToPage = function (page) {
    if (page < 1 || page > state.totalPages || page === state.currentPage) {
      return;
    }
    state.currentPage = page;
    loadBooks();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  /**
   * Order book handler
   */
  window.orderBook = function (id, title) {
    alert(`Книга "${title}" добавлена в корзину! (Функция в разработке)`);
  };

  /**
   * Show loading indicator
   */
  function showLoading() {
    if (elements.loading) {
      elements.loading.style.display = 'block';
    }
    if (elements.booksContainer) {
      elements.booksContainer.style.opacity = '0.5';
    }
  }

  /**
   * Hide loading indicator
   */
  function hideLoading() {
    if (elements.loading) {
      elements.loading.style.display = 'none';
    }
    if (elements.booksContainer) {
      elements.booksContainer.style.opacity = '1';
    }
  }

  /**
   * Show error message
   */
  function showError(message) {
    if (elements.booksContainer) {
      elements.booksContainer.innerHTML = `
        <div class="error-message">
          <p>${message}</p>
          <button class="btn" onclick="location.reload()">Попробовать снова</button>
        </div>
      `;
    }
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
