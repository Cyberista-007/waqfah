import { NextResponse } from 'next/server';
import { getLectureBySlug } from '@/lib/data';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(req: Request) {
  try {
    const { lectureSlug } = await req.json();

    if (!lectureSlug) {
      return NextResponse.json({ error: "lectureSlug is required" }, { status: 400 });
    }

    // 1. Fetch lecture details
    const lecture = await getLectureBySlug(lectureSlug);
    if (!lecture) {
      return NextResponse.json({ error: "Lecture not found" }, { status: 404 });
    }

    // 2. Extract transcript or description
    let textToAnalyze = "";
    if (lecture.transcript && lecture.transcript.length > 0) {
      textToAnalyze = lecture.transcript.map(item => item.text).join(' ');
    } else if (lecture.description) {
      textToAnalyze = lecture.description;
    }

    if (!textToAnalyze || textToAnalyze.trim().length < 50) {
      return NextResponse.json({ 
        error: "NO_CONTENT_TO_ANALYZE", 
        message: "المحاضرة لا تحتوي على تفريغ نصي أو وصف كافٍ للتلخيص." 
      }, { status: 400 });
    }

    // 3. Initialize Gemini
    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "API_KEY_MISSING", message: "مفتاح الذكاء الاصطناعي غير متوفر." }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.3,
      }
    });

    // 4. Construct prompt
    const prompt = `
أنت مساعد تعليمي ذكي لمنصة 'وقفة' العلمية الإسلامية. 
مهمتك هي قراءة تفريغ أو وصف المحاضرة التالي وتلخيصه وتوليد أسئلة اختبار تفاعلية لزيادة تحصيل الطالب العلمي.

النص المراد تحليله:
"""
العنوان: ${lecture.title}
الوصف: ${lecture.description}

المحتوى:
${textToAnalyze.slice(0, 15000)}  // limit to 15k chars to avoid token limits
"""

قم بتحليل النص أعلاه بدقة، وأنتج النتيجة باللغة العربية بصيغة JSON تطابق البنية التالية تماماً:
{
  "summary": "ملخص شامل ومنظم للمحاضرة مقسم إلى فقرات أو نقاط واضحة ومحفزة.",
  "keyTakeaways": [
    "الفائدة أو المعلومة الهامة الأولى المستخلصة من الدرس",
    "الفائدة الثانية الهامة",
    "الفائدة الثالثة الهامة"
  ],
  "quiz": [
    {
      "question": "نص السؤال الأول حول مسألة هامة ذكرت في النص (اختيار من متعدد)",
      "options": ["الخيار الأول", "الخيار الثاني", "الخيار الثالث", "الخيار الرابع"],
      "correctAnswer": 0, // رقم الفهرس للحل الصحيح (0 إلى 3)
      "explanation": "توضيح وشرح مبسط لسبب صحة هذا الخيار مستنداً للمحاضرة."
    }
  ]
}

تأكد من أن الأسئلة دقيقة وعلمية ومستمدة مباشرة من النص، وأن التلخيص يبرز الأفكار الجوهرية للدرس.
`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    // Parse safety output
    const parsedData = JSON.parse(responseText);

    return NextResponse.json(parsedData);

  } catch (error: any) {
    console.error("AI Summarizer API Error:", error);
    return NextResponse.json({ 
      error: "INTERNAL_ERROR", 
      message: error.message || error.toString() 
    }, { status: 500 });
  }
}
