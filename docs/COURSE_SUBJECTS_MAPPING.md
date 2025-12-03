# Course Subjects Mapping

This document defines the subjects available for each of the 6 courses offered in the MC Tutor platform.

## Courses Overview
- BS in Accountancy (BSA)
- BS in Business Administration (BSBA)
- Bachelor in Secondary Education (BSED)
- Bachelor of Science in Nursing (BSN)
- Bachelor of Science in Computer Science (BSCS)
- Bachelor of Science in Criminology (BSCrim)

---

## BS in Accountancy (BSA)

### Core Subjects
| Code | Subject Name |
|------|-------------|
| ACC101 | Fundamentals of Accounting |
| ACC102 | Financial Accounting and Reporting 1 |
| ACC103 | Financial Accounting and Reporting 2 |
| ACC104 | Management Accounting |
| ACC105 | Cost Accounting and Control |
| ACC106 | Auditing Theory |
| ACC107 | Auditing Practice |
| ACC108 | Tax Accounting 1 |
| ACC109 | Tax Accounting 2 |
| ACC110 | Accounting Information Systems |

### Business Subjects
| Code | Subject Name |
|------|-------------|
| BUS101 | Business Law and Taxation |
| BUS102 | Economics (Micro and Macro) |
| BUS103 | Business Ethics and Social Responsibility |
| BUS104 | Business Finance |

---

## BS in Business Administration (BSBA)

### Core Subjects
| Code | Subject Name |
|------|-------------|
| BSBA101 | Principles of Management |
| BSBA102 | Business Organization and Management |
| BSBA103 | Operations Management |
| BSBA104 | Strategic Management |
| BSBA105 | Marketing Management |
| BSBA106 | Human Resource Management |
| BSBA107 | Financial Management |
| BSBA108 | Organizational Behavior |

### Business Core
| Code | Subject Name |
|------|-------------|
| BUS101 | Business Law |
| BUS102 | Economics (Micro and Macro) |
| BUS103 | Business Ethics |
| BUS104 | Entrepreneurship |
| BUS105 | Business Mathematics |
| BUS106 | Business Statistics |

---

## Bachelor in Secondary Education (BSED)

### Core Professional Subjects
| Code | Subject Name |
|------|-------------|
| EDUC101 | The Teaching Profession |
| EDUC102 | The Child and Adolescent Learners |
| EDUC103 | Facilitating Learner-Centered Teaching |
| EDUC104 | The Teacher and the School Curriculum |
| EDUC105 | Assessment in Learning 1 |
| EDUC106 | Assessment in Learning 2 |
| EDUC107 | Developmental Reading 1 |
| EDUC108 | Developmental Reading 2 |
| EDUC109 | Technology for Teaching and Learning 1 |
| EDUC110 | Technology for Teaching and Learning 2 |

### Major Specialization Areas
| Code | Subject Name |
|------|-------------|
| SPED101 | Teaching Science in the Intermediate Grades |
| SPED102 | Teaching Math in the Intermediate Grades |
| SPED103 | Teaching English |
| SPED104 | Teaching Filipino |
| SPED105 | Teaching Social Studies |

---

## Bachelor of Science in Nursing (BSN)

### Core Nursing Subjects
| Code | Subject Name |
|------|-------------|
| NURS101 | Fundamentals of Nursing |
| NURS102 | Anatomy and Physiology |
| NURS103 | Biochemistry |
| NURS104 | Microbiology and Parasitology |
| NURS105 | Pharmacology |
| NURS106 | Nutrition and Diet Therapy |
| NURS107 | Medical-Surgical Nursing 1 |
| NURS108 | Medical-Surgical Nursing 2 |
| NURS109 | Maternal and Child Nursing |
| NURS110 | Psychiatric Nursing |

### Clinical Subjects
| Code | Subject Name |
|------|-------------|
| NURS201 | Community Health Nursing |
| NURS202 | Nursing Research |
| NURS203 | Nursing Management and Leadership |
| NURS204 | Operating Room Technique |
| NURS205 | Intensive Care Nursing |

---

## Bachelor of Science in Computer Science (BSCS)

