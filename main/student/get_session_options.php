<?php
require_once '../../config/database.php';
require_once '../shared/SessionPreferencesManager.php';

header('Content-Type: application/json');

// Check if user is logged in
if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'error' => 'Unauthorized']);
    exit();
}

$tutor_id = isset($_GET['tutor_id']) ? intval($_GET['tutor_id']) : 0;
$subject_id = isset($_GET['subject_id']) ? intval($_GET['subject_id']) : 0;

if (!$tutor_id || !$subject_id) {
    echo json_encode(['success' => false, 'error' => 'Missing parameters']);
    exit();
}

$prefsManager = new SessionPreferencesManager();
$options = $prefsManager->getAvailableTypes($tutor_id, $subject_id);

echo json_encode([
    'success' => true,
    'options' => $options,
    'tutor_id' => $tutor_id,
    'subject_id' => $subject_id
]);
