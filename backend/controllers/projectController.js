const User = require('../models/users');

exports.getProject = async (req, res) => {
    try {
        const { email } = req.query;

        if (!email) {
            return res.status(400).json({ message: 'Email is required as a query parameter.' });
        }

        const user = await User.findOne({ "basic.email": email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json(user.projects); // Changed 'project' to 'projects'
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

    const updated = await User.findOneAndUpdate(
      { "basic.email": email },
      { $push: { projects: project } }, // Changed 'project' to 'projects'
      { new: true, runValidators: true }
    );

    if (!updated) return res.status(404).json({ message: 'User not found' });

    res.status(201).json({ message: 'Project added successfully', data: updated.projects });
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

    const updated = await User.findOneAndUpdate(
      { "basic.email": email },
      { $pull: { projects: { _id: id } } }, // Changed 'project' to 'projects'
      { new: true }
    );

    if (!updated) return res.status(404).json({ message: 'User not found' });

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

    const updated = await User.findOneAndUpdate(
      { "basic.email": email, "projects._id": id },
      { $set: { "projects.$": project } },
      { new: true, runValidators: true }
    );

    if (!updated) return res.status(404).json({ message: 'User or Project not found' });

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

    const updated = await User.findOneAndUpdate(
      { "basic.email": email },
      { $set: { projects: [] } },
      { new: true }
    );

    if (!updated) return res.status(404).json({ message: 'User not found' });

    res.status(200).json({ message: 'All projects deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
