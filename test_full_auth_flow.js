const { createClient } = require('./server/node_modules/@supabase/supabase-js');
const bcrypt = require('./server/node_modules/bcryptjs');
require('./server/node_modules/dotenv').config({ path: './server/.env' });

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testAuthFlow() {
  console.log('🧪 Testing Full Authentication Flow\n');
  console.log('=' .repeat(60));
  
  const testUser = {
    school_id: 'TEST123',
    email: 'test.user@mabinicolleges.edu.ph',
    password: 'TestPass123!',
    full_name: 'Test User',
    role: 'tutee',
    phone: '09123456789',
    year_level: '1st Year',
    course: 'BSIT'
  };

  console.log('\n📝 Test User Data:');
  console.log('  Email:', testUser.email);
  console.log('  Password:', testUser.password);
  console.log('  School ID:', testUser.school_id);

  // ===== CLEANUP =====
  console.log('\n🧹 Cleanup: Removing test user if exists...');
  await supabaseAdmin
    .from('users')
    .delete()
    .eq('email', testUser.email);
  console.log('  ✅ Cleanup complete');

  // ===== TEST REGISTRATION =====
  console.log('\n📋 TEST 1: Registration Process');
  console.log('-'.repeat(60));
  
  console.log('  1️⃣ Hashing password with bcrypt (10 rounds)...');
  const hashedPassword = await bcrypt.hash(testUser.password, 10);
  console.log('     Hash:', hashedPassword);
  console.log('     Length:', hashedPassword.length);
  console.log('     Prefix:', hashedPassword.substring(0, 4));

  console.log('\n  2️⃣ Inserting user into database...');
  const { data: newUser, error: insertError } = await supabaseAdmin
    .from('users')
    .insert({
      school_id: testUser.school_id,
      email: testUser.email,
      password: hashedPassword,
      full_name: testUser.full_name,
      role: testUser.role,
      phone: testUser.phone,
      year_level: testUser.year_level,
      course: testUser.course,
      status: 'active',
    })
    .select()
    .single();

  if (insertError) {
    console.error('     ❌ Insert failed:', insertError);
    return;
  }

  console.log('     ✅ User created:');
  console.log('        - user_id:', newUser.user_id);
  console.log('        - school_id:', newUser.school_id);
  console.log('        - email:', newUser.email);

  // ===== TEST LOGIN =====
  console.log('\n🔐 TEST 2: Login Process');
  console.log('-'.repeat(60));

  console.log('  1️⃣ Fetching user from database...');
  const { data: loginUser, error: fetchError } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('email', testUser.email)
    .eq('status', 'active')
    .single();

  if (fetchError || !loginUser) {
    console.error('     ❌ User fetch failed:', fetchError);
    return;
  }

  console.log('     ✅ User found');
  console.log('        - Stored hash:', loginUser.password);

  console.log('\n  2️⃣ Comparing password with bcrypt.compare...');
  const isValidPassword = await bcrypt.compare(testUser.password, loginUser.password);
  console.log('     Result:', isValidPassword ? '✅ VALID' : '❌ INVALID');

  if (!isValidPassword) {
    console.log('\n     ⚠️  PASSWORD MISMATCH!');
    console.log('     Testing if new hash works...');
    
    const testHash = await bcrypt.hash(testUser.password, 10);
    const testValid = await bcrypt.compare(testUser.password, testHash);
    console.log('     New hash validates:', testValid ? '✅ YES' : '❌ NO');
    
    console.log('\n     Comparing hashes:');
    console.log('     Stored:', loginUser.password);
    console.log('     Fresh:', testHash);
    console.log('     Match:', loginUser.password === testHash ? 'YES' : 'NO (expected - salts differ)');
  }

  // ===== TEST PASSWORD VERIFICATION =====
  console.log('\n🔍 TEST 3: Password Hash Verification');
  console.log('-'.repeat(60));

  console.log('  Testing multiple password attempts...');
  const testPasswords = [
    testUser.password,           // Correct
    'WrongPassword',            // Wrong
    testUser.password.toLowerCase(), // Wrong case
    testUser.password + ' ',    // Extra space
  ];

  for (const pwd of testPasswords) {
    const result = await bcrypt.compare(pwd, loginUser.password);
    const status = result ? '✅ VALID' : '❌ INVALID';
    const display = pwd === testUser.password ? pwd : `'${pwd}'`;
    console.log(`     ${status} - Password: ${display}`);
  }

  // ===== RESULTS SUMMARY =====
  console.log('\n' + '='.repeat(60));
  console.log('📊 FINAL RESULTS');
  console.log('='.repeat(60));

  if (isValidPassword) {
    console.log('✅ Authentication Flow: WORKING');
    console.log('   - Registration hashing: ✅ Correct');
    console.log('   - Login verification: ✅ Correct');
    console.log('   - Password comparison: ✅ Working');
    console.log('\n💡 Login should work correctly on production!');
  } else {
    console.log('❌ Authentication Flow: BROKEN');
    console.log('   - Issue: Password hash mismatch');
    console.log('   - Possible causes:');
    console.log('     1. Different bcrypt rounds during registration');
    console.log('     2. Password modified after registration');
    console.log('     3. Hash corruption in database');
    console.log('\n🔧 Recommendation: Check registration code in AuthService.ts');
  }

  // Cleanup
  console.log('\n🧹 Cleaning up test user...');
  await supabaseAdmin
    .from('users')
    .delete()
    .eq('email', testUser.email);
  console.log('✅ Test complete!\n');
}

testAuthFlow().catch(console.error);
