/**
 * Copyright (c) 2024. Designed and Developed by Saurabh Lokhande.
 */

import React, { useState, useEffect, useRef } from 'react';
import { Bot, FileSpreadsheet, LayoutDashboard, Settings, Sparkles, Send, Upload, Play, Menu, X, MessageSquare, BrainCircuit, Briefcase, Database, History } from 'lucide-react';
import { agentRuntime } from '../../services/agentRuntime';
import { DatasetStatus, DataStats, MCPTool, ProcessingLog, Insight, ChatMessage, AppMode } from '../../types';
import { MOCK_CSV_DATA, AGENTS } from '../../constants';
import { cleanData } from '../../services/dataEngine';
import { getAI } from '../../services/aiService';
import { duckDb } from '../../services/duckDbService';
import { metricService } from '../../services/metricService';
import { versionControl } from '../../services/versionControlService';
import { useAppStore } from '../../store/useAppStore';
import Dashboard from '../Dashboard';
import DataGrid from '../DataGrid';
import Configuration from '../Configuration';
import VersionHistory from '../VersionHistory';
import PipelineVisualizer from '../PipelineVisualizer';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer, Tooltip } from 'recharts';

// Fix for DuckDB BigInt serialization
(BigInt.prototype as any).toJSON = function () {
    return Number(this);
};

import { fileSystem } from '../../services/fileSystemService';

interface DataAnalystProps {
    filePath?: string;
}

