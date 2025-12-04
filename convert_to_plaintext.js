const { createClient } = require('./server/node_modules/@supabase/supabase-js');
require('./server/node_modules/dotenv').config({ path: './server/.env' });

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function convertToPlainText() {
  console.log('⚠️  CONVERTING ALL PASSWORDS TO PLAIN TEXT');
  console.log('⚠️  WARNING: THIS IS NOT SECURE!');
  console.log('='.repeat(70));
  console.log();

  const users = [
    {
      email: 'admin@mabinicolleges.edu.ph',
      password: 'admin123'
    },
    {
      email: 'johnfrancesmabeza@mabinicolleges.edu.ph',
      password: 'Test123!'
    }
  ];

  for (const user of users) {
    console.log(`📝 Updating: ${user.email}`);
    console.log(`   Password: ${user.password}`);
    
    const { error } = await supabaseAdmin
      .from('users')
      .update({ 
        password: user.password,
        updated_at: new Date().toISOString()
      })
      .eq('email', user.email);

    if (error) {
      console.error(`   ❌ Failed:`, error.message);
    } else {
      console.log(`   ✅ Updated to plain text`);
    }
    console.log();
  }

  console.log('='.repeat(70));
  console.log('✅ ALL PASSWORDS CONVERTED TO PLAIN TEXT');
  console.log();
  console.log('You can now login with:');
  console.log();
  console.log('1️⃣ Admin:');
  console.log('   Email: admin@mabinicolleges.edu.ph');
  console.log('   Password: admin123');
  console.log();
  console.log('2️⃣ Your account:');
  console.log('   Email: johnfrancesmabeza@mabinicolleges.edu.ph');
  console.log('   Password: Test123!');
  console.log();
  console.log('='.repeat(70));
}

convertToPlainText().catch(console.error);
