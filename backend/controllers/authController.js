const User = require('../models/users');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { incrementResumeCountByEmail } = require('../utils/userUtils');

// Sign Up a new user
exports.signup = async (req, res) => {
    const { email, password } = req.body;

    try {
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: 'User already exists' });
        }

        user = new User({
            email,
            password,
        });

        await user.save();

        // ** FIX: Add email to the JWT payload **
        const payload = {
            user: {
                id: user.id,
                email: user.email // Include the email here
            },
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '5h' },
            (err, token) => {
                if (err) throw err;
                res.status(201).json({ 
                    token,
                    user: {
                        id: user.id,
                        email: user.email,
                        no_of_resumes: user.no_of_resumes || 0,
                        resume_downloaded: user.resume_downloaded || 0
                    }
                });
            }
        );
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Log In an existing user
exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // ** FIX: Add email to the JWT payload **
        const payload = {
            user: {
                id: user.id,
                email: user.email // Include the email here
            },
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '5h' },
            (err, token) => {
                if (err) throw err;
                res.json({ 
                    token,
                    user: {
                        id: user.id,
                        email: user.email,
                        no_of_resumes: user.no_of_resumes || 0,
                        resume_downloaded: user.resume_downloaded || 0
                    }
                });
            }
        );
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Log Out a user (client-side implementation)
exports.logout = (req, res) => {
    // Typically, logout is handled on the client by deleting the token.
    res.status(200).json({ message: 'Logout successful' });
};

// Delete a user account
exports.deleteAccount = async (req, res) => {
    try {
        // The user's ID is available from the auth middleware
        await User.findByIdAndDelete(req.user.id);
        res.status(200).json({ message: 'User account deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Check if a user exists
exports.checkUser = async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        if (user) {
            return res.status(200).json({ exists: true });
        }
        res.status(200).json({ exists: false });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Reset user password
exports.resetPassword = async (req, res) => {
    const { email, newPassword } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        user.password = newPassword; // The pre-save hook will hash it
        await user.save();
        res.status(200).json({ message: 'Password reset successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Increment resume created counter
exports.incrementResumeCount = async (req, res) => {
    try {
        await User.findByIdAndUpdate(req.user.id, { $inc: { no_of_resumes: 1 } });
        res.status(200).send('Resume count incremented');
    } catch (error) {
        res.status(500).send('Server error');
    }
};

// Increment resume downloaded counter
exports.incrementDownloadCount = async (req, res) => {
    try {
        await User.findByIdAndUpdate(req.user.id, { $inc: { resume_downloaded: 1 } });
        res.status(200).send('Download count incremented');
    } catch (error) {
        res.status(500).send('Server error');
    }
};

// Get user stats
exports.getUserStats = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('no_of_resumes resume_downloaded');
        if (!user) {
            return res.status(404).send('User not found');
        }
        res.json({
            no_of_resumes: user.no_of_resumes || 0,
            resume_downloaded: user.resume_downloaded || 0
        });
    } catch (error) {
        res.status(500).send('Server error');
    }
};
