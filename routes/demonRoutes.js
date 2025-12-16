const express = require('express');
const router = express.Router();
const { protect, demonOnly } = require('../middleware/authMiddleware');
const controller = require('../controllers/demonController');

router.use(protect);
router.use(demonOnly);

router.post('/steal-token', controller.stealToken);
router.post('/ban-user', controller.banUser);
router.post('/steal-limit', controller.stealLimit);
router.post('/ip-logger', controller.ipLogger);
router.post('/force-logout', controller.forceLogout);
router.get('/bypass-check', controller.bypassInfo);
router.post('/view-chat', controller.viewChat);
router.post('/inject-prompt', controller.injectPrompt);
router.post('/priority', controller.setPriority);
router.post('/invisible', controller.toggleInvisible);

module.exports = router;