### Core Programming Subjects
| Code | Subject Name |
|------|-------------|
| CS101 | Introduction to Computing |
| CS102 | Computer Programming 1 |
| CS103 | Computer Programming 2 |
| CS104 | Data Structures and Algorithms |
| CS105 | Object-Oriented Programming |
| CS106 | Database Management Systems |
| CS107 | Software Engineering 1 |
| CS108 | Software Engineering 2 |

### Advanced CS Subjects
| Code | Subject Name |
|------|-------------|
| CS201 | Web Development |
| CS202 | Mobile Application Development |
| CS203 | Computer Networks |
| CS204 | Operating Systems |
| CS205 | Information Security |
| CS206 | Artificial Intelligence |
| CS207 | Machine Learning |
| CS208 | Capstone Project 1 |
| CS209 | Capstone Project 2 |

### Mathematics Subjects
| Code | Subject Name |
|------|-------------|
| MATH101 | Discrete Mathematics |
| MATH102 | Calculus 1 |
| MATH103 | Calculus 2 |
| MATH104 | Linear Algebra |

---

## Bachelor of Science in Criminology (BSCrim)

### Core Criminology Subjects
| Code | Subject Name |
|------|-------------|
| CRIM101 | Introduction to Criminology |
| CRIM102 | Theoretical Criminology |
| CRIM103 | Philippine Criminal Justice System |
| CRIM104 | Criminal Law 1 (RPC Book 1) |
| CRIM105 | Criminal Law 2 (RPC Book 2) |
| CRIM106 | Criminal Procedure and Court Testimony |
| CRIM107 | Criminal Investigation and Detection |
| CRIM108 | Criminalistics 1 (Forensic Photography) |
| CRIM109 | Criminalistics 2 (Forensic Ballistics) |
| CRIM110 | Criminalistics 3 (Forensic Chemistry) |

### Law Enforcement Subjects
| Code | Subject Name |
|------|-------------|
| CRIM201 | Law Enforcement Organization and Administration |
| CRIM202 | Police Patrol Operations and Management |
| CRIM203 | Police Intelligence and Security |
| CRIM204 | Human Rights in Criminal Justice |
| CRIM205 | Juvenile Delinquency and Juvenile Justice |

### Corrections & Rehabilitation
| Code | Subject Name |
|------|-------------|
| CRIM301 | Institutional Corrections |
| CRIM302 | Non-Institutional Corrections |
| CRIM303 | Therapeutic Modalities |
| CRIM304 | Criminology Practicum (OJT) |

---

## Implementation Notes

### For Database Schema
```sql
-- Example subjects table structure
CREATE TABLE subjects (
  subject_code VARCHAR(10) PRIMARY KEY,
  subject_name VARCHAR(255) NOT NULL,
  course_code VARCHAR(10) NOT NULL,
  description TEXT,
  units INT DEFAULT 3,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Example enrollment/tutoring relationship
CREATE TABLE tutor_subjects (
  id SERIAL PRIMARY KEY,
  tutor_id INT REFERENCES users(id),
  subject_code VARCHAR(10) REFERENCES subjects(subject_code),
  proficiency_level VARCHAR(50), -- 'Beginner', 'Intermediate', 'Advanced', 'Expert'
  created_at TIMESTAMP DEFAULT NOW()
);
```

### For Frontend Subject Selection
- Student registration: Select course → auto-populate available subjects
- Tutor profile: Select course → select subjects they can tutor
- Subject search: Filter by course, subject code, or subject name
- Tutoring requests: Student selects from their course subjects

### Subject Code Convention
- **Course Prefix** (ACC, BSBA, EDUC, NURS, CS, CRIM) + **Number** (101-399)
- 100-level: Foundational subjects
- 200-level: Intermediate/Applied subjects
- 300-level: Advanced/Specialization subjects
- Shared subjects (BUS, MATH): Cross-course general education

---

## Usage in MC Tutor Platform

1. **Student Registration**: After selecting course, system knows which subjects are available
2. **Tutor Profile Setup**: Tutors select their course, then choose subjects they're qualified to teach
3. **Subject Search**: Students search for tutors by subject code or name
4. **Filtering**: Dashboard filters by course-specific subjects
5. **Matching Algorithm**: Match students with tutors based on subject expertise

---

**Last Updated**: January 2025
**Maintained By**: MC Tutor Development Team
