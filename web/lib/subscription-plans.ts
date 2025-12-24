// Potrzebny.AI V3 - Complete Subscription Plans for Poland
// All prices in PLN (Polish Zloty)
// 3-day free trial, then automatic renewal

export interface SubscriptionPlan {
  id: string;
  name: string;
  namePl: string;
  description: string;
  descriptionPl: string;
  priceMonthlyPln: number;
  priceYearlyPln: number;
  stripePriceIdMonthly: string;
  stripePriceIdYearly: string;
  features: string[];
  featuresPl: string[];
  trialDays: number;
  isPopular?: boolean;
  maxUsers?: number;
  category: 'educational' | 'patient' | 'doctor' | 'therapist' | 'parent' | 'admin';
}

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  // === EDUCATIONAL PLANS ===
  {
    id: 'edu_basic',
    name: 'Educational Basic',
    namePl: 'Edukacyjny Basic',
    description: 'Perfect for individual learners',
    descriptionPl: 'Idealny dla indywidualnych uczniów',
    priceMonthlyPln: 29,
    priceYearlyPln: 290,
    stripePriceIdMonthly: process.env.STRIPE_PRICE_EDU_BASIC_MONTHLY!,
    stripePriceIdYearly: process.env.STRIPE_PRICE_EDU_BASIC_YEARLY!,
    trialDays: 3,
    category: 'educational',
    features: [
      'Access to all courses',
      'Flashcards & Quizzes',
      'Progress tracking',
      'Mobile app access',
      'Email support',
    ],
    featuresPl: [
      'Dostęp do wszystkich kursów',
      'Fiszki i Quizy',
      'Śledzenie postępów',
      'Dostęp do aplikacji mobilnej',
      'Wsparcie email',
    ],
  },
  {
    id: 'edu_pro',
    name: 'Educational Pro',
    namePl: 'Edukacyjny Pro',
    description: 'For serious learners',
    descriptionPl: 'Dla zaawansowanych uczniów',
    priceMonthlyPln: 59,
    priceYearlyPln: 590,
    stripePriceIdMonthly: process.env.STRIPE_PRICE_EDU_PRO_MONTHLY!,
    stripePriceIdYearly: process.env.STRIPE_PRICE_EDU_PRO_YEARLY!,
    trialDays: 3,
    isPopular: true,
    category: 'educational',
    features: [
      'Everything in Basic',
      'Super Mózg memory techniques',
      'AI-powered learning paths',
      'Certificates',
      'Priority support',
      'Offline mode',
    ],
    featuresPl: [
      'Wszystko z planu Basic',
      'Techniki pamięciowe Super Mózg',
      'Ścieżki nauki oparte na AI',
      'Certyfikaty',
      'Priorytetowe wsparcie',
      'Tryb offline',
    ],
  },
  {
    id: 'edu_premium',
    name: 'Educational Premium',
    namePl: 'Edukacyjny Premium',
    description: 'Complete learning experience',
    descriptionPl: 'Kompletne doświadczenie nauki',
    priceMonthlyPln: 99,
    priceYearlyPln: 990,
    stripePriceIdMonthly: process.env.STRIPE_PRICE_EDU_PREMIUM_MONTHLY!,
    stripePriceIdYearly: process.env.STRIPE_PRICE_EDU_PREMIUM_YEARLY!,
    trialDays: 3,
    category: 'educational',
    features: [
      'Everything in Pro',
      '1-on-1 tutoring sessions',
      'Custom learning plans',
      'Early access to new features',
      'VIP support',
      'Family sharing (up to 5)',
    ],
    featuresPl: [
      'Wszystko z planu Pro',
      'Sesje korepetycji 1-na-1',
      'Spersonalizowane plany nauki',
      'Wczesny dostęp do nowych funkcji',
      'Wsparcie VIP',
      'Udostępnianie rodzinne (do 5 osób)',
    ],
    maxUsers: 5,
  },

  // === PATIENT PLANS ===
  {
    id: 'patient_basic',
    name: 'Patient Basic',
    namePl: 'Pacjent Basic',
    description: 'Mental health tracking',
    descriptionPl: 'Śledzenie zdrowia psychicznego',
    priceMonthlyPln: 39,
    priceYearlyPln: 390,
    stripePriceIdMonthly: process.env.STRIPE_PRICE_PATIENT_BASIC_MONTHLY!,
    stripePriceIdYearly: process.env.STRIPE_PRICE_PATIENT_BASIC_YEARLY!,
    trialDays: 3,
    category: 'patient',
    features: [
      'Encrypted therapy notes',
      'Mood tracking',
      'Meditation exercises',
      'GDPR compliant',
      'Export your data',
    ],
    featuresPl: [
      'Szyfrowane notatki terapeutyczne',
      'Śledzenie nastroju',
      'Ćwiczenia medytacyjne',
      'Zgodność z RODO',
      'Eksport danych',
    ],
  },
  {
    id: 'patient_pro',
    name: 'Patient Pro',
    namePl: 'Pacjent Pro',
    description: 'Complete mental wellness',
    descriptionPl: 'Kompletna opieka nad zdrowiem psychicznym',
    priceMonthlyPln: 79,
    priceYearlyPln: 790,
    stripePriceIdMonthly: process.env.STRIPE_PRICE_PATIENT_PRO_MONTHLY!,
    stripePriceIdYearly: process.env.STRIPE_PRICE_PATIENT_PRO_YEARLY!,
    trialDays: 3,
    isPopular: true,
    category: 'patient',
    features: [
      'Everything in Basic',
      'Connect with therapist',
      'Video consultations',
      'AI wellness insights',
      'Crisis support resources',
      '24/7 chat support',
    ],
    featuresPl: [
      'Wszystko z planu Basic',
      'Połączenie z terapeutą',
      'Konsultacje wideo',
      'Analiza AI',
      'Zasoby wsparcia kryzysowego',
      'Chat 24/7',
    ],
  },

  // === DOCTOR PLANS ===
  {
    id: 'doctor_basic',
    name: 'Doctor Basic',
    namePl: 'Lekarz Basic',
    description: 'For medical professionals',
    descriptionPl: 'Dla profesjonalistów medycznych',
    priceMonthlyPln: 149,
    priceYearlyPln: 1490,
    stripePriceIdMonthly: process.env.STRIPE_PRICE_DOCTOR_BASIC_MONTHLY!,
    stripePriceIdYearly: process.env.STRIPE_PRICE_DOCTOR_BASIC_YEARLY!,
    trialDays: 3,
    category: 'doctor',
    features: [
      'Patient management',
      'Appointment scheduling',
      'Encrypted patient records',
      'HIPAA compliant',
      'Basic analytics',
    ],
    featuresPl: [
      'Zarządzanie pacjentami',
      'Harmonogram wizyt',
      'Szyfrowane karty pacjentów',
      'Zgodność z HIPAA',
      'Podstawowe analizy',
    ],
  },
  {
    id: 'doctor_pro',
    name: 'Doctor Pro',
    namePl: 'Lekarz Pro',
    description: 'Advanced medical practice',
    descriptionPl: 'Zaawansowana praktyka medyczna',
    priceMonthlyPln: 299,
    priceYearlyPln: 2990,
    stripePriceIdMonthly: process.env.STRIPE_PRICE_DOCTOR_PRO_MONTHLY!,
    stripePriceIdYearly: process.env.STRIPE_PRICE_DOCTOR_PRO_YEARLY!,
    trialDays: 3,
    isPopular: true,
    category: 'doctor',
    features: [
      'Everything in Basic',
      'Video consultations',
      'AI diagnosis assistance',
      'E-prescriptions',
      'Team collaboration',
      'Advanced analytics',
      'API access',
    ],
    featuresPl: [
      'Wszystko z planu Basic',
      'Konsultacje wideo',
      'Asystent diagnozy AI',
      'E-recepty',
      'Współpraca zespołowa',
      'Zaawansowane analizy',
      'Dostęp do API',
    ],
  },

  // === THERAPIST PLANS ===
  {
    id: 'therapist_29',
    name: 'Therapist Starter',
    namePl: 'Terapeuta Starter',
    description: 'Start your practice',
    descriptionPl: 'Rozpocznij swoją praktykę',
    priceMonthlyPln: 29,
    priceYearlyPln: 290,
    stripePriceIdMonthly: process.env.STRIPE_PRICE_THERAPIST_29_MONTHLY!,
    stripePriceIdYearly: process.env.STRIPE_PRICE_THERAPIST_29_YEARLY!,
    trialDays: 3,
    category: 'therapist',
    features: [
      'Up to 10 patients',
      'Encrypted notes (AES-256)',
      'Session scheduling',
      'GDPR Art. 9 compliant',
    ],
    featuresPl: [
      'Do 10 pacjentów',
      'Szyfrowane notatki (AES-256)',
      'Planowanie sesji',
      'Zgodność z RODO Art. 9',
    ],
    maxUsers: 10,
  },
  {
    id: 'therapist_79',
    name: 'Therapist Pro',
    namePl: 'Terapeuta Pro',
    description: 'For established practices',
    descriptionPl: 'Dla rozwiniętych praktyk',
    priceMonthlyPln: 79,
    priceYearlyPln: 790,
    stripePriceIdMonthly: process.env.STRIPE_PRICE_THERAPIST_79_MONTHLY!,
    stripePriceIdYearly: process.env.STRIPE_PRICE_THERAPIST_79_YEARLY!,
    trialDays: 3,
    isPopular: true,
    category: 'therapist',
    features: [
      'Unlimited patients',
      'Everything in Starter',
      'Video sessions',
      'Treatment plan templates',
      'Progress analytics',
      'Automated reminders',
    ],
    featuresPl: [
      'Nieograniczona liczba pacjentów',
      'Wszystko ze Starter',
      'Sesje wideo',
      'Szablony planów leczenia',
      'Analiza postępów',
      'Automatyczne przypomnienia',
    ],
  },

  // === PARENT PLANS ===
  {
    id: 'parent_basic',
    name: 'Parent Basic',
    namePl: 'Rodzic Basic',
    description: 'Monitor your child\'s learning',
    descriptionPl: 'Monitoruj naukę swojego dziecka',
    priceMonthlyPln: 19,
    priceYearlyPln: 190,
    stripePriceIdMonthly: process.env.STRIPE_PRICE_PARENT_BASIC_MONTHLY!,
    stripePriceIdYearly: process.env.STRIPE_PRICE_PARENT_BASIC_YEARLY!,
    trialDays: 3,
    category: 'parent',
    features: [
      '1 child account',
      'Progress reports',
      'Learning time limits',
      'Content filters',
      'Weekly summaries',
    ],
    featuresPl: [
      '1 konto dziecka',
      'Raporty postępów',
      'Limity czasu nauki',
      'Filtry treści',
      'Tygodniowe podsumowania',
    ],
    maxUsers: 1,
  },
  {
    id: 'parent_premium',
    name: 'Parent Premium',
    namePl: 'Rodzic Premium',
    description: 'Full family learning',
    descriptionPl: 'Pełna nauka rodzinna',
    priceMonthlyPln: 49,
    priceYearlyPln: 490,
    stripePriceIdMonthly: process.env.STRIPE_PRICE_PARENT_PREMIUM_MONTHLY!,
    stripePriceIdYearly: process.env.STRIPE_PRICE_PARENT_PREMIUM_YEARLY!,
    trialDays: 3,
    isPopular: true,
    category: 'parent',
    features: [
      'Up to 5 children',
      'Everything in Basic',
      'Detailed analytics',
      'Teacher communication',
      'Custom learning goals',
      'Reward system',
    ],
    featuresPl: [
      'Do 5 dzieci',
      'Wszystko z planu Basic',
      'Szczegółowe analizy',
      'Komunikacja z nauczycielami',
      'Własne cele nauki',
      'System nagród',
    ],
    maxUsers: 5,
  },

  // === LECTURER/ADMIN PLANS ===
  {
    id: 'lecturer_pro',
    name: 'Lecturer Pro',
    namePl: 'Wykładowca Pro',
    description: 'Create and sell courses',
    descriptionPl: 'Twórz i sprzedawaj kursy',
    priceMonthlyPln: 99,
    priceYearlyPln: 990,
    stripePriceIdMonthly: process.env.STRIPE_PRICE_LECTURER_PRO_MONTHLY!,
    stripePriceIdYearly: process.env.STRIPE_PRICE_LECTURER_PRO_YEARLY!,
    trialDays: 3,
    category: 'admin',
    features: [
      'Unlimited courses',
      'Video hosting',
      'Student management',
      'Revenue analytics',
      '80% revenue share',
      'Custom branding',
    ],
    featuresPl: [
      'Nieograniczona liczba kursów',
      'Hosting wideo',
      'Zarządzanie studentami',
      'Analiza przychodów',
      '80% udziału w przychodach',
      'Własny branding',
    ],
  },
  {
    id: 'platform_admin',
    name: 'Platform Admin',
    namePl: 'Administrator Platformy',
    description: 'Full platform management',
    descriptionPl: 'Pełne zarządzanie platformą',
    priceMonthlyPln: 499,
    priceYearlyPln: 4990,
    stripePriceIdMonthly: process.env.STRIPE_PRICE_ADMIN_MONTHLY!,
    stripePriceIdYearly: process.env.STRIPE_PRICE_ADMIN_YEARLY!,
    trialDays: 3,
    category: 'admin',
    features: [
      'Full admin access',
      'User management',
      'Content moderation',
      'System analytics',
      'API management',
      'White-label options',
    ],
    featuresPl: [
      'Pełny dostęp admina',
      'Zarządzanie użytkownikami',
      'Moderacja treści',
      'Analizy systemowe',
      'Zarządzanie API',
      'Opcje white-label',
    ],
  },
];

export const getPlanById = (planId: string): SubscriptionPlan | undefined => {
  return SUBSCRIPTION_PLANS.find(plan => plan.id === planId);
};

export const getPlansByCategory = (category: SubscriptionPlan['category']): SubscriptionPlan[] => {
  return SUBSCRIPTION_PLANS.filter(plan => plan.category === category);
};

export const getPopularPlans = (): SubscriptionPlan[] => {
  return SUBSCRIPTION_PLANS.filter(plan => plan.isPopular);
};

export const calculateTrialEndDate = (trialDays: number = 3): Date => {
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + trialDays);
  return endDate;
};

export const formatPricePln = (pricePln: number): string => {
  return new Intl.NumberFormat('pl-PL', {
    style: 'currency',
    currency: 'PLN',
  }).format(pricePln);
};
