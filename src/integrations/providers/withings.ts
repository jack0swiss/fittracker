import type { IntegrationProvider } from '../types';
import { NotImplementedError } from '../types';

export const withings: IntegrationProvider = {
  slug: 'withings',
  name: 'Withings',
  description: 'Waage, Schlaf, Herzfrequenz, Blutdruck',
  status: 'active',
  auth: 'oauth2',
  capabilities: ['weight', 'body-composition', 'sleep', 'heart-rate', 'blood-pressure'],
  brandColor: '#00b5e2',

  async getConnection() {
    return { connected: false };
  },
  async connect() {
    throw new NotImplementedError('Withings OAuth kommt in Phase 2');
  },
  async disconnect() {
    throw new NotImplementedError('Withings OAuth kommt in Phase 2');
  },
  async sync() {
    throw new NotImplementedError('Withings Sync kommt in Phase 2');
  },
};
