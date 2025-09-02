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


# Social Media Platform Database Design

## Twitter-like Platform

### Core Tables

#### Users
- ID (Primary Key)
- Username (Unique)
- Email (Unique)
- Password (Hashed)
- DisplayName
- Bio
- ProfilePicture
- CoverPhoto
- Location
- Website
- DateOfBirth
- JoinedAt
- IsVerified
- IsPrivate
- FollowersCount
- FollowingCount
- TweetsCount

#### Tweets
- ID (Primary Key)
- UserID (Foreign Key → Users)
- Content
- MediaURLs (JSON array)
- RetweetCount
- LikeCount
- ReplyCount
- CreatedAt
- IsDeleted
- ParentTweetID (For replies)
- OriginalTweetID (For retweets)

#### Follows
- ID (Primary Key)
- FollowerID (Foreign Key → Users)
- FollowingID (Foreign Key → Users)
- CreatedAt

#### Likes
- ID (Primary Key)
- UserID (Foreign Key → Users)
- TweetID (Foreign Key → Tweets)
- CreatedAt

#### Retweets
- ID (Primary Key)
- UserID (Foreign Key → Users)
- TweetID (Foreign Key → Tweets)
- Comment
- CreatedAt

#### Hashtags
- ID (Primary Key)
- Tag
- TweetCount
- CreatedAt

#### TweetHashtags
- TweetID (Foreign Key → Tweets)
- HashtagID (Foreign Key → Hashtags)

#### Mentions
- ID (Primary Key)
- TweetID (Foreign Key → Tweets)
- MentionedUserID (Foreign Key → Users)

#### DirectMessages
- ID (Primary Key)
- SenderID (Foreign Key → Users)
- ReceiverID (Foreign Key → Users)
- Content
- IsRead
- CreatedAt

## YouTube-like Platform

### Core Tables

#### Channels
- ID (Primary Key)
- UserID (Foreign Key → Users)
- ChannelName
- Description
- ProfilePicture
- BannerImage
- SubscribersCount
- TotalViews
- CreatedAt
- IsVerified
- Country

#### Videos
- ID (Primary Key)
- ChannelID (Foreign Key → Channels)
- Title
- Description
- VideoURL
- ThumbnailURL
- Duration
- ViewCount
- LikeCount
- DislikeCount
- CommentCount
- UploadedAt
- Privacy (Public/Private/Unlisted)
- Category
- Tags (JSON array)

#### Subscriptions
- ID (Primary Key)
- SubscriberID (Foreign Key → Users)
- ChannelID (Foreign Key → Channels)
- SubscribedAt
- NotificationsEnabled

#### VideoLikes
- ID (Primary Key)
- UserID (Foreign Key → Users)
- VideoID (Foreign Key → Videos)
- IsLike (Boolean - true for like, false for dislike)
- CreatedAt

#### Comments
- ID (Primary Key)
- VideoID (Foreign Key → Videos)
- UserID (Foreign Key → Users)
- Content
- ParentCommentID (For replies)
- LikeCount
- CreatedAt
- IsDeleted

#### CommentLikes
- ID (Primary Key)
- UserID (Foreign Key → Users)
- CommentID (Foreign Key → Comments)
- CreatedAt

#### Playlists
- ID (Primary Key)
- ChannelID (Foreign Key → Channels)
- Title
- Description
- Privacy (Public/Private/Unlisted)
- CreatedAt
- VideoCount

#### PlaylistVideos
- ID (Primary Key)
- PlaylistID (Foreign Key → Playlists)
- VideoID (Foreign Key → Videos)
- OrderIndex
- AddedAt

#### VideoViews
- ID (Primary Key)
- VideoID (Foreign Key → Videos)
- UserID (Foreign Key → Users)
- ViewedAt
- WatchDuration
- IPAddress

#### VideoCategories
- ID (Primary Key)
- Name
- Description

