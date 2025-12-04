/**
 * Test Supabase Connection
 * Run this to verify database connectivity
 */

import { supabase } from '../config/database';

async function testConnection() {
  console.log('🔍 Testing Supabase connection...\n');

  try {
    // Test 1: Simple query to subjects table
    console.log('Test 1: Querying subjects table...');
    const { data: subjects, error: subjectsError } = await supabase
      .from('subjects')
      .select('subject_id, subject_code, subject_name')
      .limit(5);

    if (subjectsError) {
      console.error('❌ Subjects query failed:', subjectsError);
    } else {
      console.log(`✅ Subjects query successful! Found ${subjects?.length || 0} subjects`);
      if (subjects && subjects.length > 0) {
        console.log('   Sample:', subjects[0]);
      }
    }

    // Test 2: Query users table structure (count only)
    console.log('\nTest 2: Checking users table...');
    const { count: userCount, error: usersError } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });

    if (usersError) {
      console.error('❌ Users query failed:', usersError);
    } else {
      console.log(`✅ Users table accessible! Total users: ${userCount || 0}`);
    }

    // Test 3: Check sessions table
    console.log('\nTest 3: Checking sessions table...');
    const { count: sessionCount, error: sessionsError } = await supabase
      .from('sessions')
      .select('*', { count: 'exact', head: true });

    if (sessionsError) {
      console.error('❌ Sessions query failed:', sessionsError);
    } else {
      console.log(`✅ Sessions table accessible! Total sessions: ${sessionCount || 0}`);
    }

    console.log('\n✅ All connection tests passed!');
    console.log('🎉 Supabase is properly connected!\n');

  } catch (error) {
    console.error('\n❌ Connection test failed:', error);
    console.error('\nPlease check:');
    console.error('1. SUPABASE_URL is correct in .env');
    console.error('2. SUPABASE_ANON_KEY is correct in .env');
    console.error('3. Database tables exist in Supabase');
    console.error('4. RLS policies allow anonymous reads (if needed)\n');
  }

  process.exit(0);
}

testConnection();
