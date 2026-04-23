import { plannedProvider } from './planned-stub';

export const strava = plannedProvider({
  slug: 'strava',
  name: 'Strava',
  description: 'Laufen, Radfahren, andere Aktivitäten',
  auth: 'oauth2',
  capabilities: ['activities'],
  brandColor: '#fc4c02',
});
