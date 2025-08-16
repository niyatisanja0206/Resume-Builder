const Resume = require('../models/resumes');
const { incrementResumeCountByEmail } = require('../utils/userUtils');

// Get all resumes for the logged-in user
exports.getAllResumes = async (req, res) => {
    try {
        // req.user is now correctly populated by the auth middleware
        const resumes = await Resume.find({ userEmail: req.user.email });
        res.status(200).json(resumes);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get a single resume by ID
exports.getResumeById = async (req, res) => {
    try {
        const resume = await Resume.findOne({ _id: req.params.id, userEmail: req.user.email });
        if (!resume) {
            return res.status(404).json({ message: 'Resume not found' });
        }
        res.status(200).json(resume);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Create a new resume for the logged-in user
exports.createResume = async (req, res) => {
    try {
        if (!req.user || !req.user.email) {
            return res.status(401).json({ message: 'Authentication error: User email not found.' });
        }

        const newResume = new Resume({
            userEmail: req.user.email,
        });

        const savedResume = await newResume.save();
        
        // Increment resume count for the user since this is a new resume
        await incrementResumeCountByEmail(req.user.email);
        
        res.status(201).json({ message: 'New resume created successfully', resume: savedResume });
    } catch (error) {
        res.status(500).json({ message: 'Server error while creating resume', error: error.message });
    }
};

// Update a resume by ID
exports.updateResume = async (req, res) => {
    try {
        const updatedResume = await Resume.findOneAndUpdate(
            { _id: req.params.id, userEmail: req.user.email },
            req.body,
            { new: true, runValidators: true }
        );

        if (!updatedResume) {
            return res.status(404).json({ message: 'Resume not found or user not authorized' });
        }

        res.status(200).json({ message: 'Resume updated successfully', resume: updatedResume });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Delete a resume by ID
exports.deleteResume = async (req, res) => {
    try {
        const deletedResume = await Resume.findOneAndDelete({ _id: req.params.id, userEmail: req.user.email });

        if (!deletedResume) {
            return res.status(404).json({ message: 'Resume not found or user not authorized' });
        }

        res.status(200).json({ message: 'Resume deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
