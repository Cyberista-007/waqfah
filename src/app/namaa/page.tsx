'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { GlowCard, HoloBadge } from '@/components/ui/glow';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { HelpCircle, Coins, Heart, Info, Wallet, Scale, ArrowLeft, ArrowRight, RefreshCw, CheckCircle, Printer, Calculator, Sliders, Wheat, Sprout, Building, GraduationCap, Laptop, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Base prices in SAR
const BASE_GOLD_PRICE = 295;
const BASE_SILVER_PRICE = 3.6;
const BASE_FITR_PRICE = 25;

const currencyConversions = [
  { code: 'SAR', name: 'ريال سعودي', symbol: 'ر.س', factor: 1.0 },
  { code: 'USD', name: 'دولار أمريكي', symbol: '$', factor: 0.27 },
  { code: 'EUR', name: 'يورو أوروبي', symbol: '€', factor: 0.25 },
  { code: 'EGP', name: 'جنيه مصري', symbol: 'ج.م', factor: 12.5 }
];

const initialRecipients = [
  { id: 'poor', title: 'الفقراء والمساكين', percent: 40, desc: 'الذين ليس لديهم ما يكفي احتياجاتهم الضرورية.' },
  { id: 'debtors', title: 'الغارمين', percent: 20, desc: 'المدينون العاجزون عن سداد ديونهم المباحة.' },
  { id: 'fisabilillah', title: 'في سبيل الله والتعليم', percent: 20, desc: 'حلقات العلم، وطباعة الكتب النافعة، وأعمال النفع العام.' },
  { id: 'ibnsabil', title: 'ابن السبيل وعتق الرقاب', percent: 20, desc: 'المسافرون المنقطعون والرقاب وفك الأسرى.' }
];

