/**
 * Copyright (c) 2024. Designed and Developed by Saurabh Lokhande.
 */

import { useEffect, useRef } from 'react';
import { useAppStore } from './store/useAppStore';
import { useAuthStore } from './store/useAuthStore';
import { useWindowStore } from './store/windowStore';
import Desktop from './components/os/Desktop';
import ProjectManager from './components/apps/ProjectManager';
import DataAnalyst from './components/apps/DataAnalyst';
import LoginScreen from './components/os/LoginScreen';
import LockScreen from './components/os/LockScreen';
import BootSequence from './components/os/BootSequence';
import ShutdownScreen from './components/os/ShutdownScreen';
import SleepScreen from './components/os/SleepScreen';

// Fix for DuckDB BigInt serialization
(BigInt.prototype as any).toJSON = function () {
    return Number(this);
};

export default function App() {
    const activeProjectId = useAppStore(state => state.activeProjectId);
    const { osState, boot } = useAuthStore();
    const { openWindow } = useWindowStore();
    const launchedRef = useRef<number | null>(null);

    // Trigger Boot
    useEffect(() => {
        boot();
    }, []);

    // Launch Data Analyst app by default when project is active (only once per project load)
    useEffect(() => {
        if (osState === 'RUNNING' && activeProjectId && launchedRef.current !== activeProjectId) {
            openWindow('data-analyst', 'Data Analyst', <DataAnalyst />);
            launchedRef.current = activeProjectId;
        }
    }, [activeProjectId, osState, openWindow]);

    switch (osState) {
        case 'BOOT':
            return <BootSequence />;
        case 'LOGIN':
            return <LoginScreen />;
        case 'LOCKED':
            return <LockScreen />;
        case 'SLEEP':
            return <SleepScreen />;
        case 'OFF':
            return <ShutdownScreen />;
        case 'RUNNING':
            if (!activeProjectId) {
                return <ProjectManager />;
            }
            return <Desktop />;
        default:
            return <BootSequence />;
    }
}