"use client";
import Link from "next/link";

import { motion, AnimatePresence } from "framer-motion";
import { 
  Shield, 
  Droplets, 
  BookOpen, 
  Heart, 
  CheckCircle2, 
  Sparkles, 
  ArrowRight, 
  ChevronLeft, 
  GraduationCap, 
  Star, 
  Info, 
  Trophy, 
  Video, 
  Volume2,
  VolumeX,
  Award,
  Download,
  Printer,
  Check,
  HelpCircle,
  AlertTriangle,
  Book as BookIcon 
} from "lucide-react";
import { useState, useEffect } from "react";
import { QiblaCompass } from "@/components/essentials/qibla-compass";
import { HolographicCards } from "@/components/aqeedah/holographic-cards";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useSync } from "@/hooks/useSync";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogTrigger 
} from "@/components/ui/dialog";
import confetti from "canvas-confetti";

const sections = [
  {
    id: "aqeedah",
    title: "أصول العقيدة",
    description: "معرفة الله ورسله واليوم الآخر وكل ما يجب الإيمان به.",
    icon: Shield,
    color: "from-blue-600 to-cyan-500",
    badge: "وسام الموحد",
    glowColor: "rgba(59,130,246,0.3)",
    items: [
      { 
        id: "a1", 
        title: "معنى كلمة التوحيد", 
        detail: "لا إله إلا الله هي مفتاح الجنة، وتعني أنه لا معبود بحق إلا الله وحده، وتتضمن النفي (لا إله) والإثبات (إلا الله).", 
        link: "/lectures/aqeedah-1",
        quiz: {
          question: "ما هو الركنان الأساسيان اللذان تتضمنهما كلمة التوحيد 'لا إله إلا الله'؟",
          options: [
            "النفي (لا إله) والإثبات (إلا الله) لتخصيص العبادة لله وحده",
            "الشك والرجاء لتوليد الإيمان القلبي",
            "المعرفة العقلية دون الحاجة للنطق اللساني"
          ],
          correctIndex: 0,
          explanation: "النفي في 'لا إله' ينفي استحقاق العبادة عن كل ما سوى الله، والإثبات في 'إلا الله' يثبت استحقاق العبادة لله وحده لا شريك له."
        }
      },
      { 
        id: "a2", 
        title: "أركان الإيمان الستة", 
        detail: "الإيمان بالله، وملائكته، وكتبه، ورسله، واليوم الآخر، والقدر خيره وشره كما علمنا النبي ﷺ في حديث جبريل المشهور.", 
        link: "/lectures/iman-pillars",
        quiz: {
          question: "ما هو الركن السادس من أركان الإيمان الستة؟",
          options: [
            "الإيمان باليوم الآخر",
            "الإيمان بالقدر خيره وشره",
            "الإيمان برسول الله محمد ﷺ"
          ],
          correctIndex: 1,
          explanation: "أركان الإيمان ستة: الإيمان بالله، وملائكته، وكتبه، ورسله، واليوم الآخر، والقدر خيره وشره."
        }
      },
      { 
        id: "a3", 
        title: "أسماء الله وصفاته", 
        detail: "إثبات ما أثبته الله لنفسه وما أثبته له رسوله ﷺ في النصوص الشرعية من غير تحريف ولا تعطيل ولا تكييف ولا تمثيل.", 
        link: "/books/names-of-allah",
        quiz: {
          question: "ما هو منهج أهل السنة والجماعة في التعامل مع أسماء الله وصفاته؟",
          options: [
            "تأويلها جميعاً بما يوافق العقل البشري فقط",
            "إثبات ما أثبته الله ورسوله بلا تمثيل، وتنزيهه بلا تعطيل",
            "تشبيه صفات الله بصفات خلقه لسهولة فهمها"
          ],
          correctIndex: 1,
          explanation: "المنهج الحق هو إثبات الأسماء والصفات كما وردت في القرآن والسنة إثباتاً بلا تمثيل (ليس كمثله شيء) وتنزيهاً بلا تعطيل."
        }
      },
      { 
        id: "a4", 
        title: "شروط قبول العمل", 
        detail: "لكي يقبل الله عملك لابد من شرطين أساسيين: الإخلاص (أن يكون لوجه الله وحده) والمتابعة (أن يكون موافقاً لسنة النبي ﷺ).", 
        link: "/lectures/sincerity",
        quiz: {
          question: "ما هما الشرطان المتلازمان لقبول أي عمل صالح عند الله تعالى؟",
          options: [
            "النية الحسنة وكثرة الناس المشاركين في العمل",
            "الإخلاص لله عز وجل، وموافقة العمل لسنة النبي ﷺ",
            "الصدقة الكبيرة والصلاة الطويلة دون شروط أخرى"
          ],
          correctIndex: 1,
          explanation: "لا يُقبل عمل عند الله إلا إذا كان خالصاً لوجهه الكريم (الإخلاص) وصواباً على هدي نبيه ﷺ (المتابعة)."
        }
      }
    ]
  },
  {
    id: "tahara",
    title: "فقه الطهارة",
    description: "تعلم أحكام الطهارة والوضوء وكيفية التطهر لتصح صلاتك وعبادتك.",
    icon: Droplets,
    color: "from-emerald-600 to-teal-500",
    badge: "وسام الطهارة",
    glowColor: "rgba(16,185,129,0.3)",
    items: [
      { 
        id: "t1", 
        title: "كيفية الوضوء الصحيح", 
        detail: "البدء بالنية والتسمية، غسل الوجه، اليدين للمرفقين، مسح الرأس والأذنين، وغسل الرجلين للكعبين، مع مراعاة الترتيب والموالاة.", 
        link: "/lectures/wudu",
        quiz: {
          question: "أي مما يلي يعد من فرائض الوضوء التي يبطل الوضوء بتركها؟",
          options: [
            "السواك ومسح الرقبة",
            "غسل الوجه واليدين للمرفقين ومسح الرأس وغسل الرجلين للكعبين",
            "المضمضة والاستنشاق ثلاثاً فقط دون غسل الوجه"
          ],
          correctIndex: 1,
          explanation: "فرائض الوضوء الستة هي: غسل الوجه (ومنه المضمضة والاستنشاق)، غسل اليدين للمرفقين، مسح الرأس كله (ومنه الأذنان)، غسل الرجلين للكعبين، الترتيب، والموالاة."
        }
      },
      { 
        id: "t2", 
        title: "موجبات الغسل الشرعي", 
        detail: "الأسباب التي توجب الطهارة الكبرى (الغسل): الجنابة، انقطاع الحيض والنفاس للمرأة، دخول الإسلام، والموت.", 
        link: "/lectures/ghusl",
        quiz: {
          question: "أي من الحالات التالية يوجب الغسل الكامل (الطهارة الكبرى)؟",
          options: [
            "أكل لحم الإبل أو لحوم البقر",
            "الجنابة، وانقطاع دم الحيض أو النفاس للمرأة",
            "النوم الخفيف أو خروج الريح"
          ],
          correctIndex: 1,
          explanation: "موجبات الغسل المتفق عليها هي: خروج المني بشهوة، التقاء الختانين (الجنابة)، الموت، الإسلام للكافر، والحيض والنفاس بعد انقطاعهما."
        }
      },
      { 
        id: "t3", 
        title: "أحكام النجاسات وتطهيرها", 
        detail: "تطهير الثوب والبدن ومكان الصلاة من النجاسات (كالبول، الغائط، والدم المسفوح) هو شرط أساسي لصحة الصلاة.", 
        link: "/lectures/purity",
        quiz: {
          question: "ما هو الشرط الأساسي المتعلق بالنجاسة لصحة الصلاة؟",
          options: [
            "تطهير البدن والثوب ومكان الصلاة من النجاسات العينية",
            "تبديل الملابس بالكامل قبل كل صلاة حتى لو كانت طاهرة",
            "رش المعطرات على الملابس دون غسل النجاسة"
          ],
          correctIndex: 0,
          explanation: "طهارة البدن وطهارة الثوب وطهارة البقعة (مكان الصلاة) هي شروط أساسية لابد من تحققها لصحة الصلاة."
        }
      },
      { 
        id: "t4", 
        title: "المسح على الخفين والجبيرة", 
        detail: "رخصة للمسلم أن يمسح بالماء على الجوارب أو الخفاف يوماً وليلة للمقيم، وثلاثة أيام للمسافر، بشرط أن يلبسها على طهارة كاملة.", 
        link: "/lectures/khuff",
        quiz: {
          question: "ما هي المدة الشرعية المرخصة للمسح على الخفين أو الجوارب للمسافر؟",
          options: [
            "يوم واحد وليلة واحدة (24 ساعة)",
            "ثلاثة أيام بلياليهن (72 ساعة)",
            "أسبوع كامل بشرط عدم نزع الجورب"
          ],
          correctIndex: 1,
          explanation: "رخص الإسلام للمقيم أن يمسح يوماً وليلة، وللمسافر ثلاثة أيام بلياليهن تبدأ من أول مسح بعد الحدث."
        }
      }
    ]
  },
  {
    id: "salah",
    title: "فقه الصلاة",
    description: "تعلم أركان الصلاة، واجباتها، مبطلاتها، وكيفية الخشوع فيها.",
    icon: BookOpen,
    color: "from-amber-600 to-orange-500",
    badge: "وسام المصلين",
    glowColor: "rgba(245,158,11,0.3)",
    items: [
      { 
        id: "s1", 
        title: "أركان الصلاة وواجباتها", 
        detail: "الأركان لا تسقط سهواً كالفاتحة والركوع والسجود، والواجبات تسقط بالسهو وتجبر بسجود السهو كالتسبيح والتشهد الأول.", 
        link: "/lectures/salah-pillars",
        quiz: {
          question: "ما الذي يميز ركن الصلاة (مثل السجود) عن واجب الصلاة (مثل تكبيرات الانتقال)؟",
          options: [
            "الركن لا يسقط عمداً ولا سهواً ويجب الإتيان به، أما الواجب فيسقط بالنسيان ويجبره سجود السهو",
            "الركن مستحب فقط ويسهل تركه، والواجب فرض عين قاطع",
            "لا يوجد أي فرق بينهما في الأحكام والتأثير على صحة الصلاة"
          ],
          correctIndex: 0,
          explanation: "الركن جزء أساسي من الصلاة لا تسقط بحال ويجب تداركها إن نسيت، أما الواجب فإذا نسي سقط وعُوّض بسجود السهو في نهاية الصلاة."
        }
      },
      { 
        id: "s2", 
        title: "مبطلات الصلاة الأساسية", 
        detail: "الأمور التي تفسد الصلاة وتوجب إعادتها: الأكل والشرب عمداً، الكلام العمد، الحركة الكثيرة لغير حاجة، وانتقاض الطهارة.", 
        link: "/lectures/invalid-salah",
        quiz: {
          question: "أي من الأفعال التالية يبطل الصلاة ويوجب إعادتها فوراً؟",
          options: [
            "التبسم الخفيف أو التثاؤب مع كتمه",
            "الكلام العمد لغير مصلحة الصلاة، أو الضحك بصوت (القهقهة)",
            "الحركة اليسيرة لإصلاح مكان السجود"
          ],
          correctIndex: 1,
          explanation: "من مبطلات الصلاة المتفق عليها: الكلام العمد لغير مصلحة الصلاة، الضحك بصوت (القهقهة)، الأكل والشرب عمداً، وانتقاض الطهارة."
        }
      },
      { 
        id: "s3", 
        title: "أحكام صلاة الجماعة", 
        detail: "صلاة الجماعة تفضل صلاة الفرد بسبع وعشرين درجة، وهي واجبة على الرجال المقيمين القادرين في المسجد.", 
        link: "/lectures/jamaah",
        quiz: {
          question: "بكم تفضل صلاة الجماعة صلاة الفرد كما أخبر النبي ﷺ؟",
          options: [
            "بسبع درجات فقط",
            "بسبع وعشرين درجة",
            "بصلاة خمسين يوماً"
          ],
          correctIndex: 1,
          explanation: "قال رسول الله ﷺ: 'صَلاةُ الجَماعَةِ تَفْضُلُ صَلاةَ الفَذِّ بسَبْعٍ وعِشْرِينَ دَرَجَةً'."
        }
      },
      { 
        id: "s4", 
        title: "الخشوع وطمأنينة الصلاة", 
        detail: "الخشوع هو روح الصلاة، ويتحقق باستحضار عظمة الخالق، تدبر المعاني والآيات، والابتعاد عن العجلة والسرعة.", 
        link: "/lectures/khushua",
        quiz: {
          question: "ما هو المفهوم الشرعي للطمأنينة التي تعتبر ركناً من أركان الصلاة؟",
          options: [
            "العجلة في الانتقال بين الركوع والسجود لكسب الوقت",
            "استقرار الأعضاء وسكونها في كل ركن بقدر الذكر الواجب على الأقل",
            "الصلاة أثناء التفكير في شؤون الدنيا دون انتباه"
          ],
          correctIndex: 1,
          explanation: "الطمأنينة ركن أساسي، وتعني سكون الأعضاء واستقرارها في الركوع والرفع والسجود والجلوس حتى يرجع كل عظم لموضعه."
        }
      }
    ]
  },
  {
    id: "akhlaq",
    title: "الآداب والأخلاق",
    description: "جوهر المعاملة الإسلامية وحسن الخلق مع الله ومع الخلق.",
    icon: Heart,
    color: "from-rose-600 to-pink-500",
    badge: "وسام المحسنين",
    glowColor: "rgba(244,63,94,0.3)",
    items: [
      { 
        id: "e1", 
        title: "بر الوالدين والإحسان لهما", 
        detail: "أعظم الحقوق بعد حق الله تعالى ورسوله، ويكون بطاعتهما بالمعروف، والإنفاق عليهما، وخفض جناح الذل لهما رحمة ورعاية.", 
        link: "/lectures/parents",
        quiz: {
          question: "ما رتبة بر الوالدين في الإسلام مقارنة بالعبادات الأخرى؟",
          options: [
            "أمر ثانوي مخير فيه المسلم حسب رغبته",
            "قرنه الله تعالى بعبادته وتوحيده في آيات عديدة لدلالة عظمه وجلاله",
            "حق يقتصر على الإنفاق المالي دون الحاجة للاحترام النفسي"
          ],
          correctIndex: 1,
          explanation: "قرن الله بر الوالدين بتوحيده فقال سبحانه: 'وَقَضَى رَبُّكَ أَلَّا تَعْبُدُوا إِلَّا إِيَّاهُ وَبِالْوَالِدَيْنِ إِحْسَانًا'."
        }
      },
      { 
        id: "e2", 
        title: "الصدق وحفظ الأمانة", 
        detail: "من أعظم خصال الإيمان المفضية للجنة، بينما الكذب والخيانة والغدر من أصول النفاق العملي التي حذر منها الإسلام.", 
        link: "/lectures/honesty",
        quiz: {
          question: "أي من الصفات التالية اعتبرها النبي ﷺ من علامات المنافق الصريحة؟",
          options: [
            "الخوف والتردد في المواقف الصعبة",
            "إذا حدّث كذب، وإذا وعد أخلف، وإذا اؤتمن خان",
            "كثرة السفر والتنقل في طلب الرزق"
          ],
          correctIndex: 1,
          explanation: "قال رسول الله ﷺ: 'آية المنافق ثلاث: إذا حدث كذب، وإذا وعد أخلف، وإذا اؤتمن خان'."
        }
      },
      { 
        id: "e3", 
        title: "حفظ اللسان من آفاته", 
        detail: "المسلم الحقيقي من سلم الناس من لسانه ويده، والغيبة والنميمة والسب والقذف من كبائر الذنوب التي تمحق الحسنات.", 
        link: "/lectures/tongue",
        quiz: {
          question: "ما هو التعريف النبوي الدقيق لـ 'الغيبة' التي نهى الله عنها؟",
          options: [
            "ذكرك أخاك بما يكره في غيبته وإن كان فيه ما تقول",
            "مدح الشخص والثناء عليه في غيابه ليفرح",
            "اختلاق أكاذيب عن شخص ميت لا يمكنه الدفاع عن نفسه"
          ],
          correctIndex: 0,
          explanation: "سئل النبي ﷺ عن الغيبة فقال: 'ذكرك أخاك بما يكره'، قيل: أفرأيت إن كان في أخي ما أقول؟ قال: 'إن كان فيه ما تقول فقد اغتبته، وإن لم يكن فيه فقد بهتَّه'."
        }
      },
      { 
        id: "e4", 
        title: "حق الجوار والإحسان للجار", 
        detail: "أوصى جبريل عليه السلام بالنبي ﷺ بالجار إحساناً ورعايةً حتى ظن أنه سيورثه، وكف الأذى عنه شرط من شروط الإيمان.", 
        link: "/lectures/neighbors",
        quiz: {
          question: "ما هي حدود التعامل الواجبة مع الجار لتأكيد الإيمان كما أخبر النبي ﷺ؟",
          options: [
            "كف الأذى عنه بالكامل والإحسان إليه ومواساته بالمعروف",
            "تجنب رؤيته أو التحدث معه مطلقاً لعدم إزعاجه",
            "إعانته على المحرمات ومجاملته في المنكر"
          ],
          correctIndex: 0,
          explanation: "قال النبي ﷺ: 'والله لا يؤمن، والله لا يؤمن، والله لا يؤمن'، قيل: من يا رسول الله؟ قال: 'الذي لا يأمن جاره بوائقه' (أي غدره وأذاه)."
        }
      }
    ]
  }
];

