// Apply migration to Supabase safely
require('dotenv').config({ path: '../.env' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function applyMigration() {
  console.log('🚀 MC Tutor Database Migration\n');
  console.log('📋 This will:');
  console.log('   - Add first_name, middle_name, last_name columns');
  console.log('   - Migrate data from full_name');
  console.log('   - Enable Row Level Security (RLS)');
  console.log('   - Add security features\n');

  const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  });

  readline.question('⚠️  Proceed with migration? (yes/no): ', async (answer) => {
    if (answer.toLowerCase() !== 'yes') {
      console.log('❌ Migration cancelled');
      readline.close();
      return;
    }

    try {
      console.log('\n📖 Reading migration file...');
      const migrationSQL = fs.readFileSync(
        path.join(__dirname, '../migrations/001_refactor_names_and_security_v2.sql'),
        'utf8'
      );

      console.log('📤 Applying migration to Supabase...\n');

      // Execute the migration
      const { data, error } = await supabase.rpc('exec_sql', {
        sql_query: migrationSQL
      });

      if (error) {
        // If RPC doesn't exist, try direct approach
        console.log('⚠️  RPC not available, using alternative method...');
        console.log('\n📋 Please run this SQL manually in Supabase Dashboard:');
        console.log('   1. Go to https://supabase.com/dashboard');
        console.log('   2. Select your project');
        console.log('   3. Go to SQL Editor');
        console.log('   4. Copy/paste migration file content');
        console.log('   5. Click "Run"\n');
        console.log(`Migration file: ${path.join(__dirname, '../migrations/001_refactor_names_and_security_v2.sql')}`);
      } else {
        console.log('✅ Migration applied successfully!');
        
        // Verify migration
        console.log('\n🔍 Verifying migration...');
        const { data: users, error: verifyError } = await supabase
          .from('users')
          .select('user_id, first_name, middle_name, last_name, full_name')
          .limit(3);

        if (!verifyError && users) {
          console.log('\n✅ Sample migrated users:');
          users.forEach(user => {
            const fullName = user.middle_name 
              ? `${user.first_name} ${user.middle_name} ${user.last_name}`
              : `${user.first_name} ${user.last_name}`;
            console.log(`   User ${user.user_id}: ${fullName}`);
          });
        }

        console.log('\n✅ Migration complete! Next steps:');
        console.log('   1. Update backend code: npm run update-backend');
        console.log('   2. Update frontend forms');
        console.log('   3. Test authentication flow');
      }

    } catch (error) {
      console.error('❌ Migration error:', error.message);
      console.log('\n📋 Manual migration steps:');
      console.log('   1. Open Supabase Dashboard → SQL Editor');
      console.log('   2. Run: server/migrations/001_refactor_names_and_security_v2.sql');
    }

    readline.close();
  });
}

applyMigration();
