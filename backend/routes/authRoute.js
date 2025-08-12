const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');

// Sign Up
router.post('/signup', authController.signup);

// Log In
router.post('/login', authController.login);

// Log Out
router.post('/logout', authController.logout);

// Delete Account
router.delete('/delete', auth, authController.deleteAccount);

// Reset Password
router.post('/reset-password', authController.resetPassword);

module.exports = router;