const { createClient } = require('./server/node_modules/@supabase/supabase-js');
const bcrypt = require('./server/node_modules/bcryptjs');
require('./server/node_modules/dotenv').config({ path: './server/.env' });

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function verifyBothAccounts() {
  console.log('🔍 VERIFYING ALL ACCOUNTS\n');
  console.log('='.repeat(70));

  const accounts = [
    {
      email: 'admin@mabinicolleges.edu.ph',
      password: 'admin123',
      name: 'Admin Account'
    },
    {
      email: 'johnfrancesmabeza@mabinicolleges.edu.ph',
      password: 'Test123!',
      name: 'Your Account'
    }
  ];

  for (const account of accounts) {
    console.log(`\n📋 Testing: ${account.name}`);
    console.log('-'.repeat(70));
    console.log(`Email: ${account.email}`);
    console.log(`Password: ${account.password}`);

    // Fetch user
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('email', account.email)
      .single();

    if (error || !user) {
      console.log(`❌ User not found`);
      continue;
    }

    console.log(`✅ User exists:`);
    console.log(`   - ID: ${user.user_id}`);
    console.log(`   - School ID: ${user.school_id}`);
    console.log(`   - Role: ${user.role}`);
    console.log(`   - Status: ${user.status}`);
    console.log(`   - Hash: ${user.password.substring(0, 20)}...`);

    // Test password
    const isValid = await bcrypt.compare(account.password, user.password);
    console.log(`   - Password: ${isValid ? '✅ VALID' : '❌ INVALID'}`);

    if (!isValid) {
      console.log(`\n   🔧 Fixing password...`);
      const newHash = await bcrypt.hash(account.password, 10);
      await supabaseAdmin
        .from('users')
        .update({ password: newHash })
        .eq('user_id', user.user_id);
      console.log(`   ✅ Password fixed!`);
    }
  }

  console.log('\n' + '='.repeat(70));
  console.log('✅ VERIFICATION COMPLETE\n');
  console.log('You can now login with EITHER account:');
  console.log('\n1️⃣ Admin Account:');
  console.log('   Email: admin@mabinicolleges.edu.ph');
  console.log('   Password: admin123');
  console.log('   URL: https://mc-tutor.vercel.app/html/admin-login.html');
  console.log('\n2️⃣ Your Account:');
  console.log('   Email: johnfrancesmabeza@mabinicolleges.edu.ph');
  console.log('   Password: Test123!');
  console.log('   URL: https://mc-tutor.vercel.app/html/login.html');
  console.log('\n' + '='.repeat(70));
}

verifyBothAccounts().catch(console.error);
