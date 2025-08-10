// routes/projectRoute.js
const express = require("express");
const router = express.Router();
const projectController = require("../controllers/projectController");

router.get('/get', projectController.getProject);
router.post('/post', projectController.addProject);
router.delete('/delete', projectController.deleteProject);
router.delete('/deleteAll', projectController.deleteAllProjects);
router.put('/update', projectController.updateProject);

module.exports = router;
