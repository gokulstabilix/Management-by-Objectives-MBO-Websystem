const router = require('express').Router();
const mboFormController = require('../controllers/mboFormController');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const { validate } = require('../middleware/validate');
const { createMboSchema, updateMboSchema, reviewMboSchema, saveAccomplishmentsSchema, finalReviewMboSchema } = require('../validators/mboFormSchemas');
const AppError = require('../utils/AppError');

router.use(authenticate);

// ── Field-level authorization middlewares ──
const checkEmployeeP2Fields = (req, res, next) => {
  if (req.body.accomplishments && Array.isArray(req.body.accomplishments)) {
    const hasManagerFields = req.body.accomplishments.some(a => 'managerComment' in a || 'achievedPercent' in a);
    if (hasManagerFields) return next(new AppError('You are not authorized to update mentor fields.', 403));
  }
  next();
};

const checkMentorP2Fields = (req, res, next) => {
  if (req.body.objectives && Array.isArray(req.body.objectives)) {
    const hasEmployeeFields = req.body.objectives.some(a => 'accomplishment' in a || 'accomplished' in a);
    if (hasEmployeeFields) return next(new AppError('You are not authorized to update employee fields.', 403));
  }
  next();
};

// ── Employee routes ──
router.post('/', authorize('employee'), validate(createMboSchema), mboFormController.createDraft);
router.patch('/:id', authorize('employee'), validate(updateMboSchema), mboFormController.updateDraft);
router.patch('/:id/submit', authorize('employee'), mboFormController.submitForm);
router.patch('/:id/resubmit', authorize('employee'), mboFormController.resubmitForm);
router.patch('/:id/accomplishments', authorize('employee'), checkEmployeeP2Fields, validate(saveAccomplishmentsSchema), mboFormController.saveAccomplishments);
router.patch('/:id/accomplishments/submit', authorize('employee'), mboFormController.submitAccomplishments);

// ── Mentor routes (employee role, but acting as mentor) ──
router.patch('/:id/review', authorize('employee'), validate(reviewMboSchema), mboFormController.reviewForm);
router.patch('/:id/final-review', authorize('employee'), checkMentorP2Fields, validate(finalReviewMboSchema), mboFormController.finalReview);

// ── Employee read routes ──
router.get('/my', authorize('employee'), mboFormController.getMyForms);
/**
 * GET /mbo/my-mentees
 * Source-of-truth mentee list: driven by mentor assignment (User.mentorId),
 * NOT by MBO form existence. Employees without a form are included with latestForm: null.
 */
router.get('/my-mentees', authorize('employee'), mboFormController.getMyMentees);
router.get('/mentees', authorize('employee'), mboFormController.getMenteeForms);
router.get('/mentees/:formId', authorize('employee'), mboFormController.getMenteeFormDetail);

// ── Employee: fetch single form by ID ──
router.get('/:id', authorize('employee'), mboFormController.getFormById);

// ── Admin/HR: status-only view ──
router.get('/', authorize('admin', 'hr'), mboFormController.listForAdmin);

module.exports = router;
