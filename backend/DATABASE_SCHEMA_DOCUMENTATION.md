# University Management System - Database Schema Documentation

## Overview
This document provides a comprehensive explanation of the database schema, entity relationships, migration order, and ERD for the university management system.

## ERD Explanation

### Core Entities

**Users**
- Central authentication entity
- Has one-to-one relationships with Student and Teacher
- Has many relationships with modules, announcements, comments, course materials, room reservations, etc.

**Roles**
- Defines user roles (admin, teacher, student)
- One-to-many relationship with Users

**Groups**
- Represents student groups/classes
- One-to-many relationship with Students
- One-to-many relationship with Modules

**Students**
- Extended user profile for students
- Belongs to User and Group
- Has many grades, absences, absence justifications, administrative requests, generated documents

**Teachers**
- Extended user profile for teachers
- Belongs to User
- Has many modules

### Academic Entities

**Modules**
- Represents courses/subjects
- Belongs to Teacher and Group
- Has many schedules, grades, absences, course materials

**Classrooms**
- Physical rooms for classes
- Has many schedules and room reservations

**Schedules**
- Class schedule entries
- Belongs to Module and Classroom
- Has many absences

### Academic Records

**Grades**
- Student grades for modules
- Belongs to Student and Module

**Absences**
- Student attendance records
- Belongs to Student, Module, Schedule, and optionally AbsenceJustification

**AbsenceJustifications**
- Excuse notes for absences
- Belongs to Student and User (reviewer)
- Has many absences

### Communication

**Announcements**
- System-wide or role-specific announcements
- Belongs to User (creator)
- Has many comments (polymorphic)

**Comments**
- Comments on various entities
- Belongs to User
- Polymorphic relationship to any entity (Module, Announcement, CourseMaterial, AdministrativeRequest)
- Self-referential for nested comments (parent_id)

### Resources

**CourseMaterials**
- Files/resources for modules
- Belongs to Module and User (uploader)
- Has many comments (polymorphic)

**RoomReservations**
- Classroom booking system
- Belongs to Classroom and User
- Approved by User (approver)

### Administrative

**AdministrativeRequests**
- Student requests (transcripts, certificates, etc.)
- Belongs to Student
- Processed by User
- Has many generated documents and comments (polymorphic)

**GeneratedDocuments**
- Official documents generated from requests
- Belongs to AdministrativeRequest, Student, and User (generator)

## Migration Order

Migrations must be run in the following order to respect foreign key dependencies:

1. **0001_01_01_000000_create_users_table** - Core user table
2. **0001_01_01_000001_create_cache_table** - Laravel cache
3. **0001_01_01_000002_create_jobs_table** - Laravel jobs
4. **2026_05_29_230141_create_personal_access_tokens_table** - Sanctum tokens
5. **2026_05_29_230252_create_roles_table** - User roles
6. **2026_05_29_230320_create_groups_table** - Student groups
7. **2026_05_29_230328_create_students_table** - Student profiles
8. **2026_05_29_230332_create_teachers_table** - Teacher profiles
9. **2026_05_30_000427_create_classrooms_table** - Physical classrooms
10. **2026_05_30_000405_create_modules_table** - Course modules
11. **2026_05_30_000426_create_schedules_table** - Class schedules
12. **2026_05_30_000514_create_grades_table** - Student grades
13. **2026_05_30_000541_create_absence_justifications_table** - Absence justifications
14. **2026_05_30_001123_create_absences_table** - Attendance records
15. **2026_05_30_000640_create_announcements_table** - System announcements
16. **2026_05_30_000608_create_comments_table** - Comments (polymorphic)
17. **2026_05_30_000608_create_course_materials_table** - Course resources
18. **2026_05_30_000640_create_room_reservations_table** - Room bookings
19. **2026_05_30_000706_create_administrative_requests_table** - Student requests
20. **2026_05_30_000707_create_generated_documents_table** - Generated documents

## Relationship Explanation

### User Relationships

**User Model:**
- `role()` - BelongsTo: A user has one role
- `student()` - HasOne: A user can have one student profile
- `teacher()` - HasOne: A user can have one teacher profile
- `modules()` - HasMany: A teacher can teach many modules
- `announcements()` - HasMany: A user can create many announcements
- `comments()` - HasMany: A user can write many comments
- `courseMaterials()` - HasMany: A user can upload many course materials
- `roomReservations()` - HasMany: A user can make many room reservations
- `processedRequests()` - HasMany: A user can process many administrative requests
- `generatedDocuments()` - HasMany: A user can generate many documents
- `reviewedJustifications()` - HasMany: A user can review many absence justifications

### Student Relationships

**Student Model:**
- `user()` - BelongsTo: A student belongs to a user
- `group()` - BelongsTo: A student belongs to a group
- `grades()` - HasMany: A student has many grades
- `absences()` - HasMany: A student has many absences
- `absenceJustifications()` - HasMany: A student can submit many justifications
- `administrativeRequests()` - HasMany: A student can make many administrative requests
- `generatedDocuments()` - HasMany: A student can have many generated documents

### Teacher Relationships

**Teacher Model:**
- `user()` - BelongsTo: A teacher belongs to a user
- `modules()` - HasMany: A teacher teaches many modules

### Module Relationships