#### Notifications
- ID (Primary Key)
- UserID (Foreign Key → Users)
- Type (Upload/Like/Comment/Subscribe)
- RelatedEntityID
- RelatedEntityType
- Message
- IsRead
- CreatedAt


## Platform Relationships

### Twitter-like Platform Relationships

#### User Relationships
- Users can follow other Users (many-to-many via Follows table)
- Users can block other Users
- Users can mute other Users

#### Content Relationships
- Users create Tweets (one-to-many)
- Tweets can reply to other Tweets (self-referencing)
- Tweets can be retweeted (many-to-many via Retweets)
- Users can like Tweets (many-to-many via Likes)
- Tweets can mention Users (many-to-many via Mentions)
- Tweets can contain Hashtags (many-to-many via TweetHashtags)

#### Communication Relationships
- Users can send DirectMessages to other Users (many-to-many)
- Users can create conversation threads

### YouTube-like Platform Relationships

#### Channel Relationships
- Users own Channels (one-to-many)
- Users can subscribe to Channels (many-to-many via Subscriptions)
- Channels can collaborate with other Channels

#### Video Relationships
- Channels upload Videos (one-to-many)
- Users can like/dislike Videos (many-to-many via VideoLikes)
- Users can view Videos (many-to-many via VideoViews)
- Videos belong to Categories (many-to-one)
- Videos can be added to Playlists (many-to-many via PlaylistVideos)

#### Engagement Relationships
- Users can comment on Videos (one-to-many)
- Comments can reply to other Comments (self-referencing)
- Users can like Comments (many-to-many via CommentLikes)
- Channels create Playlists (one-to-many)

#### Content Discovery Relationships
- Videos can be recommended based on viewing history
- Users receive Notifications for subscribed channels
- Trending videos based on engagement metrics


# Industry Level Library Management System

## Overview
A comprehensive library management system designed for academic institutions, public libraries, and corporate libraries with advanced features for resource management, user engagement, and administrative oversight.

### Core Features
- Multi-branch library support
- Digital and physical resource management
- Advanced reservation and renewal system
- Fine and payment processing
- Analytics and reporting
- Integration with academic systems
- Mobile and web applications

### Database Schema

#### Libraries
- ID (Primary Key)
- Name
- Address
- PhoneNumber
- Email
- Type (Academic/Public/Corporate)
- OpeningHours (JSON)
- Capacity
- EstablishedDate
- IsActive

#### Members
- ID (Primary Key)
- MembershipNumber (Unique)
- LibraryID (Foreign Key → Libraries)
- FirstName
- LastName
- Email (Unique)
- PhoneNumber
- Address
- DateOfBirth
- MembershipType (Student/Faculty/Public/Corporate)
- MembershipStartDate
- MembershipEndDate
- Status (Active/Suspended/Expired)
- PhotoURL
- EmergencyContact
- Department
- EmployeeID
- CreatedAt
- UpdatedAt

#### Authors
- ID (Primary Key)
- FirstName
- LastName
- Biography
- DateOfBirth
- DateOfDeath
- Nationality
- Website
- Awards (JSON array)
- CreatedAt

#### Publishers
- ID (Primary Key)
- Name
- Address
- PhoneNumber
- Email
- Website
- EstablishedYear
- Country

#### Categories
- ID (Primary Key)
- Name
- Description
- ParentCategoryID (Self-referencing)
- DeweyDecimalCode

#### Books
- ID (Primary Key)
- ISBN (Unique)
- Title
- Subtitle
- AuthorID (Foreign Key → Authors)
- PublisherID (Foreign Key → Publishers)
- CategoryID (Foreign Key → Categories)
- PublicationYear
- Edition
- Language
- Pages
- Description
- CoverImageURL
- Price
- Format (Physical/Digital/Audio)
- AgeRating
- Keywords (JSON array)
- CreatedAt
- UpdatedAt

