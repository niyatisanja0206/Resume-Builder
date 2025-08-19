// backend/controllers/basicController.js
const Resume = require('../models/resumes');
const { incrementResumeCountByEmail } = require('../utils/userUtils');

exports.getBasic = async (req, res) => {
    try {
        const { email } = req.query; 

        if (!email) {
            return res.status(400).json({ message: 'Email is required as a query parameter.' });
        }

        const resume = await Resume.findOne({ userEmail: email, status: 'draft' });
        if (!resume) {
            return res.status(404).json({ message: 'Resume not found' });
        }
        res.status(200).json(resume.basic);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.createBasic = async (req, res) => {
    try {
        const { name, contact_no, email, location, about } = req.body;
        
        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }
        
        const sanitizedData = {
            name: name || '',
            contact_no: contact_no || '',
            email: email || '',
            location: location || '',
            about: about || ''
        };
        
        let resume = await Resume.findOne({ userEmail: email, status: 'draft' });

        if (!resume) {
            const resumeData = {
                userEmail: email,
                basic: sanitizedData,
                status: 'draft'
            };
            
            resume = new Resume(resumeData);
            
            await incrementResumeCountByEmail(email);
        } else {
            resume.basic = sanitizedData;
        }

        await resume.save();

        res.status(200).json({
            message: 'Basic data saved successfully',
            data: resume.basic,
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.deleteBasic = async (req, res) => {
    try {
        const { email } = req.query;

        if (!email) {
            return res.status(400).json({ message: 'Email is required as a query parameter.' });
        }

        const result = await Resume.findOneAndDelete({ userEmail: email, status: 'draft' });

        if (!result) {
            return res.status(404).json({ message: 'Resume not found' });
        }

        res.status(200).json({ message: 'Resume deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.deleteAllBasic = async (req, res) => {
    try {
        const { email } = req.query;

        if (!email) {
            return res.status(400).json({ message: 'Email is required as a query parameter.' });
        }

        const result = await Resume.findOneAndUpdate(
            { userEmail: email, status: 'draft' },
            { $unset: { basic: 1 } },
            { new: true }
        );

        if (!result) {
            return res.status(404).json({ message: 'Resume not found' });
        }

        res.status(200).json({ message: 'Basic information cleared successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.updateBasic = async (req, res) => {
    try {
        const { email, basicInfo } = req.body;

        if (!email || !basicInfo) {
            return res.status(400).json({ message: 'Email and Basic Information are required' });
        }

        const sanitizedBasicInfo = {
            name: basicInfo.name || '',
            email: basicInfo.email || '',
            contact_no: basicInfo.contact_no || '',
            location: basicInfo.location || '',
            about: basicInfo.about || ''
        };

        const updated = await Resume.findOneAndUpdate(
            { userEmail: email, status: 'draft' },
            { $set: { basic: sanitizedBasicInfo } },
            { new: true, runValidators: true, upsert: true }
        );

        if (!updated) {
            return res.status(404).json({ message: 'Resume not found' });
        }

        res.status(200).json({ message: 'Basic information updated successfully', data: updated.basic });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
