/**
 * Copyright (c) 2024. Designed and Developed by Saurabh Lokhande.
 */

import React, { useState } from 'react';
import { useAuthStore } from '../../store/useAuthStore';

const LockScreen = () => {
    const { user, unlock, logout } = useAuthStore();
    const [password, setPassword] = useState('');
    const [error, setError] = useState(false);

    const handleUnlock = async (e: React.FormEvent) => {
        e.preventDefault();
        const success = await unlock(password);
        if (!success) {
            setError(true);
            setPassword('');
        }
    };

    return (
        <div className="h-screen w-screen bg-[url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2672&auto=format&fit=crop')] bg-cover bg-center flex flex-col items-center justify-center relative">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-md" />

            <div className="z-10 flex flex-col items-center gap-6 animate-in fade-in zoom-in duration-300">
                <div className="w-32 h-32 rounded-full p-1 bg-gradient-to-br from-blue-500 to-purple-600">
                    <div className="w-full h-full rounded-full bg-zinc-900 flex items-center justify-center text-4xl font-bold text-white">
                        {user?.displayName[0]}
                    </div>
                </div>

                <div className="text-center">
                    <h2 className="text-3xl text-white font-medium mb-1">{user?.displayName}</h2>
                    <p className="text-white/50">Locked</p>
                </div>

                <form onSubmit={handleUnlock} className="flex flex-col gap-2">
                    <input
                        autoFocus
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        className={`bg-zinc-800/80 border ${error ? 'border-red-500' : 'border-zinc-700'} text-white rounded px-4 py-2 w-64 text-center focus:outline-none focus:border-blue-500 transition-colors`}
                    />
                    {error && <p className="text-red-500 text-xs text-center">Incorrect password</p>}
                </form>

                <button onClick={logout} className="text-white/40 hover:text-white text-sm mt-4 transition-colors">
                    Switch User
                </button>
            </div>
        </div>
    );
};

export default LockScreen;
