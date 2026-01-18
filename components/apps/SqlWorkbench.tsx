/**
 * Copyright (c) 2024. Designed and Developed by Saurabh Lokhande.
 */

import { useState, useEffect } from 'react';
import { duckDb } from '../../services/duckDbService';
import { Play, Table, RefreshCw, Save, Search } from 'lucide-react';
import DataGrid from '../DataGrid';

const SqlWorkbench = () => {
    const [query, setQuery] = useState('SELECT * FROM main LIMIT 10;');
    const [results, setResults] = useState<any[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [tables, setTables] = useState<string[]>([]);

    useEffect(() => {
        refreshTables();
    }, []);

    const refreshTables = async () => {
        try {
            const res = await duckDb.query("SHOW TABLES");
            setTables(res.map((r: any) => r.name));
        } catch (e) {
            console.error("Failed to list tables", e);
        }
    };

    const runQuery = async () => {
        setLoading(true);
        setError(null);
        try {
            const startTime = performance.now();
            const res = await duckDb.query(query);
            const duration = performance.now() - startTime;

            setResults(res);
            console.log(`Query executed in ${duration.toFixed(2)}ms`);
        } catch (e: any) {
            setError(e.message || "Query execution failed");
        } finally {
            setLoading(false);
        }
    };

    const handleExplain = async () => {
        setLoading(true);
        setError(null);
        try {
            // Dynamically import to avoid circular dependencies if any, or just use global
            // For now, assuming direct import works as we are in same bundle
            const { queryOptimizer } = await import('../../services/queryOptimizer');
            const explanation = await queryOptimizer.explain(query);

            // Format explanation for display
            setResults([{ explanation }]);
        } catch (e: any) {
            setError(e.message || "Explain failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex h-full bg-[#1e1e1e] text-zinc-300 font-mono text-sm">
            {/* Sidebar: Schema Browser */}
            <div className="w-48 bg-[#252526] border-r border-[#333] flex flex-col">
                <div className="p-2 text-xs font-bold text-zinc-500 uppercase flex justify-between items-center">
                    <span>Explorer</span>
                    <button onClick={refreshTables} className="hover:text-white"><RefreshCw size={12} /></button>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {tables.map(table => (
                        <div key={table} className="px-3 py-1 hover:bg-[#2a2d2e] cursor-pointer flex items-center gap-2 text-zinc-300">
                            <Table size={14} className="text-blue-400" />
                            <span>{table}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Toolbar */}
                <div className="h-10 bg-[#333333] flex items-center px-2 gap-2 border-b border-[#1e1e1e]">
                    <button
                        onClick={runQuery}
                        disabled={loading}
                        className="flex items-center gap-1.5 px-3 py-1 bg-green-700 hover:bg-green-600 text-white rounded-md text-xs transition-colors disabled:opacity-50">
                        <Play size={12} fill="currentColor" /> Run
                    </button>
                    <button
                        onClick={handleExplain}
                        disabled={loading}
                        className="flex items-center gap-1.5 px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-md text-xs transition-colors disabled:opacity-50">
                        <Search size={12} /> Explain
                    </button>
                    <div className="w-px h-4 bg-zinc-600 mx-1" />
                    <button className="p-1 hover:bg-zinc-600 rounded text-zinc-400 hover:text-white">
                        <Save size={14} />
                    </button>
                </div>

                {/* Editor */}
                <div className="h-1/3 border-b border-[#333] relative">
                    <textarea
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="w-full h-full bg-[#1e1e1e] text-zinc-100 p-4 resize-none outline-none font-mono text-sm leading-relaxed"
                        spellCheck={false}
                    />
                </div>

                {/* Results */}
                <div className="flex-1 bg-[#1e1e1e] overflow-hidden flex flex-col">
                    {error ? (
                        <div className="p-4 text-red-400 bg-red-900/10 h-full">
                            <h3 className="font-bold mb-2">Execution Error</h3>
                            <pre className="whitespace-pre-wrap font-mono text-xs">{error}</pre>
                        </div>
                    ) : results.length > 0 ? (
                        <div className="flex-1 overflow-hidden">
                            {/* Check if it's an explanation result */}
                            {results[0].explanation ? (
                                <div className="p-4 bg-[#1e1e1e] text-green-300 font-mono text-xs whitespace-pre-wrap h-full overflow-auto">
                                    <h3 className="font-bold text-zinc-500 mb-2 border-b border-zinc-700 pb-1">Query Execution Plan</h3>
                                    {results[0].explanation}
                                </div>
                            ) : (
                                <DataGrid
                                    data={results}
                                    columns={Object.keys(results[0]).map(k => ({
                                        name: k,
                                        type: typeof results[0][k] === 'number' ? 'number' : 'string',
                                        missing: 0, missingCount: 0, uniqueCount: 0, sampleValues: []
                                    }))}
                                />
                            )}
                        </div>
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-zinc-600">
                            No results to display
                        </div>
                    )}

                    {/* Status Bar */}
                    <div className="h-6 bg-blue-600 text-white text-[10px] flex items-center px-2 justify-between">
                        <span>DuckDB Wasm: Ready</span>
                        <span>{results.length} rows</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SqlWorkbench;
