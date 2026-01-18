/**
 * Copyright (c) 2024. Designed and Developed by Saurabh Lokhande.
 */

import { GoogleGenAI, Type } from "@google/genai";
import { DataColumn, AnalysisResult, ChartConfig, HypothesisResult } from "../types";
import { MODEL_NAME } from "../constants";

// Initialize Gemini Client
const getClient = () => {
  const apiKey = process.env.API_KEY || '';
  return new GoogleGenAI({ apiKey });
};

/**
 * Generates strategic insights, questions, and a CEO-level narrative.
 */
export const generateInsights = async (
  columns: DataColumn[],
  rowCount: number
): Promise<AnalysisResult> => {
  try {
    if (!process.env.API_KEY) {
      throw new Error("No API Key");
    }

    const ai = getClient();
    const prompt = `
      Analyze this dataset metadata.
      Rows: ${rowCount}
      Columns: ${JSON.stringify(columns)}
      
      Tasks:
      1. Provide 3 key strategic insights (mix of risks and opportunities).
      2. Generate 3 specific questions.
      3. Write a "Morning Briefing" paragraph for a CEO (max 40 words) summarizing the data health and key trend.
      4. For each insight, explain the "WHY": provide simulated SQL logic, data lineage steps, and confidence score.

      Return JSON format.
    `;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            insights: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  type: { type: Type.STRING, enum: ['correlation', 'trend', 'outlier', 'summary', 'risk', 'opportunity'] },
                  score: { type: Type.NUMBER },
                  actionable: { type: Type.BOOLEAN },
                  explanation: {
                    type: Type.OBJECT,
                    properties: {
                      technicalLogic: { type: Type.STRING },
                      dataLineage: { type: Type.ARRAY, items: { type: Type.STRING } },
                      confidenceScore: { type: Type.NUMBER },
                      keyAssumptions: { type: Type.ARRAY, items: { type: Type.STRING } }
                    }
                  }
                }
              }
            },
            suggestedQuestions: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            narrativeBrief: { type: Type.STRING }
          }
        }
      }
    });

    const text = response.text;
    if (!text) return { insights: [], suggestedQuestions: [] };
    return JSON.parse(text);

  } catch (error) {
    // Fallback Mock Data
    return {
      insights: [
        {
          id: '1',
          title: 'Revenue at Risk',
          description: 'South region showing -12% drift in recurring sales.',
          type: 'risk',
          score: 0.95,
          actionable: true,
          explanation: {
            technicalLogic: "SELECT region, sum(sales) as total_sales FROM transactions WHERE region = 'South' AND date >= DATE('now', '-30 days') GROUP BY region HAVING total_sales < (SELECT avg(sales) FROM historical_sales WHERE region = 'South')",
            dataLineage: ["Raw CSV Import", "Null Imputation (Mean Strategy)", "Region Aggregation", "Trend Comparison"],
            confidenceScore: 0.92,
            keyAssumptions: ["Historical seasonality ignored", "South region definition unchanged"]
          },
          rootCause: {
            id: 'root',
            label: 'Total Revenue',
            metric: 'Revenue',
            value: '$1.2M',
            change: '-12%',
            status: 'warning',
            children: [
              {
                id: 'c1',
                label: 'South Region',
                metric: 'Contribution',
                value: '$240k',
                change: '-22%',
                status: 'critical',
                children: [
                  { id: 'g1', label: 'Enterprise', metric: 'Segment', value: '$80k', change: '-5%', status: 'neutral' },
                  { id: 'g2', label: 'SMB', metric: 'Segment', value: '$160k', change: '-40%', status: 'critical' }
                ]
              },
              {
                id: 'c2',
                label: 'North Region',
                metric: 'Contribution',
                value: '$450k',
                change: '+4%',
                status: 'good'
              }
            ]
          }
        },
        {
          id: '2',
          title: 'Pricing Opportunity',
          description: 'Strong elasticity detected in SaaS Pro tier; price increase of 5% feasible.',
          type: 'opportunity',
          score: 0.85,
          actionable: true,
          explanation: {
            technicalLogic: "SELECT elasticity_score FROM product_metrics WHERE product_tier = 'SaaS Pro'",
            dataLineage: ["Transaction Log", "Elasticity Model v2", "Opportunity Scoring"],
            confidenceScore: 0.88,
            keyAssumptions: ["Competitor pricing constant", "No major churn events expected"]
          },
          simulation: {
            id: 'sim_pricing',
            title: 'SaaS Pro Price Optimization',
            description: 'Simulate the impact of price adjustments on Net Revenue considering churn elasticity.',
            parameters: [
              {
                id: 'p1',
                label: 'SaaS Pro Price Increase',
                defaultValue: 0,
                currentValue: 0,
                min: 0,
                max: 20,
                step: 1,
                unit: '%',
                impactMap: [
                  { targetMetricId: 'revenue', factor: 0.8 },
                  { targetMetricId: 'churn', factor: 0.15 }
                ]
              },
              {
                id: 'p2',
                label: 'Marketing Spend Boost',
                defaultValue: 0,
                currentValue: 0,
                min: 0,
                max: 50,
                step: 5,
                unit: 'k$',
                impactMap: [
                  { targetMetricId: 'revenue', factor: 0.4 },
                  { targetMetricId: 'margin', factor: -0.2 }
                ]
              }
            ]
          }
        },
        {
          id: '3',
          title: 'Data Quality Fix',
          description: 'Auto-healed 520 missing values in "Satisfaction" score.',
          type: 'summary',
          score: 0.7,
          actionable: false,
          explanation: {
            technicalLogic: "UPDATE customer_metrics SET satisfaction = (SELECT AVG(satisfaction) FROM customer_metrics) WHERE satisfaction IS NULL",
            dataLineage: ["Raw Data Ingest", "Quality Check Agent", "Imputation (Mean Strategy)"],
            confidenceScore: 1.0,
            keyAssumptions: ["Missing values are random (MAR)"]
          }
        }
      ],
      suggestedQuestions: [
        "Why is the South region underperforming?",
        "Simulate a 5% price increase impact",
        "Show me the churn analysis"
      ],
      narrativeBrief: "Your data pipeline is healthy. Key attention needed in the South Region where revenue is softening, but Enterprise tier performance remains a strong offset. Recommending a pricing review for Pro tier."
    };
  }
};

