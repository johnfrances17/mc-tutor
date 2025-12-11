/**
 * Verify and create Supabase Storage buckets
 * Run: node scripts/verify-supabase-buckets.js
 */
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Need service role to create buckets

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyBuckets() {
  console.log('\n=== SUPABASE STORAGE VERIFICATION ===\n');
  
  const bucketsToCheck = [
    { name: 'avatars', public: true },
    { name: 'materials', public: true }
  ];

  for (const bucketConfig of bucketsToCheck) {
    console.log(`\n📦 Checking bucket: ${bucketConfig.name}`);
    
    // Check if bucket exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('❌ Error listing buckets:', listError.message);
      continue;
    }

    const bucket = buckets.find(b => b.name === bucketConfig.name);
    
    if (!bucket) {
      console.log(`⚠️  Bucket "${bucketConfig.name}" does not exist!`);
      console.log(`🔧 Creating bucket...`);
      
      // Create the bucket
      const { data: newBucket, error: createError } = await supabase.storage.createBucket(
        bucketConfig.name,
        { public: bucketConfig.public }
      );
      
      if (createError) {
        console.error(`❌ Failed to create bucket:`, createError.message);
        console.log(`\n💡 Manual steps:`);
        console.log(`   1. Go to: ${supabaseUrl.replace('//', '//')}/project/_/storage/buckets`);
        console.log(`   2. Click "New bucket"`);
        console.log(`   3. Name: ${bucketConfig.name}`);
        console.log(`   4. Make it PUBLIC ✅`);
        console.log(`   5. Click "Create bucket"\n`);
      } else {
        console.log(`✅ Bucket "${bucketConfig.name}" created successfully!`);
      }
    } else {
      console.log(`✅ Bucket "${bucketConfig.name}" exists`);
      console.log(`   - Public: ${bucket.public ? '✅ YES' : '❌ NO (MUST BE PUBLIC!)'}`);
      console.log(`   - ID: ${bucket.id}`);
      
      if (!bucket.public) {
        console.log(`\n⚠️  Bucket is PRIVATE! This will cause uploads to fail!`);
        console.log(`\n💡 To fix:`);
        console.log(`   1. Go to: ${supabaseUrl}/project/_/storage/buckets/${bucketConfig.name}`);
        console.log(`   2. Click bucket settings`);
        console.log(`   3. Toggle "Public bucket" to ON`);
        console.log(`   4. Save changes\n`);
      }
    }
  }

  // Test upload
  console.log('\n=== TESTING UPLOAD ===\n');
  
  const testFile = Buffer.from('Test file content');
  const testPath = `test_${Date.now()}.txt`;
  
  console.log('📤 Uploading test file to avatars bucket...');
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(`test/${testPath}`, testFile, {
      contentType: 'text/plain'
    });
  
  if (uploadError) {
    console.error('❌ Upload test FAILED:', uploadError.message);
    console.log('\n🔍 Common issues:');
    console.log('   - Bucket does not exist');
    console.log('   - Bucket is private (must be PUBLIC)');
    console.log('   - Invalid Supabase keys');
    console.log('   - Storage quota exceeded');
  } else {
    console.log('✅ Upload test PASSED!');
    
    // Get public URL
    const { data: urlData } = supabase.storage
      .from('avatars')
      .getPublicUrl(`test/${testPath}`);
    
    console.log('📍 Public URL:', urlData.publicUrl);
    
    // Clean up test file
    await supabase.storage.from('avatars').remove([`test/${testPath}`]);
    console.log('🗑️  Test file cleaned up');
  }

  console.log('\n=== VERIFICATION COMPLETE ===\n');
}

verifyBuckets().catch(console.error);
