const router = require('express').Router();
const { protect, requireRole } = require('../middleware/auth.middleware');
const {
  createBox, listAllBoxes, listBoxes, listPublicCompanies, submitCV, listSubmissions, updateBox, cvUpload, viewSubmissionCV,
} = require('../controllers/companyBox.controller');

// Public — all active company boxes (for main page)
router.get('/', listAllBoxes);

// Public — companies with active CV boxes (for CV Boxes page)
router.get('/public', listPublicCompanies);

// Employer — create a CV box
router.post('/', protect, requireRole('EMPLOYER'), createBox);

// Public — list active boxes for a company
router.get('/:companyId', listBoxes);

// Public (candidate) — submit a CV to a box
router.post('/:boxId/submit', cvUpload.single('cv'), submitCV);

// Employer — view submissions (auth + ownership enforced in controller)
router.get('/:boxId/submissions', protect, requireRole('EMPLOYER'), listSubmissions);

// Employer — mark a submission's CV as viewed (notifies candidate)
router.post('/:boxId/submissions/:subId/view', protect, requireRole('EMPLOYER'), viewSubmissionCV);

// Employer — toggle active / update title or description
router.patch('/:boxId', protect, requireRole('EMPLOYER'), updateBox);

module.exports = router;
