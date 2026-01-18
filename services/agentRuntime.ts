/**
 * Copyright (c) 2024. Designed and Developed by Saurabh Lokhande.
 */

import { AgentProfile, AgentIntent, ExecutionResult, AgentPlan } from '../types/agent';
import { duckDb } from './duckDbService';
import { metricService } from './metricService';
import { agentRegistry } from './agentRegistry';
import { eventBus } from './eventBus';
import { fileSystem } from './fileSystemService';
import { queryOptimizer } from './queryOptimizer';
import { getAI } from './aiService';

// Initialize AI
const aiService = getAI({ provider: 'gemini' });

export class AgentRuntime {
    private static instance: AgentRuntime;

    // We maintain a log of executed intents for "Replay" capability
    private executionLog: { intent: AgentIntent, result: ExecutionResult, timestamp: Date }[] = [];

    private constructor() {
        this.initializeKernel();
    }

    public static getInstance(): AgentRuntime {
        if (!AgentRuntime.instance) {
            AgentRuntime.instance = new AgentRuntime();
        }
        return AgentRuntime.instance;
    }

    private initializeKernel() {
        // Subscribe to system events
        eventBus.subscribe('FILE_CREATED', async (payload: any) => {
            console.log("🧠 Kernel detected new file:", payload.path);

            if (payload.path && payload.path.endsWith('.csv')) {
                console.log("🕵️‍♀️ Dispatching Schema Detective for:", payload.path);

                const result = await this.executeIntent({
                    agentId: 'schema_agent',
                    intent: 'detect_schema',
                    confidence: 1.0,
                    reasoning: 'Triggered by FILE_CREATED event',
                    params: { path: payload.path }
                });

                if (result.success) {
                    eventBus.publish('AGENT_MESSAGE', {
                        agentId: 'schema_agent',
                        message: `I've analyzed ${payload.path}. Found columns: ${result.data.columns.join(', ')}`
                    }, 'Kernel');
                }
            }
        });

        eventBus.subscribe('JOB_FAILED', (payload: any) => {
            console.warn("🧠 Kernel detected job failure:", payload.jobId);
            // Could trigger a cleanup agent
        });
    }

    public getAgents(): AgentProfile[] {
        return agentRegistry.getAllAgents();
    }

    public async executeIntent(intent: AgentIntent): Promise<ExecutionResult> {
        return this.executeIntentSafe(intent);
    }

    private async executeIntentSafe(intent: AgentIntent): Promise<ExecutionResult> {
        console.log(`🤖 Agent Runtime: Dispatching [${intent.intent}] to [${intent.agentId}]`);

        try {
            let result: any;
            const agent = agentRegistry.getAgent(intent.agentId);
            if (!agent) {
                throw new Error(`Unknown agent: ${intent.agentId}`);
            }

            // --- FAILSAFE WRAPPER for Resilience ---
            try {
                // --- DISPATCHER LOGIC ---
                switch (intent.agentId) {
                    case 'data_engineer':
                        result = await this.handleDataEngineer(intent);
                        break;
                    case 'analyst':
                        result = await this.handleAnalyst(intent);
                        break;
                    case 'schema_agent':
                        result = await this.handleSchemaAgent(intent);
                        break;
                    default:
                        throw new Error(`No handler implemented for agent: ${intent.agentId}`);
                }
            } catch (innerError: any) {
                console.warn(`⚠️ Agent [${intent.agentId}] crashed. Attempting recovery...`, innerError);
                // Simple heuristic recovery: if error mentions "no such table", suggest creating one
                if (innerError.message.includes('Table with name') && innerError.message.includes('does not exist')) {
                    const table = intent.params.table || 'unknown';
                    throw new Error(`The table '${table}' doesn't exist. Try ingesting a file first?`);
                }
                throw innerError; // Rethrow if no recovery strategy
            }

            const execResult: ExecutionResult = {
                success: true,
                data: result,
                message: `Successfully executed ${intent.intent}`
            };

            this.executionLog.push({ intent, result: execResult, timestamp: new Date() });
            return execResult;

        } catch (e: any) {
            console.error(`Runtime Error`, e);
            const errorResult: ExecutionResult = {
                success: false,
                message: e.message || "Unknown error"
            };
            this.executionLog.push({ intent, result: errorResult, timestamp: new Date() });
            return errorResult;
        }
    }

    // Deprecated: Internal dispatch logic now moved inside executeIntentSafe
    // Kept to minimize diff, but logic is effectively moved above.


    private async handleDataEngineer(intent: AgentIntent): Promise<any> {
        switch (intent.intent) {
            case 'run_sql':
                return await queryOptimizer.execute(intent.params.query);
            case 'get_schema':
                return await duckDb.getSchema(intent.params.table || 'main');
            case 'ingest_file':
                const { path, tableName } = intent.params;
                const safeTableName = (tableName || 'uploaded_data').replace(/[^a-zA-Z0-9_]/g, '_');

                console.log(`[Data Engineer] Ingesting ${path} into ${safeTableName}`);

                // 1. Get content from VFS
                const content = await fileSystem.readFile(path);
                if (!content) throw new Error(`File ${path} not found in VFS`);

                // 2. Register with DuckDB
                // If content is Blob/File, we need to handle it. For now assuming text/string from FileExplorer
                await duckDb.registerFile(path, content);

                // 3. Drop table if exists (Release Mode behavior)
                try {
                    await duckDb.query(`DROP TABLE IF EXISTS ${safeTableName}`);
                } catch (e) { /* ignore */ }

                // 4. Run Query
                // read_csv_auto is powerful enough for most CSVs
                try {
                    await duckDb.query(`CREATE TABLE ${safeTableName} AS SELECT * FROM read_csv_auto('${path}')`);
                } catch (e: any) {
                    console.error("CSV Import failed", e);
                    // Fallback to JSON if CSV fails? Or just rethrow
                    throw new Error(`Failed to ingest CSV: ${e.message}`);
                }

                // 5. Verify
                const count = await duckDb.query(`SELECT COUNT(*) as c FROM ${safeTableName}`);

                return { success: true, table: safeTableName, rows: count[0].c };
            case 'clean_data':
                const { tableName: targetTable } = intent.params;
                // Example cleaning: Remove rows where all columns are null (pseudo)
                // Or just dedup.
                await duckDb.query(`CREATE TABLE ${targetTable}_clean AS SELECT DISTINCT * FROM ${targetTable}`);
                await duckDb.query(`DROP TABLE ${targetTable}`);
                await duckDb.query(`ALTER TABLE ${targetTable}_clean RENAME TO ${targetTable}`);
                return { success: true, action: 'deduplicated' };
            default:
                throw new Error(`Unknown intent ${intent.intent} for Data Engineer`);
        }
    }

