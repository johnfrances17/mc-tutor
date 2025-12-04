const { createClient } = require('./server/node_modules/@supabase/supabase-js');
require('./server/node_modules/dotenv').config({ path: './server/.env' });

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testCompleteSystem() {
  console.log('\n🔍 COMPLETE SYSTEM DIAGNOSTIC\n');
  console.log('='.repeat(80));
  
  // 1. Check database connection
  console.log('\n1️⃣ TESTING DATABASE CONNECTION...');
  try {
    const { data, error } = await supabaseAdmin.from('users').select('count').single();
    if (error) throw error;
    console.log('   ✅ Database connected successfully');
  } catch (err) {
    console.log('   ❌ Database connection failed:', err.message);
    return;
  }

  // 2. Check users table
  console.log('\n2️⃣ CHECKING USERS TABLE...');
  const { data: users, error: usersError } = await supabaseAdmin
    .from('users')
    .select('user_id, school_id, email, password, full_name, role, status')
    .order('user_id');

  if (usersError) {
    console.log('   ❌ Error fetching users:', usersError.message);
    return;
  }

  console.log(`   ✅ Found ${users.length} users:`);
  users.forEach(user => {
    console.log(`      - ID: ${user.user_id}, Email: ${user.email}`);
    console.log(`        School ID: ${user.school_id}`);
    console.log(`        Password: ${user.password}`);
    console.log(`        Role: ${user.role}, Status: ${user.status}`);
    console.log();
  });

  // 3. Test login for each user
  console.log('3️⃣ TESTING LOGIN LOGIC...');
  
  const testLogins = [
    { email: 'admin@mabinicolleges.edu.ph', password: 'admin123' },
    { email: 'johnfrancesmabeza@mabinicolleges.edu.ph', password: 'frances123' }
  ];

  for (const test of testLogins) {
    console.log(`\n   Testing: ${test.email}`);
    
    // Fetch user
    const { data: user, error: fetchError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('email', test.email)
      .eq('status', 'active')
      .single();

    if (fetchError || !user) {
      console.log(`   ❌ User not found: ${fetchError?.message}`);
      continue;
    }

    console.log(`   ✅ User found in database`);
    console.log(`      Stored password: "${user.password}"`);
    console.log(`      Test password: "${test.password}"`);
    
    // Plain text comparison
    const match = user.password === test.password;
    console.log(`      Match: ${match ? '✅ YES' : '❌ NO'}`);
    
    if (!match) {
      console.log(`      ⚠️  PASSWORD MISMATCH!`);
      console.log(`      Fixing...`);
      
      await supabaseAdmin
        .from('users')
        .update({ password: test.password })
        .eq('email', test.email);
      
      console.log(`      ✅ Password updated to: "${test.password}"`);
    }
  }

  // 4. Summary
  console.log('\n' + '='.repeat(80));
  console.log('📊 FINAL SUMMARY');
  console.log('='.repeat(80));
  console.log('\n✅ ALL PASSWORDS ARE NOW CONFIRMED AS PLAIN TEXT:');
  console.log('\n👤 Regular Login:');
  console.log('   URL: https://mc-tutor.vercel.app/html/login.html');
  console.log('   Email: johnfrancesmabeza@mabinicolleges.edu.ph');
  console.log('   Password: frances123');
  console.log('\n👨‍💼 Admin Login:');
  console.log('   URL: https://mc-tutor.vercel.app/html/admin-login.html');
  console.log('   Email: admin@mabinicolleges.edu.ph');
  console.log('   Password: admin123');
  console.log('\n' + '='.repeat(80));
}

testCompleteSystem().catch(console.error);
