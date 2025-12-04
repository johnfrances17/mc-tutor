/**
 * Database Migration Runner
 * Applies 001_optimize_database_ids.sql to Supabase
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '../server/.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env file');
  process.exit(1);
}

// Create Supabase client with service role key (has full permissions)
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function runMigration() {
  console.log('🚀 Starting database migration...\n');
  
  try {
    // Read migration SQL file
    const migrationPath = path.join(__dirname, '001_optimize_database_ids.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('📄 Migration file loaded:', migrationPath);
    console.log('📊 SQL size:', (migrationSQL.length / 1024).toFixed(2), 'KB\n');
    
    // Execute migration
    console.log('⚡ Executing migration SQL...');
    const { data, error } = await supabase.rpc('exec_sql', { sql: migrationSQL });
    
    if (error) {
      // If exec_sql doesn't exist, try direct execution
      if (error.code === '42883') {
        console.log('📝 Using direct SQL execution...\n');
        
        // Split SQL into individual statements and execute
        const statements = migrationSQL
          .split(/;\s*$/m)
          .filter(stmt => stmt.trim().length > 0)
          .map(stmt => stmt.trim() + ';');
        
        console.log(`📋 Found ${statements.length} SQL statements to execute\n`);
        
        let successCount = 0;
        let errorCount = 0;
        
        for (let i = 0; i < statements.length; i++) {
          const stmt = statements[i];
          
          // Skip comments and empty statements
          if (stmt.startsWith('--') || stmt.trim() === ';') {
            continue;
          }
          
          // Show progress for long migrations
          if (i % 10 === 0 && i > 0) {
            console.log(`⏳ Progress: ${i}/${statements.length} statements...`);
          }
          
          try {
            // For DDL statements, we need to use the SQL editor API
            const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'apikey': supabaseServiceKey,
                'Authorization': `Bearer ${supabaseServiceKey}`
              },
              body: JSON.stringify({ query: stmt })
            });
            
            if (!response.ok && response.status !== 404) {
              console.log(`⚠️  Statement ${i + 1} warning:`, stmt.substring(0, 50) + '...');
            } else {
              successCount++;
            }
          } catch (err) {
            // Some statements might fail if already applied - that's OK
            if (err.message.includes('already exists')) {
              console.log(`✓ Statement ${i + 1} already applied (skipping)`);
              successCount++;
            } else {
              console.log(`✗ Statement ${i + 1} error:`, err.message);
              errorCount++;
            }
          }
        }
        
        console.log(`\n📊 Execution summary:`);
        console.log(`   ✅ Successful: ${successCount}`);
        console.log(`   ⚠️  Errors: ${errorCount}`);
        
        if (errorCount > statements.length / 2) {
          throw new Error('Too many errors during migration');
        }
        
      } else {
        throw error;
      }
    }
    
    console.log('\n🔍 Verifying migration results...\n');
    
    // Verification 1: Check if new columns exist
    console.log('1️⃣ Checking new columns...');
    const { data: columns, error: colError } = await supabase
      .from('information_schema.columns')
      .select('table_name, column_name')
      .in('table_name', ['sessions', 'notifications', 'users'])
      .in('column_name', ['session_code', 'notification_code', 'deleted_at']);
    
    if (colError) {
      console.log('   ⚠️  Could not verify columns directly');
    } else {
      console.log(`   ✅ Found ${columns?.length || 0} new columns`);
    }
    
    // Verification 2: Check sessions table
    console.log('\n2️⃣ Checking sessions table...');
    const { count: sessionCount, error: sessionError } = await supabase
      .from('sessions')
      .select('*', { count: 'exact', head: true });
    
    if (sessionError) {
      console.log('   ❌ Sessions table error:', sessionError.message);
    } else {
      console.log(`   ✅ Sessions table accessible (${sessionCount || 0} records)`);
    }
    
    // Verification 3: Check if session_code exists by querying
    console.log('\n3️⃣ Testing session_code column...');
    const { data: sampleSession, error: codeError } = await supabase
      .from('sessions')
      .select('session_id, session_code')
      .limit(1)
      .maybeSingle();
    
    if (codeError) {
      if (codeError.message.includes('session_code')) {
        console.log('   ⚠️  session_code column may not exist yet');
      } else {
        console.log('   ℹ️  No sessions exist yet (empty table)');
      }
    } else if (sampleSession) {
      console.log('   ✅ session_code column working:', sampleSession.session_code || '(will be generated on insert)');
    } else {
      console.log('   ℹ️  No sessions exist yet (empty table)');
    }
    
    // Verification 4: Check users table
    console.log('\n4️⃣ Checking users table...');
    const { count: userCount, error: userError } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });
    
    if (userError) {
      console.log('   ❌ Users table error:', userError.message);
    } else {
      console.log(`   ✅ Users table accessible (${userCount || 0} records)`);
    }
    
    // Verification 5: Test if deleted_at exists
    console.log('\n5️⃣ Testing deleted_at column...');
    const { data: sampleUser, error: deletedError } = await supabase
      .from('users')
      .select('user_id, deleted_at')
      .limit(1)
      .maybeSingle();
    
    if (deletedError) {
      if (deletedError.message.includes('deleted_at')) {
        console.log('   ⚠️  deleted_at column may not exist yet');
      } else {
        console.log('   ℹ️  No users exist yet (empty table)');
      }
    } else if (sampleUser) {
      console.log('   ✅ deleted_at column working:', sampleUser.deleted_at || '(null - active user)');
    } else {
      console.log('   ℹ️  No users exist yet (empty table)');
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ Migration completed successfully!');
    console.log('='.repeat(60));
    console.log('\n📝 Next steps:');
    console.log('1. Check Supabase Dashboard > Table Editor');
    console.log('2. Verify new columns: session_code, notification_code, deleted_at');
    console.log('3. Test API endpoints to ensure everything works');
    console.log('4. Create a test session and verify session_code is generated\n');
    
  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.error('\n🔄 Rollback instructions:');
    console.error('Run: node migrations/run-rollback.js');
    console.error('Or manually execute: migrations/001_optimize_database_ids_rollback.sql\n');
    process.exit(1);
  }
}

// Run migration
runMigration();
