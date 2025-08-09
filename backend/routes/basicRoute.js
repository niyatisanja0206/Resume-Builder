// routes/basicRoute.js
// This file defines the API routes for basic user information.

const express = require('express');
const router = express.Router();
const basicController = require('../controllers/basicController');

// Define API endpoints for basic data
router.get('/get', basicController.getBasic);
router.post('/post', basicController.createBasic);
router.delete('/delete', basicController.deleteBasic);

module.exports = router;
