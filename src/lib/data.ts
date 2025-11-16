import type { Lecture, Series, Book, ScheduleItem, QAPair } from './types';

export const series: Series[] = [
  { slug: 'aqidah', title: 'سلسلة العقيدة', description: 'شرح مبادئ العقيدة الإسلامية وأركان الإيمان الستة.', lectureCount: 20, imageId: 'series-aqidah' },
  { slug: 'seerah', title: 'سلسلة السيرة النبوية', description: 'دروس وعبر من حياة النبي محمد صلى الله عليه وسلم.', lectureCount: 40, imageId: 'series-seerah' },
  { slug: 'fiqh', title: 'سلسلة الفقه الميسر', description: 'تبسيط مسائل الفقه اليومية التي يحتاجها المسلم.', lectureCount: 30, imageId: 'series-fiqh' },
  { slug: 'tafsir', title: 'سلسلة التفسير', description: 'تفسير لآيات مختارة من القرآن الكريم.', lectureCount: 50, imageId: 'series-tafsir' },
  { slug: 'hadith', title: 'سلسلة الحديث', description: 'شرح أحاديث مختارة من كلام النبي صلى الله عليه وسلم.', lectureCount: 15, imageId: 'series-hadith' },
];

export const lectures: Lecture[] = [
  {
    slug: 'importance-of-tawheed',
    title: 'أهمية التوحيد',
    seriesSlug: 'aqidah',
    seriesTitle: 'سلسلة العقيدة',
    duration: 45,
    audioSrc: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    imageId: 'lecture-thumbnail-1',
    youtubeUrl: 'https://www.youtube.com',
    pdfUrl: '#',
    description: 'في هذه المحاضرة، نستعرض أهمية التوحيد وفضله، وأثره على حياة المسلم.',
    transcript: [
      { timestamp: 0, text: 'بسم الله الرحمن الرحيم. الحمد لله رب العالمين.' },
      { timestamp: 3, text: 'التوحيد هو أساس الدين، وهو أول ما دعا إليه الرسل عليهم السلام.' },
      { timestamp: 8, text: 'في هذه المحاضرة، نستعرض أهمية التوحيد وفضله...' },
      { timestamp: 12, text: 'وينقسم التوحيد إلى ثلاثة أقسام: توحيد الربوبية، وتوحيد الألوهية، وتوحيد الأسماء والصفات.' },
      { timestamp: 17, text: 'فأما توحيد الربوبية، فهو الإقرار بأن الله هو الخالق الرازق المدبر.' },
      { timestamp: 25, text: 'وأما توحيد الألوهية، فهو إفراد الله بالعبادة.' },
    ],
    rating: 4.8,
    ratingCount: 210,
    viewCount: 15000,
    createdAt: '2024-05-10T10:00:00Z',
  },
  {
    slug: 'prophets-birth',
    title: 'المقدمة: العالم قبل البعثة',
    seriesSlug: 'seerah',
    seriesTitle: 'سلسلة السيرة النبوية',
    duration: 50,
    audioSrc: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    imageId: 'lecture-thumbnail-2',
    description: 'نظرة على حال العالم سياسياً ودينياً واجتماعياً قبل بعثة النبي محمد صلى الله عليه وسلم.',
    transcript: [],
    rating: 4.9,
    ratingCount: 350,
    viewCount: 25000,
    createdAt: '2024-05-12T10:00:00Z',
  },
  {
    slug: 'prophets-youth',
    title: 'النشأة والشباب',
    seriesSlug: 'seerah',
    seriesTitle: 'سلسلة السيرة النبوية',
    duration: 48,
    audioSrc: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    imageId: 'lecture-thumbnail-3',
    description: 'مراحل حياة النبي صلى الله عليه وسلم قبل البعثة، من ولادته ورعايته حتى زواجه.',
    transcript: [],
    rating: 4.7,
    ratingCount: 180,
    viewCount: 18000,
    createdAt: '2024-05-05T10:00:00Z',
  },
  {
    slug: 'explaining-nawaqid-al-islam',
    title: 'شرح نواقض الإسلام',
    seriesSlug: 'aqidah',
    seriesTitle: 'سلسلة العقيدة',
    duration: 55,
    audioSrc: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
    imageId: 'lecture-thumbnail-4',
    description: 'شرح تفصيلي للنواقض العشرة التي ذكرها الإمام محمد بن عبد الوهاب.',
    transcript: [],
    rating: 4.6,
    ratingCount: 120,
    viewCount: 12000,
    createdAt: '2024-04-28T10:00:00Z',
  },
  {
    slug: 'virtue-of-knowledge',
    title: 'فضل العلم',
    seriesSlug: 'aqidah',
    seriesTitle: 'سلسلة العقيدة',
    duration: 40,
    audioSrc: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
    imageId: 'lecture-thumbnail-1',
    description: 'بيان فضل العلم الشرعي وأهميته في حياة المسلم.',
    transcript: [],
    rating: 4.9,
    ratingCount: 400,
    viewCount: 30000,
    createdAt: '2024-04-20T10:00:00Z',
  },
];

export const books: Book[] = [
    { slug: 'sharh-al-usul-al-thalatha', title: 'شرح الأصول الثلاثة', pdfUrl: '#', imageId: 'book-cover-1'},
    { slug: 'kitab-al-tawhid', title: 'كتاب التوحيد', pdfUrl: '#', imageId: 'book-cover-2'},
    { slug: 'forty-hadith', title: 'الأربعون النووية', pdfUrl: '#', imageId: 'book-cover-3'},
];

export const schedule: ScheduleItem[] = [
    { id: '1', title: 'شرح كتاب التوحيد (الدرس 5)', date: 'السبت القادم - 22 نوفمبر 2025', time: '8:00 مساءً (بتوقيت مصر)', isLive: true },
    { id: '2', title: 'تفسير سورة الكهف (الدرس 2)', date: 'الأحد القادم - 23 نوفمبر 2025', time: '9:00 مساءً (بتوقيت مصر)', isLive: false },
];

export const qanda: QAPair[] = [
    { id: '1', question: 'س: ما هو حكم صلاة الجماعة؟', answer: 'ج: صلاة الجماعة واجبة على الرجال في المسجد للصلوات الخمس المفروضة على القول الراجح من أقوال أهل العلم.' },
    { id: '2', question: 'س: كيف يمكنني تحميل المحاضرات؟', answer: 'ج: يمكنك تحميل المحاضرات بالضغط على زر "تحميل صوت (MP3)" في صفحة المحاضرة.' },
];

// Helper functions to get data
export const getLatestSeries = (count: number) => series.slice(0, count);
export const getLatestLectures = (count: number) => lectures.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, count);
export const getAllSeries = () => series.sort((a, b) => a.title.localeCompare(b.title, 'ar'));
export const getAllLectures = () => lectures.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
export const getSeriesBySlug = (slug: string) => series.find(s => s.slug === slug);
export const getLecturesBySeries = (seriesSlug: string) => lectures.filter(l => l.seriesSlug === seriesSlug);
export const getLectureBySlug = (slug: string) => lectures.find(l => l.slug === slug);
export const getRelatedLectures = (currentLectureSlug: string, seriesSlug: string) => {
    return lectures.filter(l => l.seriesSlug === seriesSlug && l.slug !== currentLectureSlug).slice(0, 2);
}
export const getAllBooks = () => books;
export const getAllScheduleItems = () => schedule;
export const getAllQAPairs = () => qanda;
