/**
 * Copyright (c) 2024. Designed and Developed by Saurabh Lokhande.
 */

import { db, Job } from './db';
import { eventBus } from './eventBus';

export class JobService {
    private static instance: JobService;
    private processing = false;

    private constructor() {
        this.processQueue();
        setInterval(() => this.processQueue(), 5000); // Polling fallback
    }

    public static getInstance(): JobService {
        if (!JobService.instance) {
            JobService.instance = new JobService();
        }
        return JobService.instance;
    }

    /**
     * Submit a new job to the queue
     */
    public async submitJob(
        type: Job['type'],
        payload: any,
        projectId: number = 0
    ): Promise<number> {
        const id = await db.jobs.add({
            project_id: projectId,
            type,
            status: 'pending',
            priority: 1, // Default priority
            progress: 0,
            payload_json: JSON.stringify(payload),
            created_at: Date.now(),
            updated_at: Date.now()
        });

        eventBus.publish('JOB_CREATED', { id, type }, 'JobService');
        this.processQueue(); // Trigger immediate processing check
        return id as number;
    }

    /**
     * Main Loop: Pick up pending jobs
     */
    private async processQueue() {
        if (this.processing) return;
        this.processing = true;

        try {
            // Get next pending job, ordered by priority (desc) then created_at (asc)
            // Dexie sorting limit: compound index needed for complex sort. 
            // For v1, just get all pending and sort in memory (queue is usually small)
            const pendingJobs = await db.jobs
                .where('status')
                .equals('pending')
                .toArray();

            if (pendingJobs.length === 0) {
                this.processing = false;
                return;
            }

            // Simple Priority Sort
            pendingJobs.sort((a, b) => b.priority - a.priority || a.created_at - b.created_at);
            const nextJob = pendingJobs[0];

            await this.runJob(nextJob);
        } catch (error) {
            console.error("Job Queue Error:", error);
        } finally {
            this.processing = false;
        }
    }

    /**
     * Execute a single job
     */
    private async runJob(job: Job) {
        // 1. Mark Running
        await db.jobs.update(job.id!, { status: 'running', updated_at: Date.now() });
        eventBus.publish('JOB_STARTED', { id: job.id }, 'JobService');

        try {
            let result: any = null;

            // 2. Execute Logic based on Type
            switch (job.type) {
                case 'ingest':
                    const payload = JSON.parse(job.payload_json);
                    // Simulate long running Ingest
                    await this.simulateProgress(job.id!, 2000);
                    result = { rows_ingested: 1000, table: payload.tableName };
                    break;

                case 'ai_profile':
                    await this.simulateProgress(job.id!, 3000);
                    result = { profile: "Data looks good." };
                    break;

                default:
                    throw new Error(`Unknown Job Type: ${job.type}`);
            }

            // 3. Mark Complete
            await db.jobs.update(job.id!, {
                status: 'completed',
                progress: 100,
                result_json: JSON.stringify(result),
                updated_at: Date.now()
            });
            eventBus.publish('JOB_COMPLETED', { id: job.id, result }, 'JobService');

        } catch (e: any) {
            // 4. Mark Failed
            await db.jobs.update(job.id!, {
                status: 'failed',
                error: e.message,
                updated_at: Date.now()
            });
            eventBus.publish('JOB_FAILED', { id: job.id, error: e.message }, 'JobService');
        }
    }

    private async simulateProgress(jobId: number, durationMs: number) {
        const steps = 5;
        const interval = durationMs / steps;

        for (let i = 1; i <= steps; i++) {
            await new Promise(r => setTimeout(r, interval));
            const progress = (i / steps) * 100;
            await db.jobs.update(jobId, { progress });
            eventBus.publish('JOB_PROGRESS', { id: jobId, progress }, 'JobService');
        }
    }
}

export const jobService = JobService.getInstance();
