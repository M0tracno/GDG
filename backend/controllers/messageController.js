const { Message, Parent, Faculty, Student, ParentStudentRelation } = require('../models/mongodb-models');
const createBaseController = require('./baseController');
const path = require('path');

// Get base controller functions
const baseController = createBaseController(Message);

/**
 * Send a message between parent and teacher
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const sendMessage = async (req, res, next) => {
  try {
    const {
      recipientId,
      recipientType, // 'parent' or 'teacher'
      studentId,
      subject,
      content,
      messageType = 'general',
      priority = 'normal',
      replyToMessageId = null
    } = req.body;

    // Validate required fields
    if (!recipientId || !studentId || !subject || !content) {
      return res.status(400).json({
        success: false,
        message: 'Recipient ID, student ID, subject, and content are required'
      });
    }

    // Determine sender information based on request context
    let senderId, senderModel, senderName;
    
    if (req.user.role === 'parent') {
      // Sender is a parent
      const parent = await Parent.findById(req.user.id);
      if (!parent) {
        return res.status(404).json({
          success: false,
          message: 'Parent not found'
        });
      }
      
      senderId = parent._id;
      senderModel = 'Parent';
      senderName = `${parent.firstName} ${parent.lastName}`;
      
      // Verify parent has relationship with the student
      const relationship = await ParentStudentRelation.findOne({
        parentId: parent._id,
        studentId,
        isActive: true
      });
      
      if (!relationship) {
        return res.status(403).json({
          success: false,
          message: 'You are not authorized to send messages about this student'
        });
      }
      
    } else if (req.user.role === 'faculty') {
      // Sender is a teacher
      const faculty = await Faculty.findById(req.user.id);
      if (!faculty) {
        return res.status(404).json({
          success: false,
          message: 'Faculty member not found'
        });
      }
      
      senderId = faculty._id;
      senderModel = 'Faculty';
      senderName = `${faculty.firstName} ${faculty.lastName}`;
      
    } else {
      return res.status(403).json({
        success: false,
        message: 'Only parents and teachers can send messages'
      });
    }

    // Get student information
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Get recipient information
    let recipient, recipientModel, recipientName;
    
    if (recipientType === 'parent') {
      recipient = await Parent.findById(recipientId);
      recipientModel = 'Parent';
    } else if (recipientType === 'teacher' || recipientType === 'faculty') {
      recipient = await Faculty.findById(recipientId);
      recipientModel = 'Faculty';
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid recipient type. Must be "parent" or "teacher"'
      });
    }

    if (!recipient) {
      return res.status(404).json({
        success: false,
        message: `${recipientType} not found`
      });
    }

    recipientName = `${recipient.firstName} ${recipient.lastName}`;

    // Handle thread management for replies
    let threadId = null;
    if (replyToMessageId) {
      const originalMessage = await Message.findById(replyToMessageId);
      if (originalMessage) {
        threadId = originalMessage.threadId;
      }
    }

    // Create the message
    const messageData = {
      subject,
      content,
      senderId,
      senderModel,
      senderName,
      recipientId,
      recipientModel,
      recipientName,
      studentId,
      studentName: `${student.firstName} ${student.lastName}`,
      messageType,
      priority,
      replyToMessageId,
      threadId,
      metadata: {
        ...(senderModel === 'Parent' && { parentRelationship: req.body.parentRelationship }),
        ...(senderModel === 'Faculty' && {
          teacherSubject: req.body.teacherSubject,
          teacherDepartment: req.body.teacherDepartment
        })
      }
    };    const message = new Message(messageData);
    await message.save();

    // Populate the message with referenced data for response
    await message.populate([
      { path: 'studentId', select: 'firstName lastName grade' },
      { path: 'senderId', refPath: 'senderModel', select: 'firstName lastName' },
      { path: 'recipientId', refPath: 'recipientModel', select: 'firstName lastName' }
    ]);

    // Emit real-time message via Socket.IO if available
    if (req.app && req.app.get('io')) {
      const io = req.app.get('io');
      const messageForSocket = {
        _id: message._id,
        conversationId: message.conversationId,
        content: message.content,
        subject: message.subject,
        senderId: message.senderId,
        senderName: message.senderName,
        senderModel: message.senderModel,
        recipientId: message.recipientId,
        recipientName: message.recipientName,
        recipientModel: message.recipientModel,
        studentId: message.studentId,
        studentName: message.studentName,
        messageType: message.messageType,
        priority: message.priority,
        createdAt: message.createdAt,
        readBy: message.readBy
      };

      // Emit to conversation room
      io.to(`conversation_${message.conversationId}`).emit('new_message', messageForSocket);
      
      // Emit to recipient's personal room
      io.to(`user_${message.recipientId}`).emit('new_message', messageForSocket);
      
      // Send delivery confirmation to sender
      io.to(`user_${message.senderId}`).emit('message_delivered', { 
        messageId: message._id,
        conversationId: message.conversationId 
      });
    }

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: message
    });

  } catch (error) {
    next(error);
  }
};

/**
 * Get conversation between parent and teacher about a specific student
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getConversation = async (req, res, next) => {
  try {
    const { participantId, studentId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    // Determine current user role and validate access
    let currentUserId = req.user.id;
    let otherParticipantId = participantId;

    // Verify user has access to this conversation
    if (req.user.role === 'parent') {
      // Verify parent has relationship with the student
      const relationship = await ParentStudentRelation.findOne({
        parentId: currentUserId,
        studentId,
        isActive: true
      });
      
      if (!relationship) {
        return res.status(403).json({
          success: false,
          message: 'You are not authorized to view this conversation'
        });
      }
    }

    // Build conversation query
    const conversationId = req.user.role === 'parent' 
      ? `parent_${currentUserId}_teacher_${otherParticipantId}_student_${studentId}`
      : `parent_${otherParticipantId}_teacher_${currentUserId}_student_${studentId}`;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const messages = await Message.find({
      conversationId,
      isDeleted: false
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit))
    .populate([
      { path: 'studentId', select: 'firstName lastName grade' },
      { path: 'senderId', refPath: 'senderModel', select: 'firstName lastName department title' },
      { path: 'recipientId', refPath: 'recipientModel', select: 'firstName lastName department title' }
    ]);

    // Count total messages in conversation
    const totalMessages = await Message.countDocuments({
      conversationId,
      isDeleted: false
    });

    // Mark messages as read if current user is the recipient
    const unreadMessages = messages.filter(msg => 
      msg.recipientId.toString() === currentUserId && !msg.isRead
    );

    if (unreadMessages.length > 0) {
      await Message.updateMany(
        {
          _id: { $in: unreadMessages.map(msg => msg._id) },
          recipientId: currentUserId,
          isRead: false
        },
        {
          isRead: true,
          readAt: new Date()
        }
      );
    }

    res.status(200).json({
      success: true,
      data: {
        messages: messages.reverse(), // Return in chronological order
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalMessages / parseInt(limit)),
          totalMessages,
          hasNextPage: skip + messages.length < totalMessages,
          hasPrevPage: parseInt(page) > 1
        },
        conversationId
      }
    });

  } catch (error) {
    next(error);
  }
};

/**
 * Get all conversations for current user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getUserConversations = async (req, res, next) => {
  try {
    const { limit = 20, includeRead = true } = req.query;
    const userId = req.user.id;
    const userType = req.user.role === 'faculty' ? 'teacher' : req.user.role;

    const conversations = await Message.getUserConversations(userId, userType, {
      limit: parseInt(limit)
    });

    // Populate the latest message data
    const populatedConversations = await Promise.all(
      conversations.map(async (conv) => {
        const message = await Message.findById(conv.latestMessage._id)
          .populate([
            { path: 'studentId', select: 'firstName lastName grade' },
            { path: 'senderId', refPath: 'senderModel', select: 'firstName lastName department title' },
            { path: 'recipientId', refPath: 'recipientModel', select: 'firstName lastName department title' }
          ]);

        return {
          conversationId: conv._id,
          latestMessage: message,
          unreadCount: conv.unreadCount,
          messageCount: conv.messageCount,
          participants: message.participants
        };
      })
    );

    res.status(200).json({
      success: true,
      data: populatedConversations
    });

  } catch (error) {
    next(error);
  }
};

/**
 * Mark message as read
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const markMessageAsRead = async (req, res, next) => {
  try {
    const { messageId } = req.params;
    const userId = req.user.id;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    // Verify user is the recipient
    if (message.recipientId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only mark your own messages as read'
      });
    }

    await message.markAsRead();

    res.status(200).json({
      success: true,
      message: 'Message marked as read'
    });

  } catch (error) {
    next(error);
  }
};

/**
 * Get messages for current user (inbox view)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getMessages = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, unreadOnly = false, studentId = null } = req.query;
    const userId = req.user.id;

    const query = {
      recipientId: userId,
      isDeleted: false
    };

    if (unreadOnly === 'true') {
      query.isRead = false;
    }

    if (studentId) {
      query.studentId = studentId;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const messages = await Message.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate([
        { path: 'studentId', select: 'firstName lastName grade' },
        { path: 'senderId', refPath: 'senderModel', select: 'firstName lastName department title' }
      ]);

    const totalMessages = await Message.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        messages,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalMessages / parseInt(limit)),
          totalMessages,
          hasNextPage: skip + messages.length < totalMessages,
          hasPrevPage: parseInt(page) > 1
        }
      }
    });

  } catch (error) {
    next(error);
  }
};

/**
 * Delete a message (soft delete)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const deleteMessage = async (req, res, next) => {
  try {
    const { messageId } = req.params;
    const userId = req.user.id;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    // Only allow sender to delete their own message
    if (message.senderId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own messages'
      });
    }

    message.isDeleted = true;
    message.deletedAt = new Date();
    await message.save();

    res.status(200).json({
      success: true,
      message: 'Message deleted successfully'
    });

  } catch (error) {
    next(error);
  }
};

/**
 * Get message statistics for analytics
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getMessageStats = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { timeframe = '30' } = req.query; // days
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(timeframe));
    
    let query = {
      isDeleted: false,
      createdAt: { $gte: startDate }
    };
    
    // Add user-specific filter
    if (req.user.role === 'parent') {
      query.$or = [
        { senderId: userId, senderModel: 'Parent' },
        { recipientId: userId, recipientModel: 'Parent' }
      ];
    } else if (req.user.role === 'faculty') {
      query.$or = [
        { senderId: userId, senderModel: 'Faculty' },
        { recipientId: userId, recipientModel: 'Faculty' }
      ];
    }
    
    const [
      totalMessages,
      sentMessages,
      receivedMessages,
      unreadMessages,
      urgentMessages,
      messagesByType,
      messagesByPriority
    ] = await Promise.all([
      Message.countDocuments(query),
      Message.countDocuments({ 
        ...query, 
        senderId: userId,
        senderModel: req.user.role === 'parent' ? 'Parent' : 'Faculty'
      }),
      Message.countDocuments({ 
        ...query, 
        recipientId: userId,
        recipientModel: req.user.role === 'parent' ? 'Parent' : 'Faculty'
      }),
      Message.countDocuments({ 
        ...query, 
        recipientId: userId,
        recipientModel: req.user.role === 'parent' ? 'Parent' : 'Faculty',
        isRead: false
      }),
      Message.countDocuments({ 
        ...query, 
        priority: 'urgent'
      }),
      Message.aggregate([
        { $match: query },
        { $group: { _id: '$messageType', count: { $sum: 1 } } }
      ]),
      Message.aggregate([
        { $match: query },
        { $group: { _id: '$priority', count: { $sum: 1 } } }
      ])
    ]);
    
    res.status(200).json({
      success: true,
      data: {
        totalMessages,
        sentMessages,
        receivedMessages,
        unreadMessages,
        urgentMessages,
        messagesByType: messagesByType.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        messagesByPriority: messagesByPriority.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        timeframe: parseInt(timeframe)
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get message templates
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getMessageTemplates = async (req, res, next) => {
  try {
    const { role } = req.user;
    
    const templates = {
      parent: [
        {
          id: 'academic_concern',
          title: 'Academic Concern',
          category: 'academic',
          template: 'Hello {teacherName},\n\nI wanted to discuss {studentName}\'s progress in {subject}. I have some concerns about {specific_area}.\n\nCould we schedule a time to talk?\n\nThank you,\n{parentName}'
        },
        {
          id: 'homework_help',
          title: 'Homework Help Request',
          category: 'academic',
          template: 'Dear {teacherName},\n\n{studentName} is having difficulty with the homework assignment on {topic}. Could you provide some guidance or additional resources?\n\nThank you for your support,\n{parentName}'
        },
        {
          id: 'absence_notification',
          title: 'Absence Notification',
          category: 'attendance',
          template: 'Dear {teacherName},\n\nI wanted to inform you that {studentName} will be absent from school on {date} due to {reason}.\n\nPlease let me know about any assignments that need to be made up.\n\nBest regards,\n{parentName}'
        },
        {
          id: 'parent_teacher_meeting',
          title: 'Parent-Teacher Meeting Request',
          category: 'general',
          template: 'Hello {teacherName},\n\nI would like to schedule a parent-teacher conference to discuss {studentName}\'s progress. I am available {availability}.\n\nPlease let me know what works best for your schedule.\n\nThank you,\n{parentName}'
        }
      ],
      faculty: [
        {
          id: 'progress_update',
          title: 'Student Progress Update',
          category: 'academic',
          template: 'Dear {parentName},\n\nI wanted to update you on {studentName}\'s progress in {subject}. {progress_details}\n\n{studentName} has been {specific_feedback}.\n\nPlease feel free to reach out if you have any questions.\n\nBest regards,\n{teacherName}'
        },
        {
          id: 'behavioral_concern',
          title: 'Behavioral Concern',
          category: 'behavioral',
          template: 'Dear {parentName},\n\nI need to discuss a behavioral concern regarding {studentName}. Today, {incident_description}.\n\nI believe it would be beneficial for us to work together to address this. Could we schedule a meeting?\n\nThank you,\n{teacherName}'
        },
        {
          id: 'positive_feedback',
          title: 'Positive Recognition',
          category: 'general',
          template: 'Dear {parentName},\n\nI wanted to share some wonderful news about {studentName}! {positive_achievement}\n\nYou should be very proud of {studentName}\'s efforts and progress.\n\nBest regards,\n{teacherName}'
        },
        {
          id: 'assignment_reminder',
          title: 'Assignment Reminder',
          category: 'academic',
          template: 'Dear {parentName},\n\nThis is a friendly reminder that {studentName} has an upcoming {assignment_type} due on {due_date} for {subject}.\n\nPlease ensure {studentName} is prepared and has all necessary materials.\n\nThank you,\n{teacherName}'
        }
      ]
    };
    
    res.status(200).json({
      success: true,
      data: templates[role] || []
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get available contacts for messaging
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getAvailableContacts = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { studentId = null } = req.query;

    let contacts = [];

    if (req.user.role === 'parent') {
      // For parents: get teachers of their children
      let studentIds = [];
      
      if (studentId) {
        // Verify parent has access to this student
        const relationship = await ParentStudentRelation.findOne({
          parentId: userId,
          studentId,
          isActive: true
        });
        
        if (relationship) {
          studentIds = [studentId];
        }
      } else {
        // Get all children of this parent
        const relationships = await ParentStudentRelation.find({
          parentId: userId,
          isActive: true
        }).populate('studentId', 'firstName lastName grade');
        
        studentIds = relationships.map(rel => rel.studentId._id);
      }

      if (studentIds.length > 0) {
        // Get teachers (faculty members)
        const teachers = await Faculty.find({ active: true })
          .select('firstName lastName email department title')
          .sort('lastName firstName');
        
        contacts = teachers.map(teacher => ({
          id: teacher._id,
          name: `${teacher.firstName} ${teacher.lastName}`,
          email: teacher.email,
          type: 'teacher',
          department: teacher.department,
          title: teacher.title,
          availableForStudents: studentIds // All teachers available for all students for now
        }));
      }
      
    } else if (req.user.role === 'faculty') {
      // For teachers: get parents of all students
      if (studentId) {
        // Get parents of specific student
        const relationships = await ParentStudentRelation.find({
          studentId,
          isActive: true
        }).populate('parentId', 'firstName lastName email relationToStudent');
        
        contacts = relationships.map(rel => ({
          id: rel.parentId._id,
          name: `${rel.parentId.firstName} ${rel.parentId.lastName}`,
          email: rel.parentId.email,
          type: 'parent',
          relationship: rel.relationship,
          isPrimary: rel.isPrimary
        }));
      } else {
        // Get all parents
        const relationships = await ParentStudentRelation.find({ isActive: true })
          .populate('parentId', 'firstName lastName email')
          .populate('studentId', 'firstName lastName grade')
          .sort('parentId.lastName parentId.firstName');
        
        // Group by parent to avoid duplicates
        const parentMap = new Map();
        relationships.forEach(rel => {
          const parentId = rel.parentId._id.toString();
          if (!parentMap.has(parentId)) {
            parentMap.set(parentId, {
              id: rel.parentId._id,
              name: `${rel.parentId.firstName} ${rel.parentId.lastName}`,
              email: rel.parentId.email,
              type: 'parent',
              children: []
            });
          }
          
          parentMap.get(parentId).children.push({
            id: rel.studentId._id,
            name: `${rel.studentId.firstName} ${rel.studentId.lastName}`,
            grade: rel.studentId.grade,
            relationship: rel.relationship
          });
        });
        
        contacts = Array.from(parentMap.values());
      }
    }

    res.status(200).json({
      success: true,
      data: contacts
    });

  } catch (error) {
    next(error);
  }
};

/**
 * Send a message with file attachment
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const sendMessageWithAttachment = async (req, res, next) => {
  try {
    const {
      recipientId,
      recipientType,
      studentId,
      subject,
      content,
      messageType = 'general',
      priority = 'normal',
      replyToMessageId = null
    } = req.body;

    // Process attachment if file was uploaded
    let attachments = [];
    if (req.file) {
      attachments.push({
        fileName: req.file.originalname,
        filePath: `/uploads/messages/${req.file.filename}`,
        fileType: req.file.mimetype,
        fileSize: req.file.size,
        uploadedAt: new Date()
      });
    }

    // Create message data (reuse logic from sendMessage)
    let senderId, senderModel, senderName;
    
    if (req.user.role === 'parent') {
      const parent = await Parent.findById(req.user.id);
      if (!parent) {
        return res.status(404).json({
          success: false,
          message: 'Parent not found'
        });
      }
      
      senderId = parent._id;
      senderModel = 'Parent';
      senderName = `${parent.firstName} ${parent.lastName}`;
    } else if (req.user.role === 'faculty') {
      const faculty = await Faculty.findById(req.user.id);
      if (!faculty) {
        return res.status(404).json({
          success: false,
          message: 'Faculty not found'
        });
      }
      
      senderId = faculty._id;
      senderModel = 'Faculty';
      senderName = `${faculty.firstName} ${faculty.lastName}`;
    }

    // Find student
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Find recipient
    let recipient, recipientModel, recipientName;
    if (recipientType === 'parent') {
      recipient = await Parent.findById(recipientId);
      recipientModel = 'Parent';
    } else if (recipientType === 'teacher' || recipientType === 'faculty') {
      recipient = await Faculty.findById(recipientId);
      recipientModel = 'Faculty';
    }

    if (!recipient) {
      return res.status(404).json({
        success: false,
        message: `${recipientType} not found`
      });
    }

    recipientName = `${recipient.firstName} ${recipient.lastName}`;

    // Handle thread management for replies
    let threadId = null;
    if (replyToMessageId) {
      const originalMessage = await Message.findById(replyToMessageId);
      if (originalMessage) {
        threadId = originalMessage.threadId;
      }
    }

    // Create the message with attachment
    const messageData = {
      subject,
      content,
      senderId,
      senderModel,
      senderName,
      recipientId,
      recipientModel,
      recipientName,
      studentId,
      studentName: `${student.firstName} ${student.lastName}`,
      messageType,
      priority,
      replyToMessageId,
      threadId,
      attachments, // Add attachments to message
      metadata: {
        ...(senderModel === 'Parent' && { parentRelationship: req.body.parentRelationship }),
        ...(senderModel === 'Faculty' && {
          teacherSubject: req.body.teacherSubject,
          teacherDepartment: req.body.teacherDepartment
        })
      }
    };

    const message = new Message(messageData);
    await message.save();

    // Populate the message with referenced data for response
    await message.populate([
      { path: 'studentId', select: 'firstName lastName grade' },
      { path: 'senderId', refPath: 'senderModel', select: 'firstName lastName' },
      { path: 'recipientId', refPath: 'recipientModel', select: 'firstName lastName' }
    ]);

    // Emit real-time message via Socket.IO if available
    if (req.app && req.app.get('io')) {
      const io = req.app.get('io');
      const messageForSocket = {
        _id: message._id,
        conversationId: message.conversationId,
        content: message.content,
        subject: message.subject,
        senderId: message.senderId,
        senderName: message.senderName,
        senderModel: message.senderModel,
        recipientId: message.recipientId,
        recipientName: message.recipientName,
        recipientModel: message.recipientModel,
        studentId: message.studentId,
        studentName: message.studentName,
        messageType: message.messageType,
        priority: message.priority,
        attachments: message.attachments,
        createdAt: message.createdAt,
        readBy: message.readBy
      };

      // Emit to conversation room
      io.to(`conversation_${message.conversationId}`).emit('new_message', messageForSocket);
      
      // Emit to recipient's personal room
      io.to(`user_${message.recipientId}`).emit('new_message', messageForSocket);
      
      // Send delivery confirmation to sender
      io.to(`user_${message.senderId}`).emit('message_delivered', { 
        messageId: message._id,
        conversationId: message.conversationId 
      });
    }

    res.status(201).json({
      success: true,
      message: 'Message with attachment sent successfully',
      data: message
    });

  } catch (error) {
    next(error);
  }
};

/**
 * Download message attachment
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const downloadAttachment = async (req, res, next) => {
  try {
    const { messageId, attachmentIndex } = req.params;

    // Find the message
    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    // Verify user has access to this message
    const userId = req.user.id;
    const hasAccess = message.senderId.toString() === userId || 
                     message.recipientId.toString() === userId;

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Get the attachment
    const attachment = message.attachments[parseInt(attachmentIndex)];
    if (!attachment) {
      return res.status(404).json({
        success: false,
        message: 'Attachment not found'
      });
    }

    // Construct file path
    const filePath = path.join(__dirname, '..', attachment.filePath);
    
    // Check if file exists
    const fs = require('fs');
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'File not found on server'
      });
    }

    // Set appropriate headers
    res.setHeader('Content-Disposition', `attachment; filename="${attachment.fileName}"`);
    res.setHeader('Content-Type', attachment.fileType);

    // Send file
    res.sendFile(filePath);

  } catch (error) {
    next(error);
  }
};

module.exports = {
  // Base CRUD operations
  ...baseController,
  
  // Custom messaging operations
  sendMessage,
  getConversation,
  getUserConversations,
  markMessageAsRead,
  getMessages,
  deleteMessage,
  getAvailableContacts,
  
  // Enhanced features
  getMessageStats,
  getMessageTemplates,
  
  // File attachment features
  sendMessageWithAttachment,
  downloadAttachment
};
