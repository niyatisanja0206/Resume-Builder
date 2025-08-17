const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema({
    userEmail: {
        type: String,
        required: true,
        ref: 'User'
    },
    title: {
        type: String,
        default: function() {
            return `Resume ${new Date().toLocaleDateString()}`;
        }
    },
    status: {
        type: String,
        enum: ['draft', 'completed'],
        default: 'draft'
    },
    isDownloaded: {
        type: Boolean,
        default: false
    },
    downloadCount: {
        type: Number,
        default: 0
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
    }],
    template: {
        type: String,
        enum: ['classic', 'modern', 'creative'],
        default: 'classic'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Resume', resumeSchema);