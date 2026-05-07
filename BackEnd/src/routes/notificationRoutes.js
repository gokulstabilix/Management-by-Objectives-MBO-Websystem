const router = require('express').Router();
const notificationController = require('../controllers/notificationController');
const authenticate = require('../middleware/authenticate');

router.use(authenticate);

router.get('/', notificationController.getNotifications);
router.patch('/read-all', notificationController.markAllRead);
router.patch('/:id/read', notificationController.markRead);

module.exports = router;
