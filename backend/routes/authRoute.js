const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');

// Sign Up
router.post('/signup', authController.signup);

// Log In
router.post('/login', authController.login);

// Log Out
router.post('/logout', auth, authController.logout);

// Delete Account
router.delete('/delete', auth, authController.deleteAccount);

// Check if user exists
router.post('/check-user', authController.checkUser);

// Reset Password
router.post('/reset-password', authController.resetPassword);

// Increment resume created counter
router.post('/increment-resume-count', auth, authController.incrementResumeCount);

// Increment resume downloaded counter
router.post('/increment-download-count', auth, authController.incrementDownloadCount);

// Get user stats
router.get('/user-stats', auth, authController.getUserStats);

module.exports = router;