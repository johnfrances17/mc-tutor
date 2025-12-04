/**
 * Test admin login and update password if needed
 */

require('dotenv').config({ path: './.env' });
const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function testAndFixAdminPassword() {
  try {
    console.log('🔍 Fetching admin account...');
    
    const { data: admin, error } = await supabase
      .from('users')
      .select('*')
      .eq('school_id', '000000')
      .single();

    if (error || !admin) {
      console.error('❌ Admin not found:', error);
      return;
    }

    console.log('✅ Admin found:');
    console.log('   Email:', admin.email);
    console.log('   Current hash:', admin.password);

    // Test current password
    console.log('\n🔐 Testing password "admin123"...');
    const isValid = await bcrypt.compare('admin123', admin.password);
    
    if (isValid) {
      console.log('✅ Password is correct! Login should work.');
      console.log('\n📝 Try logging in with:');
      console.log('   Email: admin@mabinicolleges.edu.ph');
      console.log('   Password: admin123');
      return;
    }

    console.log('❌ Password does not match!');
    console.log('🔧 Generating new hash and updating...');

    // Generate new hash
    const newHash = await bcrypt.hash('admin123', 10);
    console.log('   New hash:', newHash);

    // Update password
    const { error: updateError } = await supabase
      .from('users')
      .update({ password: newHash })
      .eq('school_id', '000000');

    if (updateError) {
      console.error('❌ Failed to update:', updateError);
      return;
    }

    console.log('✅ Password updated successfully!');
    console.log('\n📝 Now try logging in with:');
    console.log('   Email: admin@mabinicolleges.edu.ph');
    console.log('   Password: admin123');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testAndFixAdminPassword();
