'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Scale, Users, Info, Calculator, BookOpen, ArrowLeft, ArrowRight, RotateCcw, 
  DollarSign, Check, HelpCircle, AlertTriangle, ChevronLeft
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Heir types definition
type HeirKey = 'spouse' | 'father' | 'mother' | 'sons' | 'daughters' | 'fullSiblings' | 'maternalSiblings';

interface HeirInputs {
  deceasedGender: 'male' | 'female';
  estateValue: number;
  currency: string;
  hasSpouse: boolean;
  spouseCount: number; // For male deceased having multiple wives
  hasFather: boolean;
  hasMother: boolean;
  sonsCount: number;
  daughtersCount: number;
  fullBrothersCount: number;
  fullSistersCount: number;
}

interface CalculationResult {
  heirName: string;
  shareFraction: string;
  sharePercentage: number;
  shareValue: number;
  proof: string;
  type: 'fardh' | 'taaseeb' | 'blocked';
}

export default function MirathPage() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [inputs, setInputs] = useState<HeirInputs>({
    deceasedGender: 'male',
    estateValue: 100000,
    currency: 'SAR',
    hasSpouse: false,
    spouseCount: 1,
    hasFather: false,
    hasMother: false,
    sonsCount: 0,
    daughtersCount: 0,
    fullBrothersCount: 0,
    fullSistersCount: 0,
  });

  const [results, setResults] = useState<CalculationResult[]>([]);
  const [totalSharesSum, setTotalSharesSum] = useState<number>(0);
  const [totalDistributedPercentage, setTotalDistributedPercentage] = useState<number>(0);
  const [isAwal, setIsAwal] = useState<boolean>(false);
  const [isRadd, setIsRadd] = useState<boolean>(false);
  const [calculationSteps, setCalculationSteps] = useState<string[]>([]);

  // Reset all fields
  const handleReset = () => {
    setInputs({
      deceasedGender: 'male',
      estateValue: 100000,
      currency: 'SAR',
      hasSpouse: false,
      spouseCount: 1,
      hasFather: false,
      hasMother: false,
      sonsCount: 0,
      daughtersCount: 0,
      fullBrothersCount: 0,
      fullSistersCount: 0,
    });
    setResults([]);
    setStep(1);
    setIsAwal(false);
    setIsRadd(false);
    setCalculationSteps([]);
  };

  // Perform the Islamic inheritance calculation
  const calculateInheritance = () => {
    const list: CalculationResult[] = [];
    const steps: string[] = [];
    
    const value = inputs.estateValue;
    const hasChildren = inputs.sonsCount > 0 || inputs.daughtersCount > 0;
    const totalSiblingsCount = inputs.fullBrothersCount + inputs.fullSistersCount;
    
    // We will calculate using shares out of a base denominator (أصل المسألة)
    // Primary denominators: 2, 3, 4, 6, 8, 12, 24
    
    // Let's determine Fardh (المقدرة فرضاً) shares first:
    let spouseShare = 0;
    let spouseProof = '';
    
    // 1. Spouses (الزوج / الزوجات)
    if (inputs.hasSpouse) {
      if (inputs.deceasedGender === 'male') {
        // Deceased is Male -> Wife/Wives inherit
        if (hasChildren) {
          spouseShare = 1 / 8;
          spouseProof = "للأزواج (الزوجة أو الزوجات) الثمن فرضاً لوجود الفرع الوارث [النساء: 12].";
        } else {
          spouseShare = 1 / 4;
          spouseProof = "للأزواج (الزوجة أو الزوجات) الربع فرضاً لعدم وجود الفرع الوارث [النساء: 12].";
        }
      } else {
        // Deceased is Female -> Husband inherits
        if (hasChildren) {
          spouseShare = 1 / 4;
          spouseProof = "للزوج الربع فرضاً لوجود الفرع الوارث [النساء: 12].";
        } else {
          spouseShare = 1 / 2;
          spouseProof = "للزوج النصف فرضاً لعدم وجود الفرع الوارث [النساء: 12].";
        }
      }
    }

    // 2. Mother (الأم)
    let motherShare = 0;
    let motherProof = '';
    if (inputs.hasMother) {
      if (hasChildren) {
        motherShare = 1 / 6;
        motherProof = "للأم السدس فرضاً لوجود الفرع الوارث [النساء: 11].";
      } else if (totalSiblingsCount >= 2) {
        motherShare = 1 / 6;
        motherProof = "للأم السدس فرضاً لوجود جمع من الإخوة (اثنين فأكثر) [النساء: 11].";
      } else {
        // Check for Umariyyah (الغراوين) cases: (Spouse + Mother + Father only)
        const isUmariyyah = inputs.hasSpouse && inputs.hasFather && !hasChildren && totalSiblingsCount === 0;
        if (isUmariyyah) {
          motherShare = (1 - spouseShare) / 3;
          motherProof = "للأم ثلث الباقي فرضاً (مسألة عمرية) لأن الورثة هم أحد الزوجين والأبوين فقط.";
        } else {
          motherShare = 1 / 3;
          motherProof = "للأم الثلث فرضاً لعدم وجود الفرع الوارث أو جمع من الإخوة [النساء: 11].";
        }
      }
    }

    // 3. Father (الأب)
    let fatherShare = 0;
    let fatherProof = '';
    let fatherIsTaaseeb = false;
    
    if (inputs.hasFather) {
      if (inputs.sonsCount > 0) {
        // Male descendants exist -> Father gets 1/6 only
        fatherShare = 1 / 6;
        fatherProof = "للأب السدس فرضاً لوجود الفرع الوارث المذكر (الابن) [النساء: 11].";
      } else if (inputs.daughtersCount > 0) {
        // Only female descendants exist -> Father gets 1/6 + Ta'seeb (remainder)
        fatherShare = 1 / 6;
        fatherIsTaaseeb = true;
        fatherProof = "للأب السدس فرضاً لوجود الفرع الوارث المؤنث، مع استحقاق الباقي تعصيباً.";
      } else {
        // No descendants -> Father gets all residue (Ta'seeb)
        fatherIsTaaseeb = true;
        fatherProof = "الأب يرث بالتعصيب لعدم وجود فرع وارث مذكر أو مؤنث.";
      }
    }

    // 4. Daughters (البنات) - If no sons, they inherit as Fardh
    let daughtersTotalShare = 0;
    let daughtersProof = '';
    let daughtersAreFardh = false;
    
    if (inputs.daughtersCount > 0 && inputs.sonsCount === 0) {
      daughtersAreFardh = true;
      if (inputs.daughtersCount === 1) {
        daughtersTotalShare = 1 / 2;
        daughtersProof = "للبنت الواحدة النصف فرضاً لانفرادها وعدم وجود عاصب (ابن) [النساء: 11].";
      } else {
        daughtersTotalShare = 2 / 3;
        daughtersProof = `للبنات (${inputs.daughtersCount}) الثلثان فرضاً لتعددهن وعدم وجود عاصب (ابن) ويقسم بينهن بالتساوي [النساء: 11].`;
      }
    }

    // 5. Sisters (الأخوات الشقيقات) - Fardh if no father, no descendants, no brothers
    let sistersTotalShare = 0;
    let sistersProof = '';
    let sistersAreFardh = false;
    const isBlockedSiblings = inputs.hasFather || inputs.sonsCount > 0;
    
    if (inputs.fullSistersCount > 0 && inputs.fullBrothersCount === 0 && !isBlockedSiblings && inputs.daughtersCount === 0) {
      sistersAreFardh = true;
      if (inputs.fullSistersCount === 1) {
        sistersTotalShare = 1 / 2;
        sistersProof = "للأخت الشقيقة الواحدة النصف فرضاً لانفرادها وعدم وجود فرع وارث أو أب أو أخ عاصب.";
      } else {
        sistersTotalShare = 2 / 3;
        sistersProof = `للأخوات الشقيقات (${inputs.fullSistersCount}) الثلثان فرضاً لتعددهن وعدم وجود فرع وارث أو أب أو أخ عاصب.`;
      }
    }

    // Let's sum the initial Fardh shares:
    let fardhSum = spouseShare + motherShare + (fatherIsTaaseeb ? 1/6 : fatherShare) + daughtersTotalShare + (sistersAreFardh ? sistersTotalShare : 0);
    steps.push(`حساب مجموع الفروض المقدرة: ${fardhSum.toFixed(4)}`);

    // Handle AWAL (العول): if Fardh sum exceeds 1
    let finalSpouseShare = spouseShare;
    let finalMotherShare = motherShare;
    let finalFatherShare = fatherIsTaaseeb ? 1/6 : fatherShare;
    let finalDaughtersShare = daughtersTotalShare;
    let finalSistersShare = sistersAreFardh ? sistersTotalShare : 0;
    
    if (fardhSum > 1) {
      setIsAwal(true);
      setIsRadd(false);
      steps.push("المسألة عالت: مجموع السهام المفروضة تجاوز الواحد الصحيح، يتم تقليص حصص الجميع بنسبة عول المسألة.");
      
      // Pro-rate all fardh shares so they sum to 1
      finalSpouseShare = spouseShare / fardhSum;
      finalMotherShare = motherShare / fardhSum;
      finalFatherShare = (fatherIsTaaseeb ? 1/6 : fatherShare) / fardhSum;
      finalDaughtersShare = daughtersTotalShare / fardhSum;
      finalSistersShare = (sistersAreFardh ? sistersTotalShare : 0) / fardhSum;
      
      fardhSum = 1;
    } else {
      setIsAwal(false);
    }

    // Remaining share for Ta'seeb (التعصيب)
    let remainder = 1 - (finalSpouseShare + finalMotherShare + (fatherIsTaaseeb ? 0 : finalFatherShare) + (daughtersAreFardh ? finalDaughtersShare : 0) + (sistersAreFardh ? finalSistersShare : 0));
    steps.push(`التركة المتبقية للتعصيب: ${remainder.toFixed(4)}`);

    // Let's allocate residue to Asabah (العصبات)
    let fatherTaaseebShare = 0;
    let kidsTotalShare = 0;
    let siblingsTotalShare = 0;

    if (fatherIsTaaseeb) {
      // Father is the first Asabah here (if no sons)
      if (inputs.daughtersCount > 0) {
        // Father gets 1/6 as fardh, plus residue
        fatherTaaseebShare = remainder;
        remainder = 0;
        steps.push(`الأب يرث الباقي تعصيباً بعد فروض البنات والزوج والأم بقيمة: ${fatherTaaseebShare.toFixed(4)}`);
      } else {
        // No daughters, no sons. Father takes all remaining residue
        fatherTaaseebShare = remainder;
        remainder = 0;
        steps.push(`الأب ينفرد بالباقي تعصيباً بعد فرض الأم والزوج بقيمة: ${fatherTaaseebShare.toFixed(4)}`);
      }
    }

    // If there are kids (Sons + Daughters)
    if (remainder > 0 && (inputs.sonsCount > 0 || (inputs.daughtersCount > 0 && !daughtersAreFardh))) {
      // Children inherit by Ta'seeb ( للذكر مثل حظ الأنثيين )
      kidsTotalShare = remainder;
      remainder = 0;
      steps.push(`توزيع الباقي تعصيباً على الأبناء والبنات بقيمة: ${kidsTotalShare.toFixed(4)}`);
    }

    // If there are no kids but siblings exist, and they are not blocked
    if (remainder > 0 && !isBlockedSiblings && (inputs.fullBrothersCount > 0 || (inputs.fullSistersCount > 0 && !sistersAreFardh))) {
      siblingsTotalShare = remainder;
      remainder = 0;
      steps.push(`توزيع الباقي تعصيباً على الإخوة والأخوات الأشقاء بقيمة: ${siblingsTotalShare.toFixed(4)}`);
    }

    // Handle RADD (الرد): if there is remainder and no Asabah (residuary) heirs
    let finalRemainderAllocation = remainder;
    if (finalRemainderAllocation > 0) {
      setIsRadd(true);
      steps.push(`تبقّت زيادة في التركة قدرها ${finalRemainderAllocation.toFixed(4)} مع عدم وجود عاصب. يتم الرد على ذوي الفروض عدا الزوجين.`);
      
      // Calculate sum of Fardh heirs who are eligible for Radd (everyone except spouse)
      let raddEligibleSum = 0;
      if (inputs.hasMother) raddEligibleSum += finalMotherShare;
      if (inputs.hasFather && !fatherIsTaaseeb) raddEligibleSum += finalFatherShare;
      if (daughtersAreFardh) raddEligibleSum += finalDaughtersShare;
      if (sistersAreFardh) raddEligibleSum += finalSistersShare;
      
      if (raddEligibleSum > 0) {
        const factor = finalRemainderAllocation / raddEligibleSum;
        if (inputs.hasMother) finalMotherShare += finalMotherShare * factor;
        if (inputs.hasFather && !fatherIsTaaseeb) finalFatherShare += finalFatherShare * factor;
        if (daughtersAreFardh) finalDaughtersShare += finalDaughtersShare * factor;
        if (sistersAreFardh) finalSistersShare += finalSistersShare * factor;
      }
    } else {
      setIsRadd(false);
    }

    // Build the final results list with proper formatting
    
    // Spouse(s)
    if (inputs.hasSpouse) {
      const spouseValue = finalSpouseShare * value;
      const shareText = inputs.spouseCount > 1 
        ? `1/${Math.round(1/spouseShare)} المجموع (${(spouseShare*100).toFixed(1)}%) ويقسم بينهن بالتساوي` 
        : `1/${Math.round(1/spouseShare)} (${(spouseShare*100).toFixed(1)}%)`;
      
      list.push({
        heirName: inputs.deceasedGender === 'male' 
          ? `الزوجات (${inputs.spouseCount})` 
          : 'الزوج',
        shareFraction: spouseShare > 0 ? (inputs.spouseCount > 1 ? `مجموع: ${shareText}` : `فرض: 1/${Math.round(1/spouseShare)}`) : '0',
        sharePercentage: finalSpouseShare * 100,
        shareValue: spouseValue,
        proof: spouseProof,
        type: 'fardh'
      });
      
      if (inputs.spouseCount > 1 && inputs.deceasedGender === 'male') {
        steps.push(`الزوجات يرثن الثمن/الربع بالتساوي، نصيب كل واحدة: ${(spouseValue / inputs.spouseCount).toLocaleString()} ${inputs.currency}`);
      }
    }

    // Mother
    if (inputs.hasMother) {
      list.push({
        heirName: 'الأم',
        shareFraction: `فرض: ${motherShare === 1/3 ? '1/3' : motherShare === 1/6 ? '1/6' : 'ثلث الباقي'}`,
        sharePercentage: finalMotherShare * 100,
        shareValue: finalMotherShare * value,
        proof: motherProof,
        type: 'fardh'
      });
    }

    // Father
    if (inputs.hasFather) {
      const totalFatherShareVal = (finalFatherShare + fatherTaaseebShare) * value;
      list.push({
        heirName: 'الأب',
        shareFraction: fatherIsTaaseeb 
          ? `تعصيب: الباقي` 
          : `فرض: 1/6`,
        sharePercentage: (finalFatherShare + fatherTaaseebShare) * 100,
        shareValue: totalFatherShareVal,
        proof: fatherProof,
        type: fatherIsTaaseeb ? 'taaseeb' : 'fardh'
      });
    }

    // Sons & Daughters (Ta'seeb)
    if (inputs.sonsCount > 0 || inputs.daughtersCount > 0) {
      if (inputs.sonsCount > 0) {
        // Male + Female Ta'seeb logic: double share to male
        const totalSharesForKids = (inputs.sonsCount * 2) + inputs.daughtersCount;
        const totalKidsVal = kidsTotalShare * value;
        const sharePerDaughter = kidsTotalShare / totalSharesForKids;
        const sharePerSon = sharePerDaughter * 2;
        
        list.push({
          heirName: `الأبناء الذكور (${inputs.sonsCount})`,
          shareFraction: `تعصيب (للذكر مثل حظ الأنثيين)`,
          sharePercentage: (sharePerSon * inputs.sonsCount) * 100,
          shareValue: sharePerSon * inputs.sonsCount * value,
          proof: `يرث الأبناء بالتعصيب بالاشتراك مع البنات، للابن ضعف نصيب البنت [النساء: 11]. نصيب كل ابن: ${(sharePerSon * value).toLocaleString()} ${inputs.currency}`,
          type: 'taaseeb'
        });

        if (inputs.daughtersCount > 0) {
          list.push({
            heirName: `البنات (${inputs.daughtersCount})`,
            shareFraction: `تعصيب (للذكر مثل حظ الأنثيين)`,
            sharePercentage: (sharePerDaughter * inputs.daughtersCount) * 100,
            shareValue: sharePerDaughter * inputs.daughtersCount * value,
            proof: `ترث البنات بالتعصيب بالاشتراك مع الأبناء [النساء: 11]. نصيب كل بنت: ${(sharePerDaughter * value).toLocaleString()} ${inputs.currency}`,
            type: 'taaseeb'
          });
        }
      } else {
        // Daughters only (Fardh)
        list.push({
          heirName: `البنات (${inputs.daughtersCount})`,
          shareFraction: daughtersTotalShare === 1/2 ? 'فرض: 1/2' : 'فرض: 2/3',
          sharePercentage: finalDaughtersShare * 100,
          shareValue: finalDaughtersShare * value,
          proof: daughtersProof,
          type: 'fardh'
        });
      }
    }

    // Siblings (Brothers & Sisters)
    if (totalSiblingsCount > 0) {
      if (isBlockedSiblings) {
        list.push({
          heirName: 'الإخوة والأخوات الأشقاء',
          shareFraction: 'محجوبين بالكامل',
          sharePercentage: 0,
          shareValue: 0,
          proof: "يُحجب الإخوة والأخوات تماماً بالأب أو بالفرع الوارث المذكر (الابن).",
          type: 'blocked'
        });
      } else if (inputs.fullBrothersCount > 0) {
        const totalSharesForSiblings = (inputs.fullBrothersCount * 2) + inputs.fullSistersCount;
        const totalSiblingsVal = siblingsTotalShare * value;
        const sharePerSister = siblingsTotalShare / totalSharesForSiblings;
        const sharePerBrother = sharePerSister * 2;
        
        list.push({
          heirName: `الإخوة الأشقاء (${inputs.fullBrothersCount})`,
          shareFraction: `تعصيب (للذكر مثل حظ الأنثيين)`,
          sharePercentage: (sharePerBrother * inputs.fullBrothersCount) * 100,
          shareValue: sharePerBrother * inputs.fullBrothersCount * value,
          proof: `يرث الإخوة بالتعصيب عند عدم وجود الأب أو الابن، نصيب كل أخ: ${(sharePerBrother * value).toLocaleString()} ${inputs.currency}`,
          type: 'taaseeb'
        });

        if (inputs.fullSistersCount > 0) {
          list.push({
            heirName: `الأخوات الشقيقات (${inputs.fullSistersCount})`,
            shareFraction: `تعصيب (للذكر مثل حظ الأنثيين)`,
            sharePercentage: (sharePerSister * inputs.fullSistersCount) * 100,
            shareValue: sharePerSister * inputs.fullSistersCount * value,
            proof: `يرثن تعصيباً مع إخوانهن الذكور. نصيب كل أخت شقيقة: ${(sharePerSister * value).toLocaleString()} ${inputs.currency}`,
            type: 'taaseeb'
          });
        }
      } else if (inputs.fullSistersCount > 0) {
        // Sisters only
        list.push({
          heirName: `الأخوات الشقيقات (${inputs.fullSistersCount})`,
          shareFraction: sistersTotalShare === 1/2 ? 'فرض: 1/2' : 'فرض: 2/3',
          sharePercentage: finalSistersShare * 100,
          shareValue: finalSistersShare * value,
          proof: sistersProof,
          type: 'fardh'
        });
      }
    }

    setResults(list);
    setCalculationSteps(steps);
    
    // Calculate total distributed percentage to confirm math
    const totalP = list.reduce((sum, current) => sum + current.sharePercentage, 0);
    setTotalDistributedPercentage(totalP);
    
    setStep(3);
  };

  return (
    <div className="min-h-screen text-foreground relative py-12 px-4 md:px-8 max-w-5xl mx-auto" dir="rtl">
      
      {/* Background Decorative Gradients */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-[10%] left-[5%] w-[400px] h-[400px] rounded-full bg-primary/10 blur-[120px] animate-pulse-subtle" />
        <div className="absolute bottom-[20%] right-[10%] w-[350px] h-[350px] rounded-full bg-amber-500/10 blur-[100px]" />
      </div>

      {/* Header */}
      <header className="text-center mb-12">
        <div className="inline-flex p-3 rounded-2xl bg-primary/10 border border-primary/20 text-primary mb-4 shadow-glow-primary-sm">
          <Scale className="h-10 w-10" />
        </div>
        <h1 className="text-4xl md:text-5xl font-black font-headline tracking-tight text-white mb-3">
          حاسبة المواريث والفرائض الإلكترونية
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto text-lg leading-relaxed">
          أداة حسابية فقهية دقيقة لحساب وتوزيع التركات والمواريث وتفصيل أنصبة الورثة الشرعيين ببرهانها من الكتاب والسنة.
        </p>
      </header>

      {/* Main Container */}
      <main className="glass-card rounded-3xl p-6 md:p-10 border border-border/80 shadow-2xl relative overflow-hidden">
        
        {/* Step Progress Tracker */}
        <div className="flex items-center justify-between max-w-md mx-auto mb-10 border-b border-white/5 pb-6">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center">
              <div 
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300",
                  step === s 
                    ? "bg-primary text-primary-foreground shadow-glow-primary-sm scale-110" 
                    : step > s 
                      ? "bg-emerald-500 text-white" 
                      : "bg-white/5 text-muted-foreground border border-white/10"
                )}
              >
                {step > s ? <Check className="h-5 w-5" /> : s}
              </div>
              <span className={cn(
                "mr-3 text-sm font-medium",
                step === s ? "text-white font-bold" : "text-muted-foreground"
              )}>
                {s === 1 ? 'البيانات الأساسية' : s === 2 ? 'تحديد الورثة' : 'جدول الأنصبة'}
              </span>
              {s < 3 && <div className="h-[2px] w-12 bg-white/5 mr-4" />}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          
          {/* STEP 1: Basic Info */}
          {step === 1 && (
            <motion.div
              key="step-1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-8"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* Deceased Gender Selection */}
                <div className="space-y-3">
                  <label className="text-white font-bold flex items-center gap-2">
                    جنس المتوفى
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setInputs({ ...inputs, deceasedGender: 'male' })}
                      className={cn(
                        "py-4 px-6 rounded-2xl border-2 transition-all text-center font-bold flex flex-col items-center gap-2",
                        inputs.deceasedGender === 'male' 
                          ? "border-primary bg-primary/5 text-white" 
                          : "border-white/5 bg-white/[0.02] text-muted-foreground hover:border-white/20"
                      )}
                    >
                      <span className="text-2xl">👨</span>
                      <span>ذكر (متوفى)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setInputs({ ...inputs, deceasedGender: 'female' })}
                      className={cn(
                        "py-4 px-6 rounded-2xl border-2 transition-all text-center font-bold flex flex-col items-center gap-2",
                        inputs.deceasedGender === 'female' 
                          ? "border-primary bg-primary/5 text-white" 
                          : "border-white/5 bg-white/[0.02] text-muted-foreground hover:border-white/20"
                      )}
                    >
                      <span className="text-2xl">👩</span>
                      <span>أنثى (متوفاة)</span>
                    </button>
                  </div>
                </div>

                {/* Estate Value */}
                <div className="space-y-3">
                  <label className="text-white font-bold flex items-center gap-2">
                    مقدار التركة الإجمالي
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={inputs.estateValue}
                      onChange={(e) => setInputs({ ...inputs, estateValue: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 pr-12 pl-4 text-white text-lg font-bold focus:outline-none focus:border-primary transition-colors"
                      placeholder="أدخل قيمة التركة"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                      <DollarSign className="h-5 w-5" />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    القيمة المالية الإجمالية للتركة بعد سداد الديون والوصايا الشرعية.
                  </p>
                </div>

                {/* Currency Selection */}
                <div className="space-y-3">
                  <label className="text-white font-bold">العملة</label>
                  <select
                    value={inputs.currency}
                    onChange={(e) => setInputs({ ...inputs, currency: e.target.value })}
                    className="w-full bg-zinc-900 border border-white/10 rounded-2xl py-4 px-4 text-white font-bold focus:outline-none focus:border-primary"
                  >
                    <option value="SAR">ريال سعودي (SAR)</option>
                    <option value="AED">درهم إماراتي (AED)</option>
                    <option value="KWD">دينار كويتي (KWD)</option>
                    <option value="EGP">جنيه مصري (EGP)</option>
                    <option value="USD">دولار أمريكي (USD)</option>
                  </select>
                </div>

              </div>

              {/* Fiqh Tip Banner */}
              <div className="bg-primary/5 border border-primary/20 rounded-2xl p-5 flex items-start gap-4">
                <Info className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="text-white font-bold text-sm">تنبيه فقهي هام:</h4>
                  <p className="text-muted-foreground text-xs leading-relaxed">
                    قبل توزيع الميراث شرعاً، يجب تصفية التركة من أربعة حقوق متعلقة بها بالترتيب: 
                    1) مؤن تجهيز الميت وتكفينه، 2) قضاء الديون والالتزامات، 3) تنفيذ الوصايا الشرعية (في حدود الثلث لغير وارث)، 4) ما تبقى يقسم بين الورثة.
                  </p>
                </div>
              </div>

              {/* Navigation Button */}
              <div className="flex justify-end pt-4">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-8 py-4 rounded-xl bg-primary text-primary-foreground font-bold hover:opacity-90 transition-opacity flex items-center gap-2"
                >
                  التالي: تحديد الورثة <ChevronLeft className="h-5 w-5" />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 2: Heirs input list */}
          {step === 2 && (
            <motion.div
              key="step-2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-8"
            >
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Users className="h-6 w-6 text-primary" /> حدد الأقرباء الباقين على قيد الحياة:
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Spouse Checkbox */}
                <div className="p-5 rounded-2xl border border-white/5 bg-white/[0.01] hover:border-white/10 transition-colors flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-white font-bold block">
                      {inputs.deceasedGender === 'male' ? 'الزوجة' : 'الزوج'}
                    </span>
                    <span className="text-xs text-muted-foreground block">
                      وجود زوج أو زوجات على قمة الورثة.
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    {inputs.deceasedGender === 'male' && inputs.hasSpouse && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">عدد الزوجات:</span>
                        <input
                          type="number"
                          min="1"
                          max="4"
                          value={inputs.spouseCount}
                          onChange={(e) => setInputs({ ...inputs, spouseCount: parseInt(e.target.value) || 1 })}
                          className="w-12 bg-white/5 border border-white/10 rounded-lg p-1 text-center text-white"
                        />
                      </div>
                    )}
                    <input
                      type="checkbox"
                      checked={inputs.hasSpouse}
                      onChange={(e) => setInputs({ ...inputs, hasSpouse: e.target.checked })}
                      className="h-6 w-6 rounded border-white/10 text-primary focus:ring-primary accent-primary"
                    />
                  </div>
                </div>

                {/* Parents (Father) */}
                <div className="p-5 rounded-2xl border border-white/5 bg-white/[0.01] hover:border-white/10 transition-colors flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-white font-bold block">الأب</span>
                    <span className="text-xs text-muted-foreground block">الأب للمتوفى على قيد الحياة.</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={inputs.hasFather}
                    onChange={(e) => setInputs({ ...inputs, hasFather: e.target.checked })}
                    className="h-6 w-6 rounded border-white/10 text-primary focus:ring-primary accent-primary"
                  />
                </div>

                {/* Parents (Mother) */}
                <div className="p-5 rounded-2xl border border-white/5 bg-white/[0.01] hover:border-white/10 transition-colors flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-white font-bold block">الأم</span>
                    <span className="text-xs text-muted-foreground block">الأم للمتوفى على قيد الحياة.</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={inputs.hasMother}
                    onChange={(e) => setInputs({ ...inputs, hasMother: e.target.checked })}
                    className="h-6 w-6 rounded border-white/10 text-primary focus:ring-primary accent-primary"
                  />
                </div>

                {/* Sons Count */}
                <div className="p-5 rounded-2xl border border-white/5 bg-white/[0.01] hover:border-white/10 transition-colors flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-white font-bold block">الأبناء الذكور (الابن)</span>
                    <span className="text-xs text-muted-foreground block">عدد الأبناء الذكور المباشرين.</span>
                  </div>
                  <input
                    type="number"
                    min="0"
                    value={inputs.sonsCount}
                    onChange={(e) => setInputs({ ...inputs, sonsCount: parseInt(e.target.value) || 0 })}
                    className="w-16 bg-white/5 border border-white/10 rounded-lg p-2 text-center text-white font-bold"
                  />
                </div>

                {/* Daughters Count */}
                <div className="p-5 rounded-2xl border border-white/5 bg-white/[0.01] hover:border-white/10 transition-colors flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-white font-bold block">البنات الإناث (البنت)</span>
                    <span className="text-xs text-muted-foreground block">عدد البنات المباشرات للمتوفى.</span>
                  </div>
                  <input
                    type="number"
                    min="0"
                    value={inputs.daughtersCount}
                    onChange={(e) => setInputs({ ...inputs, daughtersCount: parseInt(e.target.value) || 0 })}
                    className="w-16 bg-white/5 border border-white/10 rounded-lg p-2 text-center text-white font-bold"
                  />
                </div>

                {/* Brothers Count */}
                <div className="p-5 rounded-2xl border border-white/5 bg-white/[0.01] hover:border-white/10 transition-colors flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-white font-bold block">الإخوة الأشقاء الذكور</span>
                    <span className="text-xs text-muted-foreground block">الأشقاء من نفس الأب والأم.</span>
                  </div>
                  <input
                    type="number"
                    min="0"
                    value={inputs.fullBrothersCount}
                    onChange={(e) => setInputs({ ...inputs, fullBrothersCount: parseInt(e.target.value) || 0 })}
                    className="w-16 bg-white/5 border border-white/10 rounded-lg p-2 text-center text-white font-bold"
                  />
                </div>

                {/* Sisters Count */}
                <div className="p-5 rounded-2xl border border-white/5 bg-white/[0.01] hover:border-white/10 transition-colors flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-white font-bold block">الأخوات الشقيقات</span>
                    <span className="text-xs text-muted-foreground block">الأخوات الإناث الشقيقات.</span>
                  </div>
                  <input
                    type="number"
                    min="0"
                    value={inputs.fullSistersCount}
                    onChange={(e) => setInputs({ ...inputs, fullSistersCount: parseInt(e.target.value) || 0 })}
                    className="w-16 bg-white/5 border border-white/10 rounded-lg p-2 text-center text-white font-bold"
                  />
                </div>

              </div>

              {/* Navigation Controls */}
              <div className="flex items-center justify-between pt-6 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-6 py-4 rounded-xl border border-white/10 text-white font-bold hover:bg-white/5 transition-colors flex items-center gap-2"
                >
                  <ArrowRight className="h-5 w-5" /> السابق
                </button>

                <button
                  type="button"
                  onClick={calculateInheritance}
                  className="px-8 py-4 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-500 transition-colors flex items-center gap-2 shadow-lg"
                >
                  <Calculator className="h-5 w-5" /> احسب المواريث والأنصبة
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 3: Results screen */}
          {step === 3 && (
            <motion.div
              key="step-3"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.3 }}
              className="space-y-10"
            >
              
              {/* Top highlights Card */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 text-center">
                  <span className="text-xs text-muted-foreground block mb-2">قيمة التركة الإجمالية</span>
                  <span className="text-3xl font-black text-white">
                    {inputs.estateValue.toLocaleString()} <span className="text-lg text-primary">{inputs.currency}</span>
                  </span>
                </div>

                <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 text-center">
                  <span className="text-xs text-muted-foreground block mb-2">حالة المسألة</span>
                  <span className="text-xl font-bold text-emerald-400 block">
                    {isAwal ? 'مسألة عائلة (عول)' : isRadd ? 'مسألة مردودة (رد)' : 'عادية (تامة)'}
                  </span>
                </div>

                <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 text-center">
                  <span className="text-xs text-muted-foreground block mb-2">نسبة التوزيع الإجمالية</span>
                  <span className="text-3xl font-black text-white">
                    {totalDistributedPercentage.toFixed(0)}%
                  </span>
                </div>

              </div>

              {/* Table of Results */}
              <div className="space-y-4">
                <h4 className="text-lg font-bold text-white flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" /> تفاصيل أنصبة الورثة الشرعيين:
                </h4>

                <div className="overflow-x-auto rounded-2xl border border-white/5 bg-white/[0.01]">
                  <table className="w-full text-right border-collapse">
                    <thead>
                      <tr className="border-b border-white/5 bg-white/[0.03]">
                        <th className="p-4 text-white font-bold">الوارث</th>
                        <th className="p-4 text-white font-bold">نوع الإرث</th>
                        <th className="p-4 text-white font-bold">النسبة</th>
                        <th className="p-4 text-white font-bold text-left">قيمة النصيب</th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.map((r, index) => (
                        <tr key={index} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                          <td className="p-4 font-bold text-white">{r.heirName}</td>
                          <td className="p-4">
                            <span className={cn(
                              "px-3 py-1 rounded-full text-xs font-bold",
                              r.type === 'fardh' 
                                ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" 
                                : r.type === 'taaseeb' 
                                  ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" 
                                  : "bg-red-500/10 text-red-400 border border-red-500/20"
                            )}>
                              {r.type === 'fardh' ? 'بالفرض' : r.type === 'taaseeb' ? 'بالتعصيب' : 'محجوب'}
                            </span>
                          </td>
                          <td className="p-4 text-white font-bold">{r.sharePercentage.toFixed(1)}%</td>
                          <td className="p-4 text-emerald-400 font-black text-left">
                            {r.shareValue.toLocaleString(undefined, { maximumFractionDigits: 0 })} {inputs.currency}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Explanations & Quranic Proofs */}
              <div className="space-y-4">
                <h4 className="text-lg font-bold text-white flex items-center gap-2">
                  <Info className="h-5 w-5 text-primary" /> الأدلة الشرعية والبيان العلمي:
                </h4>

                <div className="space-y-4">
                  {results.map((r, index) => r.sharePercentage > 0 && (
                    <div key={index} className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 flex gap-4">
                      <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 text-primary font-bold text-sm flex items-center justify-center flex-shrink-0">
                        {index + 1}
                      </div>
                      <div className="space-y-1">
                        <span className="text-white font-bold text-sm block">{r.heirName}</span>
                        <p className="text-muted-foreground text-xs leading-relaxed">{r.proof}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Technical / Math Steps Accordion */}
              {calculationSteps.length > 0 && (
                <div className="p-5 rounded-2xl bg-zinc-950/40 border border-white/5 space-y-3">
                  <span className="text-xs font-bold text-muted-foreground flex items-center gap-1.5">
                    <AlertTriangle className="h-4 w-4 text-amber-400" /> خطوات المسألة الرياضية الفقهية:
                  </span>
                  <div className="space-y-2">
                    {calculationSteps.map((step, i) => (
                      <p key={i} className="text-muted-foreground text-[11px] font-mono leading-relaxed">
                        • {step}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {/* Navigation Controls */}
              <div className="flex items-center justify-between pt-6 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-6 py-4 rounded-xl border border-white/10 text-white font-bold hover:bg-white/5 transition-colors flex items-center gap-2"
                >
                  <ArrowRight className="h-5 w-5" /> تعديل الورثة
                </button>

                <button
                  type="button"
                  onClick={handleReset}
                  className="px-8 py-4 rounded-xl bg-primary text-primary-foreground font-bold hover:opacity-90 transition-opacity flex items-center gap-2"
                >
                  <RotateCcw className="h-5 w-5" /> مسألة جديدة
                </button>
              </div>

            </motion.div>
          )}

        </AnimatePresence>

      </main>

      {/* Footer Info Box */}
      <footer className="mt-12 text-center text-xs text-muted-foreground leading-relaxed max-w-xl mx-auto space-y-4">
        <p>
          تم برمجة هذه الحاسبة وفق قواعد المواريث الشرعية المستمدة من كتاب الله تعالى وسنة نبينا ﷺ، وتشمل أحكام الفروض والتعصيب والعول والرد والمسائل العمرية الأساسية.
        </p>
        <p className="text-amber-500/80 font-semibold flex items-center justify-center gap-1.5">
          ⚠️ تنبيه: هذه الحاسبة للإرشاد والتعليم فقط. في حالات المواريث الفعلية، يُنصح بالرجوع للمحاكم الشرعية المختصة لتوثيق القسمة.
        </p>
      </footer>

    </div>
  );
}
