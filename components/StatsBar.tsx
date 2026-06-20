'use client';

import { Stats } from '@/types';

interface StatsBarProps {
  stats: Stats;
  className?: string;
}

export const StatsBar = ({ stats, className = '' }: StatsBarProps) => {
  const statItems = [
    { label: 'Similarity', value: `${stats.similarity}%`, color: stats.similarity >= 80 ? 'text-success' : stats.similarity >= 50 ? 'text-warning' : 'text-danger' },
    { label: 'Total Lines', value: stats.totalLines, color: 'text-text-primary' },
    { label: 'Added', value: stats.added, color: 'text-success' },
    { label: 'Deleted', value: stats.deleted, color: 'text-danger' },
    { label: 'Modified', value: stats.modified, color: 'text-warning' },
    { label: 'Conflicts', value: stats.conflicts, color: stats.conflicts > 0 ? 'text-danger' : 'text-success' },
  ];

  return (
    <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 ${className}`}>
      {statItems.map((item, index) => (
        <div key={index} className="bg-bg-tertiary border border-border rounded-lg px-4 py-3">
          <p className="text-text-muted text-xs uppercase tracking-wide">{item.label}</p>
          <p className={`text-xl font-semibold ${item.color}`}>{item.value}</p>
        </div>
      ))}
    </div>
  );
};
