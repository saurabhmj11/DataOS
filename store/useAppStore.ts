/**
 * Copyright (c) 2024. Designed and Developed by Saurabh Lokhande.
 */

import { create } from 'zustand';
import { Project, db } from '../services/db';

interface AppState {
    // Current Context
    projects: Project[];
    activeProjectId: number | null;
    activeDatasetId: number | null;

    // UI State
    isSidebarOpen: boolean;
    activeTab: 'overview' | 'grid' | 'settings' | 'history';

    // Actions
    refreshProjects: (ownerId?: number) => Promise<void>;
    setActiveProject: (id: number | null) => void;
    setActiveDataset: (id: number | null) => void;
    setSidebarOpen: (isOpen: boolean) => void;
    setActiveTab: (tab: 'overview' | 'grid' | 'settings' | 'history') => void;
}

export const useAppStore = create<AppState>((set) => ({
    projects: [],
    activeProjectId: null,
    activeDatasetId: null,

    isSidebarOpen: false,
    activeTab: 'overview',

    refreshProjects: async (ownerId?: number) => {
        let projects;
        if (ownerId !== undefined) {
            // 0 could be a valid ID? usually auto-inc > 0.
            projects = await db.projects.filter(p => p.owner_id === ownerId || p.owner_id === undefined).toArray();
        } else {
            projects = await db.projects.toArray();
        }
        set({ projects });
    },
    setActiveProject: (id) => set({ activeProjectId: id }),
    setActiveDataset: (id) => set({ activeDatasetId: id }),
    setSidebarOpen: (isOpen) => set({ isSidebarOpen: isOpen }),
    setActiveTab: (tab) => set({ activeTab: tab })
}));
