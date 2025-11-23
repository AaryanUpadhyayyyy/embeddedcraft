import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    PORT: z.string().default('4000'),
    MONGO_URI: z.string().default('mongodb://localhost:27017/embeddedcraft'),
    JWT_SECRET: z.string().min(32).default('super_secret_jwt_key_at_least_32_chars_long'),
    CORS_ORIGINS: z.string().default('*'),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
    console.error('❌ Invalid environment variables:', _env.error.format());
    throw new Error('Invalid environment variables');
}

export const env = _env.data;