export default function EssentialsPage() {
  const { toast } = useToast();
  const { state: userState, updateState: syncUpdate } = useSync();
  const [activeItem, setActiveItem] = useState<any>(null);
  const [speakingId, setSpeakingId] = useState<string | null>(null);

  // Quiz interactive states
  const [quizActive, setQuizActive] = useState<boolean>(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [quizAnswered, setQuizAnswered] = useState<boolean>(false);
  const [quizCorrect, setQuizCorrect] = useState<boolean>(false);

  // Certificate states
  const [showCertificate, setShowCertificate] = useState<boolean>(false);
  const [studentName, setStudentName] = useState<string>("طالب العلم");

  // Derived state from sync hook
  const completedMap = userState.essentialsProgress || {};
  const completed = Object.keys(completedMap).filter(id => completedMap[id]);

  const toggleItemDirectly = (itemId: string, sectionId: string) => {
    const isNowCompleted = !completedMap[itemId];
    const newCompletedMap = { ...completedMap, [itemId]: isNowCompleted };
    
    syncUpdate({ essentialsProgress: newCompletedMap });

    if (isNowCompleted) {
      triggerSuccessEffects(sectionId, newCompletedMap);
    } else {
      toast({
        title: "تم إلغاء الإنجاز ↩️",
        description: "تمت إزالة علامة الإتمام عن هذا القسم.",
      });
    }
  };

  const triggerSuccessEffects = (sectionId: string, currentCompletedMap: Record<string, boolean>) => {
    const section = sections.find(s => s.id === sectionId);
    const sectionItemIds = section?.items.map(i => i.id) || [];
    const allCompleted = sectionItemIds.every(id => currentCompletedMap[id]);

    if (allCompleted) {
      confetti({
        particleCount: 180,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#10b981', '#3b82f6', '#f59e0b', '#ec4899']
      });
      toast({
        title: `تهانينا! حصلت على ${section?.badge} 🏆`,
        description: `لقد أتممت دراسة قسم (${section?.title}) واجتزت تحدياته بالكامل.`,
      });
    } else {
      toast({
        title: "إجابة صحيحة وتم الإنجاز! 🎉",
        description: "خطوة مباركة أخرى في طريق العلم والعمل.",
      });
    }
  };

  const startQuiz = (item: any) => {
    setSelectedOption(null);
    setQuizAnswered(false);
    setQuizCorrect(false);
    setQuizActive(true);
  };

  const handleOptionClick = (idx: number) => {
    if (quizAnswered) return;
    setSelectedOption(idx);
  };

  const submitQuizAnswer = (item: any, sectionId: string) => {
    if (selectedOption === null || quizAnswered) return;
    
    const isCorrect = selectedOption === item.quiz.correctIndex;
    setQuizCorrect(isCorrect);
    setQuizAnswered(true);

    if (isCorrect) {
      // Mark as completed
      const newCompletedMap = { ...completedMap, [item.id]: true };
      syncUpdate({ essentialsProgress: newCompletedMap });
      triggerSuccessEffects(sectionId, newCompletedMap);
    }
  };

  const playTTS = (text: string, itemId: string) => {
    if (typeof window === 'undefined') return;
    
    if (speakingId === itemId) {
      window.speechSynthesis.cancel();
      setSpeakingId(null);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ar-SA';
    utterance.rate = 0.95;
    
    utterance.onend = () => setSpeakingId(null);
    utterance.onerror = () => setSpeakingId(null);

    setSpeakingId(itemId);
    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined') {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const totalItems = sections.reduce((acc, s) => acc + s.items.length, 0);
  const progressPercent = Math.round((completed.length / totalItems) * 100);

  return (
    <div className="min-h-screen pb-32 overflow-x-hidden relative bg-zinc-950 text-white selection:bg-primary selection:text-primary-foreground print:bg-white print:text-black">
      {/* 🏛️ Premium Hero Section */}
      <section className="relative min-h-[85vh] flex flex-col items-center justify-center text-center px-4 overflow-hidden pt-20 print:hidden">
        <div className="absolute inset-0 bg-zinc-950">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.18)_0%,transparent_70%)] opacity-60 animate-pulse" />
          <motion.div 
            animate={{ scale: [1, 1.15, 1], opacity: [0.2, 0.4, 0.2] }}
            transition={{ duration: 12, repeat: Infinity }}
            className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-primary/10 rounded-full blur-[140px]" 
          />
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 space-y-12 max-w-5xl mx-auto"
        >
          <div className="inline-flex items-center gap-3 px-6 py-2.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl text-primary text-xs font-black uppercase tracking-[0.3em] shadow-glow-primary">
            <Trophy className="w-5 h-5 fill-primary text-primary animate-bounce" />
            منهج طالب العلم المبتدئ الشامل
          </div>
          
          <div className="space-y-6">
            <h1 className="text-6xl md:text-8xl font-black font-headline tracking-tighter text-white leading-tight">
              ما لا يسع <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-emerald-400 to-violet-400 animate-gradient font-extrabold">المسلم</span> جهله
            </h1>
          </div>

          <p className="text-xl md:text-2xl text-white/50 max-w-3xl mx-auto font-medium leading-relaxed italic">
            تعلم أركان عقيدتك، فقه طهارتك وصلاتك، وآداب دينك من خلال منهجية تفاعلية مدعومة بالأسئلة والمشغلات الصوتية.
          </p>
          
          {/* 📊 Immersive Progress Tracker */}
          <div className="max-w-2xl mx-auto pt-8">
            <div className="flex justify-between items-end mb-4">
              <div className="flex flex-col items-start text-right">
                <span className="text-[10px] font-black uppercase tracking-widest text-white/30">الرتبة العلمية الحالية</span>
                <span className="text-2xl font-black text-white flex items-center gap-2">
                  <Award className={cn("w-6 h-6", progressPercent === 100 ? "text-yellow-400 animate-spin-slow" : "text-primary")} />
                  {progressPercent === 100 
                    ? "عالم بالأساسيات ومجاز 🎓" 
                    : progressPercent >= 75 
                    ? "طالب علم مجتهد ومتميز" 
                    : progressPercent >= 25 
                    ? "طالب علم مبتدئ مستمر" 
                    : "مقبل على العلم والهدى"}
                </span>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-5xl font-black text-primary tracking-tighter drop-shadow-glow-primary">{progressPercent}%</span>
              </div>
            </div>
            <div className="h-5 w-full bg-white/5 rounded-full overflow-hidden border border-white/10 p-1">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                className="h-full bg-gradient-to-r from-primary via-emerald-400 to-violet-500 rounded-full relative"
              >
                <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.25)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.25)_50%,rgba(255,255,255,0.25)_75%,transparent_75%,transparent)] bg-[length:25px_25px] animate-shimmer" />
              </motion.div>
            </div>
          </div>
        </motion.div>
        
        {/* Scroll Indicator */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 opacity-35 animate-bounce">
          <div className="w-1 h-14 rounded-full bg-gradient-to-b from-primary to-transparent" />
        </div>
      </section>

      {/* 🧭 Qibla Compass & Badges Dashboard */}
      <div className="container px-4 mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 mb-24 items-stretch print:hidden">
        {/* Qibla Compass Panel */}
        <div className="lg:col-span-1 h-full">
          <QiblaCompass />
        </div>

        {/* Dynamic Achievements Dashboard */}
        <div className="lg:col-span-2 p-10 bg-white/[0.02] border border-white/5 rounded-[2.5rem] flex flex-col justify-between relative overflow-hidden backdrop-blur-2xl">
          <div className="absolute -top-10 -right-10 w-48 h-48 bg-primary/5 rounded-full blur-3xl" />
          <div className="space-y-6">
            <h3 className="text-2xl font-black flex items-center gap-2">
              <Award className="w-6 h-6 text-primary" />
              لوحة الأوسمة والمكتسبات
            </h3>
            <p className="text-white/40 text-sm leading-relaxed">
              عند إتمامك لجميع عناصر كل قسم بالكامل وحل أسئلة الفهم، سيتم تفعيل وسام الشرف الخاص بذلك العلم. اجمع الأوسمة الأربعة للحصول على الإجازة الشرفية للمنهج.
            </p>
          </div>

          {/* Badges Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 my-8">
            {sections.map(section => {
              const sectionItemIds = section.items.map(i => i.id);
              const isSectionDone = sectionItemIds.every(id => completed.includes(id));
              
              return (
                <div 
                  key={section.id} 
                  className={cn(
                    "flex flex-col items-center justify-center p-5 rounded-2xl border text-center transition-all duration-500 relative group/badge",
                    isSectionDone 
                      ? "bg-gradient-to-br bg-white/[0.04] border-primary/20 shadow-lg shadow-primary/5 scale-105" 
                      : "bg-white/[0.01] border-white/5 opacity-40 hover:opacity-60"
                  )}
                >
                  <div className={cn(
                    "w-16 h-16 rounded-2xl flex items-center justify-center mb-3 shadow-xl transition-all duration-500",
                    isSectionDone 
                      ? "bg-gradient-to-br " + section.color + " text-white animate-pulse" 
                      : "bg-white/5 text-white/20"
                  )}>
                    <section.icon className="w-8 h-8" />
                  </div>
                  <span className={cn("text-xs font-black", isSectionDone ? "text-white" : "text-white/40")}>{section.badge}</span>
                  <p className="text-[9px] font-bold text-muted-foreground mt-1">
                    {isSectionDone ? "مكتمل ومكتسب ✅" : "قيد الإنجاز ⏳"}
                  </p>
                  
                  {isSectionDone && (
                    <div className="absolute top-1.5 right-1.5 bg-yellow-400 text-black p-0.5 rounded-full">
                      <Check className="w-3 h-3 font-black" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-white/5">
            <span className="text-xs text-white/40 font-bold">الأوسمة المجمعة: {sections.filter(s => s.items.map(i => i.id).every(id => completed.includes(id))).length} / 4</span>
            {progressPercent === 100 ? (
              <Button onClick={() => setShowCertificate(true)} className="rounded-xl font-black bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 text-black text-xs px-5 py-2.5 shadow-lg shadow-yellow-500/10">
                🎓 عرض وتحميل الإجازة العلمية
              </Button>
            ) : (
              <span className="text-xs text-primary font-bold animate-pulse">أكمل المنهج 100% لتفعيل شهادتك</span>
            )}
          </div>
        </div>
      </div>

      {/* 🔮 Holographic Aqeedah Cards */}
      <div className="mb-24 print:hidden">
        <HolographicCards />
      </div>

      {/* 🧩 Interactive Grid */}
      <div className="container px-4 mx-auto print:block">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {sections.map((section, idx) => {
            const sectionItemIds = section.items.map(i => i.id);
            const isCompleted = sectionItemIds.every(id => completed.includes(id));
            
            return (
              <motion.div
                key={section.id}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="group relative print:break-inside-avoid print:my-4"
              >
                {/* 🏅 Achievement Badge */}
                <AnimatePresence>
                  {isCompleted && (
                    <motion.div 
                      initial={{ scale: 0, rotate: -45 }}
                      animate={{ scale: 1, rotate: 0 }}
                      className="absolute -top-6 -right-6 z-40 bg-gradient-to-br from-yellow-400 to-orange-500 p-4 rounded-3xl shadow-2xl shadow-yellow-500/20 border-4 border-zinc-950 print:hidden"
                    >
                      <Trophy className="w-8 h-8 text-black" />
                      <div className="absolute -bottom-8 right-0 whitespace-nowrap bg-zinc-900 text-yellow-500 text-[10px] font-black px-3 py-1 rounded-full border border-yellow-500/20 uppercase tracking-widest">{section.badge}</div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <Card className={cn(
                  "h-full border-white/5 bg-white/[0.02] backdrop-blur-3xl rounded-[3rem] overflow-hidden transition-all duration-700 relative print:bg-white print:border-black/10 print:text-black",
                  isCompleted ? "border-primary/40 bg-primary/5" : "hover:border-white/20"
                )}>
                  <CardContent className="p-8 md:p-12 space-y-10">
                    <div className="flex items-start justify-between">
                      <div className="space-y-4">
                        <div className={cn("inline-flex p-4 rounded-[2rem] bg-gradient-to-br shadow-2xl print:hidden", section.color)}>
                          <section.icon className="w-10 h-10 text-white" />
                        </div>
                        <h2 className="text-4xl font-black font-headline text-white print:text-black">{section.title}</h2>
                      </div>
                      <div className="text-6xl font-black text-white/5 font-mono select-none print:text-black/5">0{idx + 1}</div>
                    </div>

                    <p className="text-lg text-white/40 font-medium leading-relaxed italic print:text-black/60">{section.description}</p>

                    <div className="grid grid-cols-1 gap-4 pt-4">
                      {section.items.map((item) => {
                        const isItemDone = completed.includes(item.id);
                        return (
                          <div key={item.id} className="relative group/item print:border-b print:pb-3">
                            <div
                              className={cn(
                                "w-full flex items-center justify-between p-6 rounded-[1.5rem] border transition-all duration-500 text-right pr-16 pl-14",
                                isItemDone 
                                  ? "bg-primary/10 border-primary/20 text-white print:text-black" 
                                  : "bg-white/5 border-white/5 text-white/60 hover:bg-white/10 hover:border-white/10 print:bg-transparent print:text-black"
                              )}
                            >
                              <span className="text-lg font-black">{item.title}</span>
                              
                              <div className="flex items-center gap-3">
                                {/* TTS speaker button */}
                                <button 
                                  onClick={(e) => { e.stopPropagation(); playTTS(item.detail, item.id); }}
                                  className={cn(
                                    "p-2 rounded-xl transition-all print:hidden",
                                    speakingId === item.id 
                                      ? "bg-primary/20 text-primary animate-pulse" 
                                      : "bg-white/5 text-white/30 hover:text-white hover:bg-white/10"
                                  )}
                                  title="استمع إلى الشرح الصوتي الميسر"
                                >
                                  {speakingId === item.id ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                                </button>
                                
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <button 
                                      onClick={() => startQuiz(item)}
                                      className="p-2 rounded-xl bg-white/5 text-white/20 hover:text-primary hover:bg-primary/10 transition-all opacity-0 group-hover/item:opacity-100 print:hidden"
                                    >
                                      <Info className="w-5 h-5" />
                                    </button>
                                  </DialogTrigger>
                                  <DialogContent className="bg-zinc-950 border-white/10 max-w-lg rounded-[2.5rem] p-8 text-right overflow-hidden shadow-2xl relative">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl" />
                                    
                                    {!quizActive ? (
                                      <div className="space-y-6">
                                        <div className={cn("w-16 h-16 rounded-2xl bg-gradient-to-br flex items-center justify-center shadow-lg", section.color)}>
                                          <Info className="w-8 h-8 text-white" />
                                        </div>
                                        <DialogTitle className="text-3xl font-black font-headline text-white">{item.title}</DialogTitle>
                                        <DialogDescription className="text-lg text-white/70 leading-relaxed font-medium">
                                          {item.detail}
                                        </DialogDescription>
                                        
                                        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
                                          <Button variant="outline" className="rounded-2xl h-14 font-bold border-white/10 hover:bg-white/5" asChild>
                                            <a href={item.link}><Video className="ml-2 w-4 h-4 text-rose-500" /> درس مرئي</a>
                                          </Button>
                                          <Button className="rounded-2xl h-14 font-bold" asChild>
                                            <Link href="/books"><BookIcon className="ml-2 w-4 h-4 text-amber-500" /> كتاب إضافي</Link>
                                          </Button>
                                        </div>

                                        <Button 
                                          onClick={() => setQuizActive(true)}
                                          className="w-full rounded-2xl h-14 font-black bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white mt-4 shadow-lg shadow-violet-500/10 flex items-center justify-center gap-2"
                                        >
                                          <HelpCircle className="w-5 h-5" />
                                          🎯 خض تحدي الفهم لفتح هذا القسم
                                        </Button>
                                      </div>
                                    ) : (
                                      <div className="space-y-6">
                                        <div className="flex items-center justify-between border-b border-white/5 pb-4">
                                          <DialogTitle className="text-2xl font-black font-headline text-white flex items-center gap-2">
                                            <HelpCircle className="w-6 h-6 text-violet-400" />
                                            سؤال تحدي الفهم
                                          </DialogTitle>
                                          <Button 
                                            variant="ghost" 
                                            onClick={() => setQuizActive(false)} 
                                            className="text-xs text-white/40 hover:text-white"
                                          >
                                            ← العودة للشرح
                                          </Button>
                                        </div>

                                        <p className="text-lg font-bold text-white/90 leading-relaxed mb-4">
                                          {item.quiz.question}
                                        </p>

                                        <div className="space-y-3">
                                          {item.quiz.options.map((opt: string, oIdx: number) => (
                                            <button
                                              key={oIdx}
                                              onClick={() => handleOptionClick(oIdx)}
                                              className={cn(
                                                "w-full text-right p-4 rounded-xl border text-sm font-semibold transition-all duration-300",
                                                quizAnswered
                                                  ? oIdx === item.quiz.correctIndex
                                                    ? "bg-emerald-500/20 border-emerald-500 text-emerald-300"
                                                    : selectedOption === oIdx
                                                    ? "bg-rose-500/20 border-rose-500 text-rose-300"
                                                    : "bg-white/[0.01] border-white/5 text-white/40"
                                                  : selectedOption === oIdx
                                                  ? "bg-violet-500/20 border-violet-500 text-violet-300 scale-[1.02]"
                                                  : "bg-white/5 border-white/5 text-white/70 hover:bg-white/10 hover:border-white/10"
                                              )}
                                              disabled={quizAnswered}
                                            >
                                              <div className="flex items-center justify-between">
                                                <span>{opt}</span>
                                                <div className={cn(
                                                  "w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 mr-3",
                                                  selectedOption === oIdx ? "border-violet-400 bg-violet-400/20" : "border-white/10"
                                                )}>
                                                  {selectedOption === oIdx && <div className="w-2.5 h-2.5 rounded-full bg-violet-400" />}
                                                </div>
                                              </div>
                                            </button>
                                          ))}
                                        </div>

                                        <AnimatePresence>
                                          {quizAnswered && (
                                            <motion.div 
                                              initial={{ opacity: 0, y: 10 }}
                                              animate={{ opacity: 1, y: 0 }}
                                              className={cn(
                                                "p-4 rounded-xl border flex items-start gap-3 mt-4 text-xs leading-relaxed",
                                                quizCorrect 
                                                  ? "bg-emerald-500/5 border-emerald-500/10 text-emerald-400" 
                                                  : "bg-rose-500/5 border-rose-500/10 text-rose-400"
                                              )}
                                            >
                                              {quizCorrect ? (
                                                <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                              ) : (
                                                <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                              )}
                                              <div>
                                                <span className="font-bold block mb-1">
                                                  {quizCorrect ? "أحسنت! إجابة صحيحة." : "لم توفق في هذه المحاولة."}
                                                </span>
                                                {item.quiz.explanation}
                                              </div>
                                            </motion.div>
                                          )}
                                        </AnimatePresence>

                                        <div className="pt-4 border-t border-white/5 flex gap-3">
                                          {!quizAnswered ? (
                                            <Button 
                                              onClick={() => submitQuizAnswer(item, section.id)}
                                              disabled={selectedOption === null}
                                              className="w-full rounded-xl h-12 font-black bg-violet-600 hover:bg-violet-500 text-white"
                                            >
                                              إرسال الإجابة وتدقيقها
                                            </Button>
                                          ) : (
                                            <Button 
                                              onClick={() => {
                                                if (!quizCorrect) {
                                                  setSelectedOption(null);
                                                  setQuizAnswered(false);
                                                } else {
                                                  setQuizActive(false);
                                                }
                                              }}
                                              className={cn(
                                                "w-full rounded-xl h-12 font-black",
                                                quizCorrect ? "bg-emerald-600 hover:bg-emerald-500 text-white" : "bg-white/10 hover:bg-white/15 text-white"
                                              )}
                                            >
                                              {quizCorrect ? "إغلاق التحدي" : "حاول مجدداً"}
                                            </Button>
                                          )}
                                        </div>
                                      </div>
                                    )}
                                  </DialogContent>
                                </Dialog>
                              </div>
                            </div>
                            
                            {/* Checkmark Circle (Direct toggle option) */}
                            <div 
                              onClick={(e) => { e.stopPropagation(); toggleItemDirectly(item.id, section.id); }}
                              className={cn(
                                "absolute right-5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all cursor-pointer z-10 print:hidden",
                                isItemDone ? "bg-primary border-primary scale-110" : "border-white/10 hover:border-primary/40"
                              )}
                              title="اضغط للتأشير مباشرة دون خوض التحدي"
                            >
                              {isItemDone && <CheckCircle2 className="w-5 h-5 text-black font-bold" />}
                            </div>

                            {/* Print layout Checkbox placeholder */}
                            <div className="hidden print:block absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 border border-black rounded flex items-center justify-center">
                              {isItemDone && <span className="font-bold text-xs text-black">✓</span>}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* 🎓 Master Completion UI */}
        {progressPercent === 100 && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-32 p-12 md:p-20 rounded-[4rem] bg-gradient-to-br from-primary via-emerald-500 to-violet-600 text-center space-y-10 relative overflow-hidden shadow-[0_0_100px_rgba(var(--primary-rgb),0.25)] print:hidden"
          >
            <Sparkles className="absolute -top-20 -left-20 w-80 h-80 text-white/10 animate-spin-slow pointer-events-none" />
            <div className="inline-flex p-8 rounded-[3rem] bg-white text-black shadow-2xl scale-125">
              <GraduationCap className="w-20 h-20" />
            </div>
            <div className="space-y-4">
              <h2 className="text-5xl md:text-7xl font-black font-headline text-black italic uppercase leading-none">تم إنجاز المنهج بالكامل!</h2>
              <p className="text-xl text-black font-black uppercase tracking-widest opacity-85">أهلاً ومرحباً بك في ركاب طلبة العلم</p>
            </div>
            <p className="text-xl md:text-2xl text-black/75 max-w-3xl mx-auto font-bold leading-relaxed">
              "مَنْ سَلَكَ طَرِيقًا يَلْتَمِسُ فِيهِ عِلْمًا سَهَّلَ اللَّهُ لَهُ بِهِ طَرِيقًا إِلَى الْجَنَّةِ"
              <br />
              <span className="opacity-70 text-lg md:text-xl font-semibold mt-4 block">
                لقد أتممت دراسة أساسيات العقيدة والطهارت والصلوات والأخلاق والآداب، واجتزت جميع تحديات الفهم بنجاح. أنت الآن مهيأ للانتقال للمسارات المتقدمة.
              </span>
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-10">
              <Button size="lg" className="rounded-2xl px-12 h-20 text-2xl font-black bg-zinc-950 text-white hover:bg-zinc-900 shadow-2xl" asChild>
                <Link href="/lectures">ابدأ المسار المتقدم</Link>
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="rounded-2xl px-12 h-20 text-2xl font-black border-black/20 bg-transparent text-black hover:bg-black/10 transition-all" 
                onClick={() => setShowCertificate(true)}
              >
                تحميل شهادة الإنجاز والإجازة
              </Button>
            </div>
          </motion.div>
        )}
      </div>

      {/* 📜 Printable Fullscreen 3D Certificate Modal */}
      <AnimatePresence>
        {showCertificate && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[120] bg-black/90 backdrop-blur-2xl flex items-center justify-center p-4 md:p-8 overflow-y-auto"
          >
            <div className="max-w-4xl w-full bg-zinc-950 border border-white/10 rounded-[3rem] p-8 md:p-12 space-y-8 relative shadow-3xl text-right my-8 print:border-none print:bg-white print:text-black print:p-0 print:my-0">
              <div className="absolute top-6 left-6 z-[130] print:hidden">
                <Button 
                  variant="ghost" 
                  onClick={() => setShowCertificate(false)} 
                  className="rounded-full w-12 h-12 flex items-center justify-center bg-white/5 border border-white/10 text-white hover:bg-white/10"
                >
                  ✕
                </Button>
              </div>

              <div className="space-y-4 print:hidden">
                <h3 className="text-3xl font-black text-white">تحميل إجازتك العلمية الشرفية</h3>
                <p className="text-white/50 text-sm">أدخل اسمك الكريم في الحقل أدناه ليتم وضعه على الشهادة تلقائياً، ثم قم بطباعتها أو حفظها كملف PDF.</p>
                <div className="flex gap-4 items-center">
                  <input
                    type="text"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    placeholder="اكتب اسمك الثلاثي هنا..."
                    className="flex-1 bg-white/5 border border-white/10 rounded-2xl h-14 px-6 text-lg font-bold text-white focus:outline-none focus:border-primary transition-all"
                  />
                  <Button 
                    onClick={() => window.print()} 
                    className="rounded-2xl h-14 px-8 font-black bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 text-black flex items-center gap-2"
                  >
                    <Printer className="w-5 h-5" />
                    طباعة الشهادة
                  </Button>
                </div>
              </div>

              {/* 📜 The Certificate Design Block */}
              <div id="certificate-print-area" className="border-8 border-double border-yellow-500/40 p-8 md:p-14 bg-gradient-to-b from-[#0b0c10] to-[#12131a] rounded-[2rem] text-center space-y-8 relative overflow-hidden shadow-2xl print:bg-white print:text-black print:border-yellow-600 print:rounded-none print:shadow-none">
                {/* Islamic Calligraphic Background Seal */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-5 pointer-events-none text-[30vw] font-headline select-none text-yellow-500 print:text-black/5">
                  العلم
                </div>

                <div className="flex items-center justify-between border-b border-yellow-500/20 pb-6 print:border-yellow-600/30">
                  <span className="text-xs font-black text-yellow-500/60 uppercase tracking-widest font-mono">ID: {completed.length}/{totalItems}-ESS</span>
                  <div className="text-right">
                    <h4 className="text-xl font-black text-white font-headline tracking-wide print:text-black">منصة وقفة</h4>
                    <p className="text-[10px] text-white/40 font-bold print:text-black/40">تنمية وتأهيل المسلم المعاصر</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <span className="inline-flex p-4 rounded-full bg-yellow-500/10 text-yellow-400 animate-pulse print:bg-yellow-600/10 print:text-yellow-700">
                    <GraduationCap className="w-16 h-16" />
                  </span>
                  <h2 className="text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-amber-300 to-yellow-500 font-headline tracking-wide leading-normal print:bg-none print:text-yellow-700">
                    شهادة إجازة وإنجاز
                  </h2>
                </div>

                <div className="space-y-6 max-w-2xl mx-auto py-6">
                  <p className="text-lg md:text-xl text-white/60 font-semibold print:text-black/60">يَشهد مجلس إدارة منصة وقفة العلمية بأن طالب العلم:</p>
                  <h3 className="text-4xl md:text-6xl font-black font-headline text-white border-b-2 border-dashed border-yellow-500/30 py-4 max-w-xl mx-auto print:text-black print:border-black/30">
                    {studentName || "طالب العلم"}
                  </h3>
                  <p className="text-lg md:text-xl text-white/70 leading-relaxed font-semibold print:text-black/70">
                    قد أتم بنجاح دراسة واجتياز اختبارات منهج <br/>
                    <strong className="text-yellow-400 font-black text-2xl print:text-yellow-700">"ما لا يسع المسلم جهله"</strong> <br/>
                    والذي يشتمل على الأصول المقررة في: العقيدة الإسلامية الصحيحة، فقه الطهارة الكبرى والصغرى، فقه أركان الصلاة ومبطلاتها، والآداب والأخلاق الشرعية والمعاملات الحسنة.
                  </p>
                </div>

                <div className="grid grid-cols-2 pt-10 border-t border-yellow-500/20 max-w-xl mx-auto print:border-yellow-600/30">
                  <div className="flex flex-col items-center">
                    <span className="text-xs text-white/40 font-bold print:text-black/40">تاريخ الإجازة</span>
                    <span className="text-sm font-black text-white mt-1 print:text-black">
                      {new Date().toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-xs text-white/40 font-bold print:text-black/40">الختم والمصادقة</span>
                    <div className="w-16 h-16 rounded-full border-4 border-double border-yellow-500/40 flex items-center justify-center bg-yellow-500/10 text-yellow-500 font-headline font-black text-sm rotate-12 mt-2 animate-spin-slow print:border-yellow-600 print:text-yellow-700">
                      معتمد
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Embedded print styles to hide everything except the certificate when printing */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body, html, #__next, main {
            background: white !important;
            color: black !important;
          }
          /* Hide all non-printable elements */
          header, footer, nav, button, input, .print\\\\:hidden, #site-header, #site-footer {
            display: none !important;
          }
          /* Position printable area at top left of sheet */
          #certificate-print-area {
            position: absolute !important;
            top: 0 !important;
            left: 0 !important;
            right: 0 !important;
            bottom: 0 !important;
            width: 100% !important;
            height: 100% !important;
            margin: 0 !important;
            padding: 2.5cm !important;
            box-sizing: border-box !important;
            page-break-after: avoid !important;
            page-break-before: avoid !important;
            background: white !important;
            color: black !important;
            border: 8px double #d97706 !important;
          }
        }
      `}} />
    </div>
  );
}
