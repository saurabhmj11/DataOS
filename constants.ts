/**
 * Copyright (c) 2024. Designed and Developed by Saurabh Lokhande.
 */

import { MCPTool } from './types';

export const MOCK_CSV_DATA = `date,region,product,sales,units,satisfaction
2024-01-01,North,SaaS Basic,1200,12,4.5
2024-01-02,North,SaaS Pro,3400,8,4.8
2024-01-02,South,SaaS Basic,800,8,3.9
2024-01-03,East,SaaS Enterprise,8500,2,5.0
2024-01-04,West,SaaS Basic,1100,11,4.2
2024-01-05,North,SaaS Pro,3200,7,4.6
2024-01-06,South,SaaS Enterprise,12000,3,4.9
2024-01-07,East,SaaS Basic,950,9,4.0
2024-01-08,West,SaaS Pro,3100,7,4.3
2024-01-09,North,SaaS Basic,1300,13,4.4
2024-01-10,South,SaaS Enterprise,null,2,4.8
2024-01-11,East,SaaS Pro,3600,8,4.7
2024-01-12,West,SaaS Basic,1050,10,4.1
2024-01-13,North,SaaS Pro,3300,null,4.5
2024-01-14,South,SaaS Basic,850,8,3.8`;

export const AGENTS: MCPTool[] = [
  { name: 'Schema Agent', status: 'idle', description: 'Infers types and structure' },
  { name: 'Cleaning Agent', status: 'idle', description: 'Imputes missing values & fixes types' },
  { name: 'Quality Agent', status: 'idle', description: 'Detects outliers and drift' },
  { name: 'Insight Agent', status: 'idle', description: 'Statistical analysis & trends' },
  { name: 'Viz Agent', status: 'idle', description: 'Generates dashboard layouts' },
];

export const MODEL_NAME = "gemini-3-flash-preview";
