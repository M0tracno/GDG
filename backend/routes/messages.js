/**
 * Messaging Routes
 * Handles real-time messaging between parents and teachers
 */

const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const auth = require('../middleware/auth');
const { parentAuth } = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');
const upload = require('../middleware/upload');

/**
 * @swagger
 * components:
 *   schemas:
 *     Message:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         conversationId:
 *           type: string
 *         senderId:
 *           type: string
 *         senderModel:
 *           type: string
 *           enum: [Parent, Faculty]
 *         receiverId:
 *           type: string
 *         receiverModel:
 *           type: string
 *           enum: [Parent, Faculty]
 *         content:
 *           type: string
 *         messageType:
 *           type: string
 *           enum: [text, file, image]
 *         readBy:
 *           type: array
 *           items:
 *             type: object
 *         createdAt:
 *           type: string
 *           format: date-time
 */

/**
 * @route   POST /api/messages/send
 * @desc    Send a new message
 * @access  Private (Parents and Faculty)
 */
router.post('/send', auth, messageController.sendMessage);

/**
 * @route   GET /api/messages/conversations
 * @desc    Get all conversations for the authenticated user
 * @access  Private (Parents and Faculty)
 */
router.get('/conversations', auth, messageController.getUserConversations);

/**
 * @route   GET /api/messages/conversation/:conversationId
 * @desc    Get messages from a specific conversation
 * @access  Private (Parents and Faculty)
 */
router.get('/conversation/:conversationId', auth, messageController.getConversation);

/**
 * @route   GET /api/messages
 * @desc    Get messages with filtering and pagination
 * @access  Private (Parents and Faculty)
 */
router.get('/', auth, messageController.getMessages);

/**
 * @route   PUT /api/messages/:messageId/read
 * @desc    Mark a message as read
 * @access  Private (Parents and Faculty)
 */
router.put('/:messageId/read', auth, messageController.markMessageAsRead);

/**
 * @route   DELETE /api/messages/:messageId
 * @desc    Delete a message (soft delete)
 * @access  Private (Parents and Faculty - can only delete own messages)
 */
router.delete('/:messageId', auth, messageController.deleteMessage);

/**
 * @route   GET /api/messages/contacts
 * @desc    Get available contacts for messaging
 * @access  Private (Parents and Faculty)
 */
router.get('/contacts', auth, messageController.getAvailableContacts);

// Parent-specific routes (using parentAuth middleware)

/**
 * @route   GET /api/messages/parent/teachers
 * @desc    Get teachers that parent can message (based on their children)
 * @access  Private (Parents only)
 */
router.get('/parent/teachers', parentAuth, messageController.getAvailableContacts);

/**
 * @route   POST /api/messages/parent/send
 * @desc    Send message from parent to teacher
 * @access  Private (Parents only)
 */
router.post('/parent/send', parentAuth, messageController.sendMessage);

/**
 * @route   GET /api/messages/stats
 * @desc    Get message statistics and analytics
 * @access  Private (Parents and Faculty)
 */
router.get('/stats', auth, messageController.getMessageStats);

/**
 * @route   GET /api/messages/templates
 * @desc    Get message templates based on user role
 * @access  Private (Parents and Faculty)
 */
router.get('/templates', auth, messageController.getMessageTemplates);

/**
 * @route   POST /api/messages/send-with-attachment
 * @desc    Send a new message with file attachment
 * @access  Private (Parents and Faculty)
 */
router.post('/send-with-attachment', 
  auth, 
  upload.single('attachment'), 
  messageController.sendMessageWithAttachment
);

/**
 * @route   GET /api/messages/:messageId/attachments/:attachmentIndex/download
 * @desc    Download message attachment
 * @access  Private (Message sender or recipient)
 */
router.get('/:messageId/attachments/:attachmentIndex/download', 
  auth, 
  messageController.downloadAttachment
);

// Parent-specific routes

/**
 * @route   POST /api/messages/parent/send-with-attachment
 * @desc    Send message with attachment from parent to teacher
 * @access  Private (Parents only)
 */
router.post('/parent/send-with-attachment', 
  parentAuth, 
  upload.single('attachment'), 
  messageController.sendMessageWithAttachment
);

// Faculty-specific routes

/**
 * @route   GET /api/messages/faculty/parents
 * @desc    Get parents that faculty can message
 * @access  Private (Faculty only)
 */
router.get('/faculty/parents', auth, roleAuth(['faculty', 'admin']), messageController.getAvailableContacts);

/**
 * @route   POST /api/messages/faculty/send
 * @desc    Send message from faculty to parent
 * @access  Private (Faculty only)
 */
router.post('/faculty/send', auth, roleAuth(['faculty', 'admin']), messageController.sendMessage);

/**
 * @route   POST /api/messages/faculty/send-with-attachment
 * @desc    Send message with attachment from faculty to parent
 * @access  Private (Faculty only)
 */
router.post('/faculty/send-with-attachment', 
  auth, 
  roleAuth(['faculty', 'admin']), 
  upload.single('attachment'), 
  messageController.sendMessageWithAttachment
);

module.exports = router;
