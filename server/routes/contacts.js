const express = require('express');
const { body } = require('express-validator');
const {
  getContacts,
  getContact,
  createContact,
  updateContact,
  deleteContact,
  searchContacts
} = require('../controllers/contactController');
const auth = require('../middleware/auth');

const router = express.Router();

router.use(auth);

const contactValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Contact name is required')
    .isLength({ max: 100 })
    .withMessage('Name cannot exceed 100 characters'),
  body('address')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Address cannot exceed 200 characters'),
  body('phone')
    .optional()
    .trim()
    .isLength({ max: 20 })
    .withMessage('Phone number cannot exceed 20 characters'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  body('tags.*')
    .optional()
    .trim()
    .isLength({ max: 30 })
    .withMessage('Each tag cannot exceed 30 characters')
];

router.get('/', getContacts);
router.get('/search', searchContacts);
router.get('/:id', getContact);
router.post('/', contactValidation, createContact);
router.put('/:id', contactValidation, updateContact);
router.delete('/:id', deleteContact);

module.exports = router;