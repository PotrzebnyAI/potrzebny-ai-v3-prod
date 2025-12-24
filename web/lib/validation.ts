import { z } from 'zod';

// ============================================================================
// COMMON SCHEMAS
// ============================================================================

export const uuidSchema = z.string().uuid('Invalid ID format');

export const emailSchema = z
  .string()
  .email('Invalid email format')
  .min(5, 'Email is too short')
  .max(255, 'Email is too long')
  .transform((email) => email.toLowerCase().trim());

export const passwordSchema = z
  .string()
  .min(12, 'Password must be at least 12 characters')
  .max(128, 'Password is too long')
  .regex(/[a-z]/, 'Password must contain a lowercase letter')
  .regex(/[A-Z]/, 'Password must contain an uppercase letter')
  .regex(/[0-9]/, 'Password must contain a number')
  .regex(/[!@#$%^&*(),.?":{}|<>]/, 'Password must contain a special character');

export const phoneSchema = z
  .string()
  .regex(/^\+?[0-9]{9,15}$/, 'Invalid phone number format')
  .optional();

export const urlSchema = z.string().url('Invalid URL format').optional();

export const dateSchema = z.string().datetime('Invalid date format');

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// ============================================================================
// AUTH SCHEMAS
// ============================================================================

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
  totpCode: z.string().length(6).optional(),
  rememberMe: z.boolean().optional().default(false),
});

