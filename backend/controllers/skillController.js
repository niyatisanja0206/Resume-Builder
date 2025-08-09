const User = require('../models/users');

// @desc    Get all skills for a specific user
// @route   GET /api/skill?email=...
// @access  Public
exports.getSkills = async (req, res) => {
    try {
        const { email } = req.query;

        if (!email) {
            return res.status(400).json({ message: 'Email is required as a query parameter.' });
        }

        const user = await User.findOne({ "basic.email": email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json(user.skills);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Add a new skill for a user
// @route   POST /api/skill
// @access  Public
exports.addSkill = async (req, res) => {
    try {
        const { email, skill } = req.body;

        if (!email || !skill) {
            return res.status(400).json({ message: 'Email and skill data are required.' });
        }

        const updatedUser = await User.findOneAndUpdate(
            { "basic.email": email },
            { $push: { skills: skill } },
            { new: true, runValidators: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(201).json({ message: 'Skill added successfully', data: updatedUser.skills });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Delete a specific skill for a user
// @route   DELETE /api/skill?email=...&id=...
// @access  Public
exports.deleteSkill = async (req, res) => {
    try {
        const { email, id } = req.query;

        if (!email || !id) {
            return res.status(400).json({ message: 'Email and skill ID are required.' });
        }

        const updatedUser = await User.findOneAndUpdate(
            { "basic.email": email },
            { $pull: { skills: { _id: id } } },
            { new: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ message: 'Skill deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
