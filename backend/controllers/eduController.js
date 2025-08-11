// controllers/eduController.js
const User = require('../models/resumes');

// @desc    Get education data for a specific user
// @route   GET /api/edu?email=...
// @access  Public
exports.getEducation = async (req, res) => {
    try {
        const { email } = req.query;

        if (!email) {
            return res.status(400).json({ message: 'Email is required as a query parameter.' });
        }

        const user = await User.findOne({ "basic.email": email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json(user.education);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Add or update education data for a specific user
// @route   POST /api/edu
// @access  Public
exports.addEducation = async (req, res) => {
    try {
        const { email, education } = req.body;

        if (!email || !education) {
            return res.status(400).json({ message: 'Email and education data are required.' });
        }

        const user = await User.findOne({ "basic.email": email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Add the new education entry to the array
        user.education.push(education);
        await user.save();

        res.status(201).json({
            message: 'Education added successfully',
            data: user.education,
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Delete a specific education entry from a user's profile
// @route   DELETE /api/edu?email=...&id=...
// @access  Public
exports.deleteEducation = async (req, res) => {
    try {
        const { email, id } = req.query;

        if (!email || !id) {
            return res.status(400).json({ message: 'Email and education ID are required as query parameters.' });
        }

        const user = await User.findOne({ "basic.email": email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Use $pull to remove the item from the education array
        user.education.pull({ _id: id });
        await user.save();

        res.status(200).json({ message: 'Education entry deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.deleteAllEducation = async (req, res) => {
    try {
        const { email } = req.query;

        if (!email) {
            return res.status(400).json({ message: 'Email is required as a query parameter.' });
        }

        const updated = await User.findOneAndUpdate(
            { "basic.email": email },
            { $set: { education: [] } },
            { new: true }
        );

        if (!updated) return res.status(404).json({ message: 'User not found' });

        res.status(200).json({ message: 'All education entries deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.updateEducation = async (req, res) => {
    try {
        const { email, id, education } = req.body;

        if (!email || !id || !education) {
            return res.status(400).json({ message: 'Email, Education ID, and Education data are required' });
        }

        const updated = await User.findOneAndUpdate(
            { "basic.email": email, "education._id": id },
            { $set: { "education.$": education } },
            { new: true, runValidators: true }
        );

        if (!updated) return res.status(404).json({ message: 'User or Education not found' });

        res.status(200).json({ message: 'Education updated successfully', data: updated.education });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
