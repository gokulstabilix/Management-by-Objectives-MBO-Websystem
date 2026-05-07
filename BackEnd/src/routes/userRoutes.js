const router = require('express').Router();
const userController = require('../controllers/userController');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const { validate } = require('../middleware/validate');
const { createUserSchema, updateUserSchema } = require('../validators/userSchemas');

// All routes require auth + admin or hr role
router.use(authenticate);

router.post('/', authorize('admin', 'hr'), validate(createUserSchema), userController.createUser);
router.get('/', authorize('admin', 'hr'), userController.listUsers);
router.get('/:id', authorize('admin', 'hr'), userController.getUser);
router.patch('/:id', authorize('admin', 'hr'), validate(updateUserSchema), userController.updateUser);
router.patch('/:id/deactivate', authorize('admin'), userController.deactivateUser);

module.exports = router;
