/**
 * Copyright (c) 2024. Designed and Developed by Saurabh Lokhande.
 */

export interface Metric {
    id: string;
    name: string;
    description: string;
    sql: string; // The specific DuckDB SQL calculation
    format: 'currency' | 'percent' | 'number';
    trend_sql?: string; // Optional SQL for trend analysis
}

// Mock "YAML" definition state - in a real app this comes from a file
const DEFAULT_METRICS: Metric[] = [
    {
        id: 'total_revenue',
        name: 'Total Revenue',
        description: 'Sum of all sales orders',
        sql: "SELECT SUM(TRY_CAST(sales AS DOUBLE)) FROM main",
        format: 'currency'
    },
    {
        id: 'avg_satisfaction',
        name: 'Avg Satisfaction',
        description: 'Average Customer Score (1-10)',
        sql: "SELECT AVG(TRY_CAST(satisfaction AS DOUBLE)) FROM main",
        format: 'number'
    },
    {
        id: 'sales_volume',
        name: 'Total Volume',
        description: 'Total units sold globally',
        sql: "SELECT SUM(TRY_CAST(units AS INTEGER)) FROM main",
        format: 'number'
    }
];

import { duckDb } from './duckDbService';

export class MetricService {
    private metrics: Map<string, Metric> = new Map();

    constructor() {
        // Load defaults
        DEFAULT_METRICS.forEach(m => this.metrics.set(m.id, m));
    }

    public getMetrics(): Metric[] {
        return Array.from(this.metrics.values());
    }

    public getMetric(id: string): Metric | undefined {
        return this.metrics.get(id);
    }

    public async calculateMetric(id: string): Promise<number | null> {
        const metric = this.metrics.get(id);
        if (!metric) throw new Error(`Metric ${id} not found`);

        try {
            console.log(`📊 Semantic Layer: Calculating [${metric.name}]...`);
            const result = await duckDb.query(metric.sql);

            // Assume single value return for scalar metrics
            const val = Object.values(result[0])[0] as number;
            return val;
        } catch (e) {
            console.error(`Failed to calculate metric ${id}`, e);
            return null;
        }
    }
}

export const metricService = new MetricService();
