// server.js
// This file sets up your Express server, connects to the database,
// and imports all your routes.
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const session = require('express-session');


const app = express();

// Connect to the database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`, req.body);
    next();
});

// Session management (optional but good practice)
app.use(session({
    secret: process.env.SESSION_SECRET || 'defaultsecret',
    resave: false,
    saveUninitialized: true,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        maxAge: 1000 * 60 * 60 * 24 // 1 day
    }
}));

// Routes
const basicRoute = require('./routes/basicRoute');
app.use('/api/basic', basicRoute);

const eduRoute = require('./routes/eduRoute');
app.use('/api/edu', eduRoute);

const expRoute = require('./routes/expRoute');
app.use('/api/exp', expRoute);

const projectRoute = require('./routes/projectRoute');
app.use('/api/pro',projectRoute);

const skillRoute = require('./routes/skillRoute');
app.use('/api/skill', skillRoute);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));