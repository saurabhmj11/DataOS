/**
 * Copyright (c) 2024. Designed and Developed by Saurabh Lokhande.
 */

import { useWindowStore } from '../../store/windowStore';
import WindowFrame from './WindowFrame';
import Taskbar from './Taskbar';
import FileExplorer from '../apps/FileExplorer';
import DataAnalyst from '../apps/DataAnalyst';
import Terminal from '../apps/Terminal';
import SqlWorkbench from '../apps/SqlWorkbench';
import Settings from '../apps/Settings';
import KernelMonitor from '../apps/KernelMonitor';
import ProjectManager from '../apps/ProjectManager';
import TaskManager from '../apps/TaskManager';
import AppStore from '../apps/AppStore';
import { HardDrive, BrainCircuit, Terminal as TerminalIcon, Database, Settings as SettingsIcon, Activity, Briefcase, ShoppingBag } from 'lucide-react';

const Desktop = () => {
    const { windows, openWindow } = useWindowStore();

    const desktopIcons = [
        {
            id: 'computer',
            name: 'Computer',
            icon: <HardDrive size={32} className="text-blue-400" />,
            action: () => openWindow('explorer', 'File Explorer', <FileExplorer />)
        },
        {
            id: 'projects',
            name: 'Workspaces',
            icon: <Briefcase size={32} className="text-orange-400" />,
            action: () => openWindow('project-manager', 'Workspaces', <ProjectManager />)
        },
        {
            id: 'analyst',
            name: 'Data Analyst',
            icon: <BrainCircuit size={32} className="text-purple-400" />,
            action: () => openWindow('data-analyst', 'Data Analyst', <DataAnalyst />)
        },
        {
            id: 'terminal',
            name: 'Terminal',
            icon: <TerminalIcon size={32} className="text-zinc-400" />,
            action: () => openWindow('terminal', 'Terminal', <Terminal />)
        },
        {
            id: 'sql',
            name: 'SQL Workbench',
            icon: <Database size={32} className="text-green-400" />,
            action: () => openWindow('sql-workbench', 'SQL Workbench', <SqlWorkbench />)
        },
        {
            id: 'settings',
            name: 'Settings',
            icon: <SettingsIcon size={32} className="text-zinc-500" />,
            action: () => openWindow('settings', 'Settings', <Settings />)
        },
        {
            id: 'kernel',
            name: 'Kernel Monitor',
            icon: <Activity size={32} className="text-red-500" />,
            action: () => openWindow('kernel-monitor', 'Kernel Monitor', <KernelMonitor />)
        },
        {
            id: 'tasks',
            name: 'Task Manager',
            icon: <Activity size={32} className="text-green-500" />,
            action: () => openWindow('task-manager', 'Task Manager', <TaskManager />)
        },
        {
            id: 'store',
            name: 'App Store',
            icon: <ShoppingBag size={32} className="text-sky-500" />,
            action: () => openWindow('app-store', 'App Store', <AppStore />)
        }
    ];

    return (
        <div className="fixed inset-0 overflow-hidden bg-black select-none font-sans">
            {/* Wallpaper Layer */}
            <div className="absolute inset-0 z-0 bg-gradient-to-br from-indigo-950 via-zinc-950 to-black pointer-events-none">
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#4f4f4f_1px,transparent_1px)] [background-size:24px_24px]" />
            </div>

            {/* Desktop Icons Layer */}
            <div className="absolute inset-0 z-0 p-4 grid grid-flow-col grid-rows-[repeat(auto-fill,100px)] gap-4 w-fit items-start content-start">
                {desktopIcons.map(icon => (
                    <button
                        key={icon.id}
                        onClick={icon.action}
                        className="group flex flex-col items-center gap-2 p-2 rounded-lg hover:bg-white/10 hover:ring-1 hover:ring-white/20 transition-all w-24"
                    >
                        <div className="p-3 bg-zinc-900/50 rounded-xl shadow-lg border border-white/5 group-hover:scale-105 transition-transform backdrop-blur-sm">
                            {icon.icon}
                        </div>
                        <span className="text-xs text-center text-zinc-300 font-medium drop-shadow-md group-hover:text-white px-1 leading-tight">
                            {icon.name}
                        </span>
                    </button>
                ))}
            </div>

            {/* Window Layer */}
            <div className="absolute inset-0 z-10 pointer-events-none">
                {/* Pointer events set to auto in WindowFrame */}
                {windows.map((window) => (
                    <div key={window.id} className="pointer-events-auto">
                        <WindowFrame window={window} />
                    </div>
                ))}
            </div>

            {/* Taskbar Layer */}
            <Taskbar />
        </div>
    );
};

export default Desktop;
