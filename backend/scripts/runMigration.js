const db = require('../config/database');
const fs = require('fs');
const path = require('path');

async function runMigration(filename) {
  try {
    const migrationPath = path.join(__dirname, '../migrations', filename);
    const sql = fs.readFileSync(migrationPath, 'utf8');
    
    // Split by semicolon and run each statement
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));
    
    for (const statement of statements) {
      try {
        console.log('Running:', statement.substring(0, 50) + '...');
        await db.execute(statement);
        console.log('✅ Success');
      } catch (err) {
        // Ignore "duplicate column" errors
        if (err.code === 'ER_DUP_FIELDNAME') {
          console.log('⏭️  Column already exists, skipping');
        } else {
          throw err;
        }
      }
    }
    
    console.log('\n✅ Migration completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

// Run with: node scripts/runMigration.js 004_add_user_profile_fields_compatible.sql
const migrationFile = process.argv[2];
if (!migrationFile) {
  console.log('Usage: node scripts/runMigration.js <migration_file.sql>');
  process.exit(1);
}

runMigration(migrationFile);
