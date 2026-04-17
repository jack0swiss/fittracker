export type Capability =
  | 'weight'
  | 'body-composition'
  | 'heart-rate'
  | 'hrv'
  | 'steps'
  | 'sleep'
  | 'activities'
  | 'workouts'
  | 'nutrition'
  | 'blood-pressure'
  | 'spo2'
  | 'recovery';

export type ProviderStatus = 'active' | 'planned' | 'deprecated';

export type AuthMode = 'oauth2' | 'api-key' | 'companion-app' | 'none';

export interface ConnectionState {
  connected: boolean;
  lastSyncAt?: Date;
  accountLabel?: string;
  error?: string;
}

export interface SyncResult {
  imported: number;
  skipped: number;
  errors: Array<{ message: string; detail?: unknown }>;
}

export interface IntegrationProvider {
  slug: string;
  name: string;
  description: string;
  status: ProviderStatus;
  auth: AuthMode;
  capabilities: Capability[];
  brandColor: string;

  getConnection(): Promise<ConnectionState>;
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  sync(since?: Date): Promise<SyncResult>;
}

export class NotImplementedError extends Error {
  constructor(message = 'Not implemented in Phase 1') {
    super(message);
    this.name = 'NotImplementedError';
  }
}
