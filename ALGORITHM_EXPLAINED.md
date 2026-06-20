# LCS Algorithm - Detailed Explanation

## What is LCS?

**Longest Common Subsequence (LCS)** is a classic algorithm used to find the longest sequence of elements that appear in the same order in two sequences, though not necessarily consecutively.

### Example
```
Sequence 1: [A, B, C, D, E]
Sequence 2: [A, C, E, F]
LCS: [A, C, E] (length = 3)
```

## Why LCS for Diff/Merge?

LCS is perfect for file comparison because:
1. **Identifies Common Lines**: Unchanged content between files
2. **Detects Differences**: Lines that were added or removed
3. **Calculates Similarity**: Percentage of matching content
4. **Enables Three-Way Merge**: Compare multiple versions against a base

## Algorithm Approach: Tabulation (Bottom-Up DP)

### Step 1: Build DP Table

We create a 2D table where:
- Rows represent lines from File 1
- Columns represent lines from File 2
- Each cell `dp[i][j]` stores the LCS length for the first `i` lines of File 1 and first `j` lines of File 2

```typescript
private buildTable(): void {
  const n = this.rows;
  const m = this.cols;
  
  // Initialize table with zeros
  this.dp = Array.from({ length: n + 1 }, () => Array(m + 1).fill(0));

  // Fill the table
  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      if (this.seq1[i - 1] === this.seq2[j - 1]) {
        // Lines match: add 1 to diagonal value
        this.dp[i][j] = this.dp[i - 1][j - 1] + 1;
      } else {
        // Lines don't match: take max from left or top
        this.dp[i][j] = Math.max(this.dp[i - 1][j], this.dp[i][j - 1]);
      }
    }
  }
}
```

### Visual Example

```
File 1: ["A", "B", "C"]
File 2: ["A", "C", "D"]

DP Table:
      ""  A  C  D
  ""   0  0  0  0
  A    0  1  1  1
  B    0  1  1  1
  C    0  1  2  2

LCS Length = 2 (bottom-right cell)
LCS = ["A", "C"]
```

### Step 2: Calculate Similarity

```typescript
getSimilarity(): number {
  const lcsLen = this.getLCSLength();
  const maxLen = Math.max(this.rows, this.cols);
  return maxLen === 0 ? 0 : Math.round((lcsLen / maxLen) * 100);
}
```

Formula: `(LCS Length / Longer File Length) × 100`

Example:
- File 1: 10 lines
- File 2: 12 lines
- LCS: 8 lines
- Similarity: (8 / 12) × 100 = 67%

### Step 3: Backtrack to Find Differences

Starting from `dp[n][m]`, we work backwards:

```typescript
getDiff(): DiffOperation[] {
  const diff: DiffOperation[] = [];
  let i = this.rows;
  let j = this.cols;

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && this.seq1[i - 1] === this.seq2[j - 1]) {
      // Case 1: Lines match (unchanged)
      diff.unshift({ type: 'unchanged', base: seq1[i-1], modified: seq2[j-1] });
      i--; j--;
    } 
    else if (j > 0 && (i === 0 || dp[i][j-1] >= dp[i-1][j])) {
      // Case 2: Line added in File 2
      diff.unshift({ type: 'added', modified: seq2[j-1] });
      j--;
    } 
    else if (i > 0) {
      // Case 3: Line deleted from File 1
      diff.unshift({ type: 'deleted', base: seq1[i-1] });
      i--;
    }
  }
  return diff;
}
```

### Backtracking Rules:
1. **Lines Match**: Move diagonally (↖)
2. **Left Cell Larger**: Move left (←) = Addition
3. **Top Cell Larger**: Move up (↑) = Deletion

### Visual Backtracking

```
DP Table with backtrack path:
      ""  A  C  D
  ""   0  0  0  0
  A    0  1←←←←1
         ↑      ↑
  B    0  1←←←←1
         ↑      ↑
  C    0  1  2←←2
            ↖  

Path: ↖(C matches), ←(D added), ↖(A matches), ↑(B deleted)
Result:
  1. A unchanged
  2. B deleted
  3. C unchanged
  4. D added
```

## Three-Way Merge Algorithm

### Concept
Compare two modified versions (A and B) against a common base:

```
    Base
   /    \
  A      B
   \    /
   Merged
```

### Implementation

```typescript
static threeWayMerge(base: string[], a: string[], b: string[]): ThreeWayMergeResult {
  // Step 1: Get differences for Base → A
  const lcsA = new LCS(base, a);
  const diffA = lcsA.getDiff();
  
  // Step 2: Get differences for Base → B
  const lcsB = new LCS(base, b);
  const diffB = lcsB.getDiff();
  
  // Step 3: Find conflicts (same line modified in both)
  const conflicts = detectConflicts(base, a, b);
  
  // Step 4: Auto-merge non-conflicting changes
  // Step 5: Flag conflicts for manual resolution
  
  return { merged, conflicts, autoMerged };
}
```

