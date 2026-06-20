# MergeFlow - Quick Start Guide

## Installation & Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Visit http://localhost:3000 to see the application.

## Using MergeFlow

### Step 1: Upload Files

You need three files to perform a merge:
- **Base File**: The original version (common ancestor)
- **Version A**: First modified version
- **Version B**: Second modified version

You can:
- Click "Choose File" to browse for files
- Drag and drop files into the upload areas

### Step 2: Analyze & Merge

Click the **"🔍 Analyze & Merge"** button. MergeFlow will:
- Calculate similarity using the LCS algorithm
- Identify all differences between versions
- Detect conflicts (lines modified in both versions)
- Perform an automatic three-way merge

### Step 3: Review Results

#### Statistics Dashboard
View key metrics:
- **Similarity**: Overall similarity percentage
- **Total Lines**: Number of lines in base file
- **Added**: Lines added across versions
- **Deleted**: Lines removed across versions
- **Modified**: Lines changed across versions
- **Conflicts**: Number of conflicting changes

#### Diff Viewer
See side-by-side comparisons:
- **Base ↔ Version A**: Changes in first version
- **Base ↔ Version B**: Changes in second version

Color coding:
- 🟢 Green = Added lines
- 🔴 Red = Deleted lines
- 🟡 Yellow = Modified lines

### Step 4: Resolve Conflicts

For each conflict, choose:
- **Use A**: Keep changes from Version A
- **Use B**: Keep changes from Version B
- **Keep Both**: Include both versions (concatenated)
- **Custom**: Enter your own text

### Step 5: Export

Once all conflicts are resolved:
- **📥 Export Merged**: Download the final merged file
- **📊 Export Report**: Download JSON report with full analysis

## Sample Files

Try the application with the provided sample files in the `/public` folder:
1. Load `sample-base.txt` as Base
2. Load `sample-version-a.txt` as Version A
3. Load `sample-version-b.txt` as Version B
4. Click "Analyze & Merge"

These demonstrate:
- Line 3: Version A adds `* item.quantity`, Version B adds `+ item.tax` (CONFLICT)
- Line 8: Version A changes parameter name to `discount`, Version B changes to `discountPercent` (CONFLICT)
- Line 9-10: Version B adds extra processing lines
- Line 13: Version A adds `const shippingCost = 5.99`
- Line 13: Version B changes taxRate from 0.08 to 0.10 (CONFLICT)

## Understanding the Algorithm

### LCS (Longest Common Subsequence)
MergeFlow uses dynamic programming to find the longest sequence of unchanged lines between files.

**Time Complexity**: O(n × m) where n and m are file lengths  
**Space Complexity**: O(n × m) for the DP table

### Three-Way Merge
Compares both modified versions against the base:
1. Finds changes in Version A (Base → A)
2. Finds changes in Version B (Base → B)
3. Identifies conflicts (same line changed in both)
4. Auto-merges non-conflicting changes
5. Flags conflicts for manual resolution

## Troubleshooting

### Files won't upload
- Ensure files are text-based (.txt, .js, .ts, .py, etc.)
- Check that files contain valid UTF-8 text

### Build fails
```bash
# Clean and rebuild
rm -rf .next
npm run build
```

### Dev server won't start
```bash
# Check if port 3000 is available
# Or specify a different port
PORT=3001 npm run dev
```

## Next Steps

- Customize the theme in `app/globals.css`
- Add support for more file formats
- Implement syntax highlighting for code files
- Add undo/redo for conflict resolution
- Export to Git patch format

## Support

For questions or issues:
- Check the README.md for detailed documentation
- Review the algorithm implementation in `algorithms/LCS.ts`
- Examine component code in `components/` folder
