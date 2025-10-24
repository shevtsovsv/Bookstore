# Руководство по созданию детальной страницы книги

## 📋 Обзор

Детальная страница книги предоставляет полную информацию о выбранной книге с возможностью добавления в корзину и просмотра информации об издательстве в модальном окне.

## 🎯 Основные функции

### 1. Отображение детальной информации
- **Изображение книги** с высоким качеством
- **Полная информация**: заголовок, авторы, категория, издательство, количество страниц, год издания, ISBN
- **Цена** с форматированием
- **Описание** книги
- **Хлебные крошки** для навигации

### 2. Интерактивность
- **Кликабельное издательство** - открывает модальное окно с подробной информацией
- **Кнопка добавления в корзину** с проверкой авторизации
- **Система уведомлений** для обратной связи с пользователем
- **Адаптивный дизайн** для всех устройств

### 3. Модальное окно издательства
- **Полная информация** об издательстве
- **Контактные данные** с активными ссылками
- **Плавная анимация** открытия/закрытия

## 🏗️ Структура HTML

### Основная разметка

```html
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Детали книги - Книжный магазин</title>
    <link rel="stylesheet" href="../style/style.css">
</head>
<body>
    <header>
        <!-- Навигация -->
    </header>
    
    <main>
        <!-- Хлебные крошки -->
        <nav class="breadcrumb">
            <a href="../index.html">Главная</a> &gt; 
            <a href="book.html">Каталог</a> &gt; 
            <span id="breadcrumb-book">Книга</span>
        </nav>
        
        <!-- Детальная информация о книге -->
        <div class="book-detail">
            <div class="book-detail-image">
                <img id="book-image" src="../img/book-placeholder.jpg" alt="Обложка книги">
            </div>
            
            <div class="book-detail-info">
                <h1 id="book-title">Загрузка...</h1>
                
                <div class="book-meta">
                    <div class="book-meta-item">
                        <span class="book-meta-label">Авторы:</span>
                        <span class="book-meta-value" id="book-authors">-</span>
                    </div>
                    <div class="book-meta-item">
                        <span class="book-meta-label">Категория:</span>
                        <span class="book-meta-value" id="book-category">-</span>
                    </div>
                    <div class="book-meta-item">
                        <span class="book-meta-label">Издательство:</span>
                        <span class="book-meta-value" id="book-publisher">-</span>
                    </div>
                    <div class="book-meta-item">
                        <span class="book-meta-label">Страниц:</span>
                        <span class="book-meta-value" id="book-pages">-</span>
                    </div>
                    <div class="book-meta-item">
                        <span class="book-meta-label">Год издания:</span>
                        <span class="book-meta-value" id="book-year">-</span>
                    </div>
                    <div class="book-meta-item">
                        <span class="book-meta-label">ISBN:</span>
                        <span class="book-meta-value" id="book-isbn">-</span>
                    </div>
                </div>
                
                <div class="book-price" id="book-price">-</div>
                
                <div class="book-description">
                    <h3>Описание</h3>
                    <p id="book-description">-</p>
                </div>
                
                <div class="book-actions">
                    <button id="add-to-cart-btn" class="btn-add-to-cart">
                        Добавить в корзину
                    </button>
                    <a href="book.html" class="btn-secondary">
                        Вернуться к каталогу
                    </a>
                </div>
            </div>
        </div>
    </main>
    
    <!-- Модальное окно издательства -->
    <div id="publisher-modal" class="modal">
        <div class="modal-content">
            <div class="modal-header">
                <h2>Информация об издательстве</h2>
                <span class="modal-close">&times;</span>
            </div>
            <div class="modal-body">
                <div class="publisher-info">
                    <div class="publisher-info-item">
                        <span class="publisher-info-label">Название:</span>
                        <span class="publisher-info-value" id="publisher-name">-</span>
                    </div>
                    <div class="publisher-info-item">
                        <span class="publisher-info-label">Описание:</span>
                        <span class="publisher-info-value" id="publisher-description">-</span>
                    </div>
                    <div class="publisher-info-item">
                        <span class="publisher-info-label">Страна:</span>
                        <span class="publisher-info-value" id="publisher-country">-</span>
                    </div>
                    <div class="publisher-info-item">
                        <span class="publisher-info-label">Год основания:</span>
                        <span class="publisher-info-value" id="publisher-founded">-</span>
                    </div>
                    <div class="publisher-info-item">
                        <span class="publisher-info-label">Веб-сайт:</span>
                        <span class="publisher-info-value" id="publisher-website">-</span>
                    </div>
                    <div class="publisher-info-item">
                        <span class="publisher-info-label">Email:</span>
                        <span class="publisher-info-value" id="publisher-email">-</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
    
    <!-- Контейнер для уведомлений -->
    <div id="notification-container"></div>
    
    <script src="../scripts/book-details.js"></script>
</body>
</html>
```

## 🎨 CSS стили

### Основные стили страницы

