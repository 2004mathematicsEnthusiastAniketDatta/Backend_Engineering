# Book Management System 
  ### Tables
   - Users
        - ID
        - Role
        - Name
        - PhoneNumber
        - Address
    - Books
        - ID 
        - Author
        - ISBN_NUMBER
        - Price
        - Author
    - Author
        - ID
        - Name
        - Instagram
        - TikTok
        - List [Books]
    - Admin
        - Users and Books 
        - Upload new Books
        - Manage user permissions
        - Delete books and authors
        - View analytics and reports
        
    - Book Records
        - ID
        - Book ID
        - User ID
        - Issue Time
        - Return Time
        - Is Returned


# Learning Management System
   Heads Up : The LMS is white labelled
   > Connect your own domain
   > Connect your Own Payment Provider
   > Connect your own Integrations
   > Live conference solutions

### Database Requirements


#### Core Entities
- Students, Instructors, and Administrators with role-based access
- Comprehensive course management with prerequisites and categories
- Enrollments
- Transactions
    -  ID
    -  User ID
    - Course ID
    - Payment Gateway
    - Amount
    - Date
- Coupon
    - Code
    - Discount Type
    - Value
    - Exp Time
    - Start Time
    - Minimum Purchase Amount
    - Maximum Discount Amount
    - Coupon limit per Learner
    - Device Type
    - Apply Coupon To
    - Coupon Status : ACTIVE| INACTIVE | DISABLED
- Category
- Lessons 
       - ID
       - Type: Live | Quiz
- Multi-format content delivery (videos, documents, quizzes, assignments)
- Progress tracking and assessment management
- Communication tools and notifications

#### Advanced Features
- Analytics and reporting dashboard
- Certificate generation and verification
- Integration capabilities with external systems
- Scalable file storage for multimedia content

### Tables Schema

#### Users
- ID (Primary Key)
- Role (Student/Instructor/Admin)
- FirstName
- LastName
- Email (Unique)
- Password (Hashed)
- ProfilePicture
- DateOfBirth
- PhoneNumber
- Address
- CreatedAt
- UpdatedAt
- IsActive
 
#### Courses
- ID (Primary Key)
- Title
- Description
- InstructorID (Foreign Key → Users)
- CategoryID (Foreign Key → Categories)
- Level (Beginner/Intermediate/Advanced)
- Duration (Hours)
- Price
- MaxStudents
- IsPublished
- CreatedAt
- UpdatedAt

#### Categories
- ID (Primary Key)
- Name
- Description
- ParentCategoryID (Self-referencing for subcategories)

#### Enrollments
- ID (Primary Key)
- StudentID (Foreign Key → Users)
- CourseID (Foreign Key → Courses)
- EnrollmentDate
- CompletionDate
- Status (Active/Completed/Dropped)
- ProgressPercentage

#### Modules
- ID (Primary Key)
- CourseID (Foreign Key → Courses)
- Title
- Description
- OrderIndex
- IsLocked

#### Lessons
- ID (Primary Key)
- ModuleID (Foreign Key → Modules)
- Title
- Content
- ContentType (Video/Text/Quiz/Assignment)
- Duration
- OrderIndex
- IsPreviewable

#### Assignments
- ID (Primary Key)
- LessonID (Foreign Key → Lessons)
- Title
- Description
- DueDate
- MaxScore
- FileAttachments

#### Submissions
- ID (Primary Key)
- AssignmentID (Foreign Key → Assignments)
- StudentID (Foreign Key → Users)
- SubmissionText
- FileAttachments
- SubmittedAt
- Score
- Feedback
- GradedBy (Foreign Key → Users)

#### Quizzes
- ID (Primary Key)
- LessonID (Foreign Key → Lessons)
- Title
- TimeLimit (Minutes)
- MaxAttempts
- PassingScore

#### Questions
- ID (Primary Key)
- QuizID (Foreign Key → Quizzes)
- QuestionText
- QuestionType (MCQ/True-False/Fill-in-blank)
- Points
- OrderIndex

#### QuizAttempts
- ID (Primary Key)
- QuizID (Foreign Key → Quizzes)
- StudentID (Foreign Key → Users)
- Score
- StartTime
- EndTime
- AttemptNumber

#### Certificates
- ID (Primary Key)
- StudentID (Foreign Key → Users)
- CourseID (Foreign Key → Courses)
- CertificateURL
- IssuedAt
- VerificationCode

#### Notifications
- ID (Primary Key)
- UserID (Foreign Key → Users)
- Title
- Message
- NotificationType (Assignment/Grade/Course/System)
- IsRead
- CreatedAt

#### StudentProgress
- ID (Primary Key)
- StudentID (Foreign Key → Users)
- LessonID (Foreign Key → Lessons)
- CompletedAt
- TimeSpent (Minutes)

#### Discussion Forums
- ID (Primary Key)
- CourseID (Foreign Key → Courses)
- Title
- Description
- CreatedBy (Foreign Key → Users)
- CreatedAt

#### Forum Posts
- ID (Primary Key)
- ForumID (Foreign Key → Discussion Forums)
- AuthorID (Foreign Key → Users)
- Content
- ParentPostID (Self-referencing for replies)
- CreatedAt
- UpdatedAt

#### Course Prerequisites
- ID (Primary Key)
- CourseID (Foreign Key → Courses)
- PrerequisiteCourseID (Foreign Key → Courses)

#### Announcements
- ID (Primary Key)
- CourseID (Foreign Key → Courses)
- InstructorID (Foreign Key → Users)
- Title
- Content
- Priority (Low/Medium/High)
- CreatedAt
- ExpiresAt

#### StudentGrades
- ID (Primary Key)
- StudentID (Foreign Key → Users)
- CourseID (Foreign Key → Courses)
- AssignmentID (Foreign Key → Assignments)
- QuizID (Foreign Key → Quizzes)
- Score
- MaxScore
- GradedAt
- Comments

#### CourseReviews
- ID (Primary Key)
- StudentID (Foreign Key → Users)
- CourseID (Foreign Key → Courses)
- Rating (1-5)
- ReviewText
- CreatedAt
- IsApproved

#### File Storage
- ID (Primary Key)
- FileName
- FilePath
- FileSize
- FileType
- UploadedBy (Foreign Key → Users)
- RelatedEntityType (Course/Lesson/Assignment)
- RelatedEntityID
- UploadedAt

#### Analytics
- ID (Primary Key)
- CourseID (Foreign Key → Courses)
- TotalEnrollments
- CompletionRate
- AverageRating
- TotalRevenue
- LastUpdated

#### System Settings
- ID (Primary Key)
- SettingKey
- SettingValue
- Description
- UpdatedBy (Foreign Key → Users)
- UpdatedAt
