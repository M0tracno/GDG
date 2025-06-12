/**
 * Enhanced Parent Dashboard Controller (MongoDB)
 * Handles all parent dashboard-related functionality for MongoDB with comprehensive features
 */

const { Parent, ParentStudentRelation, Student, Grade, Attendance, Mark, Course, Enrollment } = require('../models/mongodb-models');
const jwt = require('jsonwebtoken');

class ParentDashboardController {
  /**
   * Get parent profile information
   */
  async getParentProfile(req, res) {
    try {
      const parentId = req.user.parentId;
      
      const parent = await Parent.findById(parentId);
      
      if (!parent) {
        return res.status(404).json({
          success: false,
          message: 'Parent not found'
        });
      }
      
      res.json({
        success: true,
        data: {
          id: parent._id,
          parentId: parent.parentId,
          name: parent.fullName,
          firstName: parent.firstName,
          lastName: parent.lastName,
          phoneNumber: parent.phoneNumber,
          email: parent.email,
          joinedDate: parent.createdAt,
          lastLogin: parent.lastLogin
        }
      });
    } catch (error) {
      console.error('Error fetching parent profile:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch parent profile',
        error: error.message
      });
    }
  }

  /**
   * Get children information for parent
   */
  async getChildren(req, res) {
    try {
      const parentId = req.user.parentId;
      
      const relations = await ParentStudentRelation.find({ 
        parentId: parentId,
        isActive: true 
      }).populate('studentId', 'studentId firstName lastName email classId section rollNumber dateOfBirth gender profilePictureUrl');
      
      if (!relations || relations.length === 0) {
        return res.json({
          success: true,
          data: [],
          message: 'No children found for this parent'
        });
      }
      
      const children = await Promise.all(relations.map(async (rel) => {
        // Get additional data for each child
        const enrollments = await Enrollment.find({ studentId: rel.studentId._id }).populate('courseId', 'courseName');
        const subjects = enrollments.map(e => e.courseId.courseName);
        
        // Get recent grades for average calculation
        const recentGrades = await Grade.find({ 
          studentId: rel.studentId._id,
          createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
        });
        
        const avgGrade = recentGrades.length > 0 
          ? recentGrades.reduce((sum, grade) => sum + (grade.marks || 0), 0) / recentGrades.length
          : 0;
        
        // Get attendance percentage
        const totalAttendance = await Attendance.countDocuments({ studentId: rel.studentId._id });
        const presentAttendance = await Attendance.countDocuments({ 
          studentId: rel.studentId._id, 
          status: 'present' 
        });
        const attendance = totalAttendance > 0 ? (presentAttendance / totalAttendance) * 100 : 0;
        
        return {
          id: rel.studentId._id,
          studentId: rel.studentId.studentId,
          name: `${rel.studentId.firstName} ${rel.studentId.lastName}`,
          firstName: rel.studentId.firstName,
          lastName: rel.studentId.lastName,
          email: rel.studentId.email,
          class: rel.studentId.classId,
          section: rel.studentId.section,
          rollNumber: rel.studentId.rollNumber,
          dateOfBirth: rel.studentId.dateOfBirth,
          gender: rel.studentId.gender,
          profilePicture: rel.studentId.profilePictureUrl,
          relationship: rel.relationship,
          isPrimary: rel.isPrimary,
          subjects: subjects,
          avgGrade: avgGrade.toFixed(1),
          attendance: attendance.toFixed(1)
        };
      }));
      
      res.json({
        success: true,
        data: children
      });
    } catch (error) {
      console.error('Error fetching children:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch children information',
        error: error.message
      });
    }
  }

  /**
   * Get dashboard summary statistics
   */
  async getDashboardSummary(req, res) {
    try {
      const parentId = req.user.parentId;
      
      // Get children
      const relations = await ParentStudentRelation.find({ 
        parentId: parentId,
        isActive: true 
      }).populate('studentId');
      
      const studentIds = relations.map(rel => rel.studentId._id);
      
      if (studentIds.length === 0) {
        return res.json({
          success: true,
          data: {
            totalChildren: 0,
            totalCourses: 0,
            recentGrades: 0,
            pendingMeetings: 0,
            avgAttendance: 0,
            avgGrade: 0
          }
        });
      }
      
      // Get all enrollments for all children
      const enrollments = await Enrollment.find({ 
        studentId: { $in: studentIds },
        status: 'active'
      });
      
      // Get recent grades (last 7 days)
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const recentGrades = await Grade.find({
        studentId: { $in: studentIds },
        createdAt: { $gte: weekAgo }
      });
      
      // Get all grades for average calculation
      const allGrades = await Grade.find({
        studentId: { $in: studentIds }
      });
      
      // Get attendance data
      const totalAttendance = await Attendance.countDocuments({
        studentId: { $in: studentIds }
      });
      
      const presentAttendance = await Attendance.countDocuments({
        studentId: { $in: studentIds },
        status: 'present'
      });
      
      // Calculate statistics
      const totalChildren = relations.length;
      const totalCourses = enrollments.length;
      const recentGradesCount = recentGrades.length;
      const pendingMeetings = 2; // This would be calculated from actual meetings data
      
      const avgGrade = allGrades.length > 0 
        ? allGrades.reduce((sum, grade) => sum + (grade.marks || 0), 0) / allGrades.length
        : 0;
      
      const avgAttendance = totalAttendance > 0 
        ? (presentAttendance / totalAttendance) * 100
        : 0;
      
      res.json({
        success: true,
        data: {
          totalChildren,
          totalCourses,
          recentGrades: recentGradesCount,
          pendingMeetings,
          avgAttendance: Math.round(avgAttendance * 10) / 10,
          avgGrade: Math.round(avgGrade * 10) / 10
        }
      });
    } catch (error) {
      console.error('Error fetching dashboard summary:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch dashboard summary',
        error: error.message
      });
    }
  }

  /**
   * Get all grades for all children
   */
  async getAllChildrenGrades(req, res) {
    try {
      const parentId = req.user.parentId;
      
      const relations = await ParentStudentRelation.find({ 
        parentId: parentId,
        isActive: true 
      }).populate('studentId', 'studentId firstName lastName');
      
      const studentIds = relations.map(rel => rel.studentId._id);
      const studentMap = {};
      relations.forEach(rel => {
        studentMap[rel.studentId._id] = `${rel.studentId.firstName} ${rel.studentId.lastName}`;
      });
      
      if (studentIds.length === 0) {
        return res.json({
          success: true,
          data: []
        });
      }
      
      const grades = await Grade.find({
        studentId: { $in: studentIds }
      })
      .populate('courseId', 'courseName')
      .populate('teacherId', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(50); // Limit to recent 50 grades
      
      const formattedGrades = grades.map(grade => ({
        id: grade._id,
        studentName: studentMap[grade.studentId],
        subject: grade.courseId ? grade.courseId.courseName : 'Unknown Subject',
        grade: this.calculateLetterGrade(grade.marks),
        percentage: grade.marks || 0,
        maxMarks: grade.maxMarks || 100,
        date: grade.createdAt,
        teacher: grade.teacherId ? `${grade.teacherId.firstName} ${grade.teacherId.lastName}` : 'Unknown Teacher',
        assignment: grade.assessmentType || 'Assessment',
        feedback: grade.comments || 'No feedback provided'
      }));
      
      res.json({
        success: true,
        data: formattedGrades
      });
    } catch (error) {
      console.error('Error fetching children grades:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch grades',
        error: error.message
      });
    }
  }

  /**
   * Get all assignments for all children
   */
  async getAllChildrenAssignments(req, res) {
    try {
      const parentId = req.user.parentId;
      
      const relations = await ParentStudentRelation.find({ 
        parentId: parentId,
        isActive: true 
      }).populate('studentId', 'studentId firstName lastName');
      
      const studentIds = relations.map(rel => rel.studentId._id);
      const studentMap = {};
      relations.forEach(rel => {
        studentMap[rel.studentId._id] = `${rel.studentId.firstName} ${rel.studentId.lastName}`;
      });
      
      // For now, return demo assignments as assignment model may not be fully implemented
      const demoAssignments = [
        {
          id: 1,
          title: 'Math Homework Chapter 5',
          subject: 'Mathematics',
          dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'pending',
          studentName: Object.values(studentMap)[0] || 'Student',
          description: 'Complete exercises 1-20 from chapter 5',
          submissionStatus: 'not_submitted'
        },
        {
          id: 2,
          title: 'Science Project',
          subject: 'Science',
          dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'in_progress',
          studentName: Object.values(studentMap)[0] || 'Student',
          description: 'Create a volcano model and explain the eruption process',
          submissionStatus: 'draft'
        }
      ];
      
      res.json({
        success: true,
        data: demoAssignments
      });
    } catch (error) {
      console.error('Error fetching children assignments:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch assignments',
        error: error.message
      });
    }
  }

  /**
   * Get all attendance for all children
   */
  async getAllChildrenAttendance(req, res) {
    try {
      const parentId = req.user.parentId;
      
      const relations = await ParentStudentRelation.find({ 
        parentId: parentId,
        isActive: true 
      }).populate('studentId', 'studentId firstName lastName');
      
      const studentIds = relations.map(rel => rel.studentId._id);
      const studentMap = {};
      relations.forEach(rel => {
        studentMap[rel.studentId._id] = `${rel.studentId.firstName} ${rel.studentId.lastName}`;
      });
      
      if (studentIds.length === 0) {
        return res.json({
          success: true,
          data: []
        });
      }
      
      const attendance = await Attendance.find({
        studentId: { $in: studentIds }
      })
      .populate('courseId', 'courseName')
      .sort({ date: -1 })
      .limit(100); // Recent 100 attendance records
      
      const formattedAttendance = attendance.map(record => ({
        id: record._id,
        studentName: studentMap[record.studentId],
        date: record.date,
        status: record.status,
        subject: record.courseId ? record.courseId.courseName : 'Unknown Subject',
        period: record.period || 1
      }));
      
      res.json({
        success: true,
        data: formattedAttendance
      });
    } catch (error) {
      console.error('Error fetching children attendance:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch attendance',
        error: error.message
      });
    }
  }

  /**
   * Get all feedback for all children
   */
  async getAllChildrenFeedback(req, res) {
    try {
      const parentId = req.user.parentId;
      
      const relations = await ParentStudentRelation.find({ 
        parentId: parentId,
        isActive: true 
      }).populate('studentId', 'studentId firstName lastName');
      
      const studentMap = {};
      relations.forEach(rel => {
        studentMap[rel.studentId._id] = `${rel.studentId.firstName} ${rel.studentId.lastName}`;
      });
      
      // For now, return demo feedback as feedback model may not be fully implemented
      const demoFeedback = [
        {
          id: 1,
          teacherName: 'Mrs. Smith',
          subject: 'Mathematics',
          studentName: Object.values(studentMap)[0] || 'Student',
          feedback: 'Excellent progress in algebra and geometry. Keep up the good work!',
          date: new Date().toISOString(),
          type: 'positive'
        },
        {
          id: 2,
          teacherName: 'Mr. Johnson',
          subject: 'Science',
          studentName: Object.values(studentMap)[0] || 'Student',
          feedback: 'Good understanding of concepts. Needs to improve lab report writing.',
          date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          type: 'constructive'
        }
      ];
      
      res.json({
        success: true,
        data: demoFeedback
      });
    } catch (error) {
      console.error('Error fetching children feedback:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch feedback',
        error: error.message
      });
    }
  }

  /**
   * Get upcoming events
   */
  async getEvents(req, res) {
    try {
      // For now, return demo events as event model may not be fully implemented
      const demoEvents = [
        {
          id: 1,
          title: 'Parent-Teacher Conference',
          date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
          time: '10:00 AM',
          description: 'Quarterly progress discussion',
          type: 'meeting'
        },
        {
          id: 2,
          title: 'Science Fair',
          date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
          time: '2:00 PM',
          description: 'Annual science exhibition',
          type: 'event'
        },
        {
          id: 3,
          title: 'Sports Day',
          date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
          time: '9:00 AM',
          description: 'Annual sports competition',
          type: 'event'
        }
      ];
      
      res.json({
        success: true,
        data: demoEvents
      });
    } catch (error) {
      console.error('Error fetching events:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch events',
        error: error.message
      });
    }
  }

  /**
   * Helper method to calculate letter grade from percentage
   */
  calculateLetterGrade(percentage) {
    if (percentage >= 90) return 'A+';
    if (percentage >= 85) return 'A';
    if (percentage >= 80) return 'A-';
    if (percentage >= 75) return 'B+';
    if (percentage >= 70) return 'B';
    if (percentage >= 65) return 'B-';
    if (percentage >= 60) return 'C+';
    if (percentage >= 55) return 'C';
    if (percentage >= 50) return 'C-';
    return 'F';
  }
   * Get grades for a specific child
   */
  async getChildGrades(req, res) {
    try {
      const { studentId } = req.params;
      const parentId = req.user.parentId;
      
      // Verify parent-student relationship
      const relation = await ParentStudentRelation.findOne({ 
        parentId: parentId,
        studentId: studentId,
        isActive: true 
      });
      
      if (!relation) {
        return res.status(403).json({
          success: false,
          message: 'Unauthorized access to student information'
        });
      }
      
      const grades = await Grade.find({ studentId: studentId })
        .populate('teacherId', 'firstName lastName')
        .populate('courseId', 'courseName courseCode')
        .sort({ gradeDate: -1 });
      
      const formattedGrades = grades.map(grade => ({
        id: grade._id,
        subject: grade.subject,
        assignmentName: grade.assignmentName,
        assignmentType: grade.assignmentType,
        score: grade.score,
        maxScore: grade.maxScore,
        percentage: grade.percentage,
        letterGrade: grade.letterGrade,
        gradeDate: grade.gradeDate,
        dueDate: grade.dueDate,
        submittedDate: grade.submittedDate,
        feedback: grade.feedback,
        teacher: grade.teacherId ? `${grade.teacherId.firstName} ${grade.teacherId.lastName}` : null,
        course: grade.courseId ? grade.courseId.courseName : null,
        isLate: grade.isLate,
        isExcused: grade.isExcused
      }));
      
      res.json({
        success: true,
        data: formattedGrades
      });
    } catch (error) {
      console.error('Error fetching child grades:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch grades',
        error: error.message
      });
    }
  }

  /**
   * Get attendance for a specific child
   */
  async getChildAttendance(req, res) {
    try {
      const { studentId } = req.params;
      const parentId = req.user.parentId;
      
      // Verify parent-student relationship
      const relation = await ParentStudentRelation.findOne({ 
        parentId: parentId,
        studentId: studentId,
        isActive: true 
      });
      
      if (!relation) {
        return res.status(403).json({
          success: false,
          message: 'Unauthorized access to student information'
        });
      }
      
      const attendance = await Attendance.find({ studentId: studentId })
        .populate('courseId', 'courseName courseCode')
        .populate('facultyId', 'firstName lastName')
        .sort({ date: -1 });
      
      const formattedAttendance = attendance.map(record => ({
        id: record._id,
        date: record.date,
        status: record.status,
        course: record.courseId ? record.courseId.courseName : 'Unknown',
        courseCode: record.courseId ? record.courseId.courseCode : 'N/A',
        faculty: record.facultyId ? `${record.facultyId.firstName} ${record.facultyId.lastName}` : 'Unknown',
        remarks: record.remarks
      }));
      
      // Calculate attendance statistics
      const totalClasses = attendance.length;
      const presentClasses = attendance.filter(a => a.status === 'Present').length;
      const absentClasses = attendance.filter(a => a.status === 'Absent').length;
      const lateClasses = attendance.filter(a => a.status === 'Late').length;
      const attendancePercentage = totalClasses > 0 ? ((presentClasses + lateClasses) / totalClasses * 100).toFixed(2) : 0;
      
      res.json({
        success: true,
        data: {
          records: formattedAttendance,
          summary: {
            totalClasses,
            presentClasses,
            absentClasses,
            lateClasses,
            attendancePercentage: parseFloat(attendancePercentage)
          }
        }
      });
    } catch (error) {
      console.error('Error fetching child attendance:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch attendance',
        error: error.message
      });
    }
  }

  /**
   * Get assignments for a specific child
   */
  async getChildAssignments(req, res) {
    try {
      const { studentId } = req.params;
      const parentId = req.user.parentId;
      
      // Verify parent-student relationship
      const relation = await ParentStudentRelation.findOne({ 
        parentId: parentId,
        studentId: studentId,
        isActive: true 
      });
      
      if (!relation) {
        return res.status(403).json({
          success: false,
          message: 'Unauthorized access to student information'
        });
      }
      
      // Get assignments from Grade model (as assignments become grades when submitted)
      const assignments = await Grade.find({ 
        studentId: studentId,
        assignmentType: { $in: ['Assignment', 'Project', 'Homework'] }
      })
        .populate('teacherId', 'firstName lastName')
        .populate('courseId', 'courseName courseCode')
        .sort({ dueDate: -1 });
      
      const formattedAssignments = assignments.map(assignment => ({
        id: assignment._id,
        title: assignment.assignmentName,
        subject: assignment.subject,
        type: assignment.assignmentType,
        dueDate: assignment.dueDate,
        submittedDate: assignment.submittedDate,
        score: assignment.score,
        maxScore: assignment.maxScore,
        feedback: assignment.feedback,
        teacher: assignment.teacherId ? `${assignment.teacherId.firstName} ${assignment.teacherId.lastName}` : null,
        course: assignment.courseId ? assignment.courseId.courseName : null,
        status: assignment.submittedDate ? 'Submitted' : (new Date() > assignment.dueDate ? 'Overdue' : 'Pending'),
        isLate: assignment.isLate
      }));
      
      res.json({
        success: true,
        data: formattedAssignments
      });
    } catch (error) {
      console.error('Error fetching child assignments:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch assignments',
        error: error.message
      });
    }
  }

  /**
   * Get feedback for a specific child
   */
  async getChildFeedback(req, res) {
    try {
      const { studentId } = req.params;
      const parentId = req.user.parentId;
      
      // Verify parent-student relationship
      const relation = await ParentStudentRelation.findOne({ 
        parentId: parentId,
        studentId: studentId,
        isActive: true 
      });
      
      if (!relation) {
        return res.status(403).json({
          success: false,
          message: 'Unauthorized access to student information'
        });
      }
      
      // Get feedback from grades
      const feedbackRecords = await Grade.find({ 
        studentId: studentId,
        feedback: { $exists: true, $ne: '' }
      })
        .populate('teacherId', 'firstName lastName')
        .populate('courseId', 'courseName courseCode')
        .sort({ gradeDate: -1 });
      
      const formattedFeedback = feedbackRecords.map(record => ({
        id: record._id,
        subject: record.subject,
        assignmentName: record.assignmentName,
        feedback: record.feedback,
        teacher: record.teacherId ? `${record.teacherId.firstName} ${record.teacherId.lastName}` : null,
        course: record.courseId ? record.courseId.courseName : null,
        date: record.gradeDate,
        grade: record.letterGrade,
        score: `${record.score}/${record.maxScore}`
      }));
      
      res.json({
        success: true,
        data: formattedFeedback
      });
    } catch (error) {
      console.error('Error fetching child feedback:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch feedback',
        error: error.message
      });
    }
  }

  /**
   * Get events (placeholder - can be enhanced based on actual event model)
   */
  async getEvents(req, res) {
    try {
      // For now, return sample events
      // This can be enhanced when an Event model is created
      const sampleEvents = [
        {
          id: 1,
          title: 'Parent-Teacher Meeting',
          description: 'Quarterly parent-teacher conference',
          date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
          type: 'meeting',
          isImportant: true
        },
        {
          id: 2,
          title: 'School Sports Day',
          description: 'Annual sports competition',
          date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
          type: 'event',
          isImportant: false
        }
      ];
      
      res.json({
        success: true,
        data: sampleEvents
      });
    } catch (error) {
      console.error('Error fetching events:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch events',
        error: error.message
      });
    }
  }

  /**
   * Get dashboard summary for a specific child
   */
  async getChildDashboard(req, res) {
    try {
      const { studentId } = req.params;
      const parentId = req.user.parentId;
      
      // Verify parent-student relationship
      const relation = await ParentStudentRelation.findOne({ 
        parentId: parentId,
        studentId: studentId,
        isActive: true 
      }).populate('studentId', 'firstName lastName classId section studentId');
      
      if (!relation) {
        return res.status(403).json({
          success: false,
          message: 'Unauthorized access to student information'
        });
      }
      
      // Get recent grades
      const recentGrades = await Grade.find({ studentId: studentId })
        .sort({ gradeDate: -1 })
        .limit(5)
        .populate('teacherId', 'firstName lastName');
      
      // Get attendance summary (last 30 days)
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const recentAttendance = await Attendance.find({ 
        studentId: studentId,
        date: { $gte: thirtyDaysAgo }
      });
      
      // Calculate overall grade average
      const grades = await Grade.find({ studentId: studentId });
      const totalScore = grades.reduce((sum, grade) => sum + (grade.percentage || 0), 0);
      const overallAverage = grades.length > 0 ? (totalScore / grades.length).toFixed(2) : 0;
      
      // Get pending assignments (assignments without scores)
      const pendingAssignments = await Grade.find({ 
        studentId: studentId,
        dueDate: { $gte: new Date() },
        submittedDate: { $exists: false }
      }).countDocuments();
      
      // Calculate attendance percentage
      const totalClasses = recentAttendance.length;
      const presentClasses = recentAttendance.filter(a => a.status === 'Present').length;
      const attendancePercentage = totalClasses > 0 ? ((presentClasses / totalClasses) * 100).toFixed(2) : 100;
      
      res.json({
        success: true,
        data: {
          student: {
            id: relation.studentId._id,
            name: `${relation.studentId.firstName} ${relation.studentId.lastName}`,
            studentId: relation.studentId.studentId,
            class: relation.studentId.classId,
            section: relation.studentId.section
          },
          summary: {
            overallGrade: `${overallAverage}%`,
            attendancePercentage: parseFloat(attendancePercentage),
            pendingAssignments: pendingAssignments,
            totalGrades: grades.length,
            recentGrades: recentGrades.map(grade => ({
              subject: grade.subject,
              assignment: grade.assignmentName,
              grade: grade.letterGrade,
              score: `${grade.score}/${grade.maxScore}`,
              date: grade.gradeDate
            }))
          }
        }
      });
    } catch (error) {
      console.error('Error fetching child dashboard:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch dashboard data',
        error: error.message
      });
    }
  }
}

module.exports = new ParentDashboardController();
