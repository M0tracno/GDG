/**
 * Parent Dashboard Routes
 * Handles all parent dashboard-related API endpoints
 */

const express = require('express');
const router = express.Router();
const parentDashboardController = require('../controllers/parentDashboardController');
const authMiddleware = require('../middleware/auth');

/**
 * @swagger
 * components:
 *   schemas:
 *     ParentProfile:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         name:
 *           type: string
 *         phoneNumber:
 *           type: string
 *         email:
 *           type: string
 *         joinedDate:
 *           type: string
 *           format: date-time
 *     
 *     Child:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         studentId:
 *           type: string
 *         name:
 *           type: string
 *         email:
 *           type: string
 *         grade:
 *           type: string
 *         school:
 *           type: string
 *         relationship:
 *           type: string
 *     
 *     Grade:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         subject:
 *           type: string
 *         assignment:
 *           type: string
 *         score:
 *           type: number
 *         maxScore:
 *           type: number
 *         letterGrade:
 *           type: string
 *         date:
 *           type: string
 *         studentName:
 *           type: string
 *         feedback:
 *           type: string
 *     
 *     TeacherFeedback:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         subject:
 *           type: string
 *         teacherName:
 *           type: string
 *         feedback:
 *           type: string
 *         date:
 *           type: string
 *         studentName:
 *           type: string
 */

/**
 * @swagger
 * /api/parents/{parentId}:
 *   get:
 *     summary: Get parent profile information
 *     tags: [Parent Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: parentId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Parent ID
 *     responses:
 *       200:
 *         description: Parent profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/ParentProfile'
 *       404:
 *         description: Parent not found
 *       500:
 *         description: Server error
 */
router.get('/:parentId', authMiddleware, parentDashboardController.getParentProfile);

/**
 * @swagger
 * /api/parents/{parentId}/children:
 *   get:
 *     summary: Get children information for parent
 *     tags: [Parent Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: parentId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Parent ID
 *     responses:
 *       200:
 *         description: Children information retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Child'
 *       500:
 *         description: Server error
 */
router.get('/:parentId/children', authMiddleware, parentDashboardController.getChildren);

/**
 * @swagger
 * /api/parents/{parentId}/children/grades:
 *   get:
 *     summary: Get grades for all children
 *     tags: [Parent Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: parentId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Parent ID
 *     responses:
 *       200:
 *         description: Children grades retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Grade'
 *       500:
 *         description: Server error
 */
router.get('/:parentId/children/grades', authMiddleware, parentDashboardController.getChildrenGrades);

/**
 * @swagger
 * /api/parents/{parentId}/children/{childId}/grades:
 *   get:
 *     summary: Get grades for specific child
 *     tags: [Parent Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: parentId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Parent ID
 *       - in: path
 *         name: childId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Child ID
 *     responses:
 *       200:
 *         description: Child grades retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Grade'
 *       403:
 *         description: Access denied - No relationship found
 *       500:
 *         description: Server error
 */
router.get('/:parentId/children/:childId/grades', authMiddleware, parentDashboardController.getChildGrades);

/**
 * @swagger
 * /api/parents/{parentId}/feedback:
 *   get:
 *     summary: Get teacher feedback for children
 *     tags: [Parent Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: parentId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Parent ID
 *     responses:
 *       200:
 *         description: Teacher feedback retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/TeacherFeedback'
 *       500:
 *         description: Server error
 */
router.get('/:parentId/feedback', authMiddleware, parentDashboardController.getTeacherFeedback);

/**
 * @swagger
 * /api/parents/{parentId}/events:
 *   get:
 *     summary: Get upcoming events for children
 *     tags: [Parent Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: parentId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Parent ID
 *     responses:
 *       200:
 *         description: Upcoming events retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       title:
 *                         type: string
 *                       date:
 *                         type: string
 *                       time:
 *                         type: string
 *                       type:
 *                         type: string
 *                       description:
 *                         type: string
 *       500:
 *         description: Server error
 */
router.get('/:parentId/events', authMiddleware, parentDashboardController.getUpcomingEvents);

/**
 * @swagger
 * /api/parents/{parentId}/children/attendance:
 *   get:
 *     summary: Get attendance records for children
 *     tags: [Parent Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: parentId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Parent ID
 *     responses:
 *       200:
 *         description: Children attendance retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       studentId:
 *                         type: integer
 *                       studentName:
 *                         type: string
 *                       totalDays:
 *                         type: integer
 *                       presentDays:
 *                         type: integer
 *                       absentDays:
 *                         type: integer
 *                       attendancePercentage:
 *                         type: number
 *       500:
 *         description: Server error
 */
router.get('/:parentId/children/attendance', authMiddleware, parentDashboardController.getChildrenAttendance);

/**
 * @swagger
 * /api/parents/{parentId}/children/assignments:
 *   get:
 *     summary: Get assignments for children
 *     tags: [Parent Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: parentId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Parent ID
 *     responses:
 *       200:
 *         description: Children assignments retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       title:
 *                         type: string
 *                       subject:
 *                         type: string
 *                       dueDate:
 *                         type: string
 *                       status:
 *                         type: string
 *                       studentName:
 *                         type: string
 *       500:
 *         description: Server error
 */
router.get('/:parentId/children/assignments', authMiddleware, parentDashboardController.getChildrenAssignments);

/**
 * @swagger
 * /api/parents/{parentId}/dashboard:
 *   get:
 *     summary: Get parent dashboard summary
 *     tags: [Parent Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: parentId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Parent ID
 *     responses:
 *       200:
 *         description: Dashboard summary retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     childrenCount:
 *                       type: integer
 *                     overallPerformance:
 *                       type: string
 *                     recentGrades:
 *                       type: array
 *                     upcomingEvents:
 *                       type: array
 *                     attendanceAlerts:
 *                       type: array
 *                     recentFeedback:
 *                       type: array
 *       500:
 *         description: Server error
 */
router.get('/:parentId/dashboard', authMiddleware, parentDashboardController.getDashboardSummary);

module.exports = router;
