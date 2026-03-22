const express = require('express')
const multer = require('multer')
const path = require('path')
const mongoose = require('mongoose')
const AudioTranscription = require('./models/AudioTranscription')
const app = express()
const port = 3000
const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/audio_transcriptions'

const allowedAudioExtensions = new Set(['.mp3', '.wav', '.m4a'])

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024
  },
  fileFilter: (req, file, cb) => {
    const extension = path.extname(file.originalname || '').toLowerCase()

    if (!allowedAudioExtensions.has(extension)) {
      return cb(new Error('Only .mp3, .wav, and .m4a files are allowed'))
    }

    if (!file.mimetype || !file.mimetype.startsWith('audio/')) {
      return cb(new Error('Only audio files are allowed'))
    }

    return cb(null, true)
  }
})

app.post('/upload', (req, res) => {
  upload.single('file')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ error: err.message })
    }

    if (err) {
      return res.status(400).json({ error: err.message || 'File upload failed' })
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded. Use field name "file".' })
    }

    const audioDocument = new AudioTranscription({
      originalFileName: req.file.originalname,
      mimeType: req.file.mimetype,
      fileSize: req.file.size,
      audioData: req.file.buffer,
      transcriptionStatus: 'pending'
    })

    return audioDocument
      .save()
      .then((savedAudio) => {
        return res.status(201).json({
          message: 'File uploaded and saved successfully',
          file: {
            id: savedAudio._id,
            originalName: savedAudio.originalFileName,
            size: savedAudio.fileSize,
            mimeType: savedAudio.mimeType,
            transcriptionStatus: savedAudio.transcriptionStatus
          }
        })
      })
      .catch((saveError) => {
        return res.status(500).json({ error: saveError.message || 'Failed to save file data' })
      })
  })
})

mongoose
  .connect(mongoUri)
  .then(() => {
    app.listen(port, () => {
      console.log(`MongoDB connected: ${mongoUri}`)
      console.log(`Example app listening on port ${port}`)
    })
  })
  .catch((error) => {
    console.error('MongoDB connection failed:', error.message)
    process.exit(1)
  })
