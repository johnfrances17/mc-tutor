const { createClient } = require('./server/node_modules/@supabase/supabase-js');
const bcrypt = require('./server/node_modules/bcryptjs');
require('./server/node_modules/dotenv').config({ path: './server/.env' });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testLogin() {
  const testEmail = 'johnfrancesmabeza@mabinicolleges.edu.ph';
  const testPassword = 'Frances1*';

  console.log('🔍 Testing Login Debug...\n');
  console.log('Email:', testEmail);
  console.log('Password:', testPassword);
  console.log('---\n');

  // 1. Fetch user from database
  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', testEmail)
    .eq('status', 'active')
    .single();

  if (error || !user) {
    console.error('❌ User not found in database');
    console.error('Error:', error);
    return;
  }

  console.log('✅ User found in database:');
  console.log('  - user_id:', user.user_id);
  console.log('  - school_id:', user.school_id);
  console.log('  - email:', user.email);
  console.log('  - full_name:', user.full_name);
  console.log('  - role:', user.role);
  console.log('  - status:', user.status);
  console.log('  - password hash:', user.password);
  console.log('---\n');

  // 2. Test password comparison
  console.log('🔐 Testing password comparison...');
  
  const isValid = await bcrypt.compare(testPassword, user.password);
  console.log('  - bcrypt.compare result:', isValid);
  
  // 3. Test hash generation with same password
  console.log('\n🔨 Testing hash generation with same password...');
  const newHash = await bcrypt.hash(testPassword, 10);
  console.log('  - New hash:', newHash);
  const newHashValid = await bcrypt.compare(testPassword, newHash);
  console.log('  - New hash validates:', newHashValid);

  // 4. Check if stored hash is valid bcrypt format
  console.log('\n🔍 Checking stored hash format...');
  const bcryptRegex = /^\$2[ayb]\$.{56}$/;
  const isValidFormat = bcryptRegex.test(user.password);
  console.log('  - Is valid bcrypt format:', isValidFormat);
  console.log('  - Hash length:', user.password.length);
  console.log('  - Hash prefix:', user.password.substring(0, 4));

  if (!isValid) {
    console.log('\n❌ PASSWORD MISMATCH DETECTED!');
    console.log('Possible causes:');
    console.log('  1. Password was hashed differently during registration');
    console.log('  2. Database contains plain text or wrong hash');
    console.log('  3. Different bcrypt rounds used');
    
    console.log('\n🔧 Attempting to fix by updating hash...');
    const correctHash = await bcrypt.hash(testPassword, 10);
    
    const { error: updateError } = await supabase
      .from('users')
      .update({ password: correctHash })
      .eq('email', testEmail);
    
    if (updateError) {
      console.error('❌ Failed to update:', updateError);
    } else {
      console.log('✅ Password hash updated successfully');
      console.log('Try logging in again now!');
    }
  } else {
    console.log('\n✅ PASSWORD VALIDATION SUCCESSFUL!');
    console.log('Login should work correctly.');
  }
}

testLogin().catch(console.error);
