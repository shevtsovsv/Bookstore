require('dotenv').config();
const db = require('./models');

async function testDatabase() {
  try {
    // Тест подключения
    await db.sequelize.authenticate();
    console.log('✅ Подключение к БД успешно установлено');

    // Получение всех книг с авторами и категориями
    const books = await db.Book.findAll({
      include: [
        {
          model: db.Category,
          as: 'category',
          attributes: ['name', 'slug']
        },
        {
          model: db.Author,
          as: 'authors',
          through: { attributes: [] }, // Не показывать промежуточную таблицу
          attributes: ['name', 'authorType']
        }
      ],
      order: [['popularity', 'DESC']]
    });

    console.log('\n📚 Книги в БД (по популярности):');
    console.log('═'.repeat(80));

    books.forEach((book, index) => {
      const author = book.authors[0];
      console.log(`\n${index + 1}. ${book.title}`);
      console.log(`   Автор: ${author.name} (${author.authorType})`);
      console.log(`   Категория: ${book.category.name}`);
      console.log(`   Цена: ${book.price} руб. (${book.priceCategory})`);
      console.log(`   Популярность: ${book.popularity} покупок`);
      console.log(`   На складе: ${book.stock} шт.`);
    });

    // Получение категорий с количеством книг
    const categories = await db.Category.findAll({
      include: [{
        model: db.Book,
        as: 'books',
        attributes: []
      }],
      attributes: [
        'id',
        'name',
        [db.sequelize.fn('COUNT', db.sequelize.col('books.id')), 'bookCount']
      ],
      group: ['Category.id'],
      raw: true
    });

    console.log('\n\n📂 Категории:');
    console.log('═'.repeat(40));
    categories.forEach(cat => {
      console.log(`${cat.name}: ${cat.bookCount} книг(и)`);
    });

    // Получение авторов по типу
    const russianAuthors = await db.Author.count({ where: { authorType: 'russian' } });
    const foreignAuthors = await db.Author.count({ where: { authorType: 'foreign' } });

    console.log('\n\n👥 Статистика по авторам:');
    console.log('═'.repeat(40));
    console.log(`Российские авторы: ${russianAuthors}`);
    console.log(`Зарубежные авторы: ${foreignAuthors}`);

    // Книги с низким запасом
    const lowStock = await db.Book.findAll({
      where: {
        stock: {
          [db.Sequelize.Op.lt]: 10
        }
      },
      attributes: ['title', 'stock'],
      order: [['stock', 'ASC']]
    });

    if (lowStock.length > 0) {
      console.log('\n\n⚠️  Книги с низким запасом (< 10 шт.):');
      console.log('═'.repeat(40));
      lowStock.forEach(book => {
        console.log(`${book.title}: ${book.stock} шт.`);
      });
    }

    console.log('\n\n✅ Все тесты пройдены успешно!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Ошибка:', error);
    process.exit(1);
  }
}

testDatabase();
