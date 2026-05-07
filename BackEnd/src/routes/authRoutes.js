const router = require('express').Router();
const authController = require('../controllers/authController');
const authenticate = require('../middleware/authenticate');
const { validate } = require('../middleware/validate');
const { loginSchema, changePasswordSchema } = require('../validators/authSchemas');

router.post('/login', validate(loginSchema), authController.login);
router.post('/refresh', authController.refresh);
router.post('/logout', authenticate, authController.logout);
router.post('/change-password', authenticate, validate(changePasswordSchema), authController.changePassword);

module.exports = router;
