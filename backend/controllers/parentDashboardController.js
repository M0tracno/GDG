/**
 * Parent Dashboard Controller
 * Handles all parent dashboard-related functionality
 */

const { Parent, ParentStudentRelation, Student, Grade, Assignment, Quiz, Attendance, Event, Message } = require('../models');
const { Op } = require('sequelize');
const jwt = require('jsonwebtoken');

class ParentDashboardController {
  /**
   * Get parent profile information
   */
  async getParentProfile(req, res) {
    try {
      const { parentId } = req.params;
      
      const parent = await Parent.findOne({
        where: { id: parentId },
        attributes: ['id', 'phoneNumber', 'name', 'email', 'createdAt']
      });
      
      if (!parent) {
        return res.status(404).json({
          success: false,
          message: 'Parent not found'
        });
      }
      
      res.json({
        success: true,
        data: {
          id: parent.id,
          name: parent.name,
          phoneNumber: parent.phoneNumber,
          email: parent.email,
          joinedDate: parent.createdAt
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
      const { parentId } = req.params;
        const parentStudentRelations = await ParentStudentRelation.findAll({
        where: { parentId },
        include: [
          {
            model: Student,
            as: 'student',
            attributes: ['id', 'studentId', 'firstName', 'lastName', 'email', 'classId', 'section']
          }
        ]
      });
      
      const children = parentStudentRelations.map(relation => ({
        id: relation.student.id,
        studentId: relation.student.studentId,
        name: `${relation.student.firstName} ${relation.student.lastName}`,
        email: relation.student.email,
        grade: relation.student.classId || 'Not Assigned',
        school: 'GDC School',
        relationship: relation.relationship,
        createdAt: relation.createdAt
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
   * Get grades for all children
   */
  async getChildrenGrades(req, res) {
    try {
      const { parentId } = req.params;
        // Get all children for this parent
      const parentStudentRelations = await ParentStudentRelation.findAll({
        where: { parentId },
        include: [
          {
            model: Student,
            as: 'student',
            attributes: ['id', 'firstName', 'lastName']
          }
        ]
      });
      
      const studentIds = parentStudentRelations.map(relation => relation.student.id);
      
      if (studentIds.length === 0) {
        return res.json({
          success: true,
          data: []
        });
      }
        // Get grades for all children
      const grades = await Grade.findAll({
        where: {
          studentId: { [Op.in]: studentIds }
        },
        include: [
          {
            model: Student,
            as: 'student',
            attributes: ['firstName', 'lastName', 'studentId']
          }
        ],
        order: [['createdAt', 'DESC']],
        limit: 10
      });
      
      const gradesData = grades.map(grade => ({
        id: grade.id,
        subject: grade.subject || 'General',
        assignment: grade.assignmentName || 'Assignment',
        score: grade.score,
        maxScore: grade.maxScore,
        letterGrade: grade.letterGrade,
        date: grade.createdAt?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0],
        studentName: `${grade.student.firstName} ${grade.student.lastName}`,
        studentId: grade.student.studentId,
        feedback: grade.feedback
      }));
      
      res.json({
        success: true,
        data: gradesData
      });
    } catch (error) {
      console.error('Error fetching children grades:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch children grades',
        error: error.message
      });
    }
  }

  /**
   * Get grades for specific child
   */
  async getChildGrades(req, res) {
    try {
      const { parentId, childId } = req.params;
      
      // Verify parent-child relationship
      const relation = await ParentStudentRelation.findOne({
        where: {
          parentId,
          studentId: childId
        }
      });
      
      if (!relation) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: No relationship found with this student'
        });
      }
        const grades = await Grade.findAll({
        where: { studentId: childId },
        include: [
          {
            model: Student,
            as: 'student',
            attributes: ['firstName', 'lastName', 'studentId']
          }
        ],
        order: [['createdAt', 'DESC']]
      });
      
      const gradesData = grades.map(grade => ({
        id: grade.id,
        subject: grade.subject || 'General',
        assignment: grade.assignmentName || 'Assignment',
        score: grade.score,
        maxScore: grade.maxScore,
        letterGrade: grade.letterGrade,
        date: grade.createdAt?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0],
        feedback: grade.feedback
      }));
      
      res.json({
        success: true,
        data: gradesData
      });
    } catch (error) {
      console.error('Error fetching child grades:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch child grades',
        error: error.message
      });
    }
  }

  /**
   * Get teacher feedback for children
   */
  async getTeacherFeedback(req, res) {
    try {
      const { parentId } = req.params;
        // Get all children for this parent
      const parentStudentRelations = await ParentStudentRelation.findAll({
        where: { parentId },
        include: [
          {
            model: Student,
            as: 'student',
            attributes: ['id', 'firstName', 'lastName']
          }
        ]
      });
      
      const studentIds = parentStudentRelations.map(relation => relation.student.id);
      
      if (studentIds.length === 0) {
        return res.json({
          success: true,
          data: []
        });
      }
      
      // For now, we'll get feedback from grades table. In a real app, you might have a separate feedback table
      const feedback = await Grade.findAll({
        where: {
          studentId: { [Op.in]: studentIds },
          feedback: { [Op.not]: null }
        },
        include: [
          {
            model: Student,
            as: 'student',
            attributes: ['firstName', 'lastName']
          }
        ],
        order: [['createdAt', 'DESC']],
        limit: 5
      });
      
      const feedbackData = feedback.map(item => ({
        id: item.id,
        subject: item.subject || 'General',
        teacherName: 'Teacher', // You would get this from a teacher table
        feedback: item.feedback,
        date: item.createdAt?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0],
        studentName: `${item.student.firstName} ${item.student.lastName}`
      }));
      
      res.json({
        success: true,
        data: feedbackData
      });
    } catch (error) {
      console.error('Error fetching teacher feedback:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch teacher feedback',
        error: error.message
      });
    }
  }

  /**
   * Get upcoming events for children
   */
  async getUpcomingEvents(req, res) {
    try {
      const { parentId } = req.params;
      
      // For now, return mock data. In a real app, you would query events related to the children's classes
      const mockEvents = [
        {
          id: 1,
          title: 'Parent-Teacher Conference',
          date: '2024-01-25',
          time: '2:00 PM',
          type: 'meeting',
          description: 'Discuss student progress'
        },
        {
          id: 2,
          title: 'Science Fair',
          date: '2024-02-01',
          time: '10:00 AM',
          type: 'event',
          description: 'Annual science fair exhibition'
        },
        {
          id: 3,
          title: 'Math Quiz',
          date: '2024-01-30',
          time: '1:00 PM',
          type: 'assessment',
          description: 'Chapter 5 math quiz'
        }
      ];
      
      res.json({
        success: true,
        data: mockEvents
      });
    } catch (error) {
      console.error('Error fetching upcoming events:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch upcoming events',
        error: error.message
      });
    }
  }
  /**
   * Get attendance records for children
   */
  async getChildrenAttendance(req, res) {
    try {
      const { parentId } = req.params;
      
      // Get all children for this parent
      const parentStudentRelations = await ParentStudentRelation.findAll({
        where: { parentId },
        include: [
          {
            model: Student,
            as: 'student',
            attributes: ['id', 'firstName', 'lastName', 'studentId']
          }
        ]
      });
      
      const studentIds = parentStudentRelations.map(relation => relation.student.id);
      
      if (studentIds.length === 0) {
        return res.json({
          success: true,
          data: []
        });
      }
      
      // Mock attendance data - in real app, query attendance table
      const attendanceData = parentStudentRelations.map(relation => ({
        studentId: relation.student.id,
        studentName: `${relation.student.firstName} ${relation.student.lastName}`,
        studentNumber: relation.student.studentId,
        totalDays: 20,
        presentDays: 18,
        absentDays: 2,
        attendancePercentage: 90,
        lastWeekAttendance: [
          { date: '2024-01-15', status: 'present' },
          { date: '2024-01-16', status: 'present' },
          { date: '2024-01-17', status: 'absent' },
          { date: '2024-01-18', status: 'present' },
          { date: '2024-01-19', status: 'present' }
        ]
      }));
      
      res.json({
        success: true,
        data: attendanceData
      });
    } catch (error) {
      console.error('Error fetching children attendance:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch children attendance',
        error: error.message
      });
    }
  }

  /**
   * Get assignments for children
   */
  async getChildrenAssignments(req, res) {
    try {
      const { parentId } = req.params;
        // Get all children for this parent
      const parentStudentRelations = await ParentStudentRelation.findAll({
        where: { parentId },
        include: [
          {
            model: Student,
            as: 'student',
            attributes: ['id', 'firstName', 'lastName', 'studentId']
          }
        ]
      });
      
      const studentIds = parentStudentRelations.map(relation => relation.student.id);
      
      if (studentIds.length === 0) {
        return res.json({
          success: true,
          data: []
        });
      }
      
      // Mock assignment data - in real app, query assignments table
      const assignmentsData = [
        {
          id: 1,
          title: 'Math Homework Chapter 5',
          subject: 'Mathematics',
          dueDate: '2024-01-28',
          status: 'pending',
          studentName: parentStudentRelations[0]?.student ? `${parentStudentRelations[0].student.firstName} ${parentStudentRelations[0].student.lastName}` : 'Student',
          description: 'Complete exercises 1-20 from chapter 5',
          submissionStatus: 'not_submitted'
        },
        {
          id: 2,
          title: 'Science Project',
          subject: 'Science',
          dueDate: '2024-02-05',
          status: 'in_progress',
          studentName: parentStudentRelations[0]?.student ? `${parentStudentRelations[0].student.firstName} ${parentStudentRelations[0].student.lastName}` : 'Student',
          description: 'Create a volcano model and explain the eruption process',
          submissionStatus: 'draft'
        }
      ];
      
      res.json({
        success: true,
        data: assignmentsData
      });
    } catch (error) {
      console.error('Error fetching children assignments:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch children assignments',
        error: error.message
      });
    }
  }

  /**
   * Get parent dashboard summary
   */
  async getDashboardSummary(req, res) {
    try {
      const { parentId } = req.params;
      
      // Get children count
      const childrenCount = await ParentStudentRelation.count({
        where: { parentId }
      });
      
      // Get recent grades
      const parentStudentRelations = await ParentStudentRelation.findAll({
        where: { parentId },
        include: [
          {
            model: User,
            as: 'student',
            attributes: ['id']
          }
        ]
      });
      
      const studentIds = parentStudentRelations.map(relation => relation.student.id);
      
      let overallPerformance = 'No Data';
      let recentGrades = [];
      
      if (studentIds.length > 0) {
        const grades = await Grade.findAll({
          where: {
            studentId: { [Op.in]: studentIds }
          },
          order: [['createdAt', 'DESC']],
          limit: 5
        });
        
        if (grades.length > 0) {
          const totalScore = grades.reduce((sum, grade) => sum + (grade.score || 0), 0);
          const averageScore = Math.round(totalScore / grades.length);
          
          if (averageScore >= 90) overallPerformance = 'Excellent';
          else if (averageScore >= 80) overallPerformance = 'Good';
          else if (averageScore >= 70) overallPerformance = 'Average';
          else overallPerformance = 'Needs Improvement';
          
          recentGrades = grades.map(grade => ({
            subject: grade.subject || 'General',
            score: grade.score,
            maxScore: grade.maxScore,
            letterGrade: grade.letterGrade
          }));
        }
      }
      
      const summary = {
        childrenCount,
        overallPerformance,
        recentGrades,
        upcomingEvents: [
          {
            title: 'Parent-Teacher Conference',
            date: '2024-01-25',
            type: 'meeting'
          }
        ],
        attendanceAlerts: [],
        recentFeedback: []
      };
      
      res.json({
        success: true,
        data: summary
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
}

module.exports = new ParentDashboardController();
