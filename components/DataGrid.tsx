/**
 * Copyright (c) 2024. Designed and Developed by Saurabh Lokhande.
 */

import React, { useState } from 'react';
import { DataColumn } from '../types';
import { Search, ChevronLeft, ChevronRight, Hash, AlignLeft, Calendar, ToggleLeft } from 'lucide-react';

interface Props {
    data: any[];
    columns: DataColumn[];
}

const DataGrid: React.FC<Props> = ({ data, columns }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 50;

    // Filter data
    const filteredData = data.filter(row =>
        Object.values(row).some(val =>
            String(val).toLowerCase().includes(searchTerm.toLowerCase())
        )
    );

    // Pagination
    const totalPages = Math.ceil(filteredData.length / rowsPerPage);
    const currentData = filteredData.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

    const getIcon = (type: string) => {
        switch (type) {
            case 'number': return <Hash size={12} className="text-blue-400" />;
            case 'date': return <Calendar size={12} className="text-orange-400" />;
            case 'boolean': return <ToggleLeft size={12} className="text-green-400" />;
            default: return <AlignLeft size={12} className="text-zinc-400" />;
        }
    };

    return (
        <div className="flex flex-col h-full bg-os-900 text-sm animate-in fade-in">
            {/* Toolbar */}
            <div className="h-14 border-b border-os-border flex items-center justify-between px-6 bg-os-800/50">
                <div className="flex items-center gap-4">
                    <h2 className="font-bold text-white flex items-center gap-2">
                        <div className="w-2 h-6 bg-blue-500 rounded-sm" />
                        Data Grid
                    </h2>
                    <span className="text-zinc-500 text-xs font-mono">{filteredData.length.toLocaleString()} rows</span>
                </div>

                <div className="flex items-center gap-4">
                    <div className="relative">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search data..."
                            className="bg-zinc-900 border border-zinc-700 rounded-lg pl-9 pr-4 py-1.5 text-xs focus:outline-none focus:border-blue-500 transition-colors w-64 text-white"
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="p-1.5 hover:bg-zinc-800 rounded disabled:opacity-30 text-zinc-400"
                        >
                            <ChevronLeft size={16} />
                        </button>
                        <span className="text-xs text-zinc-400 font-mono">
                            Page {currentPage} of {totalPages}
                        </span>
                        <button
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className="p-1.5 hover:bg-zinc-800 rounded disabled:opacity-30 text-zinc-400"
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Grid */}
            <div className="flex-1 overflow-auto relative">
                <table className="w-full border-collapse">
                    <thead className="bg-os-800 sticky top-0 z-10 shadow-sm">
                        <tr>
                            <th className="sticky left-0 bg-os-800 p-3 text-left w-16 border-b border-r border-os-border text-xs font-mono text-zinc-500">#</th>
                            {columns.map(col => (
                                <th key={col.name} className="p-3 text-left border-b border-r border-os-border min-w-[150px]">
                                    <div className="flex items-center gap-2">
                                        {getIcon(col.type)}
                                        <span className="text-zinc-300 font-medium text-xs truncate">{col.name}</span>
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {currentData.map((row, idx) => (
                            <tr key={idx} className="group hover:bg-blue-900/10 transition-colors border-b border-os-border/50 last:border-0">
                                <td className="sticky left-0 bg-os-900 group-hover:bg-os-800/80 p-3 text-xs font-mono text-zinc-600 border-r border-os-border">
                                    {((currentPage - 1) * rowsPerPage) + idx + 1}
                                </td>
                                {columns.map(col => (
                                    <td key={col.name} className="p-3 text-xs text-zinc-300 border-r border-os-border/50 truncate max-w-[200px]">
                                        {String(row[col.name])}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>

                {currentData.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 text-zinc-500">
                        <p>No matching records found.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DataGrid;
