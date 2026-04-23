import { plannedProvider } from './planned-stub';

export const whoop = plannedProvider({
  slug: 'whoop',
  name: 'Whoop',
  description: 'HRV, Schlaf, Recovery',
  auth: 'oauth2',
  capabilities: ['hrv', 'sleep', 'recovery'],
  brandColor: '#000000',
});
