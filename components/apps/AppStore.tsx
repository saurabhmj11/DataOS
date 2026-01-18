/**
 * Copyright (c) 2024. Designed and Developed by Saurabh Lokhande.
 */

import { useState } from 'react';
import { ShoppingBag, Star, Search, Command } from 'lucide-react';

export default function AppStore() {
    const [installed, setInstalled] = useState<Record<string, boolean>>({
        'data-os-core': true,
        'analyst-pro': true,
        'sql-workbench': true
    });

    const apps = [
        {
            id: 'vector-db',
            name: 'Vector DB Plugin',
            desc: 'Enable semantic search with ChromaDB integration.',
            icon: <DatabaseIcon size={24} className="text-orange-400" />,
            price: 'Free'
        },
        {
            id: 'cloud-sync',
            name: 'Cloud Sync',
            desc: 'Sync your DataOS context to S3 or GDrive.',
            icon: <CloudIcon size={24} className="text-blue-400" />,
            price: '$4.99'
        },
        {
            id: 'voice-mode',
            name: 'Voice Interface',
            desc: 'Talk to your kernel agent naturally.',
            icon: <MicIcon size={24} className="text-purple-400" />,
            price: 'Coming Soon'
        }
    ];

    const toggleInstall = (id: string) => {
        setInstalled(prev => ({ ...prev, [id]: !prev[id] }));
    };

    return (
        <div className="h-full w-full bg-zinc-50 text-zinc-900 font-sans flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-zinc-200 bg-white sticky top-0 z-10">
                <div className="flex items-center justify-between mb-4">
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <ShoppingBag className="text-blue-600" />
                        App Store
                    </h1>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
                        <input
                            type="text"
                            placeholder="Search apps..."
                            className="pl-9 pr-4 py-2 bg-zinc-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
                        />
                    </div>
                </div>

                <div className="flex gap-4 overflow-x-auto pb-1">
                    {['Featured', 'Productivity', 'Developer', 'Data Tools', 'AI Plugins'].map(tab => (
                        <button key={tab} className="px-3 py-1 text-sm font-medium text-zinc-600 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors whitespace-nowrap">
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            {/* Featured Hero */}
            <div className="p-6 bg-gradient-to-r from-blue-600 to-indigo-700 text-white shrink-0">
                <div className="flex items-center gap-6">
                    <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-sm">
                        <Command size={48} />
                    </div>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="px-2 py-0.5 bg-white/20 rounded text-[10px] font-bold tracking-wider">FEATURED</span>
                        </div>
                        <h2 className="text-2xl font-bold mb-2">Kernel 2.0 Command Center</h2>
                        <p className="text-blue-100 mb-4 text-sm max-w-md">Try the new Terminal app for advanced system operations. Now with 20% more power.</p>
                        <button className="px-6 py-2 bg-white text-blue-600 rounded-lg font-bold text-sm hover:bg-blue-50 transition-colors">
                            Installed
                        </button>
                    </div>
                </div>
            </div>

            {/* App Grid */}
            <div className="flex-1 overflow-y-auto p-6">
                <h3 className="font-bold text-lg mb-4 text-zinc-800">New Arrivals</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {apps.map(app => (
                        <div key={app.id} className="p-4 border border-zinc-200 rounded-xl bg-white hover:shadow-lg transition-all group">
                            <div className="flex items-start justify-between mb-3">
                                <div className="p-3 bg-zinc-100 rounded-xl group-hover:scale-110 transition-transform duration-200">
                                    {app.icon}
                                </div>
                                {installed[app.id] ? (
                                    <button
                                        onClick={() => toggleInstall(app.id)}
                                        className="text-xs font-bold text-zinc-400 bg-zinc-100 px-3 py-1 rounded-full hover:bg-zinc-200"
                                    >
                                        INSTALLED
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => toggleInstall(app.id)}
                                        className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full hover:bg-blue-100 flex items-center gap-1"
                                    >
                                        GET <span className="text-zinc-400 font-normal">| {app.price}</span>
                                    </button>
                                )}
                            </div>
                            <h4 className="font-bold text-zinc-900">{app.name}</h4>
                            <p className="text-xs text-zinc-500 mt-1 mb-3 leading-relaxed">{app.desc}</p>
                            <div className="flex items-center gap-1 text-[10px] text-zinc-400">
                                <Star size={12} className="fill-yellow-400 text-yellow-400" />
                                <span className="font-medium text-zinc-700">4.9</span>
                                <span>• 2.4k downloads</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

// Icons
const DatabaseIcon = ({ size, className }: { size: number, className?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><ellipse cx="12" cy="5" rx="9" ry="3" /><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" /><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" /></svg>
);
const CloudIcon = ({ size, className }: { size: number, className?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M17.5 19c0-3.037-2.463-5.5-5.5-5.5S6.5 15.963 6.5 19" /><path d="M19 19V5h-6l-2-2H4a2 2 0 0 0-2 2v14" /></svg> // Placeholder folder icon actually
);
const MicIcon = ({ size, className }: { size: number, className?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" /><line x1="12" y1="19" x2="12" y2="23" /><line x1="8" y1="23" x2="16" y2="23" /></svg>
);
