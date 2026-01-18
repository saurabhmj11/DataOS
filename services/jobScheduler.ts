/**
 * Copyright (c) 2024. Designed and Developed by Saurabh Lokhande.
 */

import { db, Job } from './db';
import { agentRuntime } from './agentRuntime';

export type JobType = 'ingest' | 'clean' | 'ai_profile' | 'ai_chat';

export class JobScheduler {
    private static instance: JobScheduler;
    private processing = false;

    private constructor() {
        // Recover running jobs on boot
        this.recoverJobs();
    }

    public static getInstance(): JobScheduler {
        if (!JobScheduler.instance) {
            JobScheduler.instance = new JobScheduler();
        }
        return JobScheduler.instance;
    }

    private async recoverJobs() {
        // Mark 'running' jobs as 'failed' (or restart them) on boot
        await db.jobs.where({ status: 'running' }).modify({ status: 'failed', error: 'System restart detected' });
    }

    public async submitJob(projectId: number, type: JobType, payload: any): Promise<number> {
        const id = await db.jobs.add({
            project_id: projectId,
            type,
            status: 'pending',
            progress: 0,
            priority: 0, // Default priority
            payload_json: JSON.stringify(payload),
            created_at: Date.now(),
            updated_at: Date.now()
        });

        // Trigger processing loop
        this.processQueue();

        return id as number;
    }

    public async getJob(id: number): Promise<Job | undefined> {
        return await db.jobs.get(id);
    }

    private async processQueue() {
        if (this.processing) return;
        this.processing = true;

        try {
            const pending = await db.jobs.where({ status: 'pending' }).sortBy('created_at');

            for (const job of pending) {
                if (!job.id) continue;

                await db.jobs.update(job.id, { status: 'running', updated_at: Date.now() });

                try {
                    // Execute Job Logic based on type
                    const result = await this.executeJobLogic(job);

                    await db.jobs.update(job.id, {
                        status: 'completed',
                        progress: 100,
                        result_json: JSON.stringify(result),
                        updated_at: Date.now()
                    });
                } catch (e: any) {
                    console.error(`Job ${job.id} failed`, e);
                    await db.jobs.update(job.id, {
                        status: 'failed',
                        error: e.message || 'Unknown error',
                        updated_at: Date.now()
                    });
                }
            }
        } finally {
            this.processing = false;
        }
    }



    private async executeJobLogic(job: Job): Promise<any> {
        const payload = JSON.parse(job.payload_json || '{}');
        let result;

        console.log(`[JobScheduler] Executing job ${job.id} of type ${job.type}`, payload);

        switch (job.type) {
            case 'ingest':
                // Map 'ingest' job to Data Engineer agent
                result = await agentRuntime.executeIntent({
                    agentId: 'data_engineer',
                    intent: 'ingest_file',
                    confidence: 1.0,
                    reasoning: 'Job Scheduler Ingestion Task',
                    params: {
                        path: payload.path,
                        tableName: payload.tableName || 'uploaded_data'
                    }
                });
                break;

            case 'clean':
                // Map 'clean' job to Data Engineer agent
                result = await agentRuntime.executeIntent({
                    agentId: 'data_engineer',
                    intent: 'clean_data',
                    confidence: 1.0,
                    reasoning: 'Job Scheduler Cleaning Task',
                    params: {
                        tableName: payload.tableName
                    }
                });
                break;

            case 'ai_profile':
                // Map 'ai_profile' to Schema Agent
                result = await agentRuntime.executeIntent({
                    agentId: 'schema_agent',
                    intent: 'detect_schema',
                    confidence: 1.0,
                    reasoning: 'Job Scheduler Profiling Task',
                    params: {
                        path: payload.path
                    }
                });
                break;

            case 'ai_chat':
                // Map 'ai_chat' to Analyst Agent
                result = await agentRuntime.executeIntent({
                    agentId: 'analyst',
                    intent: 'calculate_metric', // Defaulting to generic intent for now
                    confidence: 1.0,
                    reasoning: 'Job Scheduler AI Task',
                    params: {
                        metricId: payload.message || 'General Query'
                    }
                });
                break;

            default:
                throw new Error(`Unknown job type: ${job.type}`);
        }

        if (!result.success) {
            throw new Error(result.message || 'Agent execution failed');
        }

        return result.data;
    }
}

export const jobScheduler = JobScheduler.getInstance();
