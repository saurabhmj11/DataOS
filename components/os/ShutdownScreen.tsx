/**
 * Copyright (c) 2024. Designed and Developed by Saurabh Lokhande.
 */

// Clean shutdown screen

const ShutdownScreen = () => {
    return (
        <div className="h-screen w-screen bg-black flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-zinc-800 border-t-zinc-500 rounded-full animate-spin" />
                <p className="text-zinc-500 font-mono text-sm">Shutting down...</p>
            </div>
        </div>
    );
};

export default ShutdownScreen;
