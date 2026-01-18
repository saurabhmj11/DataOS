/**
 * Copyright (c) 2024. Designed and Developed by Saurabh Lokhande.
 */

import React, { useState, useEffect } from 'react';
import { X, Sliders, PlayCircle, RefreshCw, DollarSign } from 'lucide-react';
import { SimulationScenario, SimulationParameter } from '../types';

interface Props {
    scenario: SimulationScenario;
    onClose: () => void;
}

const SimulationPanel: React.FC<Props> = ({ scenario, onClose }) => {
    const [parameters, setParameters] = useState<SimulationParameter[]>(scenario.parameters);
    const [results, setResults] = useState<{ revenue: number; margin: number; churn: number }>({
        revenue: 1250000,
        margin: 32,
        churn: 5.2
    });

    const [baseMetrics] = useState({
        revenue: 1250000,
        margin: 32,
        churn: 5.2
    });

    const handleParamChange = (id: string, value: number) => {
        setParameters(prev => prev.map(p => p.id === id ? { ...p, currentValue: value } : p));
    };

    // Real-time calculation engine
    useEffect(() => {
        let revenueImpact = 0;
        let marginImpact = 0;
        let churnImpact = 0;

        parameters.forEach(param => {
            const delta = param.currentValue - param.defaultValue;
            if (delta === 0) return;

            param.impactMap.forEach(impact => {
                if (impact.targetMetricId === 'revenue') revenueImpact += delta * impact.factor;
                if (impact.targetMetricId === 'margin') marginImpact += delta * impact.factor;
                if (impact.targetMetricId === 'churn') churnImpact += delta * impact.factor;
            });
        });

        // Apply impacts (Linear simplified model)
        // Revenue is %, so factor of 0.8 means 1 unit change in param = 0.8% change in revenue
        // But for simplified view we treat as raw multiplier or percentage points

        // Logic: New Revenue = Base * (1 + (RevenueImpact / 100))
        const newRevenue = baseMetrics.revenue * (1 + (revenueImpact / 100));
        const newMargin = baseMetrics.margin + marginImpact;
        const newChurn = baseMetrics.churn + churnImpact;

        setResults({
            revenue: newRevenue,
            margin: Math.max(0, newMargin),
            churn: Math.max(0, newChurn)
        });

    }, [parameters, baseMetrics]);

    const formatMoney = (val: number) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);
    }

    const getDeltaColor = (current: number, base: number, inverse = false) => {
        if (Math.abs(current - base) < 0.01) return 'text-zinc-500';
        const isPositive = current > base;
        if (inverse) return isPositive ? 'text-red-400' : 'text-green-400';
        return isPositive ? 'text-green-400' : 'text-red-400';
    }

    return (
        <div className="fixed inset-y-0 right-0 w-[450px] bg-os-900 border-l border-os-border shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-300">

            {/* Header */}
            <div className="p-6 border-b border-os-border flex justify-between items-start bg-zinc-900/50">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <div className="p-1.5 bg-purple-500/20 rounded text-purple-400">
                            <Sliders size={18} />
                        </div>
                        <h2 className="text-lg font-bold text-white">Simulation Engine</h2>
                    </div>
                    <p className="text-sm text-zinc-400">{scenario.title}</p>
                </div>
                <button
                    onClick={onClose}
                    className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-white/5"
                >
                    <X size={20} />
                </button>
            </div>

            {/* Controls */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8">

                {/* Metric Cards (Results) */}
                <div className="grid grid-cols-1 gap-4">
                    {/* Revenue */}
                    <div className="bg-zinc-800/50 rounded-xl p-4 border border-zinc-700 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 transition-transform group-hover:scale-110">
                            <DollarSign className="text-zinc-700/50" size={48} />
                        </div>
                        <p className="text-xs text-zinc-400 font-bold uppercase tracking-wider mb-1">Proj. Net Revenue</p>
                        <div className="flex items-baseline gap-3">
                            <h3 className={`text-2xl font-mono font-bold ${getDeltaColor(results.revenue, baseMetrics.revenue)}`}>
                                {formatMoney(results.revenue)}
                            </h3>
                            <span className={`text-xs font-medium px-1.5 py-0.5 rounded bg-black/40 ${getDeltaColor(results.revenue, baseMetrics.revenue)}`}>
                                {results.revenue > baseMetrics.revenue ? '+' : ''}
                                {((results.revenue - baseMetrics.revenue) / baseMetrics.revenue * 100).toFixed(1)}%
                            </span>
                        </div>
                        <div className="mt-2 h-1 bg-zinc-700/50 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500 transition-all duration-300" style={{ width: `${(results.revenue / (baseMetrics.revenue * 1.5)) * 100}%` }} />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Margin */}
                        <div className="bg-zinc-800/50 rounded-xl p-3 border border-zinc-700">
                            <p className="text-[10px] text-zinc-400 font-bold uppercase mb-1">Op. Margin</p>
                            <div className="flex items-end justify-between">
                                <span className="text-xl font-mono text-white">{results.margin.toFixed(1)}%</span>
                                <span className={`text-[10px] ${getDeltaColor(results.margin, baseMetrics.margin)}`}>
                                    {results.margin > baseMetrics.margin ? '+' : ''}{(results.margin - baseMetrics.margin).toFixed(1)}%
                                </span>
                            </div>
                        </div>
                        {/* Churn */}
                        <div className="bg-zinc-800/50 rounded-xl p-3 border border-zinc-700">
                            <p className="text-[10px] text-zinc-400 font-bold uppercase mb-1">Churn Rate</p>
                            <div className="flex items-end justify-between">
                                <span className="text-xl font-mono text-white">{results.churn.toFixed(1)}%</span>
                                <span className={`text-[10px] ${getDeltaColor(results.churn, baseMetrics.churn, true)}`}>
                                    {results.churn > baseMetrics.churn ? '+' : ''}{(results.churn - baseMetrics.churn).toFixed(1)}%
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sliders */}
                <div className="space-y-6">
                    <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Adjustment Levers</h3>
                    {parameters.map(param => (
                        <div key={param.id} className="space-y-3">
                            <div className="flex justify-between">
                                <label className="text-sm font-medium text-zinc-300">{param.label}</label>
                                <span className="text-sm font-mono text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded">
                                    {param.currentValue > 0 ? '+' : ''}{param.currentValue}{param.unit}
                                </span>
                            </div>
                            <input
                                type="range"
                                min={param.min}
                                max={param.max}
                                step={param.step}
                                value={param.currentValue}
                                onChange={(e) => handleParamChange(param.id, Number(e.target.value))}
                                className="w-full h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                            />
                            <div className="flex justify-between text-[10px] text-zinc-500">
                                <span>{param.min}{param.unit}</span>
                                <span>{param.max}{param.unit}</span>
                            </div>
                        </div>
                    ))}
                </div>

            </div>

            {/* Footer Actions */}
            <div className="p-6 border-t border-os-border bg-os-900/50 space-y-3">
                <button className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-blue-900/20 transition-all active:scale-95">
                    <PlayCircle size={18} />
                    Commit Strategy
                </button>
                <button
                    onClick={() => setParameters(scenario.parameters)}
                    className="w-full py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium rounded-xl flex items-center justify-center gap-2 transition-all"
                >
                    <RefreshCw size={18} />
                    Reset Scenarios
                </button>
            </div>

        </div>
    );
};

export default SimulationPanel;
