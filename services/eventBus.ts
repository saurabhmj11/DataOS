/**
 * Copyright (c) 2024. Designed and Developed by Saurabh Lokhande.
 */

type EventCallback = (payload: any) => void;

export type SystemEventType =
    | 'FILE_CREATED'
    | 'FILE_UPDATED'
    | 'FILE_DELETED'
    | 'JOB_CREATED'
    | 'JOB_STARTED'
    | 'JOB_PROGRESS'
    | 'JOB_COMPLETED'
    | 'JOB_FAILED'
    | 'AGENT_MESSAGE'
    | 'SYSTEM_ALERT';

export interface SystemEvent {
    type: SystemEventType;
    payload: any;
    timestamp: number;
    source: string;
}

export class EventBus {
    private static instance: EventBus;
    private listeners: Map<SystemEventType, EventCallback[]> = new Map();
    private history: SystemEvent[] = [];

    private constructor() { }

    public static getInstance(): EventBus {
        if (!EventBus.instance) {
            EventBus.instance = new EventBus();
        }
        return EventBus.instance;
    }

    public subscribe(eventType: SystemEventType, callback: EventCallback): () => void {
        if (!this.listeners.has(eventType)) {
            this.listeners.set(eventType, []);
        }
        this.listeners.get(eventType)?.push(callback);

        console.log(`[EventBus] Subscribed to ${eventType}`);

        // Return unsubscribe function
        return () => {
            const callbacks = this.listeners.get(eventType);
            if (callbacks) {
                this.listeners.set(eventType, callbacks.filter(cb => cb !== callback));
            }
        };
    }

    public publish(eventType: SystemEventType, payload: any, source: string = 'System') {
        const event: SystemEvent = {
            type: eventType,
            payload,
            timestamp: Date.now(),
            source
        };

        this.history.push(event);
        if (this.history.length > 1000) this.history.shift(); // Keep last 1000 events

        console.log(`[EventBus] ${source} -> ${eventType}`, payload);

        const callbacks = this.listeners.get(eventType);
        if (callbacks) {
            callbacks.forEach(cb => {
                try {
                    cb(payload);
                } catch (e) {
                    console.error(`Error in event listener for ${eventType}`, e);
                }
            });
        }
    }

    public getHistory(limit: number = 50): SystemEvent[] {
        return this.history.slice(-limit);
    }
}

export const eventBus = EventBus.getInstance();
