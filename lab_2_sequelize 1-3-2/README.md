# 📚 Bookstore Database - Sequelize Project

## Overview

This project implements a complete database schema for an online bookstore using Node.js, Sequelize ORM, and PostgreSQL. The schema includes 11 normalized tables with proper relationships, constraints, and indexes.

## 📊 Database Schema

The database schema is fully documented in **`database-schema.dbml`** using DBML (Database Markup Language) format.

### Tables (11)

1. **users** - User accounts with role-based access (customer, admin, manager)
2. **categories** - Book categories with hierarchical structure (parent-child)
3. **publishers** - Publishing houses with contact information
4. **authors** - Author biographical information
5. **books** - Book catalog with full details (ISBN, price, stock, etc.)
6. **book_authors** - Many-to-many relationship between books and authors
7. **orders** - Customer orders with status tracking
8. **order_items** - Line items in customer orders
9. **reviews** - Customer reviews and ratings (1-5 stars)
10. **cart_items** - Shopping cart functionality
11. **wishlist** - User wishlist items

## 🚀 Quick Start

### Prerequisites

- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure database:**
   ```bash
   cp config/config.example.json config/config.json
   # Edit config/config.json with your PostgreSQL credentials
   ```

3. **Create database:**
   ```bash
   npm run db:create
   ```

4. **Run migrations:**
   ```bash
   npm run db:migrate
   ```

5. **Seed with test data (optional):**
   ```bash
   npm run db:seed
   ```

6. **Validate setup:**
   ```bash
   node validate-schema.js
   ```

## 📁 Project Structure

```
lab_2_sequelize 1-3-2/
├── config/                      # Sequelize configuration
│   ├── config.example.json      # Template config (committed)
│   ├── config.json              # Your config (gitignored)
│   └── README.md                # Config documentation
├── migrations/                  # Database migrations
│   ├── 20241014120001-create-users.js
│   ├── 20241014120002-create-categories.js
│   ├── ... (11 migration files)
│   └── 20241014120011-create-wishlist.js
├── models/                      # Sequelize models
│   ├── index.js                 # Model loader
│   ├── User.js
│   ├── Category.js
│   ├── ... (11 model files)
│   └── Wishlist.js
├── seeders/                     # Database seeders
│   └── 20241014120001-demo-data.js
├── public/                      # Frontend files
│   ├── html/
│   ├── scripts/
│   ├── style/
│   └── index.html
├── database-schema.dbml         # Complete schema documentation
├── validate-schema.js           # Schema validation script
├── MIGRATION_CHANGES.md         # Detailed change log
├── test-models.js               # Model testing script
├── server.js                    # Express server
├── package.json                 # Dependencies and scripts
└── README.md                    # This file
```

## 🔧 Available Scripts

```bash
# Development
npm run dev              # Start server with nodemon (auto-reload)
npm start                # Start server in production mode

# Database operations
npm run db:create        # Create database
npm run db:migrate       # Run all pending migrations
npm run db:seed          # Seed database with test data

# Validation and testing
node validate-schema.js  # Validate models and associations
node test-models.js      # Test model functionality
```

## 🔐 Environment Configuration

Database credentials are configured in `config/config.json` (not committed to git). Use `config/config.example.json` as a template.

Default structure:
```json
{
  "development": {
    "username": "postgres",
    "password": "your_password_here",
    "database": "bookstore_dev",
    "host": "127.0.0.1",
    "port": 5432,
    "dialect": "postgres"
  }
}
```

## 📖 Database Relationships

### Key Relationships

- **Users ↔ Orders** (1:N) - A user can have multiple orders
- **Orders ↔ OrderItems** (1:N) - An order contains multiple items
- **Books ↔ Authors** (N:M) - Many-to-many through book_authors
- **Categories ↔ Books** (1:N) - A category contains multiple books
- **Publishers ↔ Books** (1:N) - A publisher publishes multiple books
- **Users ↔ Reviews** (1:N) - A user can write multiple reviews
- **Books ↔ Reviews** (1:N) - A book can have multiple reviews
- **Categories ↔ Categories** (self-reference) - Hierarchical categories

### Foreign Key Policies

- **CASCADE DELETE**: Orders, Reviews, Cart, Wishlist (dependent on user/book)
- **RESTRICT DELETE**: Categories, Publishers (protect if books exist)
- **SET NULL**: Category parent_id (optional hierarchy)

## ✅ Validation

Run the validation script to verify schema integrity:

```bash
node validate-schema.js
```

Expected output:
```
✅ Models loaded successfully: 11 models
✅ All associations verified
✅ Migration files aligned: 11 migrations
✅ No association errors
```

## 📝 Models Documentation

Each model includes:
- Field definitions with validation
- Associations with other models
- Instance methods for business logic
- Static scopes for common queries
- Proper indexes for performance

Example model methods:
- `User.getFullName()` - Get user's full name
- `Book.isAvailable()` - Check if book is in stock
- `Order.confirmOrder()` - Confirm a pending order
- `Review.getRatingStars()` - Get star rating display

## 🔄 Migrations vs Models

All migrations have been carefully aligned with their corresponding models. See **`MIGRATION_CHANGES.md`** for detailed information about changes made to ensure consistency.

Key improvements:
- Field types match exactly between migrations and models
- Foreign key constraints properly configured
- Indexes defined for optimal query performance
- ENUM values consistent across migrations and models

## 🐛 Troubleshooting

### Database connection error
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```
**Solution:** Ensure PostgreSQL is running and credentials in `config/config.json` are correct.

### Migration error: relation already exists
```
Error: relation "users" already exists
```
**Solution:** Drop the database and recreate it, or roll back migrations:
```bash
npx sequelize-cli db:migrate:undo:all
npm run db:migrate
```

### Models not loading
```
Error: Cannot find module './models'
```
**Solution:** Ensure you're in the correct directory and `node_modules` is installed:
```bash
cd "lab_2_sequelize 1-3-2"
npm install
```

## 📚 Resources

- [Sequelize Documentation](https://sequelize.org/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [DBML Documentation](https://dbml.dbdiagram.io/docs/)

## 🤝 Contributing

This project follows the structure documented in:
- `Step1.md` - Project initialization
- `Step2.md` - Database schema design
- `Step3.md` - Model creation and testing

## 📄 License

MIT

## 👨‍💻 Author

Created as part of lab work for database design and implementation course.

---

**Status:** ✅ Production Ready - All migrations and models validated and tested.

Last updated: October 16, 2025
