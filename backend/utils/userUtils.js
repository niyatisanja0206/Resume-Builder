const User = require('../models/users');

// Helper function to increment resume count by email
const incrementResumeCountByEmail = async (email) => {
    try {
        const result = await User.findOneAndUpdate(
            { email }, 
            { $inc: { no_of_resumes: 1 } },
            { new: true }
        );
        if (result) {
            console.log(`Resume count incremented for user: ${email}. New count: ${result.no_of_resumes}`);
        } else {
            console.log(`User not found for email: ${email}`);
        }
    } catch (error) {
        console.error('Error incrementing resume count:', error);
    }
};

// Helper function to decrement resume count by email (for deletions)
const decrementResumeCountByEmail = async (email) => {
    try {
        const result = await User.findOneAndUpdate(
            { email }, 
            { $inc: { no_of_resumes: -1 } },
            { new: true }
        );
        if (result) {
            // Ensure count doesn't go below 0
            if (result.no_of_resumes < 0) {
                await User.findOneAndUpdate({ email }, { no_of_resumes: 0 });
                console.log(`Resume count reset to 0 for user: ${email}`);
            } else {
                console.log(`Resume count decremented for user: ${email}. New count: ${result.no_of_resumes}`);
            }
        } else {
            console.log(`User not found for email: ${email}`);
        }
    } catch (error) {
        console.error('Error decrementing resume count:', error);
    }
};

// Helper function to get actual resume count from database
const getActualResumeCount = async (email) => {
    try {
        const Resume = require('../models/resumes');
        const count = await Resume.countDocuments({ userEmail: email });
        return count;
    } catch (error) {
        console.error('Error getting actual resume count:', error);
        return 0;
    }
};

// Helper function to sync resume count with actual count in database
const syncResumeCount = async (email) => {
    try {
        const actualCount = await getActualResumeCount(email);
        const result = await User.findOneAndUpdate(
            { email }, 
            { no_of_resumes: actualCount },
            { new: true }
        );
        if (result) {
            console.log(`Resume count synced for user: ${email}. Count: ${actualCount}`);
        }
        return actualCount;
    } catch (error) {
        console.error('Error syncing resume count:', error);
        return 0;
    }
};

module.exports = {
    incrementResumeCountByEmail,
    decrementResumeCountByEmail,
    getActualResumeCount,
    syncResumeCount
};
