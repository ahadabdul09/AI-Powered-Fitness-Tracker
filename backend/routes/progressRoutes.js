const express = require('express');
const {
  getProgressLogs,
  createProgressLog,
  updateProgressLog,
  deleteProgressLog,
} = require('../controllers/progressController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.route('/').get(getProgressLogs).post(createProgressLog);
router.route('/:id').put(updateProgressLog).delete(deleteProgressLog);

module.exports = router;
