import { plannedProvider } from './planned-stub';

export const nutritionix = plannedProvider({
  slug: 'nutritionix',
  name: 'Nutritionix',
  description: 'Ernährung via Natural-Language-API',
  auth: 'api-key',
  capabilities: ['nutrition'],
  brandColor: '#6aba5c',
});
