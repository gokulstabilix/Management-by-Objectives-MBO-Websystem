const router = require('express').Router();
const quarterController = require('../controllers/quarterController');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const { validate } = require('../middleware/validate');
const { createQuarterSchema } = require('../validators/quarterSchemas');

router.use(authenticate);

router.post('/', authorize('admin', 'hr'), validate(createQuarterSchema), quarterController.createQuarter);
router.patch('/:id/close', authorize('admin', 'hr'), quarterController.closeQuarter);
router.get('/', quarterController.listQuarters);        // any authenticated user
router.get('/:id', quarterController.getQuarter);        // any authenticated user

module.exports = router;
