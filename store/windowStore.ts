/**
 * Copyright (c) 2024. Designed and Developed by Saurabh Lokhande.
 */

import { create } from 'zustand';
import { ReactNode } from 'react';

export interface WindowState {
    id: string;
    title: string;
    component: ReactNode;
    isOpen: boolean;
    isMinimized: boolean;
    isMaximized: boolean;
    isFocused?: boolean;
    zIndex: number;
    position?: { x: number; y: number };
    size?: { width: number; height: number };
}

interface WindowStore {
    windows: WindowState[];
    activeWindowId: string | null;

    openWindow: (id: string, title: string, component: ReactNode) => void;
    closeWindow: (id: string) => void;
    minimizeWindow: (id: string) => void;
    maximizeWindow: (id: string) => void;
    restoreWindow: (id: string) => void;
    focusWindow: (id: string) => void;
    updateWindowPosition: (id: string, position: { x: number; y: number }) => void;
    resizeWindow: (id: string, size: { width: number; height: number }) => void;
}

export const useWindowStore = create<WindowStore>((set, get) => ({
    windows: [],
    activeWindowId: null,

    openWindow: (id, title, component) => {
        const { windows } = get();
        const existingWindow = windows.find((w) => w.id === id);

        if (existingWindow) {
            // If already open, just focus and restore it
            set((state) => ({
                windows: state.windows.map((w) =>
                    w.id === id ? { ...w, isOpen: true, isMinimized: false, zIndex: Math.max(...state.windows.map((win) => win.zIndex), 0) + 1 } : w
                ),
                activeWindowId: id,
            }));
            return;
        }

        // New Window
        const maxZIndex = Math.max(...windows.map((w) => w.zIndex), 0);
        const newWindow: WindowState = {
            id,
            title,
            component,
            isOpen: true,
            isMinimized: false,
            isMaximized: false,
            zIndex: maxZIndex + 1,
            isFocused: true,
            position: { x: 50 + (windows.length * 20), y: 50 + (windows.length * 20) }, // Cascade effect
        };

        set((state) => ({
            windows: [...state.windows, newWindow],
            activeWindowId: id,
        }));
    },

    closeWindow: (id) => {
        set((state) => ({
            windows: state.windows.filter((w) => w.id !== id),
            activeWindowId: state.windows.length > 1 ? state.windows[state.windows.length - 2].id : null,
        }));
    },

    minimizeWindow: (id) => {
        set((state) => ({
            windows: state.windows.map((w) => (w.id === id ? { ...w, isMinimized: true } : w)),
            activeWindowId: null, // No active window if minimized
        }));
    },

    maximizeWindow: (id) => {
        set((state) => ({
            windows: state.windows.map((w) => (w.id === id ? { ...w, isMaximized: true, zIndex: Math.max(...state.windows.map((win) => win.zIndex), 0) + 1 } : w)),
            activeWindowId: id,
        }));
    },

    restoreWindow: (id) => {
        set((state) => ({
            windows: state.windows.map((w) => (w.id === id ? { ...w, isMaximized: false, isMinimized: false, zIndex: Math.max(...state.windows.map((win) => win.zIndex), 0) + 1 } : w)),
            activeWindowId: id,
        }));
    },

    focusWindow: (id) => {
        set((state) => ({
            windows: state.windows.map((w) => ({
                ...w,
                zIndex: w.id === id ? Math.max(...state.windows.map((win) => win.zIndex), 0) + 1 : w.zIndex,
                isFocused: w.id === id
            })),
            activeWindowId: id,
        }));
    },

    updateWindowPosition: (id, position) => {
        set((state) => ({
            windows: state.windows.map((w) => w.id === id ? { ...w, position } : w)
        }))
    },

    resizeWindow: (id, size) => {
        set((state) => ({
            windows: state.windows.map((w) => w.id === id ? { ...w, size } : w)
        }));
    }
}));
