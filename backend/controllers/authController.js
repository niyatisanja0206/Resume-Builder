const User = require('../models/users'); 
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Sign Up
exports.signup = async (req, res) => {
    try {
        const { email, password } = req.body;
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: 'User already exists' });

        const hashedPassword = await bcrypt.hash(password, 12);
        const user = new User({ 
            email, 
            password: hashedPassword, 
            no_of_resumes: 0,
            resume_downloaded: 0 
        });
        await user.save();

        res.status(201).json({ message: 'User created successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

// Log In
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: 'Invalid credentials' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

        const token = jwt.sign({ userId: user._id }, 'your_jwt_secret', { expiresIn: '1h' });
        res.json({ 
            token, 
            user: { 
                id: user._id, 
                email: user.email, 
                no_of_resumes: user.no_of_resumes,
                resume_downloaded: user.resume_downloaded 
            } 
        });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

// Log Out (client should just delete token, but for demonstration)
exports.logout = async (req, res) => {
    try {
        // If user is authenticated, clean up temporary resume data
        if (req.user && req.user.userId) {
            const user = await User.findById(req.user.userId);
            if (user) {
                const Resume = require('../models/resumes');
                await Resume.deleteMany({ userEmail: user.email, isDownloaded: false });
            }
        }
        res.json({ message: 'Logged out successfully' });
    } catch (err) {
        console.error('Logout error:', err);
        res.json({ message: 'Logged out successfully' }); // Still return success even if cleanup fails
    }
};

// Delete Account
exports.deleteAccount = async (req, res) => {
    try {
        const userId = req.user.userId;
        const user = await User.findById(userId);
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        // Delete all resumes associated with this user
        const Resume = require('../models/resumes');
        await Resume.deleteMany({ userEmail: user.email });
        
        // Delete the user
        await User.findByIdAndDelete(userId);
        
        res.json({ message: 'Account deleted successfully' });
    } catch (err) {
        console.error('Delete account error:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Check if user exists
exports.checkUser = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        res.json({ exists: !!user });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

// Reset Password
exports.resetPassword = async (req, res) => {
    try {
        const { email, newPassword } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: 'User not found' });

        const hashedPassword = await bcrypt.hash(newPassword, 12);
        user.password = hashedPassword;
        await user.save();

        res.json({ message: 'Password reset successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

// Increment resume created counter
exports.incrementResumeCount = async (req, res) => {
    try {
        const userId = req.user.userId;
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        user.no_of_resumes += 1;
        await user.save();

        res.json({ 
            message: 'Resume count updated successfully', 
            no_of_resumes: user.no_of_resumes 
        });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

// Increment resume downloaded counter
exports.incrementDownloadCount = async (req, res) => {
    try {
        const userId = req.user.userId;
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        user.resume_downloaded += 1;
        await user.save();

        res.json({ 
            message: 'Download count updated successfully', 
            resume_downloaded: user.resume_downloaded 
        });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

// Get user stats
exports.getUserStats = async (req, res) => {
    try {
        const userId = req.user.userId;
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        res.json({ 
            no_of_resumes: user.no_of_resumes,
            resume_downloaded: user.resume_downloaded 
        });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};