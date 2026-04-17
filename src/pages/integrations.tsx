import { Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import {
  activeProviders,
  deprecatedProviders,
  plannedProviders,
} from '@/integrations/registry';
import type { IntegrationProvider } from '@/integrations/types';
import { cn } from '@/lib/utils';

export function IntegrationsPage() {
  const active = activeProviders();
  const planned = plannedProviders();
  const deprecated = deprecatedProviders();

  return (
    <div className="space-y-8">
      <header>
        <Link
          to="/settings"
          className="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" />
          Einstellungen
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight">Integrationen</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Verbinde Tracker und Waagen, damit FitTracker deine Werte automatisch holt.
        </p>
      </header>

      <Section title="Aktiv" items={active} variant="active" />
      <Section title="Geplant" items={planned} variant="planned" />
      {deprecated.length > 0 && (
        <Section title="Nicht mehr unterstützt" items={deprecated} variant="deprecated" />
      )}
    </div>
  );
}

interface SectionProps {
  title: string;
  items: IntegrationProvider[];
  variant: 'active' | 'planned' | 'deprecated';
}

function Section({ title, items, variant }: SectionProps) {
  if (items.length === 0) return null;
  return (
    <section className="space-y-3">
      <h2 className="text-sm font-medium text-muted-foreground">{title}</h2>
      <div className="space-y-2">
        {items.map((p) => (
          <ProviderCard key={p.slug} provider={p} variant={variant} />
        ))}
      </div>
    </section>
  );
}

interface ProviderCardProps {
  provider: IntegrationProvider;
  variant: 'active' | 'planned' | 'deprecated';
}

function ProviderCard({ provider, variant }: ProviderCardProps) {
  const disabled = variant !== 'active';
  return (
    <article
      className={cn(
        'rounded-lg border border-border bg-card p-4 transition',
        variant === 'planned' && 'opacity-60',
        variant === 'deprecated' && 'opacity-50',
      )}
    >
      <div className="flex items-start gap-3">
        <span
          aria-hidden
          className="mt-1 inline-block h-2.5 w-2.5 flex-none rounded-full"
          style={{ backgroundColor: provider.brandColor }}
        />
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-medium">{provider.name}</h3>
            {variant === 'deprecated' && (
              <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                deprecated
              </span>
            )}
          </div>
          <p className="mt-0.5 text-sm text-muted-foreground">{provider.description}</p>
          <div className="mt-2 flex flex-wrap gap-1">
            {provider.capabilities.map((cap) => (
              <span
                key={cap}
                className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground"
              >
                {cap}
              </span>
            ))}
          </div>
        </div>
        <button
          type="button"
          disabled={disabled}
          className={cn(
            'ml-auto rounded-md border border-border bg-background px-3 py-1.5 text-xs font-medium',
            !disabled && 'hover:bg-accent',
            disabled && 'cursor-not-allowed',
          )}
        >
          {variant === 'active' && 'Verbinden'}
          {variant === 'planned' && 'Bald verfügbar'}
          {variant === 'deprecated' && '—'}
        </button>
      </div>
    </article>
  );
}