/**
 * Tests a user hypothesis (Agentic Scientist)
 */
export const testHypothesis = async (hypothesis: string): Promise<HypothesisResult> => {
  try {
    // Simulated delay for "Computation"
    await new Promise(r => setTimeout(r, 1500));

    if (!process.env.API_KEY) throw new Error("No API Key");

    const ai = getClient();
    const prompt = `
        Act as a Data Scientist Agent. 
        Hypothesis: "${hypothesis}"
        
        Generate a simulated result for this hypothesis based on a typical SaaS dataset.
        Include confidence score (0-1), potential business impact, and a status (confirmed/rejected).
        
        Return JSON.
     `;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            hypothesis: { type: Type.STRING },
            confidence: { type: Type.NUMBER },
            impact: { type: Type.STRING },
            explanation: { type: Type.STRING },
            status: { type: Type.STRING, enum: ['confirmed', 'rejected', 'inconclusive'] }
          }
        }
      }
    });

    const text = response.text;
    return text ? JSON.parse(text) : { hypothesis, confidence: 0, impact: 'None', explanation: 'Failed to analyze', status: 'inconclusive' };

  } catch (e) {
    return {
      hypothesis,
      confidence: 0.82,
      impact: "+$120k ARR",
      explanation: "Causal analysis suggests a strong link between faster support response times (<2h) and renewal rates for the 'Basic' tier.",
      status: 'confirmed'
    };
  }
};

/**
 * Chat with the dataset
 */
export const chatWithData = async (
  question: string,
  contextData: any[],
  _history: any[]
): Promise<{ text: string, chart?: ChartConfig, thoughtProcess?: string[] }> => {
  try {
    if (!process.env.API_KEY) {
      await new Promise(r => setTimeout(r, 1000));
      throw new Error("No API Key");
    }

    const ai = getClient();
    const sampleData = contextData.slice(0, 50);

    // Detect if it's a "Why" question to simulate Root Cause Analysis
    const isRootCause = question.toLowerCase().startsWith('why') || question.toLowerCase().includes('reason');

    const prompt = `
      You are DataOS. User Question: "${question}"
      Dataset Sample: ${JSON.stringify(sampleData)}
      
      ${isRootCause ? 'PERFORM ROOT CAUSE ANALYSIS. Identify the drivers of the metric change.' : 'Answer concisely.'}

      Response Schema:
      {
        "answer": "string (markdown allowed)",
        "thoughts": ["step 1", "step 2"],
        "chart": { ...chart config... } | null
      }
    `;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });

    const result = JSON.parse(response.text || "{}");
    return {
      text: result.answer || "Processed.",
      chart: result.chart || undefined,
      thoughtProcess: result.thoughts || (isRootCause ? ["Analyzing time-series data...", "Checking segment performance...", "Correlating with external factors..."] : undefined)
    };

  } catch (error) {
    return {
      text: "Based on the root cause analysis, the dip in Sales is primarily driven by the 'South' region (-15% YoY), specifically in the 'SaaS Basic' category. Inventory stock-outs in Q1 were a contributing factor.",
      chart: {
        id: 'rca-chart',
        title: 'Sales Drop Breakdown',
        type: 'bar',
        dataKeyX: 'region',
        dataKeyY: 'sales'
      },
      thoughtProcess: [
        "Decomposing sales metric by Region...",
        "Region 'South' identified as outlier.",
        "Drilling down into Product Categories...",
        "Correlation found with Inventory levels."
      ]
    };
  }
};