/**
 * Copyright (c) 2024. Designed and Developed by Saurabh Lokhande.
 */

import React from 'react';
import { DatasetStatus, MCPTool, ProcessingLog } from '../types';
import { Activity, Database, Brain, Layers, CheckCircle2, Server } from 'lucide-react';

interface Props {
  status: DatasetStatus;
  agents: MCPTool[];
  logs: ProcessingLog[];
}

const PipelineVisualizer: React.FC<Props> = ({ status, agents, logs }) => {

  const getAgentStatusColor = (s: MCPTool['status']) => {
    switch (s) {
      case 'active': return 'text-blue-400 border-blue-500/50 bg-blue-500/10';
      case 'error': return 'text-red-400 border-red-500/50 bg-red-500/10';
      default: return 'text-zinc-500 border-zinc-700 bg-zinc-800/50';
    }
  };

  return (
    <div className="w-full h-full flex flex-col gap-4">
      {/* Top Architecture Diagram (Simplified MCP) */}
      <div className="glass-panel p-4 rounded-xl overflow-hidden">
        <h3 className="text-xs font-mono text-zinc-400 mb-4 uppercase tracking-wider">MCP Architecture</h3>
        {/* Scroll wrapper for small screens */}
        <div className="overflow-x-auto pb-2">
          <div className="flex items-center justify-between px-4 relative min-w-[500px]">

            {/* Connector Line */}
            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-zinc-800 -z-10" />

            {/* User/Client */}
            <div className="flex flex-col items-center gap-2 bg-os-900 p-2 rounded-lg border border-zinc-700 z-10 min-w-[80px]">
              <div className="p-2 bg-zinc-800 rounded-full"><Activity size={16} className="text-zinc-300" /></div>
              <span className="text-[10px] text-zinc-400">Client</span>
            </div>

            {/* Orchestrator */}
            <div className={`flex flex-col items-center gap-2 bg-os-900 p-2 rounded-lg border z-10 transition-colors min-w-[80px] ${status !== DatasetStatus.IDLE ? 'border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.2)]' : 'border-zinc-700'}`}>
              <div className="p-2 bg-zinc-800 rounded-full"><Brain size={20} className={status !== DatasetStatus.IDLE ? "text-blue-400 animate-pulse" : "text-zinc-300"} /></div>
              <span className="text-[10px] text-zinc-400">Orchestrator</span>
            </div>

            {/* Tools/Agents Group */}
            <div className="flex gap-2 bg-os-900 p-2 rounded-lg border border-zinc-700 z-10 min-w-[80px] justify-center">
              <div className="flex flex-col items-center">
                <Layers size={16} className="text-green-400 mb-1" />
                <span className="text-[10px] text-zinc-400">Agents</span>
              </div>
            </div>

            {/* Compute Engine */}
            <div className="flex flex-col items-center gap-2 bg-os-900 p-2 rounded-lg border border-zinc-700 z-10 min-w-[80px]">
              <div className="p-2 bg-zinc-800 rounded-full"><Server size={16} className="text-purple-400" /></div>
              <span className="text-[10px] text-zinc-400">Polars/DuckDB</span>
            </div>

            {/* Storage */}
            <div className="flex flex-col items-center gap-2 bg-os-900 p-2 rounded-lg border border-zinc-700 z-10 min-w-[80px]">
              <div className="p-2 bg-zinc-800 rounded-full"><Database size={16} className="text-yellow-400" /></div>
              <span className="text-[10px] text-zinc-400">Parquet</span>
            </div>
          </div>
        </div>
      </div>

      {/* Agents List */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {agents.map((agent) => (
          <div key={agent.name} className={`glass-panel p-3 rounded-lg border flex flex-col items-center justify-center gap-2 transition-all duration-300 ${getAgentStatusColor(agent.status)}`}>
            <div className="flex items-center gap-2">
              {agent.status === 'active' ? <div className="w-2 h-2 bg-blue-400 rounded-full animate-ping" /> : null}
              {agent.status === 'idle' && status === DatasetStatus.READY ? <CheckCircle2 size={14} className="text-green-500" /> : null}
              <span className="text-xs font-semibold text-center">{agent.name}</span>
            </div>
            <span className="text-[10px] text-center opacity-70 leading-tight hidden sm:block">{agent.description}</span>
          </div>
        ))}
      </div>

      {/* Live Logs */}
      <div className="glass-panel p-4 rounded-xl flex-1 overflow-hidden flex flex-col">
        <h3 className="text-xs font-mono text-zinc-400 mb-2 uppercase tracking-wider">System Logs</h3>
        <div className="overflow-y-auto flex-1 font-mono text-xs space-y-2 pr-2">
          {logs.length === 0 && <span className="text-zinc-600 italic">System ready. Waiting for data...</span>}
          {logs.map((log, i) => (
            <div key={i} className="flex gap-3 animate-in slide-in-from-left-2 fade-in duration-300">
              <span className="text-zinc-600 min-w-[60px]">{log.timestamp.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
              <span className={`font-semibold min-w-[90px] ${log.status === 'success' ? 'text-green-400' : 'text-blue-400'}`}>[{log.stage}]</span>
              <span className="text-zinc-300 break-all sm:break-normal">{log.message}</span>
            </div>
          ))}
          <div id="log-end" />
        </div>
      </div>
    </div>
  );
};

export default PipelineVisualizer;