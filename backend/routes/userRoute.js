const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');

// All routes require authentication
router.use(auth);

// User profile routes
router.get('/profile', userController.getUserProfile);
router.put('/profile', userController.updateUserProfile);

// Resume management routes
router.get('/resumes', userController.getUserResumes);
router.post('/resumes', userController.createResume);
router.get('/resumes/:resumeId', userController.getResumeById);
router.put('/resumes/:resumeId', userController.updateResume);
router.delete('/resumes/:resumeId', userController.deleteResume);

module.exports = router;
