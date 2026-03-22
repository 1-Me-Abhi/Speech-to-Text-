const mongoose = require('mongoose')

const audioTranscriptionSchema = new mongoose.Schema(
  {
    originalFileName: {
      type: String,
      required: true,
      trim: true
    },
    mimeType: {
      type: String,
      required: true,
      trim: true
    },
    fileSize: {
      type: Number,
      required: true,
      min: 1
    },
    audioData: {
      type: Buffer,
      required: true
    },
    transcriptionText: {
      type: String,
      default: '',
      trim: true
    },
    transcriptionStatus: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      default: 'pending'
    },
    language: {
      type: String,
      default: 'en'
    }
  },
  {
    timestamps: true
  }
)

module.exports = mongoose.model('AudioTranscription', audioTranscriptionSchema)
