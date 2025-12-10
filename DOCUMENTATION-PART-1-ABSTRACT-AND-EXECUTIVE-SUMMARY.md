# MC TUTOR DOCUMENTATION
## Cloud-Based Peer Tutoring Platform for Mabini College Inc.

---

# PART 1: ABSTRACT AND EXECUTIVE SUMMARY

---

## ABSTRACT

The **MC Tutor: Cloud-Based Peer Tutoring Platform for Mabini College Inc.** is a comprehensive web-based educational technology solution designed to facilitate peer-to-peer academic support among students. Developed as a capstone project by third-year Bachelor of Science in Computer Science students, this platform addresses the critical need for structured, accessible, and efficient tutoring services within the Mabini College community.

The platform leverages modern cloud computing technologies, including Supabase (PostgreSQL) for database management, Vercel for serverless deployment, and Node.js with TypeScript for backend development. The system supports 120 subjects across six academic programs: Bachelor of Science in Accountancy (BSA), Bachelor of Science in Business Administration (BSBA), Bachelor of Secondary Education (BSED), Bachelor of Science in Nursing (BSN), Bachelor of Science in Computer Science (BSCS), and Bachelor of Science in Criminology (BSCrim).

Key features include intelligent tutor-student matching based on subject expertise, real-time session booking and management, cloud-based study material storage and sharing, comprehensive feedback mechanisms, and integrated messaging functionality. The platform implements role-based access control supporting three user types: administrators, tutors, and tutees (students seeking tutoring).

The system architecture follows a modern three-tier design pattern with a responsive frontend built using vanilla JavaScript, HTML5, and CSS3, a RESTful API backend developed in TypeScript with Express.js, and a cloud-hosted PostgreSQL database managed through Supabase. The platform provides over 60 API endpoints, 25 user interface pages, and supports multiple session types including both online and physical tutoring arrangements.

This documentation presents a complete technical analysis of the system, including comparative analysis with the legacy system, detailed feature implementation, comprehensive testing results, and identified areas for future enhancement. The project demonstrates the practical application of cloud computing principles in educational technology and showcases the team's ability to deliver a full-stack web application addressing real-world institutional needs.

**Keywords:** Peer Tutoring, Cloud Computing, Educational Technology, Web Application, Supabase, TypeScript, Real-time Communication, Academic Support System

---

## EXECUTIVE SUMMARY

### Project Overview

MC Tutor represents a significant advancement in educational technology for Mabini College Inc., transforming informal peer tutoring arrangements into a structured, accessible, and efficient cloud-based platform. The system connects students who need academic assistance with their peers who possess expertise in specific subjects, facilitating collaborative learning and academic excellence across the institution.

### Problem Statement

Prior to this implementation, Mabini College Inc. lacked a centralized system for peer tutoring coordination. Students faced multiple challenges:

1. **Difficulty in Finding Qualified Tutors** - Students relied on personal networks and word-of-mouth recommendations, limiting access to potential tutors outside their immediate social circles.

2. **Uncoordinated Scheduling** - Arranging tutoring sessions required multiple back-and-forth communications through various platforms (text messages, social media, or face-to-face discussions), resulting in scheduling conflicts and inefficiencies.

3. **Limited Resource Sharing** - Study materials, lecture notes, and learning resources were scattered across individual devices and cloud storage accounts, making them difficult to discover and access.

4. **Lack of Accountability** - No formal mechanism existed to track tutoring session outcomes, measure tutor effectiveness, or ensure quality of academic support.

5. **Absence of Performance Metrics** - The institution had no visibility into peer tutoring activities, preventing data-driven decisions about academic support programs.

### Solution Approach

The MC Tutor platform addresses these challenges through a comprehensive cloud-based solution that provides:

**Centralized Tutor Discovery**
- Searchable database of 120 subjects across six academic programs
- Advanced filtering by course, subject, and tutor rating
- Detailed tutor profiles with expertise indicators and performance statistics

**Streamlined Session Management**
- Integrated booking system with calendar functionality
- Support for both online and physical tutoring sessions
- Automated notifications for session requests, confirmations, and reminders
- Session status tracking (pending, confirmed, completed, cancelled)

