// controllers/basicController.js
// This controller handles the logic for the basic user information.

const User = require('../models/resumes');

exports.getBasic = async (req, res) => {
    try {
        // Get the email from the query parameters, not the request body
        const { email } = req.query; 

        if (!email) {
            return res.status(400).json({ message: 'Email is required as a query parameter.' });
        }

        const user = await User.findOne({ "basic.email": email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json(user.basic);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.createBasic = async (req, res) => {
    try {
        console.log('Basic Controller - Create/Update Basic Request:', req.body);
        const { name, contact_no, email, location, about } = req.body;
        
        console.log('Looking for user with email:', email);
        let user = await User.findOne({ "basic.email": email }); // Find the user by their email

        if (!user) {
            user = new User({
                basic: { name, contact_no, email, location, about },
            });
        } else {
            user.basic = { name, contact_no, email, location, about };
        }

        await user.save();

        res.status(200).json({
            message: 'Basic data saved successfully',
            data: user.basic,
        });
    } catch (error) {
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

        // Find and delete the user document
        const result = await User.findOneAndDelete({ "basic.email": email });

        if (!result) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ message: 'User deleted successfully' });
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

        console.log('Updating user with email:', email);
        const updated = await User.findOneAndUpdate(
            { "basic.email": email },
            { $set: { basic: basicInfo } },
            { new: true, runValidators: true }
        );

        if (!updated) {
            console.log('User not found for email:', email);
            return res.status(404).json({ message: 'User not found' });
        }

        console.log('User updated successfully:', updated.basic);
        res.status(200).json({ message: 'Basic information updated successfully', data: updated.basic });
    } catch (error) {
        console.error('Error updating basic info:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
