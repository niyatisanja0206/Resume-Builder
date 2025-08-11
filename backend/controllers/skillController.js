const User = require('../models/resumes'); // Correct: Imported as 'User'

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

exports.addSkill = async (req, res) => {
    try {
        console.log('Skill Controller - Add Skill Request:', req.body);
        const { email, skill } = req.body;

        if (!email || !skill) {
            console.log('Missing email or skill data:', { email, skill });
            return res.status(400).json({ message: 'Email and skill data are required.' });
        }

        console.log('Looking for user with email:', email);
        const updatedUser = await User.findOneAndUpdate( // Correct: Use 'User'
            { "basic.email": email },
            { $push: { skills: skill } },
            { new: true, runValidators: true }
        );

        console.log('MongoDB findOneAndUpdate result:', updatedUser);

        if (!updatedUser) {
            console.log('User not found for email:', email);
            return res.status(404).json({ message: 'User not found' });
        }

        console.log('Skill added successfully, returning skills:', updatedUser.skills);
        res.status(201).json({ message: 'Skill added successfully', data: updatedUser.skills });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.deleteSkill = async (req, res) => {
    try {
        const { email, id } = req.query;

        if (!email || !id) {
            return res.status(400).json({ message: 'Email and skill ID are required.' });
        }

        const updatedUser = await User.findOneAndUpdate( // Correct: Use 'User'
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

exports.deleteAllSkills = async (req, res) => {
    try {
        const { email } = req.query;

        if (!email) {
            return res.status(400).json({ message: 'Email is required as a query parameter.' });
        }

        const updatedUser = await User.findOneAndUpdate(
            { "basic.email": email },
            { $set: { skills: [] } },
            { new: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ message: 'All skills deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.updateSkill = async (req, res) => {
    try {
        const { email, id, skill } = req.body;

        if (!email || !id || !skill) {
            return res.status(400).json({ message: 'Email, skill ID, and skill data are required.' });
        }

        const updatedUser = await User.findOneAndUpdate(
            { "basic.email": email, "skills._id": id },
            { $set: { "skills.$": skill } },
            { new: true, runValidators: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ message: 'User or skill not found' });
        }

        res.status(200).json({ message: 'Skill updated successfully', data: updatedUser.skills });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};