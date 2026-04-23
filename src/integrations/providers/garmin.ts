import { plannedProvider } from './planned-stub';

export const garmin = plannedProvider({
  slug: 'garmin',
  name: 'Garmin',
  description: 'Aktivitäten, HRV, Schlaf, Schritte',
  auth: 'oauth2',
  capabilities: ['activities', 'hrv', 'sleep', 'steps'],
  brandColor: '#007cc3',
});
