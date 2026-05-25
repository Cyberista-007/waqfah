# خطة تطوير وتنظيم منصة "وقفة" العلمية

تعتبر منصة **وقفة** مشروعاً متميزاً وغنياً بالميزات التفاعلية والمحتوى الإسلامي والعلمي الهادف. لتحسين تجربة المطورين وتسهيل التوسع في المستقبل مع الحفاظ على الأداء المتميز والشكل الاحترافي للمنصة، نقترح خطة عمل منظمة ومقسمة إلى محاور رئيسية:

---

## أولاً: تنظيم الكود وهيكلة الملفات (Codebase Organization)

### 1. تنظيف المجلد الرئيسي للمشروع (Root Directory Cleanup)
يحتوي جذر المشروع حالياً على العديد من ملفات السكربتات المؤقتة وأدوات الفحص والملفات النصية الاحتياطية (مثل سكربتات فحص CSV، سكربتات التعديل الجماعي، وملفات الأخطاء).
*   **التوصية:** إنشاء مجلد باسم `/tools` أو `/scripts` في جذر المشروع، ونقل الملفات التالية إليه ليبقى الجذر نظيفاً ويحتوي فقط على ملفات الإعداد الأساسية:
    *   سكربتات البايثون: `check_delimiter.py` ، `check_headers.py` ، `check_line2.py` ، `convert_ahmad.py` ، `debug_csv.py`.
    *   سكربتات Node.js: `inspect-play-dl.js` ، `mass_replace.js` ، `remove_bgs.js` ، `replace_touch.js` ، `test-download.js`.
    *   الملفات النصية المؤقتة: `original_palestine_page.txt` ، `tmp_old_donations.tsx.txt` ، `ts_errors.txt`.

### 2. إعادة هيكلة مجلد المكونات (Components Restructuring)
يحتوي المجلد `src/components` حالياً على أكثر من 90 ملفاً بشكل مسطح (Flat)، مما يصعّب العثور على المكونات وإعادة استخدامها.
*   **التوصية:** تجميع المكونات المشتركة في مجلدات فرعية متخصصة داخل `src/components`:
    *   `components/ui/`: للمكونات الأساسية البسيطة (مثل الأزرار، الحقول، القوائم المنسدلة، الهياكل العظمية Skeletons).
    *   `components/player/`: للمكونات المتعلقة بمشغل الصوت والفيديو (مثل `floating-audio-player.tsx`، `floating-video-player.tsx`، `audio-visualizer.tsx`، `html5-player.tsx`).
    *   `components/layout/`: للمكونات العامة للموقع (مثل `site-header.tsx`، `site-footer.tsx`، `announcement-bar.tsx`، `page-transition.tsx`).
    *   `components/lectures/`: للمكونات الخاصة بالدروس والمحاضرات (مثل `lecture-card.tsx` / `lecture-chapters.tsx` / `lecture-notes.tsx`).
    *   `components/gamification/`: للمكونات التفاعلية الخاصة بالنقاط والتحديات ومحاسبة النفس (مثل `accountability-tracker.tsx`، `daily-challenges.tsx`، `tasbih-card.tsx`، `quiz-dialog.tsx`).
    *   الإبقاء على ملقّنات الحالات المزاجية والسمات (Providers) في الجذر كملفات أساسية أو وضعها في `components/providers/`.

### 3. حل مشكلات ومخالفات TypeScript
تحليل ملف الأخطاء `ts_errors.txt` يظهر بعض المشاكل الشائعة التي تجب معالجتها لضمان استقرار البناء (Build):
*   **مشكلة التواريخ (`toDate`):** تظهر أخطاء مثل `Property 'toDate' does not exist on type 'string'` بسبب تحويل التواريخ من نوع Firestore `Timestamp` إلى `string` عند نقلها من المكونات الخادمة (Server Components) إلى المكونات العميلية (Client Components).
    *   *الحل:* إنشاء دالة مساعدة (Helper Utility) مثل `parseDate(dateInput: any): Date` تقوم بفحص نوع البيانات؛ إذا كانت كائناً يحتوي على `toDate` تقوم باستدعائه، وإذا كانت نصاً (ISO string) تقوم بتحويلها بـ `new Date(dateInput)`.