#### BookCopies
- ID (Primary Key)
- BookID (Foreign Key → Books)
- LibraryID (Foreign Key → Libraries)
- CopyNumber
- Barcode (Unique)
- Location (Shelf/Section)
- Condition (New/Good/Fair/Poor/Damaged)
- Status (Available/Issued/Reserved/Maintenance/Lost)
- AcquisitionDate
- LastMaintenanceDate
- Notes

#### Reservations
- ID (Primary Key)
- MemberID (Foreign Key → Members)
- BookID (Foreign Key → Books)
- ReservationDate
- ExpiryDate
- Status (Active/Fulfilled/Cancelled/Expired)
- Priority
- NotificationSent

#### Transactions
- ID (Primary Key)
- MemberID (Foreign Key → Members)
- BookCopyID (Foreign Key → BookCopies)
- TransactionType (Issue/Return/Renew)
- IssueDate
- DueDate
- ReturnDate
- RenewalCount
- IssuedBy (Foreign Key → Staff)
- ReturnedTo (Foreign Key → Staff)
- LateFee
- DamageAssessment
- Notes

#### Staff
- ID (Primary Key)
- LibraryID (Foreign Key → Libraries)
- EmployeeID (Unique)
- FirstName
- LastName
- Email
- PhoneNumber
- Position (Librarian/Assistant/Manager/Admin)
- Department
- HireDate
- Salary
- Permissions (JSON)
- IsActive
- CreatedAt

#### Fines
- ID (Primary Key)
- MemberID (Foreign Key → Members)
- TransactionID (Foreign Key → Transactions)
- FineType (Late/Damage/Lost/Processing)
- Amount
- Description
- IssueDate
- DueDate
- PaidDate
- Status (Pending/Paid/Waived/Overdue)
- WaivedBy (Foreign Key → Staff)
- PaymentMethod

#### Payments
- ID (Primary Key)
- MemberID (Foreign Key → Members)
- FineID (Foreign Key → Fines)
- Amount
- PaymentDate
- PaymentMethod (Cash/Card/Online/Cheque)
- TransactionReference
- ReceivedBy (Foreign Key → Staff)
- ReceiptNumber

#### DigitalResources
- ID (Primary Key)
- BookID (Foreign Key → Books)
- FileURL
- FileSize
- FileFormat (PDF/EPUB/MP3/MP4)
- DRMProtected
- DownloadLimit
- SimultaneousUsers
- LicenseExpiry
- AccessLevel (Public/Restricted/Premium)

#### BookReviews
- ID (Primary Key)
- BookID (Foreign Key → Books)
- MemberID (Foreign Key → Members)
- Rating (1-5)
- ReviewText
- ReviewDate
- IsApproved
- HelpfulVotes

#### BookRequests
- ID (Primary Key)
- MemberID (Foreign Key → Members)
- BookTitle
- AuthorName
- ISBN
- PublisherName
- RequestDate
- Status (Pending/Approved/Rejected/Fulfilled)
- Priority (Low/Medium/High)
- Justification
- ReviewedBy (Foreign Key → Staff)
- ReviewDate
- EstimatedCost

#### Events
- ID (Primary Key)
- LibraryID (Foreign Key → Libraries)
- Title
- Description
- EventType (Workshop/Reading/Seminar/Exhibition)
- StartDateTime
- EndDateTime
- Location
- MaxAttendees
- CurrentAttendees
- RegistrationRequired
- Fee
- OrganizerID (Foreign Key → Staff)
- Status (Planned/Active/Completed/Cancelled)

#### EventRegistrations
- ID (Primary Key)
- EventID (Foreign Key → Events)
- MemberID (Foreign Key → Members)
- RegistrationDate
- AttendanceStatus (Registered/Attended/No-Show)
- FeedbackRating
- FeedbackComments

