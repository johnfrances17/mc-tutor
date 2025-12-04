const { createClient } = require('./server/node_modules/@supabase/supabase-js');
const bcrypt = require('./server/node_modules/bcryptjs');
require('./server/node_modules/dotenv').config({ path: './server/.env' });

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testCompleteFlow() {
  console.log('🧪 TESTING COMPLETE REGISTRATION → LOGIN FLOW\n');
  
  const testUser = {
    email: 'testflow@mabinicolleges.edu.ph',
    password: 'SimplePass123',
    school_id: 'FLOW001',
    full_name: 'Test Flow User',
    role: 'tutee',
    phone: '09123456789',
    year_level: '1st Year',
    course: 'BSIT'
  };

  // Cleanup
  console.log('🧹 Cleaning up old test user...');
  await supabaseAdmin.from('users').delete().eq('email', testUser.email);
  
  // REGISTRATION
  console.log('\n📝 STEP 1: REGISTRATION');
  console.log('='.repeat(70));
  console.log('Password:', testUser.password);
  console.log('Hashing with bcrypt (10 rounds)...');
  
  const hashedPassword = await bcrypt.hash(testUser.password, 10);
  console.log('Hash generated:', hashedPassword);
  
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
      status: 'active'
    })
    .select()
    .single();

  if (insertError) {
    console.error('❌ Registration failed:', insertError);
    return;
  }

  console.log('✅ User registered:', newUser.email);
  
  // LOGIN SIMULATION
  console.log('\n🔐 STEP 2: LOGIN SIMULATION');
  console.log('='.repeat(70));
  console.log('Fetching user from database...');
  
  const { data: loginUser, error: fetchError } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('email', testUser.email)
    .eq('status', 'active')
    .single();

  if (fetchError) {
    console.error('❌ User not found:', fetchError);
    return;
  }

  console.log('✅ User found');
  console.log('Stored hash:', loginUser.password);
  console.log('\nComparing password...');
  console.log('  Input password:', testUser.password);
  console.log('  Stored hash:', loginUser.password.substring(0, 20) + '...');
  
  const isValid = await bcrypt.compare(testUser.password, loginUser.password);
  console.log('  Result:', isValid ? '✅ MATCH' : '❌ NO MATCH');
  
  if (!isValid) {
    console.log('\n⚠️  PASSWORD MISMATCH - DEBUGGING...');
    
    // Try creating a fresh hash from the same password
    const freshHash = await bcrypt.hash(testUser.password, 10);
    console.log('Fresh hash:', freshHash);
    
    const freshValid = await bcrypt.compare(testUser.password, freshHash);
    console.log('Fresh hash valid:', freshValid ? 'YES' : 'NO');
    
    console.log('\nHashes are different (normal - different salts):');
    console.log('Original:', hashedPassword);
    console.log('Fresh:   ', freshHash);
    console.log('Match:', hashedPassword === freshHash ? 'YES' : 'NO (expected)');
  }

  // Cleanup
  console.log('\n🧹 Cleaning up...');
  await supabaseAdmin.from('users').delete().eq('email', testUser.email);
  
  console.log('\n' + '='.repeat(70));
  if (isValid) {
    console.log('✅ ✅ ✅ COMPLETE FLOW WORKS! ✅ ✅ ✅');
    console.log('Registration → Hash → Store → Fetch → Compare = SUCCESS');
  } else {
    console.log('❌ ❌ ❌ FLOW FAILED! ❌ ❌ ❌');
    console.log('There is a problem with password hashing/comparison');
  }
  console.log('='.repeat(70));
}

testCompleteFlow().catch(console.error);
