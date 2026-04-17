import { plannedProvider } from './planned-stub';

export const oura = plannedProvider({
  slug: 'oura',
  name: 'Oura',
  description: 'Ring-Tracking: HRV, Schlaf, SpO2',
  auth: 'oauth2',
  capabilities: ['hrv', 'sleep', 'spo2'],
  brandColor: '#222222',
});
