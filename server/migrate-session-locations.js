/**
 * Migration Script: Update existing sessions with location data from tutor_subjects
 * 
 * This script copies physical_location and google_meet_link from tutor_subjects
 * to existing sessions that have NULL values.
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_KEY in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function migrateSessionLocations() {
  console.log('🚀 Starting session location migration...\n');

  try {
    // 1. Fetch all sessions with NULL location data
    console.log('📋 Fetching sessions with NULL location data...');
    const { data: sessions, error: sessionsError } = await supabase
      .from('sessions')
      .select('session_id, tutor_id, subject_id, physical_location, google_meet_link')
      .or('physical_location.is.null,google_meet_link.is.null');

    if (sessionsError) {
      throw new Error(`Failed to fetch sessions: ${sessionsError.message}`);
    }

    console.log(`✅ Found ${sessions.length} sessions to update\n`);

    if (sessions.length === 0) {
      console.log('✨ No sessions need updating!');
      return;
    }

    // 2. Update each session
    let updated = 0;
    let skipped = 0;
    let errors = 0;

    for (const session of sessions) {
      try {
        // Fetch tutor_subjects data for this session
        const { data: tutorSubject, error: tsError } = await supabase
          .from('tutor_subjects')
          .select('physical_location, google_meet_link')
          .eq('tutor_id', session.tutor_id)
          .eq('subject_id', session.subject_id)
          .single();

        if (tsError || !tutorSubject) {
          console.log(`⚠️  Session ${session.session_id}: No matching tutor_subject found`);
          skipped++;
          continue;
        }

        // Check if there's actually something to update
        const needsUpdate = 
          (!session.physical_location && tutorSubject.physical_location) ||
          (!session.google_meet_link && tutorSubject.google_meet_link);

        if (!needsUpdate) {
          skipped++;
          continue;
        }

        // Update the session
        const { error: updateError } = await supabase
          .from('sessions')
          .update({
            physical_location: tutorSubject.physical_location || session.physical_location,
            google_meet_link: tutorSubject.google_meet_link || session.google_meet_link,
          })
          .eq('session_id', session.session_id);

        if (updateError) {
          console.error(`❌ Session ${session.session_id}: ${updateError.message}`);
          errors++;
        } else {
          console.log(`✅ Session ${session.session_id}: Updated`);
          updated++;
        }

      } catch (err) {
        console.error(`❌ Session ${session.session_id}: ${err.message}`);
        errors++;
      }
    }

    // 3. Summary
    console.log('\n' + '='.repeat(50));
    console.log('📊 Migration Summary:');
    console.log(`   ✅ Updated: ${updated}`);
    console.log(`   ⏭️  Skipped: ${skipped}`);
    console.log(`   ❌ Errors: ${errors}`);
    console.log('='.repeat(50));

    if (updated > 0) {
      console.log('\n✨ Migration completed successfully!');
    } else {
      console.log('\n⚠️  No sessions were updated');
    }

  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    process.exit(1);
  }
}

// Run migration
migrateSessionLocations()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Fatal error:', err);
    process.exit(1);
  });
