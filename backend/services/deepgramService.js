const { DeepgramClient } = require('@deepgram/sdk');
const fs = require('fs');

const transcribeAudio = async (filePath, mimetype) => {
  const apiKey = process.env.DEEPGRAM_API_KEY;

  if (!apiKey || apiKey === 'your_deepgram_api_key_here') {
    throw new Error(
      'Deepgram API key not configured. Please set DEEPGRAM_API_KEY in your .env file. ' +
        'Get a free key at https://console.deepgram.com'
    );
  }

  const deepgram = new DeepgramClient({ apiKey });

  const audioStream = fs.createReadStream(filePath);

  let result;
  try {
    const response = await deepgram.listen.v1.media.transcribeFile(
      audioStream,
      {
        model: 'nova-2',
        smart_format: true,
        punctuate: true,
        diarize: false,
        language: 'en-US',
        detect_language: true,
      }
    );
    result = response;
  } catch (error) {
    throw new Error(`Deepgram API Error: ${error.message || JSON.stringify(error)}`);
  }

  const channel = result?.results?.channels?.[0];
  const alternative = channel?.alternatives?.[0];

  if (!alternative) {
    throw new Error('No transcription results returned from Deepgram.');
  }

  const transcript = alternative.transcript || '';
  const confidence = alternative.confidence || 0;
  const words = (alternative.words || []).map((w) => ({
    word: w.word,
    start: w.start,
    end: w.end,
    confidence: w.confidence,
  }));
  const duration = result?.metadata?.duration || 0;
  const detectedLanguage = result?.results?.channels?.[0]?.detected_language || 'en-US';

  return { transcript, confidence, words, duration, language: detectedLanguage };
};

module.exports = { transcribeAudio };
