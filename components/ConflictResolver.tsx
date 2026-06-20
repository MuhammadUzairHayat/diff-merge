'use client';

import { useState } from 'react';
import { Conflict } from '@/algorithms/LCS';
import { LuCheck, LuX } from 'react-icons/lu';
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
  // Tracks which conflict (if any) has the custom-text modal open
  const [activeConflict, setActiveConflict] = useState<Conflict | null>(null);
  const [customDraft, setCustomDraft] = useState('');

  const openCustomModal = (conflict: Conflict) => {
    setActiveConflict(conflict);
    setCustomDraft(conflict.customText ?? conflict.versionA ?? '');
  };

  const closeCustomModal = () => {
    setActiveConflict(null);
    setCustomDraft('');
  };

  const applyCustom = () => {
    if (!activeConflict) return;
    onResolve(activeConflict.id, 'both', customDraft);
    closeCustomModal();
  };

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
                onClick={() => openCustomModal(conflict)}
                className="px-3 py-1.5 text-sm border border-border hover:bg-bg-hover rounded transition-colors"
              >
                Custom
              </button>
            </div>
          )}
        </div>
      ))}

      {activeConflict && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={closeCustomModal}
        >
          <div
            className="w-full max-w-lg bg-bg-secondary border border-border rounded-lg shadow-xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h4 className="text-text-primary font-medium">
                Custom resolution &mdash; Line {activeConflict.lineNumber}
              </h4>
              <button
                type="button"
                onClick={closeCustomModal}
                className="text-text-muted hover:text-text-primary transition-colors"
                aria-label="Close"
              >
                <LuX className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-text-muted text-xs uppercase tracking-wide">Version A</span>
                  <pre className="font-mono text-xs text-text-primary mt-1 bg-bg-primary/50 p-2 rounded border-l-2 border-success whitespace-pre-wrap">
                    {activeConflict.versionA || '(empty)'}
                  </pre>
                </div>
                <div>
                  <span className="text-text-muted text-xs uppercase tracking-wide">Version B</span>
                  <pre className="font-mono text-xs text-text-primary mt-1 bg-bg-primary/50 p-2 rounded border-l-2 border-brand whitespace-pre-wrap">
                    {activeConflict.versionB || '(empty)'}
                  </pre>
                </div>
              </div>

              <div>
                <label className="text-text-muted text-xs uppercase tracking-wide">
                  Custom text
                </label>
                <textarea
                  autoFocus
                  value={customDraft}
                  onChange={(e) => setCustomDraft(e.target.value)}
                  rows={4}
                  className="w-full mt-1 font-mono text-sm bg-bg-primary border border-border rounded p-2 text-text-primary focus:outline-none focus:border-brand resize-y"
                  placeholder="Enter the resolved line(s)..."
                />
              </div>
            </div>

            <div className="p-4 border-t border-border flex justify-end gap-2">
              <button
                type="button"
                onClick={closeCustomModal}
                className="px-3 py-1.5 text-sm border border-border hover:bg-bg-hover rounded transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={applyCustom}
                className="px-3 py-1.5 text-sm bg-success hover:bg-[#2EA043] text-white rounded transition-colors"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
