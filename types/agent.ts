/**
 * Copyright (c) 2024. Designed and Developed by Saurabh Lokhande.
 */

export interface AgentParameter {
    name: string;
    type: 'string' | 'number' | 'boolean' | 'enum';
    description: string;
    required: boolean;
    options?: string[]; // For enum types
}

export interface AgentCapability {
    intent: string; // The function name, e.g., "ImputeNulls"
    description: string;
    parameters: AgentParameter[];
}

export interface AgentProfile {
    id: string;
    name: string;
    role: string; // e.g., "Data Engineer", "Financial Analyst"
    description: string;
    capabilities: AgentCapability[];
}

export interface AgentIntent {
    agentId: string; // e.g., "data_cleaner"
    intent: string;  // e.g., "impute_nulls"
    params: Record<string, any>;
    reasoning: string; // Important for "Explainability"
    confidence: number;
}

export interface ExecutionResult {
    success: boolean;
    data?: any;
    message: string;
    artifacts?: string[]; // IDs of created artifacts (e.g. log entries)
}

export interface AgentPlan {
    id: string;
    goal: string;
    steps: AgentIntent[];
    status: 'pending' | 'executing' | 'completed' | 'failed';
}

export interface AgentJob {
    id: number;
    agentId: string;
    task: string;
    priority: 'high' | 'normal' | 'low';
    status: 'pending' | 'running' | 'completed' | 'failed';
    created_at: number;
}