#### Notifications
- ID (Primary Key)
- MemberID (Foreign Key → Members)
- NotificationType (Due/Overdue/Reserved/Event/News)
- Title
- Message
- SentDate
- ReadDate
- DeliveryMethod (Email/SMS/Push/InApp)
- Status (Sent/Delivered/Read/Failed)

#### LibraryStats
- ID (Primary Key)
- LibraryID (Foreign Key → Libraries)
- Date
- TotalMembers
- ActiveMembers
- BooksIssued
- BooksReturned
- NewRegistrations
- FinesCollected
- EventsHeld
- DigitalDownloads

#### Vendors
- ID (Primary Key)
- Name
- ContactPerson
- Email
- PhoneNumber
- Address
- PaymentTerms
- Discount
- Rating
- IsActive

#### PurchaseOrders
- ID (Primary Key)
- VendorID (Foreign Key → Vendors)
- LibraryID (Foreign Key → Libraries)
- OrderDate
- ExpectedDelivery
- TotalAmount
- Status (Pending/Approved/Delivered/Cancelled)
- CreatedBy (Foreign Key → Staff)
- ApprovedBy (Foreign Key → Staff)

#### PurchaseOrderItems
- ID (Primary Key)
- PurchaseOrderID (Foreign Key → PurchaseOrders)
- BookID (Foreign Key → Books)
- Quantity
- UnitPrice
- TotalPrice
- ReceivedQuantity
- DamagedQuantity

## Platform Relationships

### Core Library Operations
- Libraries have multiple Members (one-to-many)
- Members can belong to multiple Libraries (many-to-many for consortium libraries)
- Books have multiple Copies across Libraries (one-to-many)
- Members can have multiple active Transactions (one-to-many)
- Members can Reserve multiple Books (one-to-many)
- Transactions generate Fines (one-to-many)
- Fines can have multiple Payments (one-to-many)

### Content Management
- Books written by Authors (many-to-many)
- Books published by Publishers (many-to-one)
- Books belong to Categories (many-to-one with hierarchical structure)
- Books can have Digital Resources (one-to-many)
- Members can write Book Reviews (many-to-many)
- Members can submit Book Requests (one-to-many)

### Administrative Operations
- Staff manage multiple Libraries (many-to-many)
- Staff process Transactions (one-to-many)
- Staff organize Events (one-to-many)
- Members register for Events (many-to-many)
- Libraries purchase from Vendors (many-to-many via Purchase Orders)
- Purchase Orders contain multiple Items (one-to-many)

### Analytics and Reporting
- Libraries track daily Statistics (one-to-many)
- System generates Notifications for Members (one-to-many)
- Events collect Member Feedback (one-to-many)
- Comprehensive reporting on usage patterns and financial metrics



# Advanced Hospital Management System

## Overview
A comprehensive hospital management system designed for multi-specialty hospitals, medical centers, and healthcare networks with advanced features for patient care, medical records, inventory management, billing, and regulatory compliance.

### Core Features
- Multi-location hospital network support
- Electronic Health Records (EHR) integration
- Advanced appointment scheduling and queue management
- Inventory and pharmacy management
- Billing and insurance processing
- Staff management and scheduling
- Patient portal and telemedicine
- Compliance and audit trails
- Analytics and reporting dashboard

### Database Schema

#### Hospitals
- ID (Primary Key)
- Name
- LicenseNumber (Unique)
- Address
- PhoneNumber
- Email
- Type (General/Specialty/Emergency/Pediatric)
- BedCapacity
- EmergencyServices
- AccreditationLevel
- EstablishedDate
- IsActive
- Latitude
- Longitude

#### Departments
- ID (Primary Key)
- HospitalID (Foreign Key → Hospitals)
- Name
- Description
- Head (Foreign Key → Staff)
- Location
- PhoneExtension
- BudgetAllocated
- IsActive
- OperatingHours (JSON)

