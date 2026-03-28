interface RiskBadgeProps {
  level: string; // 'high' | 'medium' | 'low'
  score?: number;
  size?: 'sm' | 'md' | 'lg';
}

export default function RiskBadge({ level, score, size = 'md' }: RiskBadgeProps) {
  const sizeClasses = {
    sm: 'px-1.5 py-0.5 text-[9px] min-w-[32px] justify-center',
    md: 'px-2 py-0.5 text-[10px] min-w-[40px] justify-center',
    lg: 'px-3 py-1 text-[12px] min-w-[50px] justify-center',
  };

  const getStatusColorClass = () => {
    if (level === 'high') return 'text-[var(--status-high)] shadow-[inset_0_0_8px_rgba(255,71,87,0.15)] bg-[var(--glow-high)]/10 border-[var(--status-high)]/30';
    if (level === 'medium') return 'text-[var(--status-medium)] shadow-[inset_0_0_8px_rgba(255,165,2,0.15)] bg-[var(--status-medium)]/10 border-[var(--status-medium)]/30';
    return 'text-[var(--status-low)] shadow-[inset_0_0_8px_rgba(46,213,115,0.15)] bg-[var(--status-low)]/10 border-[var(--status-low)]/30';
  };

  const getLedColorName = () => {
    if (level === 'high') return 'red';
    if (level === 'medium') return 'amber';
    return 'green';
  };

  return (
    <span className={`inline-flex items-center gap-1.5 rounded border font-mono font-bold tracking-[0.1em] uppercase shadow-[var(--shadow-sharp)] ${sizeClasses[size]} ${getStatusColorClass()}`}>
      <span className={`led led-${getLedColorName()} shrink-0`} style={{ width: size === 'sm' ? '4px' : '6px', height: size === 'sm' ? '4px' : '6px' }} />
      {score !== undefined ? `${score}` : level}
    </span>
  );
}