**Module Model:**
- `teacher()` - BelongsTo: A module is taught by one teacher
- `group()` - BelongsTo: A module belongs to one group
- `schedules()` - HasMany: A module has many schedules
- `grades()` - HasMany: A module has many grades
- `absences()` - HasMany: A module has many absences
- `courseMaterials()` - HasMany: A module has many course materials

### Classroom Relationships

**Classroom Model:**
- `schedules()` - HasMany: A classroom has many schedules
- `roomReservations()` - HasMany: A classroom has many reservations

### Schedule Relationships

**Schedule Model:**
- `module()` - BelongsTo: A schedule belongs to one module
- `classroom()` - BelongsTo: A schedule is in one classroom
- `absences()` - HasMany: A schedule has many absences

### Grade Relationships

**Grade Model:**
- `student()` - BelongsTo: A grade belongs to one student
- `module()` - BelongsTo: A grade belongs to one module

### Absence Relationships

**Absence Model:**
- `student()` - BelongsTo: An absence belongs to one student
- `module()` - BelongsTo: An absence is for one module
- `schedule()` - BelongsTo: An absence is for one schedule
- `justification()` - BelongsTo: An absence can have one justification

### AbsenceJustification Relationships

**AbsenceJustification Model:**
- `student()` - BelongsTo: A justification belongs to one student
- `reviewer()` - BelongsTo: A justification is reviewed by one user
- `absences()` - HasMany: A justification can cover many absences

### Announcement Relationships

**Announcement Model:**
- `creator()` - BelongsTo: An announcement is created by one user
- `comments()` - MorphMany: An announcement can have many comments

### Comment Relationships

**Comment Model:**
- `user()` - BelongsTo: A comment is written by one user
- `parent()` - BelongsTo: A comment can be a reply to another comment
- `replies()` - HasMany: A comment can have many replies
- `commentable()` - MorphTo: A comment can be on any entity (Module, Announcement, CourseMaterial, AdministrativeRequest)

### CourseMaterial Relationships

**CourseMaterial Model:**
- `module()` - BelongsTo: A material belongs to one module
- `uploader()` - BelongsTo: A material is uploaded by one user
- `comments()` - MorphMany: A material can have many comments

### RoomReservation Relationships

**RoomReservation Model:**
- `classroom()` - BelongsTo: A reservation is for one classroom
- `user()` - BelongsTo: A reservation is made by one user
- `approver()` - BelongsTo: A reservation is approved by one user

### AdministrativeRequest Relationships

**AdministrativeRequest Model:**
- `student()` - BelongsTo: A request is made by one student
- `processor()` - BelongsTo: A request is processed by one user
- `generatedDocuments()` - HasMany: A request can generate many documents
- `comments()` - MorphMany: A request can have many comments

### GeneratedDocument Relationships

**GeneratedDocument Model:**
- `request()` - BelongsTo: A document is generated from one request
- `student()` - BelongsTo: A document belongs to one student
- `generator()` - BelongsTo: A document is generated by one user

## Foreign Key Constraints

All foreign keys use appropriate `onDelete` behavior:
- **cascade**: Delete related records when parent is deleted (e.g., deleting a user deletes their comments)
- **set null**: Set foreign key to null when parent is deleted (e.g., deleting a teacher sets module teacher_id to null)
- **restrict**: Prevent deletion if related records exist (not used in this schema)

## Indexes

Indexes are added to frequently queried columns:
- Foreign key columns
- Status fields (for filtering by status)
- Date fields (for date-based queries)
- Enum fields (for filtering by type)

## Soft Deletes

The following models use soft deletes:
- Module
- Classroom
- Announcement
- Comment
- CourseMaterial
- AdministrativeRequest

Soft deletes allow records to be marked as deleted without actually removing them from the database, preserving data integrity and allowing for recovery.

## Enum Fields

The following models use enum fields for status/type:
- Module: status (active, inactive, archived)
- Classroom: status (available, maintenance, unavailable)
- Schedule: type (lecture, lab, exam, tutorial)
- Grade: grade_type (exam, assignment, quiz, project, participation)
- Absence: status (present, absent, late, excused)
- AbsenceJustification: status (pending, approved, rejected)
- Announcement: target_role (all, admin, teacher, student), status (draft, published, archived)
- Comment: status (pending, approved, rejected, hidden)
- CourseMaterial: status (draft, published, archived)
- RoomReservation: status (pending, approved, rejected, cancelled)
- AdministrativeRequest: type (transcript, certificate, attestation, other), status (pending, in_progress, approved, rejected, completed)
- GeneratedDocument: type (transcript, certificate, attestation, grade_report, other)

## JSON Fields

The following models use JSON fields:
- Classroom: equipment (array of equipment names)

## Polymorphic Relationships

The Comment model uses polymorphic relationships to allow comments on any entity:
- commentable_type: The class name of the related model
- commentable_id: The ID of the related record

This allows comments to be added to Modules, Announcements, CourseMaterials, and AdministrativeRequests without creating separate comment tables for each.

## Seeding Order

Database seeding follows this order to respect dependencies:
1. RoleSeeder
2. GroupSeeder
3. UserSeeder
4. ClassroomSeeder
5. ModuleSeeder
6. ScheduleSeeder
7. GradeSeeder
8. AbsenceSeeder
9. AbsenceJustificationSeeder
10. AnnouncementSeeder
11. CommentSeeder
12. CourseMaterialSeeder
13. RoomReservationSeeder
14. AdministrativeRequestSeeder
15. GeneratedDocumentSeeder
