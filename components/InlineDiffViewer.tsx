'use client';

import { InlineDiff, LCS } from '@/algorithms/LCS';
import { LuCheck, LuX, LuPencil } from 'react-icons/lu';

interface Tab {
  id: string;
  label: string;
}

interface InlineDiffViewerProps {
  lines: InlineDiff[];
  baseFileName: string;
  modifiedFileName: string;
  onAcceptLine: (index: number) => void;
  onRejectLine: (index: number) => void;
  onAcceptAll: () => void;
  onRejectAll: () => void;
  tabs?: Tab[];
  activeTab?: string;
  onTabChange?: (id: string) => void;
  className?: string;
}

export const InlineDiffViewer = ({
  lines,
  baseFileName,
  modifiedFileName,
  onAcceptLine,
  onRejectLine,
  onAcceptAll,
  onRejectAll,
  tabs,
  activeTab,
  onTabChange,
  className = ''
}: InlineDiffViewerProps) => {
  const summary = LCS.summarize(lines);

  return (
    <div className={`bg-bg-tertiary border border-border rounded-lg overflow-hidden ${className}`}>
      {/* Tabs */}
      {tabs && tabs.length > 1 && (
        <div className="flex items-center gap-1 px-2 pt-2 border-b border-border bg-bg-secondary">
          {tabs.map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange?.(tab.id)}
              className={`px-4 py-2 text-sm rounded-t-lg transition-colors border-b-2 ${
                activeTab === tab.id
                  ? 'text-text-primary border-brand bg-bg-tertiary'
                  : 'text-text-secondary border-transparent hover:bg-bg-hover'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {/* Toolbar: summary + bulk actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-b border-border bg-bg-secondary">
        <div className="flex items-center gap-4 text-xs">
          <span className="text-text-primary font-medium">{modifiedFileName}</span>
          <span className="text-warning flex items-center gap-1">
            <LuPencil className="w-3 h-3" /> Modified: {summary.modified + summary.added + summary.deleted}
          </span>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onAcceptAll}
            className="px-3 py-1 text-xs bg-success hover:bg-[#2EA043] text-white rounded transition-colors flex items-center gap-1"
          >
            <LuCheck className="w-3 h-3" /> Keep All Changes
          </button>
          <button
            type="button"
            onClick={onRejectAll}
            className="px-3 py-1 text-xs border border-border hover:bg-bg-hover rounded transition-colors flex items-center gap-1"
          >
            <LuX className="w-3 h-3" /> Revert All
          </button>
        </div>
      </div>

      {/* Column headers */}
      <div className="grid grid-cols-2 border-b border-border text-xs font-medium text-text-secondary">
        <div className="px-4 py-2 border-r border-border">Original • {baseFileName}</div>
        <div className="px-4 py-2">Modified • {modifiedFileName}</div>
      </div>

      {/* Side-by-side content */}
      <div className="divide-y divide-border/30 max-h-[500px] overflow-y-auto overflow-x-auto">
        {lines.map((line, index) => {
          const isChanged = line.type !== 'unchanged';
          const isAccepted = isChanged && line.current === line.modified;
          const isRejected = isChanged && line.current === line.original;
          const isCustom = isChanged && !isAccepted && !isRejected;

          // Left (original) styling
          const leftClass =
            line.type === 'deleted' || line.type === 'modified'
              ? 'bg-[rgba(218,54,51,0.12)]'
              : line.type === 'added'
              ? 'bg-bg-tertiary/40'
              : '';

          // Right (modified / resolved) styling
          let rightClass = '';
          if (isCustom) {
            rightClass = 'bg-[rgba(56,139,253,0.15)]';
          } else if (isChanged && isAccepted) {
            rightClass =
              line.type === 'deleted'
                ? 'bg-[rgba(218,54,51,0.12)]'
                : 'bg-[rgba(35,134,54,0.15)]';
          }

          return (
            <div key={index} className="grid grid-cols-2 font-mono text-sm">
              {/* Left: original */}
              <div className={`px-4 py-1.5 border-r border-border/50 flex items-start gap-3 ${leftClass}`}>
                <span className="text-text-muted text-xs w-8 text-right flex-shrink-0 select-none mt-0.5">
                  {line.baseLineNumber || ''}
                </span>
                <span className={`break-all ${line.original ? 'text-text-secondary' : 'text-text-muted'}`}>
                  {line.original || ' '}
                </span>
              </div>

              {/* Right: modified / resolved */}
              <div className={`px-4 py-1.5 flex items-start gap-3 ${rightClass}`}>
                <span className="text-text-muted text-xs w-8 text-right flex-shrink-0 select-none mt-0.5">
                  {isAccepted ? line.modifiedLineNumber || '' : line.modifiedLineNumber || line.baseLineNumber || ''}
                </span>

                <span
                  className={`flex-1 break-all ${
                    isChanged && isAccepted ? 'text-text-primary' : 'text-text-primary'
                  }`}
                >
                  {line.current || ' '}
                </span>

                {isChanged && (
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <span className="text-[10px] mr-1 flex items-center gap-1">
                      {isCustom ? (
                        <span className="text-brand flex items-center gap-1">
                          <LuPencil className="w-3 h-3" /> Custom
                        </span>
                      ) : isAccepted ? (
                        <span className="text-success flex items-center gap-1">
                          <LuCheck className="w-3 h-3" /> Changed
                        </span>
                      ) : (
                        <span className="text-text-muted flex items-center gap-1">
                          <LuX className="w-3 h-3" /> Original
                        </span>
                      )}
                    </span>
                    <button
                      type="button"
                      title="Keep this change"
                      onClick={() => onAcceptLine(index)}
                      className={`px-2 py-0.5 text-xs rounded transition-colors flex items-center justify-center ${
                        isAccepted
                          ? 'bg-success/20 text-success border border-success/30'
                          : 'hover:bg-success/20 text-text-secondary hover:text-success'
                      }`}
                    >
                      <LuCheck className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      title="Revert to original"
                      onClick={() => onRejectLine(index)}
                      className={`px-2 py-0.5 text-xs rounded transition-colors flex items-center justify-center ${
                        isRejected
                          ? 'bg-danger/20 text-danger border border-danger/30'
                          : 'hover:bg-danger/20 text-text-secondary hover:text-danger'
                      }`}
                    >
                      <LuX className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