export default function NamaaZakatPage() {
  const [activeTab, setActiveTab] = useState<'maal' | 'crops' | 'fitr' | 'waqf'>('maal');
  const [step, setStep] = useState(1);
  const [selectedCurrency, setSelectedCurrency] = useState(currencyConversions[0]);
  
  // Zakat Al-Maal inputs
  const [cash, setCash] = useState<number>(0);
  const [goldGrams, setGoldGrams] = useState<number>(0);
  const [silverGrams, setSilverGrams] = useState<number>(0);
  const [stocks, setStocks] = useState<number>(0);
  const [crypto, setCrypto] = useState<number>(0);
  
  // Business trade inputs
  const [tradeGoods, setTradeGoods] = useState<number>(0);
  const [businessCash, setBusinessCash] = useState<number>(0);
  
  const [debtsToCollect, setDebtsToCollect] = useState<number>(0);
  const [liabilities, setLiabilities] = useState<number>(0);

  // Zakat Al-Fitr inputs
  const [familyMembers, setFamilyMembers] = useState<number>(1);

  // Agricultural crops inputs
  const [cropWeight, setCropWeight] = useState<number>(0);
  const [irrigationType, setIrrigationType] = useState<'rain' | 'machine'>('rain');

  // Livestock inputs
  const [livestockType, setLivestockType] = useState<'sheep' | 'cows' | 'camels'>('sheep');
  const [livestockCount, setLivestockCount] = useState<number>(0);

  // Waqf Simulator state
  const [waqfSum, setWaqfSum] = useState<number>(10000);
  const [waqfProfile, setWaqfProfile] = useState<'social' | 'growth' | 'tech'>('social');

  // Interactive Recipient Allocation
  const [allocations, setAllocations] = useState(initialRecipients);

  const goldGramPrice = useMemo(() => BASE_GOLD_PRICE * selectedCurrency.factor, [selectedCurrency]);
  const silverGramPrice = useMemo(() => BASE_SILVER_PRICE * selectedCurrency.factor, [selectedCurrency]);
  const fitrPricePerPerson = useMemo(() => BASE_FITR_PRICE * selectedCurrency.factor, [selectedCurrency]);

  const nisabGold = useMemo(() => goldGramPrice * 85, [goldGramPrice]);
  const nisabSilver = useMemo(() => silverGramPrice * 595, [silverGramPrice]);

  const goldValue = useMemo(() => goldGrams * goldGramPrice, [goldGrams, goldGramPrice]);
  const silverValue = useMemo(() => silverGrams * silverGramPrice, [silverGrams, silverGramPrice]);

  const totalAssets = useMemo(() => {
    return cash + goldValue + silverValue + stocks + crypto + tradeGoods + businessCash + debtsToCollect;
  }, [cash, goldValue, silverValue, stocks, crypto, tradeGoods, businessCash, debtsToCollect]);

  const netWealth = useMemo(() => {
    const net = totalAssets - liabilities;
    return net > 0 ? net : 0;
  }, [totalAssets, liabilities]);

  const reachesNisab = useMemo(() => {
    return netWealth >= nisabGold;
  }, [netWealth, nisabGold]);

  const zakatDue = useMemo(() => {
    if (!reachesNisab) return 0;
    return netWealth * 0.025; 
  }, [netWealth, reachesNisab]);

  // Crops Zakat calculation
  const reachesCropNisab = cropWeight >= 653; // 5 Wasqs ~= 653 kg
  const cropZakatDue = useMemo(() => {
    if (!reachesCropNisab) return 0;
    const rate = irrigationType === 'rain' ? 0.10 : 0.05; // 10% vs 5%
    return cropWeight * rate;
  }, [cropWeight, irrigationType, reachesCropNisab]);

  // Livestock Zakat calculation
  const livestockZakatMsg = useMemo(() => {
    if (livestockType === 'sheep') {
      if (livestockCount < 40) return 'لم يبلغ النصاب (أقل من 40 شاة)';
      if (livestockCount >= 40 && livestockCount < 121) return 'الواجب: شاة واحدة (عمرها سنة على الأقل)';
      if (livestockCount >= 121 && livestockCount < 201) return 'الواجب: شاتان';
      if (livestockCount >= 201 && livestockCount < 400) return 'الواجب: 3 شياه';
      return `الواجب: ${Math.floor(livestockCount / 100)} شياه`;
    } else if (livestockType === 'cows') {
      if (livestockCount < 30) return 'لم يبلغ النصاب (أقل من 30 بقرة)';
      if (livestockCount >= 30 && livestockCount < 40) return 'الواجب: تبيع أو تبيعة (له سنة)';
      if (livestockCount >= 40 && livestockCount < 60) return 'الواجب: مسنة (لها سنتان)';
      return `الواجب: تبيعان (أو تبيع ومسنة بحسب الحساب)`;
    } else {
      if (livestockCount < 5) return 'لم يبلغ النصاب (أقل من 5 من الإبل)';
      if (livestockCount >= 5 && livestockCount < 10) return 'الواجب: شاة واحدة';
      if (livestockCount >= 10 && livestockCount < 15) return 'الواجب: شاتان';
      if (livestockCount >= 15 && livestockCount < 20) return 'الواجب: 3 شياه';
      if (livestockCount >= 20 && livestockCount < 25) return 'الواجب: 4 شياه';
      return 'الواجب: بنت مخاض (لها سنة)';
    }
  }, [livestockType, livestockCount]);

  const fitrDue = useMemo(() => {
    return familyMembers * fitrPricePerPerson;
  }, [familyMembers, fitrPricePerPerson]);

  const chartData = useMemo(() => {
    return [
      { name: 'سيولة ونقد شخصي', value: cash },
      { name: 'ذهب وفضة', value: goldValue + silverValue },
      { name: 'أسهم وصناديق', value: stocks },
      { name: 'عملات رقمية', value: crypto },
      { name: 'بضائع تجارية وسندات', value: tradeGoods + businessCash },
      { name: 'ديون مستحقة لك', value: debtsToCollect }
    ].filter(item => item.value > 0);
  }, [cash, goldValue, silverValue, stocks, crypto, tradeGoods, businessCash, debtsToCollect]);

  // Waqf recommendations calculation
  const waqfAllocationData = useMemo(() => {
    if (waqfProfile === 'social') {
      return [
        { name: 'خدمات صحية وعلاجية للفقراء 🏥', value: waqfSum * 0.40, color: '#10b981' },
        { name: 'كفالة طلاب العلم والمدارس 🎓', value: waqfSum * 0.35, color: '#3b82f6' },
        { name: 'سقاية المياه ودعم الأسر المتعففة 💧', value: waqfSum * 0.25, color: '#eab308' }
      ];
    } else if (waqfProfile === 'growth') {
      return [
        { name: 'العقارات الوقفية والمباني السكنية 🏢', value: waqfSum * 0.50, color: '#8b5cf6' },
        { name: 'المزارع النخيلية والأصول الزراعية 🌴', value: waqfSum * 0.30, color: '#10b981' },
        { name: 'السندات والصكوك الوقفية السيادية 🪙', value: waqfSum * 0.20, color: '#eab308' }
      ];
    } else {
      return [
        { name: 'تطوير تطبيقات التعليم والمنصات المعرفية 💻', value: waqfSum * 0.45, color: '#3b82f6' },
        { name: 'أبحاث التقنية الطبية والبيولوجية 🔬', value: waqfSum * 0.35, color: '#ec4899' },
        { name: 'الخوادم وبنية السحابة المعرفية ☁️', value: waqfSum * 0.20, color: '#6b7280' }
      ];
    }
  }, [waqfSum, waqfProfile]);

  const COLORS = ['#10b981', '#f59e0b', '#6b7280', '#3b82f6', '#8b5cf6', '#ec4899'];

  const resetCalculator = () => {
    setCash(0);
    setGoldGrams(0);
    setSilverGrams(0);
    setStocks(0);
    setCrypto(0);
    setTradeGoods(0);
    setBusinessCash(0);
    setDebtsToCollect(0);
    setLiabilities(0);
    setFamilyMembers(1);
    setCropWeight(0);
    setLivestockCount(0);
    setLivestockType('sheep');
    setWaqfSum(10000);
    setWaqfProfile('social');
    setStep(1);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSliderChange = (id: string, value: number[]) => {
    const targetVal = value[0];
    const itemIdx = allocations.findIndex(a => a.id === id);
    if (itemIdx === -1) return;

    const updated = [...allocations];
    const diff = targetVal - updated[itemIdx].percent;
    updated[itemIdx].percent = targetVal;

    const otherItems = updated.filter(a => a.id !== id);
    const totalOther = otherItems.reduce((acc, a) => acc + a.percent, 0);

    if (totalOther > 0) {
      otherItems.forEach(item => {
        const share = item.percent / totalOther;
        item.percent = Math.max(0, Math.round(item.percent - diff * share));
      });
    } else {
      otherItems.forEach(item => {
        item.percent = Math.max(0, Math.round((100 - targetVal) / otherItems.length));
      });
    }

    const currentSum = updated.reduce((acc, a) => acc + a.percent, 0);
    if (currentSum !== 100) {
      updated[0].percent += (100 - currentSum);
    }
    setAllocations(updated);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header Title */}
      <div className="text-center mb-12 hide-in-print">
        <HoloBadge className="mb-3">
          <Coins className="h-3.5 w-3.5 text-primary animate-pulse" />
          <span>الزكاة والمعاملات المالية</span>
        </HoloBadge>
        <h1 className="text-4xl md:text-5xl font-black font-headline tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-primary/80 mb-4">
          نَمَاء - حاسبة الزكاة الذكية ودليل مصارفها
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto text-sm md:text-base text-center">
          لوحة تحكم مالية متكاملة تسهل حساب زكاة أموالك والوعاء التجاري والزراعي والحيواني وتوزيعها الشرعي بالتوافق مع الضوابط المعاصرة.
        </p>
      </div>

      {/* Calculator Mode Tabs */}
      <div className="flex flex-wrap justify-center mb-8 gap-3 hide-in-print">
        <button
          onClick={() => setActiveTab('maal')}
          className={`px-5 py-2.5 rounded-full text-xs font-bold border transition-all ${
            activeTab === 'maal'
              ? 'bg-primary text-black font-black border-primary shadow-lg shadow-primary/20'
              : 'bg-zinc-950/40 border-white/10 text-muted-foreground hover:bg-white/5'
          }`}
        >
          حاسبة زكاة المال والأعمال
        </button>
        <button
          onClick={() => setActiveTab('crops')}
          className={`px-5 py-2.5 rounded-full text-xs font-bold border transition-all ${
            activeTab === 'crops'
              ? 'bg-primary text-black font-black border-primary shadow-lg shadow-primary/20'
              : 'bg-zinc-950/40 border-white/10 text-muted-foreground hover:bg-white/5'
          }`}
        >
          حاسبة الزروع والأنعام 🌾
        </button>
        <button
          onClick={() => setActiveTab('fitr')}
          className={`px-5 py-2.5 rounded-full text-xs font-bold border transition-all ${
            activeTab === 'fitr'
              ? 'bg-primary text-black font-black border-primary shadow-lg shadow-primary/20'
              : 'bg-zinc-950/40 border-white/10 text-muted-foreground hover:bg-white/5'
          }`}
        >
          حاسبة زكاة الفطر للأفراد
        </button>
        <button
          onClick={() => setActiveTab('waqf')}
          className={`px-5 py-2.5 rounded-full text-xs font-bold border transition-all ${
            activeTab === 'waqf'
              ? 'bg-primary text-black font-black border-primary shadow-lg shadow-primary/20'
              : 'bg-zinc-950/40 border-white/10 text-muted-foreground hover:bg-white/5'
          }`}
        >
          مستشار الاستثمار الوقفي 🏛️
        </button>
      </div>

      {activeTab === 'maal' && (
        <>
          {/* Nisab Status Bar */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 hide-in-print">
            <Card className="bg-zinc-950/40 border-white/10 rounded-2xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-amber-500/10 rounded-xl">
                  <Scale className="h-6 w-6 text-amber-400" />
                </div>
                <div>
                  <div className="text-[10px] text-muted-foreground">نصاب الذهب الحالي (85 غرام)</div>
                  <div className="text-lg font-bold text-white">{Math.round(nisabGold).toLocaleString()} {selectedCurrency.symbol}</div>
                </div>
              </div>
              <span className="text-[10px] text-muted-foreground bg-white/5 px-2.5 py-1 rounded">24 قيراط</span>
            </Card>

            <Card className="bg-zinc-950/40 border-white/10 rounded-2xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-zinc-400/10 rounded-xl">
                  <Coins className="h-6 w-6 text-zinc-400" />
                </div>
                <div>
                  <div className="text-[10px] text-muted-foreground">نصاب الفضة الحالي (595 غرام)</div>
                  <div className="text-lg font-bold text-white">{Math.round(nisabSilver).toLocaleString()} {selectedCurrency.symbol}</div>
                </div>
              </div>
              <span className="text-[10px] text-muted-foreground bg-white/5 px-2.5 py-1 rounded">فضة خام</span>
            </Card>

            {/* Currency Selector Card */}
            <Card className="bg-zinc-950/40 border-white/10 rounded-2xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-emerald-500/10 rounded-xl">
                  <Wallet className="h-6 w-6 text-emerald-400" />
                </div>
                <div>
                  <div className="text-[10px] text-muted-foreground">العملة الحالية المعروضة</div>
                  <select
                    value={selectedCurrency.code}
                    onChange={(e) => {
                      const curr = currencyConversions.find(c => c.code === e.target.value);
                      if (curr) setSelectedCurrency(curr);
                    }}
                    className="bg-transparent text-white font-bold text-sm border-none focus:outline-none focus:ring-0 p-0 pr-6 select-rtl cursor-pointer"
                  >
                    {currencyConversions.map((c) => (
                      <option key={c.code} value={c.code} className="bg-zinc-950 text-white">
                        {c.name} ({c.symbol})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <button onClick={resetCalculator} className="text-[10px] text-primary hover:underline flex items-center gap-1 font-bold">
                <RefreshCw className="h-3.5 w-3.5" />
                إعادة ضبط
              </button>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Side: Step Wizard Inputs */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="bg-zinc-950/40 backdrop-blur-xl border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl relative min-h-[420px] flex flex-col justify-between hide-in-print">
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <span className="text-xs bg-primary/20 text-primary px-3 py-1 rounded-full font-black">
                      الخطوة {step} من 3
                    </span>
                    <h2 className="text-xl font-bold flex items-center gap-2">
                      <Calculator className="h-5 w-5 text-primary" />
                      <span>
                        {step === 1 && 'النقد والعملات والذهب والفضة'}
                        {step === 2 && 'الأعمال وعروض التجارة والاستثمارات'}
                        {step === 3 && 'الالتزامات والخصومات'}
                      </span>
                    </h2>
                  </div>

                  {/* Wizard Content */}
                  <AnimatePresence mode="wait">
                    {step === 1 && (
                      <motion.div
                        key="step1"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-4"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-right">
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-muted-foreground">النقد والسيولة النقدية الشخصية</label>
                            <Input
                              type="number"
                              placeholder="0.00"
                              value={cash || ''}
                              onChange={(e) => setCash(Number(e.target.value))}
                              className="bg-white/5 border-white/10 rounded-2xl focus-visible:ring-primary text-right"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-muted-foreground">الذهب عيار 24 (بالغرام)</label>
                            <Input
                              type="number"
                              placeholder="0.00"
                              value={goldGrams || ''}
                              onChange={(e) => setGoldGrams(Number(e.target.value))}
                              className="bg-white/5 border-white/10 rounded-2xl focus-visible:ring-primary text-right"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-muted-foreground">الفضة الخام (بالغرام)</label>
                            <Input
                              type="number"
                              placeholder="0.00"
                              value={silverGrams || ''}
                              onChange={(e) => setSilverGrams(Number(e.target.value))}
                              className="bg-white/5 border-white/10 rounded-2xl focus-visible:ring-primary text-right"
                            />
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {step === 2 && (
                      <motion.div
                        key="step2"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-4"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-right">
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-muted-foreground">قيمة البضائع المعدة للبيع (سعر الجملة اليوم)</label>
                            <Input
                              type="number"
                              placeholder="0.00"
                              value={tradeGoods || ''}
                              onChange={(e) => setTradeGoods(Number(e.target.value))}
                              className="bg-white/5 border-white/10 rounded-2xl focus-visible:ring-primary text-right"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-muted-foreground">سيولة الصندوق التجاري أو حسابات الشركة</label>
                            <Input
                              type="number"
                              placeholder="0.00"
                              value={businessCash || ''}
                              onChange={(e) => setBusinessCash(Number(e.target.value))}
                              className="bg-white/5 border-white/10 rounded-2xl focus-visible:ring-primary text-right"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-muted-foreground">القيمة السوقية للأسهم والصناديق</label>
                            <Input
                              type="number"
                              placeholder="0.00"
                              value={stocks || ''}
                              onChange={(e) => setStocks(Number(e.target.value))}
                              className="bg-white/5 border-white/10 rounded-2xl focus-visible:ring-primary text-right"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-muted-foreground">العملات الرقمية (بقيمة اليوم)</label>
                            <Input
                              type="number"
                              placeholder="0.00"
                              value={crypto || ''}
                              onChange={(e) => setCrypto(Number(e.target.value))}
                              className="bg-white/5 border-white/10 rounded-2xl focus-visible:ring-primary text-right"
                            />
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {step === 3 && (
                      <motion.div
                        key="step3"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-4 text-right"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-muted-foreground">الديون المرجوة لك عند الآخرين</label>
                            <Input
                              type="number"
                              placeholder="0.00"
                              value={debtsToCollect || ''}
                              onChange={(e) => setDebtsToCollect(Number(e.target.value))}
                              className="bg-white/5 border-white/10 rounded-2xl focus-visible:ring-primary text-right"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-muted-foreground">الالتزامات والديون الحالة التي عليك سدادها حالياً</label>
                            <Input
                              type="number"
                              placeholder="0.00"
                              value={liabilities || ''}
                              onChange={(e) => setLiabilities(Number(e.target.value))}
                              className="bg-white/5 border-white/10 rounded-2xl focus-visible:ring-primary text-right"
                            />
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Navigation Buttons */}
                <div className="flex justify-between items-center mt-8 pt-4 border-t border-white/10">
                  {step > 1 ? (
                    <Button variant="ghost" onClick={() => setStep(step - 1)} className="rounded-xl text-xs">
                      <ArrowRight className="me-2 h-4 w-4" /> السابق
                    </Button>
                  ) : (
                    <div />
                  )}

                  {step < 3 ? (
                    <Button onClick={() => setStep(step + 1)} className="rounded-xl bg-primary hover:bg-primary/95 text-black font-black text-xs">
                      التالي <ArrowLeft className="ms-2 h-4 w-4" />
                    </Button>
                  ) : (
                    <Button onClick={() => setStep(1)} className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs">
                      مراجعة المدخلات
                    </Button>
                  )}
                </div>
              </Card>

              {/* Dynamic Recipient Allocation Slider Dashboard */}
              <Card className="bg-zinc-950/40 backdrop-blur-xl border-white/10 rounded-3xl p-6 shadow-2xl text-right hide-in-print">
                <h3 className="text-lg font-bold flex items-center gap-2 mb-2 text-white">
                  <Sliders className="h-5 w-5 text-primary" />
                  <span>توزيع مصارف الزكاة التفاعلي (مجموعها 100%)</span>
                </h3>
                <p className="text-xs text-muted-foreground mb-6">وزّع وعاء زكاتك التقديري على الفئات لتوليد خطة توزيع مطبوعة مع الإيصال.</p>

                <div className="space-y-6">
                  {allocations.map((item) => (
                    <div key={item.id} className="space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-muted-foreground">{item.desc}</span>
                        <span className="font-bold text-primary flex items-center gap-2">
                          <span>{item.title}</span>
                          <span className="bg-primary/10 px-2 py-0.5 rounded text-white">{item.percent}%</span>
                        </span>
                      </div>
                      <Slider
                        value={[item.percent]}
                        onValueChange={(val) => handleSliderChange(item.id, val)}
                        max={100}
                        step={1}
                        className="py-1.5"
                      />
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Right Side: Results Panel */}
            <div className="lg:col-span-1 space-y-6 hide-in-print">
              <GlowCard className="bg-zinc-950/40 backdrop-blur-xl border-white/10 rounded-3xl p-6 shadow-2xl flex flex-col justify-between min-h-[500px]">
                <div>
                  <h3 className="text-lg font-bold border-b border-white/10 pb-4 mb-4 flex items-center gap-2">
                    <Scale className="h-5 w-5 text-primary" />
                    <span>التقرير والوعاء المالي</span>
                  </h3>

                  <div className="space-y-4 text-right">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-muted-foreground">إجمالي الأصول والسيولة</span>
                      <span className="font-bold text-white">{totalAssets.toLocaleString()} {selectedCurrency.symbol}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-muted-foreground">الالتزامات المخصومة</span>
                      <span className="font-bold text-red-400">-{liabilities.toLocaleString()} {selectedCurrency.symbol}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs pt-2 border-t border-white/5">
                      <span className="font-bold text-white">الوعاء الصافي (الخاضع للزكاة)</span>
                      <span className="font-black text-primary text-sm">{netWealth.toLocaleString()} {selectedCurrency.symbol}</span>
                    </div>

                    {/* Pie Chart */}
                    {chartData.length > 0 && (
                      <div className="h-[160px] w-full flex items-center justify-center my-2">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={chartData}
                              cx="50%"
                              cy="50%"
                              innerRadius={40}
                              outerRadius={60}
                              paddingAngle={3}
                              dataKey="value"
                            >
                              {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip formatter={(value: number) => `${value.toLocaleString()} ${selectedCurrency.symbol}`} />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    )}

                    {/* Nisab Status */}
                    <div className={`p-4 rounded-2xl border text-xs leading-relaxed ${
                      reachesNisab 
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' 
                        : 'bg-zinc-900 border-white/10 text-muted-foreground'
                    }`}>
                      {reachesNisab ? (
                        <div className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 shrink-0 text-emerald-400" />
                          <div>
                            <strong>بلغ مالك النصاب الشرعي!</strong>
                            <p className="mt-1 leading-relaxed">
                              النصاب المعادل لـ 85 غرام ذهب هو {Math.round(nisabGold).toLocaleString()} {selectedCurrency.symbol}.
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-start gap-2">
                          <Info className="h-4 w-4 shrink-0 text-muted-foreground" />
                          <div>
                            <strong>لم يبلغ مالك النصاب.</strong>
                            <p className="mt-1 leading-relaxed">
                              الحد الأدنى لوجوب الزكاة هو قيمة 85 غرام ذهب ({Math.round(nisabGold).toLocaleString()} {selectedCurrency.symbol}).
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-white/10 space-y-4">
                  <div className="text-center">
                    <div className="text-xs text-muted-foreground">مقدار الزكاة المستحقة الدفع (2.5%)</div>
                    <div className="text-3xl font-black text-emerald-400 mt-1">
                      {zakatDue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {selectedCurrency.symbol}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={resetCalculator} variant="outline" className="flex-1 rounded-xl text-xs">
                      إعادة ضبط
                    </Button>
                    <Button onClick={handlePrint} className="flex-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs" disabled={zakatDue <= 0}>
                      <Printer className="h-4 w-4 me-1.5" /> طباعة الإيصال
                    </Button>
                  </div>
                </div>
              </GlowCard>
            </div>

            {/* Printable Receipt Preview (Visible ONLY when printing) */}
            <div className="col-span-3 bg-white text-zinc-950 p-8 rounded-3xl border border-zinc-200 shadow-xl text-right print-only-area">
              <div className="flex justify-between items-center border-b border-zinc-200 pb-4 mb-6">
                <div>
                  <h2 className="text-2xl font-black text-emerald-700">إيصال حساب زكاة المال والأعمال 🏛️</h2>
                  <p className="text-xs text-zinc-500 mt-1">منصة وقفة للدروس والعلوم الشرعية</p>
                </div>
                <div className="text-left text-xs text-zinc-400">
                  التاريخ: {new Date().toLocaleDateString('ar-SA')}
                </div>
              </div>

              <div className="space-y-4 text-sm mb-6">
                <div className="flex justify-between border-b border-zinc-100 pb-2">
                  <span className="text-zinc-500">الأصول والسيولة الشخصية والتجارية:</span>
                  <span className="font-bold text-zinc-800">{totalAssets.toLocaleString()} {selectedCurrency.symbol}</span>
                </div>
                <div className="flex justify-between border-b border-zinc-100 pb-2">
                  <span className="text-zinc-500">الالكتزامات والخصومات المقبولة:</span>
                  <span className="font-bold text-red-600">-{liabilities.toLocaleString()} {selectedCurrency.symbol}</span>
                </div>
                <div className="flex justify-between border-b border-zinc-100 pb-2">
                  <span className="text-zinc-500">الوعاء الزكوي الصافي الخاضع للزكاة:</span>
                  <span className="font-black text-zinc-800">{netWealth.toLocaleString()} {selectedCurrency.symbol}</span>
                </div>
              </div>

              <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-2xl text-center mb-6">
                <div className="text-xs text-emerald-600 font-bold">إجمالي مبلغ الزكاة الواجب إخراجه (2.5%):</div>
                <div className="text-3xl font-black text-emerald-700 mt-2">
                  {zakatDue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {selectedCurrency.symbol}
                </div>
              </div>

              <div className="border border-zinc-200 p-4 rounded-xl space-y-2">
                <h4 className="font-bold text-xs text-zinc-700 border-b pb-1 mb-2">خطة توزيع ميزانية الزكاة المقترحة:</h4>
                {allocations.map((a) => (
                  <div key={a.id} className="flex justify-between text-xs text-zinc-600">
                    <span>{a.title} ({a.percent}%):</span>
                    <span className="font-bold text-zinc-800">
                      {((zakatDue * a.percent) / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {selectedCurrency.symbol}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {activeTab === 'crops' && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 text-right"
        >
          {/* Crops Zakat */}
          <GlowCard className="bg-zinc-950/40 backdrop-blur-xl border-white/10 rounded-3xl p-6 shadow-2xl relative space-y-6">
            <h3 className="text-xl font-bold flex items-center gap-2 mb-2 text-white justify-start">
              <Wheat className="h-5 w-5 text-amber-400" />
              <span>زكاة الزروع والثمار</span>
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              تجب في كل ما يخرج من الأرض من الحبوب والثمار إذا بلغت النصاب الشرعي وهو 5 أوسق (ما يعادل 653 كجم تقريباً).
            </p>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground font-bold">وزن المحصول الإجمالي اليوم (بالكيلوغرام):</label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={cropWeight || ''}
                  onChange={(e) => setCropWeight(Number(e.target.value))}
                  className="bg-white/5 border-white/10 rounded-2xl text-right text-base font-bold focus-visible:ring-primary"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs text-muted-foreground font-bold font-headline">نوع سقاية الأرض والمحصول:</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setIrrigationType('rain')}
                    className={`flex-1 py-2 rounded-xl border text-xs font-bold transition-all ${
                      irrigationType === 'rain'
                        ? 'bg-primary/20 border-primary text-primary'
                        : 'bg-white/5 border-transparent text-muted-foreground hover:bg-white/10'
                    }`}
                  >
                    بماء المطر والعيون (الواجب 10%)
                  </button>
                  <button
                    onClick={() => setIrrigationType('machine')}
                    className={`flex-1 py-2 rounded-xl border text-xs font-bold transition-all ${
                      irrigationType === 'machine'
                        ? 'bg-primary/20 border-primary text-primary'
                        : 'bg-white/5 border-transparent text-muted-foreground hover:bg-white/10'
                    }`}
                  >
                    بالآلات والكلفة الميكانيكية (الواجب 5%)
                  </button>
                </div>
              </div>

              <div className="bg-white/5 p-4 rounded-2xl border border-white/5 text-center">
                <div className="text-[10px] text-muted-foreground">مقدار زكاة المحصول المستحق إخراجه</div>
                <div className="text-2xl font-black text-emerald-400 mt-1">
                  {cropZakatDue.toLocaleString(undefined, { maximumFractionDigits: 2 })} كجم
                </div>
                <div className="text-[9px] text-muted-foreground mt-0.5">
                  {reachesCropNisab ? '✓ بلغ النصاب الشرعي للمحاصيل' : 'لم يبلغ النصاب (أقل من 653 كجم)'}
                </div>
              </div>
            </div>
          </GlowCard>

          {/* Livestock Zakat */}
          <GlowCard className="bg-zinc-950/40 backdrop-blur-xl border-white/10 rounded-3xl p-6 shadow-2xl relative space-y-6">
            <h3 className="text-xl font-bold flex items-center gap-2 mb-2 text-white justify-start">
              <Sprout className="h-5 w-5 text-emerald-400" />
              <span>زكاة الأنعام بهيمة الأنعام</span>
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              تجب زكاة الأنعام السائمة التي ترعى العشب طوال العام إذا بلغت النصاب الشرعي (40 للغنم، 30 للبقر، 5 للإبل).
            </p>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground font-bold">نوع الأنعام المملوكة:</label>
                <div className="flex gap-2">
                  {[
                    { key: 'sheep', label: 'الغنم والماعز 🐑' },
                    { key: 'cows', label: 'البقر والجاموس 🐄' },
                    { key: 'camels', label: 'الإبل والجمال 🐫' }
                  ].map((item) => (
                    <button
                      key={item.key}
                      onClick={() => {
                        setLivestockType(item.key as any);
                        setLivestockCount(0);
                      }}
                      className={`flex-1 py-2 rounded-xl border text-xs font-bold transition-all ${
                        livestockType === item.key
                          ? 'bg-primary/20 border-primary text-primary'
                          : 'bg-white/5 border-transparent text-muted-foreground hover:bg-white/10'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs text-muted-foreground font-bold">
                  {livestockType === 'sheep' && 'عدد رؤوس الغنم والماعز:'}
                  {livestockType === 'cows' && 'عدد رؤوس البقر والجاموس:'}
                  {livestockType === 'camels' && 'عدد رؤوس الإبل والجمال:'}
                </label>
                <Input
                  type="number"
                  placeholder="0"
                  value={livestockCount || ''}
                  onChange={(e) => setLivestockCount(Number(e.target.value))}
                  className="bg-white/5 border-white/10 rounded-2xl text-right text-base font-bold focus-visible:ring-primary"
                />
              </div>

              <div className="bg-emerald-500/10 border border-emerald-500/20 p-5 rounded-2xl text-center">
                <div className="text-xs text-emerald-300 font-bold">الحكم والواجب الشرعي للأنعام:</div>
                <div className="text-lg font-black text-white mt-2">
                  {livestockZakatMsg}
                </div>
              </div>
            </div>
          </GlowCard>
        </motion.div>
      )}

      {activeTab === 'fitr' && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-3xl mx-auto space-y-6"
        >
          <GlowCard className="bg-zinc-950/40 backdrop-blur-xl border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl relative">
            <h3 className="text-xl font-bold flex items-center gap-2 mb-4 justify-start">
              <Coins className="h-5 w-5 text-primary" />
              <span>زكاة الفطر للأفراد والأسرة</span>
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed mb-6 text-right">
              زكاة الفطر فرض على كل مسلم صغيراً أو كبيراً، ذكراً أو أنثى، وتخرج طهرة للصائم من اللغو والرفث وطعمة للمساكين قبل صلاة العيد بمقدار صاع (حوالي 3 كجم) من قوت البلد.
            </p>

            <div className="space-y-6 text-right">
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground">عدد أفراد الأسرة المستحق عنهم الإخراج (تشمل نفسك وعائلتك):</label>
                <Input
                  type="number"
                  min={1}
                  value={familyMembers}
                  onChange={(e) => setFamilyMembers(Math.max(1, Number(e.target.value)))}
                  className="bg-white/5 border-white/10 rounded-2xl focus-visible:ring-primary text-right text-base font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 border border-white/5 p-4 rounded-2xl text-center">
                  <div className="text-[10px] text-muted-foreground">المقدار العيني الواجب (صاع لكل فرد)</div>
                  <div className="text-lg font-black text-white mt-1">{familyMembers * 3} كجم تقريباً</div>
                </div>

                <div className="bg-white/5 border border-white/5 p-4 rounded-2xl text-center">
                  <div className="text-[10px] text-muted-foreground">المقدار النقدي التقديري المعادل</div>
                  <div className="text-lg font-black text-emerald-400 mt-1">{fitrDue.toLocaleString()} {selectedCurrency.symbol}</div>
                </div>
              </div>

              <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl text-xs leading-relaxed text-right text-emerald-300">
                <strong>ملاحظة شرعية:</strong> الأصل في زكاة الفطر إخراجها عيناً من طعام أهل البلد، ويجوز إخراج قيمتها نقداً لمصلحة الفقير الراجحة وفقاً لفتاوى هيئات كبار العلماء الشرعية المعاصرة. يتوجب إخراجها قبل صلاة العيد ولا يجوز تأخيرها عنها.
              </div>
            </div>
          </GlowCard>
        </motion.div>
      )}

      {activeTab === 'waqf' && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 text-right"
        >
          {/* Inputs Section */}
          <div className="lg:col-span-2 space-y-6">
            <GlowCard className="bg-zinc-950/40 backdrop-blur-xl border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl relative space-y-6">
              <h3 className="text-xl font-bold flex items-center gap-2 mb-2 text-white justify-start">
                <Building className="h-5 w-5 text-primary" />
                <span>مستشار توجيه استثمار المال الوقفي</span>
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                الوقف صدقة جارية يدوم أصلها ويدر نفعاً مستداماً على المسلمين. أدخل القيمة الاستثمارية المقترحة وحدد ملفك الوقفي.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted-foreground">المبلغ المخصص للوقف ({selectedCurrency.symbol}):</label>
                  <Input
                    type="number"
                    value={waqfSum}
                    onChange={(e) => setWaqfSum(Math.max(1, Number(e.target.value)))}
                    className="bg-white/5 border-white/10 rounded-2xl text-right text-base font-bold focus-visible:ring-primary"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted-foreground">الرؤية والملف الوقفي المستهدف:</label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setWaqfProfile('social')}
                      className={`flex-1 py-2.5 rounded-xl border text-xs font-bold transition-all ${
                        waqfProfile === 'social'
                          ? 'bg-primary/20 border-primary text-primary'
                          : 'bg-white/5 border-transparent text-muted-foreground hover:bg-white/10'
                      }`}
                    >
                      أثر اجتماعي مباشر 🏥
                    </button>
                    <button
                      onClick={() => setWaqfProfile('growth')}
                      className={`flex-1 py-2.5 rounded-xl border text-xs font-bold transition-all ${
                        waqfProfile === 'growth'
                          ? 'bg-primary/20 border-primary text-primary'
                          : 'bg-white/5 border-transparent text-muted-foreground hover:bg-white/10'
                      }`}
                    >
                      استدامة ونمو أصول 🏢
                    </button>
                    <button
                      onClick={() => setWaqfProfile('tech')}
                      className={`flex-1 py-2.5 rounded-xl border text-xs font-bold transition-all ${
                        waqfProfile === 'tech'
                          ? 'bg-primary/20 border-primary text-primary'
                          : 'bg-white/5 border-transparent text-muted-foreground hover:bg-white/10'
                      }`}
                    >
                      ابتكار ومعرفة تقنية 💻
                    </button>
                  </div>
                </div>
              </div>

              <div className="border-t border-white/5 pt-6 space-y-4">
                <h4 className="font-bold text-sm text-white">توزيع المحفظة الوقفية المقترح:</h4>
                <div className="space-y-3">
                  {waqfAllocationData.map((item, idx) => (
                    <div key={idx} className="bg-white/5 p-3.5 rounded-xl border border-white/5 flex justify-between items-center text-xs">
                      <span className="font-bold text-white flex items-center gap-1">
                        <span className="h-2.5 w-2.5 rounded-full inline-block" style={{ backgroundColor: item.color }} />
                        <span>{item.name}</span>
                      </span>
                      <span className="font-black text-primary">
                        {item.value.toLocaleString(undefined, { maximumFractionDigits: 0 })} {selectedCurrency.symbol}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </GlowCard>
          </div>

          {/* Report Side Panel */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="bg-zinc-950/40 backdrop-blur-xl border-white/10 rounded-3xl p-6 shadow-2xl space-y-6">
              <div>
                <h3 className="text-lg font-bold border-b border-white/10 pb-4 mb-4 flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-emerald-400" />
                  <span>توقعات الأثر الوقفي</span>
                </h3>

                <div className="space-y-4">
                  <div className="text-center bg-white/5 p-4 rounded-2xl border border-white/5">
                    <span className="text-[10px] text-muted-foreground">مؤشر الأثر الاجتماعي السنوي (تقديري)</span>
                    <div className="text-3xl font-black text-emerald-400 mt-1">
                      {Math.round(waqfSum * 0.08).toLocaleString()} أفراد
                    </div>
                    <p className="text-[9px] text-muted-foreground mt-1">
                      مستفيدين سنوياً من ريع الخدمات التعليمية والصحية للوقف.
                    </p>
                  </div>

                  <div className="h-[160px] w-full flex items-center justify-center my-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={waqfAllocationData}
                          cx="50%"
                          cy="50%"
                          innerRadius={45}
                          outerRadius={65}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {waqfAllocationData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value: number) => `${value.toLocaleString()} ${selectedCurrency.symbol}`} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="text-xs text-muted-foreground leading-relaxed bg-primary/10 border border-primary/20 p-4 rounded-2xl text-right">
                    <strong>الرأي الاستشاري للوقف:</strong> يُنصح بحبس أصل المال واستثمار غلته في مجالات تخدم البنى التحتية للمسلمين، بحيث تتولى نظارة شرعية مرخصة الإشراف لضمان أقصى استدامة ونمو.
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </motion.div>
      )}
    </div>
  );
}
