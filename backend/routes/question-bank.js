/**
 * Question Bank Routes
 * Handles question bank management for faculty
 */

const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');

// Mock question bank data for now
let questionBank = [
  {
    id: 1,
    question: 'What is the capital of France?',
    type: 'multiple-choice',
    options: ['London', 'Berlin', 'Paris', 'Madrid'],
    correctAnswer: 'Paris',
    category: 'Geography',
    subject: 'Social Studies',
    difficulty: 'easy',
    points: 1,
    explanation: 'Paris is the capital and largest city of France.',
    tags: ['geography', 'capitals', 'europe'],
    createdBy: 'faculty123',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 2,
    question: 'What is 2 + 2?',
    type: 'multiple-choice',
    options: ['3', '4', '5', '6'],
    correctAnswer: '4',
    category: 'Arithmetic',
    subject: 'Mathematics',
    difficulty: 'easy',
    points: 1,
    explanation: '2 + 2 equals 4.',
    tags: ['math', 'addition', 'basic'],
    createdBy: 'faculty123',
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

/**
 * @route   GET /api/question-bank
 * @desc    Get all questions from question bank with filtering
 * @access  Private (Faculty, Admin)
 */
router.get('/', auth, roleAuth(['faculty', 'admin']), (req, res) => {
  try {
    const { category, subject, difficulty, search } = req.query;
    let filteredQuestions = [...questionBank];

    // Apply filters
    if (category) {
      filteredQuestions = filteredQuestions.filter(q => 
        q.category.toLowerCase().includes(category.toLowerCase())
      );
    }

    if (subject) {
      filteredQuestions = filteredQuestions.filter(q => 
        q.subject.toLowerCase().includes(subject.toLowerCase())
      );
    }

    if (difficulty) {
      filteredQuestions = filteredQuestions.filter(q => q.difficulty === difficulty);
    }

    if (search) {
      filteredQuestions = filteredQuestions.filter(q => 
        q.question.toLowerCase().includes(search.toLowerCase()) ||
        q.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase()))
      );
    }

    res.status(200).json({
      success: true,
      count: filteredQuestions.length,
      questions: filteredQuestions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * @route   POST /api/question-bank
 * @desc    Create a new question
 * @access  Private (Faculty, Admin)
 */
router.post('/', auth, roleAuth(['faculty', 'admin']), (req, res) => {
  try {
    const {
      question,
      type,
      options,
      correctAnswer,
      category,
      subject,
      difficulty,
      points,
      explanation,
      tags
    } = req.body;

    // Basic validation
    if (!question || !type || !correctAnswer) {
      return res.status(400).json({
        success: false,
        message: 'Question, type, and correct answer are required'
      });
    }

    const newQuestion = {
      id: questionBank.length + 1,
      question,
      type,
      options: options || [],
      correctAnswer,
      category: category || 'General',
      subject: subject || 'General',
      difficulty: difficulty || 'medium',
      points: points || 1,
      explanation: explanation || '',
      tags: tags || [],
      createdBy: req.user.id,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    questionBank.push(newQuestion);

    res.status(201).json({
      success: true,
      message: 'Question created successfully',
      question: newQuestion
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * @route   PUT /api/question-bank/:id
 * @desc    Update a question
 * @access  Private (Faculty, Admin)
 */
router.put('/:id', auth, roleAuth(['faculty', 'admin']), (req, res) => {
  try {
    const questionId = parseInt(req.params.id);
    const questionIndex = questionBank.findIndex(q => q.id === questionId);

    if (questionIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }

    // Update the question
    const updatedQuestion = {
      ...questionBank[questionIndex],
      ...req.body,
      updatedAt: new Date()
    };

    questionBank[questionIndex] = updatedQuestion;

    res.status(200).json({
      success: true,
      message: 'Question updated successfully',
      question: updatedQuestion
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * @route   DELETE /api/question-bank/:id
 * @desc    Delete a question
 * @access  Private (Faculty, Admin)
 */
router.delete('/:id', auth, roleAuth(['faculty', 'admin']), (req, res) => {
  try {
    const questionId = parseInt(req.params.id);
    const questionIndex = questionBank.findIndex(q => q.id === questionId);

    if (questionIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }

    questionBank.splice(questionIndex, 1);

    res.status(200).json({
      success: true,
      message: 'Question deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * @route   POST /api/question-bank/bulk-delete
 * @desc    Delete multiple questions
 * @access  Private (Faculty, Admin)
 */
router.post('/bulk-delete', auth, roleAuth(['faculty', 'admin']), (req, res) => {
  try {
    const { questionIds } = req.body;

    if (!Array.isArray(questionIds)) {
      return res.status(400).json({
        success: false,
        message: 'Question IDs must be an array'
      });
    }

    const deletedCount = questionIds.length;
    questionBank = questionBank.filter(q => !questionIds.includes(q.id));

    res.status(200).json({
      success: true,
      message: `${deletedCount} questions deleted successfully`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * @route   GET /api/question-bank/export
 * @desc    Export questions in specified format
 * @access  Private (Faculty, Admin)
 */
router.get('/export', auth, roleAuth(['faculty', 'admin']), (req, res) => {
  try {
    const { format = 'json' } = req.query;

    if (format === 'json') {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', 'attachment; filename="question-bank.json"');
      res.status(200).json(questionBank);
    } else {
      res.status(400).json({
        success: false,
        message: 'Unsupported export format'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * @route   POST /api/question-bank/import
 * @desc    Import questions from file
 * @access  Private (Faculty, Admin)
 */
router.post('/import', auth, roleAuth(['faculty', 'admin']), (req, res) => {
  try {
    const { questions } = req.body;

    if (!Array.isArray(questions)) {
      return res.status(400).json({
        success: false,
        message: 'Questions must be an array'
      });
    }

    const importedQuestions = questions.map((q, index) => ({
      id: questionBank.length + index + 1,
      ...q,
      createdBy: req.user.id,
      createdAt: new Date(),
      updatedAt: new Date()
    }));

    questionBank.push(...importedQuestions);

    res.status(201).json({
      success: true,
      message: `${importedQuestions.length} questions imported successfully`,
      questions: importedQuestions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * @route   GET /api/question-bank/categories
 * @desc    Get all available categories
 * @access  Private (Faculty, Admin)
 */
router.get('/categories', auth, roleAuth(['faculty', 'admin']), (req, res) => {
  try {
    const categories = [...new Set(questionBank.map(q => q.category))];
    
    res.status(200).json({
      success: true,
      categories
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * @route   POST /api/question-bank/categories
 * @desc    Create a new category
 * @access  Private (Faculty, Admin)
 */
router.post('/categories', auth, roleAuth(['faculty', 'admin']), (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Category name is required'
      });
    }

    // In a real implementation, you would save this to a database
    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      category: { name }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
