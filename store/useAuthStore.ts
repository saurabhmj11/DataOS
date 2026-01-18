/**
 * Copyright (c) 2024. Designed and Developed by Saurabh Lokhande.
 */

import { create } from 'zustand';
import { db, User } from '../services/db';

export type OSState = 'BOOT' | 'LOGIN' | 'RUNNING' | 'LOCKED' | 'SLEEP' | 'OFF';

interface AuthState {
    // Identity
    user: User | null;
    isAuthenticated: boolean;

    // Power / OS State
    osState: OSState;

    // Actions
    login: (username: string, pass: string) => Promise<boolean>;
    logout: () => void;
    // Power Actions
    boot: () => void;
    lock: () => void;
    unlock: (pass: string) => Promise<boolean>;
    sleep: () => void;
    wake: () => void;
    shutdown: () => void;
    restart: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
    user: null,
    isAuthenticated: false,
    osState: 'BOOT', // Start at boot

    login: async (username, pass) => {
        try {
            const user = await db.users.where('username').equals(username).first();
            if (user && user.password === pass) {
                set({ user, isAuthenticated: true, osState: 'RUNNING' });
                return true;
            }
            return false;
        } catch (e) {
            console.error("Login Error", e);
            // Fallback for demo if DB isn't seeded yet (or running first time context issue)
            if (username === 'admin' && pass === 'admin') {
                set({
                    user: { id: 1, username: 'admin', displayName: 'System Admin', role: 'admin', password: 'admin', created_at: Date.now() },
                    isAuthenticated: true,
                    osState: 'RUNNING'
                });
                return true;
            }
            return false;
        }
    },

    logout: () => set({ user: null, isAuthenticated: false, osState: 'LOGIN' }),

    // Power Actions
    boot: () => {
        // Simulate boot sequence time
        setTimeout(() => {
            set({ osState: 'LOGIN' });
        }, 3000);
    },

    lock: () => set({ osState: 'LOCKED' }),

    unlock: async (pass) => {
        const { user } = get();
        if (user && user.password === pass) {
            set({ osState: 'RUNNING' });
            return true;
        }
        return false;
    },

    sleep: () => set({ osState: 'SLEEP' }),
    wake: () => set({ osState: get().isAuthenticated ? 'RUNNING' : 'LOGIN' }), // If locked, go to lock? Simplified to running if auth

    shutdown: () => set({ osState: 'OFF' }),

    restart: () => {
        set({ osState: 'OFF' });
        setTimeout(() => {
            set({ osState: 'BOOT' });
            // Re-trigger boot logic
            setTimeout(() => {
                set({ osState: 'LOGIN' });
            }, 3000);
        }, 1000);
    }
}));