```css
/* Хлебные крошки */
.breadcrumb {
  margin-bottom: 20px;
  font-size: 14px;
  color: #666;
}

.breadcrumb a {
  color: #27ae60;
  text-decoration: none;
}

.breadcrumb a:hover {
  text-decoration: underline;
}

/* Основной контейнер книги */
.book-detail {
  display: grid;
  grid-template-columns: 400px 1fr;
  gap: 40px;
  background: white;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 30px;
}

/* Изображение книги */
.book-detail-image {
  text-align: center;
}

.book-detail-image img {
  width: 100%;
  max-width: 400px;
  height: auto;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* Информация о книге */
.book-detail-info h1 {
  margin-top: 0;
  margin-bottom: 20px;
  color: #333;
  font-size: 28px;
  line-height: 1.3;
}

/* Метаданные */
.book-meta {
  display: grid;
  gap: 12px;
  margin-bottom: 25px;
}

.book-meta-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.book-meta-label {
  font-weight: 600;
  color: #555;
  min-width: 120px;
}

.book-meta-value {
  color: #333;
}

/* Ссылка на издательство */
.publisher-link {
  color: #27ae60;
  text-decoration: none;
  cursor: pointer;
  transition: color 0.3s ease;
}

.publisher-link:hover {
  color: #219150;
  text-decoration: underline;
}

/* Цена */
.book-price {
  font-size: 24px;
  font-weight: 700;
  color: #27ae60;
  margin: 20px 0;
}

/* Описание */
.book-description {
  margin: 25px 0;
  line-height: 1.6;
  color: #555;
}

/* Кнопки действий */
.book-actions {
  display: flex;
  gap: 15px;
  margin-top: 30px;
}

.btn-add-to-cart {
  background: #27ae60;
  color: white;
  border: none;
  padding: 15px 30px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  flex: 1;
  max-width: 200px;
}

.btn-add-to-cart:hover {
  background: #219150;
  transform: translateY(-2px);
}
```

### Стили модального окна

```css
/* Модальное окно */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s ease;
}

.modal.show {
  opacity: 1;
  visibility: visible;
}

.modal-content {
  background: white;
  border-radius: 12px;
  max-width: 600px;
  width: 90%;
  max-height: 80vh;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  transform: scale(0.9);
  transition: transform 0.3s ease;
}

.modal.show .modal-content {
  transform: scale(1);
}

/* Заголовок модального окна */
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 25px;
  border-bottom: 1px solid #eee;
  background: #f8f9fa;
}

.modal-close {
  font-size: 28px;
  font-weight: bold;
  color: #aaa;
  cursor: pointer;
  line-height: 1;
  transition: color 0.3s ease;
}

.modal-close:hover {
  color: #333;
}

/* Тело модального окна */
.modal-body {
  padding: 25px;
  overflow-y: auto;
  max-height: calc(80vh - 80px);
}

.publisher-info {
  display: grid;
  gap: 15px;
}

.publisher-info-item {
  display: flex;
  align-items: flex-start;
  gap: 15px;
}

.publisher-info-label {
  font-weight: 600;
  color: #555;
  min-width: 100px;
  flex-shrink: 0;
}

.publisher-info-value {
  color: #333;
  line-height: 1.5;
}
```

### Система уведомлений

```css
/* Контейнер уведомлений */
#notification-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1100;
}

.notification {
  background: #27ae60;
  color: white;
  padding: 15px 20px;
  border-radius: 8px;
  margin-bottom: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transform: translateX(400px);
  transition: transform 0.3s ease;
  min-width: 300px;
}

.notification.show {
  transform: translateX(0);
}

.notification.error {
  background: #e74c3c;
}

.notification.warning {
  background: #f39c12;
}

.notification.info {
  background: #3498db;
}
```

## 💻 JavaScript функциональность

### Основные функции