#### Patients
- ID (Primary Key)
- PatientNumber (Unique)
- FirstName
- LastName
- DateOfBirth
- Gender
- BloodGroup
- Email
- PhoneNumber
- EmergencyContactName
- EmergencyContactPhone
- Address
- City
- State
- ZipCode
- Country
- Nationality
- MaritalStatus
- Occupation
- InsuranceProvider
- InsurancePolicyNumber
- PreferredLanguage
- Allergies (JSON array)
- ChronicConditions (JSON array)
- RegistrationDate
- LastVisitDate
- IsActive
- PhotoURL

#### Staff
- ID (Primary Key)
- HospitalID (Foreign Key → Hospitals)
- DepartmentID (Foreign Key → Departments)
- EmployeeID (Unique)
- FirstName
- LastName
- Email
- PhoneNumber
- Role (Doctor/Nurse/Technician/Admin/Pharmacist/Therapist)
- Specialization
- LicenseNumber
- QualificationDetails (JSON)
- DateOfJoining
- Salary
- ShiftType (Day/Night/Rotating)
- PermissionLevel
- IsActive
- Address
- EmergencyContact
- PhotoURL

#### Doctors
- ID (Primary Key)
- StaffID (Foreign Key → Staff)
- MedicalLicenseNumber (Unique)
- Specialization
- SubSpecialization
- ExperienceYears
- ConsultationFee
- AvailableHours (JSON)
- MaxPatientsPerDay
- RoomNumber
- IsConsultingOnline
- Biography
- Awards (JSON array)
- EducationDetails (JSON)

#### Appointments
- ID (Primary Key)
- PatientID (Foreign Key → Patients)
- DoctorID (Foreign Key → Doctors)
- HospitalID (Foreign Key → Hospitals)
- AppointmentDate
- AppointmentTime
- Duration
- AppointmentType (Consultation/Follow-up/Emergency/Surgery)
- Status (Scheduled/In-Progress/Completed/Cancelled/No-Show)
- Reason
- Notes
- Priority (Low/Medium/High/Emergency)
- CreatedBy (Foreign Key → Staff)
- CreatedAt
- UpdatedAt

#### MedicalRecords
- ID (Primary Key)
- PatientID (Foreign Key → Patients)
- DoctorID (Foreign Key → Doctors)
- VisitDate
- ChiefComplaint
- MedicalHistory
- PhysicalExamination
- Diagnosis
- Treatment
- Medications (JSON array)
- LabTestsOrdered (JSON array)
- ImagingOrdered (JSON array)
- FollowUpDate
- VisitType (Outpatient/Inpatient/Emergency)
- RecordType (Consultation/Surgery/Procedure)
- CreatedAt
- UpdatedAt

#### Admissions
- ID (Primary Key)
- PatientID (Foreign Key → Patients)
- DoctorID (Foreign Key → Doctors)
- HospitalID (Foreign Key → Hospitals)
- AdmissionDate
- DischargeDate
- WardID (Foreign Key → Wards)
- BedNumber
- AdmissionType (Emergency/Planned/Transfer)
- ReasonForAdmission
- ExpectedDurationDays
- Status (Active/Discharged/Transferred)
- DischargeNotes
- TotalCost
- InsuranceClaimed

#### Wards
- ID (Primary Key)
- HospitalID (Foreign Key → Hospitals)
- DepartmentID (Foreign Key → Departments)
- Name
- WardType (General/ICU/CCU/Pediatric/Maternity/Surgery)
- TotalBeds
- AvailableBeds
- SupervisingNurse (Foreign Key → Staff)
- FloorNumber
- SpecialEquipment (JSON array)
- IsActive

#### Beds
- ID (Primary Key)
- WardID (Foreign Key → Wards)
- BedNumber
- BedType (Standard/ICU/NICU/Electric)
- Status (Occupied/Available/Maintenance/Reserved)
- DailyRate
- Features (JSON array)
- LastSanitized
- AssignedPatientID (Foreign Key → Patients)

