/**
 * Migration Runner - Execute SQL migrations on Supabase
 * Run with: node run_migrations.js
 */

require('dotenv').config({ path: './server/.env' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runMigration(filename) {
  console.log(`\n📄 Running migration: ${filename}`);
  
  const sqlPath = path.join(__dirname, 'migrations', filename);
  const sql = fs.readFileSync(sqlPath, 'utf8');
  
  try {
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });
    
    if (error) {
      console.error(`❌ Migration failed: ${filename}`);
      console.error(error);
      return false;
    }
    
    console.log(`✅ Migration completed: ${filename}`);
    return true;
  } catch (err) {
    console.error(`❌ Error running migration: ${filename}`);
    console.error(err.message);
    return false;
  }
}

async function runAllMigrations() {
  console.log('🚀 Starting database migrations...\n');
  console.log(`📍 Database: ${supabaseUrl}`);
  
  const migrations = [
    '002_rename_student_id_to_school_id.sql',
    '003_seed_admin_account.sql'
  ];
  
  for (const migration of migrations) {
    const success = await runMigration(migration);
    if (!success) {
      console.error('\n❌ Migration process stopped due to error');
      process.exit(1);
    }
  }
  
  console.log('\n✅ All migrations completed successfully!');
  console.log('\n📝 Admin Account Details:');
  console.log('   School ID: 000000');
  console.log('   Email: admin@mabinicolleges.edu.ph');
  console.log('   Password: admin123');
  console.log('   ⚠️  Please change password after first login!');
}

runAllMigrations().catch(err => {
  console.error('❌ Fatal error:', err);
  process.exit(1);
});
