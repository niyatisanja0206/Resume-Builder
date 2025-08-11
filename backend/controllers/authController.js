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
        const user = new User({ email, password: hashedPassword, no_of_resumes: 0 });
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
        res.json({ token, user: { id: user._id, email: user.email, no_of_resumes: user.no_of_resumes } });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

// Log Out (client should just delete token, but for demonstration)
exports.logout = (req, res) => {
    res.json({ message: 'Logged out successfully' });
};

// Delete Account
exports.deleteAccount = async (req, res) => {
    try {
        const userId = req.user.userId;
        await User.findByIdAndDelete(userId);
        res.json({ message: 'Account deleted successfully' });
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