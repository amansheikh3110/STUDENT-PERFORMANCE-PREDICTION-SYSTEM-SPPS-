import React, { type ReactNode } from 'react';

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  color?: 'blue' | 'green' | 'red' | 'yellow' | 'purple' | 'orange';
  subtitle?: string;
  delay?: string;
}

const colorMap = {
  blue: { text: 'text-[var(--status-info)]', led: 'led-blue' },
  green: { text: 'text-[var(--status-low)]', led: 'led-green' },
  red: { text: 'text-[var(--status-high)]', led: 'led-red' },
  yellow: { text: 'text-[var(--status-medium)]', led: 'led-amber' },
  purple: { text: 'text-purple-400', led: 'led-blue' }, // fallback
  orange: { text: 'text-orange-400', led: 'led-amber' }, // fallback
};

export default function MetricCard({ title, value, icon, color = 'blue', subtitle, delay = '' }: MetricCardProps) {
  const c = colorMap[color] || colorMap.blue;

  return (
    <div className={`stat-card animate-slide-up ${delay}`}>
      <div className="flex items-start justify-between">
        <div>
          <div className={`font-mono text-[9px] tracking-[0.1em] uppercase mb-1 ${c.text}`}>
            {title}
          </div>
          <div className="font-mono text-3xl font-medium text-white tracking-widest">
            {value}
          </div>
          {subtitle && (
            <div className="font-mono text-[10px] text-white/40 mt-1 tracking-widest">
              {subtitle}
            </div>
          )}
        </div>
        <div className="flex gap-[6px] flex-col items-center">
          {/* We keep the icon to satisfy the prop, styled minimally */}
          <div className={`opacity-60 mb-1 ${c.text}`}>
            {icon ? React.cloneElement(icon as React.ReactElement<{size?: number}>, { size: 16 }) : null}
          </div>
          <div className="flex gap-[4px]">
            <div className={`led ${c.led} shrink-0`}></div>
            <div className={`led ${c.led} shrink-0`} style={{ animationDelay: '500ms' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
}
