/**
 * Copyright (c) 2024. Designed and Developed by Saurabh Lokhande.
 */

import React, { useState, useEffect, useRef } from 'react';
import { fileSystem } from '../../services/fileSystemService';
import { duckDb } from '../../services/duckDbService';

interface TerminalLine {
    type: 'input' | 'output' | 'error';
    content: string;
}

const Terminal = () => {
    const [history, setHistory] = useState<TerminalLine[]>([
        { type: 'output', content: 'DataOS Kernel v1.0.0 [Snapshot 2026-01-17]' },
        { type: 'output', content: 'Type "help" for valid commands.' }
    ]);
    const [input, setInput] = useState('');
    const [cwd, setCwd] = useState('/home');
    const inputRef = useRef<HTMLInputElement>(null);
    const endRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [history]);

    const handleCommand = async (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            const cmd = input.trim();

            setHistory(prev => [...prev, { type: 'input', content: `${cwd} $ ${cmd}` }]);
            setInput('');

            if (!cmd) return;

            const [command, ...args] = cmd.split(' ');

            try {
                let output = '';
                switch (command) {
                    case 'help':
                        output = `
Available Commands:
  ls [path]       List directory contents
  cd [path]       Change directory
  cat [file]      Read file content
  mkdir [path]    Create directory
  rm [path]       Remove file/directory
  sql [query]     Run SQL query
  clear           Clear terminal
`;
                        break;
                    case 'clear':
                        setHistory([]);
                        return;
                    case 'ls':
                        const targetPath = args[0] ? resolvePath(args[0]) : cwd;
                        const files = await fileSystem.ls(targetPath);
                        output = files.map(f => `${f.type === 'directory' ? 'd' : '-'}  ${f.name}`).join('\n');
                        break;
                    case 'cd':
                        const newPath = resolvePath(args[0] || '/');
                        if (await fileSystem.exists(newPath)) {
                            setCwd(newPath);
                        } else {
                            throw new Error(`Directory not found: ${newPath}`);
                        }
                        break;
                    case 'cat':
                        if (!args[0]) throw new Error('Usage: cat <file>');
                        const file = resolvePath(args[0]);
                        const content = await fileSystem.readFile(file);
                        output = typeof content === 'string' ? content : '[Binary Content]';
                        break;
                    case 'mkdir':
                        if (!args[0]) throw new Error('Usage: mkdir <path>');
                        await fileSystem.mkdir(resolvePath(args[0]));
                        output = `Created directory: ${args[0]}`;
                        break;
                    case 'rm':
                        if (!args[0]) throw new Error('Usage: rm <path>');
                        await fileSystem.delete(resolvePath(args[0]));
                        output = `Deleted: ${args[0]}`;
                        break;
                    case 'sql':
                        const query = args.join(' ');
                        const res = await duckDb.query(query);
                        output = JSON.stringify(res, null, 2);
                        break;
                    default:
                        output = `Command not found: ${command}`;
                }

                if (output) {
                    setHistory(prev => [...prev, { type: 'output', content: output }]);
                }

            } catch (err: any) {
                setHistory(prev => [...prev, { type: 'error', content: err.message }]);
            }
        }
    };

    const resolvePath = (path: string): string => {
        if (path.startsWith('/')) return path; // Absolute
        if (path === '..') {
            const parts = cwd.split('/');
            parts.pop();
            return parts.join('/') || '/';
        }
        if (path === '.') return cwd;
        return `${cwd === '/' ? '' : cwd}/${path}`; // Relative
    };

    return (
        <div
            className="h-full bg-black text-green-500 font-mono text-xs p-4 overflow-hidden flex flex-col"
            onClick={() => inputRef.current?.focus()}
        >
            <div className="flex-1 overflow-y-auto whitespace-pre-wrap">
                {history.map((line, i) => (
                    <div key={i} className={`mb-1 ${line.type === 'error' ? 'text-red-500' : line.type === 'input' ? 'text-blue-400 font-bold' : 'text-zinc-300'}`}>
                        {line.content}
                    </div>
                ))}
                <div ref={endRef} />
            </div>
            <div className="flex items-center gap-2 mt-2">
                <span className="text-blue-400">{cwd} $</span>
                <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleCommand}
                    className="flex-1 bg-transparent outline-none text-zinc-100"
                    autoFocus
                />
            </div>
        </div>
    );
};

export default Terminal;
