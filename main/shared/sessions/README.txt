SESSION PREFERENCES STORAGE
===========================

This folder stores tutor preferences for each subject they teach.

Structure:
  sessions/
    {tutor_id}/
      {subject_id}.json

Example:
  sessions/
    5/
      1.json  (CS101 preferences)
      2.json  (CS102 preferences)

File Format:
{
  "subject_id": 1,
  "tutor_id": 5,
  "preferences": {
    "face-to-face": {
      "available": true,
      "location": "Library Room 101"
    },
    "online": {
      "available": true,
      "meeting_link": "https://meet.google.com/xyz-abc-def"
    }
  },
  "updated_at": "2025-12-02 10:30:00"
}
