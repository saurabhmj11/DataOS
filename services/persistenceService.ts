/**
 * Copyright (c) 2024. Designed and Developed by Saurabh Lokhande.
 */

import { set, get, entries, del } from 'idb-keyval';

export interface StoredFile {
    name: string;
    content: string;
    timestamp: number;
    size: number;
}

export const persistenceService = {
    async saveFile(name: string, content: string): Promise<void> {
        const file: StoredFile = {
            name,
            content,
            timestamp: Date.now(),
            size: content.length
        };
        // Allow keys to be passed as-is if they already contain a prefix? 
        // Or just trust the caller. For backward compat, we might want to keep usage of this specific service 
        // wrapper simple. 
        // Let's assume 'name' is the full key if it's internal usage.
        await set(name, file);
        console.log(`💾 Saved ${name} to persistent storage.`);
    },

    async getFile(name: string): Promise<StoredFile | undefined> {
        return await get(name);
    },

    async getAllFiles(): Promise<StoredFile[]> {
        const all = await entries();
        return all
            // .filter(([key]) => (key as string).startsWith('file:')) // Remove strict filter for now or update it
            .map(([, value]) => value as StoredFile)
            .sort((a, b) => b.timestamp - a.timestamp);
    },

    async deleteFile(name: string): Promise<void> {
        await del(name);
    }
};
