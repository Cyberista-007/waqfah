'use client';

import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useDoc, useCollection, useFirestore, setDocumentNonBlocking } from '@/firebase';
import type { HomepageDetailedConfig, HomepagePathConfig, HomepageFAQConfig, HomepageFeatureConfig, HomepageFeaturedStripConfig } from '@/lib/types';
import type { Lecture } from '@/lib/types';
import { doc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import {
  Loader2, Plus, Trash2, Save, Layout, BookOpen,
  HelpCircle, Star, ExternalLink, Link2, GripVertical,
  Film, Palette, X, Search, CheckCircle2, Circle
} from 'lucide-react';

const LINK_TYPE_LABELS: Record<string, string> = {
  none: 'بدون رابط',
  series: 'سلسلة محاضرات',
  playlist: 'قائمة تشغيل',
  lecture: 'محاضرة مفردة',
  url: 'رابط مخصص',
};

function PathCard({ path, idx, onChange, onRemove }: {
  path: HomepagePathConfig;
  idx: number;
  onChange: (idx: number, field: keyof HomepagePathConfig, value: any) => void;
  onRemove: (idx: number) => void;
}) {
  return (
    <div className="p-5 border border-border/50 rounded-2xl bg-card space-y-4 relative">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
          <Badge variant="outline" className="font-mono">مسار {idx + 1}</Badge>
        </div>
        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8" onClick={() => onRemove(idx)}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">عنوان المسار</Label>
          <Input value={path.title} onChange={(e) => onChange(idx, 'title', e.target.value)} placeholder="مثال: تأسيس طالب العلم" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">أيقونة (Lucide Icon)</Label>
          <Input value={path.icon} onChange={(e) => onChange(idx, 'icon', e.target.value)} placeholder="BookOpen, Shield, Heart..." />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">وصف المسار</Label>
        <Textarea value={path.desc} onChange={(e) => onChange(idx, 'desc', e.target.value)} rows={2} placeholder="وصف مختصر للمسار يظهر للزوار..." />
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">أقسام المسار (مفصولة بفاصلة)</Label>
        <Input
          value={path.parts.join(', ')}
          onChange={(e) => onChange(idx, 'parts', e.target.value.split(',').map(p => p.trim()).filter(Boolean))}
          placeholder="المتن الأول, المتن الثاني, المتن الثالث"
        />
      </div>

      {/* ─── Link Binding ─── */}
      <div className="border-t border-border/40 pt-4 space-y-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          <Link2 className="h-3.5 w-3.5" />
          ربط المسار بمحتوى
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs">نوع الرابط</Label>
            <Select value={path.linkType || 'none'} onValueChange={(v) => onChange(idx, 'linkType', v)}>
              <SelectTrigger>
                <SelectValue placeholder="اختر نوع الرابط..." />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(LINK_TYPE_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {path.linkType && path.linkType !== 'none' && (
            <div className="space-y-1.5">
              <Label className="text-xs">
                {path.linkType === 'series' && 'Slug السلسلة (من الرابط)'}
                {path.linkType === 'playlist' && 'معرّف قائمة التشغيل'}
                {path.linkType === 'lecture' && 'Slug المحاضرة (من الرابط)'}
                {path.linkType === 'url' && 'الرابط الكامل'}
              </Label>
              <div className="relative">
                <Input
                  value={path.linkId || ''}
                  onChange={(e) => onChange(idx, 'linkId', e.target.value)}
                  placeholder={
                    path.linkType === 'series' ? '/series/[slug]' :
                    path.linkType === 'playlist' ? 'playlist-id' :
                    path.linkType === 'lecture' ? '/lectures/[slug]' :
                    'https://...'
                  }
                />
                {path.linkId && (
                  <ExternalLink className="absolute top-1/2 left-3 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Color theme */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">تدرج الخلفية (Tailwind)</Label>
          <Input value={path.color} onChange={(e) => onChange(idx, 'color', e.target.value)} placeholder="from-blue-500/20 to-blue-500/5" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">لون الحدود (Tailwind)</Label>
          <Input value={path.border} onChange={(e) => onChange(idx, 'border', e.target.value)} placeholder="border-blue-500/20" />
        </div>
      </div>
    </div>
  );
}

function FAQCard({ faq, idx, onChange, onRemove }: {
  faq: HomepageFAQConfig;
  idx: number;
  onChange: (idx: number, field: keyof HomepageFAQConfig, value: string) => void;
  onRemove: (idx: number) => void;
}) {
  return (
    <div className="p-5 border border-border/50 rounded-2xl bg-card space-y-4 relative">
      <div className="flex items-center justify-between">
        <Badge variant="outline" className="font-mono">س {idx + 1}</Badge>
        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8" onClick={() => onRemove(idx)}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">السؤال</Label>
        <Input value={faq.q} onChange={(e) => onChange(idx, 'q', e.target.value)} placeholder="اكتب السؤال هنا..." />
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">الإجابة</Label>
        <Textarea value={faq.a} onChange={(e) => onChange(idx, 'a', e.target.value)} rows={3} placeholder="اكتب الإجابة هنا..." />
      </div>
    </div>
  );
}

function FeatureCard({ feature, idx, onChange, onRemove }: {
  feature: HomepageFeatureConfig;
  idx: number;
  onChange: (idx: number, field: keyof HomepageFeatureConfig, value: string) => void;
  onRemove: (idx: number) => void;
}) {
  return (
    <div className="p-5 border border-border/50 rounded-2xl bg-card space-y-4">
      <div className="flex items-center justify-between">
        <Badge variant="outline" className="font-mono">ميزة {idx + 1}</Badge>
        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8" onClick={() => onRemove(idx)}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">العنوان</Label>
          <Input value={feature.title} onChange={(e) => onChange(idx, 'title', e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">الأيقونة (Lucide)</Label>
          <Input value={feature.icon} onChange={(e) => onChange(idx, 'icon', e.target.value)} placeholder="ShieldCheck, Zap..." />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">الوصف</Label>
        <Textarea value={feature.desc} onChange={(e) => onChange(idx, 'desc', e.target.value)} rows={2} />
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">التلوين (Tailwind classes)</Label>
        <Input value={feature.color} onChange={(e) => onChange(idx, 'color', e.target.value)} placeholder="bg-blue-500/10 text-blue-500" />
      </div>
    </div>
  );
}

// ─── Strip Config Card ─────────────────────────────────────
const PRESET_COLORS = [
  '#10b981', '#8b5cf6', '#f59e0b', '#ef4444',
  '#3b82f6', '#ec4899', '#14b8a6', '#f97316',
];

function StripConfigCard({ strip, idx, onChange, onRemove, allLectures, lecturesLoading }: {
  strip: HomepageFeaturedStripConfig;
  idx: number;
  onChange: (idx: number, updated: HomepageFeaturedStripConfig) => void;
  onRemove: (idx: number) => void;
  allLectures: Lecture[];
  lecturesLoading: boolean;
}) {
  const [searchTerm, setSearchTerm] = useState('');

  const selectedIds = new Set(strip.lectureIds || []);

  const filteredLectures = useMemo(() => {
    if (!allLectures) return [];
    const term = searchTerm.toLowerCase().trim();
    if (!term) return allLectures;
    return allLectures.filter(l =>
      l.title?.toLowerCase().includes(term) ||
      l.programName?.toLowerCase().includes(term) ||
      l.seriesTitle?.toLowerCase().includes(term)
    );
  }, [allLectures, searchTerm]);

  const toggleLecture = (lectureId: string) => {
    const current = strip.lectureIds || [];
    const updated = current.includes(lectureId)
      ? current.filter(id => id !== lectureId)
      : [...current, lectureId];
    onChange(idx, { ...strip, lectureIds: updated });
  };

  const removeLectureId = (id: string) => {
    onChange(idx, { ...strip, lectureIds: (strip.lectureIds || []).filter(l => l !== id) });
  };

  const selectedLectures = (strip.lectureIds || [])
    .map(id => allLectures?.find(l => l.id === id))
    .filter(Boolean) as Lecture[];

  return (
    <div className="p-5 border border-border/50 rounded-2xl bg-card space-y-5 relative">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
          <Badge variant="outline" className="font-mono">شريط {idx + 1}</Badge>
        </div>
        <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10 h-8 w-8" onClick={() => onRemove(idx)}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      {/* Title & Subtitle */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">عنوان الشريط</Label>
          <Input
            value={strip.title}
            onChange={e => onChange(idx, { ...strip, title: e.target.value })}
            placeholder="مثال: لا يسع الجاهل جهله"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">العنوان الفرعي (اختياري)</Label>
          <Input
            value={strip.subtitle || ''}
            onChange={e => onChange(idx, { ...strip, subtitle: e.target.value })}
            placeholder="وصف مختصر للشريط"
          />
        </div>
      </div>

      {/* Accent Color */}
      <div className="space-y-2">
        <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
          <Palette className="h-3.5 w-3.5" /> لون الشريط
        </Label>
        <div className="flex items-center gap-3 flex-wrap">
          {PRESET_COLORS.map(color => (
            <button
              key={color}
              type="button"
              onClick={() => onChange(idx, { ...strip, accentColor: color })}
              className="w-7 h-7 rounded-full border-2 transition-all hover:scale-110"
              style={{
                backgroundColor: color,
                borderColor: strip.accentColor === color ? '#fff' : 'transparent',
                boxShadow: strip.accentColor === color ? `0 0 0 2px ${color}` : 'none',
              }}
              aria-label={color}
            />
          ))}
          <Input
            type="text"
            value={strip.accentColor}
            onChange={e => onChange(idx, { ...strip, accentColor: e.target.value })}
            className="w-28 h-8 text-xs font-mono"
            placeholder="#10b981"
          />
        </div>
      </div>

      {/* View All Link */}
      <div className="space-y-1.5">
        <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">رابط "عرض الكل" (اختياري)</Label>
        <Input
          value={strip.viewAllHref || ''}
          onChange={e => onChange(idx, { ...strip, viewAllHref: e.target.value })}
          placeholder="/lectures أو /series/slug"
        />
      </div>

      {/* Lecture Picker */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
            <Film className="h-3.5 w-3.5" /> اختيار المحاضرات
          </Label>
          <span className="text-xs text-muted-foreground">
            {selectedIds.size} مختارة من {allLectures?.length || 0}
          </span>
        </div>

        {/* Selected Lectures Preview */}
        {selectedLectures.length > 0 && (
          <div className="flex flex-wrap gap-2 p-3 bg-muted/30 rounded-xl border border-border/40">
            {selectedLectures.map((lec, order) => (
              <div
                key={lec.id}
                className="flex items-center gap-1.5 bg-background border border-border/50 px-2.5 py-1 rounded-lg text-xs"
              >
                <span className="w-4 h-4 rounded-full bg-primary/20 text-primary text-[10px] font-black flex items-center justify-center shrink-0">{order + 1}</span>
                <span className="max-w-[160px] truncate font-medium">{lec.title}</span>
                <button
                  type="button"
                  onClick={() => removeLectureId(lec.id)}
                  className="text-muted-foreground hover:text-destructive transition-colors shrink-0"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Search Box */}
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="ابحث باسم المحاضرة، السلسلة، أو البرنامج..."
            className="h-9 text-sm pr-9"
          />
        </div>

        {/* Lecture List */}
        <div className="border border-border/50 rounded-xl overflow-hidden">
          {lecturesLoading ? (
            <div className="flex items-center justify-center py-8 gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">جاري تحميل المحاضرات...</span>
            </div>
          ) : (
            <ScrollArea className="h-72">
              <div className="divide-y divide-border/30">
                {filteredLectures.length === 0 ? (
                  <p className="text-center text-sm text-muted-foreground py-8">لا توجد نتائج لبحثك.</p>
                ) : (
                  filteredLectures.map(lecture => {
                    const isSelected = selectedIds.has(lecture.id);
                    return (
                      <button
                        key={lecture.id}
                        type="button"
                        onClick={() => toggleLecture(lecture.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-right transition-colors hover:bg-muted/50 ${
                          isSelected ? 'bg-primary/5 border-r-2 border-primary' : ''
                        }`}
                      >
                        {/* Selected indicator */}
                        <div className="shrink-0">
                          {isSelected ? (
                            <CheckCircle2 className="h-4 w-4 text-primary" />
                          ) : (
                            <Circle className="h-4 w-4 text-muted-foreground/40" />
                          )}
                        </div>
                        {/* Info */}
                        <div className="flex-1 min-w-0 text-right">
                          <p className={`text-sm leading-snug truncate ${
                            isSelected ? 'font-bold text-foreground' : 'font-medium text-foreground/80'
                          }`}>
                            {lecture.title}
                          </p>
                          <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
                            {lecture.programName && <span>{lecture.programName}</span>}
                            {lecture.programName && lecture.seriesTitle && <span className="mx-1">·</span>}
                            {lecture.seriesTitle && <span className="opacity-70">{lecture.seriesTitle}</span>}
                          </p>
                        </div>
                        {/* Order badge if selected */}
                        {isSelected && (
                          <div className="shrink-0 w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-black flex items-center justify-center">
                            {(strip.lectureIds || []).indexOf(lecture.id) + 1}
                          </div>
                        )}
                      </button>
                    );
                  })
                )}
              </div>
            </ScrollArea>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────
export default function AdminHomepageConfigPage() {
  const { toast } = useToast();
  const firestore = useFirestore();
  const { data: currentSettings, isLoading } = useDoc<HomepageDetailedConfig>('settings/homepage');
  const { data: allLectures, isLoading: lecturesLoading } = useCollection<Lecture>('lectures', { orderBy: ['createdAt', 'desc'] });

  const [paths, setPaths] = useState<HomepagePathConfig[]>([]);
  const [faqs, setFaqs] = useState<HomepageFAQConfig[]>([]);
  const [features, setFeatures] = useState<HomepageFeatureConfig[]>([]);
  const [strips, setStrips] = useState<HomepageFeaturedStripConfig[]>([]);

  useEffect(() => {
    if (currentSettings) {
      setPaths(currentSettings.paths || []);
      setFaqs(currentSettings.faqs || []);
      setFeatures(currentSettings.features || []);
      setStrips(currentSettings.featuredStrips || []);
    }
  }, [currentSettings]);

  const handleSubmit = () => {
    if (!firestore) return;
    const settingsRef = doc(firestore, 'settings', 'homepage');
    setDocumentNonBlocking(settingsRef, { paths, faqs, features, featuredStrips: strips }, { merge: true });
    toast({ title: '✅ تم حفظ التغييرات بنجاح!' });
  };

  // Paths handlers
  const addPath = () => setPaths([...paths, { title: '', desc: '', parts: [], icon: 'BookOpen', color: 'from-blue-500/20 to-blue-500/5', border: 'border-blue-500/20', linkType: 'none', linkId: '' }]);
  const updatePath = (idx: number, field: keyof HomepagePathConfig, value: any) => { const n = [...paths]; n[idx] = { ...n[idx], [field]: value }; setPaths(n); };
  const removePath = (idx: number) => setPaths(paths.filter((_, i) => i !== idx));

  // FAQs handlers
  const addFaq = () => setFaqs([...faqs, { q: '', a: '' }]);
  const updateFaq = (idx: number, field: keyof HomepageFAQConfig, value: string) => { const n = [...faqs]; n[idx] = { ...n[idx], [field]: value }; setFaqs(n); };
  const removeFaq = (idx: number) => setFaqs(faqs.filter((_, i) => i !== idx));

  // Features handlers
  const addFeature = () => setFeatures([...features, { title: '', desc: '', icon: 'Star', color: 'bg-primary/10 text-primary' }]);
  const updateFeature = (idx: number, field: keyof HomepageFeatureConfig, value: string) => { const n = [...features]; n[idx] = { ...n[idx], [field]: value }; setFeatures(n); };
  const removeFeature = (idx: number) => setFeatures(features.filter((_, i) => i !== idx));

  // Strips handlers
  const addStrip = () => setStrips([...strips, { title: '', subtitle: '', accentColor: '#10b981', lectureIds: [], viewAllHref: '' }]);
  const updateStrip = (idx: number, updated: HomepageFeaturedStripConfig) => { const n = [...strips]; n[idx] = updated; setStrips(n); };
  const removeStrip = (idx: number) => setStrips(strips.filter((_, i) => i !== idx));

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 text-muted-foreground">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-sm">جاري تحميل الإعدادات...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-headline flex items-center gap-2">
            <Layout className="h-6 w-6 text-primary" />
            تخصيص الصفحة الرئيسية
          </h1>
          <p className="text-sm text-muted-foreground mt-1">تحكم في محتوى وعناصر الصفحة الرئيسية للزوار</p>
        </div>
        <Button onClick={handleSubmit} className="gap-2 font-bold shadow-lg shrink-0">
          <Save className="h-4 w-4" />
          حفظ التغييرات
        </Button>
      </div>

      <Tabs defaultValue="strips" dir="rtl">
        <TabsList className="grid grid-cols-4 w-full h-12 rounded-xl">
          <TabsTrigger value="strips" className="gap-2 rounded-lg font-bold">
            <Film className="h-4 w-4" />
            الشرائط
            {strips.length > 0 && <Badge className="h-5 px-1.5 text-xs font-mono">{strips.length}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="paths" className="gap-2 rounded-lg font-bold">
            <BookOpen className="h-4 w-4" />
            المسارات
            {paths.length > 0 && <Badge className="h-5 px-1.5 text-xs font-mono">{paths.length}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="features" className="gap-2 rounded-lg font-bold">
            <Star className="h-4 w-4" />
            المميزات
            {features.length > 0 && <Badge className="h-5 px-1.5 text-xs font-mono">{features.length}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="faqs" className="gap-2 rounded-lg font-bold">
            <HelpCircle className="h-4 w-4" />
            الأسئلة
            {faqs.length > 0 && <Badge className="h-5 px-1.5 text-xs font-mono">{faqs.length}</Badge>}
          </TabsTrigger>
        </TabsList>

        {/* ── Strips Tab ── */}
        <TabsContent value="strips" className="mt-6 space-y-4">
          {/* Status: shows what's actually saved in Firestore */}
          {currentSettings?.featuredStrips && currentSettings.featuredStrips.length > 0 && (
            <div className="flex items-center gap-3 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-sm">
              <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 animate-pulse" />
              <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                محفوظ في Firestore: {currentSettings.featuredStrips.length} شريط
                {' '}({currentSettings.featuredStrips.reduce((acc, s) => acc + (s.lectureIds?.length || 0), 0)} محاضرة إجمالاً)
              </span>
              <span className="text-xs text-muted-foreground opacity-70 mr-auto">يظهر في الصفحة الرئيسية بعد إعادة التحميل</span>
            </div>
          )}

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Film className="h-4 w-4 text-primary" />
                الشرائط الموضوعية
              </CardTitle>
              <CardDescription>
                أضف شرائط أفقية في الصفحة الرئيسية، كل شريط يعرض مجموعة محاضرات منتقاة حول موضوع معين.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {strips.length === 0 && (
                <div className="text-center py-12 text-muted-foreground border-2 border-dashed border-border/50 rounded-2xl">
                  <Film className="h-10 w-10 mx-auto mb-3 opacity-30" />
                  <p className="text-sm font-medium">لا توجد شرائط بعد</p>
                  <p className="text-xs mt-1 opacity-60">أضف أول شريط موضوعي لعرضه في الصفحة الرئيسية</p>
                </div>
              )}
              {strips.map((strip, idx) => (
                <StripConfigCard
                  key={idx}
                  strip={strip}
                  idx={idx}
                  onChange={updateStrip}
                  onRemove={removeStrip}
                  allLectures={allLectures || []}
                  lecturesLoading={lecturesLoading}
                />
              ))}
              <Button variant="outline" className="w-full border-dashed h-12 text-sm font-medium" onClick={addStrip}>
                <Plus className="ml-2 h-4 w-4" /> إضافة شريط موضوعي جديد
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Paths Tab ── */}
        <TabsContent value="paths" className="mt-6 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">مسارات طلب العلم</CardTitle>
              <CardDescription>
                أضف مسارات تعليمية منظمة واربطها بسلاسل أو قوائم تشغيل أو محاضرات مباشرة.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {paths.length === 0 && (
                <div className="text-center py-10 text-muted-foreground border-2 border-dashed border-border/50 rounded-2xl">
                  <BookOpen className="h-8 w-8 mx-auto mb-3 opacity-40" />
                  <p className="text-sm">لا توجد مسارات بعد. أضف أول مسار!</p>
                </div>
              )}
              {paths.map((path, idx) => (
                <PathCard key={idx} path={path} idx={idx} onChange={updatePath} onRemove={removePath} />
              ))}
              <Button variant="outline" className="w-full border-dashed h-12 text-sm font-medium" onClick={addPath}>
                <Plus className="ml-2 h-4 w-4" /> إضافة مسار جديد
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Features Tab ── */}
        <TabsContent value="features" className="mt-6 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">مميزات المنصة</CardTitle>
              <CardDescription>
                النقاط التسويقية التي تظهر في قسم "لماذا وقفة؟" لإقناع الزوار الجدد.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {features.length === 0 && (
                <div className="text-center py-10 text-muted-foreground border-2 border-dashed border-border/50 rounded-2xl">
                  <Star className="h-8 w-8 mx-auto mb-3 opacity-40" />
                  <p className="text-sm">لا توجد مميزات بعد. أضف أول ميزة!</p>
                </div>
              )}
              {features.map((feature, idx) => (
                <FeatureCard key={idx} feature={feature} idx={idx} onChange={updateFeature} onRemove={removeFeature} />
              ))}
              <Button variant="outline" className="w-full border-dashed h-12 text-sm font-medium" onClick={addFeature}>
                <Plus className="ml-2 h-4 w-4" /> إضافة ميزة جديدة
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── FAQs Tab ── */}
        <TabsContent value="faqs" className="mt-6 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">الأسئلة الشائعة</CardTitle>
              <CardDescription>
                أجب على تساؤلات الزوار مباشرة في الصفحة الرئيسية.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {faqs.length === 0 && (
                <div className="text-center py-10 text-muted-foreground border-2 border-dashed border-border/50 rounded-2xl">
                  <HelpCircle className="h-8 w-8 mx-auto mb-3 opacity-40" />
                  <p className="text-sm">لا توجد أسئلة بعد. أضف أول سؤال!</p>
                </div>
              )}
              {faqs.map((faq, idx) => (
                <FAQCard key={idx} faq={faq} idx={idx} onChange={updateFaq} onRemove={removeFaq} />
              ))}
              <Button variant="outline" className="w-full border-dashed h-12 text-sm font-medium" onClick={addFaq}>
                <Plus className="ml-2 h-4 w-4" /> إضافة سؤال جديد
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Bottom Save */}
      <div className="flex justify-end pt-2">
        <Button onClick={handleSubmit} size="lg" className="gap-2 font-bold shadow-lg">
          <Save className="h-5 w-5" />
          حفظ جميع التغييرات
        </Button>
      </div>
    </div>
  );
}
