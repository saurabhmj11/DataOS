/**
 * Copyright (c) 2024. Designed and Developed by Saurabh Lokhande.
 */

import { useState, useEffect } from 'react';
import { useWindowStore } from '../../store/windowStore';
import { useAuthStore } from '../../store/useAuthStore';
import { Terminal, LayoutGrid, Power, Lock, LogOut, Moon, RefreshCw } from 'lucide-react';

const Taskbar = () => {
    const { windows, activeWindowId, focusWindow, minimizeWindow } = useWindowStore();
    const { user, lock, sleep, restart, shutdown, logout } = useAuthStore();
    const [currentTime, setCurrentTime] = useState(new Date());
    const [isStartOpen, setIsStartOpen] = useState(false);

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const handleTaskClick = (id: string, isMinimized: boolean, isActive: boolean) => {
        if (isActive && !isMinimized) {
            minimizeWindow(id);
        } else {
            focusWindow(id);
        }
    };

    return (
        <>
            {/* Start Menu Popover */}
            {isStartOpen && (
                <div className="fixed bottom-16 left-4 w-72 bg-zinc-900/90 backdrop-blur-xl border border-zinc-700 rounded-lg shadow-2xl z-[10000] p-2 animate-in slide-in-from-bottom-5 duration-200">
                    {/* User Profile */}
                    <div className="flex items-center gap-3 p-3 border-b border-white/5 mb-2">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center font-bold text-white">
                            {user?.displayName?.[0]}
                        </div>
                        <div>
                            <div className="text-sm font-medium text-white">{user?.displayName}</div>
                            <div className="text-xs text-zinc-400 capitalize">{user?.role}</div>
                        </div>
                    </div>

                    {/* Power Actions */}
                    <div className="grid grid-cols-2 gap-2">
                        <button onClick={() => { setIsStartOpen(false); lock(); }} className="flex items-center gap-2 p-2 hover:bg-white/10 rounded text-zinc-300 text-sm">
                            <Lock size={16} /> Lock
                        </button>
                        <button onClick={() => { setIsStartOpen(false); logout(); }} className="flex items-center gap-2 p-2 hover:bg-white/10 rounded text-zinc-300 text-sm">
                            <LogOut size={16} /> Sign Out
                        </button>
                        <button onClick={() => { setIsStartOpen(false); sleep(); }} className="flex items-center gap-2 p-2 hover:bg-white/10 rounded text-zinc-300 text-sm">
                            <Moon size={16} /> Sleep
                        </button>
                        <button onClick={() => { setIsStartOpen(false); restart(); }} className="flex items-center gap-2 p-2 hover:bg-white/10 rounded text-zinc-300 text-sm">
                            <RefreshCw size={16} /> Restart
                        </button>
                    </div>
                    <div className="mt-2 pt-2 border-t border-white/5">
                        <button onClick={() => { setIsStartOpen(false); shutdown(); }} className="flex items-center gap-2 w-full p-2 hover:bg-red-500/20 text-red-400 hover:text-red-300 rounded text-sm transition-colors">
                            <Power size={16} /> Shut Down
                        </button>
                    </div>
                </div>
            )}

            {/* Click Outside Listener for Start Menu (Simple Overlay) */}
            {isStartOpen && <div className="fixed inset-0 z-[9998]" onClick={() => setIsStartOpen(false)} />}

            <div className="fixed bottom-0 left-0 right-0 h-14 bg-zinc-950/80 backdrop-blur-md border-t border-zinc-800 flex items-center justify-between px-4 z-[9999]">

                {/* Start & Pinned Apps */}
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setIsStartOpen(!isStartOpen)}
                        className={`p-2 rounded-md transition-colors group relative ${isStartOpen ? 'bg-zinc-800' : 'hover:bg-zinc-800'}`}>
                        <div className="absolute -top-1 right-0 w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                        <LayoutGrid size={24} className={isStartOpen ? "text-blue-400" : "text-blue-500"} />
                    </button>

                    <div className="h-6 w-[1px] bg-zinc-800 mx-2" />

                    {/* ... rest of taskbar */}

                    {/* Open Windows */}
                    <div className="flex items-center gap-2">
                        {windows.map((win) => {
                            const isActive = win.id === activeWindowId;
                            return (
                                <button
                                    key={win.id}
                                    onClick={() => handleTaskClick(win.id, win.isMinimized, isActive)}
                                    className={`
                                    flex items-center gap-2 px-4 py-2 rounded-md transition-all border border-transparent
                                    ${isActive && !win.isMinimized ? 'bg-zinc-800 border-zinc-700 text-white' : 'hover:bg-zinc-800/50 text-zinc-400'}
                                    ${win.isMinimized ? 'opacity-50' : 'opacity-100'}
                                `}
                                >
                                    <Terminal size={14} />
                                    <span className="text-xs font-medium max-w-[100px] truncate">{win.title}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* System Tray */}
                <div className="flex items-center gap-4 text-zinc-400">
                    <div className="flex flex-col items-end">
                        <span className="text-xs font-medium text-white">
                            {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <span className="text-[10px]">
                            {currentTime.toLocaleDateString()}
                        </span>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Taskbar;