export const registerSchema = z
  .object({
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string(),
    firstName: z
      .string()
      .min(2, 'First name is too short')
      .max(100, 'First name is too long')
      .optional(),
    lastName: z
      .string()
      .min(2, 'Last name is too short')
      .max(100, 'Last name is too long')
      .optional(),
    acceptTerms: z.literal(true, {
      errorMap: () => ({ message: 'You must accept the terms of service' }),
    }),
    acceptPrivacy: z.literal(true, {
      errorMap: () => ({ message: 'You must accept the privacy policy' }),
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, 'Reset token is required'),
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: 'New password must be different from current password',
    path: ['newPassword'],
  });

export const twoFactorSetupSchema = z.object({
  code: z.string().length(6, 'Code must be 6 digits'),
});

export const twoFactorVerifySchema = z.object({
  code: z.string().length(6, 'Code must be 6 digits'),
});

// ============================================================================
// USER SCHEMAS
// ============================================================================

export const updateProfileSchema = z.object({
  firstName: z.string().min(2).max(100).optional(),
  lastName: z.string().min(2).max(100).optional(),
  displayName: z.string().min(2).max(200).optional(),
  phone: phoneSchema,
  language: z.enum(['pl', 'en']).optional(),
  timezone: z.string().max(50).optional(),
  bio: z.string().max(1000).optional(),
  website: urlSchema,
});

export const notificationPreferencesSchema = z.object({
  email_marketing: z.boolean().optional(),
  email_updates: z.boolean().optional(),
  email_security: z.boolean().optional(),
  push_enabled: z.boolean().optional(),
  sms_enabled: z.boolean().optional(),
});

// ============================================================================
// SUBSCRIPTION SCHEMAS
// ============================================================================

export const panelTypeSchema = z.enum([
  'educational',
  'lecturer',
  'patient',
  'doctor',
  'super-mozg',
  'parent-basic',
  'parent-premium',
  'teacher-admin',
  'doctor-training-admin',
  'therapist-training-29',
  'therapist-training-79',
  'custom-content-admin',
  'platform-admin',
  'gamification',
]);

export const createSubscriptionSchema = z.object({
  panelType: panelTypeSchema,
  planId: z.string().min(1),
  billingCycle: z.enum(['monthly', 'yearly']).default('monthly'),
  paymentMethodId: z.string().optional(),
});

export const updateSubscriptionSchema = z.object({
  planId: z.string().optional(),
  billingCycle: z.enum(['monthly', 'yearly']).optional(),
  cancelAtPeriodEnd: z.boolean().optional(),
});

// ============================================================================
// THERAPY NOTES SCHEMAS
// ============================================================================

export const createTherapyNoteSchema = z.object({
  sessionDate: z.string().date('Invalid date format'),
  content: z.string().min(1, 'Content is required').max(50000),
  moodRating: z.number().int().min(1).max(10).optional(),
  energyLevel: z.number().int().min(1).max(10).optional(),
  anxietyLevel: z.number().int().min(1).max(10).optional(),
  tags: z.array(z.string().max(50)).max(20).optional(),
  sessionType: z
    .enum(['individual', 'group', 'family', 'couples'])
    .default('individual'),
  durationMinutes: z.number().int().positive().max(480).optional(),
  isSharedWithTherapist: z.boolean().default(false),
});

export const updateTherapyNoteSchema = createTherapyNoteSchema.partial().extend({
  isArchived: z.boolean().optional(),
});

// ============================================================================
// EDUCATIONAL CONTENT SCHEMAS
// ============================================================================

export const contentTypeSchema = z.enum([
  'course',
  'lesson',
  'article',
  'video',
  'quiz',
  'flashcard_set',
  'worksheet',
]);

export const difficultyLevelSchema = z.enum([
  'beginner',
  'intermediate',
  'advanced',
  'expert',
]);

export const createEducationalContentSchema = z.object({
  title: z.string().min(3).max(500),
  description: z.string().max(5000).optional(),
  contentType: contentTypeSchema,
  panelType: z.enum(['educational', 'lecturer', 'patient', 'doctor', 'therapist']),
  difficultyLevel: difficultyLevelSchema.optional(),
  estimatedDurationMinutes: z.number().int().positive().max(1440).optional(),
  contentData: z.record(z.unknown()).default({}),
  flashcards: z
    .array(
      z.object({
        front: z.string().min(1).max(1000),
        back: z.string().min(1).max(2000),
      })
    )
    .optional(),
  quizData: z
    .object({
      questions: z.array(
        z.object({
          question: z.string().min(1).max(2000),
          answers: z.array(z.string().min(1).max(500)).min(2).max(6),
          correctIndex: z.number().int().min(0),
          explanation: z.string().max(2000).optional(),
        })
      ),
    })
    .optional(),
  tags: z.array(z.string().max(50)).max(20).optional(),
  thumbnailUrl: urlSchema,
  videoUrl: urlSchema,
  isPublished: z.boolean().default(false),
  isPremium: z.boolean().default(false),
});

export const updateEducationalContentSchema = createEducationalContentSchema.partial();

// ============================================================================
// GAMIFICATION SCHEMAS
// ============================================================================

export const addXPSchema = z.object({
  amount: z.number().int().positive().max(10000),
  reason: z.string().max(255).optional(),
});

export const updateDailyGoalsSchema = z.object({
  learning_minutes: z.number().int().min(5).max(480).optional(),
  quizzes_completed: z.number().int().min(1).max(50).optional(),
  flashcards_reviewed: z.number().int().min(5).max(500).optional(),
});

// ============================================================================
// PAYMENT SCHEMAS
// ============================================================================

export const addPaymentMethodSchema = z.object({
  paymentMethodId: z.string().min(1),
  setAsDefault: z.boolean().default(false),
});

// ============================================================================
// ADMIN SCHEMAS
// ============================================================================

export const updateUserRoleSchema = z.object({
  role: z.enum(['user', 'admin', 'therapist', 'doctor', 'lecturer', 'parent']),
});

export const moderateContentSchema = z.object({
  action: z.enum(['approve', 'reject', 'request_changes']),
  reason: z.string().max(1000).optional(),
});

// ============================================================================
// SEARCH SCHEMAS
// ============================================================================

export const searchSchema = z.object({
  query: z.string().min(1).max(255),
  filters: z.record(z.unknown()).optional(),
  ...paginationSchema.shape,
});

// ============================================================================
// API KEY SCHEMAS
// ============================================================================

export const createApiKeySchema = z.object({
  name: z.string().min(1).max(100),
  scopes: z.array(z.string()).min(1).max(20),
  expiresAt: dateSchema.optional(),
});

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type CreateSubscriptionInput = z.infer<typeof createSubscriptionSchema>;
export type UpdateSubscriptionInput = z.infer<typeof updateSubscriptionSchema>;
export type CreateTherapyNoteInput = z.infer<typeof createTherapyNoteSchema>;
export type UpdateTherapyNoteInput = z.infer<typeof updateTherapyNoteSchema>;
export type CreateEducationalContentInput = z.infer<typeof createEducationalContentSchema>;
export type UpdateEducationalContentInput = z.infer<typeof updateEducationalContentSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;
export type SearchInput = z.infer<typeof searchSchema>;
export type PanelType = z.infer<typeof panelTypeSchema>;
export type ContentType = z.infer<typeof contentTypeSchema>;
export type DifficultyLevel = z.infer<typeof difficultyLevelSchema>;
