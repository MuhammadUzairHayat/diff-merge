/**
 * LCS Algorithm Implementation - Tabulation (Bottom-Up DP)
 * Used for: Diff detection, Similarity calculation, Change tracking
 */
export class LCS {
  private dp: number[][];
  private rows: number;
  private cols: number;

  constructor(
    private seq1: string[],
    private seq2: string[]
  ) {
    this.rows = seq1.length;
    this.cols = seq2.length;
    this.dp = [];
    this.buildTable();
  }

  /**
   * Step 1: Build DP Table (Tabulation)
   * Time: O(n * m)
   * Space: O(n * m)
   */
  private buildTable(): void {
    const n = this.rows;
    const m = this.cols;
    
    // Initialize DP table with zeros
    this.dp = Array.from({ length: n + 1 }, () => Array(m + 1).fill(0));

    // Fill DP table
    for (let i = 1; i <= n; i++) {
      for (let j = 1; j <= m; j++) {
        if (this.seq1[i - 1] === this.seq2[j - 1]) {
          this.dp[i][j] = this.dp[i - 1][j - 1] + 1;
        } else {
          this.dp[i][j] = Math.max(this.dp[i - 1][j], this.dp[i][j - 1]);
        }
      }
    }
  }

  /**
   * Step 2: Get LCS Length
   * Returns: Length of longest common subsequence
   */
  getLCSLength(): number {
    return this.dp[this.rows][this.cols];
  }

  /**
   * Step 3: Get Similarity Percentage
   * Formula: (LCS Length / Max(seq1.length, seq2.length)) * 100
   */
  getSimilarity(): number {
    const lcsLen = this.getLCSLength();
    const maxLen = Math.max(this.rows, this.cols);
    return maxLen === 0 ? 0 : Math.round((lcsLen / maxLen) * 100);
  }

  /**
   * Step 4: Backtrack to find differences
   * Returns: Array of diff operations
   */
  getDiff(): DiffOperation[] {
    const diff: DiffOperation[] = [];
    let i = this.rows;
    let j = this.cols;

    while (i > 0 || j > 0) {
      if (i > 0 && j > 0 && this.seq1[i - 1] === this.seq2[j - 1]) {
        // Unchanged
        diff.unshift({
          type: 'unchanged',
          base: this.seq1[i - 1],
          modified: this.seq2[j - 1],
          lineNum: i
        });
        i--;
        j--;
      } else if (j > 0 && (i === 0 || this.dp[i][j - 1] >= (this.dp[i - 1]?.[j] ?? 0))) {
        // Added in seq2
        diff.unshift({
          type: 'added',
          modified: this.seq2[j - 1],
          lineNum: j
        });
        j--;
      } else if (i > 0 && (j === 0 || (this.dp[i - 1]?.[j] ?? 0) > (this.dp[i]?.[j - 1] ?? 0))) {
        // Deleted from seq1
        diff.unshift({
          type: 'deleted',
          base: this.seq1[i - 1],
          lineNum: i
        });
        i--;
      } else {
        i--;
        j--;
      }
    }

    return diff;
  }

  /**
   * Step 4b: Get inline diff with line numbers (for inline viewer)
   * Each entry carries the original (base) and modified content plus a
   * mutable "current" value that reflects the user's accept/reject choice.
   */
  getInlineDiff(): InlineDiff[] {
    const diff = this.getDiff();
    const result: InlineDiff[] = [];
    let baseIndex = 0;
    let modIndex = 0;
    let i = 0;

    while (i < diff.length) {
      const op = diff[i];

      if (op.type === 'unchanged') {
        baseIndex++;
        modIndex++;
        result.push({
          lineNumber: modIndex,
          baseLineNumber: baseIndex,
          modifiedLineNumber: modIndex,
          type: 'unchanged',
          original: op.base || '',
          modified: op.modified || '',
          current: op.modified ?? op.base ?? ''
        });
        i++;
        continue;
      }

      // Collect a contiguous "change block" (deletes/adds in any order),
      // then pair deletes with adds so each edited line becomes one row.
      const dels: string[] = [];
      const adds: string[] = [];
      while (i < diff.length && diff[i].type !== 'unchanged') {
        if (diff[i].type === 'deleted') {
          dels.push(diff[i].base || '');
        } else {
          adds.push(diff[i].modified || '');
        }
        i++;
      }

      const pairs = Math.min(dels.length, adds.length);

      // Paired delete+add -> modified line (default accepted = modified)
      for (let k = 0; k < pairs; k++) {
        baseIndex++;
        modIndex++;
        result.push({
          lineNumber: modIndex,
          baseLineNumber: baseIndex,
          modifiedLineNumber: modIndex,
          type: 'modified',
          original: dels[k],
          modified: adds[k],
          current: adds[k]
        });
      }

      // Leftover deletions -> deleted line (default accepted = removed)
      for (let k = pairs; k < dels.length; k++) {
        baseIndex++;
        result.push({
          lineNumber: baseIndex,
          baseLineNumber: baseIndex,
          modifiedLineNumber: 0,
          type: 'deleted',
          original: dels[k],
          modified: '',
          current: ''
        });
      }

      // Leftover additions -> added line (default accepted = added)
      for (let k = pairs; k < adds.length; k++) {
        modIndex++;
        result.push({
          lineNumber: modIndex,
          baseLineNumber: 0,
          modifiedLineNumber: modIndex,
          type: 'added',
          original: '',
          modified: adds[k],
          current: adds[k]
        });
      }
    }

    return result;
  }

