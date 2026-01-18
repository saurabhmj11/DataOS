/**
 * Copyright (c) 2024. Designed and Developed by Saurabh Lokhande.
 */

import { AnalysisResult, HypothesisResult, DataColumn } from '../types';
import { generateInsights as generateGeminiInsights, testHypothesis as testGeminiHypothesis, chatWithData as chatGemini } from './geminiService';
import { AgentPlan } from '../types/agent';
import { metricService } from './metricService';

// --- TYPES ---
export type AIProvider = 'gemini' | 'ollama';

export interface AIConfig {
    provider: AIProvider;
    ollamaUrl?: string; // e.g., "http://localhost:11434"
    modelName?: string; // e.g., "llama3"
}

// --- OLLAMA PROVIDER IMPLEMENTATION ---

const callOllama = async (prompt: string, config: AIConfig) => {
    const url = `${config.ollamaUrl || 'http://localhost:11434'}/api/generate`;
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: config.modelName || 'llama3',
                prompt: prompt,
                stream: false,
                format: "json"
            })
        });

        if (!response.ok) throw new Error(`Ollama Error: ${response.statusText}`);
        const data = await response.json();
        return JSON.parse(data.response);
    } catch (e) {
        console.error("Ollama Call Failed", e);
        throw e;
    }
};

const generateOllamaInsights = async (columns: DataColumn[], rowCount: number, config: AIConfig): Promise<AnalysisResult> => {
    const prompt = `
      Analyze this dataset metadata.
      Rows: ${rowCount}
      Columns: ${JSON.stringify(columns)}
      
      Tasks:
      1. Provide 3 key strategic insights (mix of risks and opportunities).
      2. Generate 3 specific questions.
      3. Write a "Morning Briefing" paragraph for a CEO (max 40 words) summarizing the data health and key trend.
      
      Return purely JSON with this schema:
      {
        "insights": [{ "id": "1", "title": "...", "description": "...", "type": "risk|opportunity", "score": 0.9, "actionable": true }],
        "suggestedQuestions": ["..."],
        "narrativeBrief": "..."
      }
    `;
    return await callOllama(prompt, config);
};


// --- UNIFIED SERVICE EXPORT ---

export const getAI = (config: AIConfig) => {
    return {
        generateInsights: async (columns: DataColumn[], rowCount: number): Promise<AnalysisResult> => {
            if (config.provider === 'ollama') {
                try {
                    return await generateOllamaInsights(columns, rowCount, config);
                } catch (e) {
                    console.warn("Ollama failed, falling back to Mock Data via Gemini Service fallback logic");
                    return generateGeminiInsights(columns, rowCount); // This handles the mock fallback internally if API key is missing, which is useful here too
                }
            }
            return generateGeminiInsights(columns, rowCount);
        },

        testHypothesis: async (hypothesis: string): Promise<HypothesisResult> => {
            if (config.provider === 'ollama') {
                // Implement Ollama Version
                const prompt = `Hypothesis: "${hypothesis}". Return JSON: { "hypothesis": "${hypothesis}", "confidence": 0.8, "impact": "High", "explanation": "Logic...", "status": "confirmed" }`;
                try {
                    return await callOllama(prompt, config);
                } catch (e) {
                    return testGeminiHypothesis(hypothesis); // Fallback
                }
            }
            return testGeminiHypothesis(hypothesis);
        },

        chatWithData: async (question: string, context: any[], history: any[]) => {
            if (config.provider === 'ollama') {
                const prompt = `User: ${question}. Context: ${JSON.stringify(context.slice(0, 10))}. Return JSON: { "answer": "...", "thoughts": ["..."] }`;
                try {
                    const res = await callOllama(prompt, config);
                    return { text: res.answer, thoughtProcess: res.thoughts };
                } catch (e) {
                    return chatGemini(question, context, history);
                }
            }
            return chatGemini(question, context, history);
        },

        planQuery: async (question: string): Promise<AgentPlan> => {
            const availableMetrics = metricService.getMetrics().map(m => m.id).join(', ');

            const prompt = `
            Act as the DataOS Kernel Scheduler.
            User Input: "${question}"
            
            Available Agents:
            1. "data_engineer": Can 'run_sql' (DuckDB dialect) or 'get_schema'.
            2. "analyst": Can 'calculate_metric'. Available Metrics: [${availableMetrics}]

            Goal: Convert user input into a deterministic execution plan.
            
            Rules:
            - If user asks for a specific metric (revenue, churn), use 'analyst'.
            - If user asks for raw data or custom grouping, use 'data_engineer' with SQL.
            - SQL must be safe (SELECT only).
            
            Return JSON:
            {
                "id": "${Date.now()}",
                "goal": "Explain the goal",
                "steps": [
                    { "agentId": "analyst", "intent": "calculate_metric", "params": { "metricId": "total_revenue" }, "reasoning": "User asked for revenue" }
                ],
                "status": "pending"
            }
            `;

            if (config.provider === 'ollama') {
                try {
                    return await callOllama(prompt, config);
                } catch (e) {
                    console.error("Planner Failed (Ollama)", e);
                }
            }

            // Fallback Heuristic Planner (for testing without LLM)
            const lowerQ = question.toLowerCase();
            const steps: any[] = [];

            if (lowerQ.includes('revenue')) {
                steps.push({ agentId: 'analyst', intent: 'calculate_metric', params: { metricId: 'total_revenue' }, reasoning: 'Keyword match: revenue' });
            } else if (lowerQ.includes('satisfaction')) {
                steps.push({ agentId: 'analyst', intent: 'calculate_metric', params: { metricId: 'avg_satisfaction' }, reasoning: 'Keyword match: satisfaction' });
            } else if (lowerQ.includes('volume') || lowerQ.includes('units')) {
                steps.push({ agentId: 'analyst', intent: 'calculate_metric', params: { metricId: 'sales_volume' }, reasoning: 'Keyword match: volume' });
            }

            if (steps.length > 0) {
                return {
                    id: `heuristic_${Date.now()}`,
                    goal: 'Heuristic Execution Plan',
                    steps: steps,
                    status: 'pending'
                };
            }

            return {
                id: 'fallback_plan',
                goal: 'Fallback Execution: No matching keywords found',
                steps: [],
                status: 'failed'
            };
        }
    };
};
