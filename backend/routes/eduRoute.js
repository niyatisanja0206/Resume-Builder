const express = require('express');
const router = express.Router();
const eduController = require('../controllers/eduController');

// Define API endpoints for education data
router.get('/get', eduController.getEducation); 
router.post('/post', eduController.addEducation);
router.delete('/delete', eduController.deleteEducation);

module.exports = router;