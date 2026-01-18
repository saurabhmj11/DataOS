/**
 * Copyright (c) 2024. Designed and Developed by Saurabh Lokhande.
 */

import React from 'react';
import { LineageNode, LineageEdge } from '../types';
import { Database, FileSpreadsheet, LayoutDashboard, GitMerge, User } from 'lucide-react';

interface Props {
    nodes: LineageNode[];
    edges: LineageEdge[];
}

const LineageGraph: React.FC<Props> = ({ nodes, edges }) => {

    // Simple layout calculation (mocked for MVP)
    // We'll organize them in a left-to-right flow based on type
    const getIcon = (type: string) => {
        switch (type) {
            case 'source': return <FileSpreadsheet size={20} className="text-green-400" />;
            case 'transformation': return <GitMerge size={20} className="text-blue-400" />;
            case 'dataset': return <Database size={20} className="text-purple-400" />;
            case 'dashboard': return <LayoutDashboard size={20} className="text-orange-400" />;
            default: return <Database size={20} />;
        }
    };

    const levels = {
        source: 0,
        transformation: 1,
        dataset: 2,
        dashboard: 3
    };

    return (
        <div className="w-full h-[400px] bg-zinc-900/50 rounded-xl border border-zinc-800 relative overflow-hidden flex items-center justify-center p-8">
            {/* Background Grid */}
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #444 1px, transparent 0)', backgroundSize: '20px 20px' }} />

            <div className="flex gap-16 items-center relative z-10">
                {[0, 1, 2, 3].map(level => {
                    const levelNodes = nodes.filter(n => levels[n.type] === level);
                    if (levelNodes.length === 0) return null;

                    return (
                        <div key={level} className="flex flex-col gap-8">
                            {levelNodes.map(node => (
                                <div key={node.id} className="relative group">
                                    {/* Connector Line (Incoming) */}
                                    {level > 0 && (
                                        <div className="absolute top-1/2 -left-8 w-8 h-[2px] bg-zinc-700 -z-10" />
                                    )}

                                    {/* Node Card */}
                                    <div className="w-48 bg-zinc-950 border border-zinc-700 rounded-lg p-3 hover:border-blue-500 transition-all cursor-pointer shadow-xl shadow-black/50 group-hover:scale-105">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="p-2 bg-zinc-900 rounded-md border border-zinc-800">
                                                {getIcon(node.type)}
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-zinc-300 truncate w-24">{node.label}</p>
                                                <p className="text-[10px] text-zinc-500 uppercase">{node.type}</p>
                                            </div>
                                        </div>

                                        <div className="flex justify-between items-center border-t border-zinc-800 pt-2 mt-1">
                                            <span className={`text-[9px] px-1.5 py-0.5 rounded-full uppercase font-bold
                                        ${node.status === 'active' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}
                                    `}>
                                                {node.status}
                                            </span>
                                            <div className="flex items-center gap-1 text-[9px] text-zinc-500">
                                                <User size={10} />
                                                {node.owner || 'System'}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Connector Line (Outgoing) */}
                                    {/* Check if this node is a source for any edge */}
                                    {edges.some(e => e.source === node.id) && (
                                        <div className="absolute top-1/2 -right-8 w-8 h-[2px] bg-zinc-700 -z-10">
                                            {/* Simple animation particle */}
                                            {node.status === 'active' && <div className="absolute top-[-1px] left-0 w-2 h-1 bg-blue-500 rounded-full animate-line-flow" />}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    );
                })}
            </div>

            {/* Legend / Title */}
            <div className="absolute top-4 left-4">
                <h3 className="text-sm font-bold text-zinc-400">Provenance Graph</h3>
                <p className="text-xs text-zinc-600">Live Data Dependency Map</p>
            </div>
        </div>
    );
};

export default LineageGraph;
