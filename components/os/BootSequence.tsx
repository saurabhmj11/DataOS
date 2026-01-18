/**
 * Copyright (c) 2024. Designed and Developed by Saurabh Lokhande.
 */

import { useEffect, useState } from 'react';

const BootSequence = () => {
    const [lines, setLines] = useState<string[]>([]);

    useEffect(() => {
        const bootLog = [
            "BIOS Check... OK",
            "Loading Kernel... OK",
            "Mounting VFS... OK",
            "Initializing Agents...",
            "Starting DataOS Services...",
            "System Ready."
        ];

        let i = 0;
        const interval = setInterval(() => {
            if (i >= bootLog.length) {
                clearInterval(interval);
                return;
            }
            setLines(prev => [...prev, bootLog[i]]);
            i++;
        }, 300); // Fast boot

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="h-screen w-screen bg-black text-green-500 font-mono p-10 flex flex-col justify-end">
            {lines.map((line, i) => (
                <div key={i}>{line}</div>
            ))}
            <div className="animate-pulse">_</div>
        </div>
    );
};

export default BootSequence;