  /**
   * Step 4c: Summarize an aligned inline diff into change counts.
   */
  static summarize(lines: InlineDiff[]): { added: number; deleted: number; modified: number } {
    let added = 0;
    let deleted = 0;
    let modified = 0;
    for (const l of lines) {
      if (l.type === 'added') added++;
      else if (l.type === 'deleted') deleted++;
      else if (l.type === 'modified') modified++;
    }
    return { added, deleted, modified };
  }

  /**
   * Step 5: Get changed lines only (for conflict detection)
   */
  getChanges(): ChangeInfo {
    const diff = this.getDiff();
    const added = diff.filter(d => d.type === 'added').length;
    const deleted = diff.filter(d => d.type === 'deleted').length;
    const modified = diff.filter(d => d.type === 'modified').length;
    const unchanged = diff.filter(d => d.type === 'unchanged').length;

    return {
      added,
      deleted,
      modified,
      unchanged,
      total: diff.length,
      changes: added + deleted + modified
    };
  }

  /**
   * Step 6: Detect conflicts between two modified versions
   */
  detectConflicts(base: string[], modifiedA: string[], modifiedB: string[]): Conflict[] {
    const conflicts: Conflict[] = [];
    
    // Get diff for Base ↔ A
    const lcsA = new LCS(base, modifiedA);
    const diffA = lcsA.getDiff();

    // Get diff for Base ↔ B
    const lcsB = new LCS(base, modifiedB);
    const diffB = lcsB.getDiff();

    // Find overlapping changes
    const changedLinesA = new Set<number>();
    const changedLinesB = new Set<number>();

    diffA.forEach(d => {
      if (d.type !== 'unchanged' && d.lineNum !== undefined) {
        changedLinesA.add(d.lineNum);
      }
    });

    diffB.forEach(d => {
      if (d.type !== 'unchanged' && d.lineNum !== undefined) {
        changedLinesB.add(d.lineNum);
      }
    });

    // Find intersections (both modified same line)
    const intersection = new Set([...changedLinesA].filter(x => changedLinesB.has(x)));

    intersection.forEach(lineNum => {
      const baseContent = base[lineNum - 1] || '';
      const aContent = modifiedA[lineNum - 1] || '';
      const bContent = modifiedB[lineNum - 1] || '';

      if (aContent !== bContent) {
        conflicts.push({
          id: `conflict-${lineNum}`,
          lineNumber: lineNum,
          base: baseContent,
          versionA: aContent,
          versionB: bContent,
          resolved: false
        });
      }
    });

    return conflicts;
  }

  /**
   * Step 7: Get DP Table (for visualization/debugging)
   */
  getDPTable(): number[][] {
    return this.dp;
  }

  /**
   * Step 8: Print DP Table (for console debugging)
   */
  printDPTable(): void {
    console.log('DP Table:');
    console.log('    ' + this.seq2.join('  '));
    for (let i = 0; i <= this.rows; i++) {
      const row = i === 0 ? '  ' : this.seq1[i - 1];
      console.log(row + ' ' + this.dp[i].join(' '));
    }
  }

