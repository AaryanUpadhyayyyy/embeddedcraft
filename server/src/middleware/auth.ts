import { Request, Response, NextFunction } from 'express';
import { AppError } from './errorHandler';
import { env } from '../config/env';

// In a real app, these would be in a database
const ADMIN_API_KEYS = new Set(['admin-secret-key']);
const CLIENT_API_KEYS = new Set(['client-secret-key']);

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
    const apiKey = extractApiKey(req);

    if (!apiKey) {
        return next(new AppError('API key required', 401));
    }

    if (!isValidApiKey(apiKey)) {
        return next(new AppError('Invalid API key', 401));
    }

    // Attach auth info to request
    (req as any).auth = {
        isAdmin: ADMIN_API_KEYS.has(apiKey),
        isClient: CLIENT_API_KEYS.has(apiKey),
    };

    next();
};

export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
    const apiKey = extractApiKey(req);

    if (!apiKey || !ADMIN_API_KEYS.has(apiKey)) {
        return next(new AppError('Admin access required', 403));
    }

    (req as any).auth = { isAdmin: true, isClient: false };
    next();
};

function extractApiKey(req: Request): string | null {
    if (req.headers['x-api-key']) {
        return req.headers['x-api-key'] as string;
    }

    const authHeader = req.headers['authorization'];
    if (authHeader && authHeader.startsWith('Bearer ')) {
        return authHeader.substring(7);
    }

    return null;
}

function isValidApiKey(key: string): boolean {
    return ADMIN_API_KEYS.has(key) || CLIENT_API_KEYS.has(key);
}
