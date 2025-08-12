const express = require('express');
const router = express.Router();
const resumeController = require('../controllers/resumeController');
const auth = require('../middleware/auth');

// Create new resume (requires authentication)
router.post('/new', auth, resumeController.createNewResume);

// Save resume data
router.post('/save', resumeController.saveResumeData);

// Get current resume data for preview
router.get('/data/:userEmail', resumeController.getCurrentResumeData);

// Download resume (requires authentication)
router.post('/download', auth, resumeController.downloadResume);

// Delete draft resume (requires authentication)
router.delete('/draft', auth, resumeController.deleteDraftResume);

// Get all user's resumes (requires authentication)
router.get('/all', auth, resumeController.getAllUserResumes);

// Get user's completed resumes (requires authentication)
router.get('/user-resumes', auth, resumeController.getUserResumes);

// Clear current draft resumes (requires authentication)
router.delete('/clear-draft', auth, resumeController.clearCurrentDraft);

module.exports = router;
