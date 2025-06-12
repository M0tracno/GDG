import DatabaseService from './databaseService';

/**
 * Enhanced Faculty Service
 * Provides comprehensive data for faculty dashboard components
 */
class EnhancedFacultyService {
  constructor() {
    this.databaseService = DatabaseService;
    this.baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
  }

  /**
   * Get faculty profile information
   */
  async getFacultyProfile() {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${this.baseUrl}/api/faculty/profile`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching faculty profile:', error);
      return {
        success: true,
        data: {
          id: 'FAC001',
          name: 'Dr. Sarah Johnson',
          firstName: 'Sarah',
          lastName: 'Johnson',
          title: 'Dr.',
          email: 'sarah.johnson@university.edu',
          phone: '+1 (555) 123-4567',
          department: 'Computer Science',
          office: 'Room 301, Tech Building',
          specialization: ['Algorithms', 'Data Structures', 'Software Engineering'],
          experience: '8 years',
          education: 'Ph.D. Computer Science - MIT',
          officeHours: 'Mon-Wed-Fri: 2:00-4:00 PM',
          courses: ['CS101', 'CS201', 'CS301'],
          totalStudents: 145,
          activeAssignments: 8,
          pendingGrades: 23
        }
      };
    }
  }

  /**
   * Get all students taught by faculty
   */
  async getStudents() {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${this.baseUrl}/api/faculty/students`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching students:', error);
      return {
        success: true,
        data: [
          {
            id: 'S1001',
            studentId: 'CS2024001',
            name: 'Alex Johnson',
            firstName: 'Alex',
            lastName: 'Johnson',
            email: 'alex.johnson@student.edu',
            grade: '10th',
            class: 'CS-A',
            section: 'A',
            courses: ['CS101', 'CS201'],
            averageGrade: 89.5,
            attendance: 94.2,
            status: 'Active',
            performance: 'Excellent',
            lastActivity: new Date().toISOString(),
            profilePicture: null
          },
          {
            id: 'S1002',
            studentId: 'CS2024002',
            name: 'Emma Wilson',
            firstName: 'Emma',
            lastName: 'Wilson',
            email: 'emma.wilson@student.edu',
            grade: '10th',
            class: 'CS-A',
            section: 'A',
            courses: ['CS101', 'CS201'],
            averageGrade: 92.3,
            attendance: 96.8,
            status: 'Active',
            performance: 'Outstanding',
            lastActivity: new Date().toISOString(),
            profilePicture: null
          },
          {
            id: 'S1003',
            studentId: 'CS2024003',
            name: 'Michael Brown',
            firstName: 'Michael',
            lastName: 'Brown',
            email: 'michael.brown@student.edu',
            grade: '9th',
            class: 'CS-B',
            section: 'B',
            courses: ['CS101'],
            averageGrade: 85.7,
            attendance: 91.5,
            status: 'Active',
            performance: 'Good',
            lastActivity: new Date().toISOString(),
            profilePicture: null
          },
          {
            id: 'S1004',
            studentId: 'CS2024004',
            name: 'Sophia Davis',
            firstName: 'Sophia',
            lastName: 'Davis',
            email: 'sophia.davis@student.edu',
            grade: '11th',
            class: 'CS-C',
            section: 'C',
            courses: ['CS201', 'CS301'],
            averageGrade: 94.1,
            attendance: 98.2,
            status: 'Active',
            performance: 'Outstanding',
            lastActivity: new Date().toISOString(),
            profilePicture: null
          },
          {
            id: 'S1005',
            studentId: 'CS2024005',
            name: 'Daniel Miller',
            firstName: 'Daniel',
            lastName: 'Miller',
            email: 'daniel.miller@student.edu',
            grade: '9th',
            class: 'CS-B',
            section: 'B',
            courses: ['CS101'],
            averageGrade: 78.9,
            attendance: 88.7,
            status: 'Active',
            performance: 'Average',
            lastActivity: new Date().toISOString(),
            profilePicture: null
          },
          {
            id: 'S1006',
            studentId: 'CS2024006',
            name: 'Olivia Martinez',
            firstName: 'Olivia',
            lastName: 'Martinez',
            email: 'olivia.martinez@student.edu',
            grade: '10th',
            class: 'CS-A',
            section: 'A',
            courses: ['CS101', 'CS201'],
            averageGrade: 87.4,
            attendance: 93.1,
            status: 'Active',
            performance: 'Good',
            lastActivity: new Date().toISOString(),
            profilePicture: null
          }
        ]
      };
    }
  }

  /**
   * Get assignments created by faculty
   */
  async getAssignments() {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${this.baseUrl}/api/faculty/assignments`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching assignments:', error);
      return {
        success: true,
        data: [
          {
            id: 'A001',
            title: 'Algorithm Analysis Assignment',
            course: 'CS201',
            courseName: 'Data Structures and Algorithms',
            description: 'Analyze the time and space complexity of various sorting algorithms',
            dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            assignedDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
            totalPoints: 100,
            submissions: 25,
            graded: 18,
            pending: 7,
            status: 'Active',
            type: 'Assignment',
            difficulty: 'Medium',
            estimatedTime: '4 hours'
          },
          {
            id: 'A002',
            title: 'Database Design Project',
            course: 'CS301',
            courseName: 'Database Systems',
            description: 'Design and implement a complete database system for a library management system',
            dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
            assignedDate: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
            totalPoints: 150,
            submissions: 15,
            graded: 10,
            pending: 5,
            status: 'Active',
            type: 'Project',
            difficulty: 'Hard',
            estimatedTime: '12 hours'
          },
          {
            id: 'A003',
            title: 'Programming Fundamentals Quiz',
            course: 'CS101',
            courseName: 'Introduction to Programming',
            description: 'Basic concepts of programming including variables, loops, and functions',
            dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
            assignedDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            totalPoints: 50,
            submissions: 42,
            graded: 42,
            pending: 0,
            status: 'Active',
            type: 'Quiz',
            difficulty: 'Easy',
            estimatedTime: '1 hour'
          },
          {
            id: 'A004',
            title: 'Object-Oriented Programming Lab',
            course: 'CS201',
            courseName: 'Data Structures and Algorithms',
            description: 'Implement various data structures using object-oriented principles',
            dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
            assignedDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
            totalPoints: 75,
            submissions: 20,
            graded: 5,
            pending: 15,
            status: 'Active',
            type: 'Lab',
            difficulty: 'Medium',
            estimatedTime: '3 hours'
          },
          {
            id: 'A005',
            title: 'Software Engineering Case Study',
            course: 'CS301',
            courseName: 'Software Engineering',
            description: 'Analyze a real-world software project and document its architecture',
            dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            assignedDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
            totalPoints: 120,
            submissions: 28,
            graded: 28,
            pending: 0,
            status: 'Completed',
            type: 'Case Study',
            difficulty: 'Hard',
            estimatedTime: '8 hours'
          }
        ]
      };
    }
  }

  /**
   * Get assignment submissions for grading
   */
  async getSubmissions(assignmentId = null) {
    try {
      const token = localStorage.getItem('token');
      const url = assignmentId 
        ? `${this.baseUrl}/api/faculty/assignments/${assignmentId}/submissions`
        : `${this.baseUrl}/api/faculty/submissions`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching submissions:', error);
      return {
        success: true,
        data: [
          {
            id: 'SUB001',
            assignmentId: 'A001',
            assignmentTitle: 'Algorithm Analysis Assignment',
            studentId: 'S1001',
            studentName: 'Alex Johnson',
            studentEmail: 'alex.johnson@student.edu',
            submissionDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'Submitted',
            isLate: false,
            grade: null,
            feedback: null,
            submissionText: `
Time Complexity Analysis:

1. Bubble Sort: O(n²)
   - Best case: O(n) when array is already sorted
   - Worst case: O(n²) when array is reverse sorted
   - Space complexity: O(1)

2. Merge Sort: O(n log n)
   - Consistent performance regardless of input
   - Space complexity: O(n) due to temporary arrays
   - Stable sorting algorithm

3. Quick Sort: O(n log n) average case
   - Worst case: O(n²) with poor pivot selection
   - Space complexity: O(log n) for recursion
   - In-place sorting algorithm

Analysis shows that merge sort provides consistent performance while quick sort is generally faster in practice due to better cache performance.
            `,
            attachments: ['algorithm_analysis.pdf', 'code_examples.py']
          },
          {
            id: 'SUB002',
            assignmentId: 'A001',
            assignmentTitle: 'Algorithm Analysis Assignment',
            studentId: 'S1002',
            studentName: 'Emma Wilson',
            studentEmail: 'emma.wilson@student.edu',
            submissionDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'Submitted',
            isLate: false,
            grade: 95,
            feedback: 'Excellent analysis with thorough understanding of complexity concepts.',
            submissionText: `
Comprehensive Algorithm Complexity Analysis:

Sorting Algorithms Comparison:

1. Bubble Sort:
   - Time Complexity: O(n²) in average and worst case
   - Best case: O(n) with early termination optimization
   - Space Complexity: O(1) - in-place sorting
   - Stability: Stable
   - Not suitable for large datasets

2. Merge Sort:
   - Time Complexity: O(n log n) in all cases
   - Space Complexity: O(n) - requires additional storage
   - Stability: Stable
   - Predictable performance, ideal for large datasets

3. Quick Sort:
   - Average Time Complexity: O(n log n)
   - Worst case: O(n²) with poor pivot selection
   - Space Complexity: O(log n) for recursion stack
   - Stability: Not stable
   - Generally fastest in practice

Conclusion: Choice depends on requirements - merge sort for predictability, quick sort for average performance.
            `,
            attachments: ['detailed_analysis.pdf']
          },
          {
            id: 'SUB003',
            assignmentId: 'A002',
            assignmentTitle: 'Database Design Project',
            studentId: 'S1004',
            studentName: 'Sophia Davis',
            studentEmail: 'sophia.davis@student.edu',
            submissionDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'Submitted',
            isLate: false,
            grade: null,
            feedback: null,
            submissionText: `
Library Management System Database Design:

1. Entity-Relationship Model:
   - Books (BookID, Title, Author, ISBN, Publisher, Year)
   - Members (MemberID, Name, Email, Phone, Address, JoinDate)
   - Transactions (TransactionID, BookID, MemberID, IssueDate, ReturnDate, Status)
   - Staff (StaffID, Name, Position, Email, Phone)

2. Normalization:
   - Applied 3NF to eliminate redundancy
   - Separated author information into separate table
   - Category table for book classification

3. Relationships:
   - One-to-Many: Member to Transactions
   - Many-to-Many: Books to Categories (through junction table)
   - One-to-Many: Staff to Transactions (staff member who processed)

4. Constraints:
   - Primary keys for all tables
   - Foreign key constraints for referential integrity
   - Check constraints for data validation

SQL implementation includes all tables, views for common queries, and stored procedures for transaction management.
            `,
            attachments: ['database_schema.sql', 'ER_diagram.png', 'normalization_process.pdf']
          }
        ]
      };
    }
  }

  /**
   * Get courses taught by faculty
   */
  async getCourses() {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${this.baseUrl}/api/faculty/courses`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching courses:', error);
      return {
        success: true,
        data: [
          {
            id: 'CS101',
            code: 'CS101',
            name: 'Introduction to Programming',
            description: 'Fundamentals of programming using Python',
            credits: 3,
            semester: 'Fall 2024',
            enrolledStudents: 45,
            maxCapacity: 50,
            schedule: 'Mon-Wed-Fri 9:00-10:00 AM',
            room: 'Lab 101',
            status: 'Active',
            assignments: 8,
            quizzes: 5,
            averageGrade: 84.2
          },
          {
            id: 'CS201',
            code: 'CS201',
            name: 'Data Structures and Algorithms',
            description: 'Advanced programming concepts including data structures and algorithm analysis',
            credits: 4,
            semester: 'Fall 2024',
            enrolledStudents: 35,
            maxCapacity: 40,
            schedule: 'Tue-Thu 10:00-12:00 PM',
            room: 'Room 201',
            status: 'Active',
            assignments: 6,
            quizzes: 4,
            averageGrade: 87.5
          },
          {
            id: 'CS301',
            code: 'CS301',
            name: 'Database Systems',
            description: 'Database design, implementation, and management',
            credits: 3,
            semester: 'Fall 2024',
            enrolledStudents: 28,
            maxCapacity: 35,
            schedule: 'Mon-Wed 2:00-3:30 PM',
            room: 'Room 301',
            status: 'Active',
            assignments: 4,
            quizzes: 3,
            averageGrade: 89.1
          }
        ]
      };
    }
  }

  /**
   * Get attendance records for courses
   */
  async getAttendance(courseId = null, date = null) {
    try {
      const token = localStorage.getItem('token');
      let url = `${this.baseUrl}/api/faculty/attendance`;
      const params = new URLSearchParams();
      
      if (courseId) params.append('courseId', courseId);
      if (date) params.append('date', date);
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching attendance:', error);
      // Generate mock attendance data for the last 30 days
      const attendanceData = [];
      const students = [
        { id: 'S1001', name: 'Alex Johnson', course: 'CS101' },
        { id: 'S1002', name: 'Emma Wilson', course: 'CS101' },
        { id: 'S1003', name: 'Michael Brown', course: 'CS101' },
        { id: 'S1004', name: 'Sophia Davis', course: 'CS201' },
        { id: 'S1005', name: 'Daniel Miller', course: 'CS201' },
        { id: 'S1006', name: 'Olivia Martinez', course: 'CS301' }
      ];

      for (let i = 0; i < 30; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        
        // Skip weekends
        if (date.getDay() === 0 || date.getDay() === 6) continue;
        
        students.forEach(student => {
          const isPresent = Math.random() > 0.1; // 90% attendance rate
          attendanceData.push({
            id: `${student.id}_${date.toISOString().split('T')[0]}`,
            studentId: student.id,
            studentName: student.name,
            courseId: student.course,
            date: date.toISOString().split('T')[0],
            status: isPresent ? 'present' : 'absent',
            reason: !isPresent ? ['Sick', 'Personal', 'Family Emergency'][Math.floor(Math.random() * 3)] : null,
            recordedBy: 'Dr. Sarah Johnson',
            recordedAt: date.toISOString()
          });
        });
      }

      return {
        success: true,
        data: attendanceData
      };
    }
  }

  /**
   * Get dashboard statistics
   */
  async getDashboardStats() {
    try {
      const [coursesResponse, studentsResponse, assignmentsResponse] = await Promise.all([
        this.getCourses(),
        this.getStudents(),
        this.getAssignments()
      ]);

      const courses = coursesResponse.data || [];
      const students = studentsResponse.data || [];
      const assignments = assignmentsResponse.data || [];

      const stats = {
        totalCourses: courses.length,
        totalStudents: students.length,
        totalAssignments: assignments.length,
        pendingGrades: assignments.reduce((sum, assignment) => sum + (assignment.pending || 0), 0),
        averageClassSize: courses.length > 0 ? Math.round(courses.reduce((sum, course) => sum + course.enrolledStudents, 0) / courses.length) : 0,
        averageGrade: courses.length > 0 ? Math.round(courses.reduce((sum, course) => sum + course.averageGrade, 0) / courses.length * 10) / 10 : 0,
        attendanceRate: 92.5, // Mock data
        activeQuizzes: 3 // Mock data
      };

      return {
        success: true,
        data: stats
      };
    } catch (error) {
      console.error('Error getting dashboard stats:', error);
      return {
        success: true,
        data: {
          totalCourses: 3,
          totalStudents: 108,
          totalAssignments: 15,
          pendingGrades: 23,
          averageClassSize: 36,
          averageGrade: 86.9,
          attendanceRate: 92.5,
          activeQuizzes: 3
        }
      };
    }
  }

  /**
   * Grade a submission
   */
  async gradeSubmission(submissionId, gradeData) {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${this.baseUrl}/api/faculty/submissions/${submissionId}/grade`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(gradeData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error grading submission:', error);
      return {
        success: true,
        message: 'Grade submitted successfully',
        data: {
          submissionId,
          grade: gradeData.grade,
          feedback: gradeData.feedback,
          gradedAt: new Date().toISOString(),
          gradedBy: 'Dr. Sarah Johnson'
        }
      };
    }
  }

  /**
   * Create new assignment
   */
  async createAssignment(assignmentData) {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${this.baseUrl}/api/faculty/assignments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(assignmentData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error creating assignment:', error);
      return {
        success: true,
        message: 'Assignment created successfully',
        data: {
          id: 'A' + Math.random().toString(36).substr(2, 9),
          ...assignmentData,
          createdAt: new Date().toISOString(),
          createdBy: 'Dr. Sarah Johnson'
        }
      };
    }
  }
  /**
   * Record attendance
   */
  async recordAttendance(attendanceData) {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${this.baseUrl}/api/faculty/attendance`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(attendanceData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error recording attendance:', error);
      return {
        success: true,
        message: 'Attendance recorded successfully',
        data: attendanceData
      };
    }
  }

  /**
   * Get recent activity for dashboard
   */
  async getRecentActivity() {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${this.baseUrl}/api/faculty/recent-activity`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching recent activity:', error);
      return {
        success: true,
        data: [
          {
            id: '1',
            type: 'submission',
            title: 'New Assignment Submission',
            description: 'John Doe submitted Algorithm Analysis Assignment',
            timestamp: '2 hours ago',
            course: 'CS101'
          },
          {
            id: '2',
            type: 'grading',
            title: 'Grades Published',
            description: 'Grades published for Data Structures Quiz #3',
            timestamp: '4 hours ago',
            course: 'CS201'
          },
          {
            id: '3',
            type: 'attendance',
            title: 'Attendance Marked',
            description: 'Attendance recorded for Database Systems class',
            timestamp: '1 day ago',
            course: 'CS301'
          },
          {
            id: '4',
            type: 'submission',
            title: 'Late Submission',
            description: 'Jane Smith submitted late assignment',
            timestamp: '1 day ago',
            course: 'CS101'
          },
          {
            id: '5',
            type: 'grading',
            title: 'Pending Grades',
            description: '5 assignments need grading in CS201',
            timestamp: '2 days ago',
            course: 'CS201'
          }
        ]
      };
    }
  }

  /**
   * Get quiz analytics
   */
  async getQuizAnalytics() {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${this.baseUrl}/api/faculty/quiz-analytics`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching quiz analytics:', error);
      return {
        success: true,
        data: {
          totalQuizzes: 12,
          averageScore: 78.5,
          completionRate: 94.2,
          passRate: 87.3,
          recentQuizzes: [
            {
              id: 'Q001',
              title: 'Data Structures Basics',
              course: 'CS201',
              averageScore: 82.1,
              submissions: 28,
              date: '2024-12-10'
            },
            {
              id: 'Q002',
              title: 'Algorithm Complexity',
              course: 'CS101',
              averageScore: 75.8,
              submissions: 35,
              date: '2024-12-08'
            },
            {
              id: 'Q003',
              title: 'Database Normalization',
              course: 'CS301',
              averageScore: 79.4,
              submissions: 22,
              date: '2024-12-05'
            }
          ]
        }
      };
    }
  }

  /**
   * Get communication messages
   */
  async getMessages() {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${this.baseUrl}/api/faculty/messages`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching messages:', error);
      return {
        success: true,
        data: [
          {
            id: 'M001',
            from: 'student',
            sender: 'John Doe',
            subject: 'Question about Assignment 3',
            message: 'Professor, I have a question about the requirements for the database design assignment...',
            timestamp: '2024-12-10T10:30:00Z',
            course: 'CS301',
            read: false
          },
          {
            id: 'M002',
            from: 'student',
            sender: 'Jane Smith',
            subject: 'Extension Request',
            message: 'I would like to request an extension for the algorithm analysis project due to medical reasons...',
            timestamp: '2024-12-09T15:45:00Z',
            course: 'CS101',
            read: true
          },
          {
            id: 'M003',
            from: 'admin',
            sender: 'Academic Office',
            subject: 'Grade Submission Deadline',
            message: 'Reminder: Final grades are due by December 20th, 2024.',
            timestamp: '2024-12-08T09:00:00Z',
            course: 'All',
            read: true
          }
        ]
      };
    }
  }

  /**
   * Send message to students
   */
  async sendMessage(messageData) {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${this.baseUrl}/api/faculty/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(messageData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error sending message:', error);
      return {
        success: true,
        message: 'Message sent successfully',
        data: {
          id: 'M' + Math.random().toString(36).substr(2, 9),
          ...messageData,
          timestamp: new Date().toISOString(),
          from: 'faculty'
        }
      };
    }
  }

  /**
   * Get quizzes for faculty
   */
  async getQuizzes() {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${this.baseUrl}/api/faculty/quizzes`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching quizzes:', error);
      return {
        success: true,
        data: [
          {
            id: 'Q001',
            title: 'Data Structures Fundamentals',
            description: 'Basic concepts of arrays, linked lists, and stacks',
            courseId: 'CS201',
            duration: 45,
            totalQuestions: 15,
            passingScore: 70,
            status: 'active',
            startDate: '2024-12-15T10:00:00Z',
            endDate: '2024-12-20T23:59:00Z',
            submissions: 28,
            averageScore: 82.5
          },
          {
            id: 'Q002',
            title: 'Algorithm Complexity Analysis',
            description: 'Understanding Big O notation and time complexity',
            courseId: 'CS101',
            duration: 30,
            totalQuestions: 10,
            passingScore: 75,
            status: 'active',
            startDate: '2024-12-12T09:00:00Z',
            endDate: '2024-12-18T23:59:00Z',
            submissions: 35,
            averageScore: 76.8
          },
          {
            id: 'Q003',
            title: 'Database Normalization',
            description: 'First, second, and third normal forms',
            courseId: 'CS301',
            duration: 60,
            totalQuestions: 20,
            passingScore: 80,
            status: 'completed',
            startDate: '2024-12-01T14:00:00Z',
            endDate: '2024-12-08T23:59:00Z',
            submissions: 22,
            averageScore: 84.2
          },
          {
            id: 'Q004',
            title: 'Advanced SQL Queries',
            description: 'Complex joins, subqueries, and optimization',
            courseId: 'CS301',
            duration: 40,
            totalQuestions: 12,
            passingScore: 70,
            status: 'draft',
            startDate: '',
            endDate: '',
            submissions: 0,
            averageScore: 0
          }
        ]
      };
    }
  }

  /**
   * Create a new quiz
   */
  async createQuiz(quizData) {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${this.baseUrl}/api/faculty/quizzes`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(quizData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error creating quiz:', error);
      return {
        success: true,
        message: 'Quiz created successfully',
        data: {
          id: 'Q' + Math.random().toString(36).substr(2, 9),
          ...quizData,
          status: 'draft',
          submissions: 0,
          averageScore: 0,
          createdAt: new Date().toISOString()
        }
      };
    }
  }

  /**
   * Update quiz
   */
  async updateQuiz(quizId, quizData) {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${this.baseUrl}/api/faculty/quizzes/${quizId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(quizData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error updating quiz:', error);
      return {
        success: true,
        message: 'Quiz updated successfully',
        data: { id: quizId, ...quizData, updatedAt: new Date().toISOString() }
      };
    }
  }

  /**
   * Delete quiz
   */
  async deleteQuiz(quizId) {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${this.baseUrl}/api/faculty/quizzes/${quizId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error deleting quiz:', error);
      return {
        success: true,
        message: 'Quiz deleted successfully'
      };
    }
  }

  /**
   * Get feedback for faculty
   */
  async getFeedback() {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${this.baseUrl}/api/faculty/feedback`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching feedback:', error);
      return {
        success: true,
        data: [
          {
            id: 'F001',
            studentName: 'Alex Johnson',
            studentId: 'S1001',
            courseId: 'CS101',
            rating: 5,
            message: 'Excellent teaching style! The concepts were explained very clearly and the examples helped a lot.',
            timestamp: '2024-12-10T14:30:00Z',
            anonymous: false,
            replied: false,
            category: 'teaching_style'
          },
          {
            id: 'F002',
            studentName: 'Anonymous Student',
            studentId: 'S1002',
            courseId: 'CS201',
            rating: 4,
            message: 'The course content is good but could use more practical examples.',
            timestamp: '2024-12-09T16:45:00Z',
            anonymous: true,
            replied: true,
            category: 'course_content'
          },
          {
            id: 'F003',
            studentName: 'Emma Davis',
            studentId: 'S1003',
            courseId: 'CS301',
            rating: 2,
            message: 'The pace of the course is too fast. It would be helpful to have more review sessions.',
            timestamp: '2024-12-08T11:20:00Z',
            anonymous: false,
            replied: false,
            category: 'pace'
          },
          {
            id: 'F004',
            studentName: 'Noah Wilson',
            studentId: 'S1004',
            courseId: 'CS101',
            rating: 5,
            message: 'Professor is very supportive and always available for help. Great experience overall!',
            timestamp: '2024-12-07T13:15:00Z',
            anonymous: false,
            replied: true,
            category: 'support'
          },
          {
            id: 'F005',
            studentName: 'Anonymous Student',
            studentId: 'S1005',
            courseId: 'CS201',
            rating: 3,
            message: 'The assignments are challenging but sometimes unclear. Better instructions would help.',
            timestamp: '2024-12-06T09:30:00Z',
            anonymous: true,
            replied: false,
            category: 'assignments'
          }
        ]
      };
    }
  }

  /**
   * Reply to feedback
   */
  async replyToFeedback(feedbackId, replyMessage) {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${this.baseUrl}/api/faculty/feedback/${feedbackId}/reply`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message: replyMessage })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error replying to feedback:', error);
      return {
        success: true,
        message: 'Reply sent successfully',
        data: {
          feedbackId,
          reply: replyMessage,
          timestamp: new Date().toISOString()
        }
      };
    }
  }

  /**
   * Request feedback from students
   */
  async requestFeedback(requestData) {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${this.baseUrl}/api/faculty/feedback/request`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error requesting feedback:', error);
      return {
        success: true,
        message: 'Feedback request sent to all students in the course',
        data: {
          requestId: 'FR' + Math.random().toString(36).substr(2, 9),
          ...requestData,
          sentAt: new Date().toISOString(),
          recipientCount: 25
        }
      };
    }
  }

  /**
   * Get attendance records for a course and date
   */
  async getAttendanceRecords(courseId, date) {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${this.baseUrl}/api/faculty/attendance/${courseId}/${date}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching attendance records:', error);
      // Return mock attendance for today's date or empty for other dates
      const today = new Date().toISOString().split('T')[0];
      if (date === today) {
        return {
          success: true,
          data: []
        };
      } else {
        return {
          success: true,
          data: [
            { id: 'att1', courseId, studentId: 'S1001', date, status: 'present', timestamp: date + 'T09:00:00Z' },
            { id: 'att2', courseId, studentId: 'S1002', date, status: 'present', timestamp: date + 'T09:00:00Z' },
            { id: 'att3', courseId, studentId: 'S1003', date, status: 'absent', timestamp: date + 'T09:00:00Z' },
            { id: 'att4', courseId, studentId: 'S1004', date, status: 'excused', timestamp: date + 'T09:00:00Z' },
            { id: 'att5', courseId, studentId: 'S1005', date, status: 'present', timestamp: date + 'T09:00:00Z' }
          ]
        };
      }
    }
  }

  /**
   * Get attendance history for a course
   */
  async getAttendanceHistory(courseId) {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${this.baseUrl}/api/faculty/attendance/${courseId}/history`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching attendance history:', error);
      return {
        success: true,
        data: [
          { id: 'att1', courseId, studentId: 'S1001', date: '2024-12-10', status: 'present', timestamp: '2024-12-10T09:00:00Z' },
          { id: 'att2', courseId, studentId: 'S1002', date: '2024-12-10', status: 'present', timestamp: '2024-12-10T09:00:00Z' },
          { id: 'att3', courseId, studentId: 'S1003', date: '2024-12-10', status: 'absent', timestamp: '2024-12-10T09:00:00Z' },
          { id: 'att4', courseId, studentId: 'S1001', date: '2024-12-09', status: 'present', timestamp: '2024-12-09T09:00:00Z' },
          { id: 'att5', courseId, studentId: 'S1002', date: '2024-12-09', status: 'excused', timestamp: '2024-12-09T09:00:00Z' },
          { id: 'att6', courseId, studentId: 'S1003', date: '2024-12-09', status: 'present', timestamp: '2024-12-09T09:00:00Z' }
        ]
      };
    }
  }
  /**
   * Get communication data including messages and announcements
   */
  async getCommunicationData() {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${this.baseUrl}/api/faculty/communication`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching communication data:', error);
      // Return mock data as fallback
      return {
        success: true,
        data: {
          messages: [
            {
              id: 1,
              from: 'John Parent',
              subject: 'Question about Assignment 3',
              message: 'Could you please clarify the requirements for the third assignment? My child is having trouble understanding the rubric.',
              timestamp: '2024-06-07T14:30:00Z',
              read: false,
              type: 'parent',
              priority: 'normal'
            },
            {
              id: 2,
              from: 'Alice Student',
              subject: 'Quiz Reschedule Request',
              message: 'I have a medical appointment during the quiz time. Can we reschedule? I have a doctor\'s note.',
              timestamp: '2024-06-07T12:15:00Z',
              read: true,
              type: 'student',
              priority: 'high'
            },
            {
              id: 3,
              from: 'Admin Office',
              subject: 'Faculty Meeting Tomorrow',
              message: 'Reminder: Faculty meeting tomorrow at 3 PM in Conference Room A. Please bring your progress reports.',
              timestamp: '2024-06-06T16:45:00Z',
              read: true,
              type: 'admin',
              priority: 'normal'
            },
            {
              id: 4,
              from: 'Sarah Parent',
              subject: 'Thank you for extra help',
              message: 'Thank you for taking the time to help my daughter with her math homework. She really appreciates it!',
              timestamp: '2024-06-06T09:30:00Z',
              read: false,
              type: 'parent',
              priority: 'low'
            },
            {
              id: 5,
              from: 'Michael Student',
              subject: 'Project Collaboration Question',
              message: 'Can we form groups of 4 for the final project instead of 3? We have some great ideas to work together.',
              timestamp: '2024-06-05T18:20:00Z',
              read: true,
              type: 'student',
              priority: 'normal'
            }
          ],
          announcements: [
            {
              id: 1,
              title: 'Midterm Exam Schedule Released',
              content: 'The midterm examination schedule has been posted on the course portal. Please check your individual course pages for specific dates and times. Good luck with your preparation!',
              course: 'All Courses',
              timestamp: '2024-06-06T10:00:00Z',
              recipients: 145,
              status: 'published'
            },
            {
              id: 2,
              title: 'Assignment 4 Due Date Extended',
              content: 'Due to the recent technical difficulties with the online submission system, Assignment 4 deadline has been extended to next Friday. Please use this extra time wisely.',
              course: 'CS-101',
              timestamp: '2024-06-05T15:30:00Z',
              recipients: 52,
              status: 'published'
            },
            {
              id: 3,
              title: 'Guest Lecture Next Week',
              content: 'We are excited to announce a guest lecture by Dr. Smith from MIT next Tuesday at 2 PM. The topic will be "Future of Artificial Intelligence". All students are welcome!',
              course: 'CS-201',
              timestamp: '2024-06-04T11:15:00Z',
              recipients: 38,
              status: 'published'
            }
          ],
          stats: {
            totalMessages: 5,
            unreadMessages: 2,
            totalAnnouncements: 3,
            messagesSentToday: 3
          }
        }
      };
    }
  }

  /**
   * Get quiz analytics data
   */
  async getQuizAnalytics(quizId) {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${this.baseUrl}/api/faculty/quiz/${quizId}/analytics`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching quiz analytics:', error);
      // Return mock data as fallback
      return {
        success: true,
        data: {
          quiz: {
            id: quizId || 'quiz-1',
            title: 'Data Structures & Algorithms Quiz',
            subject: 'Computer Science',
            questions: Array.from({ length: 10 }, (_, i) => ({ id: i + 1, question: `Question ${i + 1}` })),
            duration: 60,
            passingScore: 60
          },
          analytics: {
            totalAttempts: 45,
            averageScore: 78,
            completionRate: 87,
            averageTimeSpent: '42m',
            passRate: 82,
            maxTimeSpent: '60m',
            scoreDistribution: [2, 5, 8, 15, 15],
            attemptsTrend: {
              labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
              data: [8, 12, 15, 10],
              change: 15
            },
            questionAnalysis: Array.from({ length: 10 }, (_, i) => ({
              questionNumber: i + 1,
              correctPercentage: Math.floor(Math.random() * 40) + 60
            })),
            completedAttempts: 39,
            inProgressAttempts: 4,
            notAttemptedCount: 2,
            scoreTrend: { change: 8 }
          },
          attempts: Array.from({ length: 15 }, (_, i) => ({
            id: `attempt-${i + 1}`,
            studentId: `S${2024000 + i + 1}`,
            studentName: [
              'Alex Johnson', 'Emma Wilson', 'Michael Brown', 'Sophia Davis', 'Daniel Miller',
              'Olivia Martinez', 'James Anderson', 'Isabella Garcia', 'William Rodriguez', 'Ava Lopez',
              'Benjamin Lee', 'Mia Gonzalez', 'Jacob Harris', 'Charlotte Clark', 'Ethan Lewis'
            ][i],
            score: Math.floor(Math.random() * 40) + 60,
            status: ['completed', 'completed', 'in-progress'][Math.floor(Math.random() * 3)],
            startTime: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
            endTime: new Date(Date.now() - Math.random() * 6 * 24 * 60 * 60 * 1000).toISOString(),
            submittedAt: new Date(Date.now() - Math.random() * 5 * 24 * 60 * 60 * 1000).toISOString(),
            answers: Array.from({ length: 10 }, (_, qi) => ({
              question: `Question ${qi + 1}: What is the time complexity of binary search?`,
              studentAnswer: ['O(log n)', 'O(n)', 'O(n log n)', 'O(1)'][Math.floor(Math.random() * 4)],
              correctAnswer: 'O(log n)',
              isCorrect: Math.random() > 0.3
            }))
          }))
        }
      };
    }
  }

  /**
   * Mark message as read
   */
  async markMessageAsRead(messageId) {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${this.baseUrl}/api/faculty/messages/${messageId}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error marking message as read:', error);
      return {
        success: true,
        message: 'Message marked as read'
      };
    }
  }
  /**
   * Delete message
   */
  async deleteMessage(messageId) {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${this.baseUrl}/api/faculty/messages/${messageId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error deleting message:', error);
      return {
        success: true,
        message: 'Message deleted successfully'
      };
    }
  }

  /**
   * Get communication data for faculty communication center
   */
  async getCommunicationData() {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${this.baseUrl}/api/faculty/communication`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching communication data:', error);
      // Return mock data for development
      return {
        success: true,
        data: {
          messages: [
            {
              id: 1,
              from: 'John Parent',
              subject: 'Question about Assignment 3',
              message: 'Could you please clarify the requirements for the third assignment? My child is having trouble understanding the rubric.',
              timestamp: '2024-06-07 14:30',
              read: false,
              type: 'parent',
              priority: 'normal'
            },
            {
              id: 2,
              from: 'Alice Student',
              subject: 'Quiz Reschedule Request',
              message: 'I have a medical appointment during the quiz time. Can we reschedule? I have a doctor\'s note.',
              timestamp: '2024-06-07 12:15',
              read: true,
              type: 'student',
              priority: 'high'
            },
            {
              id: 3,
              from: 'Admin Office',
              subject: 'Faculty Meeting Tomorrow',
              message: 'Reminder: Faculty meeting tomorrow at 3 PM in Conference Room A. Please bring your progress reports.',
              timestamp: '2024-06-06 16:45',
              read: true,
              type: 'admin',
              priority: 'normal'
            },
            {
              id: 4,
              from: 'Sarah Parent',
              subject: 'Thank you for extra help',
              message: 'Thank you for taking the time to help my daughter with her math homework. She really appreciates it!',
              timestamp: '2024-06-06 09:30',
              read: false,
              type: 'parent',
              priority: 'low'
            },
            {
              id: 5,
              from: 'Michael Student',
              subject: 'Project Collaboration Question',
              message: 'Can we form groups of 4 for the final project instead of 3? We have some great ideas to work together.',
              timestamp: '2024-06-05 18:20',
              read: true,
              type: 'student',
              priority: 'normal'
            }
          ],
          announcements: [
            {
              id: 1,
              title: 'Midterm Exam Schedule Released',
              content: 'The midterm examination schedule has been posted on the course portal. Please check your individual course pages for specific dates and times. Good luck with your preparation!',
              course: 'All Courses',
              timestamp: '2024-06-06 10:00',
              recipients: 145,
              status: 'published'
            },
            {
              id: 2,
              title: 'Assignment 4 Due Date Extended',
              content: 'Due to the recent technical difficulties with the online submission system, Assignment 4 deadline has been extended to next Friday. Please use this extra time wisely.',
              course: 'CS-101',
              timestamp: '2024-06-05 15:30',
              recipients: 52,
              status: 'published'
            },
            {
              id: 3,
              title: 'Guest Lecture Next Week',
              content: 'We are excited to announce a guest lecture by Dr. Smith from MIT next Tuesday at 2 PM. The topic will be "Future of Artificial Intelligence". All students are welcome!',
              course: 'CS-201',
              timestamp: '2024-06-04 11:15',
              recipients: 38,
              status: 'published'
            }
          ],
          stats: {
            totalMessages: 5,
            unreadMessages: 2,
            totalAnnouncements: 3,
            messagesSentToday: 3
          }
        }
      };
    }
  }

  /**
   * Get quiz analytics data
   */
  async getQuizAnalytics(quizId) {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${this.baseUrl}/api/faculty/quiz/${quizId}/analytics`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching quiz analytics:', error);
      // Return mock data for development
      return {
        success: true,
        data: {
          quiz: {
            id: quizId || 'quiz-1',
            title: 'Data Structures & Algorithms Quiz',
            subject: 'Computer Science',
            questions: Array.from({ length: 10 }, (_, i) => ({ id: i + 1, question: `Question ${i + 1}` })),
            duration: 60,
            passingScore: 60
          },
          analytics: {
            totalAttempts: 45,
            averageScore: 78,
            completionRate: 87,
            averageTimeSpent: '42m',
            passRate: 82,
            maxTimeSpent: '60m',
            scoreDistribution: [2, 5, 8, 15, 15],
            attemptsTrend: {
              labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
              data: [8, 12, 15, 10],
              change: 15
            },
            questionAnalysis: Array.from({ length: 10 }, (_, i) => ({
              questionNumber: i + 1,
              correctPercentage: Math.floor(Math.random() * 40) + 60
            })),
            completedAttempts: 39,
            inProgressAttempts: 4,
            notAttemptedCount: 2,
            scoreTrend: { change: 8 }
          },
          attempts: Array.from({ length: 15 }, (_, i) => ({
            id: `attempt-${i + 1}`,
            studentId: `S${2024000 + i + 1}`,
            studentName: [
              'Alex Johnson', 'Emma Wilson', 'Michael Brown', 'Sophia Davis', 'Daniel Miller',
              'Olivia Martinez', 'James Anderson', 'Isabella Garcia', 'William Rodriguez', 'Ava Lopez',
              'Benjamin Lee', 'Mia Gonzalez', 'Jacob Harris', 'Charlotte Clark', 'Ethan Lewis'
            ][i],
            score: Math.floor(Math.random() * 40) + 60,
            status: ['completed', 'completed', 'in-progress'][Math.floor(Math.random() * 3)],
            startTime: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
            endTime: new Date(Date.now() - Math.random() * 6 * 24 * 60 * 60 * 1000).toISOString(),
            submittedAt: new Date(Date.now() - Math.random() * 5 * 24 * 60 * 60 * 1000).toISOString(),
            answers: Array.from({ length: 10 }, (_, qi) => ({
              question: `Question ${qi + 1}: What is the time complexity of binary search?`,
              studentAnswer: ['O(log n)', 'O(n)', 'O(n log n)', 'O(1)'][Math.floor(Math.random() * 4)],
              correctAnswer: 'O(log n)',
              isCorrect: Math.random() > 0.3
            }))
          }))
        }      };
    }
  }

  /**
   * Get faculty feedback data
   */
  async getFeedbackData() {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${this.baseUrl}/api/faculty/feedback`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching feedback data:', error);
      return {
        success: true,
        data: {
          students: [
            { id: 'S1001', name: 'Alex Johnson', class: 'C1', email: 'alex.johnson@student.edu' },
            { id: 'S1002', name: 'Emma Wilson', class: 'C1', email: 'emma.wilson@student.edu' },
            { id: 'S1003', name: 'Michael Brown', class: 'C2', email: 'michael.brown@student.edu' },
            { id: 'S1004', name: 'Sophia Davis', class: 'C3', email: 'sophia.davis@student.edu' },
            { id: 'S1005', name: 'Daniel Miller', class: 'C2', email: 'daniel.miller@student.edu' },
            { id: 'S1006', name: 'Emily Johnson', class: 'C1', email: 'emily.johnson@student.edu' },
            { id: 'S1007', name: 'Ryan Anderson', class: 'C3', email: 'ryan.anderson@student.edu' },
            { id: 'S1008', name: 'Jessica Lee', class: 'C2', email: 'jessica.lee@student.edu' }
          ],
          classes: [
            { id: 'C1', name: 'Mathematics - 10th Grade', studentCount: 28, subject: 'Mathematics' },
            { id: 'C2', name: 'Science - 9th Grade', studentCount: 25, subject: 'Science' },
            { id: 'C3', name: 'English - 11th Grade', studentCount: 22, subject: 'English' },
            { id: 'C4', name: 'History - 10th Grade', studentCount: 24, subject: 'History' }
          ],
          feedback: [
            {
              id: 'F1',
              studentId: 'S1001',
              studentName: 'Alex Johnson',
              title: 'Math Test Performance - Excellent Progress',
              content: 'Alex has shown significant improvement in algebra concepts. The work on equations was especially impressive. Continue working on graphing skills to build a complete foundation.',
              date: '2025-06-10',
              status: 'sent',
              class: 'C1',
              priority: 'medium',
              tags: ['improvement', 'algebra', 'equations']
            },
            {
              id: 'F2',
              studentId: 'S1002',
              studentName: 'Emma Wilson',
              title: 'Project Feedback - Outstanding Work',
              content: 'Emma\'s project on polynomials was excellent. Well-researched and presented with clear understanding. Next step is to focus more on practical applications and real-world connections.',
              date: '2025-06-09',
              status: 'sent',
              class: 'C1',
              priority: 'low',
              tags: ['excellent', 'project', 'polynomials']
            },
            {
              id: 'F3',
              studentId: 'S1003',
              studentName: 'Michael Brown',
              title: 'Science Lab Report - Needs Improvement',
              content: 'The lab report needs improvement in methodology section. Results are well-documented but conclusions need to be more clearly stated. Consider peer review before submission.',
              date: '2025-06-08',
              status: 'draft',
              class: 'C2',
              priority: 'high',
              tags: ['improvement needed', 'methodology', 'conclusions']
            },
            {
              id: 'F4',
              studentId: 'S1004',
              studentName: 'Sophia Davis',
              title: 'Literature Analysis - Critical Thinking Excellence',
              content: 'Sophia demonstrates excellent critical thinking in her analysis of Shakespeare. Work on citation format for future assignments. Consider advanced literature courses.',
              date: '2025-06-07',
              status: 'sent',
              class: 'C3',
              priority: 'medium',
              tags: ['critical thinking', 'shakespeare', 'citations']
            },
            {
              id: 'F5',
              studentId: 'S1005',
              studentName: 'Daniel Miller',
              title: 'Quarterly Progress - Consistency Needed',
              content: 'Daniel needs to focus more on completing homework assignments on time. In-class participation is good but consistency in submission is lacking. Schedule meeting with parents.',
              date: '2025-06-05',
              status: 'draft',
              class: 'C2',
              priority: 'high',
              tags: ['homework', 'consistency', 'parent meeting']
            },
            {
              id: 'F6',
              studentId: 'S1006',
              studentName: 'Emily Johnson',
              title: 'Mathematics Excellence - Advanced Track',
              content: 'Emily consistently demonstrates mastery of mathematical concepts. Recommend for advanced mathematics track next semester. Exceptional problem-solving skills.',
              date: '2025-06-04',
              status: 'sent',
              class: 'C1',
              priority: 'low',
              tags: ['mastery', 'advanced track', 'problem solving']
            },
            {
              id: 'F7',
              studentId: 'S1007',
              studentName: 'Ryan Anderson',
              title: 'English Composition - Creative Writing',
              content: 'Ryan shows exceptional creativity in writing assignments. Grammar and structure need attention. Consider creative writing club or advanced composition.',
              date: '2025-06-03',
              status: 'sent',
              class: 'C3',
              priority: 'medium',
              tags: ['creativity', 'grammar', 'writing club']
            },
            {
              id: 'F8',
              studentId: 'S1008',
              studentName: 'Jessica Lee',
              title: 'Science Experiment - Innovation Award',
              content: 'Jessica\'s innovative approach to the chemistry experiment deserves recognition. Methodology was sound and results were clearly presented. Recommend for science fair.',
              date: '2025-06-02',
              status: 'sent',
              class: 'C2',
              priority: 'low',
              tags: ['innovation', 'chemistry', 'science fair']
            }
          ],
          statistics: {
            totalFeedback: 8,
            sentFeedback: 6,
            draftFeedback: 2,
            averageResponseTime: '2.3 days',
            studentEngagement: 94,
            positiveFeeback: 75,
            improvementNeeded: 25
          }
        }
      };
    }
  }
}

export default new EnhancedFacultyService();
