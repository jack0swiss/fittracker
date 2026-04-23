import type { IntegrationProvider } from '../types';
import { NotImplementedError } from '../types';

export const googleHealth: IntegrationProvider = {
  slug: 'google-health',
  name: 'Google Health Connect',
  description: 'Schritte, Herzfrequenz, Schlaf, Workouts (via Companion-App)',
  status: 'active',
  auth: 'companion-app',
  capabilities: ['steps', 'heart-rate', 'sleep', 'workouts', 'weight'],
  brandColor: '#34a853',

  async getConnection() {
    return { connected: false };
  },
  async connect() {
    throw new NotImplementedError('Health Connect Companion-App kommt in Phase 4');
  },
  async disconnect() {
    throw new NotImplementedError('Health Connect Companion-App kommt in Phase 4');
  },
  async sync() {
    throw new NotImplementedError('Health Connect Companion-App kommt in Phase 4');
  },
};
