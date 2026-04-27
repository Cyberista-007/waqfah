
"use client"

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageSquare, X, Send, Sparkles, User, 
  Bot, Loader2, Settings, Info, AlertCircle,
  Minimize2, Maximize2, Trash2, Copy, Check
} from 'lucide-react';
import { useAppearance } from '@/components/appearance-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
};

export function ChatWidget() {
  const { aiApiKey } = useAppearance();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || !aiApiKey || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      if (!aiApiKey) {
        throw new Error("API_KEY_MISSING");
      }

      const cleanKey = aiApiKey.trim();
      const genAI = new GoogleGenerativeAI(cleanKey);
      
      // List of models to try in order of preference
      const modelsToTry = [
        "gemini-1.5-flash",
        "gemini-2.0-flash-exp",
        "gemini-1.5-flash-latest",
        "gemini-1.5-pro",
        "gemini-1.5-pro-latest",
        "gemini-pro",
        "gemini-1.0-pro"
      ];

      let lastError: any = null;
      let successfulResponse: any = null;
      let usedModel = "";

      // Loop through models until one works
      for (const modelName of modelsToTry) {
        try {
          const model = genAI.getGenerativeModel({ 
            model: modelName,
            safetySettings: [
              { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
              { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
              { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
              { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
            ]
          });

          const systemPrompt = `أنت "وقفة AI"، مساعد ذكي متخصص في منصة "وقفة" للدروس العلمية. 
          مهمتك هي مساعدة طلاب العلم في تصفح الموقع، الإجابة على تساؤلاتهم الفقهية والشرعية بأسلوب مبسط وموثق، ومساعدتهم في بناء خططهم العلمية.
          سماتك: حكيم، متواضع، ناصح، وملتزم بهدي الكتاب والسنة بفهم سلف الأمة.
          تحدث دائماً باللغة العربية الفصحى المبسطة بأسلوب ودود.
          إذا سألك المستخدم عن شيء لا تعرفه، قل له "الله أعلم" ووجهه لسؤال أهل الاختصاص أو البحث في المحاضرات المتاحة على المنصة.
          لا تجب على أسئلة خارج نطاق الدين أو العلم أو المنصة إلا بأسلوب موجز جداً يوجه المستخدم للتركيز على هدفه العلمي.`;

          const chatHistory = messages.map(msg => ({
            role: msg.role === 'user' ? 'user' : 'model',
            parts: [{ text: msg.content }],
          }));

          const history = [
            { role: 'user', parts: [{ text: systemPrompt }] },
            { role: 'model', parts: [{ text: "فهمت رسالتي ومهمتي. سأكون ناصحاً أميناً لطلاب العلم في منصة وقفة بإذن الله." }] },
            ...chatHistory
          ];

          const chat = model.startChat({
            history,
            generationConfig: {
              maxOutputTokens: 1000,
              temperature: 0.7,
            },
          });

          const result = await chat.sendMessage(input.trim());
          successfulResponse = await result.response;
          usedModel = modelName;
          break; // If successful, exit the loop
        } catch (err: any) {
          lastError = err;
          // Only continue if it's a 404 or model not found error
          const errStr = err.toString().toLowerCase();
          if (!errStr.includes("404") && !errStr.includes("not found")) {
            throw err; // Re-throw other types of errors (like 401/403)
          }
          console.warn(`Model ${modelName} failed, trying next...`, err);
        }
      }

      if (!successfulResponse) {
        throw lastError || new Error("FAILED_ALL_MODELS");
      }

      const text = successfulResponse.text();
      
      if (!text) {
        throw new Error("EMPTY_RESPONSE");
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: text,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error: any) {
      console.error("AI Error Details:", error);
      let errorMessageContent = "عذراً، حدث خطأ أثناء التواصل مع محرك الذكاء الاصطناعي.";
      
      const errorStr = error.toString() + (error.message || "");
      
      if (errorStr.includes("API_KEY_INVALID") || errorStr.includes("401") || errorStr.includes("403")) {
        errorMessageContent = "مفتاح الـ API غير صالح. تأكد من الحصول عليه من Google AI Studio حصراً. (تنبيه: نماذج 3.1 مثل Llama لا تعمل بهذا المفتاح).";
      } else if (errorStr.includes("404")) {
        errorMessageContent = "عذراً، النماذج المطلوبة غير متاحة لهذا المفتاح. تأكد من أنك تستخدم مفتاح Gemini API صالح وليس لمزود آخر.";
      } else if (errorStr.includes("blocked") || errorStr.includes("safety") || errorStr.includes("finish_reason: SAFETY")) {
        errorMessageContent = "عذراً، تم حجب الإجابة بواسطة مرشحات الأمان الخاصة بالمحرك. حاول تغيير صيغة السؤال.";
      } else if (errorStr.includes("quota") || errorStr.includes("429")) {
        errorMessageContent = "عذراً، لقد تجاوزت حصة الاستخدام المتاحة. يرجى المحاولة بعد دقيقة واحدة.";
      } else {
        errorMessageContent = `عذراً، حدث خطأ تقني: ${error.message || "فشل التواصل مع المحرك"}. يرجى مراجعة إعدادات المفتاح.`;
      }

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: errorMessageContent,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const clearChat = () => {
    setMessages([]);
  };

  return (
    <div className="fixed bottom-6 left-6 z-[100] pointer-events-none">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9, filter: 'blur(10px)' }}
            animate={{ 
              opacity: 1, 
              y: 0, 
              scale: 1, 
              filter: 'blur(0px)',
              height: isMinimized ? '80px' : 'min(700px, 85vh)'
            }}
            exit={{ opacity: 0, y: 20, scale: 0.9, filter: 'blur(10px)' }}
            className={cn(
              "pointer-events-auto w-[380px] md:w-[420px] bg-[#0a0a0a]/90 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col transition-all duration-500",
              isMinimized ? "mb-4" : "mb-6"
            )}
          >
            {/* Header */}
            <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-primary/20 border border-primary/20 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-primary animate-pulse" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white font-headline tracking-tight">وقفة AI</h3>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">المساعد الذكي</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button 
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="p-2 hover:bg-white/5 rounded-xl text-white/20 hover:text-white transition-all"
                >
                  {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
                </button>
                <button 
                  onClick={clearChat}
                  className="p-2 hover:bg-white/5 rounded-xl text-white/20 hover:text-white transition-all"
                  title="مسح المحادثة"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-white/5 rounded-xl text-white/20 hover:text-red-500 transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Chat Body */}
            {!isMinimized && (
              <div className="flex-1 flex flex-col min-h-0">
                <div 
                  ref={scrollRef}
                  className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar"
                >
                  {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center space-y-6 opacity-40">
                      <div className="w-20 h-20 rounded-[2rem] bg-white/5 flex items-center justify-center border border-white/10">
                        <Bot className="w-10 h-10" />
                      </div>
                      <div className="space-y-2">
                        <p className="text-xl font-black font-headline">أهلاً بك في وقفة AI</p>
                        <p className="text-xs font-medium max-w-[240px] mx-auto leading-relaxed">
                          أنا هنا لمساعدتك في رحلتك العلمية. كيف يمكنني خدمتك اليوم؟
                        </p>
                      </div>
                      {!aiApiKey && (
                        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 max-w-[280px]">
                           <div className="flex items-center gap-2 text-amber-500 mb-2 justify-center">
                             <AlertCircle className="w-4 h-4" />
                             <span className="text-[10px] font-black uppercase tracking-widest">تنبيه التقنية</span>
                           </div>
                           <p className="text-[10px] text-white/60 font-medium leading-relaxed mb-4">
                             للبدء في استخدام المساعد الذكي، يرجى إضافة مفتاح Gemini API الخاص بك في صفحة الإعدادات.
                           </p>
                           <Link href="/settings">
                             <Button size="sm" variant="outline" className="w-full h-10 rounded-xl border-amber-500/20 text-amber-500 hover:bg-amber-500 hover:text-black font-black">
                               انتقل للإعدادات
                             </Button>
                           </Link>
                        </div>
                      )}
                    </div>
                  ) : (
                    messages.map((msg) => (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        className={cn(
                          "flex gap-4 group/msg",
                          msg.role === 'user' ? "flex-row-reverse" : "flex-row"
                        )}
                      >
                        <div className={cn(
                          "w-10 h-10 rounded-2xl flex items-center justify-center border shrink-0",
                          msg.role === 'user' 
                            ? "bg-white/5 border-white/10" 
                            : "bg-primary/10 border-primary/20"
                        )}>
                          {msg.role === 'user' ? <User className="w-5 h-5 text-white/20" /> : <Sparkles className="w-5 h-5 text-primary" />}
                        </div>
                        <div className={cn(
                          "max-w-[80%] space-y-2",
                          msg.role === 'user' ? "items-end" : "items-start"
                        )}>
                          <div className={cn(
                            "p-5 rounded-[2rem] text-sm leading-relaxed relative",
                            msg.role === 'user' 
                              ? "bg-white/5 text-white rounded-tr-none" 
                              : "bg-primary/5 text-white/90 rounded-tl-none border border-primary/10"
                          )}>
                            {msg.content}
                            
                            {msg.role === 'assistant' && (
                              <button 
                                onClick={() => copyToClipboard(msg.content, msg.id)}
                                className="absolute -left-12 top-0 p-2 opacity-0 group-hover/msg:opacity-100 transition-opacity text-white/20 hover:text-white"
                                title="نسخ النص"
                              >
                                {copiedId === msg.id ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                              </button>
                            )}
                          </div>
                          <span className="text-[8px] font-black uppercase text-white/20 px-4 tracking-[0.2em]">
                            {msg.timestamp.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </motion.div>
                    ))
                  )}

                  {isLoading && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex gap-4"
                    >
                      <div className="w-10 h-10 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                        <Loader2 className="w-5 h-5 text-primary animate-spin" />
                      </div>
                      <div className="bg-primary/5 border border-primary/10 p-5 rounded-[2rem] rounded-tl-none flex items-center gap-3">
                         <div className="flex gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-bounce" />
                            <span className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-bounce [animation-delay:0.2s]" />
                            <span className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-bounce [animation-delay:0.4s]" />
                         </div>
                         <span className="text-[10px] font-black text-primary/60 uppercase tracking-widest">جاري التفكير...</span>
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Input Area */}
                <div className="p-6 bg-white/[0.02] border-t border-white/5">
                   <div className="relative group">
                      <Input 
                        placeholder={aiApiKey ? "اسأل وقفة AI..." : "يرجى إضافة مفتاح الـ API..."}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        disabled={!aiApiKey || isLoading}
                        className="h-16 pr-6 pl-20 bg-white/5 border-white/5 rounded-2xl focus:bg-white/10 focus:ring-8 focus:ring-primary/5 transition-all text-sm font-bold"
                      />
                      <div className="absolute left-2 top-1/2 -translate-y-1/2 flex gap-1">
                        <Button 
                          onClick={handleSend}
                          disabled={!input.trim() || !aiApiKey || isLoading}
                          className="w-12 h-12 rounded-xl bg-primary text-white shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all p-0"
                        >
                           {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                        </Button>
                      </div>
                   </div>
                   <div className="mt-4 flex items-center justify-between px-2">
                      <div className="flex items-center gap-2">
                        <Info className="w-3 h-3 text-white/20" />
                        <span className="text-[8px] font-bold text-white/20 uppercase tracking-widest">مدعوم بنموذج Gemini AI</span>
                      </div>
                      {!aiApiKey && (
                        <Link href="/settings" className="text-[8px] font-black text-primary uppercase tracking-widest hover:underline">
                           ضبط الإعدادات
                        </Link>
                      )}
                   </div>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Trigger Button */}
      <motion.button
        layout
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={cn(
          "pointer-events-auto w-16 h-16 md:w-20 md:h-20 rounded-[2rem] shadow-2xl flex items-center justify-center transition-all duration-500 relative group",
          isOpen 
            ? "bg-white text-black rotate-90" 
            : "bg-primary text-white shadow-primary/40 hover:shadow-primary/60"
        )}
      >
        <div className="absolute inset-0 bg-white/20 rounded-[2rem] animate-ping opacity-20 pointer-events-none group-hover:opacity-40" />
        {isOpen ? <X className="w-8 h-8" /> : <MessageSquare className="w-8 h-8 md:w-10 md:h-10" />}
        {!isOpen && !aiApiKey && (
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-amber-500 rounded-full border-4 border-zinc-950 flex items-center justify-center">
            <AlertCircle className="w-2.5 h-2.5 text-black" />
          </div>
        )}
      </motion.button>
    </div>
  );
}
