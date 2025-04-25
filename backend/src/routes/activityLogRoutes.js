const express = require('express');
const router = express.Router();
const activityLogController = require('../controllers/ActivityLogController');
const { auth, checkRole } = require('../middleware/auth');

// Pobierz wszystkie logi (tylko dla admina)
router.get('/', auth, checkRole(['Admin']), activityLogController.getActivityLogs);

// Pobierz logi dla zalogowanego użytkownika
router.get('/me', auth, activityLogController.getUserActivityLogs);

module.exports = router;