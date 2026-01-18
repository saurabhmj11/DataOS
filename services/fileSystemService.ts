/**
 * Copyright (c) 2024. Designed and Developed by Saurabh Lokhande.
 */

import { db, FileNode } from './db';
import { persistenceService } from './persistenceService';
import { eventBus } from './eventBus';

export class FileSystemService {
    private static instance: FileSystemService;

    private constructor() { }

    public static getInstance(): FileSystemService {
        if (!FileSystemService.instance) {
            FileSystemService.instance = new FileSystemService();
        }
        return FileSystemService.instance;
    }

    /**
     * Initializes default directory structure if empty.
     */
    public async bootstrap() {
        if (await this.exists('/home')) return;

        await this.mkdir('/home');
        await this.mkdir('/home/documents');
        await this.mkdir('/home/downloads');
        await this.mkdir('/system');
        await this.mkdir('/system/logs');

        console.log("VFS Bootstrapped");
    }

    public async ls(path: string, projectId: number = 0): Promise<FileNode[]> {
        // Normalize path: no trailing slash unless root
        const cleanPath = path === '/' ? '/' : path.replace(/\/$/, '');
        // Filter by parent_path AND project_id (0 = System/Global)
        return await db.fs_nodes.where('[parent_path+project_id]')
            .equals([cleanPath, projectId])
            .toArray();
    }

    public async mkdir(path: string, projectId: number = 0): Promise<void> {
        if (await this.exists(path, projectId)) return;

        const parentPath = this.getParentPath(path);
        const name = this.getName(path);

        // Ensure parent exists (unless creating root or direct child of root)
        if (parentPath !== '/' && !(await this.exists(parentPath, projectId))) {
            await this.mkdir(parentPath, projectId); // Recursive create
        }

        await db.fs_nodes.add({
            path,
            name,
            parent_path: parentPath,
            type: 'directory',
            size: 0,
            project_id: projectId,
            created_at: Date.now(),
            updated_at: Date.now()
        });
    }

    public async writeFile(path: string, content: string | Blob, projectId: number = 0): Promise<void> {
        const parentPath = this.getParentPath(path);
        if (!(await this.exists(parentPath, projectId))) {
            throw new Error(`Parent directory ${parentPath} does not exist in project ${projectId}`);
        }

        const name = this.getName(path);
        const contentKey = `vfs_blob_${projectId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        // Save content to blob storage
        await persistenceService.saveFile(contentKey, content as any);

        const existing = await this.getNode(path, projectId);
        if (existing) {
            await db.fs_nodes.put({
                ...existing,
                size: content.toString().length,
                content_key: contentKey,
                updated_at: Date.now()
            });
            eventBus.publish('FILE_UPDATED', { path, size: content.toString().length, projectId }, 'VFS');
        } else {
            await db.fs_nodes.add({
                path,
                name,
                parent_path: parentPath,
                type: 'file',
                size: content.toString().length,
                content_key: contentKey,
                project_id: projectId,
                created_at: Date.now(),
                updated_at: Date.now()
            });
            eventBus.publish('FILE_CREATED', { path, size: content.toString().length, projectId }, 'VFS');
        }
    }

    public async exists(path: string, projectId: number = 0): Promise<boolean> {
        const node = await this.getNode(path, projectId);
        return !!node;
    }

    public async getNode(path: string, projectId: number = 0): Promise<FileNode | undefined> {
        return await db.fs_nodes.where({ path, project_id: projectId }).first();
    }
    public async readFile(path: string, projectId: number = 0): Promise<any> {
        const node = await this.getNode(path, projectId);
        if (!node) throw new Error(`File ${path} not found`);
        if (node.type !== 'file' || !node.content_key) throw new Error(`${path} is not a file`);

        return await persistenceService.getFile(node.content_key);
    }

    public async delete(path: string, projectId: number = 0): Promise<void> {
        const node = await this.getNode(path, projectId);
        if (!node) return;

        if (node.type === 'directory') {
            // Recursive delete
            const children = await this.ls(path, projectId);
            for (const child of children) {
                await this.delete(child.path, projectId);
            }
        }

        if (node.content_key) {
            // persistenceService.delete(node.content_key) // Implement delete in persistence
        }

        await db.fs_nodes.delete(path); // Path is PK
    }

    // --- Helpers ---
    private getParentPath(path: string): string {
        if (path === '/') return '/';
        const parts = path.replace(/\/$/, '').split('/');
        parts.pop();
        return parts.join('/') || '/';
    }

    private getName(path: string): string {
        if (path === '/') return 'root';
        return path.replace(/\/$/, '').split('/').pop() || '';
    }
}

export const fileSystem = FileSystemService.getInstance();
