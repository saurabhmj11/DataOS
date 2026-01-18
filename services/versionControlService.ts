/**
 * Copyright (c) 2024. Designed and Developed by Saurabh Lokhande.
 */

import { DataVersion } from '../types';
import { duckDb } from './duckDbService';

export class VersionControlService {
    private static instance: VersionControlService;
    private versions: DataVersion[] = [];

    private constructor() { }

    public static getInstance(): VersionControlService {
        if (!VersionControlService.instance) {
            VersionControlService.instance = new VersionControlService();
        }
        return VersionControlService.instance;
    }

    public getHistory(): DataVersion[] {
        return [...this.versions].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    }

    public async commit(
        file: { name: string, content: string },
        type: 'append' | 'replace',
        author: string = 'User'
    ): Promise<DataVersion> {

        // 1. Execute DB Operation
        if (type === 'replace') {
            await duckDb.registerFile(file.name, file.content);
        } else {
            await duckDb.appendFile('main', file.name, file.content);
        }

        // 2. Get Stats for Metadata
        const stats = await duckDb.query("SELECT COUNT(*) as count FROM main");
        const rowCount = Number(stats[0].count);

        // 3. Create Version Object
        const newVersion: DataVersion = {
            id: `v${this.versions.length + 1}`,
            timestamp: new Date(),
            author: author,
            message: type === 'replace'
                ? `Initialized dataset with ${file.name}`
                : `Appended data from ${file.name}`,
            type: type,
            rowCount: rowCount
        };

        this.versions.push(newVersion);

        console.log(`📌 Committed Version ${newVersion.id}: ${newVersion.message}`);
        return newVersion;
    }
}

export const versionControl = VersionControlService.getInstance();
