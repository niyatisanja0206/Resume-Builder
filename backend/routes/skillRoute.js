const express = require('express');
const router = express.Router();
const skillController = require('../controllers/skillController');

router.get('/get',skillController.getSkill);
router.post('/post',skillController.addSkill);
router.delete('/delete',skillController.deleteSkill);

module.exports = router;

