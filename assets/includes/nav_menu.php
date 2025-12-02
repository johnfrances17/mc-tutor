<?php
// Navigation menu generator
// Usage: include this file and call render_nav_menu($role, $active_page)

function render_nav_menu($role, $active_page = '') {
    $menus = [
        'admin' => [
            ['url' => 'dashboard.php', 'label' => 'Dashboard'],
            ['url' => 'manage_users.php', 'label' => 'Manage Users'],
            ['url' => 'manage_subjects.php', 'label' => 'Manage Subjects'],
            ['url' => 'view_sessions.php', 'label' => 'View Sessions'],
            ['url' => 'view_materials.php', 'label' => 'Study Materials']
        ],
        'tutor' => [
            ['url' => 'dashboard.php', 'label' => 'Dashboard'],
            ['url' => 'my_subjects.php', 'label' => 'My Subjects'],
            ['url' => 'my_sessions.php', 'label' => 'My Sessions'],
            ['url' => 'upload_materials.php', 'label' => 'Upload Materials'],
            ['url' => 'my_feedback.php', 'label' => 'Feedback']
        ],
        'tutee' => [
            ['url' => 'dashboard.php', 'label' => 'Dashboard'],
            ['url' => 'find_tutors.php', 'label' => 'Find Tutors'],
            ['url' => 'my_sessions.php', 'label' => 'My Sessions'],
            ['url' => 'study_materials.php', 'label' => 'Study Materials'],
            ['url' => 'my_feedback.php', 'label' => 'My Feedback']
        ]
    ];
    
    if (!isset($menus[$role])) {
        return '';
    }
    
    echo '<div class="nav-menu">';
    foreach ($menus[$role] as $item) {
        $active_class = ($active_page === $item['url']) ? ' class="active"' : '';
        echo '<a href="' . $item['url'] . '"' . $active_class . '>' . $item['label'] . '</a>';
    }
    echo '</div>';
}
?>
