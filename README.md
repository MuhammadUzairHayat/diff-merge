`# Diff Merge

A visual merge tool that uses the LCS (Longest Common Subsequence) algorithm to compare files and help resolve merge conflicts.

## Features

- Compare two files side by side
- Three-way merge with conflict detection
- Interactive conflict resolution (use A, use B, keep both, or custom)
- Similarity and change statistics
- Export the merged result

## Getting Started

Install dependencies:

```bash
npm install
```

Run the dev server:

```bash
npm run dev
```

Then open http://localhost:3000 in your browser.

To build for production:

```bash
npm run build
npm start
```

## How to Use

1. Upload a Base file and Version A (required). Add Version B for a three-way merge.
2. Click "Analyze & Merge" to compare the files and detect conflicts.
3. For each conflict, pick Version A, Version B, keep both, or enter custom text.
4. Click "Export Merged" to download the result.

## Tech Stack

- Next.js
- TypeScript
- Tailwind CSS
