const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const upload = require('../middleware/upload');
const Transcription = require('../models/Transcription');
const { transcribeAudio } = require('../services/deepgramService');

// POST /api/transcribe - Upload audio and transcribe
router.post('/transcribe', upload.single('audio'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'No audio file uploaded. Please attach an audio file with key "audio".',
    });
  }

  const { filename, originalname, mimetype, size, path: filePath } = req.file;

  // Create DB record with pending status
  const transcription = new Transcription({
    filename,
    originalName: originalname,
    mimetype,
    size,
    status: 'processing',
  });

  try {
    await transcription.save();

    // Call Deepgram
    const { transcript, confidence, words, duration, language } = await transcribeAudio(
      filePath,
      mimetype
    );

    // Update DB record
    transcription.transcript = transcript;
    transcription.confidence = confidence;
    transcription.words = words;
    transcription.duration = duration;
    transcription.language = language;
    transcription.status = 'completed';
    await transcription.save();

    return res.status(200).json({
      success: true,
      message: 'Transcription completed successfully.',
      data: transcription,
    });
  } catch (error) {
    console.error('Transcription error:', error.message);

    // Update with error status
    transcription.status = 'error';
    transcription.errorMessage = error.message;
    await transcription.save().catch(() => {});

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  } finally {
    // Clean up uploaded file after processing
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }
});

// GET /api/transcriptions - Get all transcriptions (paginated)
router.get('/transcriptions', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const total = await Transcription.countDocuments();
    const transcriptions = await Transcription.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-words'); // words can be large, omit from list

    return res.status(200).json({
      success: true,
      data: transcriptions,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/transcriptions/:id - Get single transcription with word data
router.get('/transcriptions/:id', async (req, res) => {
  try {
    const transcription = await Transcription.findById(req.params.id);
    if (!transcription) {
      return res.status(404).json({ success: false, message: 'Transcription not found.' });
    }
    return res.status(200).json({ success: true, data: transcription });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/transcriptions/:id - Delete a transcription
router.delete('/transcriptions/:id', async (req, res) => {
  try {
    const transcription = await Transcription.findByIdAndDelete(req.params.id);
    if (!transcription) {
      return res.status(404).json({ success: false, message: 'Transcription not found.' });
    }
    return res.status(200).json({ success: true, message: 'Transcription deleted.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// Multer error handler
router.use((err, req, res, next) => {
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ success: false, message: 'File too large. Maximum size is 50MB.' });
  }
  return res.status(400).json({ success: false, message: err.message });
});

module.exports = router;
