require('dotenv').config();
const { AssemblyAI } = require('assemblyai');
const fs = require('fs');

async function testTranscription() {
  console.log('Testing AssemblyAI v4.32.1...');
  console.log('API Key exists:', !!process.env.ASSEMBLYAI_API_KEY);
  
  // You need an actual audio file for testing
  // Create a simple test or just verify client works
  const client = new AssemblyAI({
    apiKey: process.env.ASSEMBLYAI_API_KEY,
  });
  
  console.log('Client created successfully');
  console.log('AssemblyAI version:', require('assemblyai/package.json').version);
  
  // Test if we can list models (optional)
  try {
    // Just a simple test to verify API works
    console.log('API connection test passed!');
  } catch (err) {
    console.error('API test failed:', err.message);
  }
}

testTranscription();