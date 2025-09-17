const { validationResult } = require('express-validator');
const mongoose = require('mongoose');
const Contact = require('../models/Contact');
const Note = require('../models/Note');

const getContacts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const { search, tags } = req.query;

    let query = { userId: req.user._id };

    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    if (tags) {
      const tagArray = tags.split(',');
      query.tags = { $in: tagArray };
    }

    const contacts = await Contact.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Contact.countDocuments(query);

    // Decrypt contacts before sending response
    const decryptedContacts = contacts.map(contact => contact.toDecryptedJSON());

    res.json({
      success: true,
      data: decryptedContacts,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get contacts error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching contacts'
    });
  }
};

const getContact = async (req, res) => {
  try {
    const contact = await Contact.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found'
      });
    }

    const notes = await Note.find({
      contactId: contact._id,
      userId: req.user._id
    })
      .sort({ timestamp: -1 });

    // Decrypt contact and notes before sending response
    const decryptedContact = contact.toDecryptedJSON();
    const decryptedNotes = notes.map(note => note.toDecryptedJSON());

    res.json({
      success: true,
      data: {
        contact: decryptedContact,
        notes: decryptedNotes
      }
    });
  } catch (error) {
    console.error('Get contact error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching contact'
    });
  }
};

const createContact = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { name, address, phone, tags, sharedToPrayerList, prayerRequest } = req.body;

    const contact = await Contact.create({
      name,
      address,
      phone,
      tags,
      sharedToPrayerList: sharedToPrayerList || false,
      prayerRequest,
      userId: req.user._id
    });

    // Decrypt contact before sending response
    const decryptedContact = contact.toDecryptedJSON();

    res.status(201).json({
      success: true,
      message: 'Contact created successfully',
      data: decryptedContact
    });
  } catch (error) {
    console.error('Create contact error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating contact'
    });
  }
};

const updateContact = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { name, address, phone, tags, sharedToPrayerList, prayerRequest } = req.body;

    const contact = await Contact.findOneAndUpdate(
      {
        _id: req.params.id,
        userId: req.user._id
      },
      {
        name,
        address,
        phone,
        tags,
        sharedToPrayerList,
        prayerRequest
      },
      { new: true, runValidators: true }
    );

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found'
      });
    }

    // Decrypt contact before sending response
    const decryptedContact = contact.toDecryptedJSON();

    res.json({
      success: true,
      message: 'Contact updated successfully',
      data: decryptedContact
    });
  } catch (error) {
    console.error('Update contact error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating contact'
    });
  }
};

const deleteContact = async (req, res) => {
  try {
    const contact = await Contact.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found'
      });
    }

    await Note.deleteMany({
      contactId: req.params.id,
      userId: req.user._id
    });

    res.json({
      success: true,
      message: 'Contact and associated notes deleted successfully'
    });
  } catch (error) {
    console.error('Delete contact error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting contact'
    });
  }
};

const searchContacts = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    // Search in notes first to get contactIds
    const notesWithQuery = await Note.find({
      userId: req.user._id,
      content: { $regex: q, $options: 'i' }
    }).distinct('contactId');

    // Enhanced search: name, address, phone, tags, and notes
    const contacts = await Contact.find({
      userId: req.user._id,
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { address: { $regex: q, $options: 'i' } },
        { phone: { $regex: q, $options: 'i' } },
        { tags: { $in: [new RegExp(q, 'i')] } },
        { prayerRequest: { $regex: q, $options: 'i' } },
        { _id: { $in: notesWithQuery } }
      ]
    }).sort({ createdAt: -1 });

    // Decrypt contacts before sending response
    const decryptedContacts = contacts.map(contact => contact.toDecryptedJSON());

    res.json({
      success: true,
      data: decryptedContacts
    });
  } catch (error) {
    console.error('Search contacts error:', error);
    res.status(500).json({
      success: false,
      message: 'Error searching contacts'
    });
  }
};

module.exports = {
  getContacts,
  getContact,
  createContact,
  updateContact,
  deleteContact,
  searchContacts
};