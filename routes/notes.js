const express = require('express');
const Note = require('../models/Note');

const router = express.Router();

// Create a new note
router.post('/', async (req, res) => {
  try {
    const { title } = req.body;
    const note = new Note({ title });
    await note.save();
    res.status(201).json(note);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get a note by ID
router.get('/:id', async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ error: 'Note not found' });
    res.json(note);
  } catch (error) {
    // Handle invalid ObjectId or other errors
    if (error.name === 'CastError') {
      return res.status(404).json({ error: 'Note not found' });
    }
    res.status(500).json({ error: error.message });
  }
});

// Update a note
router.put('/:id', async (req, res) => {
  try {
    const { content, userName } = req.body;
    const now = new Date();

    const update = {
      content,
      updatedAt: now,
      $push: {
        versions: {
          content,
          updatedAt: now,
          userName: userName || 'Anonymous'
        }
      }
    };

    if (userName) {
      update.lastEditedBy = userName;
    }

    const note = await Note.findByIdAndUpdate(req.params.id, update, {
      new: true
    });
    if (!note) return res.status(404).json({ error: 'Note not found' });
    res.json(note);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all notes
router.get('/', async (req, res) => {
  try {
    const notes = await Note.find({}, 'title _id updatedAt');
    res.json(notes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
