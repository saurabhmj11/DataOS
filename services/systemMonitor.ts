/**
 * Copyright (c) 2024. Designed and Developed by Saurabh Lokhande.
 */

import { db } from './db';

export interface SystemStats {
    cpu: number;      // 0-100%
    memory: number;   // MB used
    fps: number;      // Frames per second
    processCount: number;
}

class SystemMonitor {
    private static instance: SystemMonitor;
    private lastLoop = performance.now();
    private frameCount = 0;
    private currentFps = 60;

    // Smooth CPU simulation
    private targetCpu = 10;
    private currentCpu = 10;

    private constructor() {
        this.startLoop();
    }

    public static getInstance(): SystemMonitor {
        if (!SystemMonitor.instance) {
            SystemMonitor.instance = new SystemMonitor();
        }
        return SystemMonitor.instance;
    }

    private startLoop() {
        const loop = () => {
            const now = performance.now();
            this.frameCount++;

            if (now - this.lastLoop >= 1000) {
                this.currentFps = this.frameCount;
                this.frameCount = 0;
                this.lastLoop = now;

                // Update simulated CPU based on FPS drop
                // If FPS < 50, CPU usage "spikes"
                if (this.currentFps < 50) {
                    this.targetCpu = Math.min(100, this.targetCpu + 20);
                } else {
                    this.targetCpu = Math.max(5, this.targetCpu - 10);
                }
            }

            // Smooth transition CPU
            this.currentCpu += (this.targetCpu - this.currentCpu) * 0.1;

            requestAnimationFrame(loop);
        };
        requestAnimationFrame(loop);
    }

    public async getStats(): Promise<SystemStats> {
        // 1. Process Count from DB
        const activeJobs = await db.jobs.where('status').equals('running').count();
        const pendingJobs = await db.jobs.where('status').equals('pending').count();
        const totalProcesses = activeJobs + pendingJobs; // +1 for Kernel

        // 2. Memory Usage (Chrome/Edge only, fallback to mock)
        let memoryUsed = 128; // fallback MB
        if ((performance as any).memory) {
            memoryUsed = Math.round((performance as any).memory.usedJSHeapSize / 1024 / 1024);
        }

        // 3. CPU enhancement (add load if jobs are running)
        let totalCpu = this.currentCpu;
        if (activeJobs > 0) totalCpu += (activeJobs * 15); // 15% CPU per active job

        return {
            cpu: Math.min(100, Math.round(totalCpu)),
            memory: memoryUsed,
            fps: this.currentFps,
            processCount: Math.max(1, totalProcesses + 1) // +1 for the OS itself
        };
    }
}

export const systemMonitor = SystemMonitor.getInstance();
