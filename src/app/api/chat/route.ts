import { NextResponse } from 'next/server';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';

const ALLOWED_MODELS = ['gemini-3.8-flash', 'gemini-2.5-flash', 'gemini-2.5-pro', 'gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-1.5-pro'];
const MAX_MESSAGE_LENGTH = 2000;
const MAX_HISTORY_LENGTH = 25;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { messages, model: modelName } = body || {};

    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "API_KEY_MISSING" }, { status: 500 });
    }

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "EMPTY_OR_INVALID_HISTORY" }, { status: 400 });
    }

    // Limit history length to prevent resource exhaustion attacks
    const cappedMessages = messages.slice(-MAX_HISTORY_LENGTH);
    const lastMsg = cappedMessages[cappedMessages.length - 1];
    let textToSend = (lastMsg?.parts?.[0]?.text || lastMsg?.content || "").toString();

    if (!textToSend.trim()) {
      return NextResponse.json({ error: "EMPTY_MESSAGE" }, { status: 400 });
    }

    // Truncate excessively long inputs
    if (textToSend.length > MAX_MESSAGE_LENGTH) {
      textToSend = textToSend.slice(0, MAX_MESSAGE_LENGTH);
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const selectedModel = ALLOWED_MODELS.includes(modelName) ? modelName : "gemini-3.8-flash";

    // Enforce responsible safety thresholds suitable for an Islamic educational platform
    const model = genAI.getGenerativeModel({
      model: selectedModel,
      safetySettings: [
        { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
      ]
    });

    // Exclude the last message from startChat history
    const history = cappedMessages.slice(0, -1).map((msg: any) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: msg.parts || [{ text: (msg.content || "").toString().slice(0, MAX_MESSAGE_LENGTH) }]
    }));

    const chat = model.startChat({
      history,
      generationConfig: {
        maxOutputTokens: 1200,
        temperature: 0.6,
      },
    });

    const result = await chat.sendMessage(textToSend);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ text });
  } catch (error: any) {
    console.error("Server AI Error:", error);
    return NextResponse.json({ 
      error: error.message || error.toString() 
    }, { status: 500 });
  }
}
