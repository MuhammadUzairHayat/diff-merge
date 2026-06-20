'use client';

import { useState } from 'react';
import { Conflict } from '@/algorithms/LCS';
import { LuCheck } from 'react-icons/lu';
import { BiSolidError } from 'react-icons/bi';

interface ConflictResolverProps {
  conflicts: Conflict[];
  onResolve: (conflictId: string, choice: 'A' | 'B' | 'both', customText?: string) => void;
  className?: string;
}

export const ConflictResolver = ({ 
  conflicts, 
  onResolve, 
  className = '' 
}: ConflictResolverProps) => {
  const [customTexts, setCustomTexts] = useState<Record<string, string>>({});

  if (conflicts.length === 0) {
    return (
      <div className={`bg-bg-secondary border border-border rounded-lg p-6 text-center ${className}`}>
        <p className="text-text-secondary flex items-center justify-center gap-2">
          <LuCheck className="w-4 h-4 text-success" /> No conflicts detected
        </p>
      </div>
    );
  }

  const unresolved = conflicts.filter(c => !c.resolved);

  return (
    <div className={`space-y-4 ${className}`}>
      {unresolved.length > 0 && (
        <div className="bg-bg-secondary border border-border rounded-lg p-3">
          <p className="text-text-secondary text-sm flex items-center gap-2">
            <BiSolidError className="w-4 h-4 text-warning" />
            {unresolved.length} conflict{unresolved.length > 1 ? 's' : ''} need resolution
          </p>
        </div>
      )}

      {conflicts.map((conflict) => (
        <div 
          key={conflict.id} 
          className={`bg-bg-secondary border rounded-lg overflow-hidden transition-opacity
            ${conflict.resolved ? 'border-success/30 opacity-60' : 'border-border'}`}
        >
          <div className="p-4 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h4 className="text-text-primary font-medium">
                Line {conflict.lineNumber}
              </h4>
              {conflict.resolved && (
                <span className="text-xs text-success flex items-center gap-1">
                  <LuCheck className="w-3 h-3" /> Resolved
                </span>
              )}
            </div>
            <span className="text-text-muted text-xs">Conflict</span>
          </div>

          <div className="divide-y divide-border/30">
            <div className="p-4 bg-bg-tertiary/50">
              <span className="text-text-muted text-xs uppercase tracking-wide">Base</span>
              <pre className="font-mono text-sm text-text-primary mt-1 bg-bg-primary/50 p-2 rounded">
                {conflict.base || '(empty)'}
              </pre>
            </div>
            <div className="p-4">
              <span className="text-text-muted text-xs uppercase tracking-wide">Version A</span>
              <pre className="font-mono text-sm text-text-primary mt-1 bg-bg-primary/50 p-2 rounded border-l-2 border-success">
                {conflict.versionA || '(empty)'}
              </pre>
            </div>
            <div className="p-4">
              <span className="text-text-muted text-xs uppercase tracking-wide">Version B</span>
              <pre className="font-mono text-sm text-text-primary mt-1 bg-bg-primary/50 p-2 rounded border-l-2 border-brand">
                {conflict.versionB || '(empty)'}
              </pre>
            </div>
          </div>

          {!conflict.resolved && (
            <div className="p-4 bg-bg-tertiary border-t border-border flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => onResolve(conflict.id, 'A')}
                className="px-3 py-1.5 text-sm bg-success hover:bg-[#2EA043] text-white rounded transition-colors"
              >
                Use A
              </button>
              <button
                type="button"
                onClick={() => onResolve(conflict.id, 'B')}
                className="px-3 py-1.5 text-sm border border-border hover:bg-bg-hover rounded transition-colors"
              >
                Use B
              </button>
              <button
                type="button"
                onClick={() => onResolve(conflict.id, 'both')}
                className="px-3 py-1.5 text-sm border border-border hover:bg-bg-hover rounded transition-colors"
              >
                Keep Both
              </button>
              <button
                type="button"
                onClick={() => {
                  const text = prompt('Enter custom text:');
                  if (text !== null) {
                    onResolve(conflict.id, 'both', text);
                  }
                }}
                className="px-3 py-1.5 text-sm border border-border hover:bg-bg-hover rounded transition-colors"
              >
                Custom
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
