import { GoogleGenerativeAI } from '@google/generative-ai';

if (!process.env.GEMINI_API_KEY) {
  throw new Error('Please set GEMINI_API_KEY in .env.local');
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Fast model for chat responses
export const chatModel = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

// Same model but we'll request JSON output for structured prediction
export const predictModel = genAI.getGenerativeModel({
  model: 'gemini-2.5-flash',
  generationConfig: { responseMimeType: 'application/json' },
});
