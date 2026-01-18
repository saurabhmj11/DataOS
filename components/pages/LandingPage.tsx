import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Terminal, Cpu, Database, ChevronRight, Command, Shield, Zap, Globe, Bot, Layers, Book } from 'lucide-react';

interface LandingPageProps {
    onLaunch: () => void;
}

export default function LandingPage({ onLaunch }: LandingPageProps) {
    const [isLaunching, setIsLaunching] = useState(false);

    const handleLaunch = () => {
        setIsLaunching(true);
        setTimeout(onLaunch, 1500); // Wait for exit animation
    };

    return (
        <div className={`fixed inset-0 bg-black text-white font-sans overflow-y-auto overflow-x-hidden selection:bg-blue-500/30 transition-opacity duration-1000 ${isLaunching ? 'opacity-0' : 'opacity-100'
            } `}>

            {/* Background Effects */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-blue-900/20 to-transparent opacity-50" />
                <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-purple-900/20 rounded-full blur-3xl opacity-30 animate-pulse" />
                <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-indigo-900/20 rounded-full blur-3xl opacity-30" />
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
            </div>

            {/* Navigation */}
            <nav className="relative z-10 flex items-center justify-between px-6 py-6 max-w-7xl mx-auto">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
                        <span className="font-bold text-lg">D</span>
                    </div>
                    <span className="font-bold text-xl tracking-tight">DataOS <span className="text-zinc-500 text-sm font-normal ml-1">v2.0</span></span>
                </div>
                <div className="hidden md:flex items-center gap-8 text-sm text-zinc-400 font-medium">
                    <a href="#features" className="hover:text-white transition-colors">Capabilities</a>
                    <a href="#architecture" className="hover:text-white transition-colors">Architecture</a>
                    <a href="#agents" className="hover:text-white transition-colors">Agents</a>
                </div>
                <button
                    onClick={handleLaunch}
                    className="px-5 py-2 bg-white text-black rounded-full font-bold text-sm hover:bg-zinc-200 transition-transform hover:scale-105 active:scale-95"
                >
                    Launch Kernel
                </button>
            </nav>

            {/* Hero Section */}
            <main className="relative z-10 pt-20 pb-32 px-6 max-w-7xl mx-auto text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900/50 border border-zinc-800 text-xs text-blue-400 mb-8 backdrop-blur-md">
                        <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                        System Online • Kernel 2.0 Stable
                    </div>
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-8 bg-clip-text text-transparent bg-gradient-to-b from-white to-zinc-500"
                >
                    The Operating System <br /> for Intelligence.
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                    className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto mb-12 leading-relaxed"
                >
                    A new paradigm for data work. Persistent workspace, autonomous agents, and a neural interface—all running in your browser.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.6 }}
                    className="flex flex-col md:flex-row items-center justify-center gap-4"
                >
                    <button
                        onClick={handleLaunch}
                        className="group relative px-8 py-4 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold text-lg shadow-xl shadow-blue-500/20 transition-all hover:shadow-blue-500/40 w-full md:w-auto overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-400/0 via-blue-400/30 to-blue-400/0 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
                        <span className="flex items-center justify-center gap-2">
                            Initialize System
                            <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                        </span>
                    </button>
                    <button
                        onClick={() => document.getElementById('docs')?.scrollIntoView({ behavior: 'smooth' })}
                        className="px-8 py-4 bg-zinc-900/50 hover:bg-zinc-800 rounded-xl font-medium text-lg border border-zinc-800 backdrop-blur-md transition-all w-full md:w-auto">
                        View Documentation
                    </button>
                </motion.div>

                {/* Hero Graphic / Terminal Preview */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1, delay: 0.8 }}
                    className="mt-20 mx-auto max-w-5xl bg-zinc-950 rounded-2xl border border-zinc-800 shadow-2xl overflow-hidden aspect-video relative group"
                >
                    <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/5 to-purple-500/5 pointer-events-none" />

                    {/* Simulated OS Interface */}
                    <div className="w-full h-8 bg-zinc-900 border-b border-zinc-800 flex items-center px-4 gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50" />
                        <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50" />
                        <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50" />
                    </div>
                    <div className="p-8 text-left font-mono text-sm md:text-base grid grid-cols-1 md:grid-cols-2 gap-8 h-full">
                        <div className="space-y-4">
                            <div className="text-zinc-500">$ init-kernel --mode=autonomous</div>
                            <div className="text-green-400">✔ Loading persistence layer (Dexie.js)...</div>
                            <div className="text-green-400">✔ Initializing virtual file system...</div>
                            <div className="text-green-400">✔ Connecting neural interface...</div>
                            <div className="text-blue-400 animate-pulse">Waiting for user command..._</div>
                        </div>
                        <div className="hidden md:block border-l border-zinc-800 pl-8">
                            <div className="flex items-center gap-2 text-zinc-400 mb-4">
                                <Cpu size={16} /> System Metrics
                            </div>
                            <div className="space-y-3">
                                <div className="bg-zinc-900 rounded-lg p-3 border border-zinc-800">
                                    <div className="flex justify-between text-xs text-zinc-500 mb-1">
                                        <span>CPU Usage</span>
                                        <span>12%</span>
                                    </div>
                                    <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                                        <div className="bg-blue-500 h-full w-[12%]" />
                                    </div>
                                </div>
                                <div className="bg-zinc-900 rounded-lg p-3 border border-zinc-800">
                                    <div className="flex justify-between text-xs text-zinc-500 mb-1">
                                        <span>Memory (VFS)</span>
                                        <span>420MB</span>
                                    </div>
                                    <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                                        <div className="bg-purple-500 h-full w-[45%]" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </main>

            {/* Features Grid */}
            <section id="features" className="py-24 px-6 relative z-10 border-t border-zinc-900/50 bg-black/50 backdrop-blur-sm">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <FeatureCard
                            icon={<Database className="text-blue-400" />}
                            title="Persistent VFS"
                            desc="A robust virtual file system running entirely in the browser using IndexedDB. Projects, files, and state survive reloads."
                        />
                        <FeatureCard
                            icon={<Zap className="text-purple-400" />}
                            title="Instant Runtime"
                            desc="No server setup required. The kernel boots in milliseconds and executes Javascript and SQL locally."
                        />
                        <FeatureCard
                            icon={<Command className="text-orange-400" />}
                            title="Natural Language OS"
                            desc="Control the entire system with English. Agents translate your intent into complex execution plans."
                        />
                    </div>
                </div>
            </section>

            {/* Architecture Section */}
            <section id="architecture" className="py-24 px-6 relative z-10 bg-zinc-900/30">
                <div className="max-w-7xl mx-auto">
                    <div className="mb-16 text-center">
                        <h2 className="text-3xl md:text-5xl font-bold mb-6">System Architecture</h2>
                        <p className="text-zinc-400 max-w-2xl mx-auto">
                            Built on a local-first philosophy. DataOS runs entirely in your browser, utilizing WebAssembly and IndexedDB for near-native performance.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                        <div className="space-y-8">
                            <div className="flex gap-4">
                                <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
                                    <Globe className="text-blue-400" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold mb-2">Local-First Kernel</h3>
                                    <p className="text-zinc-400">The entire runtime is downloaded once and runs offline. privacy is default, not an option.</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center shrink-0">
                                    <Layers className="text-purple-400" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold mb-2">Neural Interface</h3>
                                    <p className="text-zinc-400">A dedicated AI layer managing system processes, file indexing, and user intent translation.</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center shrink-0">
                                    <Shield className="text-green-400" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold mb-2">Sandboxed Execution</h3>
                                    <p className="text-zinc-400">Applications run in isolated contexts, ensuring system stability and security.</p>
                                </div>
                            </div>
                        </div>
                        <div className="relative h-[400px] bg-Zinc-900 rounded-2xl border border-zinc-800 overflow-hidden flex items-center justify-center">
                            <div className="absolute inset-0 bg-blue-500/5" />
                            <div className="text-zinc-500 text-sm font-mono">
                                [Architecture Diagram Placeholder: Kernel Layer -&gt; VFS -&gt; App Layer]
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Agents Section */}
            <section id="agents" className="py-24 px-6 relative z-10 border-t border-zinc-900/50">
                <div className="max-w-7xl mx-auto text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-900/20 border border-purple-800 text-xs text-purple-400 mb-8">
                        <Bot size={14} />
                        <span>Autonomous Agents included</span>
                    </div>
                    <h2 className="text-3xl md:text-5xl font-bold mb-6">Workforce on Demand</h2>
                    <p className="text-zinc-400 max-w-2xl mx-auto mb-16">
                        DataOS comes pre-installed with specialized AI agents capable of handling complex workflows from data analysis to code generation.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800 text-left hover:border-blue-500/50 transition-colors">
                            <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center mb-4 text-blue-400">
                                <Terminal size={20} />
                            </div>
                            <h4 className="text-lg font-bold mb-2">DevAgent</h4>
                            <p className="text-sm text-zinc-400">Writes, debugs, and deploys code within the OS environment.</p>
                        </div>
                        <div className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800 text-left hover:border-purple-500/50 transition-colors">
                            <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center mb-4 text-purple-400">
                                <Database size={20} />
                            </div>
                            <h4 className="text-lg font-bold mb-2">DataAnalyst</h4>
                            <p className="text-sm text-zinc-400">Processes CSVs, generates charts, and uncovers insights automatically.</p>
                        </div>
                        <div className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800 text-left hover:border-green-500/50 transition-colors">
                            <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center mb-4 text-green-400">
                                <Shield size={20} />
                            </div>
                            <h4 className="text-lg font-bold mb-2">SysAdmin</h4>
                            <p className="text-sm text-zinc-400">Monitors system health, optimizes memory, and manages permissions.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Docs Section */}
            <section id="docs" className="py-24 px-6 relative z-10 bg-zinc-900/30 border-t border-zinc-900/50">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row items-start justify-between gap-12">
                        <div className="max-w-lg">
                            <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                                <Book className="text-zinc-400" />
                                Documentation
                            </h2>
                            <p className="text-zinc-400 mb-8">
                                Complete guides, API references, and tutorials are available in the DataOS Knowledge Base. Access it directly from your desktop.
                            </p>
                            <button className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 rounded-lg font-medium text-sm transition-colors text-white">
                                Open Knowledge Base
                            </button>
                        </div>
                        <div className="grid grid-cols-2 gap-x-12 gap-y-4 text-sm text-zinc-400">
                            <div className="font-bold text-white mb-2">Getting Started</div>
                            <div className="font-bold text-white mb-2">API Reference</div>

                            <a href="#" className="hover:text-blue-400 transition-colors">Installation</a>
                            <a href="#" className="hover:text-blue-400 transition-colors">Kernel API</a>

                            <a href="#" className="hover:text-blue-400 transition-colors">Architecture</a>
                            <a href="#" className="hover:text-blue-400 transition-colors">File System</a>

                            <a href="#" className="hover:text-blue-400 transition-colors">First Project</a>
                            <a href="#" className="hover:text-blue-400 transition-colors">Agent Protocol</a>

                            <a href="#" className="hover:text-blue-400 transition-colors">Configuration</a>
                            <a href="#" className="hover:text-blue-400 transition-colors">UI Kit</a>
                        </div>
                    </div>
                </div>
            </section>

            <footer className="py-12 px-6 border-t border-zinc-900 text-center text-zinc-600 text-sm">
                <p>Designed and Developed by Saurabh Lokhande</p>
            </footer>

        </div>
    );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
    return (
        <div className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800 hover:bg-zinc-900 transition-colors group">
            <div className="w-12 h-12 rounded-xl bg-zinc-800 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                {icon}
            </div>
            <h3 className="text-xl font-bold mb-2 text-zinc-100">{title}</h3>
            <p className="text-zinc-400 leading-relaxed">{desc}</p>
        </div>
    );
}
