export interface FileState {
  file: File | null;
  content: string;
  lines: string[];
  name: string;
  size: number;
  lastModified: number;
}

export interface DiffLine {
  type: 'unchanged' | 'added' | 'deleted' | 'modified';
  baseContent?: string;
  modifiedContent?: string;
  lineNumber?: number;
}

export interface Stats {
  similarity: number;
  totalLines: number;
  added: number;
  deleted: number;
  modified: number;
  unchanged: number;
  conflicts: number;
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
