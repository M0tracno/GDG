/**
 * Subjects Routes
 * Handles subject management for the application
 */

const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');

// Mock subjects data for now
let subjects = [
  {
    id: 1,
    name: 'Mathematics',
    code: 'MATH',
    description: 'Mathematics and related topics',
    category: 'STEM',
    grade: '10',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 2,
    name: 'Physics',
    code: 'PHYS',
    description: 'Physics and related topics',
    category: 'STEM',
    grade: '10',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 3,
    name: 'Chemistry',
    code: 'CHEM',
    description: 'Chemistry and related topics',
    category: 'STEM',
    grade: '10',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 4,
    name: 'Biology',
    code: 'BIO',
    description: 'Biology and related topics',
    category: 'STEM',
    grade: '10',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 5,
    name: 'English',
    code: 'ENG',
    description: 'English Language and Literature',
    category: 'Languages',
    grade: '10',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 6,
    name: 'History',
    code: 'HIST',
    description: 'History and Social Studies',
    category: 'Social Studies',
    grade: '10',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

/**
 * @route   GET /api/subjects
 * @desc    Get all subjects with optional filtering
 * @access  Private (Any authenticated user)
 */
router.get('/', auth, (req, res) => {
  try {
    const { category, grade, search, isActive } = req.query;
    let filteredSubjects = [...subjects];

    // Apply filters
    if (category) {
      filteredSubjects = filteredSubjects.filter(s => 
        s.category.toLowerCase().includes(category.toLowerCase())
      );
    }

    if (grade) {
      filteredSubjects = filteredSubjects.filter(s => s.grade === grade);
    }

    if (isActive !== undefined) {
      filteredSubjects = filteredSubjects.filter(s => s.isActive === (isActive === 'true'));
    }

    if (search) {
      filteredSubjects = filteredSubjects.filter(s => 
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.code.toLowerCase().includes(search.toLowerCase()) ||
        s.description.toLowerCase().includes(search.toLowerCase())
      );
    }

    res.status(200).json({
      success: true,
      count: filteredSubjects.length,
      subjects: filteredSubjects
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * @route   GET /api/subjects/:id
 * @desc    Get subject by ID
 * @access  Private (Any authenticated user)
 */
router.get('/:id', auth, (req, res) => {
  try {
    const subjectId = parseInt(req.params.id);
    const subject = subjects.find(s => s.id === subjectId);

    if (!subject) {
      return res.status(404).json({
        success: false,
        message: 'Subject not found'
      });
    }

    res.status(200).json({
      success: true,
      subject
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * @route   POST /api/subjects
 * @desc    Create a new subject
 * @access  Private (Admin only)
 */
router.post('/', auth, roleAuth(['admin']), (req, res) => {
  try {
    const { name, code, description, category, grade } = req.body;

    // Basic validation
    if (!name || !code) {
      return res.status(400).json({
        success: false,
        message: 'Subject name and code are required'
      });
    }

    // Check if subject code already exists
    const existingSubject = subjects.find(s => s.code.toLowerCase() === code.toLowerCase());
    if (existingSubject) {
      return res.status(400).json({
        success: false,
        message: 'Subject code already exists'
      });
    }

    const newSubject = {
      id: subjects.length + 1,
      name,
      code: code.toUpperCase(),
      description: description || '',
      category: category || 'General',
      grade: grade || '10',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    subjects.push(newSubject);

    res.status(201).json({
      success: true,
      message: 'Subject created successfully',
      subject: newSubject
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * @route   PUT /api/subjects/:id
 * @desc    Update a subject
 * @access  Private (Admin only)
 */
router.put('/:id', auth, roleAuth(['admin']), (req, res) => {
  try {
    const subjectId = parseInt(req.params.id);
    const subjectIndex = subjects.findIndex(s => s.id === subjectId);

    if (subjectIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Subject not found'
      });
    }

    // Check if new code conflicts with existing subjects
    if (req.body.code) {
      const existingSubject = subjects.find(s => 
        s.code.toLowerCase() === req.body.code.toLowerCase() && s.id !== subjectId
      );
      if (existingSubject) {
        return res.status(400).json({
          success: false,
          message: 'Subject code already exists'
        });
      }
    }

    // Update the subject
    const updatedSubject = {
      ...subjects[subjectIndex],
      ...req.body,
      updatedAt: new Date()
    };

    subjects[subjectIndex] = updatedSubject;

    res.status(200).json({
      success: true,
      message: 'Subject updated successfully',
      subject: updatedSubject
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * @route   DELETE /api/subjects/:id
 * @desc    Delete a subject (soft delete by setting isActive to false)
 * @access  Private (Admin only)
 */
router.delete('/:id', auth, roleAuth(['admin']), (req, res) => {
  try {
    const subjectId = parseInt(req.params.id);
    const subjectIndex = subjects.findIndex(s => s.id === subjectId);

    if (subjectIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Subject not found'
      });
    }

    // Soft delete by setting isActive to false
    subjects[subjectIndex].isActive = false;
    subjects[subjectIndex].updatedAt = new Date();

    res.status(200).json({
      success: true,
      message: 'Subject deactivated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * @route   GET /api/subjects/categories
 * @desc    Get all available categories
 * @access  Private (Any authenticated user)
 */
router.get('/categories', auth, (req, res) => {
  try {
    const categories = [...new Set(subjects.map(s => s.category))];
    
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
 * @route   GET /api/subjects/grades
 * @desc    Get all available grades
 * @access  Private (Any authenticated user)
 */
router.get('/grades', auth, (req, res) => {
  try {
    const grades = [...new Set(subjects.map(s => s.grade))];
    
    res.status(200).json({
      success: true,
      grades
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
