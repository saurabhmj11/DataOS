/**
 * Copyright (c) 2024. Designed and Developed by Saurabh Lokhande.
 */

import { cacheService } from './cacheService';
import { duckDb } from './duckDbService';

export interface QueryPlan {
    source: 'cache' | 'compute';
    estimatedCost: number;
    query: string;
}

export class QueryOptimizer {
    private static instance: QueryOptimizer;

    private constructor() { }

    public static getInstance(): QueryOptimizer {
        if (!QueryOptimizer.instance) {
            QueryOptimizer.instance = new QueryOptimizer();
        }
        return QueryOptimizer.instance;
    }

    /**
     * Hash the query to create a cache key.
     * Simple numeric hash for demo purposes.
     */
    private hashQuery(query: string): string {
        let hash = 0, i, chr;
        if (query.length === 0) return hash.toString();
        for (i = 0; i < query.length; i++) {
            chr = query.charCodeAt(i);
            hash = ((hash << 5) - hash) + chr;
            hash |= 0; // Convert to 32bit integer
        }
        return "q_" + hash.toString();
    }

    /**
     * Analyze query and decide execution path.
     */
    public async optimize(query: string): Promise<QueryPlan> {
        const hash = this.hashQuery(query);
        const cached = await cacheService.getRequest(hash);

        // Simple heuristic: read queries are cheaper than writes
        const isWrite = query.toLowerCase().includes('create') || query.toLowerCase().includes('insert');
        const estimatedCost = isWrite ? 500 : 50;

        if (cached) {
            console.log(`⚡ Optimizer: Serving query from CACHE [${hash}]`);
            return { source: 'cache', estimatedCost: 0, query };
        }

        console.log(`⚙️ Optimizer: Routing to COMPUTE [DuckDB]`);
        return { source: 'compute', estimatedCost, query };
    }

    /**
     * Explain the query execution plan using DuckDB's EXPLAIN.
     */
    public async explain(query: string): Promise<string> {
        try {
            // DuckDB EXPLAIN returns a text representation of the plan
            const result = await duckDb.query(`EXPLAIN ${query}`);
            if (result && result.length > 0) {
                // The result is usually in a column like 'explain_key' or similar
                const firstRow = result[0];
                const key = Object.keys(firstRow)[0];
                return firstRow[key] as string;
            }
            return "No explanation available.";
        } catch (e: any) {
            return `Failed to explain query: ${e.message}`;
        }
    }

    /**
     * Execute the query using the optimized plan.
     */
    public async execute(query: string): Promise<any> {
        const plan = await this.optimize(query);
        const hash = this.hashQuery(query);

        if (plan.source === 'cache') {
            return await cacheService.getRequest(hash);
        } else {
            const result = await duckDb.query(query);
            // Cache the result for future use (TTL 1 hour default)
            await cacheService.setRequest(hash, result);
            return result;
        }
    }
}

export const queryOptimizer = QueryOptimizer.getInstance();
