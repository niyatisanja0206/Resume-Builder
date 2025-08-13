const express = require('express');
const router = express.Router();
const basicController = require('../controllers/basicController');

router.get('/get', basicController.getBasic);
router.post('/post', basicController.createBasic);
router.delete('/delete', basicController.deleteBasic);
router.delete('/deleteAll', basicController.deleteAllBasic);
router.put('/update', basicController.updateBasic); 

module.exports = router;
