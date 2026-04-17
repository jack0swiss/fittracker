import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { useTheme } from '@/components/theme-provider';
import { cn } from '@/lib/utils';

type ThemeOption = 'system' | 'light' | 'dark';

const themeOptions: Array<{ value: ThemeOption; label: string }> = [
  { value: 'system', label: 'System' },
  { value: 'light', label: 'Hell' },
  { value: 'dark', label: 'Dunkel' },
];

export function SettingsPage() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold tracking-tight">Einstellungen</h1>

      <section className="space-y-3">
        <h2 className="text-sm font-medium text-muted-foreground">Darstellung</h2>
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="text-sm font-medium">Theme</div>
          <div
            role="radiogroup"
            aria-label="Theme-Auswahl"
            className="mt-3 inline-flex rounded-md border border-border bg-background p-0.5"
          >
            {themeOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                role="radio"
                aria-checked={theme === opt.value}
                onClick={() => setTheme(opt.value)}
                className={cn(
                  'rounded px-3 py-1.5 text-sm transition',
                  theme === opt.value
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
        <div className="rounded-lg border border-border bg-card p-4 text-sm">
          <Row label="Sprache" value="Deutsch (Schweiz)" />
          <Row label="Einheiten" value="kg · km" />
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-medium text-muted-foreground">Training</h2>
        <div className="rounded-lg border border-border bg-card p-4 text-sm">
          <Row label="RPE-Skala" value="1–10 (Tuchscherer)" />
          <Row label="Pause Default" value="2:30" />
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-medium text-muted-foreground">Mehr</h2>
        <div className="divide-y divide-border rounded-lg border border-border bg-card text-sm">
          <NavRow to="/settings/integrations" label="Integrationen" />
          <NavRow to="/plans" label="Pläne" />
          <NavRow to="/body" label="Körperwerte" />
        </div>
      </section>

      <p className="text-xs text-muted-foreground">FitTracker 0.1.0</p>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2 first:pt-0 last:pb-0">
      <span className="text-muted-foreground">{label}</span>
      <span>{value}</span>
    </div>
  );
}

function NavRow({ to, label }: { to: string; label: string }) {
  return (
    <Link
      to={to}
      className="flex items-center justify-between px-4 py-3 hover:bg-accent"
    >
      <span>{label}</span>
      <ChevronRight className="h-4 w-4 text-muted-foreground" />
    </Link>
  );
}
