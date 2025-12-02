<?php
require_once '../../config/database.php';
require_once '../shared/SessionPreferencesManager.php';

// Check if user is logged in and is student/tutee
if (!isset($_SESSION['user_id']) || $_SESSION['role'] != 'tutee') {
    header('Location: ../../index.php');
    exit();
}

$user_id = $_SESSION['user_id'];
$tutor_id = isset($_GET['tutor_id']) ? intval($_GET['tutor_id']) : 0;

$success = '';
$error = '';

$prefsManager = new SessionPreferencesManager();

// Get tutor information
$tutor_sql = "SELECT u.*, 
              GROUP_CONCAT(DISTINCT s.subject_id SEPARATOR ',') as subject_ids,
              GROUP_CONCAT(DISTINCT CONCAT(s.subject_code, ' - ', s.subject_name) SEPARATOR '|') as subjects_list
              FROM users u
              JOIN tutor_subjects ts ON u.user_id = ts.tutor_id
              JOIN subjects s ON ts.subject_id = s.subject_id
              WHERE u.user_id = $tutor_id AND u.role = 'tutor'
              GROUP BY u.user_id";
$tutor_result = $conn->query($tutor_sql);

if ($tutor_result->num_rows == 0) {
    header('Location: find_tutors.php');
    exit();
}

$tutor = $tutor_result->fetch_assoc();

