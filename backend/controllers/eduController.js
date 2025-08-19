// backend/controllers/eduController.js
const Resume = require('../models/resumes');
const { incrementResumeCountByEmail } = require('../utils/userUtils');

exports.getEducation = async (req, res) => {
    try {
        const { email } = req.query;

        if (!email) {
            return res.status(400).json({ message: 'Email is required as a query parameter.' });
        }

        const resume = await Resume.findOne({ userEmail: email, status: 'draft' });
        if (!resume) {
            return res.status(404).json({ message: 'Resume not found' });
        }
        res.status(200).json(resume.education || []);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.addEducation = async (req, res) => {
    try {
        const { email, education } = req.body;

        if (!email || !education) {
            return res.status(400).json({ message: 'Email and education data are required.' });
        }

        let resume = await Resume.findOne({ userEmail: email, status: 'draft' });
        
        if (!resume) {
            resume = new Resume({
                userEmail: email,
                education: [education],
                status: 'draft'
            });
            
            await incrementResumeCountByEmail(email);
        } else {
            if (!resume.education) {
                resume.education = [];
            }
            resume.education.push(education);
        }
        
        await resume.save();

        res.status(201).json({
            message: 'Education added successfully',
            data: resume.education,
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.deleteEducation = async (req, res) => {
    try {
        const { email, id } = req.query;

        if (!email || !id) {
            return res.status(400).json({ message: 'Email and education ID are required as query parameters.' });
        }

        const resume = await Resume.findOne({ userEmail: email, status: 'draft' });
        if (!resume) {
            return res.status(404).json({ message: 'Resume not found' });
        }

        resume.education.pull({ _id: id });
        await resume.save();

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

        const updated = await Resume.findOneAndUpdate(
            { userEmail: email, status: 'draft' },
            { $set: { education: [] } },
            { new: true }
        );

        if (!updated) return res.status(404).json({ message: 'Resume not found' });

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

        const updated = await Resume.findOneAndUpdate(
            { userEmail: email, status: 'draft', "education._id": id },
            { $set: { "education.$": education } },
            { new: true, runValidators: true }
        );

        if (!updated) return res.status(404).json({ message: 'Resume or Education not found' });

        res.status(200).json({ message: 'Education updated successfully', data: updated.education });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
