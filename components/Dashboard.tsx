/**
 * Copyright (c) 2024. Designed and Developed by Saurabh Lokhande.
 */

import React, { useState, useEffect } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, LineChart, Line, AreaChart, Area } from 'recharts';
import { DataStats, Insight, AppMode, HypothesisResult, SimulationScenario } from '../types';
import { Activity, Target, FlaskConical, CheckCircle2, XCircle, BrainCircuit, Search, Sliders, TrendingUp } from 'lucide-react';
import { testHypothesis } from '../services/geminiService';
import ExplanationModal from './ExplanationModal';
import SimulationPanel from './SimulationPanel';
import LineageGraph from './LineageGraph';
import VersionHistory from './VersionHistory';

interface Props {
    stats: DataStats | null;
    insights: Insight[];
    data: any[];
    mode: AppMode;
    narrativeBrief?: string;
    semanticMetrics?: any[];
}

const Dashboard: React.FC<Props> = ({ stats, insights, data: initialData, mode, narrativeBrief, semanticMetrics = [] }) => {
    const [liveMode, setLiveMode] = useState(false);
    const [displayData, setDisplayData] = useState<any[]>([]);

    // Hypothesis State
    const [hypothesisInput, setHypothesisInput] = useState('');
    const [hypothesisResult, setHypothesisResult] = useState<HypothesisResult | null>(null);
    const [isTestingHypothesis, setIsTestingHypothesis] = useState(false);

    // Explanation State
    const [selectedInsight, setSelectedInsight] = useState<Insight | null>(null);
    const [selectedScenario, setSelectedScenario] = useState<SimulationScenario | null>(null);

    useEffect(() => {
        setDisplayData(initialData);
    }, [initialData]);

    useEffect(() => {
        let interval: any;
        if (liveMode && stats) {
            interval = setInterval(() => {
                setDisplayData(prev => {
                    const lastRow = prev[prev.length - 1];
                    const newRow = { ...lastRow };
                    stats.columns.forEach(col => {
                        if (col.type === 'number') {
                            const variance = (Math.random() - 0.5) * 0.2;
                            newRow[col.name] = Math.round(Number(newRow[col.name]) * (1 + variance));
                        }
                    });
                    return [...prev.slice(1), newRow];
                });
            }, 1500);
        }
        return () => clearInterval(interval);
    }, [liveMode, stats]);

    const handleHypothesisTest = async () => {
        if (!hypothesisInput.trim()) return;
        setIsTestingHypothesis(true);
        setHypothesisResult(null);
        const res = await testHypothesis(hypothesisInput);
        setHypothesisResult(res);
        setIsTestingHypothesis(false);
    };

    if (!stats) return <div className="h-full w-full flex items-center justify-center text-zinc-500">No data loaded</div>;

    const numCol = stats.columns.find(c => c.type === 'number');
    const catCol = stats.columns.find(c => c.type === 'category' || c.type === 'string');
    const getCategoryData = (colName: string) => {
        const counts: Record<string, number> = {};
        displayData.forEach(d => {
            const val = String(d[colName]);
            counts[val] = (counts[val] || 0) + 1;
        });
        return Object.entries(counts).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 5);
    };

    const getNumericalData = (colName: string) => displayData.slice(-50).map((d, i) => ({ index: i, value: d[colName] }));

    // --- CEO MODE RENDER ---
    if (mode === 'CEO') {
        return (
            <div className="h-full overflow-y-auto p-6 space-y-8 animate-in fade-in">
                <ExplanationModal insight={selectedInsight} onClose={() => setSelectedInsight(null)} />

                {/* Morning Briefing */}
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-900/40 to-indigo-900/40 border border-blue-500/20 p-8 shadow-2xl">
                    <div className="absolute top-0 right-0 p-4 opacity-10"><Target size={120} className="text-white" /></div>
                    <h2 className="text-sm font-mono text-blue-300 uppercase tracking-widest mb-2">Morning Executive Briefing</h2>
                    <p className="text-2xl md:text-3xl font-light text-white leading-relaxed max-w-4xl">
                        {narrativeBrief || "Analyzing your business data..."}
                    </p>
                </div>

                {/* Semantic Metrics (New Semantic Layer) */}
                {semanticMetrics.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {semanticMetrics.map((metric) => (
                            <div key={metric.id} className="glass-panel p-6 rounded-xl border border-zinc-800 bg-zinc-900/50 animate-in fade-in slide-in-from-bottom-3">
                                <div className="flex justify-between items-start mb-2">
                                    <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">{metric.name}</span>
                                    <TrendingUp size={16} className="text-green-500" />
                                </div>
                                <div className="text-3xl font-bold text-white mb-1">
                                    {metric.format === 'currency' ? '$' : ''}
                                    {metric.value?.toLocaleString(undefined, { maximumFractionDigits: 1 })}
                                    {metric.format === 'percent' ? '%' : ''}
                                </div>
                                <div className="text-xs text-zinc-400">{metric.description}</div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Strategic Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {insights.slice(0, 3).map((insight, idx) => (
                        <div key={idx} className="glass-panel p-6 rounded-xl border-t-4 border-t-transparent hover:border-t-blue-500 transition-all group relative">
                            <div className="flex justify-between items-start mb-4">
                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${insight.type === 'risk' ? 'bg-red-500/20 text-red-400' :
                                    insight.type === 'opportunity' ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'
                                    }`}>
                                    {insight.type}
                                </span>
                                <div className="flex gap-2">
                                    {insight.simulation && (
                                        <button
                                            onClick={() => setSelectedScenario(insight.simulation!)}
                                            className="text-zinc-500 hover:text-purple-400 transition-colors p-1 hover:bg-purple-500/10 rounded mr-1"
                                            title="Run Simulation"
                                        >
                                            <Sliders size={14} />
                                        </button>
                                    )}
                                    <button
                                        onClick={() => setSelectedInsight(insight)}
                                        className="text-zinc-500 hover:text-white transition-colors p-1 hover:bg-white/10 rounded"
                                        title="Explain Why"
                                    >
                                        <Search size={14} />
                                    </button>
                                    {insight.actionable && <span className="text-zinc-500 text-xs flex items-center gap-1 group-hover:text-blue-400 transition-colors"><Activity size={14} /> Actionable</span>}
                                </div>
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">{insight.title}</h3>
                            <p className="text-zinc-400 text-sm leading-relaxed mb-4">{insight.description}</p>
                            <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                                <div className="bg-blue-500 h-full rounded-full" style={{ width: `${insight.score * 100}%` }} />
                            </div>
                            <div className="flex justify-between mt-1">
                                <p className="text-[10px] text-zinc-600">Impact Score</p>
                                {insight.explanation && (
                                    <p className="text-[10px] text-blue-500/50 flex items-center gap-1">
                                        <CheckCircle2 size={10} /> Verified Logic
                                    </p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Simple Trend Visual */}
                {numCol && (
                    <div className="glass-panel p-8 rounded-2xl">
                        <h3 className="text-lg text-white mb-6 font-light">Metric Trend: <span className="font-bold">{numCol.name}</span></h3>
                        <div className="h-64 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={getNumericalData(numCol.name)}>
                                    <defs>
                                        <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                                    <XAxis dataKey="index" hide />
                                    <YAxis hide />
                                    <Tooltip contentStyle={{ backgroundColor: '#000', border: 'none' }} />
                                    <Area type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorVal)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // --- ANALYST MODE RENDER ---
    return (
        <div className="h-full overflow-y-auto p-6 space-y-6 animate-in fade-in">
            <ExplanationModal insight={selectedInsight} onClose={() => setSelectedInsight(null)} />
            {selectedScenario && (
                <SimulationPanel
                    scenario={selectedScenario}
                    onClose={() => setSelectedScenario(null)}
                />
            )}

            {/* Analyst Header */}
            <div className="flex justify-between items-center mb-2">
                <div>
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <BrainCircuit className="text-purple-400" /> Analyst Workbench
                    </h2>
                    <p className="text-xs text-zinc-500 font-mono mt-1">DUCKDB_MEMORY_USAGE: {stats.memoryUsage} | ROWS: {stats.rowCount}</p>
                </div>
                <button
                    onClick={() => setLiveMode(!liveMode)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-sm text-xs font-mono border transition-all ${liveMode ? 'bg-red-900/30 border-red-500 text-red-500 animate-pulse' : 'bg-zinc-800 border-zinc-700 text-zinc-400'}`}
                >
                    <Activity size={14} />
                    {liveMode ? 'STREAM: ON' : 'STREAM: OFF'}
                </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-zinc-900/50 p-3 rounded border border-zinc-800"><p className="text-zinc-500 text-[10px] uppercase">Rows</p><p className="text-xl font-mono text-white">{stats.rowCount.toLocaleString()}</p></div>
                <div className="bg-zinc-900/50 p-3 rounded border border-zinc-800"><p className="text-zinc-500 text-[10px] uppercase">Cols</p><p className="text-xl font-mono text-white">{stats.columns.length}</p></div>
                <div className="bg-zinc-900/50 p-3 rounded border border-zinc-800"><p className="text-zinc-500 text-[10px] uppercase">Nulls Fixed</p><p className="text-xl font-mono text-green-400">142</p></div>
                <div className="bg-zinc-900/50 p-3 rounded border border-zinc-800"><p className="text-zinc-500 text-[10px] uppercase">Schema</p><p className="text-xl font-mono text-blue-400">Locked</p></div>
            </div>

            {/* Hypothesis Lab (New Feature) */}
            <div className="glass-panel p-6 rounded-xl border border-dashed border-zinc-700 bg-zinc-900/30">
                <div className="flex items-center gap-2 mb-4">
                    <FlaskConical className="text-purple-400" size={20} />
                    <h3 className="font-semibold text-white">Hypothesis Lab</h3>
                    <span className="text-[10px] bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded ml-2">AGENTIC SCIENTIST</span>
                </div>

                {!hypothesisResult ? (
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={hypothesisInput}
                            onChange={(e) => setHypothesisInput(e.target.value)}
                            placeholder="e.g. Does increasing price by 10% reduce churn in the South region?"
                            className="flex-1 bg-zinc-950 border border-zinc-700 rounded p-3 text-sm focus:border-purple-500 focus:outline-none"
                            onKeyDown={(e) => e.key === 'Enter' && handleHypothesisTest()}
                        />
                        <button
                            onClick={handleHypothesisTest}
                            disabled={isTestingHypothesis || !hypothesisInput}
                            className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded font-medium disabled:opacity-50 min-w-[100px]"
                        >
                            {isTestingHypothesis ? 'Simulating...' : 'Test'}
                        </button>
                    </div>
                ) : (
                    <div className="bg-zinc-950 border border-zinc-800 rounded p-4 animate-in slide-in-from-top-2">
                        <div className="flex justify-between items-start mb-2">
                            <h4 className="text-sm text-zinc-300 font-medium">Result: {hypothesisResult.hypothesis}</h4>
                            <button onClick={() => setHypothesisResult(null)} className="text-zinc-500 hover:text-white"><XCircle size={16} /></button>
                        </div>
                        <div className="flex items-center gap-4 mb-3">
                            <span className={`flex items-center gap-1 text-sm font-bold ${hypothesisResult.status === 'confirmed' ? 'text-green-400' : 'text-red-400'}`}>
                                {hypothesisResult.status === 'confirmed' ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                                {hypothesisResult.status.toUpperCase()}
                            </span>
                            <span className="text-xs text-zinc-500">Confidence: {(hypothesisResult.confidence * 100).toFixed(0)}%</span>
                            <span className="text-xs text-blue-400">Impact: {hypothesisResult.impact}</span>
                        </div>
                        <p className="text-sm text-zinc-400">{hypothesisResult.explanation}</p>
                    </div>
                )}
            </div>

            {/* Traditional Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {catCol && (
                    <div className="glass-panel rounded-xl p-6 h-[350px]">
                        <h4 className="text-sm font-semibold text-zinc-300 mb-4 font-mono">DISTRIBUTION: {catCol.name}</h4>
                        <ResponsiveContainer width="100%" height="90%">
                            <BarChart data={getCategoryData(catCol.name)} layout="vertical" margin={{ left: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#333" horizontal={false} />
                                <XAxis type="number" stroke="#666" fontSize={10} />
                                <YAxis dataKey="name" type="category" stroke="#999" fontSize={10} width={80} />
                                <Tooltip contentStyle={{ backgroundColor: '#18181b', borderColor: '#333' }} />
                                <Bar dataKey="value" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                )}

                {numCol && (
                    <div className="glass-panel rounded-xl p-6 h-[350px]">
                        <h4 className="text-sm font-semibold text-zinc-300 mb-4 font-mono">TIME_SERIES: {numCol.name}</h4>
                        <ResponsiveContainer width="100%" height="90%">
                            <LineChart data={getNumericalData(numCol.name)}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                                <XAxis dataKey="index" stroke="#666" fontSize={10} />
                                <YAxis stroke="#666" fontSize={10} />
                                <Tooltip contentStyle={{ backgroundColor: '#18181b', borderColor: '#333' }} />
                                <Line type="step" dataKey="value" stroke="#10b981" dot={false} strokeWidth={2} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </div>

            {/* Data Lineage & Provenance (New Trust Layer) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <LineageGraph
                        nodes={[
                            { id: 'n1', type: 'source', label: 'CRM_Export_Daily.csv', status: 'active', lastUpdated: 'Today, 08:00 AM', owner: 'SalesForce Sync' },
                            { id: 'n2', type: 'transformation', label: 'Clean & Normalize', status: 'active', lastUpdated: 'Today, 08:05 AM', owner: 'DataOS Cleaner' },
                            { id: 'n3', type: 'dataset', label: 'Master_Revenue_Table', status: 'active', lastUpdated: 'Today, 08:10 AM', owner: 'Saurabh K.' },
                            { id: 'n4', type: 'dashboard', label: 'Executive_View_v2', status: 'active', lastUpdated: 'Live', owner: 'Analyst AI' }
                        ]}
                        edges={[
                            { source: 'n1', target: 'n2' },
                            { source: 'n2', target: 'n3' },
                            { source: 'n3', target: 'n4' }
                        ]}
                    />
                </div>
                <div className="lg:col-span-1">
                    <VersionHistory
                        versions={[
                            { id: 'v2.1.0', type: 'append', rowCount: 15240, timestamp: new Date(), author: 'Analyst AI', message: 'Auto-resolved 142 null values in "Region"' },
                            { id: 'v2.0.5', type: 'append', rowCount: 15098, timestamp: new Date(Date.now() - 14400000), author: 'Saurabh K.', message: 'Added Q3 Projections' },
                            { id: 'v2.0.0', type: 'init', rowCount: 14000, timestamp: new Date(Date.now() - 86400000), author: 'System', message: 'Major Schema Update' }
                        ]}
                    />
                </div>
            </div>
        </div>
    );
};

export default Dashboard;