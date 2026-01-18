/**
 * Copyright (c) 2024. Designed and Developed by Saurabh Lokhande.
 */

export enum DatasetStatus {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SCHEMA_DETECT = 'SCHEMA_DETECT',
  CLEANING = 'CLEANING',
  QUALITY_CHECK = 'QUALITY_CHECK',
  INSIGHTS = 'INSIGHTS',
  VISUALIZATION = 'VISUALIZATION',
  READY = 'READY',
  ERROR = 'ERROR'
}

export type AppMode = 'CEO' | 'ANALYST';

export interface DataColumn {
  name: string;
  type: 'string' | 'number' | 'date' | 'boolean' | 'category';
  missingCount: number;
  uniqueCount: number;
  sampleValues: any[];
}

export interface DataStats {
  rowCount: number;
  memoryUsage: string;
  completeness: number; // 0-100
  columns: DataColumn[];
}

export interface InsightExplanation {
  technicalLogic: string; // SQL or code representation
  dataLineage: string[]; // Steps: Raw -> Clean -> Metric
  confidenceScore: number; // 0-1
  keyAssumptions: string[];
}

export interface RootCauseNode {
  id: string;
  label: string;      // e.g., "South Region"
  metric: string;     // e.g., "Revenue"
  value: string;      // e.g., "$45k"
  change: string;     // e.g., "-12%"
  status: 'good' | 'warning' | 'critical' | 'neutral';
  children?: RootCauseNode[];
}

export interface Insight {
  id: string;
  title: string;
  description: string;
  type: 'correlation' | 'trend' | 'outlier' | 'summary' | 'risk' | 'opportunity';
  score: number; // Importance score
  actionable?: boolean;
  explanation?: InsightExplanation;
  rootCause?: RootCauseNode; // The root of the drill-down tree
  simulation?: SimulationScenario; // "What-If" scenario for this insight
}

export interface SimulationParameter {
  id: string;
  label: string;      // e.g., "SaaS Pricing"
  defaultValue: number;
  currentValue: number;
  min: number;
  max: number;
  step: number;
  unit: string;       // e.g., "%", "$"
  impactMap: { targetMetricId: string; factor: number }[]; // Linear impact model
}

export interface SimulationScenario {
  id: string;
  title: string;      // e.g., "Aggressive Growth"
  description: string;
  parameters: SimulationParameter[];
}

// Duplicate types removed

export interface AnalysisResult {
  insights: Insight[];
  suggestedQuestions: string[];
  narrativeBrief?: string;
}

export interface HypothesisResult {
  hypothesis: string;
  confidence: number;
  impact: string;
  explanation: string;
  status: 'confirmed' | 'rejected' | 'inconclusive';
}

export interface ChartConfig {
  id: string;
  title: string;
  type: 'bar' | 'line' | 'pie' | 'scatter' | 'area';
  dataKeyX: string;
  dataKeyY: string | string[];
  description?: string;
}

export interface MCPTool {
  name: string;
  status: 'active' | 'idle' | 'error';
  description: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  relatedChart?: ChartConfig;
  chartData?: any[];
  isThinking?: boolean;
  thoughtProcess?: string[]; // For showcasing agent reasoning
}

export interface ProcessingLog {
  stage: string;
  message: string;
  timestamp: Date;
  status: 'info' | 'success' | 'warning';
}

export interface LineageNode {
  id: string;
  type: 'source' | 'transformation' | 'dataset' | 'dashboard';
  label: string;
  status: 'active' | 'error' | 'stale';
  lastUpdated: string;
  owner?: string;
}

export interface LineageEdge {
  source: string;
  target: string;
  animated?: boolean;
}

export interface DataVersion {
  id: string;
  timestamp: Date;
  author: string;
  message: string;
  type: 'init' | 'append' | 'replace' | 'restore';
  rowCount: number;
}