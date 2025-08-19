// backend/controllers/userController.js
const User = require('../models/users');
const Resume = require('../models/resumes');

// Get user profile information
exports.getUserProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId).select('-password');
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Update user profile
exports.updateUserProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const { name, contact_no, location, about } = req.body;
        
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { 
                name,
                contact_no,
                location,
                about,
                updatedAt: new Date()
            },
            { new: true, runValidators: true }
        ).select('-password');

        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({
            message: 'Profile updated successfully',
            user: updatedUser
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get all resumes for a user
exports.getUserResumes = async (req, res) => {
    try {
        const { email } = req.query;
        
        if (!email) {
            return res.status(400).json({ message: 'Email is required as a query parameter.' });
        }

        // Verify the user is accessing their own resumes
        if (req.user.email !== email) {
            return res.status(403).json({ message: 'Access denied. You can only view your own resumes.' });
        }

        const resumes = await Resume.find({ userEmail: email })
            .sort({ updatedAt: -1 }) // Sort by most recently updated
            .select('_id userEmail title status isDownloaded downloadCount createdAt updatedAt basic template'); // FIX: Added 'template' to the selection

        res.status(200).json(resumes);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Delete a specific resume
exports.deleteResume = async (req, res) => {
    try {
        const { resumeId } = req.params;
        const userEmail = req.user.email;

        // Find the resume and check ownership
        const resume = await Resume.findById(resumeId);
        
        if (!resume) {
            return res.status(404).json({ message: 'Resume not found' });
        }

        if (resume.userEmail !== userEmail) {
            return res.status(403).json({ message: 'Access denied. You can only delete your own resumes.' });
        }

        await Resume.findByIdAndDelete(resumeId);

        res.status(200).json({ message: 'Resume deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Create a new blank resume
exports.createResume = async (req, res) => {
    try {
        const { 
            userEmail, 
            title, 
            status = 'draft',
            basic,
            skills,
            education,
            experience,
            projects,
            template
        } = req.body;
        
        // Verify the user is creating a resume for themselves
        if (req.user.email !== userEmail) {
            return res.status(403).json({ message: 'Access denied. You can only create resumes for yourself.' });
        }

        // If status is 'completed', validate that all required fields are present
        if (status === 'completed') {
            const validationErrors = validateResumeCompleteness({
                basic,
                skills,
                education,
                experience,
                projects
            });
            
            if (validationErrors.length > 0) {
                return res.status(400).json({ 
                    message: 'Resume is incomplete', 
                    errors: validationErrors 
                });
            }
        }

        // Use provided title or generate a default one
        let resumeTitle = title;
        if (!resumeTitle) {
            // Count existing resumes to generate a unique title
            const existingResumes = await Resume.countDocuments({ userEmail });
            resumeTitle = `Resume ${existingResumes + 1}`;
        }

        const newResume = new Resume({
            userEmail,
            title: resumeTitle,
            status,
            basic: basic || {
                name: '',
                email: userEmail,
                contact_no: '',
                location: '',
                about: ''
            },
            skills: skills || [],
            education: education || [],
            experience: experience || [],
            projects: projects || [],
            template: template || 'classic'
        });

        const savedResume = await newResume.save();

        res.status(201).json({
            message: 'Resume created successfully',
            resume: savedResume
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Validation function for resume completeness
const validateResumeCompleteness = (data) => {
    const errors = [];

    // Validate basic information
    if (!data.basic) {
        errors.push('Basic information is missing');
    } else {
        if (!data.basic.name?.trim()) errors.push('Name is required');
        if (!data.basic.contact_no?.trim()) errors.push('Contact number is required');
        if (!data.basic.email?.trim()) errors.push('Email is required');
        if (!data.basic.location?.trim()) errors.push('Location is required');
        if (!data.basic.about?.trim()) errors.push('About section is required');
    }

    // Validate education
    if (!data.education || data.education.length === 0) {
        errors.push('At least one education entry is required');
    } else {
        data.education.forEach((edu, index) => {
            if (!edu.institution?.trim()) errors.push(`Education ${index + 1}: Institution name is required`);
            if (!edu.degree?.trim()) errors.push(`Education ${index + 1}: Degree is required`);
            if (!edu.startDate) errors.push(`Education ${index + 1}: Start date is required`);
            if (!edu.Grade?.trim()) errors.push(`Education ${index + 1}: Grade/GPA is required`);
        });
    }

    // Validate experience
    if (!data.experience || data.experience.length === 0) {
        errors.push('At least one experience entry is required');
    } else {
        data.experience.forEach((exp, index) => {
            if (!exp.company?.trim()) errors.push(`Experience ${index + 1}: Company name is required`);
            if (!exp.position?.trim()) errors.push(`Experience ${index + 1}: Position is required`);
            if (!exp.startDate) errors.push(`Experience ${index + 1}: Start date is required`);
            if (!exp.skillsLearned || exp.skillsLearned.length === 0) {
                errors.push(`Experience ${index + 1}: Skills learned is required`);
            }
        });
    }

    // Validate projects
    if (!data.projects || data.projects.length === 0) {
        errors.push('At least one project entry is required');
    } else {
        data.projects.forEach((project, index) => {
            if (!project.title?.trim()) errors.push(`Project ${index + 1}: Title is required`);
            if (!project.description?.trim()) errors.push(`Project ${index + 1}: Description is required`);
            if (!project.techStack || project.techStack.length === 0) {
                errors.push(`Project ${index + 1}: Tech stack is required`);
            }
        });
    }

    // Validate skills
    if (!data.skills || data.skills.length === 0) {
        errors.push('At least one skill entry is required');
    } else {
        data.skills.forEach((skill, index) => {
            if (!skill.name?.trim()) errors.push(`Skill ${index + 1}: Name is required`);
            if (!skill.level) errors.push(`Skill ${index + 1}: Level is required`);
        });
    }

    return errors;
};

// Get a specific resume by ID
exports.getResumeById = async (req, res) => {
    try {
        const { resumeId } = req.params;
        const userEmail = req.user.email;

        const resume = await Resume.findById(resumeId);
        
        if (!resume) {
            return res.status(404).json({ message: 'Resume not found' });
        }

        if (resume.userEmail !== userEmail) {
            return res.status(403).json({ message: 'Access denied. You can only view your own resumes.' });
        }

        res.status(200).json(resume);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Update an existing resume
exports.updateResume = async (req, res) => {
    try {
        const { resumeId } = req.params;
        const userEmail = req.user.email;
        const { 
            title, 
            status,
            basic,
            skills,
            education,
            experience,
            projects,
            template
        } = req.body;

        // Find the resume and check ownership
        const existingResume = await Resume.findById(resumeId);
        
        if (!existingResume) {
            return res.status(404).json({ message: 'Resume not found' });
        }

        if (existingResume.userEmail !== userEmail) {
            return res.status(403).json({ message: 'Access denied. You can only update your own resumes.' });
        }

        // If updating to 'completed' status, validate completeness
        if (status === 'completed') {
            const validationErrors = validateResumeCompleteness({
                basic,
                skills,
                education,
                experience,
                projects
            });
            
            if (validationErrors.length > 0) {
                return res.status(400).json({ 
                    message: 'Resume is incomplete', 
                    errors: validationErrors 
                });
            }
        }

        // Update the resume
        const updatedResume = await Resume.findByIdAndUpdate(
            resumeId,
            {
                title: title || existingResume.title,
                status: status || existingResume.status,
                basic: basic || existingResume.basic,
                skills: skills || existingResume.skills,
                education: education || existingResume.education,
                experience: experience || existingResume.experience,
                projects: projects || existingResume.projects,
                template: template || existingResume.template,
                updatedAt: new Date()
            },
            { new: true, runValidators: true }
        );

        res.status(200).json({
            message: 'Resume updated successfully',
            resume: updatedResume
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