### Conflict Detection

A conflict occurs when:
1. **Same line number** is changed in both versions
2. **Different content** in the two versions

```typescript
detectConflicts(base: string[], modifiedA: string[], modifiedB: string[]): Conflict[] {
  // Find changed lines in A
  const changedLinesA = new Set<number>();
  diffA.forEach(d => {
    if (d.type !== 'unchanged') changedLinesA.add(d.lineNum);
  });
  
  // Find changed lines in B
  const changedLinesB = new Set<number>();
  diffB.forEach(d => {
    if (d.type !== 'unchanged') changedLinesB.add(d.lineNum);
  });
  
  // Find intersection (both modified same line)
  const conflictLines = [...changedLinesA].filter(x => changedLinesB.has(x));
  
  // Check if content differs
  return conflictLines.map(lineNum => {
    const aContent = modifiedA[lineNum - 1];
    const bContent = modifiedB[lineNum - 1];
    if (aContent !== bContent) {
      return { lineNumber: lineNum, versionA: aContent, versionB: bContent };
    }
  });
}
```

## Complexity Analysis

### Time Complexity: O(n × m)
- Building DP table: O(n × m) - Visit each cell once
- Backtracking: O(n + m) - At most n + m steps
- **Total**: O(n × m)

### Space Complexity: O(n × m)
- DP table: O(n × m)
- Result array: O(n + m)
- **Total**: O(n × m)

### Optimization Opportunities
1. **Space-Optimized LCS**: Use only two rows instead of full table (O(min(n, m)))
2. **Early Termination**: Stop if files are identical
3. **Chunking**: Process large files in segments

## Real-World Applications

1. **Version Control Systems**
   - Git diff/merge
   - SVN comparison
   - Mercurial operations

2. **File Synchronization**
   - Dropbox file merging
   - Google Drive sync
   - OneDrive conflict resolution

3. **Code Review Tools**
   - GitHub Pull Requests
   - GitLab Merge Requests
   - Bitbucket Diffs

4. **Document Comparison**
   - Microsoft Word Track Changes
   - Google Docs Revision History
   - PDF comparison tools

## Example Walkthrough

### Input Files

**Base.txt**:
```
function hello() {
  console.log("Hello");
}
```

**Version A.txt**:
```
function hello() {
  console.log("Hello World");
}
```

**Version B.txt**:
```
function greet() {
  console.log("Hello");
}
```

### Analysis

1. **Base ↔ A Comparison**:
   - Line 1: Unchanged
   - Line 2: Modified ("Hello" → "Hello World")
   - Line 3: Unchanged

2. **Base ↔ B Comparison**:
   - Line 1: Modified ("hello" → "greet")
   - Line 2: Unchanged
   - Line 3: Unchanged

3. **Conflicts Detected**:
   - **Line 1**: Function name differs (hello vs greet)
   - **Line 2**: Message differs ("Hello" vs "Hello World")

4. **Manual Resolution Required**:
   - User must choose between:
     - Function name: `hello()` or `greet()`
     - Message: `"Hello"` or `"Hello World"`
   - Or provide custom solution

## Advantages of LCS

✅ **Accurate**: Finds optimal longest common subsequence  
✅ **Reliable**: Well-tested algorithm used in production tools  
✅ **Flexible**: Works with any line-based text format  
✅ **Deterministic**: Same input always produces same output  
✅ **Proven**: Decades of use in version control systems  

## Limitations

⚠️ **Memory-Intensive**: O(n × m) space for large files  
⚠️ **Line-Based**: Doesn't detect changes within lines  
⚠️ **Order-Dependent**: Reordering lines shows as delete + add  
⚠️ **No Semantic Understanding**: Treats all lines equally  

## Further Reading

- [Wikipedia: Longest Common Subsequence](https://en.wikipedia.org/wiki/Longest_common_subsequence_problem)
- [GeeksforGeeks: LCS Dynamic Programming](https://www.geeksforgeeks.org/longest-common-subsequence-dp-4/)
- [Git Diff Algorithm Documentation](https://git-scm.com/docs/git-diff)
- [The Myers Diff Algorithm](https://blog.jcoglan.com/2017/02/12/the-myers-diff-algorithm-part-1/)

---

**Implementation Note**: This MergeFlow project uses the classic tabulation approach for clarity and educational purposes. Production systems like Git use optimized variants like Myers' diff algorithm for better performance.
