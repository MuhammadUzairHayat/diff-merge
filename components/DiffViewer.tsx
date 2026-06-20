'use client';

import { DiffOperation } from '@/algorithms/LCS';

interface DiffViewerProps {
  diff: DiffOperation[];
  baseFileName: string;
  modifiedFileName: string;
  className?: string;
}

export const DiffViewer = ({ 
  diff, 
  baseFileName, 
  modifiedFileName, 
  className = '' 
}: DiffViewerProps) => {
  const getDiffClass = (type: DiffOperation['type']): string => {
    switch (type) {
      case 'added': return 'bg-[rgba(35,134,54,0.15)] border-l-4 border-success';
      case 'deleted': return 'bg-[rgba(218,54,51,0.15)] border-l-4 border-danger';
      case 'modified': return 'bg-[rgba(210,153,34,0.15)] border-l-4 border-warning';
      default: return 'border-l-4 border-transparent';
    }
  };

  const getLineNumber = (op: DiffOperation, side: 'base' | 'modified'): string => {
    if (op.type === 'added') return '';
    if (op.type === 'deleted') return String(op.lineNum || '');
    return String(op.lineNum || '');
  };

  return (
    <div className={`bg-bg-tertiary border border-border rounded-lg overflow-hidden ${className}`}>
      {/* Header */}
      <div className="grid grid-cols-2 border-b border-border">
        <div className="px-4 py-2 text-text-secondary text-sm font-medium border-r border-border">
          {baseFileName}
        </div>
        <div className="px-4 py-2 text-text-secondary text-sm font-medium">
          {modifiedFileName}
        </div>
      </div>

      {/* Diff Content */}
      <div className="divide-y divide-border/30 overflow-x-auto max-h-[500px] overflow-y-auto">
        {diff.map((op, index) => (
          <div key={index} className={`grid grid-cols-2 font-mono text-sm ${getDiffClass(op.type)}`}>
            {/* Base side */}
            <div className="px-4 py-1.5 border-r border-border/50 text-text-secondary flex items-start gap-3">
              <span className="text-text-muted text-xs w-8 text-right flex-shrink-0 select-none">
                {getLineNumber(op, 'base')}
              </span>
              <span className={op.base ? '' : 'text-text-muted'}>
                {op.base || ' '}
              </span>
            </div>
            
            {/* Modified side */}
            <div className="px-4 py-1.5 text-text-primary flex items-start gap-3">
              <span className="text-text-muted text-xs w-8 text-right flex-shrink-0 select-none">
                {getLineNumber(op, 'modified')}
              </span>
              <span className={op.modified ? '' : 'text-text-muted'}>
                {op.modified || ' '}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
