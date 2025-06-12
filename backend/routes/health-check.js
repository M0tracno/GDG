const router = require('express').Router();
const { sequelize } = require('../config/database');
const { version } = require('../package.json');

/**
 * @swagger
 * /api/health-check:
 *   get:
 *     summary: Health check endpoint
 *     description: Returns health status of the API and its dependencies
 *     tags: [Monitoring]
 *     responses:
 *       200:
 *         description: Service is healthy
 *       500:
 *         description: Service is unhealthy
 */
router.get('/', async (req, res) => {
  try {
    // Check database connection
    await sequelize.authenticate();
    
    // Return minimal health information to avoid leaking system details
    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString()
    });
  }
});

// Add detailed health check route with authentication
const auth = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');

/**
 * @swagger
 * /api/health-check/detailed:
 *   get:
 *     summary: Detailed health check endpoint (Admin only)
 *     description: Returns detailed health status of the API and its dependencies
 *     tags: [Monitoring]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Service is healthy
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Service is unhealthy
 */
router.get('/detailed', auth, roleAuth(['admin']), async (req, res) => {
  try {
    // Check database connection
    await sequelize.authenticate();
    
    // Return detailed health information for admin users
    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version,
      database: 'connected',
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
      nodeVersion: process.version,
      platform: process.platform,
      environment: process.env.NODE_ENV || 'development'
    });
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      version,
      database: 'disconnected',
      error: error.message
    });
  }
});

module.exports = router;
