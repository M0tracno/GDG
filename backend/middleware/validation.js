const { body, param, validationResult } = require('express-validator');

// Middleware to check validation results
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Auth validation rules
const loginValidation = [
  body('email').optional().isEmail().withMessage('Please provide a valid email'),
  body('password').optional().notEmpty().withMessage('Password is required'),
  validateRequest
];

const registerValidation = [
  body('firstName').notEmpty().withMessage('First name is required'),
  body('lastName').notEmpty().withMessage('Last name is required'),
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  validateRequest
];

// Course validation rules
const courseValidation = [
  body('title').notEmpty().withMessage('Course title is required'),
  body('description').notEmpty().withMessage('Course description is required'),
  validateRequest
];

// Student validation rules
const studentValidation = [
  body('name').notEmpty().withMessage('Student name is required'),
  body('email').isEmail().withMessage('Please provide a valid email'),
  validateRequest
];

// Faculty validation rules
const facultyValidation = [
  body('name').notEmpty().withMessage('Faculty name is required'),
  body('email').isEmail().withMessage('Please provide a valid email'),
  validateRequest
];

// ID parameter validation
const idParamValidation = [
  param('id').isInt().withMessage('Invalid ID format'),
  validateRequest
];

module.exports = {
  loginValidation,
  registerValidation,
  courseValidation,
  studentValidation,
  facultyValidation,
  idParamValidation,
  validateRequest
}; 