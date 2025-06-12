/**
 * Base controller with common CRUD operations
 * @param {Model} model - Mongoose model
 */
const createBaseController = (model) => {
  return {
    /**
     * Get all resources
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @param {Function} next - Express next middleware function
     */
    getAll: async (req, res, next) => {
      try {
        const resources = await model.find();
        res.status(200).json({
          success: true,
          count: resources.length,
          data: resources
        });
      } catch (error) {
        next(error);
      }
    },

    /**
     * Get single resource by ID
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @param {Function} next - Express next middleware function
     */
    getById: async (req, res, next) => {
      try {
        const resource = await model.findById(req.params.id);
        
        if (!resource) {
          return res.status(404).json({
            success: false,
            message: 'Resource not found'
          });
        }
        
        res.status(200).json({
          success: true,
          data: resource
        });
      } catch (error) {
        next(error);
      }
    },

    /**
     * Create new resource
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @param {Function} next - Express next middleware function
     */
    create: async (req, res, next) => {
      try {
        const resource = await model.create(req.body);
        
        res.status(201).json({
          success: true,
          data: resource
        });
      } catch (error) {
        next(error);
      }
    },

    /**
     * Update resource
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @param {Function} next - Express next middleware function
     */
    update: async (req, res, next) => {
      try {
        const resource = await model.findByIdAndUpdate(
          req.params.id,
          req.body,
          { new: true, runValidators: true }
        );
        
        if (!resource) {
          return res.status(404).json({
            success: false,
            message: 'Resource not found'
          });
        }
        
        res.status(200).json({
          success: true,
          data: resource
        });
      } catch (error) {
        next(error);
      }
    },

    /**
     * Delete resource
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @param {Function} next - Express next middleware function
     */
    delete: async (req, res, next) => {
      try {
        const resource = await model.findByIdAndDelete(req.params.id);
        
        if (!resource) {
          return res.status(404).json({
            success: false,
            message: 'Resource not found'
          });
        }
        
        res.status(200).json({
          success: true,
          data: {}
        });
      } catch (error) {
        next(error);
      }
    }
  };
};

module.exports = createBaseController;
