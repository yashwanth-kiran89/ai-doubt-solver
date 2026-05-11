const { AssemblyAI } = require('assemblyai');
const fs = require('fs');
const path = require('path');

const transcribeAudio = async (audioFilePath) => {
  try {
    // Check if file exists
    if (!fs.existsSync(audioFilePath)) {
      throw new Error(`Audio file not found: ${audioFilePath}`);
    }

    console.log(`[VOICE] Transcribing audio file: ${path.basename(audioFilePath)}`);
    console.log(`[VOICE] File size: ${(fs.statSync(audioFilePath).size / 1024).toFixed(2)} KB`);

    const apiKey = process.env.ASSEMBLYAI_API_KEY;
    if (!apiKey || apiKey === 'your_assemblyai_api_key_here') {
      throw new Error('ASSEMBLYAI_API_KEY is not configured in .env file');
    }

    // Initialize the AssemblyAI client
    const client = new AssemblyAI({
      apiKey: apiKey,
    });

    // Read the audio file
    const audioData = fs.readFileSync(audioFilePath);
    
    console.log('[VOICE] Submitting transcription request...');
    
    // FIX: Use "speech_models" (plural) instead of "speech_model"
    const transcript = await client.transcripts.transcribe({
      audio: audioData,
      speech_models: ['universal-2'],  // CHANGED: speech_models (array) not speech_model
      language_code: 'en',
      punctuate: true,
      format_text: true,
    });

    console.log(`[VOICE] Transcription status: ${transcript.status}`);

    if (transcript.status === 'error') {
      throw new Error(`Transcription failed: ${transcript.error}`);
    }

    if (!transcript.text || transcript.text.trim() === '') {
      throw new Error('No speech detected in the audio. Please speak clearly and try again.');
    }

    console.log(`[VOICE] Transcription successful!`);
    console.log(`[VOICE] Text: "${transcript.text.substring(0, 100)}..."`);

    // Clean up the audio file after successful transcription
    if (fs.existsSync(audioFilePath)) {
      fs.unlinkSync(audioFilePath);
      console.log(`[VOICE] Cleaned up audio file`);
    }

    return transcript.text;
  } catch (error) {
    console.error('[VOICE] Transcription error:', error);
    
    // Try to clean up file on error too
    try {
      if (fs.existsSync(audioFilePath)) {
        fs.unlinkSync(audioFilePath);
      }
    } catch (cleanupError) {
      console.log('[VOICE] Cleanup error:', cleanupError.message);
    }
    
    throw new Error(`Speech-to-text failed: ${error.message}`);
  }
};

const isSpeechServiceAvailable = () => {
  const apiKey = process.env.ASSEMBLYAI_API_KEY;
  const isAvailable = !!(apiKey && apiKey !== 'your_assemblyai_api_key_here');
  console.log(`[VOICE] Speech service available: ${isAvailable}`);
  if (!isAvailable) {
    console.warn('[VOICE] AssemblyAI API key missing! Voice features will not work.');
  }
  return isAvailable;
};

module.exports = { transcribeAudio, isSpeechServiceAvailable };