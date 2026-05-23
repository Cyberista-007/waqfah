import { NextResponse } from 'next/server';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';

export async function POST(req: Request) {
  try {
    const { messages, model: modelName } = await req.json();

    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "API_KEY_MISSING" }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const selectedModel = modelName || "gemini-2.5-flash";

    const model = genAI.getGenerativeModel({
      model: selectedModel,
      safetySettings: [
        { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
      ]
    });

    const chatHistory = messages || [];
    
    if (chatHistory.length === 0) {
      return NextResponse.json({ error: "EMPTY_HISTORY" }, { status: 400 });
    }

    const lastMsg = chatHistory[chatHistory.length - 1];
    const textToSend = lastMsg.parts?.[0]?.text || "";
    
    // Exclude the last message from startChat history
    const history = chatHistory.slice(0, -1).map((msg: any) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: msg.parts || [{ text: msg.content || "" }]
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
