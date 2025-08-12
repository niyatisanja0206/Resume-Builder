const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    no_of_resumes: {
        type: Number,
        required: true,
        default: 0
    },
    resume_downloaded: {
        type: Number,
        default: 0,
        required: true
    }
});

module.exports = mongoose.model('User', userSchema);