export default function DataAnalyst({ filePath }: DataAnalystProps) {
    // State
    const [status, setStatus] = useState<DatasetStatus>(DatasetStatus.IDLE);
    const [mode, setMode] = useState<AppMode>('CEO'); // Default to CEO mode for "Wow" factor
    const [activeTab, setActiveTab] = useState<'overview' | 'grid' | 'settings' | 'history'>('overview');
    const [rawData, setRawData] = useState<any[]>([]);
    const [stats, setStats] = useState<DataStats | null>(null);
    const [agents, setAgents] = useState<MCPTool[]>(JSON.parse(JSON.stringify(AGENTS)));
    const [logs, setLogs] = useState<ProcessingLog[]>([]);
    const [insights, setInsights] = useState<Insight[]>([]);
    const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([]);
    const [narrativeBrief, setNarrativeBrief] = useState<string>('');
    const [semanticMetrics, setSemanticMetrics] = useState<any[]>([]); // New Semantic State

    // UI State
    const [showMobileSidebar, setShowMobileSidebar] = useState(false);
    const [showMobileChat, setShowMobileChat] = useState(false);

    // Global State
    const { setActiveProject } = useAppStore();

    // Chat State
    const [chatInput, setChatInput] = useState('');
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
    const [isChatThinking, setIsChatThinking] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);

    // AI Configuration
    const ai = getAI(JSON.parse(localStorage.getItem('dataos_ai_config') || '{"provider":"gemini"}'));

    // Auto-load File from OS if filePath provided
    useEffect(() => {
        if (filePath) {
            const loadFile = async () => {
                try {
                    addLog('System', `Loading file from OS: ${filePath}`, 'info');
                    const content = await fileSystem.readFile(filePath);
                    if (content) {
                        runPipeline(content);
                    } else {
                        addLog('System', 'File content empty or not found', 'warning');
                    }
                } catch (e) {
                    console.error("OS File Load Error", e);
                    addLog('System', 'Failed to load file from OS', 'warning');
                }
            };
            loadFile();
        }
    }, [filePath]);

    // Auto-load persistence
    useEffect(() => {
        if (filePath) return; // Skip persistence load if loading specific file

        const initPersistence = async () => {
            // ... existing persistence logic ...
            await duckDb.init();
            // ...
        }
        initPersistence();
    }, [filePath]);

    // ... (keep initPersistence inner logic as is, or refactor)
    // Actually, I need to preserve the `initPersistence` logic inside the second useEffect but modify it to respect `!filePath`.
    // Since I cannot replace *just* the start of the useEffect easily without duplicating code or making the diff huge,
    // I will replace the component start up to line 110 with the new logic.

    /*
     * RE-IMPLEMENTING initPersistence logic here to fit the replacement chunk constraints
     */
    useEffect(() => {
        if (filePath) return; // Skip if explicit file

        const initPersistence = async () => {
            await duckDb.init();
            try {
                const count = await duckDb.query("SELECT COUNT(*) as count FROM main");
                if (count && count[0].count > 0) {
                    addLog('System', `Restored previous session with ${count[0].count} rows.`, 'success');
                    const result = await duckDb.query("SELECT * FROM main LIMIT 5000");
                    setRawData(result);
                    setStatus(DatasetStatus.READY);

                    const schema = await duckDb.getSchema('main');
                    const columns = schema.map((col: any) => ({
                        name: col.column_name,
                        type: col.column_type,
                        missing: 0,
                        missingCount: 0,
                        uniqueCount: 0,
                        sampleValues: []
                    }));

                    setStats({
                        rowCount: count[0].count,
                        memoryUsage: 'Restored',
                        completeness: 100,
                        columns
                    });
                }
            } catch (e) {
                console.log("No persisted session found.");
            }
        };
        initPersistence();
    }, [filePath]);

    // Helper to add log
    const addLog = (stage: string, message: string, status: 'info' | 'success' | 'warning' = 'info') => {
        setLogs(prev => [...prev, { stage, message, timestamp: new Date(), status }]);
    };

    // Helper to update agent status
    const updateAgent = (name: string, status: MCPTool['status']) => {
        setAgents(prev => prev.map(a => a.name === name ? { ...a, status } : a));
    };

    // ----------------------------------------------------------------------
    // PIPELINE ORCHESTRATOR
    // ----------------------------------------------------------------------
    const runPipeline = async (csvData: string) => {
        try {
            setStatus(DatasetStatus.LOADING);
            setLogs([]);
            setInsights([]);
            setSuggestedQuestions([]);
            setChatHistory([]);
            setAgents(JSON.parse(JSON.stringify(AGENTS))); // Reset agents

            // 1. Loading & Ingest (Deep Compute Layer)
            addLog('System', 'Initializing DuckDB Kernel...', 'info');
            await duckDb.init();

            addLog('DuckDB', `Ingesting ${csvData.length.toLocaleString()} bytes into 'main' table...`, 'info');
            // USE VERSION CONTROL COMMIT REPLACING DIRECT REGISTER
            await versionControl.commit({ name: 'main.csv', content: csvData }, 'replace');
            // await duckDb.registerFile('main.csv', csvData);

            // 1b. Semantic Layer Calculation
            addLog('Semantic Layer', 'Calculating defined business metrics...', 'info');
            const metrics = metricService.getMetrics();
            const calculated = await Promise.all(metrics.map(async (m) => {
                const value = await metricService.calculateMetric(m.id);
                return { ...m, value };
            }));
            setSemanticMetrics(calculated);
            addLog('Semantic Layer', `Computed ${calculated.length} core metrics via SQL.`, 'success');


            // Query back to verify and get preview
            const result = await duckDb.query("SELECT * FROM main LIMIT 5000"); // Limit for UI preview
            setRawData(result);

            const countResult = await duckDb.query("SELECT COUNT(*) as count FROM main");
            const totalRows = countResult[0].count;

            // 2. Schema Detection (using DuckDB DESCRIBE)
            setStatus(DatasetStatus.SCHEMA_DETECT);
            updateAgent('Schema Agent', 'active');

            const schema = await duckDb.getSchema('main');
            const columns = schema.map((col: any) => ({
                name: col.column_name,
                type: col.column_type,
                missing: 0,
                missingCount: 0,
                uniqueCount: 0,
                sampleValues: []
            }));

            addLog('Schema Agent', `Kernal detected ${columns.length} columns in ${totalRows.toLocaleString()} rows.`, 'success');

            // For now, pass 'result' to others as 'parsed', but eventually agents should query DB directly
            const parsed = result;

            // 3. Cleaning
            setStatus(DatasetStatus.CLEANING);
            updateAgent('Cleaning Agent', 'active');
            addLog('Cleaning Agent', 'Scanning for missing values and anomalies...', 'info');

            const { cleanedData, logs: cleanLogs } = await cleanData(parsed, columns);
            cleanLogs.forEach(l => addLog(l.stage, l.message, l.status));
            setRawData(cleanedData);

            // Update stats based on clean data
            const memoryUsage = (JSON.stringify(cleanedData).length / 1024 / 1024).toFixed(2) + ' MB';
            const completeness = Math.round((1 - (cleanLogs.length / (parsed.length * columns.length))) * 100);

            const newStats: DataStats = {
                rowCount: cleanedData.length,
                memoryUsage,
                completeness: completeness > 100 ? 100 : completeness,
                columns
            };
            setStats(newStats);

            updateAgent('Cleaning Agent', 'idle');

            // 4. Quality & Insights - NON-BLOCKING
            // setStatus(DatasetStatus.INSIGHTS); // Skip this status to go straight to ready
            // updateAgent('Insight Agent', 'active'); // Optional: show agent active in background?

            // Run AI in background
            ai.generateInsights(columns, cleanedData.length).then(({ insights: generatedInsights, suggestedQuestions: questions, narrativeBrief: brief }) => {
                setInsights(generatedInsights);
                setSuggestedQuestions(questions);
                setNarrativeBrief(brief || "Analysis complete. Trends identified.");
                addLog('Insight Agent', `Generated ${generatedInsights.length} strategic insights.`, 'success');
                updateAgent('Insight Agent', 'idle');
            }).catch(e => {
                console.error("Background AI Failed", e);
                addLog('Insight Agent', 'Background analysis failed', 'warning');
            });

            // updateAgent('Quality Agent', 'active'); // Run in parallel
            // addLog('Insight Agent', 'Generating strategic narrative...', 'info');

            // const { insights: generatedInsights, suggestedQuestions: questions, narrativeBrief: brief } = await ai.generateInsights(columns, cleanedData.length);
            // setInsights(generatedInsights);
            // setSuggestedQuestions(questions);
            // setNarrativeBrief(brief || "Analysis complete. Trends identified.");
            // addLog('Insight Agent', `Generated ${generatedInsights.length} strategic insights.`, 'success');

            // updateAgent('Insight Agent', 'idle');
            // updateAgent('Quality Agent', 'idle');

            // 5. Finalize
            updateAgent('Viz Agent', 'active');
            await new Promise(r => setTimeout(r, 10)); // Minimal yield
            updateAgent('Viz Agent', 'idle');

            setStatus(DatasetStatus.READY);
            addLog('Orchestrator', 'Pipeline complete. Dashboard ready.', 'success');

            // Initial Chat Welcome
            setChatHistory([{
                id: 'init',
                role: 'assistant',
                content: `I've analyzed your ${cleanedData.length} rows. I've prepared a strategic briefing in CEO mode.`,
                timestamp: new Date()
            }]);

        } catch (err) {
            console.error(err);
            setStatus(DatasetStatus.ERROR);
            addLog('Orchestrator', 'Critical Pipeline Failure', 'warning');
        }
    };

    // Handle file upload
    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (evt) => {
                if (evt.target?.result) runPipeline(evt.target.result as string);
            };
            reader.readAsText(file);
        }
    };

    // Handle Chat
    const handleSendMessage = async (text?: string) => {
        const msgText = text || chatInput;
        if (!msgText.trim()) return; // Removed stats check to allow general queries

        const userMsg: ChatMessage = {
            id: Date.now().toString(),
            role: 'user',
            content: msgText,
            timestamp: new Date()
        };

        setChatHistory(prev => [...prev, userMsg]);
        setChatInput('');
        setIsChatThinking(true);

        try {
            // 1. Agent Runtime: Plan
            const plan = await agentRuntime.planRequest(msgText);

            // 2. Agent Runtime: Execute (Multi-step)
            let lastResult: any = null;
            let executionLog: string[] = [];

            if (plan.steps.length > 0) {
                for (const step of plan.steps) {
                    const result = await agentRuntime.executeIntent(step);
                    executionLog.push(`Executed ${step.intent}: ${result.success ? 'Success' : 'Failed'}`);

                    if (result.success) {
                        lastResult = result;
                    } else {
                        lastResult = lastResult || result; // Keep error
                        break; // Stop execution on failure
                    }
                }
            } else {
                lastResult = { success: false, message: "No execution plan could be generated." };
            }

            // 3. Format Response
            let responseContent = '';
            // Get final intent for logic
            const finalIntent = plan.steps[plan.steps.length - 1] || { intent: 'unknown', agentId: 'unknown', confidence: 0, params: {} };

            // Extract Chart Data if available
            let chartConfig: any = undefined;
            let chartData: any = undefined;

            if (lastResult && lastResult.success) {
                if (lastResult.data && lastResult.data.chartConfig) {
                    // Check if agent returned a chart
                    chartConfig = lastResult.data.chartConfig;
                    chartData = lastResult.data.data;
                    responseContent = lastResult.data.summary || "Here is the trend analysis.";
                } else if (finalIntent.intent === 'run_sql') {
                    const rowCount = Array.isArray(lastResult.data) ? lastResult.data.length : (lastResult.data as any).length || 0;
                    responseContent = `Executed SQL: "${finalIntent.params.query}"\nReturned ${rowCount} rows.`;
                } else if (finalIntent.intent === 'detect_schema') {
                    responseContent = `I analyzed the file. Found columns: ${lastResult.data.columns.join(', ')}`;
                } else if (finalIntent.intent === 'ingest_file') {
                    responseContent = `Success! File ${finalIntent.params.path} loaded into table '${lastResult.data.table}'.`;
                } else if (finalIntent.intent === 'calculate_metric') {
                    responseContent = `Calculated Metric: ${lastResult.data}`;
                } else if (finalIntent.intent === 'analyze_trend') {
                    // Fallback if chart config missing but intent was trend
                    responseContent = lastResult.data.summary || JSON.stringify(lastResult.data);
                } else {
                    responseContent = lastResult.message || JSON.stringify(lastResult.data);
                }
            } else {
                responseContent = `I ran into an issue: ${lastResult?.message || 'Unknown error'}`;
            }

            const agentMsg: ChatMessage = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: responseContent,
                timestamp: new Date(),
                relatedChart: chartConfig,
                chartData: chartData,
                thoughtProcess: [
                    `Goal: ${plan.goal}`,
                    ...plan.steps.map(s => `${s.agentId} -> ${s.intent} (${s.reasoning || 'N/A'})`),
                    ...executionLog
                ]
            };

            setChatHistory(prev => [...prev, agentMsg]);

            // End of block - catch handles errors
            // We need to ensure we don't fall through to the old code that references 'intent'
            return;



        } catch (e: any) {
            const errorMsg: ChatMessage = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: `System Error: ${e.message}`,
                timestamp: new Date()
            };
            setChatHistory(prev => [...prev, errorMsg]);
        } finally {
            setIsChatThinking(false);
        }
    };

    // Auto-scroll chat
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatHistory, isChatThinking]);


    return (
        <div className="flex h-full w-full overflow-hidden text-sm bg-os-900 relative font-sans">

            {/* MOBILE BACKDROP */}
            {(showMobileSidebar || showMobileChat) && (
                <div
                    className="fixed inset-0 bg-black/60 z-40 xl:hidden backdrop-blur-sm"
                    onClick={() => {
                        setShowMobileSidebar(false);
                        setShowMobileChat(false);
                    }}
                />
            )}

            {/* LEFT SIDEBAR (Responsive) */}
            <div className={`
        fixed inset-y-0 left-0 z-50 bg-os-800 border-r border-os-border flex flex-col transition-transform duration-300 ease-in-out w-64
        md:relative md:translate-x-0 md:w-16 lg:w-64
        ${showMobileSidebar ? 'translate-x-0' : '-translate-x-full'}
      `}>
                <div className="p-4 flex items-center justify-between md:justify-center lg:justify-start gap-3 border-b border-os-border h-16">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold shadow-lg shadow-blue-500/20 shrink-0">
                            D
                        </div>
                        <span className="font-bold text-lg tracking-tight md:hidden lg:block text-white">DataOS</span>
                    </div>
                    <button onClick={() => setShowMobileSidebar(false)} className="md:hidden text-zinc-400 hover:text-white">
                        <X size={20} />
                    </button>
                </div>

                <div className="flex-1 py-4 flex flex-col gap-2 overflow-y-auto">
                    <div className="px-4 py-2 mb-2">
                        <button onClick={() => setActiveProject(null)} className="w-full flex items-center gap-2 text-xs text-zinc-400 hover:text-white transition-colors">
                            <span className="text-blue-500">←</span> Switch Project
                        </button>
                    </div>
                    <button
                        onClick={() => { setActiveTab('overview'); setShowMobileSidebar(false); }}
                        className={`flex items-center gap-3 px-4 py-3 mx-2 rounded-lg transition-colors ${activeTab === 'overview' ? 'bg-os-700 text-white' : 'text-zinc-400 hover:text-white hover:bg-os-700/50'}`}>
                        <LayoutDashboard size={18} className="shrink-0" />
                        <span className="md:hidden lg:inline">Dashboard</span>
                    </button>
                    <button
                        onClick={() => { setActiveTab('history'); setShowMobileSidebar(false); }}
                        className={`flex items-center gap-3 px-4 py-3 mx-2 rounded-lg transition-colors ${activeTab === 'history' ? 'bg-os-700 text-white' : 'text-zinc-400 hover:text-white hover:bg-os-700/50'}`}>
                        <History size={18} className="shrink-0" />
                        <span className="md:hidden lg:inline">Run History</span>
                    </button>
                    <button
                        onClick={() => { setActiveTab('grid'); setShowMobileSidebar(false); }}
                        className={`flex items-center gap-3 px-4 py-3 mx-2 rounded-lg transition-colors ${activeTab === 'grid' ? 'bg-os-700 text-white' : 'text-zinc-400 hover:text-white hover:bg-os-700/50'}`}>
                        <FileSpreadsheet size={18} className="shrink-0" />
                        <span className="md:hidden lg:inline">Data Grid</span>
                    </button>
                    <button
                        onClick={() => { setActiveTab('settings'); setShowMobileSidebar(false); }}
                        className={`flex items-center gap-3 px-4 py-3 mx-2 rounded-lg transition-colors ${activeTab === 'settings' ? 'bg-os-700 text-white' : 'text-zinc-400 hover:text-white hover:bg-os-700/50'}`}>
                        <Settings size={18} className="shrink-0" />
                        <span className="md:hidden lg:inline">Configuration</span>
                    </button>
                    <button
                        onClick={() => { setActiveTab('history'); setShowMobileSidebar(false); }}
                        className={`flex items-center gap-3 px-4 py-3 mx-2 rounded-lg transition-colors ${activeTab === 'history' ? 'bg-os-700 text-white' : 'text-zinc-400 hover:text-white hover:bg-os-700/50'}`}>
                        <FileSpreadsheet size={18} className="shrink-0" />
                        <span className="md:hidden lg:inline">Lineage (Git)</span>
                    </button>
                </div>

                <div className="p-4 border-t border-os-border">
                    <div className="bg-gradient-to-br from-indigo-900 to-purple-900 rounded-xl p-3 relative overflow-hidden group cursor-pointer" onClick={() => { runPipeline(MOCK_CSV_DATA); setShowMobileSidebar(false); }}>
                        <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="flex justify-center lg:justify-start">
                            <Sparkles className="text-white lg:mb-2 shrink-0" size={20} />
                        </div>
                        <p className="text-xs text-white/90 font-medium hidden lg:block">Load Demo Data</p>
                        <p className="text-[10px] text-white/60 hidden lg:block">Simulate 100M row processing</p>
                    </div>

                    <div className="mt-2 bg-gradient-to-br from-red-900 to-orange-900 rounded-xl p-3 relative overflow-hidden group cursor-pointer" onClick={async () => {
                        const res = await fetch('/emdat.csv');
                        const text = await res.text();
                        runPipeline(text);
                        setShowMobileSidebar(false);
                    }}>
                        <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="flex justify-center lg:justify-start">
                            <Database className="text-white lg:mb-2 shrink-0" size={20} />
                        </div>
                        <p className="text-xs text-white/90 font-medium hidden lg:block">Load User Data</p>
                        <p className="text-[10px] text-white/60 hidden lg:block">EM-DAT Disaster Set (7MB)</p>
                    </div>
                </div>
            </div>

            {/* CENTER MAIN */}
            <div className="flex-1 flex flex-col bg-os-900 relative min-w-0 transition-all duration-300">

                {/* HEADER */}
                <header className="h-16 border-b border-os-border flex items-center justify-between px-4 md:px-6 bg-os-900/80 backdrop-blur-md sticky top-0 z-20">
                    <div className="flex items-center gap-3">
                        <button onClick={() => setShowMobileSidebar(true)} className="md:hidden p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg">
                            <Menu size={20} />
                        </button>
                        <div className="flex flex-col">
                            <h2 className="font-semibold text-white">
                                {status === DatasetStatus.IDLE ? 'Welcome' : 'Analytics Session #2049'}
                            </h2>
                            {status !== DatasetStatus.IDLE && (
                                <span className="text-[10px] text-green-500 flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                                    System Online
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* MODE TOGGLE */}
                        {status !== DatasetStatus.IDLE && (
                            <div className="hidden md:flex bg-zinc-800 p-1 rounded-lg border border-zinc-700 mr-2">
                                <button
                                    onClick={() => setMode('CEO')}
                                    className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${mode === 'CEO' ? 'bg-os-900 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-200'}`}
                                >
                                    <Briefcase size={14} /> CEO
                                </button>
                                <button
                                    onClick={() => setMode('ANALYST')}
                                    className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${mode === 'ANALYST' ? 'bg-os-900 text-purple-400 shadow-sm' : 'text-zinc-400 hover:text-zinc-200'}`}
                                >
                                    <BrainCircuit size={14} /> Analyst
                                </button>
                            </div>
                        )}

                        {status === DatasetStatus.IDLE && (
                            <label className="flex items-center gap-2 px-3 md:px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg cursor-pointer transition-all shadow-lg shadow-blue-500/20">
                                <Upload size={16} />
                                <span className="font-medium hidden md:inline">Upload CSV</span>
                                <span className="font-medium md:hidden">Upload</span>
                                <input type="file" accept=".csv" className="hidden" onChange={handleFileUpload} />
                            </label>
                        )}

                        {status === DatasetStatus.READY && mode === 'ANALYST' && (
                            <button
                                onClick={async () => {
                                    // SIMULATE APPEND
                                    const additionalData = MOCK_CSV_DATA.split('\n').filter((_, i) => i > 0 && i < 20).join('\n'); // Append 20 rows
                                    await versionControl.commit({ name: 'q4_sales.csv', content: additionalData }, 'append');

                                    // Refresh Data
                                    const result = await duckDb.query("SELECT * FROM main");
                                    setRawData(result);

                                    // Refresh Stats
                                    const count = await duckDb.query("SELECT COUNT(*) as count FROM main");
                                    if (stats) setStats({ ...stats, rowCount: count[0].count });

                                    addLog('User', 'Appended Q4 Sales Data', 'success');
                                }}
                                className="flex items-center gap-2 px-3 py-2 bg-pink-600 hover:bg-pink-500 text-white rounded-lg transition-all"
                            >
                                <Sparkles size={16} /> Append Q4 Data
                            </button>
                        )}

                        {status !== DatasetStatus.IDLE && (
                            <>
                                <button onClick={() => runPipeline(MOCK_CSV_DATA)} className="flex items-center gap-2 px-3 md:px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg border border-zinc-700 transition-all">
                                    <Play size={16} />
                                    <span className="hidden md:inline">Rerun</span>
                                </button>
                                <button
                                    onClick={() => setShowMobileChat(!showMobileChat)}
                                    className={`xl:hidden p-2 rounded-lg border transition-all ${showMobileChat ? 'bg-blue-600 border-blue-500 text-white' : 'bg-zinc-800 border-zinc-700 text-zinc-400'}`}
                                >
                                    <MessageSquare size={18} />
                                </button>
                            </>
                        )}
                    </div>
                </header>

                {/* CONTENT */}
                <main className="flex-1 overflow-hidden relative">
                    {status === DatasetStatus.IDLE ? (
                        <div className="h-full flex flex-col items-center justify-center text-zinc-500 gap-4 p-8 text-center">
                            <div className="w-20 h-20 md:w-24 md:h-24 bg-zinc-800/50 rounded-full flex items-center justify-center mb-4 border border-zinc-700 animate-pulse">
                                <Upload size={32} className="text-zinc-400" />
                            </div>
                            <h1 className="text-xl md:text-2xl font-bold text-white">Autonomous Data Engineer</h1>
                            <p className="max-w-md text-sm md:text-base">Upload raw data. I'll clean, fix, analyze, and visualize it automatically.</p>
                        </div>
                    ) : status === DatasetStatus.READY ? (
                        activeTab === 'grid' ? (
                            <DataGrid data={rawData} columns={stats?.columns || []} />
                        ) : activeTab === 'settings' ? (
                            <Configuration />
                        ) : activeTab === 'history' ? (
                            <div className="p-6 h-full overflow-y-auto">
                                <h2 className="text-2xl font-bold text-white mb-6">Data Lineage & Provenance</h2>
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                    <div className="lg:col-span-1">
                                        <VersionHistory versions={versionControl.getHistory()} />
                                    </div>
                                    <div className="lg:col-span-2">
                                        <DataGrid data={rawData.slice(0, 100)} columns={stats?.columns || []} />
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <Dashboard
                                stats={stats}
                                insights={insights}
                                data={rawData}
                                mode={mode}
                                narrativeBrief={narrativeBrief}
                                semanticMetrics={semanticMetrics}
                            />
                        )
                    ) : (
                        <div className="h-full p-4 md:p-6">
                            <PipelineVisualizer status={status} agents={agents} logs={logs} />
                        </div>
                    )}
                </main>

            </div>

            {/* RIGHT CHAT (Assistant) - Responsive */}
            <div className={`
        fixed inset-y-0 right-0 z-50 w-80 md:w-96 bg-os-800 border-l border-os-border flex flex-col transition-transform duration-300 ease-in-out shadow-2xl xl:shadow-none
        xl:relative xl:translate-x-0
        ${showMobileChat ? 'translate-x-0' : 'translate-x-full'}
      `}>
                <div className="h-16 border-b border-os-border flex items-center justify-between px-4">
                    <div className="flex items-center gap-3">
                        <Bot className={mode === 'ANALYST' ? "text-purple-400" : "text-blue-400"} />
                        <div className="flex flex-col">
                            <span className="font-semibold text-white">{mode === 'ANALYST' ? 'Analyst Agent' : 'Executive Assistant'}</span>
                            <span className="text-[10px] text-zinc-500">Gemini 3 Flash • DuckDB • Active</span>
                        </div>
                    </div>
                    <button onClick={() => setShowMobileChat(false)} className="xl:hidden text-zinc-400 hover:text-white">
                        <X size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {chatHistory.map(msg => (
                        <div key={msg.id} className={`flex flex-col gap-1 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                            <div className={`p-3 rounded-xl max-w-[90%] text-sm ${msg.role === 'user'
                                ? 'bg-blue-600 text-white rounded-br-none'
                                : 'bg-zinc-700/50 text-zinc-200 border border-zinc-600 rounded-bl-none'
                                }`}>
                                {msg.content}
                            </div>

                            {/* Render Thought Process (Root Cause Analysis) */}
                            {msg.thoughtProcess && (
                                <div className="max-w-[90%] bg-zinc-900/50 border-l-2 border-purple-500 pl-3 py-1 my-1">
                                    <p className="text-[10px] text-purple-400 font-mono mb-1 uppercase">Analysis Steps</p>
                                    {msg.thoughtProcess.map((step, i) => (
                                        <div key={i} className="flex items-center gap-2 text-xs text-zinc-400">
                                            <div className="w-1 h-1 rounded-full bg-zinc-500" />
                                            {step}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {msg.relatedChart && msg.chartData && (
                                <div className="max-w-[90%] h-64 bg-zinc-900/50 border border-zinc-700 rounded-xl p-2 mt-2">
                                    <p className="text-xs text-zinc-500 mb-2 pl-2">{msg.relatedChart.title}</p>
                                    <ResponsiveContainer width="100%" height="100%">
                                        {msg.relatedChart.type === 'line' ? (
                                            <LineChart data={msg.chartData}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                                                <XAxis dataKey={msg.relatedChart.dataKeyX} stroke="#666" fontSize={12} />
                                                <YAxis stroke="#666" fontSize={12} />
                                                <Tooltip
                                                    contentStyle={{ backgroundColor: '#18181b', borderColor: '#333' }}
                                                    itemStyle={{ color: '#fff' }}
                                                />
                                                <Legend />
                                                <Line
                                                    type="monotone"
                                                    dataKey={msg.relatedChart.dataKeyY as string}
                                                    stroke="#8b5cf6"
                                                    strokeWidth={2}
                                                    dot={{ fill: '#8b5cf6' }}
                                                />
                                            </LineChart>
                                        ) : (
                                            <BarChart data={msg.chartData}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                                                <XAxis dataKey={msg.relatedChart.dataKeyX} stroke="#666" fontSize={12} />
                                                <YAxis stroke="#666" fontSize={12} />
                                                <Tooltip
                                                    contentStyle={{ backgroundColor: '#18181b', borderColor: '#333' }}
                                                    itemStyle={{ color: '#fff' }}
                                                />
                                                <Legend />
                                                <Bar dataKey={msg.relatedChart.dataKeyY as string} fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                            </BarChart>
                                        )}
                                    </ResponsiveContainer>
                                </div>
                            )}

                            <span className="text-[10px] text-zinc-500">{msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                    ))}
                    {isChatThinking && (
                        <div className="flex items-center gap-2 text-zinc-500 text-xs p-2">
                            <Sparkles size={12} className="animate-spin" />
                            <span>Running causal analysis...</span>
                        </div>
                    )}
                    <div ref={chatEndRef} />
                </div>

                {/* Suggested Questions */}
                {status === DatasetStatus.READY && suggestedQuestions.length > 0 && chatHistory.length < 3 && (
                    <div className="px-4 py-2 flex flex-wrap gap-2">
                        {suggestedQuestions.map((q, i) => (
                            <button
                                key={i}
                                onClick={() => handleSendMessage(q)}
                                className="text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 rounded-full px-3 py-1 transition-colors whitespace-nowrap"
                            >
                                {q}
                            </button>
                        ))}
                    </div>
                )}

                <div className="p-4 border-t border-os-border bg-os-800">
                    <div className="relative">
                        <input
                            type="text"
                            value={chatInput}
                            onChange={(e) => setChatInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                            placeholder={mode === 'CEO' ? "Ask strategic questions..." : "Ask SQL / Root Cause..."}
                            disabled={status !== DatasetStatus.READY}
                            className="w-full bg-zinc-900 border border-zinc-700 rounded-lg pl-4 pr-10 py-3 text-sm focus:outline-none focus:border-blue-500 disabled:opacity-50 transition-colors placeholder:text-zinc-600"
                        />
                        <button
                            onClick={() => handleSendMessage()}
                            disabled={!chatInput.trim() || status !== DatasetStatus.READY}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-zinc-400 hover:text-white disabled:text-zinc-700 transition-colors">
                            <Send size={16} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
