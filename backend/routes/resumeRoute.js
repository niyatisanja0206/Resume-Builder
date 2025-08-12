const express = require('express');
const router = express.Router();
const resumeController = require('../controllers/resumeController');
const auth = require('../middleware/auth');

// Save resume data (temporary)
router.post('/save', resumeController.saveResumeData);

// Get resume data for preview
router.get('/data/:userEmail', resumeController.getResumeData);

// Download resume (requires authentication)
router.post('/download', auth, resumeController.downloadResume);

// Delete temporary resume data
router.delete('/temporary', resumeController.deleteTemporaryResume);

// Get user's downloaded resumes (requires authentication)
router.get('/user-resumes', auth, resumeController.getUserResumes);

module.exports = router;
