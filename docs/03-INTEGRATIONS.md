# 03 – INTEGRATIONS

Alle externen Datenquellen werden als **Provider** hinter einem einheitlichen
Interface gekapselt. Neue Provider brauchen nur eine Datei unter
`src/integrations/providers/<slug>.ts` und einen Eintrag in
`src/integrations/registry.ts` – keine Änderungen in Dashboard, Settings, Nav.

## IntegrationProvider-Interface

`src/integrations/types.ts`

```ts
export type Capability =
  | 'weight' | 'body-composition' | 'heart-rate' | 'hrv'
  | 'steps' | 'sleep' | 'activities' | 'workouts'
  | 'nutrition' | 'blood-pressure' | 'spo2';

export type ProviderStatus = 'active' | 'planned' | 'deprecated';

export type AuthMode = 'oauth2' | 'api-key' | 'companion-app' | 'none';

export interface ConnectionState {
  connected: boolean;
  lastSyncAt?: Date;
  accountLabel?: string;
  error?: string;
}

export interface SyncResult {
  imported: number;
  skipped: number;
  errors: Array<{ message: string; detail?: unknown }>;
}

export interface IntegrationProvider {
  slug: string;               // 'withings', 'google-health', …
  name: string;               // „Withings"
  description: string;        // UI-Text, Deutsch
  status: ProviderStatus;
  auth: AuthMode;
  capabilities: Capability[];
  brandColor: string;         // Tailwind-kompatibler hex

  // Phase 2+
  getConnection(): Promise<ConnectionState>;
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  sync(since?: Date): Promise<SyncResult>;
}
```

## Registry

`src/integrations/registry.ts`

```ts
import type { IntegrationProvider } from './types';
import { withings } from './providers/withings';
import { googleHealth } from './providers/google-health';
// planned – Stubs nur mit Metadaten:
import { strava } from './providers/strava';
// … etc.

export const providers: IntegrationProvider[] = [
  withings, googleHealth,
  strava, fitbit, garmin, appleHealth,
  whoop, oura,
  nutritionix, myFitnessPal,
];

export function active()  { return providers.filter(p => p.status === 'active'); }
export function planned() { return providers.filter(p => p.status === 'planned'); }
```

## Die 10 Provider

| Slug            | Status     | Auth            | Capabilities                                     |
|-----------------|------------|-----------------|--------------------------------------------------|
| withings        | active     | oauth2          | weight, body-composition, sleep, heart-rate, bp  |
| google-health   | active     | companion-app   | steps, heart-rate, sleep, workouts, weight       |
| strava          | planned    | oauth2          | activities                                       |
| fitbit          | planned    | oauth2          | steps, heart-rate, sleep, weight                 |
| garmin          | planned    | oauth2          | activities, hrv, sleep, steps                    |
| apple-health    | planned    | companion-app   | steps, heart-rate, sleep, workouts, weight       |
| whoop           | planned    | oauth2          | hrv, sleep, recovery                             |
| oura            | planned    | oauth2          | hrv, sleep, spo2                                 |
| nutritionix     | planned    | api-key         | nutrition                                        |
| myfitnesspal    | deprecated | (none)          | nutrition – offizielle API seit 2020 tot         |

## Withings-OAuth-Flow (Phase 2)

1. User klickt „Verbinden" → Client ruft Edge Function `withings-authorize` auf
2. Edge Function erzeugt `state`, speichert in `oauth_states` Tabelle, redirect
   zu `account.withings.com/oauth2_user/authorize2?…&state=…`
3. Withings redirected zurück an Edge Function `withings-callback`
4. Tokens werden in `integration_tokens` (RLS!) gespeichert, nie im Client
5. `sync()` ruft Edge Function `withings-sync` auf, die mit dem Token die
   Withings-API pollt und in `body_measurements` schreibt

## Google Health Connect

Web-API existiert nicht. Strategie: **Companion-App** (separates Android-Modul in
Phase 4+), die lokal Health Connect ausliest und per Supabase-Client zu
`body_measurements` synct. Bis dahin Stub mit Hinweis-Text.

## Implementation-Checkliste für neue Provider

1. `src/integrations/providers/<slug>.ts` anlegen, `IntegrationProvider`-Shape
2. In `registry.ts` importieren + zur `providers`-Liste hinzufügen
3. Falls OAuth: Edge Functions `<slug>-authorize` / `<slug>-callback` / `<slug>-sync`
4. Secrets in Supabase Vault (`<SLUG>_CLIENT_ID`, `<SLUG>_CLIENT_SECRET`)
5. `source`-Value im DB-Check-Constraint ist bereits vorhanden – keine Migration nötig
6. Status auf `'active'` setzen

Aufwand pro neuem Provider mit OAuth2: ~4 h (Studie → Edge Functions → Sync-Mapping).

## Notiz zu MyFitnessPal

Die offizielle API ist seit 2020 tot. Wer Food-Logging will, nimmt stattdessen
**Nutritionix** (Natural-Language-API, gute DE-Abdeckung). MyFitnessPal bleibt als
`deprecated`-Eintrag im Registry für Sichtbarkeit – die Card erklärt den Grund.
