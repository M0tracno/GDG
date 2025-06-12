// Admin Authentication routes
const router = require('express').Router();
const adminAuthController = require('../controllers/adminAuthController');
const auth = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');

/**
 * @route   POST /api/admin/auth/create-user
 * @desc    Create a new user with direct password setup
 * @access  Private/Admin
 */
router.post(
  '/create-user',
  [auth, roleAuth('admin')],
  adminAuthController.createUserWithPassword
);

/**
 * @route   GET /api/admin/auth/users
 * @desc    Get all users (faculty and students)
 * @access  Private/Admin
 */
router.get(
  '/users',
  [auth, roleAuth('admin')],
  adminAuthController.getAllUsers
);

/**
 * @route   PUT /api/admin/auth/users/:id
 * @desc    Update an existing user
 * @access  Private/Admin
 */
router.put(
  '/users/:id',
  [auth, roleAuth('admin')],
  adminAuthController.updateUser
);

/**
 * @route   DELETE /api/admin/auth/users/:id
 * @desc    Delete a user
 * @access  Private/Admin
 */
router.delete(
  '/users/:id',
  [auth, roleAuth('admin')],
  adminAuthController.deleteUser
);

module.exports = router;
