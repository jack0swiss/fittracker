import type {
  AuthMode,
  Capability,
  IntegrationProvider,
  ProviderStatus,
} from '../types';
import { NotImplementedError } from '../types';

interface StubSpec {
  slug: string;
  name: string;
  description: string;
  auth: AuthMode;
  capabilities: Capability[];
  brandColor: string;
  status?: ProviderStatus;
}

export function plannedProvider(spec: StubSpec): IntegrationProvider {
  return {
    slug: spec.slug,
    name: spec.name,
    description: spec.description,
    status: spec.status ?? 'planned',
    auth: spec.auth,
    capabilities: spec.capabilities,
    brandColor: spec.brandColor,
    async getConnection() {
      return { connected: false };
    },
    async connect() {
      throw new NotImplementedError(`${spec.name} ist geplant, aber noch nicht implementiert`);
    },
    async disconnect() {
      throw new NotImplementedError(`${spec.name} ist geplant, aber noch nicht implementiert`);
    },
    async sync() {
      throw new NotImplementedError(`${spec.name} ist geplant, aber noch nicht implementiert`);
    },
  };
}
