// controllers/basicController.js
// This controller handles the logic for the basic user information.

const Resume = require('../models/resumes');

exports.getBasic = async (req, res) => {
    try {
        // Get the email from the query parameters, not the request body
        const { email } = req.query; 

        if (!email) {
            return res.status(400).json({ message: 'Email is required as a query parameter.' });
        }

        const resume = await Resume.findOne({ userEmail: email, isDownloaded: false });
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
        console.log('Basic Controller - Create/Update Basic Request:', req.body);
        const { name, contact_no, email, location, about } = req.body;
        
        console.log('Extracted email:', email, 'Type:', typeof email);
        
        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }
        
        // Sanitize data to ensure no null/undefined values
        const sanitizedData = {
            name: name || '',
            contact_no: contact_no || '',
            email: email || '',
            location: location || '', // Ensure location is a string
            about: about || ''
        };
        
        console.log('Looking for resume with userEmail:', email);
        let resume = await Resume.findOne({ userEmail: email, isDownloaded: false });

        if (!resume) {
            console.log('Creating new resume for email:', email);
            const resumeData = {
                userEmail: email,  // This is the key field
                basic: sanitizedData,
                isDownloaded: false
            };
            console.log('Resume data to create:', JSON.stringify(resumeData, null, 2));
            
            resume = new Resume(resumeData);
        } else {
            console.log('Updating existing resume for email:', email);
            resume.basic = sanitizedData;
        }

        console.log('Resume before save:', JSON.stringify(resume.toObject(), null, 2));
        await resume.save();
        console.log('Resume saved successfully:', resume._id);

        res.status(200).json({
            message: 'Basic data saved successfully',
            data: resume.basic,
        });
    } catch (error) {
        console.error('Error in createBasic:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.deleteBasic = async (req, res) => {
    try {
        // Get the email from the query parameters
        const { email } = req.query;

        if (!email) {
            return res.status(400).json({ message: 'Email is required as a query parameter.' });
        }

        // Find and delete the temporary resume document
        const result = await Resume.findOneAndDelete({ userEmail: email, isDownloaded: false });

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
        // Get the email from the query parameters
        const { email } = req.query;

        if (!email) {
            return res.status(400).json({ message: 'Email is required as a query parameter.' });
        }

        // Find the resume and clear just the basic section
        const result = await Resume.findOneAndUpdate(
            { userEmail: email, isDownloaded: false },
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
        console.log('Basic Controller - Update Basic Request:', req.body);
        const { email, basicInfo } = req.body;

        if (!email || !basicInfo) {
            console.log('Missing email or basicInfo:', { email, basicInfo });
            return res.status(400).json({ message: 'Email and Basic Information are required' });
        }

        // Log every field to check what might be causing the crash
        console.log('Basic Info Fields:', {
            name: basicInfo.name,
            email: basicInfo.email,
            contact_no: basicInfo.contact_no,
            location: basicInfo.location,
            about: basicInfo.about
        });

        // Sanitize the data to prevent null/undefined values
        const sanitizedBasicInfo = {
            name: basicInfo.name || '',
            email: basicInfo.email || '',
            contact_no: basicInfo.contact_no || '',
            location: basicInfo.location || '', // Ensure location is a string
            about: basicInfo.about || ''
        };

        console.log('Updating resume with userEmail:', email);
        const updated = await Resume.findOneAndUpdate(
            { userEmail: email, isDownloaded: false },
            { $set: { basic: sanitizedBasicInfo } },
            { new: true, runValidators: true, upsert: true }
        );

        if (!updated) {
            console.log('Resume not found for email:', email);
            return res.status(404).json({ message: 'Resume not found' });
        }

        console.log('Resume updated successfully:', updated.basic);
        res.status(200).json({ message: 'Basic information updated successfully', data: updated.basic });
    } catch (error) {
        console.error('Error updating basic info:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
