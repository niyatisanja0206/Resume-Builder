// backend/controllers/skillController.js
const Resume = require('../models/resumes');
const { incrementResumeCountByEmail } = require('../utils/userUtils');

exports.getSkills = async (req, res) => {
    try {
        const { email } = req.query;

        if (!email) {
            return res.status(400).json({ message: 'Email is required as a query parameter.' });
        }

        const resume = await Resume.findOne({ userEmail: email, status: 'draft' });
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
        const { email, skill } = req.body;

        if (!email || !skill) {
            return res.status(400).json({ message: 'Email and skill data are required.' });
        }

        let resume = await Resume.findOne({ userEmail: email, status: 'draft' });
        
        if (!resume) {
            resume = new Resume({
                userEmail: email,
                skills: [skill],
                status: 'draft'
            });
            
            await incrementResumeCountByEmail(email);
        } else {
            if (!resume.skills) {
                resume.skills = [];
            }
            resume.skills.push(skill);
        }
        
        await resume.save();

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

        const updatedResume = await Resume.findOneAndUpdate(
            { userEmail: email, status: 'draft' },
            { $pull: { skills: { _id: id } } },
            { new: true }
        );

        if (!updatedResume) {
            return res.status(404).json({ message: 'Resume not found' });
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

        const updatedResume = await Resume.findOneAndUpdate(
            { userEmail: email, status: 'draft' },
            { $set: { skills: [] } },
            { new: true }
        );

        if (!updatedResume) {
            return res.status(404).json({ message: 'Resume not found' });
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

        const updatedResume = await Resume.findOneAndUpdate(
            { userEmail: email, status: 'draft', "skills._id": id },
            { $set: { "skills.$": skill } },
            { new: true, runValidators: true }
        );

        if (!updatedResume) {
            return res.status(404).json({ message: 'Resume or skill not found' });
        }

        res.status(200).json({ message: 'Skill updated successfully', data: updatedResume.skills });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