// Handle booking submission
if ($_SERVER['REQUEST_METHOD'] == 'POST' && isset($_POST['book_session'])) {
    $subject_id = intval($_POST['subject_id']);
    $session_date = mysqli_real_escape_string($conn, $_POST['session_date']);
    $start_time = mysqli_real_escape_string($conn, $_POST['start_time']);
    // Use 24-hour format if provided by JavaScript
    $end_time = isset($_POST['end_time_24']) ? mysqli_real_escape_string($conn, $_POST['end_time_24']) : mysqli_real_escape_string($conn, $_POST['end_time']);
    $session_type = mysqli_real_escape_string($conn, $_POST['session_type']);
    $notes = mysqli_real_escape_string($conn, $_POST['notes']);
    
    // Get location from tutor's preferences
    $tutor_prefs = $prefsManager->getPreferences($tutor_id, $subject_id);
    $location = '';
    
    if ($session_type == 'face-to-face' && isset($tutor_prefs['preferences']['face-to-face'])) {
        $location = $tutor_prefs['preferences']['face-to-face']['location'];
    } elseif ($session_type == 'online' && isset($tutor_prefs['preferences']['online'])) {
        $location = $tutor_prefs['preferences']['online']['meeting_link'];
    }
    
    // Validate date is not in the past
    if (strtotime($session_date) < strtotime(date('Y-m-d'))) {
        $error = 'Cannot book sessions in the past';
    } elseif (empty($location)) {
        $error = 'Tutor has not set up availability for this session type';
    } else {
        $sql = "INSERT INTO sessions (tutor_id, tutee_id, subject_id, session_date, start_time, end_time, session_type, location, notes, status) 
                VALUES ($tutor_id, $user_id, $subject_id, '$session_date', '$start_time', '$end_time', '$session_type', '$location', '$notes', 'pending')";
        
        if ($conn->query($sql) === TRUE) {
            // Create notification for tutor
            $conn->query("INSERT INTO notifications (user_id, message, type) 
                         VALUES ($tutor_id, 'New session request from {$_SESSION['full_name']}', 'session_request')");
            
            $success = 'Session booking request submitted successfully! The tutor will confirm your request.';
            header('refresh:3;url=my_sessions.php');
        } else {
            $error = 'Error booking session: ' . $conn->error;
        }
    }
}

// Get tutor's subjects as array
$subject_ids = explode(',', $tutor['subject_ids']);
$subjects_list = explode('|', $tutor['subjects_list']);
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Book Session - MC Tutor</title>
    <link rel="stylesheet" href="../../assets/css/style.php">
</head>
<body>
    <header>
        <div class="header-content">
            <div class="logo">
                <h1>MC Tutor - Student Panel</h1>
                <p>Cloud-Based Peer Tutoring Platform</p>
            </div>
            <div class="user-info">
                <span>Welcome, <?php echo $_SESSION['full_name']; ?></span>
                <a href="../profile.php" class="logout-btn" style="background-color: #667eea; margin-right: 10px;">Profile</a>
                <a href="dashboard.php" class="logout-btn" style="background-color: #28a745; margin-right: 10px;">Dashboard</a>
                <a href="../logout.php" class="logout-btn">Logout</a>
            </div>
        </div>
    </header>

    <div class="container">
        <?php 
        require_once '../../assets/includes/nav_menu.php';
        render_nav_menu('tutee', 'find_tutors.php');
        ?>

        <?php if ($success): ?>
            <div class="alert alert-success"><?php echo $success; ?></div>
        <?php endif; ?>

        <?php if ($error): ?>
            <div class="alert alert-danger"><?php echo $error; ?></div>
        <?php endif; ?>

        <div class="card">
            <h2>Book Session with <?php echo $tutor['full_name']; ?></h2>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
                <h3>Tutor Information</h3>
                <p><strong>Name:</strong> <?php echo $tutor['full_name']; ?></p>
                <p><strong>Course:</strong> <?php echo $tutor['course']; ?> - <?php echo $tutor['year_level']; ?></p>
                <p><strong>Email:</strong> <?php echo $tutor['email']; ?></p>
                <p><strong>Phone:</strong> <?php echo $tutor['phone']; ?></p>
                <p><strong>Available Subjects:</strong></p>
                <div class="subjects">
                    <?php foreach ($subjects_list as $subj): ?>
                        <span class="subject-tag"><?php echo $subj; ?></span>
                    <?php endforeach; ?>
                </div>
            </div>

            <form method="POST" action="" id="bookingForm">
                <div class="form-group">
                    <label for="subject_id">Select Subject</label>
                    <select id="subject_id" name="subject_id" required onchange="loadSessionOptions()">
                        <option value="">Choose a subject...</option>
                        <?php 
                        for ($i = 0; $i < count($subject_ids); $i++) {
                            echo '<option value="' . $subject_ids[$i] . '">' . $subjects_list[$i] . '</option>';
                        }
                        ?>
                    </select>
                    <small>Select which subject you need help with</small>
                </div>

                <div id="session-type-container" style="display: none; margin-bottom: 20px; padding: 15px; background: #e8f4f8; border-radius: 8px;">
                    <label style="display: block; margin-bottom: 10px; font-weight: bold; color: #2c3e50;">
                        📍 Choose Session Type
                    </label>
                    <div id="session-options" style="display: flex; gap: 15px; flex-wrap: wrap;">
                        <!-- Options will be loaded dynamically -->
                    </div>
                    <input type="hidden" name="session_type" id="session_type" required>
                    <div id="location-display" style="margin-top: 15px; padding: 10px; background: white; border-radius: 5px; display: none;">
                        <strong>📍 Location: </strong><span id="selected-location"></span>
                    </div>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label for="session_date">Session Date</label>
                        <input type="date" id="session_date" name="session_date" required 
                               min="<?php echo date('Y-m-d'); ?>">
                        <small>Select a date for your tutoring session</small>
                    </div>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label for="start_time">Start Time</label>
                        <select id="start_time" name="start_time" required onchange="updateEndTime()">
                            <option value="">Choose start time...</option>
                            <?php
                            for ($h = 7; $h <= 20; $h++) {
                                for ($m = 0; $m < 60; $m += 30) {
                                    $time_24 = sprintf('%02d:%02d', $h, $m);
                                    $time_12 = date('g:i A', strtotime($time_24));
                                    echo "<option value='$time_24'>$time_12</option>";
                                }
                            }
                            ?>
                        </select>
                        <small>Choose your preferred start time (7 AM - 8 PM)</small>
                    </div>
                    <div class="form-group">
                        <label for="end_time">End Time</label>
                        <input type="text" id="end_time" name="end_time" required readonly style="background: #f8f9fa;">
                        <small>Auto-set based on duration</small>
                    </div>
                </div>

                <div class="form-group">
                    <label>Session Duration</label>
                    <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                        <button type="button" class="duration-btn" data-minutes="30" onclick="setDuration(30)">30m</button>
                        <button type="button" class="duration-btn active" data-minutes="60" onclick="setDuration(60)">1h</button>
                        <button type="button" class="duration-btn" data-minutes="90" onclick="setDuration(90)">1h 30m</button>
                        <button type="button" class="duration-btn" data-minutes="120" onclick="setDuration(120)">2h</button>
                    </div>
                    <small>Select how long you need the tutoring session</small>
                </div>

                <div class="form-group">
                    <label for="notes">What topics do you need help with? (Optional)</label>
                    <textarea id="notes" name="notes" rows="4" 
                              placeholder="e.g., I need help understanding loops and arrays in programming..."></textarea>
                </div>

                <div style="display: flex; gap: 15px;">
                    <button type="submit" name="book_session" class="btn btn-primary">Submit Booking Request</button>
                    <a href="find_tutors.php" class="btn btn-secondary">Cancel</a>
                </div>
            </form>
        </div>
    </div>

    <?php require_once '../../assets/includes/floating_chat_button.php'; ?>
    
    <script>
    const tutorId = <?php echo $tutor_id; ?>;
    let sessionDuration = 60; // Default 1 hour
    let availableOptions = {};
    
    function loadSessionOptions() {
        const subjectId = document.getElementById('subject_id').value;
        
        if (!subjectId) {
            document.getElementById('session-type-container').style.display = 'none';
            return;
        }
        
        // Fetch available session types for this subject
        fetch(`get_session_options.php?tutor_id=${tutorId}&subject_id=${subjectId}`)
            .then(response => response.json())
            .then(data => {
                if (data.success && data.options.length > 0) {
                    displaySessionOptions(data.options);
                    availableOptions = data.options;
                } else {
                    document.getElementById('session-options').innerHTML = 
                        '<div style="padding: 15px; background: #fff3cd; border-radius: 5px; color: #856404; width: 100%;">' +
                        '<strong>⚠️ This tutor hasn\'t set up availability for this subject yet.</strong><br>' +
                        'Please choose another subject or contact the tutor directly.' +
                        '</div>';
                    document.getElementById('session-type-container').style.display = 'block';
                }
            })
            .catch(error => {
                console.error('Error loading options:', error);
                alert('Error loading session options. Please try again.');
            });
    }
    
    function displaySessionOptions(options) {
        const container = document.getElementById('session-options');
        container.innerHTML = '';
        
        options.forEach(option => {
            const optionDiv = document.createElement('div');
            optionDiv.className = 'session-option';
            optionDiv.onclick = () => selectSessionType(option.type, option.location, option.label);
            optionDiv.innerHTML = `
                <input type="radio" name="session_type_radio" value="${option.type}" id="type_${option.type}">
                <label for="type_${option.type}">
                    <strong>${option.label}</strong><br>
                    <small>${option.type === 'online' ? '🔗 ' : '📍 '}${option.location}</small>
                </label>
            `;
            optionDiv.style.cssText = 'flex: 1; min-width: 200px; padding: 15px; border: 2px solid #ddd; border-radius: 8px; cursor: pointer; transition: all 0.3s;';
            optionDiv.onmouseover = function() { this.style.borderColor = '#667eea'; };
            optionDiv.onmouseout = function() { 
                if (!this.querySelector('input').checked) {
                    this.style.borderColor = '#ddd'; 
                }
            };
            
            container.appendChild(optionDiv);
        });
        
        document.getElementById('session-type-container').style.display = 'block';
    }
    
    function selectSessionType(type, location, label) {
        document.getElementById('session_type').value = type;
        document.getElementById('type_' + type).checked = true;
        
        // Highlight selected option
        document.querySelectorAll('.session-option').forEach(opt => {
            opt.style.borderColor = '#ddd';
            opt.style.background = 'white';
        });
        event.currentTarget.style.borderColor = '#28a745';
        event.currentTarget.style.background = '#d4edda';
        
        // Display location
        document.getElementById('selected-location').innerHTML = 
            `<strong>${label}:</strong> ${type === 'online' ? '🔗 ' : '📍 '}${location}`;
        document.getElementById('location-display').style.display = 'block';
    }
    
    function setDuration(minutes) {
        sessionDuration = minutes;
        
        // Update active button
        document.querySelectorAll('.duration-btn').forEach(btn => {
            btn.classList.remove('active');
            if (parseInt(btn.dataset.minutes) === minutes) {
                btn.classList.add('active');
            }
        });
        
        // Update end time if start time is selected
        updateEndTime();
    }
    
    function updateEndTime() {
        const startTime = document.getElementById('start_time').value;
        const endTimeInput = document.getElementById('end_time');
        
        if (startTime) {
            // Parse start time
            const [hours, minutes] = startTime.split(':').map(Number);
            
            // Add duration
            let totalMinutes = hours * 60 + minutes + sessionDuration;
            let endHours = Math.floor(totalMinutes / 60);
            let endMinutes = totalMinutes % 60;
            
            // Format as 12-hour time
            const period = endHours >= 12 ? 'PM' : 'AM';
            const displayHours = endHours > 12 ? endHours - 12 : (endHours === 0 ? 12 : endHours);
            
            // Set display value (12-hour format)
            endTimeInput.value = `${displayHours}:${String(endMinutes).padStart(2, '0')} ${period}`;
            
            // Store 24-hour format in a hidden field for form submission
            const hiddenEndTime = document.createElement('input');
            hiddenEndTime.type = 'hidden';
            hiddenEndTime.name = 'end_time_24';
            hiddenEndTime.value = `${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}`;
            
            // Remove old hidden field if exists
            const oldHidden = document.querySelector('input[name="end_time_24"]');
            if (oldHidden) oldHidden.remove();
            
            // Append new hidden field
            endTimeInput.parentNode.appendChild(hiddenEndTime);
        }
    }
    
    // Form validation
    document.getElementById('bookingForm').addEventListener('submit', function(e) {
        const sessionType = document.getElementById('session_type').value;
        if (!sessionType) {
            e.preventDefault();
            alert('Please select a session type (Face-to-Face or Online)');
            return false;
        }
    });
    </script>
</body>
</html>
