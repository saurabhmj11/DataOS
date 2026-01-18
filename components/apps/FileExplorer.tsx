/**
 * Copyright (c) 2024. Designed and Developed by Saurabh Lokhande.
 */

import React, { useRef, useState, useEffect } from 'react'; // Added useState, useEffect
import { jobScheduler } from '../../services/jobScheduler';
import { useWindowStore } from '../../store/windowStore';
import { useAppStore } from '../../store/useAppStore'; // Added useWindowStore
import { fileSystem } from '../../services/fileSystemService'; // Added fileSystem
import { FileNode } from '../../services/db'; // Added FileNode
import DataAnalyst from './DataAnalyst'; // Added DataAnalyst
import { Folder, FileText, File, ChevronRight, Home, Trash2, ArrowLeft, UploadCloud } from 'lucide-react';

const FileExplorer = () => {
    const [currentPath, setCurrentPath] = useState('/home');
    const [nodes, setNodes] = useState<FileNode[]>([]);
    const [loading, setLoading] = useState(false);
    const { openWindow } = useWindowStore();
    const { activeProjectId } = useAppStore();
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        loadPath(currentPath);
        // Ensure bootstrap happens once
        fileSystem.bootstrap().then(() => loadPath(currentPath));
    }, []);

    const loadPath = async (path: string) => {
        setLoading(true);
        try {
            const files = await fileSystem.ls(path);
            setNodes(files);
            setCurrentPath(path);
        } catch (e) {
            console.error(e);
        }
        setLoading(false);
    };

    const handleNavigate = (path: string) => {
        loadPath(path);
    };

    const navigateUp = () => {
        if (currentPath === '/') return;
        const parts = currentPath.split('/');
        parts.pop();
        const parent = parts.join('/') || '/';
        loadPath(parent);
    };

    const handleNodeClick = (node: FileNode) => {
        if (node.type === 'directory') {
            handleNavigate(node.path);
        } else {
            // File Association Logic
            if (node.name.endsWith('.csv')) {
                openWindow('analyst-' + node.path, node.name, <DataAnalyst />); // TODO: Pass filePath prop
            } else {
                alert(`Opening ${node.name}... (No app associated)`);
            }
        }
    };

    const handleDelete = async (e: React.MouseEvent, path: string) => {
        e.stopPropagation();
        if (confirm(`Delete ${path}?`)) {
            await fileSystem.delete(path);
            loadPath(currentPath);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setLoading(true);
            const content = await file.text(); // For now text, later binary/blob
            const fileName = file.name;
            const fullPath = currentPath === '/' ? `/${fileName}` : `${currentPath}/${fileName}`;

            // 1. Write to VFS
            await fileSystem.writeFile(fullPath, content);

            // 2. Trigger Ingestion Job (if CSV)
            if (fileName.toLowerCase().endsWith('.csv') && activeProjectId) {
                await jobScheduler.submitJob(activeProjectId, 'ingest', {
                    path: fullPath,
                    tableName: fileName.replace('.csv', '').replace(/\W/g, '_').toLowerCase()
                });
                // Notify user (toast would be better, using alert for now)
                console.log("Ingestion job submitted for " + fileName);
            }

            // 3. Refresh
            await loadPath(currentPath);
        } catch (error) {
            console.error("Upload failed", error);
            alert("Upload failed: " + (error as any).message);
        } finally {
            setLoading(false);
            if (fileInputRef.current) fileInputRef.current.value = ''; // Reset
        }
    };

    const Breadcrumbs = () => {
        const parts = currentPath.split('/').filter(Boolean);
        let accum = '';
        return (
            <div className="flex items-center gap-1 text-sm text-zinc-400 bg-zinc-900 border border-zinc-700 rounded-md px-2 py-1 flex-1 mx-2">
                <button onClick={() => loadPath('/')} className="hover:text-white"><Home size={14} /></button>
                {parts.map((p) => {
                    accum += '/' + p;
                    const path = accum;
                    return (
                        <React.Fragment key={path}>
                            <ChevronRight size={12} />
                            <button onClick={() => loadPath(path)} className="hover:text-white">{p}</button>
                        </React.Fragment>
                    )
                })}
            </div>
        );
    };

    return (
        <div className="flex bg-[#121212] h-full text-zinc-200 font-sans selection:bg-blue-500/30">
            {/* Sidebar */}
            <div className="w-48 bg-zinc-900 border-r border-zinc-800 p-2 flex flex-col gap-1">
                <div className="px-2 py-1 text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1">Favorites</div>
                <button onClick={() => loadPath('/home')} className={`flex items-center gap-2 px-2 py-1.5 rounded-md text-sm ${currentPath.startsWith('/home') ? 'bg-zinc-800 text-white' : 'hover:bg-zinc-800/50 text-zinc-400'}`}>
                    <Home size={16} className="text-blue-400" /> Home
                </button>
                <button onClick={() => loadPath('/home/documents')} className="flex items-center gap-2 px-2 py-1.5 rounded-md text-sm hover:bg-zinc-800/50 text-zinc-400">
                    <Folder size={16} className="text-yellow-400" /> Documents
                </button>
                <button onClick={() => loadPath('/system')} className="flex items-center gap-2 px-2 py-1.5 rounded-md text-sm hover:bg-zinc-800/50 text-zinc-400">
                    <Folder size={16} className="text-zinc-500" /> System
                </button>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Toolbar */}
                <div className="h-10 border-b border-zinc-800 flex items-center px-2">
                    <button onClick={navigateUp} disabled={currentPath === '/'} className="p-1 hover:bg-zinc-800 rounded disabled:opacity-30">
                        <ArrowLeft size={16} />
                    </button>
                    <Breadcrumbs />

                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        className="hidden"
                        accept=".csv,.json,.txt,.md"
                    />
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-1 px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs ml-2 transition-colors">
                        <UploadCloud size={14} /> Upload
                    </button>
                </div>

                {/* File Grid */}
                <div className="flex-1 p-4 grid grid-cols-[repeat(auto-fill,minmax(100px,1fr))] content-start gap-4 overflow-y-auto">
                    {loading ? <div className="col-span-full text-center text-zinc-500">Loading...</div> :
                        nodes.length === 0 ? <div className="col-span-full text-center text-zinc-600 mt-10">Folder is empty</div> :
                            nodes.map(node => (
                                <div
                                    key={node.path}
                                    onDoubleClick={() => handleNodeClick(node)}
                                    className="group flex flex-col items-center gap-2 p-2 rounded-lg hover:bg-blue-500/10 hover:ring-1 hover:ring-blue-500/50 cursor-pointer transition-all"
                                >
                                    <div className="relative">
                                        {node.type === 'directory' ?
                                            <Folder size={48} className="text-yellow-500 fill-yellow-500/20" /> :
                                            node.name.endsWith('.csv') ? <FileText size={48} className="text-green-500" /> :
                                                <File size={48} className="text-zinc-500" />
                                        }
                                        <button
                                            onClick={(e) => handleDelete(e, node.path)}
                                            className="absolute -top-1 -right-1 bg-red-500 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-400">
                                            <Trash2 size={10} className="text-white" />
                                        </button>
                                    </div>
                                    <span className="text-xs text-center break-all line-clamp-2 w-full px-1 group-hover:text-blue-400">
                                        {node.name}
                                    </span>
                                </div>
                            ))}
                </div>
            </div>
        </div>
    );
};

export default FileExplorer;
