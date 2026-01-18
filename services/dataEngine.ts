/**
 * Copyright (c) 2024. Designed and Developed by Saurabh Lokhande.
 */

import { DataColumn, ProcessingLog } from "../types";

// Helper to parse CSV (simple implementation for demo)
export const parseCSV = (csv: string): any[] => {
  const lines = csv.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim());

  return lines.slice(1).map(line => {
    const values = line.split(',');
    const obj: any = {};
    headers.forEach((h, i) => {
      let val: any = values[i]?.trim();
      // Auto type inference
      if (val === 'null' || val === '') {
        val = null;
      } else if (val !== undefined && !isNaN(Number(val))) {
        val = Number(val);
      }
      obj[h] = val;
    });
    return obj;
  });
};

export const analyzeSchema = async (data: any[]): Promise<DataColumn[]> => {
  // FAST MODE: Reduced delay from 800ms to 100ms
  // FAST MODE: Delay removed

  if (data.length === 0) return [];
  const headers = Object.keys(data[0]);

  return headers.map(header => {
    const sample = data.map(d => d[header]);
    const definedValues = sample.filter(v => v !== null && v !== undefined);

    // Simple type detection
    const isNumber = definedValues.every(v => typeof v === 'number');
    const isDate = !isNumber && definedValues.every(v => !isNaN(Date.parse(v)));

    let type: DataColumn['type'] = 'string';
    if (isNumber) type = 'number';
    else if (isDate) type = 'date';
    else if (new Set(definedValues).size < definedValues.length * 0.2) type = 'category';

    return {
      name: header,
      type,
      missingCount: sample.length - definedValues.length,
      uniqueCount: new Set(definedValues).size,
      sampleValues: definedValues.slice(0, 3)
    };
  });
};

import { cacheService } from './cacheService';

export const cleanData = async (data: any[], columns: DataColumn[]): Promise<{ cleanedData: any[], logs: ProcessingLog[] }> => {
  // 1. Generate Hash for this request
  const requestHash = `clean_${data.length}_${columns.length}_${JSON.stringify(columns)}`;

  // 2. Check Cache
  const cached = await cacheService.getRequest(requestHash);
  if (cached) {
    return { ...cached, logs: [...cached.logs, { stage: 'Cache', message: 'Result served from memory cache', status: 'success' }] };
  }

  // FAST MODE: Reduced delay from 1200ms to 300ms
  // FAST MODE: Delay removed

  const logs: ProcessingLog[] = [];
  const cleaned = data.map(row => ({ ...row })); // Clone

  columns.forEach(col => {
    if (col.type === 'number') {
      // Impute mean
      const validValues = data.map(d => d[col.name]).filter(v => typeof v === 'number');
      const mean = validValues.reduce((a, b) => a + b, 0) / validValues.length;

      cleaned.forEach(row => {
        if (row[col.name] === null || row[col.name] === undefined) {
          row[col.name] = Math.round(mean * 100) / 100; // Round to 2 decimals
        }
      });

      if (col.missingCount > 0) {
        logs.push({
          stage: 'Cleaning Agent',
          message: `Imputed ${col.missingCount} missing values in '${col.name}' using Mean Strategy (${mean.toFixed(2)})`,
          timestamp: new Date(),
          status: 'success'
        });
      }
    }
  });

  return { cleanedData: cleaned, logs };
};