export type AccountabilityAction = {
  id: string;
  label: string;
  points: number;
};

export type AccountabilityActionGroup = {
  id: string;
  title: string;
  type: 'single' | 'multi';
  actions: AccountabilityAction[];
};

export type PrayerAccountabilityConfig = {
  name: string;
  groups: AccountabilityActionGroup[];
};

export const accountabilityStructure: Record<string, PrayerAccountabilityConfig> = {
  fajr: {
    name: 'الفجر',
    groups: [
      {
        id: 'fajr_prayer',
        title: 'الصلاة',
        type: 'single',
        actions: [
          { id: 'fajr_prayer_mosque', label: 'في المسجد', points: 5 },
          { id: 'fajr_prayer_ontime', label: 'على الوقت في البيت', points: 3 },
          { id: 'fajr_prayer_late', label: 'تأخرت ولكن داخل وقتها', points: 1 },
        ],
      },
      {
        id: 'fajr_adhkar_after',
        title: 'أذكار بعد الصلاة',
        type: 'multi',
        actions: [{ id: 'fajr_adhkar_after_action', label: 'قراءة الأذكار', points: 2 }],
      },
      {
        id: 'fajr_adhkar_morning',
        title: 'أذكار الصباح',
        type: 'multi',
        actions: [{ id: 'fajr_adhkar_morning_action', label: 'قراءة الأذكار', points: 2 }],
      },
       {
        id: 'fajr_sunnah',
        title: 'سنن الصلاة',
        type: 'multi',
        actions: [{ id: 'fajr_sunnah_action', label: 'سنة الفجر القبلية', points: 2 }],
      },
       {
        id: 'fajr_waking_adhkar',
        title: 'أذكار الاستيقاظ',
        type: 'multi',
        actions: [{ id: 'fajr_waking_adhkar_action', label: 'قراءة الأذكار', points: 1 }],
      },
    ],
  },
  dhuhr: {
    name: 'الظهر',
    groups: [
      {
        id: 'dhuhr_prayer',
        title: 'الصلاة',
        type: 'single',
        actions: [
          { id: 'dhuhr_prayer_mosque', label: 'في المسجد', points: 5 },
          { id: 'dhuhr_prayer_ontime', label: 'على الوقت', points: 3 },
          { id: 'dhuhr_prayer_late', label: 'تأخرت ولكن داخل وقتها', points: 1 },
        ],
      },
      {
        id: 'dhuhr_adhkar_after',
        title: 'أذكار بعد الصلاة',
        type: 'multi',
        actions: [{ id: 'dhuhr_adhkar_after_action', label: 'قراءة الأذكار', points: 2 }],
      },
      {
        id: 'dhuhr_sunnah',
        title: 'سنن الصلاة',
        type: 'multi',
        actions: [
            { id: 'dhuhr_sunnah_qabliyah_4', label: '4 ركعات قبلها', points: 2 },
            { id: 'dhuhr_sunnah_badiyah_2', label: 'ركعتان بعدها', points: 1 },
        ],
      },
    ],
  },
  asr: {
    name: 'العصر',
    groups: [
       {
        id: 'asr_prayer',
        title: 'الصلاة',
        type: 'single',
        actions: [
          { id: 'asr_prayer_mosque', label: 'في المسجد', points: 5 },
          { id: 'asr_prayer_ontime', label: 'على الوقت', points: 3 },
          { id: 'asr_prayer_late', label: 'تأخرت ولكن داخل وقتها', points: 1 },
        ],
      },
      {
        id: 'asr_adhkar_after',
        title: 'أذكار بعد الصلاة',
        type: 'multi',
        actions: [{ id: 'asr_adhkar_after_action', label: 'قراءة الأذكار', points: 2 }],
      },
       {
        id: 'asr_adhkar_evening',
        title: 'أذكار المساء',
        type: 'multi',
        actions: [{ id: 'asr_adhkar_evening_action', label: 'قراءة الأذكار', points: 2 }],
      },
       {
        id: 'asr_sunnah',
        title: 'سنن الصلاة',
        type: 'multi',
        actions: [
            { id: 'asr_sunnah_qabliyah_4', label: '4 ركعات قبلها', points: 2 },
        ],
      },
    ],
  },
  maghrib: {
    name: 'المغرب',
    groups: [
      {
        id: 'maghrib_prayer',
        title: 'الصلاة',
        type: 'single',
        actions: [
          { id: 'maghrib_prayer_mosque', label: 'في المسجد', points: 5 },
          { id: 'maghrib_prayer_ontime', label: 'على الوقت', points: 3 },
          { id: 'maghrib_prayer_late', label: 'تأخرت ولكن داخل وقتها', points: 1 },
        ],
      },
      {
        id: 'maghrib_adhkar_after',
        title: 'أذكار بعد الصلاة',
        type: 'multi',
        actions: [{ id: 'maghrib_adhkar_after_action', label: 'قراءة الأذكار', points: 2 }],
      },
      {
        id: 'maghrib_sunnah',
        title: 'سنن الصلاة',
        type: 'multi',
        actions: [
            { id: 'maghrib_sunnah_badiyah_2', label: 'ركعتان بعدها', points: 2 },
        ],
      },
    ],
  },
  isha: {
    name: 'العشاء',
    groups: [
      {
        id: 'isha_prayer',
        title: 'الصلاة',
        type: 'single',
        actions: [
          { id: 'isha_prayer_mosque', label: 'في المسجد', points: 5 },
          { id: 'isha_prayer_ontime', label: 'على الوقت', points: 3 },
          { id: 'isha_prayer_late', label: 'تأخرت ولكن داخل وقتها', points: 1 },
        ],
      },
      {
        id: 'isha_adhkar_after',
        title: 'أذكار بعد الصلاة',
        type: 'multi',
        actions: [{ id: 'isha_adhkar_after_action', label: 'قراءة الأذكار', points: 2 }],
      },
      {
        id: 'isha_sunnah',
        title: 'سنن الصلاة',
        type: 'multi',
        actions: [
            { id: 'isha_sunnah_badiyah_2', label: 'ركعتان بعدها', points: 1 },
        ],
      },
      {
        id: 'witr_prayer',
        title: 'صلاة الوتر',
        type: 'multi',
        actions: [
            { id: 'witr_prayer_action', label: 'صلاة الوتر', points: 3 },
        ],
      },
      {
        id: 'isha_sleep_adhkar',
        title: 'أذكار النوم',
        type: 'multi',
        actions: [
            { id: 'isha_sleep_adhkar_action', label: 'قراءة الأذكار', points: 1 },
        ],
      },
    ],
  },
  general: {
      name: 'عام',
      groups: [
          {
              id: 'quran',
              title: 'القرآن الكريم',
              type: 'multi',
              actions: [
                  { id: 'quran_read_juz', label: 'قراءة جزء', points: 10},
                  { id: 'quran_read_hizb', label: 'قراءة حزب', points: 5},
                  { id: 'quran_read_quarter_hizb', label: 'قراءة ربع حزب', points: 2},
              ]
          },
          {
              id: 'knowledge',
              title: 'طلب العلم',
              type: 'multi',
              actions: [
                  { id: 'knowledge_lecture', label: 'استماع لمحاضرة', points: 3},
                  { id: 'knowledge_book', label: 'قراءة في كتاب', points: 3},
              ]
          },
          {
              id: 'charity',
              title: 'الصدقة',
              type: 'multi',
              actions: [
                  { id: 'charity_action', label: 'تصدقت اليوم', points: 5},
              ]
          }
      ]
  }
};
