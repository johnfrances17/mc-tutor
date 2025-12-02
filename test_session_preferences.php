<?php
/**
 * Test file for Session Preferences Manager
 * Run this file to verify the system works correctly
 */

require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/main/shared/SessionPreferencesManager.php';

echo "<h2>Session Preferences Manager - Test Suite</h2>";
echo "<hr>";

$prefsManager = new SessionPreferencesManager();

// Test 1: Create preferences
echo "<h3>Test 1: Creating Preferences</h3>";
$test_tutor_id = 999;
$test_subject_id = 1;

$preferences = [
    'face-to-face' => [
        'available' => true,
        'location' => 'Library Room 101'
    ],
    'online' => [
        'available' => true,
        'meeting_link' => 'https://meet.google.com/test-link'
    ]
];

$result = $prefsManager->savePreferences($test_tutor_id, $test_subject_id, $preferences);
echo $result ? "✅ Preferences saved successfully<br>" : "❌ Failed to save preferences<br>";

// Test 2: Retrieve preferences
echo "<h3>Test 2: Retrieving Preferences</h3>";
$retrieved = $prefsManager->getPreferences($test_tutor_id, $test_subject_id);
echo "<pre>";
print_r($retrieved);
echo "</pre>";

// Test 3: Get available types
echo "<h3>Test 3: Getting Available Session Types</h3>";
$available = $prefsManager->getAvailableTypes($test_tutor_id, $test_subject_id);
echo "<pre>";
print_r($available);
echo "</pre>";

// Test 4: Check if preferences exist
echo "<h3>Test 4: Checking if Preferences Exist</h3>";
$exists = $prefsManager->hasPreferences($test_tutor_id, $test_subject_id);
echo $exists ? "✅ Preferences exist<br>" : "❌ Preferences don't exist<br>";

// Test 5: Get all preferences for tutor
echo "<h3>Test 5: Getting All Preferences for Tutor</h3>";
$all_prefs = $prefsManager->getAllPreferences($test_tutor_id);
echo "<pre>";
print_r($all_prefs);
echo "</pre>";

// Test 6: Update preferences (only online)
echo "<h3>Test 6: Updating Preferences (Online Only)</h3>";
$updated_preferences = [
    'face-to-face' => [
        'available' => false,
        'location' => ''
    ],
    'online' => [
        'available' => true,
        'meeting_link' => 'https://zoom.us/j/123456789'
    ]
];

$result = $prefsManager->savePreferences($test_tutor_id, $test_subject_id, $updated_preferences);
echo $result ? "✅ Preferences updated<br>" : "❌ Failed to update<br>";

$available_after_update = $prefsManager->getAvailableTypes($test_tutor_id, $test_subject_id);
echo "Available types after update:<br><pre>";
print_r($available_after_update);
echo "</pre>";

// Test 7: Delete preferences
echo "<h3>Test 7: Deleting Preferences</h3>";
$deleted = $prefsManager->deletePreferences($test_tutor_id, $test_subject_id);
echo $deleted ? "✅ Preferences deleted<br>" : "❌ Failed to delete<br>";

$exists_after_delete = $prefsManager->hasPreferences($test_tutor_id, $test_subject_id);
echo $exists_after_delete ? "❌ Preferences still exist<br>" : "✅ Preferences successfully removed<br>";

// Clean up test folder if empty
$test_dir = __DIR__ . '/main/shared/sessions/' . $test_tutor_id;
if (is_dir($test_dir) && count(scandir($test_dir)) == 2) { // Only . and ..
    rmdir($test_dir);
    echo "<br>✅ Test directory cleaned up<br>";
}

echo "<hr>";
echo "<h3>✅ All Tests Complete!</h3>";
echo "<p><a href='main/tutor/my_subjects.php'>Test in Tutor Panel</a> | ";
echo "<a href='main/student/find_tutors.php'>Test in Student Panel</a></p>";
?>
