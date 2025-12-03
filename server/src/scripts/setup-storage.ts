import { StorageService } from '../services/StorageService';

/**
 * Setup script to initialize Supabase Storage buckets
 * Run this once after setting up the Supabase project
 * 
 * Usage: npm run setup:storage
 * or: npx ts-node src/scripts/setup-storage.ts
 */

async function setupStorage() {
  console.log('🚀 Setting up Supabase Storage buckets...\n');
  
  try {
    const storageService = StorageService.getInstance();
    
    console.log('Creating buckets with RLS policies...');
    await storageService.createBuckets();
    
    console.log('\n✅ Storage setup completed successfully!');
    console.log('\nBuckets created:');
    console.log('  - profile-pictures (public): For user profile images');
    console.log('  - study-materials (private): For tutor study materials');
    console.log('\nStorage configuration:');
    console.log('  - Profile pictures: Max 2MB, images only');
    console.log('  - Study materials: Max 10MB, documents/archives');
    console.log('\nNext steps:');
    console.log('  1. Test profile picture upload: POST /api/users/profile-picture');
    console.log('  2. Test material upload: POST /api/materials');
    console.log('  3. Verify files appear in Supabase Storage dashboard');
    console.log('\n📚 See SUPABASE_STORAGE_SETUP.md for detailed configuration');
  } catch (error) {
    console.error('\n❌ Setup error:', error);
    console.log('\nTroubleshooting:');
    console.log('  1. Check SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env');
    console.log('  2. Verify you have admin/service role key (not anon key)');
    console.log('  3. Check Supabase project is active and accessible');
    console.log('  4. See SUPABASE_STORAGE_SETUP.md for manual bucket creation');
    console.log('\nThe system will fall back to local filesystem storage.');
    console.log('Files will be saved to: ../uploads/profiles and ../uploads/study_materials');
    process.exit(1);
  }
}

// Run setup
setupStorage();