#### Prescriptions
- ID (Primary Key)
- PatientID (Foreign Key → Patients)
- DoctorID (Foreign Key → Doctors)
- MedicalRecordID (Foreign Key → MedicalRecords)
- PrescriptionDate
- Medications (JSON array with dosage, frequency, duration)
- Instructions
- Status (Active/Completed/Cancelled)
- PharmacistID (Foreign Key → Staff)
- DispensingDate
- ValidUntil

#### Medications
- ID (Primary Key)
- Name
- GenericName
- BrandName
- Manufacturer
- BatchNumber
- ExpiryDate
- UnitPrice
- StockQuantity
- MinimumStockLevel
- Category
- DosageForm (Tablet/Capsule/Syrup/Injection)
- Strength
- SideEffects (JSON array)
- Contraindications (JSON array)
- StorageConditions
- IsControlledSubstance

#### LabTests
- ID (Primary Key)
- TestName
- TestCode (Unique)
- DepartmentID (Foreign Key → Departments)
- TestCategory
- NormalRange
- Cost
- Duration (Hours)
- PreparationInstructions
- SpecimenType
- IsActive

#### LabOrders
- ID (Primary Key)
- PatientID (Foreign Key → Patients)
- DoctorID (Foreign Key → Doctors)
- TestID (Foreign Key → LabTests)
- OrderDate
- UrgencyLevel (Routine/Urgent/STAT)
- Status (Ordered/Sample-Collected/In-Progress/Completed/Cancelled)
- TechnicianID (Foreign Key → Staff)
- SampleCollectedAt
- CompletedAt
- Cost

#### LabResults
- ID (Primary Key)
- LabOrderID (Foreign Key → LabOrders)
- TestValues (JSON)
- ResultDate
- TechnicianID (Foreign Key → Staff)
- ReviewedBy (Foreign Key → Doctors)
- IsAbnormal
- CriticalValues
- Comments
- ReportURL

#### ImagingStudies
- ID (Primary Key)
- StudyName
- StudyCode (Unique)
- Modality (X-Ray/CT/MRI/Ultrasound/Nuclear)
- BodyPart
- Cost
- Duration (Minutes)
- PreparationInstructions
- ContrastRequired
- RadiationDose
- IsActive

#### ImagingOrders
- ID (Primary Key)
- PatientID (Foreign Key → Patients)
- DoctorID (Foreign Key → Doctors)
- StudyID (Foreign Key → ImagingStudies)
- OrderDate
- UrgencyLevel (Routine/Urgent/STAT)
- Status (Ordered/Scheduled/In-Progress/Completed/Cancelled)
- TechnicianID (Foreign Key → Staff)
- ScheduledAt
- CompletedAt
- Cost
- SpecialInstructions

#### ImagingResults
- ID (Primary Key)
- ImagingOrderID (Foreign Key → ImagingOrders)
- StudyDate
- ImageURLs (JSON array)
- Findings
- Impression
- Recommendations
- RadiologistID (Foreign Key → Doctors)
- ReviewedAt
- CriticalFindings
- IsReportSigned

#### Surgeries
- ID (Primary Key)
- PatientID (Foreign Key → Patients)
- PrimarySurgeonID (Foreign Key → Doctors)
- SurgeryName
- SurgeryCode
- ScheduledDate
- ActualStartTime
- ActualEndTime
- OperatingRoom
- SurgeryType (Elective/Emergency/Ambulatory)
- AnesthesiaType
- PreOpNotes
- PostOpNotes
- Complications
- Status (Scheduled/In-Progress/Completed/Cancelled)
- EstimatedDuration

#### SurgeryTeam
- ID (Primary Key)
- SurgeryID (Foreign Key → Surgeries)
- StaffID (Foreign Key → Staff)
- Role (Surgeon/Assistant/Anesthesiologist/Nurse)
- IsLead

