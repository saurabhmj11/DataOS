/**
 * Copyright (c) 2024. Designed and Developed by Saurabh Lokhande.
 */

import React from 'react';
import { X, Network, CheckCircle2, AlertTriangle, Code, Play, GitMerge } from 'lucide-react';
import { Insight } from '../types';
import DrillDownTree from './DrillDownTree';

interface Props {
    insight: Insight | null;
    onClose: () => void;
}

const ExplanationModal: React.FC<Props> = ({ insight, onClose }) => {
    if (!insight || !insight.explanation) return null;

    const { technicalLogic, dataLineage, confidenceScore, keyAssumptions } = insight.explanation;
    const confidencePercent = Math.round(confidenceScore * 100);

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="relative w-full max-w-4xl bg-os-800 rounded-2xl border border-os-border shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-os-border bg-os-900/50">
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${insight.type === 'risk' ? 'bg-red-500/20 text-red-400' :
                            insight.type === 'opportunity' ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'
                            }`}>
                            <Network size={20} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">Insight Intelligence</h2>
                            <p className="text-sm text-zinc-400 flex items-center gap-2">
                                Provenace Chain Verification • <span className="text-blue-400">ID: {insight.id}</span>
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-6 space-y-8">

                    {/* 0. Root Cause Analysis (NEW) */}
                    {insight.rootCause && (
                        <div className="animate-in slide-in-from-bottom-5 duration-500 delay-100">
                            <div className="flex items-center gap-2 mb-4">
                                <GitMerge className="text-red-400" size={20} />
                                <h3 className="text-white font-medium text-lg">Root Cause Drill-Down</h3>
                                <span className="text-[10px] bg-red-900/30 text-red-400 px-2 py-0.5 rounded border border-red-500/30">CRITICAL DRIVER FOUND</span>
                            </div>
                            <div className="bg-zinc-900/30 border border-zinc-700/50 rounded-xl p-6 overflow-x-auto">
                                <DrillDownTree node={insight.rootCause} />
                            </div>
                        </div>
                    )}

                    {/* 1. Confidence & Validation */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-zinc-900/50 rounded-xl p-4 border border-zinc-700/50">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-zinc-400 text-xs font-semibold uppercase">Confidence Score</span>
                                <CheckCircle2 size={16} className={confidencePercent > 80 ? 'text-green-500' : 'text-yellow-500'} />
                            </div>
                            <div className="flex items-end gap-2 mb-2">
                                <span className="text-3xl font-mono text-white">{confidencePercent}%</span>
                                <span className="text-sm text-zinc-500 mb-1">Statistical Certainty</span>
                            </div>
                            <div className="w-full h-1.5 bg-zinc-700/50 rounded-full overflow-hidden">
                                <div
                                    className={`h-full rounded-full ${confidencePercent > 80 ? 'bg-green-500' : 'bg-yellow-500'}`}
                                    style={{ width: `${confidencePercent}%` }}
                                />
                            </div>
                        </div>

                        <div className="bg-zinc-900/50 rounded-xl p-4 border border-zinc-700/50">
                            <span className="text-zinc-400 text-xs font-semibold uppercase mb-3 block">Data Lineage Trace</span>
                            <div className="space-y-2">
                                {dataLineage.map((step, idx) => (
                                    <div key={idx} className="flex items-center gap-3">
                                        <div className="flex flex-col items-center gap-1">
                                            <div className="w-2 h-2 rounded-full bg-blue-500 shadow-lg shadow-blue-500/50" />
                                            {idx < dataLineage.length - 1 && <div className="w-0.5 h-3 bg-zinc-700" />}
                                        </div>
                                        <span className="text-sm text-zinc-300">{step}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* 2. Logic (SQL) */}
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <Code className="text-purple-400" size={18} />
                            <h3 className="text-white font-medium">Computational Logic (SQL Representation)</h3>
                        </div>
                        <div className="bg-[#1e1e1e] rounded-xl border border-zinc-700 overflow-hidden group">
                            <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-700 bg-zinc-800/50">
                                <span className="text-xs text-zinc-500 font-mono">analysis_query_v4.sql</span>
                                <div className="flex gap-1.5">
                                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/20" />
                                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20" />
                                    <div className="w-2.5 h-2.5 rounded-full bg-green-500/20" />
                                </div>
                            </div>
                            <div className="p-4 overflow-x-auto">
                                <pre className="text-sm font-mono text-blue-300 whitespace-pre-wrap leading-relaxed">
                                    {technicalLogic}
                                </pre>
                            </div>
                            <div className="px-4 py-2 bg-purple-500/10 border-t border-purple-500/20 flex items-center gap-2">
                                <Play size={14} className="text-purple-400" />
                                <span className="text-xs text-purple-300">Logic validated against schema hash #8A2B9C</span>
                            </div>
                        </div>
                    </div>

                    {/* 3. Assumptions */}
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <AlertTriangle className="text-yellow-500" size={18} />
                            <h3 className="text-white font-medium">Key Assumptions & Constraints</h3>
                        </div>
                        <ul className="space-y-2">
                            {keyAssumptions.map((item, i) => (
                                <li key={i} className="flex gap-3 text-sm text-zinc-400">
                                    <span className="text-zinc-600 mt-1">•</span>
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default ExplanationModal;
