const express = require('express');
const router = express.Router();
const resumeController = require('../controllers/resumeController');
const auth = require('../middleware/auth');

// Get all resumes for a user
router.get('/all', auth, resumeController.getAllResumes);

// Get a single resume by ID
router.get('/:id', auth, resumeController.getResumeById);

// Create a new resume
router.post('/create', auth, resumeController.createResume);

// Update a resume by ID
router.put('/:id', auth, resumeController.updateResume);

// Delete a resume by ID
router.delete('/:id', auth, resumeController.deleteResume);

module.exports = router;
