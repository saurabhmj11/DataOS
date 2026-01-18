/**
 * Copyright (c) 2024. Designed and Developed by Saurabh Lokhande.
 */

import { useState, useEffect } from 'react';
import { db } from '../../services/db';
import { Settings as SettingsIcon, RefreshCw, Layers, Monitor, Cpu } from 'lucide-react';
import { cacheService } from '../../services/cacheService';

const Settings = () => {
    const [settings, setSettings] = useState<Record<string, any>>({});
    const [activeTab, setActiveTab] = useState('general');

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        const rows = await db.settings.toArray();
        const map: any = {};
        rows.forEach(r => map[r.key] = r.value);
        setSettings(map);
    };

    const saveSetting = async (key: string, value: any) => {
        await db.settings.put({
            key,
            value,
            updated_at: Date.now()
        });
        setSettings(prev => ({ ...prev, [key]: value }));
    };

    return (
        <div className="flex h-full bg-[#f3f4f6] dark:bg-[#121212] font-sans text-sm selection:bg-blue-500/30">
            {/* Sidebar */}
            <div className="w-56 bg-white dark:bg-[#1a1a1a] border-r dark:border-zinc-800 flex flex-col pt-6 pb-4">
                <div className="px-6 mb-8 text-xl font-bold dark:text-zinc-100 flex items-center gap-2">
                    <SettingsIcon className="text-blue-500" />
                    <span>Settings</span>
                </div>

                <nav className="space-y-1 px-3">
                    {['general', 'appearance', 'ai_logic', 'system'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`w-full text-left px-3 py-2 rounded-lg capitalize transition-colors ${activeTab === tab ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium' : 'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}
                        >
                            {tab}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Content */}
            <div className="flex-1 p-8 overflow-y-auto dark:text-zinc-300">
                <h2 className="text-2xl font-bold mb-6 capitalize text-zinc-800 dark:text-zinc-100">{activeTab}</h2>

                {activeTab === 'general' && (
                    <div className="space-y-6 max-w-xl">
                        <div className="bg-white dark:bg-[#1a1a1a] p-6 rounded-xl border dark:border-zinc-800 shadow-sm">
                            <h3 className="font-semibold mb-4 text-zinc-900 dark:text-zinc-100">User Profile</h3>
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-xl font-bold">
                                    A
                                </div>
                                <div>
                                    <p className="font-medium">Administrator</p>
                                    <p className="text-xs text-zinc-500">Local Session</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'appearance' && (
                    <div className="space-y-6 max-w-xl">
                        <div className="bg-white dark:bg-[#1a1a1a] p-6 rounded-xl border dark:border-zinc-800 shadow-sm">
                            <h3 className="font-semibold mb-4 text-zinc-900 dark:text-zinc-100">Theme Preference</h3>
                            <div className="grid grid-cols-3 gap-4">
                                {['light', 'dark', 'system'].map(theme => (
                                    <button
                                        key={theme}
                                        onClick={() => saveSetting('theme', theme)}
                                        className={`p-4 rounded-lg border-2 flex flex-col items-center gap-2 ${settings.theme === theme ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/10' : 'border-transparent bg-zinc-100 dark:bg-zinc-800'}`}
                                    >
                                        <Monitor size={24} className={settings.theme === theme ? 'text-blue-500' : 'text-zinc-400'} />
                                        <span className="capitalize text-xs font-medium">{theme}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'ai_logic' && (
                    <div className="space-y-6 max-w-xl">
                        <div className="bg-white dark:bg-[#1a1a1a] p-6 rounded-xl border dark:border-zinc-800 shadow-sm">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">LLM Provider</h3>
                                <Cpu size={18} className="text-zinc-400" />
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-medium text-zinc-500 mb-1">Provider</label>
                                    <select
                                        value={settings.ai_provider || 'gemini'}
                                        onChange={(e) => saveSetting('ai_provider', e.target.value)}
                                        className="w-full bg-zinc-50 dark:bg-zinc-900 border dark:border-zinc-700 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 ring-blue-500"
                                    >
                                        <option value="gemini">Google Gemini</option>
                                        <option value="openai">OpenAI GPT-4</option>
                                        <option value="anthropic">Anthropic Claude</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-zinc-500 mb-1">API Key</label>
                                    <input
                                        type="password"
                                        value={settings.ai_api_key || ''}
                                        onChange={(e) => saveSetting('ai_api_key', e.target.value)}
                                        placeholder="sk-..."
                                        className="w-full bg-zinc-50 dark:bg-zinc-900 border dark:border-zinc-700 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 ring-blue-500 font-mono"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'system' && (
                    <div className="space-y-6 max-w-xl">
                        <div className="bg-white dark:bg-[#1a1a1a] p-6 rounded-xl border dark:border-zinc-800 shadow-sm">
                            <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-4">Maintenance</h3>
                            <div className="space-y-3">
                                <button
                                    onClick={() => cacheService.clearCache().then(() => alert('Cache Cleared'))}
                                    className="w-full flex items-center justify-between px-4 py-3 bg-zinc-50 dark:bg-zinc-900 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                                >
                                    <span className="flex items-center gap-2"><Layers size={16} /> Clear Result Cache</span>
                                    <span className="text-xs bg-zinc-200 dark:bg-zinc-700 px-2 py-0.5 rounded">Free up memory</span>
                                </button>
                                <button
                                    onClick={() => window.location.reload()}
                                    className="w-full flex items-center justify-between px-4 py-3 bg-red-50 dark:bg-red-900/10 text-red-600 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors"
                                >
                                    <span className="flex items-center gap-2"><RefreshCw size={16} /> Reboot System</span>
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Settings;
