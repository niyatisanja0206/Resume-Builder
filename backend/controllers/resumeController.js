const Resume = require('../models/resumes');
const User = require('../models/users');

// Save/Update resume data (temporary - not downloaded yet)
exports.saveResumeData = async (req, res) => {
    try {
        const { userEmail, basic, skills, education, experience, projects } = req.body;
        
        // Find existing resume for this user or create new one
        let resume = await Resume.findOne({ userEmail, isDownloaded: false });
        
        if (resume) {
            // Update existing resume
            resume.basic = basic || resume.basic;
            resume.skills = skills || resume.skills;
            resume.education = education || resume.education;
            resume.experience = experience || resume.experience;
            resume.projects = projects || resume.projects;
        } else {
            // Create new resume
            resume = new Resume({
                userEmail,
                basic,
                skills,
                education,
                experience,
                projects,
                isDownloaded: false
            });
        }
        
        await resume.save();
        res.json({ message: 'Resume data saved successfully', resumeId: resume._id });
    } catch (err) {
        console.error('Save resume error:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get resume data for preview
exports.getResumeData = async (req, res) => {
    try {
        const { userEmail } = req.params;
        const resume = await Resume.findOne({ userEmail, isDownloaded: false });
        
        if (!resume) {
            return res.status(404).json({ message: 'No resume data found' });
        }
        
        res.json(resume);
    } catch (err) {
        console.error('Get resume error:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Download resume (mark as downloaded and update user count)
exports.downloadResume = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { resumeId } = req.body;
        
        // Get user info
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        // Find and update resume
        const resume = await Resume.findById(resumeId);
        if (!resume) {
            return res.status(404).json({ message: 'Resume not found' });
        }
        
        if (resume.userEmail !== user.email) {
            return res.status(403).json({ message: 'Unauthorized' });
        }
        
        // Mark resume as downloaded
        resume.isDownloaded = true;
        await resume.save();
        
        // Update user's resume count and download count
        user.no_of_resumes += 1;
        user.resume_downloaded += 1;
        await user.save();
        
        res.json({ 
            message: 'Resume downloaded successfully', 
            resumeCount: user.no_of_resumes,
            downloadCount: user.resume_downloaded
        });
    } catch (err) {
        console.error('Download resume error:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Delete temporary resume data (when user logs out without downloading)
exports.deleteTemporaryResume = async (req, res) => {
    try {
        const { userEmail } = req.body;
        
        // Delete all non-downloaded resumes for this user
        await Resume.deleteMany({ userEmail, isDownloaded: false });
        
        res.json({ message: 'Temporary resume data deleted successfully' });
    } catch (err) {
        console.error('Delete temporary resume error:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get user's downloaded resumes
exports.getUserResumes = async (req, res) => {
    try {
        const userId = req.user.userId;
        const user = await User.findById(userId);
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        const resumes = await Resume.find({ 
            userEmail: user.email, 
            isDownloaded: true 
        }).sort({ createdAt: -1 });
        
        res.json(resumes);
    } catch (err) {
        console.error('Get user resumes error:', err);
        res.status(500).json({ message: 'Server error' });
    }
};
