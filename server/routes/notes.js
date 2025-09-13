const express = require('express');
const { body } = require('express-validator');
const {
  getNotes,
  createNote,
  updateNote,
  deleteNote
} = require('../controllers/noteController');
const auth = require('../middleware/auth');

const router = express.Router();

router.use(auth);

const noteValidation = [
  body('content')
    .trim()
    .notEmpty()
    .withMessage('Note content is required')
    .isLength({ max: 1000 })
    .withMessage('Note cannot exceed 1000 characters')
];

router.get('/contact/:contactId', getNotes);
router.post('/contact/:contactId', noteValidation, createNote);
router.put('/:id', noteValidation, updateNote);
router.delete('/:id', deleteNote);

module.exports = router;