// Fetch current Supabase schema
require('dotenv').config({ path: '../.env' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function fetchSchema() {
  console.log('🔍 Fetching Supabase schema...\n');

  try {
    // Fetch users table schema
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .limit(1);
    
    if (usersError) throw usersError;
    
    console.log('✅ USERS TABLE STRUCTURE:');
    if (users && users.length > 0) {
      console.log(JSON.stringify(users[0], null, 2));
      console.log('\nColumns:', Object.keys(users[0]).join(', '));
    }

    // Fetch sessions table schema
    const { data: sessions, error: sessionsError } = await supabase
      .from('sessions')
      .select('*')
      .limit(1);
    
    if (!sessionsError && sessions && sessions.length > 0) {
      console.log('\n✅ SESSIONS TABLE STRUCTURE:');
      console.log('Columns:', Object.keys(sessions[0]).join(', '));
    }

    // Fetch subjects table schema
    const { data: subjects, error: subjectsError } = await supabase
      .from('subjects')
      .select('*')
      .limit(1);
    
    if (!subjectsError && subjects && subjects.length > 0) {
      console.log('\n✅ SUBJECTS TABLE STRUCTURE:');
      console.log('Columns:', Object.keys(subjects[0]).join(', '));
    }

    // Fetch materials table schema
    const { data: materials, error: materialsError } = await supabase
      .from('materials')
      .select('*')
      .limit(1);
    
    if (!materialsError && materials && materials.length > 0) {
      console.log('\n✅ MATERIALS TABLE STRUCTURE:');
      console.log('Columns:', Object.keys(materials[0]).join(', '));
    }

    // Fetch feedback table schema
    const { data: feedback, error: feedbackError } = await supabase
      .from('feedback')
      .select('*')
      .limit(1);
    
    if (!feedbackError && feedback && feedback.length > 0) {
      console.log('\n✅ FEEDBACK TABLE STRUCTURE:');
      console.log('Columns:', Object.keys(feedback[0]).join(', '));
    }

    // Check RLS status
    const { data: rlsData, error: rlsError } = await supabase.rpc('check_rls_status');
    if (!rlsError && rlsData) {
      console.log('\n✅ RLS STATUS:', rlsData);
    }

    console.log('\n✅ Schema fetch complete!');
  } catch (error) {
    console.error('❌ Error fetching schema:', error.message);
  }
}

fetchSchema();
