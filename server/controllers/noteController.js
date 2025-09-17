const { validationResult } = require('express-validator');
const Note = require('../models/Note');
const Contact = require('../models/Contact');

const getNotes = async (req, res) => {
  try {
    const { contactId } = req.params;

    const contact = await Contact.findOne({
      _id: contactId,
      userId: req.user._id
    });

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found'
      });
    }

    const notes = await Note.find({
      contactId,
      userId: req.user._id
    })
      .sort({ timestamp: -1 });

    // Decrypt notes before sending response
    const decryptedNotes = notes.map(note => note.toDecryptedJSON());

    res.json({
      success: true,
      data: decryptedNotes
    });
  } catch (error) {
    console.error('Get notes error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching notes'
    });
  }
};

const createNote = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { contactId } = req.params;
    const { content } = req.body;

    const contact = await Contact.findOne({
      _id: contactId,
      userId: req.user._id
    });

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found'
      });
    }

    const note = await Note.create({
      content,
      contactId,
      userId: req.user._id
    });

    // Decrypt note before sending response
    const decryptedNote = note.toDecryptedJSON();

    res.status(201).json({
      success: true,
      message: 'Note created successfully',
      data: decryptedNote
    });
  } catch (error) {
    console.error('Create note error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating note'
    });
  }
};

const updateNote = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { content } = req.body;

    const note = await Note.findOneAndUpdate(
      {
        _id: req.params.id,
        userId: req.user._id
      },
      { content },
      { new: true, runValidators: true }
    );

    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found'
      });
    }

    // Decrypt note before sending response
    const decryptedNote = note.toDecryptedJSON();

    res.json({
      success: true,
      message: 'Note updated successfully',
      data: decryptedNote
    });
  } catch (error) {
    console.error('Update note error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating note'
    });
  }
};

const deleteNote = async (req, res) => {
  try {
    const note = await Note.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found'
      });
    }

    res.json({
      success: true,
      message: 'Note deleted successfully'
    });
  } catch (error) {
    console.error('Delete note error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting note'
    });
  }
};

module.exports = {
  getNotes,
  createNote,
  updateNote,
  deleteNote
};