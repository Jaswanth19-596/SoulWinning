const { validationResult } = require('express-validator');
const Contact = require('../models/Contact');
const PrayerComment = require('../models/PrayerComment');
const User = require('../models/User');

const getPrayerWallItems = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Get all contacts shared to prayer list with user details
    const prayerItems = await Contact.find({ sharedToPrayerList: true })
      .populate('userId', 'username')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Get comment counts for each prayer item
    const itemsWithCounts = await Promise.all(
      prayerItems.map(async (item) => {
        const commentCount = await PrayerComment.countDocuments({ contactId: item._id });
        return {
          ...item.toObject(),
          commentCount
        };
      })
    );

    const total = await Contact.countDocuments({ sharedToPrayerList: true });

    res.json({
      success: true,
      data: itemsWithCounts,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get prayer wall items error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching prayer wall items'
    });
  }
};

const getPrayerItemComments = async (req, res) => {
  try {
    const { contactId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Verify the contact is shared to prayer list
    const contact = await Contact.findOne({
      _id: contactId,
      sharedToPrayerList: true
    });

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Prayer item not found or not shared'
      });
    }

    const comments = await PrayerComment.find({ contactId })
      .populate('userId', 'username')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await PrayerComment.countDocuments({ contactId });

    res.json({
      success: true,
      data: comments,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get prayer item comments error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching comments'
    });
  }
};

const addPrayerComment = async (req, res) => {
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
    const { content, reaction } = req.body;

    // Verify the contact is shared to prayer list
    const contact = await Contact.findOne({
      _id: contactId,
      sharedToPrayerList: true
    });

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Prayer item not found or not shared'
      });
    }

    const comment = await PrayerComment.create({
      content,
      reaction: reaction || 'praying',
      contactId,
      userId: req.user._id
    });

    const populatedComment = await PrayerComment.findById(comment._id)
      .populate('userId', 'username');

    res.status(201).json({
      success: true,
      message: 'Prayer comment added successfully',
      data: populatedComment
    });
  } catch (error) {
    console.error('Add prayer comment error:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding prayer comment'
    });
  }
};

const updatePrayerComment = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { commentId } = req.params;
    const { content, reaction } = req.body;

    const comment = await PrayerComment.findOneAndUpdate(
      {
        _id: commentId,
        userId: req.user._id
      },
      {
        content,
        reaction
      },
      { new: true, runValidators: true }
    ).populate('userId', 'username');

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found or unauthorized'
      });
    }

    res.json({
      success: true,
      message: 'Prayer comment updated successfully',
      data: comment
    });
  } catch (error) {
    console.error('Update prayer comment error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating prayer comment'
    });
  }
};

const deletePrayerComment = async (req, res) => {
  try {
    const { commentId } = req.params;

    const comment = await PrayerComment.findOneAndDelete({
      _id: commentId,
      userId: req.user._id
    });

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found or unauthorized'
      });
    }

    res.json({
      success: true,
      message: 'Prayer comment deleted successfully'
    });
  } catch (error) {
    console.error('Delete prayer comment error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting prayer comment'
    });
  }
};

const togglePrayerListSharing = async (req, res) => {
  try {
    console.log('🙏 Toggle prayer list sharing request:');
    console.log('  Contact ID:', req.params.contactId);
    console.log('  User ID:', req.user?._id);
    console.log('  Request body:', req.body);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('❌ Validation errors:', errors.array());
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { contactId } = req.params;
    const { sharedToPrayerList, prayerRequest } = req.body;

    const contact = await Contact.findOneAndUpdate(
      {
        _id: contactId,
        userId: req.user._id
      },
      {
        sharedToPrayerList: !!sharedToPrayerList,
        prayerRequest: sharedToPrayerList ? prayerRequest : undefined
      },
      { new: true, runValidators: true }
    );

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found'
      });
    }

    res.json({
      success: true,
      message: `Contact ${sharedToPrayerList ? 'added to' : 'removed from'} prayer list successfully`,
      data: contact
    });
  } catch (error) {
    console.error('Toggle prayer list sharing error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating prayer list sharing'
    });
  }
};

module.exports = {
  getPrayerWallItems,
  getPrayerItemComments,
  addPrayerComment,
  updatePrayerComment,
  deletePrayerComment,
  togglePrayerListSharing
};