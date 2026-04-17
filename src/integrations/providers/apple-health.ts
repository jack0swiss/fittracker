import { plannedProvider } from './planned-stub';

export const appleHealth = plannedProvider({
  slug: 'apple-health',
  name: 'Apple Health',
  description: 'iOS-Gesundheitsdaten (via Companion-App)',
  auth: 'companion-app',
  capabilities: ['steps', 'heart-rate', 'sleep', 'workouts', 'weight'],
  brandColor: '#ff3b30',
});
