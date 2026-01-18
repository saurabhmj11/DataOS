/**
 * Copyright (c) 2024. Designed and Developed by Saurabh Lokhande.
 */

import { db, Project } from './db';
import { useAppStore } from '../store/useAppStore';

export class ProjectService {
    private static instance: ProjectService;

    private constructor() { }

    public static getInstance(): ProjectService {
        if (!ProjectService.instance) {
            ProjectService.instance = new ProjectService();
        }
        return ProjectService.instance;
    }

    /**
     * Create a new project and optionally switch to it
     */
    public async createProject(name: string, description?: string, ownerId?: number): Promise<number> {
        const id = await db.projects.add({
            name,
            description,
            is_active: 0,
            owner_id: ownerId,
            created_at: Date.now(),
            updated_at: Date.now()
        });

        // Refresh store (ProjectManager should trigger refresh with ownerId, but generic refresh here might miss it if we don't pass ownerId)
        // For now, let's assume the UI managing the list will trigger a refresh or we pass null to get all (admin) or handled by store update logic.
        // Better: ProjectManager listens to changes or manually refreshes.
        return id as number;
    }

    /**
     * Switch the active project context
     */
    public async switchProject(projectId: number) {
        // Update DB: Set all to inactive, then target to active
        // Note: In a real app we might just keep local state, but for persistence we update DB
        await db.projects.filter(p => p.is_active === 1).modify({ is_active: 0 });
        await db.projects.update(projectId, { is_active: 1 });

        // Update Store (which triggers UI updates)
        const store = useAppStore.getState();
        store.setActiveProject(projectId);

        // Trigger a "Refresh" of file system view if needed (handled by VFS watching store or event bus)
        // ideally VFS lists should re-fetch based on activeProjectId
    }

    /**
     * Get the currently active project form DB
     */
    public async getActiveProject(): Promise<Project | undefined> {
        return await db.projects.filter(p => p.is_active === 1).first();
    }

    /**
     * Initialize: Check if any project is active, if not, create Default
     */
    public async initialize() {
        const projects = await db.projects.toArray();
        if (projects.length === 0) {
            console.log("Creating Default Project...");
            const defaultId = await this.createProject("Default Workspace", "Main workspace");
            await this.switchProject(defaultId);
        } else {
            const active = projects.find(p => p.is_active === 1);
            if (active) {
                useAppStore.getState().setActiveProject(active.id!);
            } else {
                // Fallback if none active
                await this.switchProject(projects[0].id!);
            }
        }
        await useAppStore.getState().refreshProjects();
    }
}

export const projectService = ProjectService.getInstance();
