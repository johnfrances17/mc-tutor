const { createClient } = require('./server/node_modules/@supabase/supabase-js');
const bcrypt = require('./server/node_modules/bcryptjs');
require('./server/node_modules/dotenv').config({ path: './server/.env' });

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function resetUserPassword() {
  const email = 'johnfrancesmabeza@mabinicolleges.edu.ph';
  const newPassword = 'Frances1*';

  console.log('🔧 Resetting password for:', email);
  console.log('New password:', newPassword);
  console.log();

  // Generate fresh hash
  console.log('1️⃣ Generating bcrypt hash (10 rounds)...');
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  console.log('   Hash generated:', hashedPassword);

  // Update in database
  console.log('\n2️⃣ Updating database...');
  const { data, error } = await supabaseAdmin
    .from('users')
    .update({ 
      password: hashedPassword,
      updated_at: new Date().toISOString()
    })
    .eq('email', email)
    .select();

  if (error) {
    console.error('❌ Error:', error);
    return;
  }

  console.log('✅ Password updated successfully!');
  console.log('   User:', data[0].full_name);
  console.log('   Email:', data[0].email);
  console.log('   School ID:', data[0].school_id);

  // Verify the hash works
  console.log('\n3️⃣ Verifying password...');
  const isValid = await bcrypt.compare(newPassword, hashedPassword);
  console.log('   Verification:', isValid ? '✅ VALID' : '❌ INVALID');

  console.log('\n✅ Done! You can now login with:');
  console.log('   Email:', email);
  console.log('   Password:', newPassword);
  console.log('\n🌐 Try logging in at: https://mc-tutor.vercel.app/html/login.html');
}

resetUserPassword().catch(console.error);
