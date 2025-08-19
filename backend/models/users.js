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
    name: {
        type: String,
        default: ''
    },
    contact_no: {
        type: String,
        default: ''
    },
    location: {
        type: String,
        default: ''
    },
    about: {
        type: String,
        default: ''
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
}, {
    timestamps: true
});


// Hash password before saving
const bcrypt = require('bcryptjs');
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (err) {
        next(err);
    }
});

module.exports = mongoose.model('User', userSchema);