#### OperatingRooms
- ID (Primary Key)
- HospitalID (Foreign Key → Hospitals)
- RoomNumber
- RoomType (General/Cardiac/Neuro/Orthopedic)
- Equipment (JSON array)
- Status (Available/Occupied/Maintenance/Sanitizing)
- Capacity
- LastSanitized

#### Bills
- ID (Primary Key)
- PatientID (Foreign Key → Patients)
- HospitalID (Foreign Key → Hospitals)
- BillNumber (Unique)
- BillDate
- DueDate
- TotalAmount
- TaxAmount
- DiscountAmount
- InsuranceAmount
- PaidAmount
- OutstandingAmount
- Status (Pending/Partial/Paid/Overdue/Cancelled)
- PaymentTerms
- BillType (OPD/IPD/Emergency/Pharmacy)

#### BillItems
- ID (Primary Key)
- BillID (Foreign Key → Bills)
- ServiceType (Consultation/Lab/Imaging/Surgery/Medication/Room)
- ServiceID (Foreign Key to respective service table)
- Description
- Quantity
- UnitPrice
- TotalPrice
- TaxRate
- DiscountAmount

#### Payments
- ID (Primary Key)
- BillID (Foreign Key → Bills)
- PaymentDate
- Amount
- PaymentMethod (Cash/Card/Insurance/Online/Cheque)
- TransactionReference
- ReceivedBy (Foreign Key → Staff)
- ReceiptNumber
- PaymentStatus (Success/Failed/Pending)

#### Insurance
- ID (Primary Key)
- PatientID (Foreign Key → Patients)
- ProviderName
- PolicyNumber
- GroupNumber
- PolicyHolderName
- PolicyHolderRelation
- CoverageStartDate
- CoverageEndDate
- CoverageAmount
- Deductible
- Copayment
- IsActive
- PreAuthRequired

#### InsuranceClaims
- ID (Primary Key)
- PatientID (Foreign Key → Patients)
- InsuranceID (Foreign Key → Insurance)
- BillID (Foreign Key → Bills)
- ClaimNumber
- ClaimDate
- ClaimedAmount
- ApprovedAmount
- RejectedAmount
- Status (Submitted/Under-Review/Approved/Rejected/Paid)
- RejectionReason
- ProcessedDate
- SubmittedBy (Foreign Key → Staff)

#### EmergencyContacts
- ID (Primary Key)
- PatientID (Foreign Key → Patients)
- ContactName
- Relationship
- PhoneNumber
- Email
- Address
- IsPrimary

#### Ambulances
- ID (Primary Key)
- HospitalID (Foreign Key → Hospitals)
- VehicleNumber
- DriverID (Foreign Key → Staff)
- ParamedicID (Foreign Key → Staff)
- Status (Available/On-Call/Maintenance)
- CurrentLocation
- Equipment (JSON array)
- LastMaintenance
- LicenseExpiry

#### EmergencyCalls
- ID (Primary Key)
- CallerName
- CallerPhone
- CallTime
- Location
- PatientCondition
- AmbulanceID (Foreign Key → Ambulances)
- HospitalID (Foreign Key → Hospitals)
- ResponseTime
- ArrivalTime
- Status (Received/Dispatched/On-Scene/Transporting/Completed)
- Priority (Low/Medium/High/Critical)

#### Inventory
- ID (Primary Key)
- HospitalID (Foreign Key → Hospitals)
- ItemName
- ItemCode (Unique)
- Category (Medical-Equipment/Medication/Supplies/Consumables)
- Manufacturer
- Supplier
- UnitOfMeasure
- CurrentStock
- MinimumStockLevel
- ReorderLevel
- UnitCost
- LastRestockedDate
- ExpiryDate
- Location
- IsActive

