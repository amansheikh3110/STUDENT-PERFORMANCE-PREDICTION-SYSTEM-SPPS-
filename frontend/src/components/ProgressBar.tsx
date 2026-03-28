import { useMemo } from 'react';

interface ProgressBarProps {
  value: number;
  max?: number;
  label?: string;
  showValue?: boolean;
  color?: 'red' | 'yellow' | 'green' | 'blue' | 'auto';
  size?: 'sm' | 'md';
}

export default function ProgressBar({ value, max = 100, label, showValue = true, color = 'auto', size = 'md' }: ProgressBarProps) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));

  const barColor = useMemo(() => {
    if (color === 'auto') {
      if (pct >= 80) return 'var(--status-low)';
      if (pct >= 50) return 'var(--status-medium)';
      return 'var(--status-high)';
    }
    const colorMap: Record<string, string> = {
      red: 'var(--status-high)', 
      yellow: 'var(--status-medium)', 
      green: 'var(--status-low)', 
      blue: 'var(--status-info)',
    };
    return colorMap[color] || 'var(--status-low)';
  }, [color, pct]);

  return (
    <div className="space-y-1 w-full">
      {(label || showValue) && (
        <div className="flex items-end justify-between mb-1.5 px-0.5">
          {label && <span className="font-mono text-[9px] font-semibold text-[var(--text-secondary)] tracking-[0.1em] uppercase">{label}</span>}
          {showValue && <span className="font-mono text-[11px] font-bold" style={{ color: barColor }}>{Math.round(pct)}%</span>}
        </div>
      )}
      <div className={`progress-bar-track ${size === 'sm' ? '!h-1.5' : ''}`}>
        <div className="progress-bar-fill" style={{ width: `${pct}%`, background: barColor }} />
      </div>
    </div>
  );
}