*   **تضارب الواجهات والمسميات:**
    *   تغيير استيراد `PinnedLectureSettings` غير الموجود إلى المسمى الفعلي `PinnedItemSettings` في `pinned-lecture.tsx` و `pinned/page.tsx`.
    *   إضافة نوع `Channel` المفقود في `src/lib/types.ts` أو استيراد النوع الصحيح.
    *   استيراد مكون `Button` المفقود في `dew-adhkar.tsx`.

---

## ثانياً: تحسين الأداء وتجربة المستخدم (Performance & UX)

### 1. التحميل الكسول والاستيراد الديناميكي (Dynamic Imports)
المنصة غنية بالمكتبات الثقيلة مثل Recharts (للرسوم البيانية)، Framer Motion (للحركات الفنية)، و Plyr (لمشغلات الوسائط).
*   **التوصية:** استخدام `next/dynamic` من Next.js لتحميل المكونات الثقيلة بشكل كسول (Lazy Loading) فقط عند الحاجة إليها. على سبيل المثال:
    ```typescript
    import dynamic from 'next/dynamic';
    const ChartComponent = dynamic(() => import('@/components/admin/TrafficChart'), { ssr: false });
    const FloatingAudioPlayer = dynamic(() => import('@/components/floating-audio-player'), { ssr: false });
    ```
    سيساهم هذا في تقليل حجم حزمة التحميل الأولية للموقع (Initial Bundle Size) وتسريع فتح الصفحة الرئيسية بشكل كبير.

### 2. تحسين قاعدة البيانات وتخزين البيانات مؤقتاً (Firestore Optimization)
بما أن المنصة تعتمد على Firebase كقاعدة بيانات أساسية، يجب الانتباه لتكلفة عمليات القراءة وسرعة الاستجابة:
*   **تفعيل التخزين المؤقت المحلي (Local Offline Caching):** تفعيل ميزة التخزين المؤقت في Firestore لتقليل عمليات القراءة من الخادم عند تكرار تصفح المستخدم:
    ```typescript
    initializeFirestore(app, {
      localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager()
      })
    });
    ```
*   **تطبيق التصفح المقسم (Pagination):** في صفحات الدروس، السلاسل، ولوحة التحكم، يجب تجنب استدعاء كافة البيانات مرة واحدة واستخدام تقنيات التقسيم (مثل `limit` و `startAfter`) لتقليل حجم البيانات المنقولة.

---

## ثالثاً: ميزات مقترحة للتطوير (Feature Roadmap)

### 1. دمج الذكاء الاصطناعي التوليدي (Genkit AI)
نظراً لوجود ميزة التفريغ النصي للمحاضرات (Transcripts)، يمكن استغلال Genkit لتقديم ميزات فريدة:
*   **التلخيص التلقائي للمحاضرات:** توليد ملخص نصي ذكي ومقسم لعناصر ونقاط أساسية يظهر بجانب المحاضرة.
*   **توليد الأسئلة والاختبارات:** توليد اختبار تفاعلي تلقائي (Quiz) مبني على نص المحاضرة لزيادة تحصيل المستخدم العلمي ومنحه نقاطاً تفاعلية.
*   **البحث الدلالي (Semantic Search):** البحث بالمعنى داخل تفريغات المحاضرات وليس فقط بالكلمات المفتاحية المباشرة.

### 2. دعم البودكاست وتغذية RSS (Podcast Integration)
العديد من المستخدمين يفضلون متابعة السلاسل العلمية والدروس عبر تطبيقات البودكاست المفضلة لديهم (مثل Apple Podcasts أو Spotify).
*   **التوصية:** إنشاء مسار برمجى (API Route) في Next.js مثل `/api/podcasts/[seriesSlug]/rss` يقوم بإنشاء ملف XML متوافق مع معايير البودكاست لكل سلسلة علمية، مما يسمح للمستخدم بنسخ الرابط والاشتراك في السلسلة مباشرة من تطبيقه المفضل.

### 3. دعم التشغيل دون اتصال (Offline Support & PWA)
توفير تجربة تشغيل مثالية للدروس الصوتية في الأماكن التي لا تتوفر فيها شبكة إنترنت قوية:
*   **التوصية:** تطوير نظام تحميل للدروس الصوتية يحفظ الملف الصوتي في ذاكرة المتصفح التخزينية (Cache Storage API or IndexedDB)، مع تقديم واجهة مستخدم توضح الدروس المحملة وتتيح تشغيلها كاملاً دون اتصال بالإنترنت.
