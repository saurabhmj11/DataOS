/**
 * Copyright (c) 2024. Designed and Developed by Saurabh Lokhande.
 */

import React, { useState } from 'react';
import { ChevronRight, ChevronDown, AlertTriangle, TrendingUp, Minus } from 'lucide-react';
import { RootCauseNode } from '../types';

interface Props {
    node: RootCauseNode;
    depth?: number;
}

const DrillDownTree: React.FC<Props> = ({ node, depth = 0 }) => {
    const [isExpanded, setIsExpanded] = useState(true);
    const hasChildren = node.children && node.children.length > 0;

    return (
        <div className="flex flex-col">
            <div className="flex items-center">
                {/* Connection Line (Left) */}
                {depth > 0 && (
                    <div className="w-8 h-px bg-zinc-700 mr-2 relative">
                        <div className="absolute -left-1 -top-0.5 w-1 h-1 rounded-full bg-zinc-700" />
                    </div>
                )}

                {/* Node Card */}
                <div
                    onClick={() => hasChildren && setIsExpanded(!isExpanded)}
                    className={`
                relative flex items-center gap-3 p-3 rounded-lg border backdrop-blur-sm transition-all cursor-pointer min-w-[280px]
                ${node.status === 'critical' ? 'bg-red-900/20 border-red-500/50 hover:bg-red-900/30' :
                            node.status === 'warning' ? 'bg-yellow-900/20 border-yellow-500/50 hover:bg-yellow-900/30' :
                                node.status === 'good' ? 'bg-green-900/20 border-green-500/50 hover:bg-green-900/30' :
                                    'bg-zinc-800/50 border-zinc-700 hover:bg-zinc-800'
                        }
            `}
                >
                    {/* Status Icon */}
                    <div className={`
                w-8 h-8 rounded-full flex items-center justify-center shrink-0
                ${node.status === 'critical' ? 'bg-red-500/20 text-red-400' :
                            node.status === 'warning' ? 'bg-yellow-500/20 text-yellow-400' :
                                node.status === 'good' ? 'bg-green-500/20 text-green-400' :
                                    'bg-zinc-700 text-zinc-400'
                        }
            `}>
                        {node.status === 'critical' || node.status === 'warning' ? <AlertTriangle size={16} /> :
                            node.status === 'good' ? <TrendingUp size={16} /> : <Minus size={16} />}
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                        <p className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider">{node.metric}</p>
                        <div className="flex justify-between items-end">
                            <h4 className="text-sm font-semibold text-white">{node.label}</h4>
                            <div className="text-right">
                                <p className="text-sm font-mono font-bold text-white">{node.value}</p>
                                <p className={`text-[10px] ${node.change.startsWith('-') ? 'text-red-400' : 'text-green-400'}`}>
                                    {node.change}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Expand Toggle */}
                    {hasChildren && (
                        <div className="absolute -right-3 top-1/2 -translate-y-1/2 bg-zinc-800 border border-zinc-600 rounded-full p-0.5 text-zinc-400 hover:text-white shadow-xl z-10">
                            {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                        </div>
                    )}
                </div>
            </div>

            {/* Children Container */}
            {hasChildren && isExpanded && (
                <div className="flex flex-col ml-12 border-l border-zinc-800 pl-4 py-2 space-y-4 relative">
                    {/* Vertical connector fix */}
                    {node.children!.map((child) => (
                        <DrillDownTree key={child.id} node={child} depth={depth + 1} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default DrillDownTree;
