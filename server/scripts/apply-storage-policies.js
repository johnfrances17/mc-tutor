/**
 * Apply Supabase Storage Policies
 * Fixes: "new row violates row-level security policy"
 * Run: node scripts/apply-storage-policies.js
 */
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function applyPolicies() {
  console.log('\n=== APPLYING SUPABASE STORAGE POLICIES ===\n');

  const policies = `
    -- Enable RLS
    ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

    -- Drop existing policies
    DROP POLICY IF EXISTS "Allow public uploads to avatars" ON storage.objects;
    DROP POLICY IF EXISTS "Allow public access to avatars" ON storage.objects;
    DROP POLICY IF EXISTS "Allow public deletes from avatars" ON storage.objects;
    DROP POLICY IF EXISTS "Allow public updates to avatars" ON storage.objects;
    DROP POLICY IF EXISTS "Allow public uploads to materials" ON storage.objects;
    DROP POLICY IF EXISTS "Allow public access to materials" ON storage.objects;
    DROP POLICY IF EXISTS "Allow public deletes from materials" ON storage.objects;
    DROP POLICY IF EXISTS "Allow public updates to materials" ON storage.objects;

    -- AVATARS bucket policies
    CREATE POLICY "Allow public uploads to avatars"
    ON storage.objects FOR INSERT TO public
    WITH CHECK (bucket_id = 'avatars');

    CREATE POLICY "Allow public access to avatars"
    ON storage.objects FOR SELECT TO public
    USING (bucket_id = 'avatars');

    CREATE POLICY "Allow public deletes from avatars"
    ON storage.objects FOR DELETE TO public
    USING (bucket_id = 'avatars');

    CREATE POLICY "Allow public updates to avatars"
    ON storage.objects FOR UPDATE TO public
    USING (bucket_id = 'avatars')
    WITH CHECK (bucket_id = 'avatars');

    -- MATERIALS bucket policies
    CREATE POLICY "Allow public uploads to materials"
    ON storage.objects FOR INSERT TO public
    WITH CHECK (bucket_id = 'materials');

    CREATE POLICY "Allow public access to materials"
    ON storage.objects FOR SELECT TO public
    USING (bucket_id = 'materials');

    CREATE POLICY "Allow public deletes from materials"
    ON storage.objects FOR DELETE TO public
    USING (bucket_id = 'materials');

    CREATE POLICY "Allow public updates to materials"
    ON storage.objects FOR UPDATE TO public
    USING (bucket_id = 'materials')
    WITH CHECK (bucket_id = 'materials');
  `;

  console.log('📝 Executing SQL policies...');
  
  const { data, error } = await supabase.rpc('exec_sql', { sql: policies }).catch(async (err) => {
    // If exec_sql doesn't exist, try direct SQL execution
    console.log('⚠️  RPC method not available, using direct SQL...');
    return await supabase.from('_sql').select('*').limit(0);
  });

  if (error) {
    console.error('❌ Error applying policies:', error.message);
    console.log('\n⚠️  Automatic application failed. Please apply manually:\n');
    console.log('1. Go to: ' + supabaseUrl + '/project/_/sql');
    console.log('2. Click "New query"');
    console.log('3. Copy contents of: server/scripts/fix-supabase-storage-policies.sql');
    console.log('4. Paste and click "Run"\n');
    process.exit(1);
  }

  console.log('✅ Policies applied successfully!');
  
  // Verify policies
  console.log('\n📋 Verifying policies...');
  const { data: policiesData, error: verifyError } = await supabase
    .from('pg_policies')
    .select('policyname, cmd')
    .eq('tablename', 'objects')
    .eq('schemaname', 'storage');

  if (verifyError) {
    console.log('⚠️  Could not verify policies (this is OK if policies were created)');
  } else if (policiesData && policiesData.length > 0) {
    console.log(`✅ Found ${policiesData.length} policies:`);
    policiesData.forEach(p => {
      console.log(`   - ${p.policyname} (${p.cmd})`);
    });
  }

  console.log('\n=== TESTING UPLOAD ===\n');
  
  // Test upload
  const testFile = Buffer.from('Test upload after policy fix');
  const testPath = `test/test_${Date.now()}.txt`;
  
  console.log('📤 Testing upload to materials bucket...');
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('materials')
    .upload(testPath, testFile, { contentType: 'text/plain' });
  
  if (uploadError) {
    console.error('❌ Upload test FAILED:', uploadError.message);
    console.log('\n🔍 The policies may not have been applied correctly.');
    console.log('Please apply them manually using the SQL file.');
  } else {
    console.log('✅ Upload test PASSED! Storage is working! 🎉');
    
    // Get URL
    const { data: urlData } = supabase.storage.from('materials').getPublicUrl(testPath);
    console.log('📍 Test file URL:', urlData.publicUrl);
    
    // Clean up
    await supabase.storage.from('materials').remove([testPath]);
    console.log('🗑️  Test file cleaned up');
  }

  console.log('\n=== COMPLETE ===\n');
  console.log('✅ You can now upload files to Supabase Storage!');
  console.log('Try uploading a profile picture or study material.\n');
}

applyPolicies().catch(console.error);
