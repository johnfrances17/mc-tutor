const { createClient } = require('./server/node_modules/@supabase/supabase-js');
require('./server/node_modules/dotenv').config({ path: './server/.env' });

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function fixPasswords() {
  console.log('🔧 FIXING PASSWORDS TO MATCH DATABASE\n');
  console.log('Based on Supabase screenshot, current passwords are:');
  console.log('  Admin: admin123');
  console.log('  Your account: frances123');
  console.log();
  console.log('Setting to simple passwords...\n');

  // Update your account
  const { error1 } = await supabaseAdmin
    .from('users')
    .update({ password: 'frances123' })
    .eq('email', 'johnfrancesmabeza@mabinicolleges.edu.ph');

  if (error1) {
    console.error('❌ Failed to update your account:', error1);
  } else {
    console.log('✅ Your account updated');
  }

  // Update admin
  const { error2 } = await supabaseAdmin
    .from('users')
    .update({ password: 'admin123' })
    .eq('email', 'admin@mabinicolleges.edu.ph');

  if (error2) {
    console.error('❌ Failed to update admin:', error2);
  } else {
    console.log('✅ Admin account updated');
  }

  console.log('\n' + '='.repeat(70));
  console.log('✅ PASSWORDS CONFIRMED');
  console.log('='.repeat(70));
  console.log();
  console.log('🔐 LOGIN CREDENTIALS:');
  console.log();
  console.log('👤 Your Account:');
  console.log('   Email: johnfrancesmabeza@mabinicolleges.edu.ph');
  console.log('   Password: frances123');
  console.log('   URL: https://mc-tutor.vercel.app/html/login.html');
  console.log();
  console.log('👨‍💼 Admin Account:');
  console.log('   Email: admin@mabinicolleges.edu.ph');
  console.log('   Password: admin123');
  console.log('   URL: https://mc-tutor.vercel.app/html/admin-login.html');
  console.log();
  console.log('='.repeat(70));
  console.log('⚠️  TYPE EXACTLY AS SHOWN - NO EXTRA SPACES OR CHARACTERS');
  console.log('='.repeat(70));
}

fixPasswords().catch(console.error);
