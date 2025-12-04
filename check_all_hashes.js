const { createClient } = require('./server/node_modules/@supabase/supabase-js');
const bcrypt = require('./server/node_modules/bcryptjs');
require('./server/node_modules/dotenv').config({ path: './server/.env' });

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkAllPasswordHashes() {
  console.log('🔍 Checking all user password hashes...\n');

  const { data: users, error } = await supabaseAdmin
    .from('users')
    .select('user_id, school_id, email, full_name, password, role')
    .order('user_id');

  if (error) {
    console.error('Error fetching users:', error);
    return;
  }

  console.log(`Found ${users.length} users:\n`);

  const bcryptRegex = /^\$2[ayb]\$.{56}$/;
  let validCount = 0;
  let invalidCount = 0;

  for (const user of users) {
    const isValidFormat = bcryptRegex.test(user.password);
    const status = isValidFormat ? '✅' : '❌';
    
    console.log(`${status} User ID ${user.user_id}: ${user.email}`);
    console.log(`   Name: ${user.full_name}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   School ID: ${user.school_id}`);
    console.log(`   Hash: ${user.password.substring(0, 20)}...`);
    console.log(`   Format: ${isValidFormat ? 'Valid bcrypt' : 'INVALID!'}`);
    console.log(`   Length: ${user.password.length}`);
    console.log();

    if (isValidFormat) {
      validCount++;
    } else {
      invalidCount++;
    }
  }

  console.log('='.repeat(60));
  console.log('📊 Summary:');
  console.log(`   ✅ Valid hashes: ${validCount}`);
  console.log(`   ❌ Invalid hashes: ${invalidCount}`);
  console.log(`   📝 Total users: ${users.length}`);
  
  if (invalidCount > 0) {
    console.log('\n⚠️  WARNING: Some users have invalid password hashes!');
    console.log('   They will not be able to log in.');
    console.log('   Contact them to reset their passwords.');
  } else {
    console.log('\n✅ All password hashes are valid!');
  }
}

checkAllPasswordHashes().catch(console.error);
