/**
 * Quick script to create admin account directly
 * Run with: node create_admin.js
 */

require('dotenv').config({ path: './.env' });
const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials');
  console.error('SUPABASE_URL:', supabaseUrl ? 'Found' : 'Missing');
  console.error('SUPABASE_KEY:', supabaseKey ? 'Found' : 'Missing');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function createAdmin() {
  try {
    console.log('🔍 Checking for existing admin account...');
    
    // Check if admin exists
    const { data: existing, error: checkError } = await supabase
      .from('users')
      .select('*')
      .eq('school_id', '000000')
      .maybeSingle();

    if (existing) {
      console.log('✅ Admin account already exists!');
      console.log('📋 Details:');
      console.log('   School ID:', existing.school_id);
      console.log('   Email:', existing.email);
      console.log('   Full Name:', existing.full_name);
      console.log('   Role:', existing.role);
      console.log('   Status:', existing.status);
      console.log('\n🔑 Try logging in with:');
      console.log('   Email: admin@mabinicolleges.edu.ph');
      console.log('   Password: admin123');
      return;
    }

    console.log('📝 Creating new admin account...');
    
    // Hash password
    const hashedPassword = await bcrypt.hash('admin123', 10);
    console.log('🔐 Password hashed:', hashedPassword);

    // Insert admin
    const { data: newAdmin, error: insertError } = await supabase
      .from('users')
      .insert({
        school_id: '000000',
        email: 'admin@mabinicolleges.edu.ph',
        password: hashedPassword,
        full_name: 'System Administrator',
        role: 'admin',
        phone: null,
        year_level: null,
        course: null,
        status: 'active',
      })
      .select()
      .single();

    if (insertError) {
      console.error('❌ Failed to create admin:', insertError);
      return;
    }

    console.log('✅ Admin account created successfully!');
    console.log('📋 Details:');
    console.log('   School ID: 000000');
    console.log('   Email: admin@mabinicolleges.edu.ph');
    console.log('   Password: admin123');
    console.log('   Full Name:', newAdmin.full_name);
    console.log('\n⚠️  Please change the password after first login!');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

createAdmin();