    private async handleAnalyst(intent: AgentIntent): Promise<any> {
        switch (intent.intent) {
            case 'calculate_metric':
                return await metricService.calculateMetric(intent.params.metricId);
            case 'analyze_trend':
                // Mock trend analysis for demo
                const metricId = intent.params.metricId || 'revenue';
                const data = [
                    { name: 'Jan', value: 400 },
                    { name: 'Feb', value: 300 },
                    { name: 'Mar', value: 600 },
                    { name: 'Apr', value: 800 },
                    { name: 'May', value: 500 }
                ];
                return {
                    summary: `Trend analysis for ${metricId} shows a 25% increase over the last 5 months.`,
                    data: data,
                    chartConfig: {
                        type: 'line',
                        dataKeyX: 'name',
                        dataKeyY: 'value',
                        title: `${metricId} Trend`
                    }
                };
            default:
                throw new Error(`Unknown intent ${intent.intent} for Analyst`);
        }
    }

    private async handleSchemaAgent(intent: AgentIntent): Promise<any> {
        switch (intent.intent) {
            case 'detect_schema':
                const path = intent.params.path;
                const content = await fileSystem.readFile(path);

                if (typeof content !== 'string') {
                    throw new Error("Generic Binary analysis not supported yet");
                }

                const lines = content.split('\n');
                if (lines.length === 0) return { columns: [] };

                const headers = lines[0].split(',').map((h: string) => h.trim());
                // Basic type inference from second row
                const types = lines.length > 1 ? lines[1].split(',').map((val: string) => {
                    if (!isNaN(Number(val))) return 'NUMBER';
                    if (val.toLowerCase() === 'true' || val.toLowerCase() === 'false') return 'BOOLEAN';
                    return 'STRING';
                }) : headers.map(() => 'STRING');

                const schema = headers.map((h: string, i: number) => ({ name: h, type: types[i] || 'STRING' }));

                return {
                    file: path,
                    columns: headers,
                    schema: schema,
                    rowCount: lines.length - 1
                };

            default:
                throw new Error(`Unknown intent ${intent.intent} for Schema Agent`);
        }
    }

    public async planRequest(userMessage: string): Promise<AgentPlan> {
        console.log(`🧠 Agent Runtime: Planning request for "${userMessage}"`);
        return await aiService.planQuery(userMessage);
    }

    public async parseIntent(userMessage: string): Promise<AgentIntent> {
        const msg = userMessage.toLowerCase();

        // 1. SQL Router
        if (msg.startsWith('/sql') || msg.includes('select ') || msg.includes('create table')) {
            return {
                agentId: 'data_engineer',
                intent: 'run_sql',
                confidence: 0.9,
                reasoning: 'Detected SQL keywords',
                params: { query: userMessage.replace('/sql', '').trim() }
            };
        }

        // 2. Ingest Router
        if (msg.includes('ingest') || msg.includes('load file')) {
            const parts = userMessage.split(' ');
            const path = parts.find(p => p.includes('/') || p.includes('.csv')) || '';
            const tableName = parts[parts.length - 1];
            return {
                agentId: 'data_engineer',
                intent: 'ingest_file',
                confidence: 0.8,
                reasoning: 'Detected ingestion intent',
                params: { path, tableName }
            };
        }

        // 3. Schema Router
        if (msg.includes('schema') || msg.includes('structure') || msg.includes('columns')) {
            const path = userMessage.split(' ').find(p => p.includes('.csv')) || '';
            if (path) {
                return {
                    agentId: 'schema_agent',
                    intent: 'detect_schema',
                    confidence: 0.9,
                    reasoning: 'Detected schema request for file',
                    params: { path }
                };
            }
            const table = userMessage.split(' ').find(p => !p.includes('schema')) || 'main';
            return {
                agentId: 'data_engineer',
                intent: 'get_schema',
                confidence: 0.8,
                reasoning: 'Detected schema request for table',
                params: { table }
            };
        }

        // 4. Trend/Analysis Router
        if (msg.includes('trend') || msg.includes('analyze') || msg.includes('chart')) {
            const metricId = msg.split(' ').find(w => !['analyze', 'trend', 'show', 'me', 'the'].includes(w)) || 'data';
            return {
                agentId: 'analyst',
                intent: 'analyze_trend',
                confidence: 0.85,
                reasoning: 'Detected analysis request',
                params: { metricId }
            };
        }

        // 5. Default: Analyst (Chat)
        return {
            agentId: 'analyst',
            intent: 'calculate_metric',
            confidence: 0.5,
            reasoning: 'Fallback to general chat',
            params: { metricId: userMessage }
        };
    }
}

export const agentRuntime = AgentRuntime.getInstance();
