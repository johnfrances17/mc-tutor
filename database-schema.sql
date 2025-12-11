-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.courses (
  course_id integer NOT NULL DEFAULT nextval('courses_course_id_seq'::regclass),
  course_code character varying NOT NULL UNIQUE,
  course_name character varying NOT NULL,
  description text,
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT courses_pkey PRIMARY KEY (course_id)
);
CREATE TABLE public.feedback (
  feedback_id integer NOT NULL DEFAULT nextval('feedback_feedback_id_seq'::regclass),
  session_id integer,
  tutee_id integer,
  tutor_id integer,
  communication_rating integer CHECK (communication_rating >= 1 AND communication_rating <= 5),
  knowledge_rating integer CHECK (knowledge_rating >= 1 AND knowledge_rating <= 5),
  punctuality_rating integer CHECK (punctuality_rating >= 1 AND punctuality_rating <= 5),
  teaching_style_rating integer CHECK (teaching_style_rating >= 1 AND teaching_style_rating <= 5),
  overall_rating integer CHECK (overall_rating >= 1 AND overall_rating <= 5),
  comments text,
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT feedback_pkey PRIMARY KEY (feedback_id),
  CONSTRAINT feedback_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.sessions(session_id),
  CONSTRAINT feedback_tutee_id_fkey FOREIGN KEY (tutee_id) REFERENCES public.users(user_id),
  CONSTRAINT feedback_tutor_id_fkey FOREIGN KEY (tutor_id) REFERENCES public.users(user_id)
);
CREATE TABLE public.materials (
  material_id integer NOT NULL DEFAULT nextval('materials_material_id_seq'::regclass),
  tutor_id integer,
  subject_id integer,
  title character varying NOT NULL,
  description text,
  file_url text NOT NULL,
  filename character varying,
  file_size bigint,
  file_type character varying,
  category character varying CHECK (category::text = ANY (ARRAY['lecture'::character varying, 'assignment'::character varying, 'quiz'::character varying, 'reference'::character varying, 'other'::character varying]::text[])),
  tags ARRAY,
  download_count integer DEFAULT 0,
  uploaded_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT materials_pkey PRIMARY KEY (material_id),
  CONSTRAINT materials_tutor_id_fkey FOREIGN KEY (tutor_id) REFERENCES public.users(user_id),
  CONSTRAINT materials_subject_id_fkey FOREIGN KEY (subject_id) REFERENCES public.subjects(subject_id)
);
CREATE TABLE public.sessions (
  session_id integer NOT NULL DEFAULT nextval('sessions_session_id_seq'::regclass),
  tutee_id integer,
  tutor_id integer,
  subject_id integer,
  session_date date NOT NULL,
  start_time time without time zone NOT NULL,
  end_time time without time zone NOT NULL,
  session_type character varying DEFAULT 'online'::character varying CHECK (session_type::text = ANY (ARRAY['online'::character varying, 'physical'::character varying]::text[])),
  location text,
  notes text,
  status character varying DEFAULT 'pending'::character varying CHECK (status::text = ANY (ARRAY['pending'::character varying, 'confirmed'::character varying, 'completed'::character varying, 'cancelled'::character varying]::text[])),
  cancellation_reason text,
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  physical_location character varying,
  google_meet_link character varying,
  CONSTRAINT sessions_pkey PRIMARY KEY (session_id),
  CONSTRAINT sessions_tutee_id_fkey FOREIGN KEY (tutee_id) REFERENCES public.users(user_id),
  CONSTRAINT sessions_tutor_id_fkey FOREIGN KEY (tutor_id) REFERENCES public.users(user_id),
  CONSTRAINT sessions_subject_id_fkey FOREIGN KEY (subject_id) REFERENCES public.subjects(subject_id)
);
CREATE TABLE public.subjects (
  subject_id integer NOT NULL DEFAULT nextval('subjects_subject_id_seq'::regclass),
  subject_code character varying NOT NULL UNIQUE,
  subject_name character varying NOT NULL,
  course_code character varying NOT NULL CHECK (course_code::text = ANY (ARRAY['BSA'::character varying, 'BSBA'::character varying, 'BSED'::character varying, 'BSN'::character varying, 'BSCS'::character varying, 'BSCrim'::character varying]::text[])),
  description text,
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT subjects_pkey PRIMARY KEY (subject_id)
);
CREATE TABLE public.tutor_availability (
  availability_id integer NOT NULL DEFAULT nextval('tutor_availability_availability_id_seq'::regclass),
  tutor_id integer,
  day_of_week character varying NOT NULL CHECK (day_of_week::text = ANY (ARRAY['Monday'::character varying, 'Tuesday'::character varying, 'Wednesday'::character varying, 'Thursday'::character varying, 'Friday'::character varying, 'Saturday'::character varying, 'Sunday'::character varying]::text[])),
  start_time time without time zone NOT NULL,
  end_time time without time zone NOT NULL,
  is_available boolean DEFAULT true,
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT tutor_availability_pkey PRIMARY KEY (availability_id),
  CONSTRAINT tutor_availability_tutor_id_fkey FOREIGN KEY (tutor_id) REFERENCES public.users(user_id)
);
CREATE TABLE public.tutor_ratings (
  rating_id integer NOT NULL DEFAULT nextval('tutor_ratings_rating_id_seq'::regclass),
  session_id integer NOT NULL UNIQUE,
  tutor_id integer NOT NULL,
  tutee_id integer NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text text,
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT tutor_ratings_pkey PRIMARY KEY (rating_id),
  CONSTRAINT tutor_ratings_session_fkey FOREIGN KEY (session_id) REFERENCES public.sessions(session_id),
  CONSTRAINT tutor_ratings_tutor_fkey FOREIGN KEY (tutor_id) REFERENCES public.users(user_id),
  CONSTRAINT tutor_ratings_tutee_fkey FOREIGN KEY (tutee_id) REFERENCES public.users(user_id)
);
CREATE TABLE public.tutor_stats (
  stats_id integer NOT NULL DEFAULT nextval('tutor_stats_stats_id_seq'::regclass),
  tutor_id integer UNIQUE,
  total_sessions integer DEFAULT 0,
  completed_sessions integer DEFAULT 0,
  average_rating numeric DEFAULT 0.00,
  total_hours numeric DEFAULT 0.00,
  subjects_taught integer DEFAULT 0,
  students_helped integer DEFAULT 0,
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT tutor_stats_pkey PRIMARY KEY (stats_id),
  CONSTRAINT tutor_stats_tutor_id_fkey FOREIGN KEY (tutor_id) REFERENCES public.users(user_id)
);
CREATE TABLE public.tutor_subjects (
  tutor_subject_id integer NOT NULL DEFAULT nextval('tutor_subjects_tutor_subject_id_seq'::regclass),
  tutor_id integer,
  subject_id integer,
  proficiency_level character varying DEFAULT 'intermediate'::character varying CHECK (proficiency_level::text = ANY (ARRAY['beginner'::character varying, 'intermediate'::character varying, 'advanced'::character varying, 'expert'::character varying]::text[])),
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  preferred_location character varying DEFAULT 'online'::character varying CHECK (preferred_location::text = ANY (ARRAY['online'::character varying, 'physical'::character varying, 'both'::character varying]::text[])),
  physical_location character varying,
  google_meet_link character varying,
  updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT tutor_subjects_pkey PRIMARY KEY (tutor_subject_id),
  CONSTRAINT tutor_subjects_tutor_id_fkey FOREIGN KEY (tutor_id) REFERENCES public.users(user_id),
  CONSTRAINT tutor_subjects_subject_id_fkey FOREIGN KEY (subject_id) REFERENCES public.subjects(subject_id)
);
CREATE TABLE public.users (
  user_id integer NOT NULL DEFAULT nextval('users_user_id_seq'::regclass),
  school_id character varying NOT NULL UNIQUE,
  email character varying NOT NULL UNIQUE,
  password character varying NOT NULL,
  email_verified boolean DEFAULT false,
  pin character varying,
  first_name character varying NOT NULL,
  middle_name character varying,
  last_name character varying NOT NULL,
  role character varying NOT NULL CHECK (role::text = ANY (ARRAY['admin'::character varying, 'tutor'::character varying, 'tutee'::character varying]::text[])),
  phone character varying,
  year_level integer CHECK (year_level >= 1 AND year_level <= 4),
  course_code character varying CHECK (course_code::text = ANY (ARRAY['BSA'::character varying, 'BSBA'::character varying, 'BSED'::character varying, 'BSN'::character varying, 'BSCS'::character varying, 'BSCrim'::character varying]::text[])),
  profile_picture text,
  status character varying DEFAULT 'active'::character varying CHECK (status::text = ANY (ARRAY['active'::character varying, 'inactive'::character varying, 'suspended'::character varying]::text[])),
  last_active timestamp without time zone,
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  average_rating numeric DEFAULT 0.00,
  total_ratings integer DEFAULT 0,
  CONSTRAINT users_pkey PRIMARY KEY (user_id)
);