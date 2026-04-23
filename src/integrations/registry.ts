import type { IntegrationProvider } from './types';
import { withings } from './providers/withings';
import { googleHealth } from './providers/google-health';
import { strava } from './providers/strava';
import { fitbit } from './providers/fitbit';
import { garmin } from './providers/garmin';
import { appleHealth } from './providers/apple-health';
import { whoop } from './providers/whoop';
import { oura } from './providers/oura';
import { nutritionix } from './providers/nutritionix';
import { myFitnessPal } from './providers/myfitnesspal';

export const providers: IntegrationProvider[] = [
  withings,
  googleHealth,
  strava,
  fitbit,
  garmin,
  appleHealth,
  whoop,
  oura,
  nutritionix,
  myFitnessPal,
];

export function getProvider(slug: string): IntegrationProvider | undefined {
  return providers.find((p) => p.slug === slug);
}

export function activeProviders(): IntegrationProvider[] {
  return providers.filter((p) => p.status === 'active');
}

export function plannedProviders(): IntegrationProvider[] {
  return providers.filter((p) => p.status === 'planned');
}

export function deprecatedProviders(): IntegrationProvider[] {
  return providers.filter((p) => p.status === 'deprecated');
}
