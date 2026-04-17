import { plannedProvider } from './planned-stub';

export const fitbit = plannedProvider({
  slug: 'fitbit',
  name: 'Fitbit',
  description: 'Schritte, Herzfrequenz, Schlaf, Gewicht',
  auth: 'oauth2',
  capabilities: ['steps', 'heart-rate', 'sleep', 'weight'],
  brandColor: '#00b0b9',
});
