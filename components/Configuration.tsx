/**
 * Copyright (c) 2024. Designed and Developed by Saurabh Lokhande.
 */

import React, { useState, useEffect } from 'react';
import { Settings, Shield, Database, Cpu, Save, Server, Cloud, BrainCircuit } from 'lucide-react';
import { AIConfig } from '../services/aiService';

const Configuration: React.FC = () => {
    const [config, setConfig] = useState<AIConfig>({
        provider: 'gemini',
        ollamaUrl: 'http://localhost:11434',
        modelName: 'llama3'
    });
    const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
    const [testMessage, setTestMessage] = useState('');

    useEffect(() => {
        const saved = localStorage.getItem('dataos_ai_config');
        if (saved) setConfig(JSON.parse(saved));
    }, []);

    const handleSave = () => {
        localStorage.setItem('dataos_ai_config', JSON.stringify(config));
        // Force reload to apply changes everywhere (simple way)
        window.location.reload();
    };

    const testOllamaConnection = async () => {
        setTestStatus('testing');
        setTestMessage('Connecting...');
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 3000);

            const res = await fetch(`${config.ollamaUrl}/api/tags`, { signal: controller.signal });
            clearTimeout(timeoutId);

            if (res.ok) {
                setTestStatus('success');
                setTestMessage('Connected! Ollama is running.');
            } else {
                setTestStatus('error');
                setTestMessage(`Error: ${res.statusText}`);
            }
        } catch (e) {
            setTestStatus('error');
            setTestMessage('Failed to connect. Is Ollama running?');
        }
    };

    return (
        <div className="flex flex-col h-full bg-os-900 text-sm animate-in fade-in p-8 overflow-y-auto">
            <div className="max-w-4xl mx-auto w-full">
                <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 bg-zinc-800 rounded-xl flex items-center justify-center border border-zinc-700">
                        <Settings className="text-zinc-400" size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white">System Configuration</h1>
                        <p className="text-zinc-500">Manage AI providers (Cloud/Local), security, and compute.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* AI Provider Settings */}
                    <div className="glass-panel p-6 rounded-xl border border-zinc-800 bg-zinc-900/50">
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <BrainCircuit size={18} className="text-blue-400" />
                            AI Intelligence Provider
                        </h3>
                        <div className="space-y-4">
                            <div className="flex gap-2 p-1 bg-zinc-950 rounded-lg border border-zinc-800">
                                <button
                                    onClick={() => setConfig({ ...config, provider: 'gemini' })}
                                    className={`flex-1 py-2 px-3 rounded-md text-xs font-medium flex items-center justify-center gap-2 transition-all ${config.provider === 'gemini' ? 'bg-blue-600 text-white shadow-lg' : 'text-zinc-400 hover:text-white'}`}
                                >
                                    <Cloud size={14} /> Gemini (Cloud)
                                </button>
                                <button
                                    onClick={() => setConfig({ ...config, provider: 'ollama' })}
                                    className={`flex-1 py-2 px-3 rounded-md text-xs font-medium flex items-center justify-center gap-2 transition-all ${config.provider === 'ollama' ? 'bg-orange-600 text-white shadow-lg' : 'text-zinc-400 hover:text-white'}`}
                                >
                                    <Server size={14} /> Ollama (Local)
                                </button>
                            </div>

                            {config.provider === 'gemini' ? (
                                <div>
                                    <label className="block text-xs font-medium text-zinc-400 mb-1">Model Selection</label>
                                    <select className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-zinc-300 focus:outline-none focus:border-blue-500">
                                        <option>Gemini 1.5 Pro (Recommended)</option>
                                        <option>Gemini 1.0 Ultra</option>
                                    </select>
                                </div>
                            ) : (
                                <div className="space-y-3 animate-in slide-in-from-top-2">
                                    <div>
                                        <label className="block text-xs font-medium text-zinc-400 mb-1">Ollama Base URL</label>
                                        <input
                                            type="text"
                                            value={config.ollamaUrl}
                                            onChange={(e) => setConfig({ ...config, ollamaUrl: e.target.value })}
                                            className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-zinc-300 focus:outline-none focus:border-orange-500 font-mono"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-zinc-400 mb-1">Local Model Name</label>
                                        <input
                                            type="text"
                                            value={config.modelName}
                                            onChange={(e) => setConfig({ ...config, modelName: e.target.value })}
                                            placeholder="e.g. llama3, mistral"
                                            className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-zinc-300 focus:outline-none focus:border-orange-500 font-mono"
                                        />
                                        <p className="text-[10px] text-zinc-500 mt-1">Make sure to run `ollama run {config.modelName || 'llama3'}` in your terminal first.</p>
                                    </div>

                                    <div className="flex items-center gap-3 mt-2">
                                        <button
                                            onClick={testOllamaConnection}
                                            className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs rounded border border-zinc-700 transition-colors"
                                        >
                                            {testStatus === 'testing' ? 'Checking...' : 'Test Connection'}
                                        </button>

                                        {testStatus !== 'idle' && (
                                            <span className={`text-xs ${testStatus === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                                                {testMessage}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Data Processing */}
                    <div className="glass-panel p-6 rounded-xl border border-zinc-800 bg-zinc-900/50">
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <Database size={18} className="text-purple-400" />
                            Data Processing
                        </h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-3 bg-zinc-950 rounded border border-zinc-800">
                                <div>
                                    <p className="text-sm font-medium text-zinc-300">Auto-Clean Nulls</p>
                                    <p className="text-xs text-zinc-500">Automatically impute missing values</p>
                                </div>
                                <div className="w-10 h-5 bg-green-500/20 rounded-full relative cursor-pointer border border-green-500/50">
                                    <div className="absolute right-0.5 top-0.5 w-4 h-4 bg-green-500 rounded-full shadow" />
                                </div>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-zinc-950 rounded border border-zinc-800">
                                <div>
                                    <p className="text-sm font-medium text-zinc-300">Strict Schema Mode</p>
                                    <p className="text-xs text-zinc-500">Reject rows that don't match schema</p>
                                </div>
                                <div className="w-10 h-5 bg-zinc-700/50 rounded-full relative cursor-pointer border border-zinc-600">
                                    <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-zinc-500 rounded-full shadow" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Security */}
                    <div className="glass-panel p-6 rounded-xl border border-zinc-800 bg-zinc-900/50">
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <Shield size={18} className="text-red-400" />
                            Security & Compliance
                        </h3>
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                <span className="text-sm text-zinc-400">SOC2 Compliance Mode: <strong className="text-white">Active</strong></span>
                            </div>
                            <div className="bg-red-500/10 border border-red-500/20 p-3 rounded text-red-300 text-xs">
                                {config.provider === 'ollama'
                                    ? "✅ Local AI Active. No data leaves this machine. 100% Air-Gapped Safe."
                                    : "⚠️ Cloud AI Active. Data snippets are sent to Gemini API for processing."
                                }
                            </div>
                        </div>
                    </div>

                    {/* Compute */}
                    <div className="glass-panel p-6 rounded-xl border border-zinc-800 bg-zinc-900/50">
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <Cpu size={18} className="text-orange-400" />
                            Compute Resource
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between text-xs text-zinc-400 mb-1">
                                    <span>Memory Allocation</span>
                                    <span>4GB / 16GB</span>
                                </div>
                                <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-orange-500 w-[25%]" />
                                </div>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-zinc-400">Max Threads</span>
                                <div className="flex items-center gap-2">
                                    <button className="w-6 h-6 bg-zinc-800 rounded flex items-center justify-center text-zinc-400">-</button>
                                    <span className="text-white font-mono">8</span>
                                    <button className="w-6 h-6 bg-zinc-800 rounded flex items-center justify-center text-zinc-400">+</button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* NEW: Agent Runtime Debugger */}
                    <div className="md:col-span-2 glass-panel p-6 rounded-xl border border-dashed border-purple-500/30 bg-purple-900/10">
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <BrainCircuit size={18} className="text-purple-400" />
                            Agent Runtime Debugger (Kernel Access)
                        </h3>
                        <div className="flex gap-4 mb-4">
                            <input
                                type="text"
                                id="agentQuery"
                                placeholder="Enter natural language query (e.g. 'Calculate total revenue')"
                                className="flex-1 bg-zinc-950 border border-zinc-800 rounded p-2 text-zinc-300 font-mono text-sm"
                            />
                            <button
                                onClick={async () => {
                                    const q = (document.getElementById('agentQuery') as HTMLInputElement).value;
                                    const out = document.getElementById('agentOutput');
                                    if (out) out.innerText = 'Planning...';

                                    const ai = (await import('../services/aiService')).getAI(config);
                                    const plan = await ai.planQuery(q);

                                    if (out) out.innerText = `PLAN:\n${JSON.stringify(plan, null, 2)}\n\nEXECUTING...`;

                                    const runtime = (await import('../services/agentRuntime')).agentRuntime;
                                    const results = [];
                                    for (const step of plan.steps) {
                                        const res = await runtime.executeIntent(step);
                                        results.push(res);
                                    }

                                    if (out) out.innerText = `PLAN:\n${JSON.stringify(plan, null, 2)}\n\nRESULTS:\n${JSON.stringify(results, null, 2)}`;
                                }}
                                className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded font-medium"
                            >
                                Execute
                            </button>
                        </div>
                        <pre id="agentOutput" className="w-full h-48 bg-zinc-950 border border-zinc-800 rounded p-4 text-xs text-green-400 font-mono overflow-auto leading-relaxed">
                            // Agent execution logs will appear here...
                        </pre>
                    </div>
                </div>

                <div className="mt-8 flex justify-end">
                    <button onClick={handleSave} className="flex items-center gap-2 bg-white text-black px-6 py-2 rounded-lg font-bold hover:bg-zinc-200 transition-colors">
                        <Save size={16} />
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Configuration;
