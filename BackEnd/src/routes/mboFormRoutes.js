const router = require('express').Router();
const mboFormController = require('../controllers/mboFormController');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const { validate } = require('../middleware/validate');
const { createMboSchema, updateMboSchema, reviewMboSchema } = require('../validators/mboFormSchemas');

router.use(authenticate);

// ── Employee routes ──
router.post('/', authorize('employee'), validate(createMboSchema), mboFormController.createDraft);
router.patch('/:id', authorize('employee'), validate(updateMboSchema), mboFormController.updateDraft);
router.patch('/:id/submit', authorize('employee'), mboFormController.submitForm);
router.patch('/:id/resubmit', authorize('employee'), mboFormController.resubmitForm);

// ── Mentor routes (employee role, but acting as mentor) ──
router.patch('/:id/review', authorize('employee'), validate(reviewMboSchema), mboFormController.reviewForm);

// ── Employee read routes ──
router.get('/my', authorize('employee'), mboFormController.getMyForms);
router.get('/mentees', authorize('employee'), mboFormController.getMenteeForms);
router.get('/mentees/:formId', authorize('employee'), mboFormController.getMenteeFormDetail);

// ── Employee: fetch single form by ID ──
router.get('/:id', authorize('employee'), mboFormController.getFormById);

// ── Admin/HR: status-only view ──
router.get('/', authorize('admin', 'hr'), mboFormController.listForAdmin);

module.exports = router;