**Cloud-Based Resource Repository**
- Secure file upload and storage for study materials
- Support for multiple file formats (PDF, DOC, DOCX, PPT, PPTX, TXT, ZIP, RAR)
- Subject-based categorization and tagging system
- Download tracking and material popularity metrics

**Quality Assurance Through Feedback**
- Comprehensive five-star rating system evaluating four dimensions:
  - Communication effectiveness
  - Subject knowledge and expertise
  - Punctuality and reliability
  - Teaching style and methodology
- Overall rating aggregation
- Public feedback visibility to guide student choices

**Real-Time Communication**
- Integrated messaging system for tutor-student interaction
- Conversation history and unread message indicators
- Support for both general inquiries and session-specific discussions

### Technical Highlights

The platform is built on a robust technology stack that ensures scalability, reliability, and performance:

**Frontend Architecture**
- Pure vanilla JavaScript for zero-dependency, lightweight client-side logic
- Responsive HTML5 and CSS3 design supporting desktop, tablet, and mobile devices
- Component-based architecture with reusable UI elements
- 25 specialized pages for different user roles and functions

**Backend Infrastructure**
- Node.js runtime with Express.js framework
- TypeScript for type safety and enhanced code maintainability
- RESTful API design with 60+ endpoints
- JWT-based authentication and authorization
- Role-based access control (RBAC) for security

**Database and Storage**
- Supabase-managed PostgreSQL database with 11 relational tables
- Cloud storage integration for file management
- Optimized indexing for query performance
- Data integrity enforcement through foreign key constraints

**Deployment and DevOps**
- Vercel serverless deployment for automatic scaling
- GitHub integration for version control and CI/CD
- Environment-based configuration management
- Production and development environment separation

### Key Metrics and Achievements

**Database Coverage**
- 6 academic programs fully supported
- 120 subjects catalogued with detailed descriptions
- Unlimited tutor-subject associations
- Scalable to accommodate entire student population

**Feature Completeness**
- 60+ functional API endpoints
- 25 user interface pages
- 11 database tables with comprehensive relationships
- 3 distinct user roles (admin, tutor, tutee)

**Code Quality**
- 15,000+ lines of TypeScript backend code
- 10,000+ lines of frontend HTML/CSS/JavaScript
- Comprehensive error handling and validation
- Modular architecture for maintainability

### User Roles and Capabilities

**Students (Tutees)**
- Search and discover tutors by subject and rating
- Request tutoring sessions with preferred schedules
- Access and download study materials
- Provide detailed feedback after sessions
- Track session history and learning progress
- Communicate directly with tutors

**Tutors**
- Create comprehensive teaching profiles
- List subjects they can teach with proficiency levels
- Set availability schedules by day and time
- Upload and share study materials
- Manage incoming session requests
- View received feedback and ratings
- Track teaching statistics and achievements

**Administrators**
- Monitor overall platform usage and statistics
- Manage user accounts and permissions
- Oversee subject catalog and course offerings
- Review and moderate study materials
- Access system analytics and reports
- Resolve disputes and support issues
- Ensure platform quality and compliance

### Implementation Timeline

The project was executed over an 11-week development cycle:

**Weeks 1-2: Research and Design**
- Literature review on peer tutoring systems
- Requirements gathering from stakeholders
- Database schema design
- User interface wireframing
- Technology stack finalization

**Weeks 3-4: Foundation Development**
- Database setup and migration scripts
- Authentication system implementation
- User registration and login functionality
- Basic API infrastructure

**Weeks 5-6: Core Features**
- Tutor profile management
- Subject association system
- Session booking workflow
- Frontend page development

**Weeks 7-8: Advanced Features**
- Cloud storage integration
- Study material upload/download
- Feedback system implementation
- Messaging functionality

**Weeks 9-10: Integration and Testing**
- System integration testing
- User acceptance testing
- Bug identification and resolution
- Performance optimization

**Week 11: Finalization**
- Documentation completion
- Deployment to production
- User training materials
- Defense preparation

### Impact and Benefits

**For Students**
- **Improved Access** - 24/7 availability to find tutors and learning resources
- **Better Outcomes** - Structured support leading to improved academic performance
- **Convenience** - Book sessions and access materials from any device, anywhere
- **Transparency** - Rating system ensures informed tutor selection

