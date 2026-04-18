import { NavLink, Outlet } from 'react-router-dom';
import {
  Dumbbell,
  Home,
  LineChart,
  BookOpen,
  MoreHorizontal,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { InstallPrompt } from '@/components/install-prompt';

interface NavItem {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  { to: '/', label: 'Dashboard', icon: Home },
  { to: '/workout', label: 'Workout', icon: Dumbbell },
  { to: '/exercises', label: 'Übungen', icon: BookOpen },
  { to: '/progress', label: 'Fortschritt', icon: LineChart },
  { to: '/settings', label: 'Mehr', icon: MoreHorizontal },
];

export function Layout() {
  return (
    <div className="flex min-h-full flex-col lg:flex-row">
      <aside aria-label="Seitennavigation" className="hidden border-r border-border lg:flex lg:w-60 lg:flex-col lg:gap-2 lg:p-4">
        <div className="mb-6 px-2 text-lg font-semibold tracking-tight">
          FitTracker
        </div>
        <nav className="flex flex-col gap-1">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium',
                  'hover:bg-accent hover:text-accent-foreground',
                  isActive && 'bg-accent text-accent-foreground',
                )
              }
            >
              <Icon className="h-4 w-4" />
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <main className="flex-1 pb-20 lg:pb-0">
        <div className="mx-auto max-w-3xl space-y-4 px-4 pt-6 lg:pt-10">
          <InstallPrompt />
          <Outlet />
        </div>
      </main>

      <nav
        aria-label="Hauptnavigation"
        className="safe-bottom fixed inset-x-0 bottom-0 z-10 border-t border-border bg-background/95 backdrop-blur lg:hidden"
      >
        <ul className="grid grid-cols-5">
          {navItems.map(({ to, label, icon: Icon }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  cn(
                    'flex h-14 flex-col items-center justify-center gap-0.5 text-[11px]',
                    'text-muted-foreground',
                    isActive && 'text-foreground',
                  )
                }
              >
                <Icon className="h-5 w-5" />
                {label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
