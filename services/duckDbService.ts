/**
 * Copyright (c) 2024. Designed and Developed by Saurabh Lokhande.
 */

import * as duckdb from '@duckdb/duckdb-wasm';
import duckdb_worker from '@duckdb/duckdb-wasm/dist/duckdb-browser-mvp.worker.js?url';
import duckdb_wasm from '@duckdb/duckdb-wasm/dist/duckdb-mvp.wasm?url';
import duckdb_worker_eh from '@duckdb/duckdb-wasm/dist/duckdb-browser-eh.worker.js?url';
import duckdb_wasm_eh from '@duckdb/duckdb-wasm/dist/duckdb-eh.wasm?url';

// Define bundles for DuckDB
const MANUAL_BUNDLES: duckdb.DuckDBBundles = {
    mvp: {
        mainModule: duckdb_wasm,
        mainWorker: duckdb_worker,
    },
    eh: {
        mainModule: duckdb_wasm_eh,
        mainWorker: duckdb_worker_eh,
    },
};
import { persistenceService } from './persistenceService';

export class DuckDBService {
    private static instance: DuckDBService;
    private db: duckdb.AsyncDuckDB | null = null;
    private conn: duckdb.AsyncDuckDBConnection | null = null;
    private isInitialized = false;

    private constructor() { }

    public static getInstance(): DuckDBService {
        if (!DuckDBService.instance) {
            DuckDBService.instance = new DuckDBService();
        }
        return DuckDBService.instance;
    }

    public async init(): Promise<void> {
        if (this.isInitialized) return;

        console.log('🦆 Initializing DuckDB...');
        try {
            // Select bundle
            const bundle = await duckdb.selectBundle(MANUAL_BUNDLES);

            // Create worker
            const worker = new Worker(bundle.mainWorker!);
            const logger = new duckdb.ConsoleLogger();

            // Instantiate DB
            this.db = new duckdb.AsyncDuckDB(logger, worker);
            await this.db.instantiate(bundle.mainModule, bundle.pthreadWorker);

            // Connect
            this.conn = await this.db.connect();
            this.isInitialized = true;
            console.log('🦆 DuckDB Ready!');

            // Auto-restore
            await this.restore();

        } catch (e) {
            console.error('DuckDB Initialization Failed', e);
            throw e;
        }
    }

    public async restore(): Promise<void> {
        const files = await persistenceService.getAllFiles();
        if (files.length === 0) return;

        console.log(`🦆 Restoring ${files.length} files from persistence...`);
        for (const file of files) {
            try {
                // Determine table name logic
                // If main.csv exists, it should be main
                // Otherwise use filename
                const tableName = file.name === 'main.csv' ? 'main' : file.name.replace('.csv', '');

                await this.db?.registerFileText(file.name, file.content);
                await this.conn?.query(`CREATE OR REPLACE TABLE ${tableName} AS SELECT * FROM read_csv_auto('${file.name}')`);
                console.log(`🦆 Restored ${file.name} -> ${tableName}`);
            } catch (e) {
                console.error(`Failed to restore ${file.name}`, e);
            }
        }
    }

    public async registerFile(fileName: string, csvContent: string): Promise<void> {
        if (!this.db) throw new Error("DB not initialized");
        await this.db.registerFileText(fileName, csvContent);

        // For initial load, we assume 'replace'
        const tableName = fileName.replace('.csv', '');
        await this.conn?.query(`CREATE OR REPLACE TABLE ${tableName} AS SELECT * FROM read_csv_auto('${fileName}')`);
        console.log(`🦆 Loaded (Replaced) ${fileName} into table '${tableName}'`);

        // Persist
        await persistenceService.saveFile(fileName, csvContent);
    }

    public async appendFile(targetTable: string, fileName: string, csvContent: string): Promise<void> {
        if (!this.db) throw new Error("DB not initialized");

        // Register as a unique temp file to avoid conflicts
        const tempFileName = `temp_${Date.now()}_${fileName}`;
        await this.db.registerFileText(tempFileName, csvContent);

        // Insert into existing table
        console.log(`🦆 Appending ${fileName} to '${targetTable}'...`);
        await this.conn?.query(`INSERT INTO ${targetTable} SELECT * FROM read_csv_auto('${tempFileName}')`);

        // Persist the fragment so it can be replayed?
        // For simple persistence, we might want to just append to the main file content, 
        // but that's expensive. For now, we'll log it but simple persistence assumes 'main.csv' is the source of truth.
        // TODO: Implement append persistence strategy.
    }

    public async query(sql: string): Promise<any[]> {
        if (!this.conn) throw new Error("DB not connected");

        console.log(`🦆 Executing: ${sql}`);
        const result = await this.conn.query(sql);
        return result.toArray().map((row: any) => row.toJSON());
    }

    public async getSchema(tableName: string): Promise<any[]> {
        return this.query(`DESCRIBE ${tableName}`);
    }
}

export const duckDb = DuckDBService.getInstance();
