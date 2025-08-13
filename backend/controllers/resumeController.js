const Resume = require('../models/resumes');
const User = require('../models/users');

// Create a new resume for user
exports.createNewResume = async (req, res) => {
    try {
        const userId = req.user.userId;
        const user = await User.findById(userId);
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // First, clear any existing draft resumes
        await Resume.deleteMany({ 
            userEmail: user.email, 
            status: 'draft' 
        });

        // Get count of existing resumes for title
        const existingCount = await Resume.countDocuments({ userEmail: user.email });
        
        // Create new resume
        const newResume = new Resume({
            userEmail: user.email,
            title: `Resume ${existingCount + 1}`,
            status: 'draft',
            isDownloaded: false,
            basic: {
                name: '',
                email: user.email,
                contact_no: '',
                location: '',
                about: ''
            },
            skills: [],
            education: [],
            experience: [],
            projects: []
        });
        
        await newResume.save();
        
        res.json({ 
            message: 'New resume created successfully', 
            resumeId: newResume._id,
            resume: newResume 
        });
    } catch (err) {
        console.error('Create new resume error:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// Save/Update specific resume data
exports.saveResumeData = async (req, res) => {
    try {
        const { resumeId, basic, skills, education, experience, projects } = req.body;
        const userEmail = req.user ? req.user.email : req.body.userEmail;
        
        let resume;
        
        if (resumeId) {
            // Update specific resume
            resume = await Resume.findById(resumeId);
            if (!resume) {
                return res.status(404).json({ message: 'Resume not found' });
            }
            if (resume.userEmail !== userEmail) {
                return res.status(403).json({ message: 'Unauthorized' });
            }
        } else {
            // Find current draft resume or create new one
            resume = await Resume.findOne({ userEmail, status: 'draft' });
            
            if (!resume) {
                // Create new resume if none exists
                const existingCount = await Resume.countDocuments({ userEmail });
                resume = new Resume({
                    userEmail,
                    title: `Resume ${existingCount + 1}`,
                    status: 'draft'
                });
            }
        }
        
        // Update resume data
        if (basic) resume.basic = { ...resume.basic, ...basic };
        if (skills) resume.skills = skills;
        if (education) resume.education = education;
        if (experience) resume.experience = experience;
        if (projects) resume.projects = projects;
        
        await resume.save();
        res.json({ message: 'Resume data saved successfully', resumeId: resume._id });
    } catch (err) {
        console.error('Save resume error:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get current draft resume data
exports.getCurrentResumeData = async (req, res) => {
    try {
        const { userEmail } = req.params;
        const { resumeId } = req.query;
        
        let resume;
        
        if (resumeId) {
            resume = await Resume.findById(resumeId);
        } else {
            // Get the most recent draft resume
            resume = await Resume.findOne({ userEmail, status: 'draft' }).sort({ updatedAt: -1 });
        }
        
        if (!resume) {
            return res.status(404).json({ message: 'No resume data found' });
        }
        
        res.json(resume);
    } catch (err) {
        console.error('Get resume error:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Download resume (mark as completed and update counts)
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
        
        // Increment download count for this specific resume
        resume.downloadCount += 1;
        
        // Mark resume as completed if it's still a draft
        if (resume.status === 'draft') {
            resume.status = 'completed';
            // Update user's resume count only for new completed resumes
            user.no_of_resumes += 1;
        }
        
        await resume.save();
        
        // Update user's total download count (cumulative across all resumes)
        user.resume_downloaded += 1;
        await user.save();
        
        res.json({ 
            message: 'Resume downloaded successfully', 
            resumeCount: user.no_of_resumes,
            downloadCount: user.resume_downloaded,
            resumeDownloadCount: resume.downloadCount
        });
    } catch (err) {
        console.error('Download resume error:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Delete draft resume data
exports.deleteDraftResume = async (req, res) => {
    try {
        const { resumeId } = req.body;
        const userId = req.user.userId;
        const user = await User.findById(userId);
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        // Delete specific draft resume
        const result = await Resume.deleteOne({ 
            _id: resumeId, 
            userEmail: user.email, 
            status: 'draft' 
        });
        
        if (result.deletedCount === 0) {
            return res.status(404).json({ message: 'Draft resume not found' });
        }
        
        res.json({ message: 'Draft resume deleted successfully' });
    } catch (err) {
        console.error('Delete draft resume error:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get all user's resumes (both draft and completed)
exports.getAllUserResumes = async (req, res) => {
    try {
        const userId = req.user.userId;
        const user = await User.findById(userId);
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        const resumes = await Resume.find({ 
            userEmail: user.email 
        }).sort({ updatedAt: -1 });
        
        res.json(resumes);
    } catch (err) {
        console.error('Get all user resumes error:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get user's completed resumes only
exports.getUserResumes = async (req, res) => {
    try {
        const userId = req.user.userId;
        const user = await User.findById(userId);
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        const resumes = await Resume.find({ 
            userEmail: user.email, 
            status: 'completed' 
        }).sort({ createdAt: -1 });
        
        res.json(resumes);
    } catch (err) {
        console.error('Get user resumes error:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Clear current draft resume (for "New Resume" functionality)
exports.clearCurrentDraft = async (req, res) => {
    try {
        const userId = req.user.userId;
        const user = await User.findById(userId);
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        // Delete all draft resumes for this user
        const result = await Resume.deleteMany({ 
            userEmail: user.email, 
            status: 'draft' 
        });
        
        // Create a blank draft resume if none exists after clearing
        const existingResumes = await Resume.find({
            userEmail: user.email,
            status: 'draft'
        });
        
        if (existingResumes.length === 0) {
            // Create new empty resume
            const newResume = new Resume({
                userEmail: user.email,
                title: `Draft Resume`,
                status: 'draft',
                basic: {
                    name: '',
                    email: user.email,
                    contact_no: '',
                    location: '',
                    about: ''
                },
                skills: [],
                education: [],
                experience: [],
                projects: []
            });
            
            await newResume.save();
        }
        
        res.json({ 
            message: 'Draft resumes cleared successfully', 
            deletedCount: result.deletedCount
        });
    } catch (err) {
        console.error('Clear draft resume error:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};
