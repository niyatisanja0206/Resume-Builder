const User = require('../models/resumes');

exports.getExperience = async (req, res) => {
    try {
        const { email } = req.query;

        if (!email) {
            return res.status(400).json({ message: 'Email is required as a query parameter.' });
        }

        const user = await User.findOne({ "basic.email": email }); // ✅ fixed here
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json(user.experience);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.addExperience = async (req, res) => {
    try {
        const { email, experience } = req.body;

        if (!email || !experience) {
            return res.status(400).json({ message: 'Email and experience data are required' });
        }

        const user = await User.findOne({ "basic.email": email }); // ✅ now finding the user
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.experience.push(experience);
        await user.save();

        res.status(201).json({ message: 'Experience added successfully', data: user.experience });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.deleteExperience = async (req, res) => {
    try {
        const { email, id } = req.query;

        if (!email || !id) {
            return res.status(400).json({ message: 'Email and experience ID are required' });
        }

        const user = await User.findOne({ "basic.email": email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.experience.pull({ _id: id });
        await user.save();

        res.status(200).json({ message: 'Experience entry deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.deleteAllExperiences = async (req, res) => {
    try {
        const { email } = req.query;

        if (!email) {
            return res.status(400).json({ message: 'Email is required as a query parameter.' });
        }

        const updated = await User.findOneAndUpdate(
            { "basic.email": email },
            { $set: { experience: [] } },
            { new: true }
        );

        if (!updated) return res.status(404).json({ message: 'User not found' });

        res.status(200).json({ message: 'All experience entries deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.updateExperience = async (req, res) => {
    try {
        const { email, id, experience } = req.body;

        if (!email || !id || !experience) {
            return res.status(400).json({ message: 'Email, Experience ID, and Experience data are required' });
        }

        const updated = await User.findOneAndUpdate(
            { "basic.email": email, "experience._id": id },
            { $set: { "experience.$": experience } },
            { new: true, runValidators: true }
        );

        if (!updated) return res.status(404).json({ message: 'User or Experience not found' });

        res.status(200).json({ message: 'Experience updated successfully', data: updated.experience });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
