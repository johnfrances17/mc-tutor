mc-tutor (main folder)



--public/					(the pages of each roles)

&nbsp;   admin/

&nbsp;     dashboard.php				(homepage of admin)

&nbsp;     manage-subjects.php

&nbsp;     manage-users.php

&nbsp;     view-materials.php

&nbsp;     view-sessions.php



&nbsp;   tutee/

&nbsp;     dashboard.php				(homepage of student/tutee)

&nbsp;     find\_tutors.php

&nbsp;     book-sessions.php

&nbsp;     study-materials.php

&nbsp;     my-sessions.php				(lists of upcoming, ongoing, completed, cancelled (separated))



&nbsp;   tutor/

&nbsp;     dashboard.php

&nbsp;     my-subjects.php

&nbsp;     upload-materials.php

&nbsp;     my-sessions.php







--data/						(acts as storage, formattable when considering to fresh testing)

&nbsp;   chat/

&nbsp;     {tutee-id}-{tutor-id}.json/js		chat connection (eg: 233234-231256)



&nbsp;   profile/

&nbsp;     {tutee/tutor-id}.png/jpg/jpeg		profile picture (eg:232342.png)

&nbsp;     default.png/jpg/jpeg



&nbsp;   

--config/

&nbsp;   pri/					(pri means private only)

&nbsp;     xampp    .sql				mostly the MySQL/xampp as of yet for testing purposes



&nbsp;   pub/					(pub means public only)

&nbsp;     supabase (.sql)
      vercel   (.env)





&nbsp;   

--api/

&nbsp;   auth/

&nbsp;     login.php

&nbsp;     register.php

&nbsp;     forgot-password.php

&nbsp;     logout.php



&nbsp;   notification/

&nbsp;     unread.json/js

&nbsp;     mark-read.json/js







--database/

&nbsp;   migrations/					(for updating the current database)

&nbsp;     xxx-migration-name.php			in chronological order to access it easily







--docs/

&nbsp;   .mds

&nbsp;   .txts


NOTES TO CONSIDER:

* Make the project beginner friendly, aswell as the overhaul designs interactive friendly
* 3NF layout but also atleast beginner friendly (xampp only for testing purposes
* You can use JSON in crud-ing (adding, updating, deleting) for any pages, just make sure its beginner friendly and accesable to use
* 
