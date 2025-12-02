const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    default: ''
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  lastEditedBy: {
    type: String,
    default: 'System'
  },
  versions: [
    {
      content: {
        type: String,
        default: ''
      },
      updatedAt: {
        type: Date,
        default: Date.now
      },
      userName: {
        type: String,
        default: 'Anonymous'
      }
    }
  ]
});

module.exports = mongoose.model('Note', noteSchema);
