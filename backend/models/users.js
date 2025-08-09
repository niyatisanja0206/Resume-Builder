const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    basic: {
        name: String,
        email: String,
        contact_no: String,
        location: String,
        about: String
    },
    skills: {
        type: [String],
    },
    education: [{
        degree: String,
        institution: String,
        year: String
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
    education: [{
        degree: String,
        institution: String,
        startDate: Date,
        endDate: Date,
        grade: String
    }],

})

module.exports = mongoose.model('User', userSchema);