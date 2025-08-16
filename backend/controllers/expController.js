const Resume = require('../models/resumes');
const { incrementResumeCountByEmail } = require('../utils/userUtils');

exports.getExperience = async (req, res) => {
    try {
        const { email } = req.query;

        if (!email) {
            return res.status(400).json({ message: 'Email is required as a query parameter.' });
        }

        const resume = await Resume.findOne({ userEmail: email, isDownloaded: false });
        if (!resume) {
            return res.status(404).json({ message: 'Resume not found' });
        }
        res.status(200).json(resume.experience || []);
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

        let resume = await Resume.findOne({ userEmail: email, isDownloaded: false });
        
        if (!resume) {
            resume = new Resume({
                userEmail: email,
                experience: [experience],
                isDownloaded: false
            });
            
            // await incrementResumeCountByEmail(email);
            await incrementResumeCountByEmail(email);
            console.log('New resume created for:', email);
        } else {
            if (!resume.experience) {
                resume.experience = [];
            }
            resume.experience.push(experience);
        }
        
        await resume.save();
        res.status(201).json({ message: 'Experience added successfully', data: resume.experience });
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

        const resume = await Resume.findOne({ userEmail: email, isDownloaded: false });
        if (!resume) {
            return res.status(404).json({ message: 'Resume not found' });
        }

        resume.experience = resume.experience.filter(exp => exp._id.toString() !== id);
        await resume.save();

        res.status(200).json({ message: 'Experience deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.deleteAllExperience = async (req, res) => {
    try {
        const { email } = req.query;

        if (!email) {
            return res.status(400).json({ message: 'Email is required as a query parameter.' });
        }

        const updated = await Resume.findOneAndUpdate(
            { userEmail: email, isDownloaded: false },
            { $set: { experience: [] } },
            { new: true }
        );

        if (!updated) return res.status(404).json({ message: 'Resume not found' });

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

        const updated = await Resume.findOneAndUpdate(
            { userEmail: email, isDownloaded: false, "experience._id": id },
            { $set: { "experience.$": experience } },
            { new: true, runValidators: true }
        );

        if (!updated) {
            return res.status(404).json({ message: 'Resume or experience not found' });
        }

        res.status(200).json({ message: 'Experience updated successfully', data: updated.experience });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
