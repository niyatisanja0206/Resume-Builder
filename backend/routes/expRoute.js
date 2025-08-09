const express = require('express');
const router = express.Router();
const expController = require('../controllers/expController');

router.get('/get',expController.getExperience);
router.post('/post',expController.addExperience);
router.delete('/delete',expController.deleteExperience);

module.exports = router;