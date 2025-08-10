// controllers/basicController.js
// This controller handles the logic for the basic user information.

const User = require('../models/users');

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
        const { name, contact_no, email, location, about } = req.body;
        
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
        const { email, basicInfo } = req.body;

        if (!email || !basicInfo) {
            return res.status(400).json({ message: 'Email and Basic Information are required' });
        }

        const updated = await User.findOneAndUpdate(
            { "basic.email": email },
            { $set: { basic: basicInfo } },
            { new: true, runValidators: true }
        );

        if (!updated) return res.status(404).json({ message: 'User not found' });

        res.status(200).json({ message: 'Basic information updated successfully', data: updated.basic });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
