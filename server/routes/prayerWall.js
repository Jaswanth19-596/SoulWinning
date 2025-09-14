const express = require('express');
const { body } = require('express-validator');
const auth = require('../middleware/auth');
const {
  getPrayerWallItems,
  getPrayerItemComments,
  addPrayerComment,
  updatePrayerComment,
  deletePrayerComment,
  togglePrayerListSharing
} = require('../controllers/prayerWallController');

const router = express.Router();

// All routes require authentication
router.use(auth);

// Get prayer wall items (shared contacts)
router.get('/', getPrayerWallItems);

// Get comments for a specific prayer item
router.get('/:contactId/comments', getPrayerItemComments);

// Add comment/reaction to prayer item
router.post('/:contactId/comments', [
  body('content')
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage('Comment must be between 1 and 500 characters'),
  body('reaction')
    .optional()
    .isIn(['praying', 'amen', 'heart'])
    .withMessage('Invalid reaction type')
], addPrayerComment);

// Update prayer comment
router.put('/comments/:commentId', [
  body('content')
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage('Comment must be between 1 and 500 characters'),
  body('reaction')
    .optional()
    .isIn(['praying', 'amen', 'heart'])
    .withMessage('Invalid reaction type')
], updatePrayerComment);

// Delete prayer comment
router.delete('/comments/:commentId', deletePrayerComment);

// Toggle contact sharing to prayer list
router.patch('/contacts/:contactId/toggle', [
  body('sharedToPrayerList')
    .isBoolean()
    .withMessage('sharedToPrayerList must be a boolean'),
  body('prayerRequest')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Prayer request cannot exceed 500 characters')
], togglePrayerListSharing);

module.exports = router;