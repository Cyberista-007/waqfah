import { useState } from 'react';
import { TAFSEERS, TRANSLATIONS } from '@/components/quran/quran-constants';
import { LOCAL_SCHOLAR_DB, getLocalFallbackExplanation } from '@/components/quran/local-scholar-db';

export function useQuranChat() {
  const [isComparisonMode, setIsComparisonMode] = useState<boolean>(false);
  const [selectedSecondaryTafseer, setSelectedSecondaryTafseer] = useState(TAFSEERS[1]);
  const [selectedSecondaryTranslation, setSelectedSecondaryTranslation] = useState(TRANSLATIONS[1]);
  const [activeChatVerse, setActiveChatVerse] = useState<any | null>(null);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [chatInput, setChatInput] = useState<string>('');
  const [isChatLoading, setIsChatLoading] = useState<boolean>(false);
  const [chatConnectionMode, setChatConnectionMode] = useState<'online' | 'local'>('online');

  const handleSendChatMessage = async (customPrompt?: string) => {
    const text = customPrompt || chatInput;
    if (!text.trim() || !activeChatVerse) return;

    // Add user message
    const userMsg = { role: 'user', content: text };
    const updatedMessages = [...chatMessages, userMsg];
    setChatMessages(updatedMessages);
    setChatInput('');
    setIsChatLoading(true);

    try {
      // Filter out the initial greeting so that the Gemini API chat history starts with a user message
      const apiMessages = updatedMessages.filter((m, idx) => !(idx === 0 && m.role === 'model'));

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: `أنت عالم ومفسر إسلامي خبير ومتخصص في بلاغة القرآن الكريم، أسباب النزول، والدروس الدعوية والتربوية المستفادة.
أنت تساعد المستخدم حالياً في تدبر وتأمل هذه الآية الكريمة:
- السورة: سورة ${activeChatVerse.surah} (رقم السورة: ${activeChatVerse.surahNumber})
- الآية: آية رقم ${activeChatVerse.ayahNumber}
- نص الآية بالرسم العثماني: "${activeChatVerse.arabic}"
- التفسير الميسر المعتمد للآية: "${activeChatVerse.tafseer}"
- ترجمة الآية المعتمدة: "${activeChatVerse.translation || 'غير متوفرة حالياً'}"

توجيهات مهمة للإجابة:
1. التزم بالمنهج الإسلامي الوسطي المعتمد في التفسير والتدبر.
2. أجب باللغة العربية الفصحى المبسطة بأسلوب حواري دافئ، محبب وميسر للقلوب.
3. إذا سألك المستخدم عن البلاغة، فركّز على مواطن الجمال اللغوي، التقديم والتأخير، إعجاز الألفاظ، والطباق أو السجع القرآني الفريد.
4. إذا سألك عن سبب النزول، اعتمد على الأحاديث والروايات الصحيحة المأثورة في أسباب النزول.
5. إذا سألك عن الدروس، فاستنبط له فوائد عملية يمكنه تطبيقها في حياته اليومية وعلاقته بالله ومع الناس.
6. لا تجب عن أي أسئلة خارج نطاق الدين الإسلامي، وتدبر الآية الكريمة المعطيات.`,
          messages: apiMessages.map(m => ({
            role: m.role,
            parts: [{ text: m.content }]
          }))
        })
      });

      const data = await response.json();

      if (response.ok && data.text) {
        setChatMessages(prev => [...prev, { role: 'model', content: data.text }]);
        setChatConnectionMode('online');
      } else {
        throw new Error(data.error || "ONLINE_API_FAILED");
      }
    } catch (err: any) {
      console.warn("AI Chat API failed, using local scholar database:", err);
      setChatConnectionMode('local');

      let explanation = '';
      const key = `${activeChatVerse.surahNumber}:${activeChatVerse.ayahNumber}`;
      const lowerText = text.toLowerCase();

      const localData = LOCAL_SCHOLAR_DB[key] || null;

      if (lowerText.includes('بلاغة') || lowerText.includes('إعجاز') || lowerText.includes('جمال')) {
        explanation = localData?.rhetoric || getLocalFallbackExplanation(activeChatVerse.surah, activeChatVerse.ayahNumber, activeChatVerse.arabic, 'rhetoric');
      } else if (lowerText.includes('نزول') || lowerText.includes('سبب')) {
        explanation = localData?.revelation || getLocalFallbackExplanation(activeChatVerse.surah, activeChatVerse.ayahNumber, activeChatVerse.arabic, 'revelation');
      } else if (lowerText.includes('درس') || lowerText.includes('دروس') || lowerText.includes('عبر') || lowerText.includes('مستفاد')) {
        explanation = localData?.lessons || getLocalFallbackExplanation(activeChatVerse.surah, activeChatVerse.ayahNumber, activeChatVerse.arabic, 'lessons');
      } else {
        explanation = `أهلاً بك في رفيق التفسير والتدبر المحلي. إليك تفصيل لآية ${activeChatVerse.ayahNumber} من سورة ${activeChatVerse.surah}:\n\n` +
          `**✨ بلاغة الآية:**\n${localData?.rhetoric || getLocalFallbackExplanation(activeChatVerse.surah, activeChatVerse.ayahNumber, activeChatVerse.arabic, 'rhetoric')}\n\n` +
          `**📜 سبب النزول:**\n${localData?.revelation || getLocalFallbackExplanation(activeChatVerse.surah, activeChatVerse.ayahNumber, activeChatVerse.arabic, 'revelation')}\n\n` +
          `**💡 الدروس والعبر:**\n${localData?.lessons || getLocalFallbackExplanation(activeChatVerse.surah, activeChatVerse.ayahNumber, activeChatVerse.arabic, 'lessons')}`;
      }

      setTimeout(() => {
        setChatMessages(prev => [...prev, { role: 'model', content: explanation }]);
      }, 500);
    } finally {
      setIsChatLoading(false);
    }
  };

  const startTafseerChat = (verse: any) => {
    setActiveChatVerse(verse);
    setChatMessages([
      {
        role: 'model',
        content: `أهلاً بك في **مساعد التفسير والتدبر الذكي** 🤖 لآية **${verse.ayahNumber}** من **سورة ${verse.surah}**.\n\nيمكنني مساعدتك في استكشاف بلاغة الآية، سبب نزولها، واستنباط الدروس المستفادة. اختر أحد الأسئلة الجاهزة بالأسفل أو اكتب سؤالك الخاص!`
      }
    ]);
    setChatInput('');
    setIsChatLoading(false);
    setChatConnectionMode('online');
  };

  return {
    isComparisonMode,
    setIsComparisonMode,
    selectedSecondaryTafseer,
    setSelectedSecondaryTafseer,
    selectedSecondaryTranslation,
    setSelectedSecondaryTranslation,
    activeChatVerse,
    setActiveChatVerse,
    chatMessages,
    setChatMessages,
    chatInput,
    setChatInput,
    isChatLoading,
    setIsChatLoading,
    chatConnectionMode,
    setChatConnectionMode,
    handleSendChatMessage,
    startTafseerChat
  };
}
