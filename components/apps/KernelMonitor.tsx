/**
 * Copyright (c) 2024. Designed and Developed by Saurabh Lokhande.
 */

import { useState, useEffect, useRef } from 'react';
import { eventBus } from '../../services/eventBus';
import { Activity, Trash2, Terminal, Cpu } from 'lucide-react';

interface LogEntry {
    id: string;
    timestamp: Date;
    type: string;
    source: string;
    payload: any;
}

const KernelMonitor = () => {
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const logsEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleEvent = (type: string) => (payload: any, source?: string) => {
            const entry: LogEntry = {
                id: Math.random().toString(36).substr(2, 9),
                timestamp: new Date(),
                type,
                source: source || 'System',
                payload
            };
            setLogs(prev => [...prev, entry]);
        };

        // Subscribe to all known event types
        // In a real event bus we might have a wildcard subscribe, but here we list them
        const unsubFileCreated = eventBus.subscribe('FILE_CREATED', handleEvent('FILE_CREATED'));
        const unsubFileUpdated = eventBus.subscribe('FILE_UPDATED', handleEvent('FILE_UPDATED'));
        const unsubJobStarted = eventBus.subscribe('JOB_STARTED', handleEvent('JOB_STARTED'));
        const unsubJobCompleted = eventBus.subscribe('JOB_COMPLETED', handleEvent('JOB_COMPLETED'));
        const unsubJobFailed = eventBus.subscribe('JOB_FAILED', handleEvent('JOB_FAILED'));
        const unsubAgentMessage = eventBus.subscribe('AGENT_MESSAGE', handleEvent('AGENT_MESSAGE'));

        return () => {
            unsubFileCreated();
            unsubFileUpdated();
            unsubJobStarted();
            unsubJobCompleted();
            unsubJobFailed();
            unsubAgentMessage();
        };
    }, []);

    useEffect(() => {
        logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [logs]);

    const clearLogs = () => setLogs([]);

    const getIconForType = (type: string) => {
        if (type.includes('FILE')) return <Terminal className="w-4 h-4 text-blue-400" />;
        if (type.includes('JOB')) return <Activity className="w-4 h-4 text-green-400" />;
        if (type.includes('AGENT')) return <Cpu className="w-4 h-4 text-purple-400" />;
        return <Activity className="w-4 h-4 text-gray-400" />;
    };

    return (
        <div className="h-full flex flex-col bg-black text-green-500 font-mono text-sm p-4">
            <div className="flex justify-between items-center mb-4 border-b border-green-900 pb-2">
                <h2 className="text-lg font-bold flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    KERNEL_MONITOR_V1.0
                </h2>
                <button
                    onClick={clearLogs}
                    className="p-1 hover:bg-green-900/30 rounded transition"
                    title="Clear Logs"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-2">
                {logs.length === 0 && (
                    <div className="text-green-900 italic text-center mt-10">
                        -- No System Activity Detected --
                    </div>
                )}
                {logs.map(log => (
                    <div key={log.id} className="flex gap-3 hover:bg-green-900/10 p-1 rounded">
                        <span className="text-green-700 whitespace-nowrap">
                            [{log.timestamp.toLocaleTimeString()}]
                        </span>
                        <div className="flex-shrink-0 mt-0.5">
                            {getIconForType(log.type)}
                        </div>
                        <div className="flex-1 break-all">
                            <span className="font-bold text-green-400">[{log.source}]</span>
                            <span className="mx-2 text-green-600">::</span>
                            <span className="font-semibold text-green-300">{log.type}</span>
                            <div className="text-green-500 mt-1 pl-4 border-l border-green-900/50">
                                {JSON.stringify(log.payload, null, 2)}
                            </div>
                        </div>
                    </div>
                ))}
                <div ref={logsEndRef} />
            </div>
        </div>
    );
};

export default KernelMonitor;
