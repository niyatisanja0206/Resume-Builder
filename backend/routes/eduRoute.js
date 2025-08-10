const express = require('express');
const router = express.Router();
const eduController = require('../controllers/eduController');

// Define API endpoints for education data
router.get('/get', eduController.getEducation); 
router.post('/post', eduController.addEducation);
router.delete('/delete', eduController.deleteEducation);
router.delete('/deleteAll', eduController.deleteAllEducation);
router.put('/update', eduController.updateEducation);

module.exports = router;