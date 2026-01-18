/**
 * Copyright (c) 2024. Designed and Developed by Saurabh Lokhande.
 */

import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { db, User } from '../../services/db';
import { Power } from 'lucide-react';

const LoginScreen = () => {
    const { login, shutdown } = useAuthStore();
    const [users, setUsers] = useState<User[]>([]);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [password, setPassword] = useState('');
    const [error, setError] = useState(false);
    // Removed unused loading state

    useEffect(() => {
        db.users.toArray().then(setUsers);
    }, []);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedUser) return;

        const success = await login(selectedUser.username, password);
        if (!success) {
            setError(true);
        }
    };

    return (
        <div className="h-screen w-screen bg-[url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2672&auto=format&fit=crop')] bg-cover bg-center flex items-center justify-center relative">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

            <div className="z-10 w-full max-w-sm flex flex-col items-center gap-6">
                {!selectedUser ? (
                    // User Selection
                    <div className="flex flex-col gap-4 w-full px-8">
                        {users.map(u => (
                            <button
                                key={u.id}
                                onClick={() => setSelectedUser(u)}
                                className="flex items-center gap-4 bg-black/50 hover:bg-black/70 p-4 rounded-xl backdrop-blur-md border border-white/10 transition-all transform hover:scale-105"
                            >
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-xl font-bold text-white">
                                    {u.displayName[0]}
                                </div>
                                <div className="flex-1 text-left">
                                    <div className="text-white font-medium">{u.displayName}</div>
                                    <div className="text-white/50 text-xs uppercase tracking-wider">{u.role}</div>
                                </div>
                            </button>
                        ))}
                    </div>
                ) : (
                    // Password Entry
                    <form onSubmit={handleLogin} className="flex flex-col items-center gap-4 w-full animate-in fade-in zoom-in duration-300">
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-4xl font-bold text-white mb-2 shadow-2xl shadow-blue-500/20">
                            {selectedUser.displayName[0]}
                        </div>
                        <h2 className="text-2xl text-white font-light">{selectedUser.displayName}</h2>

                        <input
                            autoFocus
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={e => { setPassword(e.target.value); setError(false); }}
                            className={`bg-black/50 border ${error ? 'border-red-500' : 'border-white/20'} text-white rounded-md px-4 py-2 w-64 text-center focus:outline-none focus:border-blue-500 transition-colors backdrop-blur-md`}
                        />

                        {error && <div className="text-red-400 text-sm">Incorrect password</div>}

                        <button
                            type="button"
                            onClick={() => { setSelectedUser(null); setPassword(''); setError(false); }}
                            className="text-white/50 hover:text-white text-sm mt-4"
                        >
                            Switch User
                        </button>
                    </form>
                )}
            </div>

            {/* Power Controls */}
            <div className="absolute bottom-8 right-8 flex gap-4 z-10">
                <button onClick={shutdown} className="p-3 rounded-full bg-black/50 hover:bg-red-500/80 text-white backdrop-blur-md transition-colors" title="Shut Down"><Power size={20} /></button>
            </div>
        </div>
    );
};

export default LoginScreen;
