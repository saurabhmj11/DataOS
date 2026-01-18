/**
 * Copyright (c) 2024. Designed and Developed by Saurabh Lokhande.
 */

import { useState, useEffect } from 'react';
import { Activity, Play, Square, RefreshCw, AlertCircle, CheckCircle2, Clock, Cpu, LayoutGrid, Terminal } from 'lucide-react';
import { db, Job } from '../../services/db';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { systemMonitor } from '../../services/systemMonitor';

export default function TaskManager() {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [activeTab, setActiveTab] = useState<'processes' | 'performance'>('processes');
    const [stats, setStats] = useState<{ time: string, cpu: number, mem: number }[]>([]);

    const loadJobs = async () => {
        // Simple polling for now
        const list = await db.jobs.orderBy('created_at').reverse().limit(50).toArray();
        setJobs(list);
    };



    // Poll every 1s for stats and jobs
    useEffect(() => {
        loadJobs();
        const interval = setInterval(async () => {
            loadJobs();

            // Real stats from systemMonitor
            const currentStats = await systemMonitor.getStats();

            setStats(prev => {
                const newStat = {
                    time: new Date().toLocaleTimeString(),
                    cpu: currentStats.cpu,
                    mem: currentStats.memory / 16384 * 100 // Estimate % of 16GB
                };
                const newStats = [...prev, newStat];
                return newStats.slice(-20); // Keep last 20 points
            });
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const handleCancel = async (id: number) => {
        await db.jobs.update(id, { status: 'failed', error: 'Cancelled by user', updated_at: Date.now() });
        loadJobs();
    };

    const handleRetry = async (job: Job) => {
        await db.jobs.add({
            project_id: job.project_id,
            type: job.type,
            status: 'pending',
            progress: 0,
            priority: 1,
            payload_json: job.payload_json,
            created_at: Date.now(),
            updated_at: Date.now()
        });
        loadJobs();
    };

    return (
        <div className="h-full w-full bg-[#0a0a0f] text-white flex flex-col font-sans">
            {/* Sidebar / Tabs */}
            <div className="flex flex-1 overflow-hidden">
                <div className="w-48 bg-zinc-900/50 border-r border-zinc-800 p-4 flex flex-col gap-2">
                    <button
                        onClick={() => setActiveTab('processes')}
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${activeTab === 'processes' ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' : 'text-zinc-500 hover:text-white hover:bg-zinc-800'}`}
                    >
                        <LayoutGrid size={18} />
                        Processes
                    </button>
                    <button
                        onClick={() => setActiveTab('performance')}
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${activeTab === 'performance' ? 'bg-purple-600/20 text-purple-400 border border-purple-500/30' : 'text-zinc-500 hover:text-white hover:bg-zinc-800'}`}
                    >
                        <Cpu size={18} />
                        Performance
                    </button>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-hidden flex flex-col p-4">
                    {activeTab === 'processes' ? (
                        <>
                            <div className="mb-4 flex items-center justify-between">
                                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                    <Terminal className="text-blue-400" /> Active Processes
                                </h2>
                                <span className="text-xs text-zinc-500 px-2 py-1 bg-zinc-900 rounded border border-zinc-800">
                                    {jobs.filter(j => j.status === 'running').length} Running
                                </span>
                            </div>
                            <div className="flex-1 overflow-auto rounded-xl border border-zinc-800 bg-zinc-900/20">
                                <table className="w-full text-left">
                                    <thead className="bg-zinc-900/80 text-zinc-400 text-xs uppercase tracking-wider sticky top-0 backdrop-blur-sm z-10">
                                        <tr>
                                            <th className="p-4 font-medium">Job ID</th>
                                            <th className="p-4 font-medium">Type</th>
                                            <th className="p-4 font-medium">Status</th>
                                            <th className="p-4 font-medium w-1/3">Progress</th>
                                            <th className="p-4 font-medium text-right">Control</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-zinc-800 text-sm">
                                        {jobs.map(job => (
                                            <tr key={job.id} className="hover:bg-white/5 transition-colors group">
                                                <td className="p-4 font-mono text-zinc-500">#{job.id}</td>
                                                <td className="p-4">
                                                    <span className="px-2 py-1 rounded-full bg-zinc-800 text-zinc-300 text-xs border border-zinc-700">
                                                        {job.type}
                                                    </span>
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex items-center gap-2">
                                                        {job.status === 'running' && <RefreshCw size={14} className="animate-spin text-blue-500" />}
                                                        {job.status === 'completed' && <CheckCircle2 size={14} className="text-green-500" />}
                                                        {job.status === 'failed' && <AlertCircle size={14} className="text-red-500" />}
                                                        {job.status === 'pending' && <Clock size={14} className="text-zinc-500" />}
                                                        <span className={`capitalize ${job.status === 'running' ? 'text-blue-400' :
                                                            job.status === 'failed' ? 'text-red-400' :
                                                                job.status === 'completed' ? 'text-green-400' : 'text-zinc-400'
                                                            }`}>{job.status}</span>
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                                                        <div
                                                            className={`h-full rounded-full transition-all duration-500 ${job.status === 'failed' ? 'bg-red-500' : 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]'
                                                                }`}
                                                            style={{ width: `${job.progress || 0}%` }}
                                                        />
                                                    </div>
                                                </td>
                                                <td className="p-4 text-right">
                                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                                        {job.status === 'running' || job.status === 'pending' ? (
                                                            <button
                                                                onClick={() => handleCancel(job.id!)}
                                                                className="p-1.5 hover:bg-red-500/20 text-zinc-400 hover:text-red-400 rounded-lg transition-colors"
                                                            >
                                                                <Square size={14} fill="currentColor" />
                                                            </button>
                                                        ) : (
                                                            <button
                                                                onClick={() => handleRetry(job)}
                                                                className="p-1.5 hover:bg-blue-500/20 text-zinc-400 hover:text-blue-400 rounded-lg transition-colors"
                                                            >
                                                                <Play size={14} />
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    ) : (
                        <div className="flex flex-col h-full gap-4">
                            <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                <Activity className="text-purple-400" /> System Metrics
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-1/2">
                                <div className="bg-zinc-900/30 border border-zinc-800 rounded-xl p-4 flex flex-col">
                                    <div className="flex justify-between mb-4">
                                        <h3 className="text-sm font-medium text-zinc-400">Total CPU Usage</h3>
                                        <span className="text-2xl font-mono text-blue-400">{stats[stats.length - 1]?.cpu || 0}%</span>
                                    </div>
                                    <div className="flex-1 w-full min-h-0">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart data={stats}>
                                                <defs>
                                                    <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                                                <XAxis dataKey="time" hide />
                                                <YAxis domain={[0, 100]} hide />
                                                <Tooltip
                                                    contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '8px' }}
                                                    itemStyle={{ color: '#3b82f6' }}
                                                />
                                                <Area type="monotone" dataKey="cpu" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorCpu)" isAnimationActive={false} />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                <div className="bg-zinc-900/30 border border-zinc-800 rounded-xl p-4 flex flex-col">
                                    <div className="flex justify-between mb-4">
                                        <h3 className="text-sm font-medium text-zinc-400">Memory Allocation</h3>
                                        <span className="text-2xl font-mono text-purple-400">{stats[stats.length - 1]?.mem || 0}%</span>
                                    </div>
                                    <div className="flex-1 w-full min-h-0">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart data={stats}>
                                                <defs>
                                                    <linearGradient id="colorMem" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3} />
                                                        <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                                                <XAxis dataKey="time" hide />
                                                <YAxis domain={[0, 100]} hide />
                                                <Tooltip
                                                    contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '8px' }}
                                                    itemStyle={{ color: '#a855f7' }}
                                                />
                                                <Area type="monotone" dataKey="mem" stroke="#a855f7" strokeWidth={2} fillOpacity={1} fill="url(#colorMem)" isAnimationActive={false} />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </div>

                            <div className="flex-1 bg-zinc-900/30 border border-zinc-800 rounded-xl p-4">
                                <h3 className="text-sm font-medium text-zinc-400 mb-2">Network I/O</h3>
                                <div className="h-full flex items-center justify-center text-zinc-600 text-sm">
                                    Monitor inactive (Driver missing)
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Status Footer */}
            <div className="h-8 bg-zinc-900/80 border-t border-zinc-800 flex items-center px-4 text-[10px] text-zinc-500 justify-between">
                <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                        Kernel: Online
                    </span>
                    <span>Uptime: 45:22:10</span>
                </div>
                <span>v1.0.4.build_2048</span>
            </div>
        </div>
    );
}
