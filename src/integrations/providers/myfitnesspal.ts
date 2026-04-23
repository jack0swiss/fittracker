import { plannedProvider } from './planned-stub';

export const myFitnessPal = plannedProvider({
  slug: 'myfitnesspal',
  name: 'MyFitnessPal',
  description: 'Offizielle API seit 2020 eingestellt – nutze Nutritionix',
  auth: 'none',
  capabilities: ['nutrition'],
  brandColor: '#0066ee',
  status: 'deprecated',
});
