const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema({
    userEmail: {
        type: String,
        required: true,
        ref: 'User'
    },
    isDownloaded: {
        type: Boolean,
        default: false
    },
    isCreated: {
        type: Boolean,
        default: false
    },
    basic: {
        name: String,
        email: String,
        contact_no: String,
        location: String,
        about: String
    },
    skills: [{
        name: String,
        level: String
    }],
    education: [{
        institution: String,
        degree: String,
        startDate: Date,
        endDate: Date,
        Grade: String
    }],
    experience: [{
        company: String,
        position: String,
        startDate: Date,
        endDate: Date,
        description: String,
        skillsLearned: [String]
    }],
    projects: [{
        title: String,
        description: String,
        techStack: [String],
        link: String
    }]
}, {
    timestamps: true
});

module.exports = mongoose.model('Resume', resumeSchema);