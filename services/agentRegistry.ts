/**
 * Copyright (c) 2024. Designed and Developed by Saurabh Lokhande.
 */

import { AgentProfile } from '../types/agent';

export class AgentRegistry {
    private static instance: AgentRegistry;
    private agents: Map<string, AgentProfile> = new Map();

    private constructor() {
        // Bootstrap with default AGENTS from constants
        this.bootstrap();
    }

    public static getInstance(): AgentRegistry {
        if (!AgentRegistry.instance) {
            AgentRegistry.instance = new AgentRegistry();
        }
        return AgentRegistry.instance;
    }

    private bootstrap() {
        // Assuming AGENTS from constants matches AgentProfile or close enough
        // We might need to map it if types diverge, but for now let's assume valid
        // In reality, we'd probably have a more robust loader.
        const defaultAgents: AgentProfile[] = [
            {
                id: 'data_engineer',
                name: 'Data Engineer',
                role: 'Data Engineering',
                description: 'Cleans, transforms, and ingests data.',
                capabilities: [
                    {
                        intent: 'run_sql',
                        description: 'Execute raw SQL',
                        parameters: [{ name: 'query', type: 'string', description: 'SQL Query', required: true }]
                    },
                    {
                        intent: 'ingest_file',
                        description: 'Load file into table',
                        parameters: [
                            { name: 'path', type: 'string', description: 'File Path', required: true },
                            { name: 'tableName', type: 'string', description: 'Target Table Name', required: true }
                        ]
                    },
                    {
                        intent: 'clean_data',
                        description: 'Clean nulls/duplicates',
                        parameters: [{ name: 'tableName', type: 'string', description: 'Table Name', required: true }]
                    },
                    {
                        intent: 'get_schema',
                        description: 'Get table schema',
                        parameters: [{ name: 'table', type: 'string', description: 'Table Name', required: true }]
                    }
                ]
            },
            {
                id: 'schema_agent',
                name: 'Schema Detective',
                role: 'Metadata Analyst',
                description: 'Analyzes file structure and types.',
                capabilities: [
                    {
                        intent: 'detect_schema',
                        description: 'Infer schema from CSV',
                        parameters: [{ name: 'path', type: 'string', description: 'File path', required: true }]
                    }
                ]
            },
            {
                id: 'analyst',
                name: 'Data Analyst',
                role: 'Financial Analyst',
                description: 'Generates insights and answers questions.',
                capabilities: [
                    {
                        intent: 'calculate_metric',
                        description: 'Calculate a specific business metric',
                        parameters: [{ name: 'metricId', type: 'string', description: 'ID of the metric', required: true }]
                    },
                    {
                        intent: 'analyze_trend',
                        description: 'Analyze trends over time and generate charts',
                        parameters: [{ name: 'metricId', type: 'string', description: 'Metric to analyze', required: true }]
                    }
                ]
            }
        ];

        defaultAgents.forEach(agent => this.registerAgent(agent));
    }

    public registerAgent(agent: AgentProfile) {
        this.agents.set(agent.id, agent);
        console.log(`[AgentRegistry] Registered: ${agent.name}`);
    }

    public getAgent(id: string): AgentProfile | undefined {
        return this.agents.get(id);
    }

    public getAllAgents(): AgentProfile[] {
        return Array.from(this.agents.values());
    }
}

export const agentRegistry = AgentRegistry.getInstance();
