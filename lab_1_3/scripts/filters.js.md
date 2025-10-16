# 📚 Разбор файла filters.js - Система фильтрации каталога книг

## 🎯 Назначение файла

Этот JavaScript файл создает интерактивную систему фильтрации для каталога книг. Позволяет пользователям фильтровать книги по жанру, цене и автору в реальном времени.

## 🏗️ Общая структура

### IIFE (Immediately Invoked Function Expression) - Немедленно вызываемая функция

```javascript
(function () {
  // весь код здесь
})();
```

**Что это означает для новичка:**

- Это специальный паттерн JavaScript, который создает изолированную область видимости
- Код внутри скобок выполняется сразу при загрузке файла
- Переменные внутри не "загрязняют" глобальную область видимости
- Это хорошая практика для избежания конфликтов с другими скриптами

## 🔍 Пошаговый разбор кода

### 1. Проверка поддержки CSS :has() селектора

```javascript
try {
  var supportsHas =
    CSS &&
    typeof CSS.supports === "function" &&
    CSS.supports("selector(:has(*))");
} catch (e) {
  var supportsHas = false;
}
if (!supportsHas) {
  document.documentElement.classList.add("no-has");
}
```

**Объяснение для новичка:**

- `:has()` - это современный CSS селектор для выбора родительских элементов
- Не все браузеры его поддерживают (особенно старые)
- `try...catch` - конструкция для "безопасной" проверки возможностей браузера
- Если селектор не поддерживается, добавляется CSS класс `no-has` к элементу `<html>`
- Это позволяет CSS стилям работать по-разному в зависимости от возможностей браузера

#### 🔍 Детальный разбор строки проверки:

```javascript
var supportsHas =
  CSS &&
  typeof CSS.supports === "function" &&
  CSS.supports("selector(:has(*))");
```

**Эта строка использует принцип "короткого замыкания" (short-circuiting) с логическим оператором `&&`:**

1. **`CSS`** - проверяет, существует ли глобальный объект CSS

   - В старых браузерах этого объекта может не быть
   - Если `CSS` равен `undefined` или `null`, вся проверка остановится и вернет `false`

2. **`typeof CSS.supports === 'function'`** - проверяет, является ли `CSS.supports` функцией

   - `typeof` возвращает строку с типом переменной
   - Если `CSS.supports` не функция (или не существует), вернет `false`
   - Только если это функция, проверка продолжится

3. **`CSS.supports('selector(:has(*))')`** - вызывает функцию проверки поддержки
   - Проверяет, может ли браузер работать с селектором `:has(*)`
   - Возвращает `true` если поддерживается, `false` если нет

**Принцип "короткого замыкания":**

- Если первое условие `false` → остальные не проверяются, результат `false`
- Если второе условие `false` → третье не проверяется, результат `false`
- Только если все три `true` → результат `true`

**Пример работы в разных браузерах:**

```javascript
// В старом Internet Explorer:
CSS; // undefined
// Результат: false (проверка останавливается)

// В Firefox 100 (без поддержки :has):
CSS; // объект существует ✓
typeof CSS.supports === "function"; // true ✓
CSS.supports("selector(:has(*))"); // false ✗
// Результат: false

// В Chrome 105+ (с поддержкой :has):
CSS; // объект существует ✓
typeof CSS.supports === "function"; // true ✓
CSS.supports("selector(:has(*))"); // true ✓
// Результат: true
```

**Зачем такая сложная проверка?**

- **Безопасность**: предотвращает ошибки JavaScript в старых браузерах
- **Прогрессивные улучшения**: код работает везде, но лучше в современных браузерах
- **Graceful degradation**: если функция не поддерживается, применяется запасной вариант

### 2. Получение элементов фильтров

```javascript
var genreRadios = document.querySelectorAll('input[name="genre"]');
var priceRadios = document.querySelectorAll('input[name="price"]');
var authorRadios = document.querySelectorAll('input[name="author"]');
```

**Объяснение:**

- `document.querySelectorAll()` - метод для поиска ВСЕХ элементов по CSS селектору
- `input[name="genre"]` - находит все input элементы с атрибутом name="genre"
- Результат - NodeList (список) всех radio кнопок для каждой группы фильтров
- Переменные хранят ссылки на группы радиокнопок: жанр, цена, автор

### 3. Функция определения выбранного значения

```javascript
function getCheckedValue(radios) {
  for (var i = 0; i < radios.length; i++)
    if (radios[i].checked) return radios[i].value;
  return "all";
}
```

**Пошаговое объяснение:**

1. Принимает список радиокнопок как параметр
2. Проходит по каждой кнопке в цикле `for`
3. Проверяет свойство `.checked` (true если кнопка выбрана)
4. Если кнопка выбрана, возвращает её значение `.value`
5. Если ни одна не выбрана, возвращает 'all' (показать все)

**Пример работы:**

```html
<input type="radio" name="genre" value="fantasy" checked /> Фантастика
<input type="radio" name="genre" value="drama" /> Драма
```

Функция вернет: `"fantasy"`

### 4. Основная функция фильтрации

```javascript
function applyFilters() {
  var g = getCheckedValue(genreRadios);
  var p = getCheckedValue(priceRadios);
  var a = getCheckedValue(authorRadios);

  var cards = document.querySelectorAll(".books .book-card");
  cards.forEach(function (card) {
    var ok = true;
    if (g !== "all" && !card.classList.contains(g)) ok = false;
    if (p !== "all") {
      if (p === "low" && !card.classList.contains("price-low")) ok = false;
      if (p === "high" && !card.classList.contains("price-high")) ok = false;
    }
    if (a !== "all" && !card.classList.contains(a)) ok = false;
    card.style.display = ok ? "flex" : "none";
  });
}
```

