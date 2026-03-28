const mongoose = require('mongoose');

const transcriptionSchema = new mongoose.Schema(
  {
    filename: {
      type: String,
      required: true,
    },
    originalName: {
      type: String,
      required: true,
    },
    mimetype: {
      type: String,
      required: true,
    },
    size: {
      type: Number,
      required: true,
    },
    transcript: {
      type: String,
      default: '',
    },
    confidence: {
      type: Number,
      default: 0,
    },
    duration: {
      type: Number,
      default: 0,
    },
    language: {
      type: String,
      default: 'en-US',
    },
    words: [
      {
        word: String,
        start: Number,
        end: Number,
        confidence: Number,
      },
    ],
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'error'],
      default: 'pending',
    },
    errorMessage: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Transcription', transcriptionSchema);
