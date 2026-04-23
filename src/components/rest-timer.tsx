import { useEffect, useRef, useState } from 'react';
import { Pause, Play, SkipForward, TimerReset } from 'lucide-react';

interface RestTimerProps {
  seconds: number;
  onDone?: () => void;
  autoStartKey?: string | number;
}

export function RestTimer({ seconds, onDone, autoStartKey }: RestTimerProps) {
  const [remaining, setRemaining] = useState(seconds);
  const [running, setRunning] = useState(false);
  const notifiedRef = useRef(false);

  useEffect(() => {
    if (autoStartKey === undefined) return;
    setRemaining(seconds);
    setRunning(true);
    notifiedRef.current = false;
  }, [autoStartKey, seconds]);

  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => {
      setRemaining((r) => (r <= 1 ? 0 : r - 1));
    }, 1000);
    return () => window.clearInterval(id);
  }, [running]);

  useEffect(() => {
    if (remaining === 0 && running && !notifiedRef.current) {
      notifiedRef.current = true;
      setRunning(false);
      onDone?.();
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate?.([200, 100, 200]);
      }
    }
  }, [remaining, running, onDone]);

  const pct = seconds > 0 ? ((seconds - remaining) / seconds) * 100 : 100;
  const done = remaining === 0;

  return (
    <div className="rounded-lg border border-border bg-card p-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Pause
        </span>
        <span
          className={`font-mono text-lg tabular-nums ${done ? 'text-primary' : ''}`}
          aria-live="polite"
        >
          {formatMMSS(remaining)}
        </span>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full bg-primary transition-[width] duration-1000 ease-linear"
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="mt-3 flex items-center justify-end gap-2">
        <TimerButton
          label="Zurücksetzen"
          onClick={() => {
            setRemaining(seconds);
            notifiedRef.current = false;
          }}
        >
          <TimerReset className="h-4 w-4" />
        </TimerButton>
        <TimerButton
          label={running ? 'Pause' : 'Start'}
          onClick={() => setRunning((v) => !v)}
        >
          {running ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </TimerButton>
        <TimerButton
          label="Überspringen"
          onClick={() => {
            setRemaining(0);
            setRunning(false);
          }}
        >
          <SkipForward className="h-4 w-4" />
        </TimerButton>
      </div>
    </div>
  );
}

function TimerButton({
  children,
  onClick,
  label,
}: {
  children: React.ReactNode;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="flex h-9 w-9 items-center justify-center rounded-md border border-border text-muted-foreground hover:bg-accent hover:text-foreground"
    >
      {children}
    </button>
  );
}

function formatMMSS(total: number): string {
  const t = Math.max(0, total);
  const m = Math.floor(t / 60);
  const s = t % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}
