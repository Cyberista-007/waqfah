import { NextResponse } from 'next/server';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';

const FALLBACK_MODELS = [
  'gemini-3.5-flash',
  'gemini-2.5-flash',
  'gemini-2.5-flash-lite',
  'gemini-2.0-flash',
];
const MAX_MESSAGE_LENGTH = 2000;
const MAX_HISTORY_LENGTH = 25;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { messages, model: modelName } = body || {};

    const apiKey = (process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '').trim();
    if (!apiKey) {
      return NextResponse.json({ error: 'API_KEY_MISSING' }, { status: 500 });
    }

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'EMPTY_OR_INVALID_HISTORY' }, { status: 400 });
    }

    const cappedMessages = messages.slice(-MAX_HISTORY_LENGTH);
    const lastMsg = cappedMessages[cappedMessages.length - 1];
    let textToSend = (lastMsg?.parts?.[0]?.text || lastMsg?.content || '').toString();

    if (!textToSend.trim()) {
      return NextResponse.json({ error: 'EMPTY_MESSAGE' }, { status: 400 });
    }

    if (textToSend.length > MAX_MESSAGE_LENGTH) {
      textToSend = textToSend.slice(0, MAX_MESSAGE_LENGTH);
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const history = cappedMessages.slice(0, -1).map((msg: any) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: msg.parts || [{ text: (msg.content || '').toString().slice(0, MAX_MESSAGE_LENGTH) }],
    }));

    const modelsToTry = Array.from(
      new Set([
        ...(typeof modelName === 'string' && modelName.trim() && modelName !== 'gemini-4-hydrogen'
          ? [modelName.trim()]
          : []),
        ...FALLBACK_MODELS,
      ])
    );

    let lastError: any = null;

    for (const candidateModel of modelsToTry) {
      try {
        const model = genAI.getGenerativeModel({
          model: candidateModel,
          safetySettings: [
            { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
            { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
            { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
            { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
          ],
        });

        const chat = model.startChat({
          history,
          generationConfig: {
            maxOutputTokens: 1200,
            temperature: 0.6,
          },
        });

        const result = await chat.sendMessage(textToSend);
        const text = result.response.text();
        return NextResponse.json({ text, model: candidateModel });
      } catch (err: any) {
        lastError = err;
        const msg = (err?.message || err?.toString() || '').toLowerCase();
        if (msg.includes('api_key_invalid') || msg.includes('api key not valid') || msg.includes('401') || msg.includes('403')) {
          return NextResponse.json({ error: 'API_KEY_INVALID' }, { status: 401 });
        }
        // Continue trying fallback models for 404 / model-not-found / unsupported errors
      }
    }

    return NextResponse.json(
      { error: lastError?.message || 'FAILED_ALL_MODELS' },
      { status: 500 }
    );
  } catch (error: any) {
    console.error('Server AI Error:', error);
    return NextResponse.json(
      { error: error.message || error.toString() },
      { status: 500 }
    );
  }
}
