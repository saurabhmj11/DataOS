/**
 * Copyright (c) 2024. Designed and Developed by Saurabh Lokhande.
 */

import React from 'react';
import { DataVersion } from '../types';
import { GitCommit, Clock, Database, PlusCircle } from 'lucide-react';

interface Props {
    versions: DataVersion[];
}

const VersionHistory: React.FC<Props> = ({ versions }) => {
    return (
        <div className="glass-panel p-6 rounded-xl border border-zinc-800 bg-zinc-900/50">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <GitCommit size={18} className="text-pink-400" />
                Data Provenance (Version History)
            </h3>

            <div className="space-y-4 relative">
                {/* Vertical Line */}
                <div className="absolute left-[19px] top-2 bottom-2 w-0.5 bg-zinc-800" />

                {versions.map((version, index) => (
                    <div key={version.id} className="relative flex gap-4 animate-in slide-in-from-left-2" style={{ animationDelay: `${index * 100}ms` }}>

                        {/* Dot Icon */}
                        <div className={`z-10 w-10 h-10 rounded-full flex items-center justify-center border-2 border-zinc-900 ${index === 0 ? 'bg-pink-500 text-white shadow-lg shadow-pink-500/20' : 'bg-zinc-800 text-zinc-400'
                            }`}>
                            {version.type === 'append' ? <PlusCircle size={16} /> : <Database size={16} />}
                        </div>

                        {/* Content */}
                        <div className="flex-1 bg-zinc-950/50 p-3 rounded-lg border border-zinc-800 hover:border-zinc-700 transition-colors">
                            <div className="flex justify-between items-start mb-1">
                                <span className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded ${version.type === 'append' ? 'bg-blue-500/10 text-blue-400' : 'bg-green-500/10 text-green-400'
                                    }`}>
                                    {version.id}
                                </span>
                                <span className="text-xs text-zinc-500 flex items-center gap-1">
                                    <Clock size={10} />
                                    {version.timestamp.toLocaleTimeString()}
                                </span>
                            </div>
                            <p className="text-sm text-zinc-200 font-medium mb-1">{version.message}</p>
                            <div className="flex items-center gap-4 text-xs text-zinc-500">
                                <span>{version.rowCount.toLocaleString()} Rows</span>
                                <span>by {version.author}</span>
                            </div>
                        </div>
                    </div>
                ))}

                {versions.length === 0 && (
                    <div className="text-center py-8 text-zinc-500 text-xs italic">
                        No version history available. Upload data to begin tracking.
                    </div>
                )}
            </div>
        </div>
    );
};

export default VersionHistory;
