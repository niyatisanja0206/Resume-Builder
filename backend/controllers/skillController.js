const Resume = require('../models/resumes');

exports.getSkills = async (req, res) => {
    try {
        const { email } = req.query;

        if (!email) {
            return res.status(400).json({ message: 'Email is required as a query parameter.' });
        }

        const resume = await Resume.findOne({ userEmail: email, isDownloaded: false });
        if (!resume) {
            return res.status(404).json({ message: 'Resume not found' });
        }
        res.status(200).json(resume.skills || []);
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

        console.log('Looking for resume with userEmail:', email);
        let resume = await Resume.findOne({ userEmail: email, isDownloaded: false });
        
        if (!resume) {
            // Create new resume if it doesn't exist
            resume = new Resume({
                userEmail: email,
                skills: [skill],
                isDownloaded: false
            });
        } else {
            // Add the new skill entry to the array
            if (!resume.skills) {
                resume.skills = [];
            }
            resume.skills.push(skill);
        }
        
        await resume.save();

        console.log('Skill added successfully, returning skills:', resume.skills);
        res.status(201).json({ message: 'Skill added successfully', data: resume.skills });
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