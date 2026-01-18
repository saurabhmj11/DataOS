/**
 * Copyright (c) 2024. Designed and Developed by Saurabh Lokhande.
 */

import { db } from './db';

export class CacheService {
    private static instance: CacheService;
    private readonly TTL = 1000 * 60 * 60; // 1 Hour

    private constructor() { }

    public static getInstance(): CacheService {
        if (!CacheService.instance) {
            CacheService.instance = new CacheService();
        }
        return CacheService.instance;
    }

    public async getRequest(hash: string): Promise<any | null> {
        const entry = await db.cache.get(hash);

        if (!entry) return null;

        if (entry.expires_at < Date.now()) {
            await db.cache.delete(hash); // Expired
            return null;
        }

        // Update hit count (fire and forget)
        db.cache.update(hash, { hit_count: entry.hit_count + 1 }).catch(() => { });

        return JSON.parse(entry.result_json);
    }

    public async setRequest(hash: string, result: any, ttlOverride?: number): Promise<void> {
        const expires_at = Date.now() + (ttlOverride || this.TTL);

        await db.cache.put({
            hash,
            result_json: JSON.stringify(result),
            created_at: Date.now(),
            expires_at,
            hit_count: 0
        });
    }

    public async clearCache(): Promise<void> {
        await db.cache.clear();
    }
}

export const cacheService = CacheService.getInstance();
