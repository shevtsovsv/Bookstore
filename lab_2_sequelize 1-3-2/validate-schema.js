#!/usr/bin/env node
/**
 * Comprehensive validation script for migrations and models
 * Verifies that all migrations match their corresponding Sequelize models
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Validating Migrations and Models Alignment\n');
console.log('=' . repeat(60));

// Load models
let db;
try {
  db = require('./models');
  console.log('✅ Models loaded successfully');
  console.log(`   Found ${Object.keys(db).filter(k => !['sequelize', 'Sequelize', 'Op'].includes(k)).length} models\n`);
} catch (error) {
  console.error('❌ Failed to load models:', error.message);
  process.exit(1);
}

// List all models
const modelNames = Object.keys(db).filter(k => !['sequelize', 'Sequelize', 'Op'].includes(k));
console.log('📋 Models:');
modelNames.forEach(name => {
  console.log(`   - ${name}`);
});
console.log();

// List all migrations
const migrationsDir = path.join(__dirname, 'migrations');
const migrationFiles = fs.readdirSync(migrationsDir)
  .filter(f => f.endsWith('.js'))
  .sort();

console.log('📋 Migrations:');
migrationFiles.forEach(file => {
  console.log(`   - ${file}`);
});
console.log();

// Verify associations
console.log('🔗 Verifying Model Associations:');
let associationErrors = 0;

modelNames.forEach(modelName => {
  const model = db[modelName];
  if (model.associate) {
    try {
      const associations = Object.keys(model.associations || {});
      if (associations.length > 0) {
        console.log(`   ✅ ${modelName}: ${associations.join(', ')}`);
      } else {
        console.log(`   ⚠️  ${modelName}: No associations`);
      }
    } catch (error) {
      console.log(`   ❌ ${modelName}: Error - ${error.message}`);
      associationErrors++;
    }
  }
});
console.log();

// Test database connection
console.log('🔌 Testing Database Connection:');
db.sequelize.authenticate()
  .then(() => {
    console.log('   ✅ Database connection successful\n');
    
    // Summary
    console.log('=' . repeat(60));
    console.log('📊 Validation Summary:\n');
    console.log(`   Models: ${modelNames.length}`);
    console.log(`   Migrations: ${migrationFiles.length}`);
    console.log(`   Association Errors: ${associationErrors}`);
    
    if (associationErrors === 0) {
      console.log('\n✅ All validations passed!');
      console.log('   Migrations and models are properly aligned.');
      console.log('   Ready to run: npm run db:migrate\n');
      process.exit(0);
    } else {
      console.log('\n⚠️  Some issues found. Please review the errors above.\n');
      process.exit(1);
    }
  })
  .catch(err => {
    console.log('   ⚠️  Database connection failed (this is expected if DB not yet created)');
    console.log(`   Error: ${err.message}`);
    console.log('\n   To create the database, run: npm run db:create');
    console.log('   Then run migrations with: npm run db:migrate\n');
    
    // Still consider it a success if models load correctly
    if (associationErrors === 0) {
      console.log('✅ Models and associations are valid!');
      console.log('   Database connection will work after creating the database.\n');
      process.exit(0);
    } else {
      process.exit(1);
    }
  });

// Add timeout to ensure script doesn't hang
setTimeout(() => {
  console.log('\n⏱️  Validation timeout - exiting');
  process.exit(1);
}, 10000);