**For Tutors**
- **Recognition** - Platform to showcase expertise and build reputation
- **Flexibility** - Control over teaching schedule and subject selection
- **Development** - Opportunity to strengthen knowledge through teaching
- **Portfolio** - Track record of tutoring activities for future opportunities

**For Administrators**
- **Visibility** - Comprehensive data on peer tutoring activities
- **Quality Control** - Feedback system enables monitoring of tutor performance
- **Resource Management** - Centralized platform reduces administrative overhead
- **Decision Support** - Analytics inform academic support program improvements

**For the Institution**
- **Academic Excellence** - Enhanced student support infrastructure
- **Student Retention** - Improved learning outcomes reduce dropout rates
- **Innovation Leadership** - Demonstrates commitment to educational technology
- **Scalability** - Foundation for future academic support initiatives

### Success Indicators

The platform has successfully achieved its primary objectives:

1. ✅ **Functional Completeness** - All planned features implemented and operational
2. ✅ **User Role Support** - Complete functionality for all three user types
3. ✅ **Subject Coverage** - All 120 subjects across six programs supported
4. ✅ **Cloud Integration** - Successful deployment on Vercel with Supabase backend
5. ✅ **Security Implementation** - JWT authentication and role-based access control
6. ✅ **Responsive Design** - Compatible with desktop, tablet, and mobile devices
7. ✅ **API Documentation** - Comprehensive endpoint documentation and testing

### Recommendations for Production Deployment

While the platform is fully functional, the following enhancements are recommended before full-scale institutional deployment:

**Critical Security Enhancements**
1. **Password Hashing** - Implement bcrypt for secure password storage (currently plain text)
2. **Email Verification** - Add email confirmation during registration process
3. **Account Lockout** - Implement security measures against brute-force attacks
4. **HTTPS Enforcement** - Ensure all communications use encrypted connections

**Performance Optimizations**
1. **Real-Time Communication** - Re-enable Socket.IO for instant messaging instead of polling
2. **Caching Layer** - Implement Redis or similar for frequently accessed data
3. **Database Indexing** - Additional indexes for complex query optimization
4. **Image Optimization** - Compress and resize profile pictures automatically

**Feature Enhancements**
1. **Video Conferencing** - Integrate WebRTC for online tutoring sessions
2. **Payment Integration** - Optional paid tutoring session support
3. **Advanced Analytics** - Comprehensive dashboards for administrators
4. **Mobile Application** - Native or progressive web app for mobile devices
5. **Notification System** - Email and SMS notifications for important events

### Conclusion

The MC Tutor platform successfully demonstrates the application of cloud computing technologies to solve real-world educational challenges. The system provides a scalable, secure, and user-friendly solution that transforms informal peer tutoring into a structured, accessible, and measurable academic support service.

The project team has delivered a production-ready foundation that meets all core requirements while identifying clear pathways for future enhancement. The platform's modular architecture and comprehensive documentation ensure that future developers can easily maintain, extend, and scale the system to meet evolving institutional needs.

This capstone project not only fulfills academic requirements but provides tangible value to Mabini College Inc., establishing a technological infrastructure that will benefit students for years to come. The successful completion of this project demonstrates the team's proficiency in full-stack web development, cloud technologies, project management, and collaborative software engineering.

---

## PROJECT TEAM

**Adviser:**
- Mr. Aeron Dave C. Enova

**Project Proponents:**
- Mojico, Kimel Jan - *Project Leader/Coordinator*
- Adap, Al Jabbar - *Frontend Developer*
- Ablao, Jefferson - *Backend & Database Developer*
- Mabeza, John Frances - *Cloud Integration Specialist*
- Resoles, Kreiss Keali - *QA & Documentation Officer*

**Institution:**
Bachelor of Science in Computer Science, 3rd Year Block B  
Mabini College Inc.

**Academic Year:** 2025

**Repository:** https://github.com/johnfrances17/mc-tutor.git

---

## DOCUMENT INFORMATION

**Document Title:** MC Tutor - Cloud-Based Peer Tutoring Platform Documentation  
**Version:** 1.0  
**Date:** December 10, 2025  
**Status:** Final  
**Prepared by:** MC Tutor Development Team  
**Reviewed by:** Mr. Aeron Dave C. Enova  

---

**END OF PART 1**

*Continue to Part 2: System Overview and Technical Architecture*