  /**
   * Step 9: Get algorithm metadata
   */
  getMetadata(): AlgorithmMetadata {
    return {
      name: 'Longest Common Subsequence (LCS)',
      approach: 'Tabulation (Bottom-Up DP)',
      timeComplexity: `O(${this.rows} × ${this.cols})`,
      spaceComplexity: `O(${this.rows} × ${this.cols})`,
      rows: this.rows,
      cols: this.cols,
      lcsLength: this.getLCSLength(),
      similarity: this.getSimilarity()
    };
  }

  /**
   * Step 10: Static helper - Create diff between two files
   */
  static compareFiles(file1: string[], file2: string[]): DiffResult {
    const lcs = new LCS(file1, file2);
    return {
      diff: lcs.getDiff(),
      similarity: lcs.getSimilarity(),
      changes: lcs.getChanges(),
      metadata: lcs.getMetadata(),
      dpTable: lcs.getDPTable()
    };
  }

  /**
   * Step 11: Static helper - Three-way merge (Git-style)
   */
  static threeWayMerge(base: string[], a: string[], b: string[]): ThreeWayMergeResult {
    const lcsA = new LCS(base, a);
    const lcsB = new LCS(base, b);
    
    const diffA = lcsA.getDiff();
    const diffB = lcsB.getDiff();
    const conflicts = lcsA.detectConflicts(base, a, b);
    
    // Auto-merge non-conflicting changes
    const mergedLines: string[] = [];
    const usedLinesA = new Set<number>();
    const usedLinesB = new Set<number>();

    // Process diffA (Base → A)
    diffA.forEach(d => {
      if (d.type === 'unchanged' && d.lineNum !== undefined) {
        if (!usedLinesA.has(d.lineNum)) {
          mergedLines[d.lineNum - 1] = d.base || '';
          usedLinesA.add(d.lineNum);
        }
      } else if (d.type === 'added' && d.lineNum !== undefined) {
        // Check if B also added at this position
        const conflict = conflicts.find(c => c.lineNumber === d.lineNum);
        if (!conflict) {
          mergedLines[d.lineNum - 1] = d.modified || '';
        }
      }
    });

    // Process diffB (Base → B) for non-conflicting changes
    diffB.forEach(d => {
      if (d.type === 'unchanged' && d.lineNum !== undefined) {
        if (!usedLinesB.has(d.lineNum) && !mergedLines[d.lineNum - 1]) {
          mergedLines[d.lineNum - 1] = d.base || '';
          usedLinesB.add(d.lineNum);
        }
      } else if (d.type === 'added' && d.lineNum !== undefined) {
        const conflict = conflicts.find(c => c.lineNumber === d.lineNum);
        if (!conflict && !mergedLines[d.lineNum - 1]) {
          mergedLines[d.lineNum - 1] = d.modified || '';
        }
      }
    });

    // Clean up undefined entries
    const finalMerged = mergedLines.filter(line => line !== undefined);

    return {
      merged: finalMerged,
      conflicts: conflicts,
      autoMerged: conflicts.length === 0,
      stats: {
        totalChanges: diffA.length + diffB.length,
        conflictsFound: conflicts.length,
        autoMergeable: conflicts.length === 0
      }
    };
  }
}

// Type Definitions
export interface DiffOperation {
  type: 'unchanged' | 'added' | 'deleted' | 'modified';
  base?: string;
  modified?: string;
  lineNum?: number;
}

export interface InlineDiff {
  lineNumber: number;
  baseLineNumber: number;
  modifiedLineNumber: number;
  type: 'unchanged' | 'added' | 'deleted' | 'modified';
  original: string;
  modified: string;
  current: string;
}

export interface ChangeInfo {
  added: number;
  deleted: number;
  modified: number;
  unchanged: number;
  total: number;
  changes: number;
}

export interface Conflict {
  id: string;
  lineNumber: number;
  base: string;
  versionA: string;
  versionB: string;
  resolved: boolean;
  choice?: 'A' | 'B' | 'both';
  customText?: string;
}

export interface AlgorithmMetadata {
  name: string;
  approach: string;
  timeComplexity: string;
  spaceComplexity: string;
  rows: number;
  cols: number;
  lcsLength: number;
  similarity: number;
}

export interface DiffResult {
  diff: DiffOperation[];
  similarity: number;
  changes: ChangeInfo;
  metadata: AlgorithmMetadata;
  dpTable: number[][];
}

export interface ThreeWayMergeResult {
  merged: string[];
  conflicts: Conflict[];
  autoMerged: boolean;
  stats: {
    totalChanges: number;
    conflictsFound: number;
    autoMergeable: boolean;
  };
}