```javascript
// Инициализация страницы
function initializePage() {
    initializeModal();
    loadBookDetails();
    setupEventListeners();
}

// Загрузка данных о книге
async function loadBookDetails() {
    const bookId = getBookIdFromURL();
    
    if (!bookId) {
        showError('ID книги не найден в URL');
        return;
    }
    
    try {
        showLoading(true);
        
        const response = await fetch(`/api/books/${bookId}`);
        
        if (!response.ok) {
            throw new Error(`Ошибка загрузки: ${response.status}`);
        }
        
        const book = await response.json();
        currentBook = book;
        
        renderBookDetails(book);
        
    } catch (error) {
        console.error('Ошибка загрузки деталей книги:', error);
        showError('Ошибка загрузки информации о книге: ' + error.message);
    } finally {
        showLoading(false);
    }
}

// Отображение данных книги
function renderBookDetails(book) {
    // Обновление заголовка страницы
    document.title = `${book.title} - Книжный магазин`;
    
    // Обновление хлебных крошек
    updateBreadcrumb(book.title);
    
    // Обновление изображения
    const bookImage = document.getElementById('book-image');
    if (bookImage) {
        bookImage.src = book.image_url || '../img/book-placeholder.jpg';
        bookImage.alt = book.title;
    }
    
    // Обновление метаданных
    updateBookMeta('book-authors', formatAuthors(book.Authors), false);
    updateBookMeta('book-category', book.Category?.name || 'Не указана', false);
    updateBookMeta('book-publisher', book.Publisher?.name || 'Не указано', true, book.Publisher);
    // ... остальные поля
}

// Модальное окно издательства
function showPublisherModal() {
    const publisher = window.currentPublisher;
    
    if (!publisher) {
        showError('Информация о издательстве недоступна');
        return;
    }
    
    updatePublisherModalContent(publisher);
    
    if (publisherModal) {
        publisherModal.classList.add('show');
        document.body.style.overflow = 'hidden';
    }
}

// Добавление в корзину
async function addToCart() {
    if (!currentBook) {
        showError('Информация о книге недоступна');
        return;
    }
    
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            showError('Для добавления в корзину необходимо войти в систему');
            return;
        }
        
        const response = await fetch('/api/cart/add', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                book_id: currentBook.id,
                quantity: 1
            })
        });
        
        const result = await response.json();
        
        if (response.ok) {
            showSuccess('Книга добавлена в корзину!');
        } else {
            throw new Error(result.message || 'Ошибка добавления в корзину');
        }
        
    } catch (error) {
        console.error('Ошибка добавления в корзину:', error);
        showError('Ошибка добавления в корзину: ' + error.message);
    }
}
```

## 📱 Адаптивный дизайн

### Мобильная версия

```css
@media (max-width: 768px) {
  .book-detail {
    grid-template-columns: 1fr;
    gap: 25px;
    padding: 20px;
  }

  .book-detail-image img {
    max-width: 300px;
  }

  .book-detail-info h1 {
    font-size: 24px;
  }

  .book-actions {
    flex-direction: column;
  }

  .btn-add-to-cart,
  .btn-secondary {
    max-width: none;
  }

  .modal-content {
    width: 95%;
  }

  .publisher-info-item {
    flex-direction: column;
    gap: 5px;
  }
}

@media (max-width: 480px) {
  .book-detail {
    padding: 15px;
  }

  .book-detail-info h1 {
    font-size: 20px;
  }

  .book-meta-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 5px;
  }

  .btn-add-to-cart,
  .btn-secondary {
    padding: 12px 20px;
    font-size: 14px;
  }
}
```

## 🔧 API интеграция

### Получение данных книги

```javascript
// GET /api/books/:id
// Возвращает полную информацию о книге включая:
// - Основные данные (title, description, price, etc.)
// - Связанные авторы (Authors array)
// - Категорию (Category object)
// - Издательство (Publisher object)
```

### Добавление в корзину

```javascript
// POST /api/cart/add
// Headers: Authorization: Bearer <token>
// Body: { book_id: number, quantity: number }
// Возвращает: { success: boolean, message: string }
```

## 🚀 Функции интерактивности

### 1. Кликабельное издательство
- При клике на название издательства открывается модальное окно
- Модальное окно содержит полную информацию об издательстве
- Данные загружаются из API вместе с информацией о книге

### 2. Система уведомлений
- Уведомления об успешных операциях (зеленые)
- Уведомления об ошибках (красные)
- Автоматическое скрытие через 3 секунды
- Анимированное появление/исчезновение

### 3. Управление модальными окнами
- Закрытие по клику на крестик
- Закрытие по клику вне модального окна
- Закрытие по нажатию Escape
- Блокировка прокрутки страницы при открытом модальном окне

### 4. Адаптивность
- Автоматическое изменение макета на мобильных устройствах
- Оптимизированные размеры кнопок и текста
- Адаптивные модальные окна

## 📋 Чек-лист реализации

### HTML структура
- [ ] Хлебные крошки навигации
- [ ] Контейнер для изображения книги
- [ ] Секция с метаданными книги
- [ ] Контейнер для цены
- [ ] Секция описания
- [ ] Кнопки действий
- [ ] Модальное окно издательства
- [ ] Контейнер для уведомлений

### CSS стили
- [ ] Стили для основного макета
- [ ] Стили модального окна
- [ ] Анимации и переходы
- [ ] Адаптивные стили для мобильных устройств
- [ ] Стили уведомлений

### JavaScript функциональность
- [ ] Инициализация страницы
- [ ] Загрузка данных из API
- [ ] Отображение информации о книге
- [ ] Обработка модального окна
- [ ] Функция добавления в корзину
- [ ] Система уведомлений
- [ ] Обработка ошибок

### Интеграция с API
- [ ] Подключение к API книг
- [ ] Подключение к API корзины
- [ ] Обработка авторизации
- [ ] Валидация данных

## 🎯 Результат

Полнофункциональная детальная страница книги с:
- **Профессиональным дизайном** и удобной навигацией
- **Интерактивными элементами** включая модальные окна
- **API интеграцией** для получения данных и добавления в корзину
- **Адаптивностью** для всех типов устройств
- **Системой уведомлений** для обратной связи с пользователем

Эта реализация обеспечивает отличный пользовательский опыт и соответствует современным стандартам веб-разработки.