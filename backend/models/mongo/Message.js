const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  // Conversation identification
  conversationId: {
    type: String,
    required: true,
    index: true,
    // Format: "parent_{parentId}_teacher_{teacherId}_student_{studentId}"
  },
  
  // Message content
  subject: {
    type: String,
    required: [true, 'Message subject is required'],
    trim: true,
    maxlength: [200, 'Subject cannot be longer than 200 characters']
  },
  content: {
    type: String,
    required: [true, 'Message content is required'],
    trim: true,
    maxlength: [2000, 'Message cannot be longer than 2000 characters']
  },
  
  // Sender information
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'senderModel'
  },
  senderModel: {
    type: String,
    required: true,
    enum: ['Parent', 'Faculty']
  },
  senderName: {
    type: String,
    required: true,
    trim: true
  },
  
  // Recipient information
  recipientId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'recipientModel'
  },
  recipientModel: {
    type: String,
    required: true,
    enum: ['Parent', 'Faculty']
  },
  recipientName: {
    type: String,
    required: true,
    trim: true
  },
  
  // Student context (which student the conversation is about)
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true,
    index: true
  },
  studentName: {
    type: String,
    required: true,
    trim: true
  },
  
  // Message status
  isRead: {
    type: Boolean,
    default: false,
    index: true
  },
  readAt: {
    type: Date,
    default: null
  },
  
  // Message type and priority
  messageType: {
    type: String,
    enum: ['general', 'academic', 'behavioral', 'attendance', 'urgent'],
    default: 'general'
  },
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal'
  },
  
  // Thread management
  threadId: {
    type: String,
    index: true
  },
  replyToMessageId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message',
    default: null
  },
  
  // Attachments (for future enhancement)
  attachments: [{
    fileName: String,
    fileUrl: String,
    fileSize: Number,
    mimeType: String
  }],
  
  // System fields
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: {
    type: Date,
    default: null
  },
  
  // Metadata
  metadata: {
    parentRelationship: {
      type: String,
      enum: ['Father', 'Mother', 'Guardian', 'Other']
    },
    teacherSubject: String,
    teacherDepartment: String
  }
}, {
  timestamps: true,
  collection: 'messages'
});

// Compound indexes for efficient querying
MessageSchema.index({ conversationId: 1, createdAt: -1 });
MessageSchema.index({ senderId: 1, createdAt: -1 });
MessageSchema.index({ recipientId: 1, createdAt: -1 });
MessageSchema.index({ studentId: 1, createdAt: -1 });
MessageSchema.index({ threadId: 1, createdAt: 1 });
MessageSchema.index({ isRead: 1, recipientId: 1 });
MessageSchema.index({ messageType: 1, priority: 1 });

// Pre-save middleware to generate conversationId and threadId
MessageSchema.pre('save', function(next) {
  // Generate conversationId if not exists
  if (!this.conversationId) {
    // Sort IDs to ensure consistent conversation ID regardless of who initiates
    const parentId = this.senderModel === 'Parent' ? this.senderId : this.recipientId;
    const facultyId = this.senderModel === 'Faculty' ? this.senderId : this.recipientId;
    this.conversationId = `parent_${parentId}_teacher_${facultyId}_student_${this.studentId}`;
  }
  
  // Generate threadId if this is a new conversation thread
  if (!this.threadId && !this.replyToMessageId) {
    this.threadId = `thread_${this.conversationId}_${Date.now()}`;
  }
  
  next();
});

// Static method to get conversation between parent and teacher about a student
MessageSchema.statics.getConversation = function(parentId, teacherId, studentId, options = {}) {
  const conversationId = `parent_${parentId}_teacher_${teacherId}_student_${studentId}`;
  
  const query = {
    conversationId,
    isDeleted: false
  };
  
  return this.find(query)
    .sort({ createdAt: options.sortDesc ? -1 : 1 })
    .limit(options.limit || 50)
    .skip(options.skip || 0);
};

// Static method to get all conversations for a user
MessageSchema.statics.getUserConversations = function(userId, userType, options = {}) {
  const query = {
    isDeleted: false
  };
  
  if (userType === 'parent') {
    query.$or = [
      { senderId: userId, senderModel: 'Parent' },
      { recipientId: userId, recipientModel: 'Parent' }
    ];
  } else if (userType === 'teacher') {
    query.$or = [
      { senderId: userId, senderModel: 'Faculty' },
      { recipientId: userId, recipientModel: 'Faculty' }
    ];
  }
  
  // Group by conversationId and get latest message from each conversation
  return this.aggregate([
    { $match: query },
    { $sort: { createdAt: -1 } },
    {
      $group: {
        _id: '$conversationId',
        latestMessage: { $first: '$$ROOT' },
        unreadCount: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $eq: ['$recipientId', new mongoose.Types.ObjectId(userId)] },
                  { $eq: ['$isRead', false] }
                ]
              },
              1,
              0
            ]
          }
        },
        messageCount: { $sum: 1 }
      }
    },
    { $sort: { 'latestMessage.createdAt': -1 } },
    { $limit: options.limit || 20 }
  ]);
};

// Instance method to mark message as read
MessageSchema.methods.markAsRead = function() {
  if (!this.isRead) {
    this.isRead = true;
    this.readAt = new Date();
    return this.save();
  }
  return Promise.resolve(this);
};

// Virtual for formatted conversation participants
MessageSchema.virtual('participants').get(function() {
  return {
    parent: {
      id: this.senderModel === 'Parent' ? this.senderId : this.recipientId,
      name: this.senderModel === 'Parent' ? this.senderName : this.recipientName
    },
    teacher: {
      id: this.senderModel === 'Faculty' ? this.senderId : this.recipientId,
      name: this.senderModel === 'Faculty' ? this.senderName : this.recipientName
    },
    student: {
      id: this.studentId,
      name: this.studentName
    }
  };
});

// Ensure virtual fields are serialized
MessageSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    delete ret.isDeleted;
    delete ret.__v;
    return ret;
  }
});

module.exports = mongoose.model('Message', MessageSchema);
