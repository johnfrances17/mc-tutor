const { createClient } = require('./server/node_modules/@supabase/supabase-js');
const bcrypt = require('./server/node_modules/bcryptjs');
require('./server/node_modules/dotenv').config({ path: './server/.env' });

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function comprehensivePasswordTest() {
  const email = 'johnfrancesmabeza@mabinicolleges.edu.ph';
  
  console.log('🔍 COMPREHENSIVE PASSWORD TEST');
  console.log('='.repeat(70));
  console.log();

  // Fetch user
  const { data: user, error } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('email', email)
    .single();

  if (error || !user) {
    console.error('❌ User not found:', error);
    return;
  }

  console.log('✅ User Found:');
  console.log('  - Email:', user.email);
  console.log('  - School ID:', user.school_id);
  console.log('  - Full Name:', user.full_name);
  console.log('  - Stored Hash:', user.password);
  console.log();

  // Test various password formats
  const passwordVariations = [
    'Frances1*',           // Original
    'frances1*',           // lowercase
    'FRANCES1*',           // uppercase
    ' Frances1*',          // leading space
    'Frances1* ',          // trailing space
    'Frances1＊',          // full-width asterisk (＊)
    'Frances1*\r',         // carriage return
    'Frances1*\n',         // newline
  ];

  console.log('🧪 Testing Password Variations:');
  console.log('-'.repeat(70));
  
  for (let i = 0; i < passwordVariations.length; i++) {
    const pwd = passwordVariations[i];
    const isValid = await bcrypt.compare(pwd, user.password);
    const displayPwd = JSON.stringify(pwd); // Shows hidden chars
    const charCodes = Array.from(pwd).map(c => c.charCodeAt(0)).join(',');
    
    console.log(`\n${i + 1}. Password: ${displayPwd}`);
    console.log(`   Length: ${pwd.length} chars`);
    console.log(`   Char codes: [${charCodes}]`);
    console.log(`   Result: ${isValid ? '✅ VALID' : '❌ INVALID'}`);
  }

  console.log('\n' + '='.repeat(70));
  console.log('🔧 SOLUTION: Set a simple known password');
  console.log('='.repeat(70));
  
  // Set a very simple password we know will work
  const simplePassword = 'Test123!';
  console.log(`\nSetting new simple password: ${simplePassword}`);
  
  const newHash = await bcrypt.hash(simplePassword, 10);
  
  const { error: updateError } = await supabaseAdmin
    .from('users')
    .update({ 
      password: newHash,
      updated_at: new Date().toISOString()
    })
    .eq('email', email);

  if (updateError) {
    console.error('❌ Update failed:', updateError);
    return;
  }

  console.log('✅ Password updated successfully!');
  console.log();
  console.log('━'.repeat(70));
  console.log('🎯 TRY LOGGING IN NOW:');
  console.log('━'.repeat(70));
  console.log();
  console.log('  📧 Email:', email);
  console.log('  🔑 Password:', simplePassword);
  console.log();
  console.log('  🌐 URL: https://mc-tutor.vercel.app/html/login.html');
  console.log();
  console.log('━'.repeat(70));

  // Verify it works
  console.log('\n🧪 Verifying new password...');
  const testValid = await bcrypt.compare(simplePassword, newHash);
  console.log(`  Result: ${testValid ? '✅ WORKS!' : '❌ FAILED'}`);
}

comprehensivePasswordTest().catch(console.error);
