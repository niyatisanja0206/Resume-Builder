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
                experience: [skill],
                isDownloaded: false
            });
            
            // Increment resume count for the user since this is a new resume
            await incrementResumeCountByEmail(email);
        } else {
            // Add the new skill entry to the array
            if (!resume.experience) {
                resume.experience = [];
            }
            resume.experience.push(skill);
        }
        
        await resume.save();

        console.log('Skill added successfully, returning experience:', resume.experience);
        res.status(201).json({ message: 'Skill added successfully', data: resume.experience });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.deleteExperience = async (req, res) => {
    try {
        const { email, id } = req.query;

        if (!email || !id) {
            return res.status(400).json({ message: 'Email and skill ID are required.' });
        }

        const updatedResume = await Resume.findOneAndUpdate(
            { userEmail: email, isDownloaded: false },
            { $pull: { experience: { _id: id } } },
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

exports.deleteAllexperience = async (req, res) => {
    try {
        const { email } = req.query;

        if (!email) {
            return res.status(400).json({ message: 'Email is required as a query parameter.' });
        }

        const updatedResume = await Resume.findOneAndUpdate(
            { userEmail: email, isDownloaded: false },
            { $set: { experience: [] } },
            { new: true }
        );

        if (!updatedResume) {
            return res.status(404).json({ message: 'Resume not found' });
        }

        res.status(200).json({ message: 'All experience deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.updateExperience = async (req, res) => {
    try {
        const { email, id, skill } = req.body;

        if (!email || !id || !skill) {
            return res.status(400).json({ message: 'Email, skill ID, and skill data are required.' });
        }

        const updatedResume = await Resume.findOneAndUpdate(
            { userEmail: email, isDownloaded: false, "experience._id": id },
            { $set: { "experience.$": skill } },
            { new: true, runValidators: true }
        );

        if (!updatedResume) {
            return res.status(404).json({ message: 'Resume or skill not found' });
        }

        res.status(200).json({ message: 'Skill updated successfully', data: updatedResume.experience });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
