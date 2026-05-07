const router = require('express').Router();
const mentorMapController = require('../controllers/mentorMapController');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const { validate } = require('../middleware/validate');
const { assignMentorSchema, updateMentorSchema } = require('../validators/mentorMapSchemas');

// All mentor-map routes: HR only
router.use(authenticate, authorize('hr'));

router.post('/', validate(assignMentorSchema), mentorMapController.assignMentor);
router.get('/', mentorMapController.listMappings);
router.patch('/:employeeId', validate(updateMentorSchema), mentorMapController.updateMentor);
router.delete('/:employeeId', mentorMapController.removeMentor);

module.exports = router;