**Детальный разбор:**

#### Шаг 1: Получение текущих значений фильтров

```javascript
var g = getCheckedValue(genreRadios); // например: "fantasy" или "all"
var p = getCheckedValue(priceRadios); // например: "low" или "all"
var a = getCheckedValue(authorRadios); // например: "russian" или "all"
```

#### Шаг 2: Получение всех карточек книг

```javascript
var cards = document.querySelectorAll(".books .book-card");
```

- Находит все элементы с классом `.book-card` внутри элемента с классом `.books`

#### Шаг 3: Проверка каждой карточки

```javascript
cards.forEach(function(card){
  var ok = true;  // По умолчанию карточка проходит фильтр
```

#### Шаг 4: Проверка по жанру

```javascript
if (g !== "all" && !card.classList.contains(g)) ok = false;
```

**Логика:**

- Если выбран конкретный жанр (не 'all')
- И карточка НЕ содержит класс этого жанра
- То карточка НЕ проходит фильтр

#### Шаг 5: Проверка по цене

```javascript
if (p !== "all") {
  if (p === "low" && !card.classList.contains("price-low")) ok = false;
  if (p === "high" && !card.classList.contains("price-high")) ok = false;
}
```

**Логика:**

- Если выбрана конкретная ценовая категория
- Проверяем соответствующий CSS класс на карточке
- Если класс не найден, карточка не проходит фильтр

#### Шаг 6: Проверка по автору

```javascript
if (a !== "all" && !card.classList.contains(a)) ok = false;
```

**Аналогично жанру**

#### Шаг 7: Применение результата

```javascript
card.style.display = ok ? "flex" : "none";
```

**Тернарный оператор:**

- Если `ok === true` → устанавливаем `display: flex` (показать)
- Если `ok === false` → устанавливаем `display: none` (скрыть)

### 5. Привязка обработчиков событий

```javascript
[genreRadios, priceRadios, authorRadios].forEach(function (group) {
  group.forEach(function (r) {
    r.addEventListener("change", applyFilters);
  });
});
```

**Объяснение:**

1. Создаем массив из трех групп радиокнопок
2. Для каждой группы выполняем функцию
3. Для каждой радиокнопки в группе добавляем слушатель события 'change'
4. При изменении любой кнопки вызывается функция `applyFilters`

**Что происходит:** При клике на любую радиокнопку фильтров автоматически перефильтровывается каталог

### 6. Начальная фильтрация

```javascript
document.addEventListener("DOMContentLoaded", applyFilters);
```

**Назначение:**

- Когда DOM полностью загружен, выполняется первичная фильтрация
- Это нужно для установки правильного состояния при загрузке страницы

## 🎨 Пример работы с HTML

### HTML структура фильтров:

```html
<!-- Фильтры -->
<div class="filters">
  <input type="radio" name="genre" value="all" checked /> Все жанры
  <input type="radio" name="genre" value="fantasy" /> Фантастика
  <input type="radio" name="genre" value="drama" /> Драма

  <input type="radio" name="price" value="all" checked /> Любая цена
  <input type="radio" name="price" value="low" /> До 1000₽
  <input type="radio" name="price" value="high" /> От 1000₽

  <input type="radio" name="author" value="all" checked /> Все авторы
  <input type="radio" name="author" value="russian" /> Русские
  <input type="radio" name="author" value="foreign" /> Зарубежные
</div>
```

### HTML структура карточек:

```html
<div class="books">
  <div class="book-card fantasy price-low russian">
    <!-- Карточка фантастической книги, дешевой, русского автора -->
  </div>

  <div class="book-card drama price-high foreign">
    <!-- Карточка драмы, дорогой, зарубежного автора -->
  </div>
</div>
```

## ✨ Принципы работы

### 1. **Основа на CSS классах**

- Каждая карточка имеет CSS классы, описывающие её свойства
- Фильтрация работает через проверку наличия нужных классов

### 2. **Реактивность**

- Изменения применяются мгновенно при клике
- Нет необходимости в кнопке "Применить фильтры"

### 3. **Совместимость**

- Код работает даже в старых браузерах
- Предусмотрена проверка поддержки современных CSS возможностей

## 🔧 Преимущества подхода

1. **Простота** - легко понять и модифицировать
2. **Производительность** - быстрая фильтрация через CSS классы
3. **Расширяемость** - легко добавить новые типы фильтров
4. **Совместимость** - работает во всех браузерах

## 🎯 Возможные улучшения

1. **Множественный выбор** - чекбоксы вместо радиокнопок
2. **Анимации** - плавное появление/скрытие карточек
3. **Счетчики** - показ количества найденных книг
4. **URL-состояние** - сохранение фильтров в адресной строке
5. **Поиск по тексту** - дополнительный текстовый фильтр

## 📚 Термины для новичков

- **DOM** - объектная модель документа, представление HTML в JavaScript
- **NodeList** - список HTML элементов, похож на массив
- **CSS селектор** - способ выбрать элементы на странице
- **Event listener** - функция, которая "слушает" события (клики, изменения)
- **Тернарный оператор** - сокращенная форма if-else: `условие ? значение_если_true : значение_если_false`
- **Область видимости** - где доступны переменные и функции
