/**
 * Copyright (c) 2024. Designed and Developed by Saurabh Lokhande.
 */

import React, { useState, useEffect } from 'react';
import { FolderPlus, Monitor, Briefcase } from 'lucide-react';
import { projectService } from '../../services/projectService';
import { useAppStore } from '../../store/useAppStore';
import { useAuthStore } from '../../store/useAuthStore';

export default function ProjectManager() {
    const { activeProjectId, projects, refreshProjects } = useAppStore();
    const { user } = useAuthStore();
    const [newProjectName, setNewProjectName] = useState('');
    const [isCreating, setIsCreating] = useState(false);

    useEffect(() => {
        if (user) {
            refreshProjects(user.id);
        }
    }, [user]);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newProjectName.trim()) return;

        // Pass ownerId
        await projectService.createProject(newProjectName, undefined, user?.id);

        if (user) refreshProjects(user.id);

        setNewProjectName('');
        setIsCreating(false);
    };

    const handleSwitch = async (id: number) => {
        await projectService.switchProject(id);
    };

    return (
        <div className="h-full w-full bg-zinc-900 text-white flex flex-col font-sans">
            {/* Header */}
            <div className="p-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/50 backdrop-blur-md">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500/20 rounded-lg">
                        <Briefcase size={20} className="text-blue-400" />
                    </div>
                    <div>
                        <h1 className="font-medium">Workspaces</h1>
                        <p className="text-xs text-zinc-400">Manage your data projects</p>
                    </div>
                </div>
                <button
                    onClick={() => setIsCreating(true)}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-xs rounded-md transition-colors flex items-center gap-2"
                >
                    <FolderPlus size={14} />
                    New Project
                </button>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-4">
                {isCreating && (
                    <form onSubmit={handleCreate} className="mb-4 p-3 bg-zinc-800/50 border border-zinc-700 rounded-lg animate-in fade-in slide-in-from-top-2">
                        <label className="text-xs text-zinc-400 block mb-1">Project Name</label>
                        <div className="flex gap-2">
                            <input
                                autoFocus
                                type="text"
                                value={newProjectName}
                                onChange={e => setNewProjectName(e.target.value)}
                                className="flex-1 bg-zinc-900 border border-zinc-700 rounded px-2 py-1 text-sm focus:outline-none focus:border-blue-500"
                                placeholder="e.g. Q1 Marketing Analysis"
                            />
                            <button type="submit" className="bg-blue-600 px-3 py-1 rounded text-xs font-medium">Create</button>
                            <button type="button" onClick={() => setIsCreating(false)} className="bg-zinc-700 px-3 py-1 rounded text-xs">Cancel</button>
                        </div>
                    </form>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {projects.map(project => (
                        <div
                            key={project.id}
                            onClick={() => project.id && handleSwitch(project.id)}
                            className={`
                                group relative p-4 rounded-xl border cursor-pointer transition-all duration-200
                                ${project.id === activeProjectId
                                    ? 'bg-blue-500/10 border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.1)]'
                                    : 'bg-zinc-800/50 border-zinc-700/50 hover:bg-zinc-800 hover:border-zinc-600'
                                }
                            `}
                        >
                            <div className="flex items-start justify-between mb-2">
                                <div className={`p-2 rounded-lg ${project.id === activeProjectId ? 'bg-blue-500 text-white' : 'bg-zinc-700 text-zinc-400 group-hover:bg-zinc-600 group-hover:text-zinc-200'}`}>
                                    <Monitor size={18} />
                                </div>
                                {project.id === activeProjectId && (
                                    <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-[10px] rounded-full font-medium">Active</span>
                                )}
                            </div>

                            <h3 className={`font-medium mb-1 ${project.id === activeProjectId ? 'text-blue-100' : 'text-zinc-200'}`}>
                                {project.name}
                            </h3>
                            <p className="text-xs text-zinc-500 truncate">
                                Last active: {new Date(project.updated_at).toLocaleDateString()}
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Footer */}
            <div className="p-2 border-t border-zinc-800 text-[10px] text-zinc-600 text-center">
                DataOS Kernel v2.0 • Persistent Workspace Enabled
            </div>
        </div>
    );
}
