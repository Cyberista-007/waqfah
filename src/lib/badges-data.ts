
import type { GamificationBadge } from '@/lib/types';

// The 'id' should be unique and preferably a URL-friendly slug.
export const badges: GamificationBadge[] = [
    {
        id: "listener-beginner",
        title: "المستمع المبتدئ",
        description: "أكمل ساعة من الاستماع للمحاضرات.",
        icon: "Headphones",
        metric: "minutesListened",
        threshold: 60,
        points: 10,
    },
    {
        id: "listener-pro",
        title: "المستمع المتمرس",
        description: "أكمل 10 ساعات من الاستماع.",
        icon: "Headphones",
        metric: "minutesListened",
        threshold: 600,
        points: 50,
    },
    {
        id: "knowledge-seeker",
        title: "طالب علم",
        description: "أكمل 10 محاضرات.",
        icon: "BookOpen",
        metric: "lecturesCompleted",
        threshold: 10,
        points: 20,
    },
    {
        id: "series-expert",
        title: "خبير السلاسل",
        description: "أكمل أول سلسلة لك.",
        icon: "Film",
        metric: "seriesCompleted",
        threshold: 1,
        points: 30,
    },
    {
        id: "point-collector",
        title: "جامع النقاط",
        description: "اكتسب أول 100 نقطة.",
        icon: "Sparkles",
        metric: "points",
        threshold: 100,
        points: 10,
    },
    {
        id: 'supporter-bronze',
        title: 'الداعم البرونزي',
        description: 'تجاوز مجموع تبرعاتك 500 جنيه.',
        icon: 'Gem',
        metric: 'totalDonated',
        threshold: 500,
        points: 100,
    },
];
