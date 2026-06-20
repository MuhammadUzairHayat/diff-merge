# MergeFlow - Professional Visual Merge Tool with LCS Algorithm

A clean, modular implementation with proper algorithm separation and reusable components.

## Features

- **LCS Algorithm Implementation** - Tabulation (Bottom-Up DP) for diff detection
- **Three-Way Merge** - Git-style merge with conflict detection
- **Visual Diff Viewer** - Side-by-side comparison of files
- **Conflict Resolution** - Interactive UI for resolving merge conflicts
- **Statistics Dashboard** - Real-time similarity analysis and change tracking
- **Export Options** - Export merged files and JSON reports
- **Professional Dark Theme** - GitHub-inspired interface

## Project Structure

```
mergeflow/
├── app/
│   ├── globals.css          # Custom theme & styles
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Main application
├── algorithms/
│   └── LCS.ts               # Core LCS algorithm implementation
├── components/
│   ├── FileUpload.tsx       # Reusable file upload component
│   ├── DiffViewer.tsx       # Side-by-side diff display
│   ├── ConflictResolver.tsx # Conflict resolution UI
│   └── StatsBar.tsx         # Statistics display
├── types/
│   └── index.ts             # TypeScript type definitions
├── utils/
│   └── fileHelpers.ts       # File reading utilities
└── package.json             # Dependencies
```

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
npm start
```

### Sample Files

Three sample files are provided in the `/public` folder to test the application:
- `sample-base.txt` - Original version
- `sample-version-a.txt` - First modified version
- `sample-version-b.txt` - Second modified version

These files demonstrate:
- Line additions
- Line deletions
- Line modifications
- Merge conflicts

## How to Use

1. **Upload Files** - Upload three files:
   - Base file (original version)
   - Version A (first modified version)
   - Version B (second modified version)

2. **Analyze & Merge** - Click the "Analyze & Merge" button to:
   - Calculate file similarities using LCS algorithm
   - Detect differences between versions
   - Identify conflicts where both versions modified the same lines
   - Perform automatic three-way merge

3. **Resolve Conflicts** - For each conflict, choose:
   - **Use A** - Keep changes from Version A
   - **Use B** - Keep changes from Version B
   - **Keep Both** - Include both changes
   - **Custom** - Enter your own custom text

4. **Export Results** - Download:
   - **Merged File** - The final merged content with resolved conflicts
   - **JSON Report** - Complete analysis report with algorithm metadata

## LCS Algorithm Methods

| Method | Purpose |
|--------|---------|
| `buildTable()` | Constructs DP table using tabulation |
| `getLCSLength()` | Returns LCS length |
| `getSimilarity()` | Calculates similarity percentage |
| `getDiff()` | Backtracks to find differences |
| `getChanges()` | Returns change statistics |
| `detectConflicts()` | Finds conflicts in 3-way merge |
| `getDPTable()` | Returns DP table for visualization |
| `printDPTable()` | Console logs the DP table |
| `getMetadata()` | Returns algorithm info |
| `compareFiles()` | Static: Compare 2 files |
| `threeWayMerge()` | Static: Git-style 3-way merge |

## Technologies

- **Next.js 16** - React framework
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS 4** - Utility-first CSS framework
- **LCS Algorithm** - Dynamic Programming approach

## Algorithm Complexity

- **Time Complexity**: O(n × m) where n and m are the lengths of the two sequences
- **Space Complexity**: O(n × m) for the DP table

## License

This project is built for educational purposes as a semester project.
"# diff-merge" 
