// backend/controllers/projectController.js
const Resume = require('../models/resumes');
const { incrementResumeCountByEmail } = require('../utils/userUtils');

exports.getProject = async (req, res) => {
    try {
        const { email } = req.query;

        if (!email) {
            return res.status(400).json({ message: 'Email is required as a query parameter.' });
        }

        const resume = await Resume.findOne({ userEmail: email, status: 'draft' });
        if (!resume) {
            return res.status(404).json({ message: 'Resume not found' });
        }
        res.status(200).json(resume.projects || []);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.addProject = async (req, res) => {
  try {
    const { email, project } = req.body;
    if (!email || !project) {
      return res.status(400).json({ message: 'Email and Project data are required' });
    }

    let resume = await Resume.findOne({ userEmail: email, status: 'draft' });
    
    if (!resume) {
        resume = new Resume({
            userEmail: email,
            projects: [project],
            status: 'draft'
        });
        
        await incrementResumeCountByEmail(email);
    } else {
        if (!resume.projects) {
            resume.projects = [];
        }
        resume.projects.push(project);
    }
    
    await resume.save();

    res.status(201).json({ message: 'Project added successfully', data: resume.projects });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.deleteProject = async (req, res) => {
  try {
    const { email, id } = req.query;
    if (!email || !id) {
      return res.status(400).json({ message: 'Email and Project ID are required' });
    }

    const updated = await Resume.findOneAndUpdate(
      { userEmail: email, status: 'draft' },
      { $pull: { projects: { _id: id } } },
      { new: true }
    );

    if (!updated) return res.status(404).json({ message: 'Resume not found' });

    res.status(200).json({ message: 'Project entry deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateProject = async (req, res) => {
  try {
    const { email, id, project } = req.body;
    if (!email || !id || !project) {
      return res.status(400).json({ message: 'Email, Project ID, and Project data are required' });
    }

    const updated = await Resume.findOneAndUpdate(
      { userEmail: email, status: 'draft', "projects._id": id },
      { $set: { "projects.$": project } },
      { new: true, runValidators: true }
    );

    if (!updated) return res.status(404).json({ message: 'Resume or Project not found' });

    res.status(200).json({ message: 'Project updated successfully', data: updated.projects });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.deleteAllProjects = async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) {
      return res.status(400).json({ message: 'Email is required as a query parameter.' });
    }

    const updated = await Resume.findOneAndUpdate(
      { userEmail: email, status: 'draft' },
      { $set: { projects: [] } },
      { new: true }
    );

    if (!updated) return res.status(404).json({ message: 'Resume not found' });

    res.status(200).json({ message: 'All projects deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