#### InventoryTransactions
- ID (Primary Key)
- InventoryID (Foreign Key → Inventory)
- TransactionType (Purchase/Usage/Transfer/Adjustment/Expired)
- Quantity
- TransactionDate
- Reference
- StaffID (Foreign Key → Staff)
- Notes
- UnitCost
- TotalCost

#### MedicalEquipment
- ID (Primary Key)
- HospitalID (Foreign Key → Hospitals)
- DepartmentID (Foreign Key → Departments)
- EquipmentName
- Model
- SerialNumber
- Manufacturer
- PurchaseDate
- WarrantyExpiry
- LastMaintenanceDate
- NextMaintenanceDate
- Status (Operational/Maintenance/Out-of-Order/Retired)
- Location
- Cost
- TechnicianID (Foreign Key → Staff)

#### MaintenanceSchedule
- ID (Primary Key)
- EquipmentID (Foreign Key → MedicalEquipment)
- MaintenanceType (Preventive/Corrective/Calibration)
- ScheduledDate
- CompletedDate
- TechnicianID (Foreign Key → Staff)
- Cost
- Notes
- NextScheduledDate
- Status (Scheduled/In-Progress/Completed/Cancelled)

#### Notifications
- ID (Primary Key)
- RecipientID (Foreign Key → Staff or Patients)
- RecipientType (Staff/Patient)
- NotificationType (Appointment/Lab-Result/Billing/Emergency/System)
- Title
- Message
- SentDate
- ReadDate
- DeliveryMethod (Email/SMS/Push/InApp)
- Status (Sent/Delivered/Read/Failed)
- Priority (Low/Medium/High/Critical)

#### AuditLogs
- ID (Primary Key)
- UserID (Foreign Key → Staff)
- UserType (Staff/System)
- Action
- TableName
- RecordID
- OldValues (JSON)
- NewValues (JSON)
- IPAddress
- UserAgent
- Timestamp
- IsSuccessful

#### Reports
- ID (Primary Key)
- ReportName
- ReportType (Financial/Clinical/Operational/Regulatory)
- GeneratedBy (Foreign Key → Staff)
- GeneratedAt
- Parameters (JSON)
- FileURL
- Status (Generated/Failed/Archived)
- ScheduleType (One-time/Daily/Weekly/Monthly)

## Platform Relationships

### Core Hospital Operations
- Hospitals have multiple Departments (one-to-many)
- Departments have multiple Staff members (one-to-many)
- Patients can visit multiple Hospitals (many-to-many)
- Doctors can work in multiple Departments (many-to-many)
- Patients have multiple Appointments with Doctors (many-to-many)

### Medical Care Management
- Medical Records link Patients with Doctors (many-to-many)
- Prescriptions are written by Doctors for Patients (many-to-many)
- Lab Orders connect Patients, Doctors, and Tests (many-to-many)
- Imaging Orders involve Patients, Doctors, and Studies (many-to-many)
- Surgeries involve Patients and multiple Staff members (many-to-many via Surgery Team)

### Financial Management
- Bills are generated for Patient services (one-to-many)
- Bills contain multiple Service Items (one-to-many)
- Payments are made against Bills (one-to-many)
- Insurance Claims are linked to Bills and Patients (many-to-many)

### Resource Management
- Wards contain multiple Beds (one-to-many)
- Patients are admitted to specific Beds (many-to-one)
- Medical Equipment belongs to Departments (many-to-one)
- Inventory is managed per Hospital (many-to-one)
- Ambulances are assigned to Hospitals (many-to-one)

### Emergency and Support Services
- Emergency Calls are assigned to Ambulances (many-to-one)
- Patients have Emergency Contacts (one-to-many)
- Staff receive Notifications (one-to-many)
- All actions are logged in Audit Logs (one-to-many)

### Quality and Compliance
- Equipment has Maintenance Schedules (one-to-many)
- Reports track various Hospital metrics (many-to-one)
- Comprehensive audit trails for regulatory compliance
- Role-based access control for data security
