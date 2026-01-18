/**
 * Copyright (c) 2024. Designed and Developed by Saurabh Lokhande.
 */

import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import Draggable from 'react-draggable';
import { X, Minus, Square, Maximize2 } from 'lucide-react';
import { useWindowStore, WindowState } from '../../store/windowStore';

interface WindowFrameProps {
    window: WindowState;
}

const WindowFrame: React.FC<WindowFrameProps> = ({ window }) => {
    const { closeWindow, minimizeWindow, maximizeWindow, restoreWindow, focusWindow, resizeWindow } = useWindowStore();
    const nodeRef = useRef(null);
    const resizeRef = useRef<{ startX: number, startY: number, startWidth: number, startHeight: number } | null>(null);

    if (window.isMinimized) return null;

    const handleResizeStart = (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        const width = window.size?.width || 800;
        const height = window.size?.height || 600;
        resizeRef.current = { startX: e.clientX, startY: e.clientY, startWidth: width, startHeight: height };

        document.addEventListener('mousemove', handleResizeMove);
        document.addEventListener('mouseup', handleResizeEnd);
    };

    const handleResizeMove = (e: MouseEvent) => {
        if (!resizeRef.current) return;
        const deltaX = e.clientX - resizeRef.current.startX;
        const deltaY = e.clientY - resizeRef.current.startY;

        const newWidth = Math.max(400, resizeRef.current.startWidth + deltaX);
        const newHeight = Math.max(300, resizeRef.current.startHeight + deltaY);

        resizeWindow(window.id, { width: newWidth, height: newHeight });
    };

    const handleResizeEnd = () => {
        resizeRef.current = null;
        document.removeEventListener('mousemove', handleResizeMove);
        document.removeEventListener('mouseup', handleResizeEnd);
    };

    return (
        <Draggable
            handle=".window-header"
            nodeRef={nodeRef}
            onStart={() => focusWindow(window.id)}
            position={window.isMaximized ? { x: 0, y: 0 } : undefined}
            defaultPosition={window.position || { x: 50, y: 50 }}
            disabled={window.isMaximized}
        >
            <motion.div
                ref={nodeRef}
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                transition={{ duration: 0.2, ease: "circOut" }}
                className={`fixed flex flex-col bg-[#09090b]/90 backdrop-blur-xl border border-white/10 rounded-lg shadow-2xl overflow-hidden transition-all duration-200
        ${window.isMaximized ? 'inset-0 w-full h-[calc(100vh-48px)] rounded-none' : ''}
        ${window.isFocused ? 'ring-1 ring-white/20 shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)]' : 'opacity-90'}
        `}
                style={{
                    zIndex: window.zIndex,
                    width: window.isMaximized ? '100%' : (window.size?.width || 800),
                    height: window.isMaximized ? '100%' : (window.size?.height || 600)
                }}
                onClick={() => focusWindow(window.id)}
            >
                {/* Window Header */}
                <div className={`window-header h-10 flex items-center justify-between px-3 cursor-move select-none border-b border-white/5 ${window.isFocused ? 'bg-white/5' : 'bg-black/20'}`}>
                    <div className='flex items-center gap-2'>
                        {/* Traffic Lights */}
                        <div className='flex items-center gap-1.5 group'>
                            <button onClick={(e) => { e.stopPropagation(); closeWindow(window.id); }} className='w-3 h-3 rounded-full bg-[#FF5F56] hover:bg-[#ff3b30] flex items-center justify-center border border-black/10 transition-colors'>
                                <X size={8} className='text-black/50 opacity-0 group-hover:opacity-100' />
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); minimizeWindow(window.id); }} className='w-3 h-3 rounded-full bg-[#FFBD2E] hover:bg-[#ffcc00] flex items-center justify-center border border-black/10 transition-colors'>
                                <Minus size={8} className='text-black/50 opacity-0 group-hover:opacity-100' />
                            </button>
                            <button onClick={(e) => {
                                e.stopPropagation();
                                window.isMaximized ? restoreWindow(window.id) : maximizeWindow(window.id);
                            }} className='w-3 h-3 rounded-full bg-[#27C93F] hover:bg-[#28cd41] flex items-center justify-center border border-black/10 transition-colors'>
                                {window.isMaximized ?
                                    <Maximize2 size={6} className='text-black/50 opacity-0 group-hover:opacity-100' /> :
                                    <Square size={6} className='text-black/50 opacity-0 group-hover:opacity-100 fill-current' />
                                }
                            </button>
                        </div>
                        <span className="ml-4 text-xs font-medium text-zinc-400 font-sans tracking-wide">{window.title}</span>
                    </div>
                </div>

                {/* Window Content */}
                <div className="flex-1 overflow-auto bg-black/50 relative">
                    <div className="absolute inset-0 overflow-auto">
                        {window.component}
                    </div>
                </div>

                {/* Resize Handle */}
                {!window.isMaximized && (
                    <div
                        className="absolute bottom-0 right-0 w-4 h-4 cursor-nwse-resize z-50 flex items-end justify-end p-0.5 opacity-0 hover:opacity-100 transition-opacity"
                        onMouseDown={handleResizeStart}
                    >
                        <div className="w-2 h-2 border-r-2 border-b-2 border-zinc-500 rounded-br-sm" />
                    </div>
                )}
            </motion.div>
        </Draggable>
    );
};

export default WindowFrame;
