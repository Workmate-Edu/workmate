import { z } from 'zod';

const envSchema = z.object({
  // Database
  MONGODB_URI: z.string().url(),
  MONGODB_URI_PRODUCTION: z.string().url().optional(),

  // Authentication
  NEXTAUTH_URL: z.string().url(),
  NEXTAUTH_URL_PRODUCTION: z.string().url().optional(),
  NEXTAUTH_SECRET: z.string().min(32),

  // Environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  // Email
  SMTP_HOST: z.string(),
  SMTP_PORT: z.string().transform(Number),
  SMTP_USER: z.string().email(),
  SMTP_PASSWORD: z.string(),

  // Rate Limiting
  RATE_LIMIT_WINDOW: z.string().transform(Number),
  RATE_LIMIT_MAX_REQUESTS: z.string().transform(Number),

  // API Keys
  OPENAI_API_KEY: z.string().optional(),
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),

  // Cache
  REDIS_URL: z.string().url().optional(),

  // Feature Flags
  ENABLE_AI_MATCHING: z.string().transform((v) => v === 'true'),
  ENABLE_INSTANT_MESSAGING: z.string().transform((v) => v === 'true'),
  ENABLE_VIDEO_CALLS: z.string().transform((v) => v === 'true'),

  // Security
  JWT_SECRET: z.string().min(32),
  COOKIE_SECRET: z.string().min(32),

  // Logging
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
});

// Function to validate environment variables
function validateEnv() {
  try {
    const parsed = envSchema.parse(process.env);
    return parsed;
  } catch (error) {
    console.error('❌ Invalid environment variables:', error.errors);
    process.exit(1);
  }
}

// Export validated environment variables
export const env = validateEnv();

// Export type for environment variables
export type Env = z.infer<typeof envSchema>;
