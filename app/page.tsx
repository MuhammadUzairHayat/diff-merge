'use client';

import { useState } from 'react';
import { LCS, InlineDiff, Conflict } from '@/algorithms/LCS';
import { FileUpload } from '@/components/FileUpload';
import { InlineDiffViewer } from '@/components/InlineDiffViewer';
import { ConflictResolver } from '@/components/ConflictResolver';
import { StatsBar } from '@/components/StatsBar';
import { FileHelper } from '@/utils/fileHelpers';
import { FileState, Stats, AlgorithmMetadata } from '@/types';
import { LuFileText, LuSearch, LuDownload } from 'react-icons/lu';

const emptyFile = (): FileState => ({
  file: null,
  content: '',
  lines: [],
  name: '',
  size: 0,
  lastModified: 0
});

type VersionId = 'A' | 'B';

export default function Home() {
  const [baseFile, setBaseFile] = useState<FileState>(emptyFile());
  const [versionA, setVersionA] = useState<FileState>(emptyFile());
  const [versionB, setVersionB] = useState<FileState>(emptyFile());

  const [inlineDiffA, setInlineDiffA] = useState<InlineDiff[]>([]);
  const [inlineDiffB, setInlineDiffB] = useState<InlineDiff[]>([]);
  const [activeVersion, setActiveVersion] = useState<VersionId>('A');

  const [conflicts, setConflicts] = useState<Conflict[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [isAnalyzed, setIsAnalyzed] = useState(false);
  const [algorithmInfo, setAlgorithmInfo] = useState<AlgorithmMetadata | null>(null);

  const isThreeWay = !!versionB.file;

  const handleFileUpload = (setter: (state: FileState) => void) => {
    return (file: File, content: string) => {
      const lines = FileHelper.toLines(content);
      setter({
        file,
        content,
        lines,
        name: file.name,
        size: file.size,
        lastModified: file.lastModified
      });
    };
  };

  const handleAnalyze = () => {
    if (!baseFile.file || !versionA.file) {
      alert('Please upload a Base file and at least one Modified file (Version A).');
      return;
    }

    const lcsA = new LCS(baseFile.lines, versionA.lines);
    const diffA = lcsA.getInlineDiff();
    setInlineDiffA(diffA);
    const similarityA = lcsA.getSimilarity();
    const summaryA = LCS.summarize(diffA);
    setAlgorithmInfo(lcsA.getMetadata());
    setActiveVersion('A');

    let added = summaryA.added;
    let deleted = summaryA.deleted;
    let modified = summaryA.modified;
    let similarity = similarityA;
    let detectedConflicts: Conflict[] = [];

    if (versionB.file) {
      const lcsB = new LCS(baseFile.lines, versionB.lines);
      const diffB = lcsB.getInlineDiff();
      setInlineDiffB(diffB);
      const summaryB = LCS.summarize(diffB);
      added += summaryB.added;
      deleted += summaryB.deleted;
      modified += summaryB.modified;
      similarity = Math.round((similarityA + lcsB.getSimilarity()) / 2);
      detectedConflicts = lcsA.detectConflicts(
        baseFile.lines,
        versionA.lines,
        versionB.lines
      );
    } else {
      setInlineDiffB([]);
    }

    setConflicts(detectedConflicts);
    setStats({
      similarity,
      totalLines: baseFile.lines.length,
      added,
      deleted,
      modified,
      unchanged: diffA.filter(l => l.type === 'unchanged').length,
      conflicts: detectedConflicts.length
    });
    setIsAnalyzed(true);
  };

  // ----- Per-line accept / reject helpers -----
  const setterFor = (version: VersionId) =>
    version === 'A' ? setInlineDiffA : setInlineDiffB;

  const setLine = (version: VersionId, index: number, value: 'accept' | 'reject') => {
    setterFor(version)(prev =>
      prev.map((line, i) => {
        if (i !== index || line.type === 'unchanged') return line;
        return {
          ...line,
          current: value === 'accept' ? line.modified : line.original
        };
      })
    );
  };

  const setAll = (version: VersionId, value: 'accept' | 'reject') => {
    setterFor(version)(prev =>
      prev.map(line => {
        if (line.type === 'unchanged') return line;
        return {
          ...line,
          current: value === 'accept' ? line.modified : line.original
        };
      })
    );
  };

  // ----- Export -----
  const buildMerged = (diff: InlineDiff[]): string => {
    const out: string[] = [];
    diff.forEach(line => {
      if (line.type === 'unchanged' || line.current !== '') {
        out.push(line.current);
      }
    });
    return out.join('\n');
  };

  const downloadText = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExport = () => {
    if (inlineDiffA.length === 0) return;
    downloadText(buildMerged(inlineDiffA), 'merged_version_a.txt');
    if (isThreeWay && inlineDiffB.length > 0) {
      downloadText(buildMerged(inlineDiffB), 'merged_version_b.txt');
    }
  };

  // Apply a resolved value to the diff line that maps to the conflict's base line
  const applyResolutionToDiff = (baseLineNumber: number, value: string) => {
    const patch = (prev: InlineDiff[]) =>
      prev.map(line =>
        line.baseLineNumber === baseLineNumber && line.type !== 'unchanged'
          ? { ...line, current: value }
          : line
      );
    setInlineDiffA(patch);
    setInlineDiffB(patch);
  };

  const handleResolveConflict = (
    conflictId: string,
    choice: 'A' | 'B' | 'both',
    customText?: string
  ) => {
    const conflict = conflicts.find(c => c.id === conflictId);
    if (!conflict) return;

    let resolvedValue: string;
    if (customText !== undefined && customText !== '') {
      resolvedValue = customText;
    } else if (choice === 'A') {
      resolvedValue = conflict.versionA;
    } else if (choice === 'B') {
      resolvedValue = conflict.versionB;
    } else {
      // Keep both
      resolvedValue = [conflict.versionA, conflict.versionB]
        .filter(Boolean)
        .join('\n');
    }

    applyResolutionToDiff(conflict.lineNumber, resolvedValue);

    setConflicts(prev =>
      prev.map(c =>
        c.id === conflictId ? { ...c, resolved: true, choice, customText } : c
      )
    );
  };

  const resetAll = () => {
    setBaseFile(emptyFile());
    setVersionA(emptyFile());
    setVersionB(emptyFile());
    setInlineDiffA([]);
    setInlineDiffB([]);
    setConflicts([]);
    setStats(null);
    setIsAnalyzed(false);
    setAlgorithmInfo(null);
    setActiveVersion('A');
  };

  const activeDiff = activeVersion === 'A' ? inlineDiffA : inlineDiffB;
  const activeName =
    activeVersion === 'A' ? versionA.name || 'Version A' : versionB.name || 'Version B';

  const tabs = [
    { id: 'A', label: versionA.name || 'Version A' },
    ...(isThreeWay ? [{ id: 'B', label: versionB.name || 'Version B' }] : [])
  ];

  return (
    <main className="min-h-screen bg-bg-primary text-text-primary">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <header className="flex items-center justify-between py-4 border-b border-border mb-6">
          <div>
            <div className='flex gap-2 items-center'>
              <img className='w-12 h-12' src="/logo.png" alt="logo" />
            <h1 className="text-2xl font-bold tracking-tight">
              <span className="text-danger">Diff</span> <span className="text-success">Merge</span>
            </h1>
            </div>
        
          </div>
          <div className="flex items-center gap-4">
            {algorithmInfo && (
              <div className="text-right">
                <p className="text-text-muted text-xs">Algorithm</p>
                <p className="text-text-secondary text-sm font-mono">LCS Tabulation</p>
              </div>
            )}
            <button
              type="button"
              onClick={resetAll}
              className="px-3 py-1.5 text-sm border border-border rounded hover:bg-bg-hover transition-colors"
            >
              Reset
            </button>
          </div>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
          <FileUpload
            label={
              <span className="flex items-center gap-2">
                <LuFileText className="w-4 h-4" /> Base File (required)
              </span>
            }
            onFileUpload={handleFileUpload(setBaseFile)}
            fileName={baseFile.name}
          />
          <FileUpload
            label={
              <span className="flex items-center gap-2">
                <LuFileText className="w-4 h-4" /> Version A (required)
              </span>
            }
            onFileUpload={handleFileUpload(setVersionA)}
            fileName={versionA.name}
          />
          <FileUpload
            label={
              <span className="flex items-center gap-2">
                <LuFileText className="w-4 h-4" /> Version B (optional)
              </span>
            }
            onFileUpload={handleFileUpload(setVersionB)}
            fileName={versionB.name}
          />
        </section>
        <p className="text-text-muted text-xs mb-6">
          Upload a Base file plus one modified file for a 2-way comparison, or add Version B for a 3-way merge with conflict detection.
        </p>

        <div className="flex gap-3 mb-6">
          <button
            type="button"
            onClick={handleAnalyze}
            disabled={!baseFile.file || !versionA.file}
            className="px-6 py-2.5 bg-success hover:bg-[#2EA043] disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            <LuSearch className="w-4 h-4" /> Analyze &amp; Merge
          </button>
          {isAnalyzed && (
            <button
              type="button"
              onClick={handleExport}
              className="px-6 py-2.5 border border-border hover:bg-bg-hover rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <LuDownload className="w-4 h-4" /> Export Merged
            </button>
          )}
        </div>

        {stats && <StatsBar stats={stats} className="mb-6" />}

        {isAnalyzed && (
          <section className="mb-6">
            <InlineDiffViewer
              lines={activeDiff}
              baseFileName={baseFile.name || 'Base'}
              modifiedFileName={activeName}
              onAcceptLine={(i) => setLine(activeVersion, i, 'accept')}
              onRejectLine={(i) => setLine(activeVersion, i, 'reject')}
              onAcceptAll={() => setAll(activeVersion, 'accept')}
              onRejectAll={() => setAll(activeVersion, 'reject')}
              tabs={tabs}
              activeTab={activeVersion}
              onTabChange={(id) => setActiveVersion(id as VersionId)}
            />
          </section>
        )}

        {isThreeWay && isAnalyzed && conflicts.length > 0 && (
          <section className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-text-primary font-medium">Conflicts</h2>
              <span className="text-text-muted text-xs">
                {conflicts.filter(c => !c.resolved).length} unresolved
              </span>
            </div>
            <ConflictResolver conflicts={conflicts} onResolve={handleResolveConflict} />
          </section>
        )}
      </div>
    </main>
  );
}
