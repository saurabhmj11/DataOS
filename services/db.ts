/**
 * Copyright (c) 2024. Designed and Developed by Saurabh Lokhande.
 */

import Dexie, { Table } from 'dexie';

export interface Project {
    id?: number;
    owner_id?: number;
    name: string;
    description?: string;
    is_active: number; // 0 or 1
    created_at: number;
    updated_at: number;
}

export interface Dataset {
    id?: number;
    project_id: number;
    name: string;
    storage_key: string; // Key in idb-keyval or similar blob storage
    row_count: number;
    columns_json: string; // JSON string of columns
    status: 'pending' | 'ready' | 'error';
    created_at: number;
}

export interface Job {
    id?: number;
    project_id: number;
    type: 'ingest' | 'clean' | 'ai_profile' | 'ai_chat';
    status: 'pending' | 'running' | 'completed' | 'failed';
    priority: number; // Higher is better
    progress: number; // 0-100
    payload_json: string;
    result_json?: string;
    error?: string;
    created_at: number;
    updated_at: number;
}

export interface FileNode {
    path: string; // Primary Key (e.g., "/home/docs/file.txt")
    name: string;
    parent_path: string; // Indexed for listing children
    type: 'file' | 'directory';
    size: number;
    mime_type?: string;
    content_key?: string; // Key in idb-keyval for file content
    project_id?: number; // Optional: Files can belong to a project or be global
    created_at: number;
    updated_at: number;
}

export interface Setting {
    key: string;
    value: any;
    updated_at: number;
}

export interface PersistentWindowState {
    id: string;
    title: string;
    componentKey: string;
    isOpen: number;
    isMinimized: number;
    isMaximized: number;
    zIndex: number;
    position_x: number;
    position_y: number;
    width: number;
    height: number;
}

export interface CacheEntry {
    hash: string;
    result_json: string;
    created_at: number;
    expires_at: number;
    hit_count: number;
}

export interface KnowledgeItem {
    id?: number;
    key: string; // e.g., "metric:revenue" or "incident:2024-01-15"
    value: string; // JSON or text content
    context: string; // "analyst_memory" or "system_log"
    confidence: number;
    created_at: number;
}

export interface User {
    id?: number;
    username: string;
    displayName: string;
    avatar?: string;
    password: string; // Plain text for demo; hash in prod
    role: 'admin' | 'user' | 'guest';
    created_at: number;
}

export class DataOSDB extends Dexie {
    projects!: Table<Project>;
    datasets!: Table<Dataset>;
    jobs!: Table<Job>;
    fs_nodes!: Table<FileNode>;
    settings!: Table<Setting>;
    windows!: Table<PersistentWindowState>;
    cache!: Table<CacheEntry>;
    knowledge_base!: Table<KnowledgeItem>;
    users!: Table<User>;

    constructor() {
        super('DataOSDB');

        // Version 1: Initial Schema
        this.version(1).stores({
            projects: '++id, name, is_active',
            datasets: '++id, project_id, name',
            jobs: '++id, project_id, type, status, created_at'
        });

        // Version 2: VFS
        this.version(2).stores({
            fs_nodes: 'path, parent_path, type, project_id'
        });

        // Version 3: Infrastructure
        this.version(3).stores({
            settings: 'key',
            windows: 'id',
            cache: 'hash, expires_at'
        });

        // Version 4: Kernel 2.0 (Knowledge & Jobs Upgrade)
        this.version(4).stores({
            jobs: '++id, project_id, type, status, priority, created_at',
            knowledge_base: '++id, key, context',
            fs_nodes: 'path, parent_path, type, project_id'
        });

        // Version 5: Identity & Multi-User
        this.version(5).stores({
            users: '++id, &username', // Unique username
            projects: '++id, name, is_active, owner_id' // Added owner_id
        }).upgrade(async tx => {
            // Seed default users
            const users = tx.table('users');
            if ((await users.count()) === 0) {
                await users.bulkAdd([
                    { username: 'admin', displayName: 'System Admin', password: 'admin', role: 'admin', created_at: Date.now() },
                    { username: 'analyst', displayName: 'Data Analyst', password: '1234', role: 'user', created_at: Date.now() }
                ]);
            }
        });
    }
}

export const db = new DataOSDB();
