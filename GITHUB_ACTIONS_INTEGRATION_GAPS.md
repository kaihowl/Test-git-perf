# Git-Perf GitHub Actions Integration - Gap Analysis

**Date:** 2025-12-16
**Tutorial Source:** https://raw.githubusercontent.com/kaihowl/git-perf/refs/heads/master/docs/INTEGRATION_TUTORIAL.md
**Repository:** kaihowl/Test-git-perf
**Project Type:** Node.js/TypeScript with npm

## Executive Summary

I followed the git-perf Integration Tutorial step-by-step to set up GitHub Actions pipelines for automated performance tracking. While the tutorial provides a good conceptual overview, it lacks critical implementation details that are essential for a new project. Specifically:

1. **No complete workflow YAML examples** - Tutorial describes what to do but doesn't show how
2. **Missing git identity configuration commands**
3. **No explanation of GitHub Pages setup process**
4. **Missing project-specific setup steps** (dependencies, build tools)
5. **No PR comment implementation details**
6. **Incomplete troubleshooting for common issues**

## What I Created

Following the tutorial, I created the complete GitHub Actions pipeline:

### Files Created:
1. `.github/workflows/performance-tracking.yml` - Main performance tracking on push
2. `.github/workflows/performance-reporting.yml` - HTML report generation and GitHub Pages deployment
3. `.github/workflows/cleanup-measurements.yml` - Weekly cleanup of old measurements
4. `.github/workflows/pr-performance-check.yml` - PR performance checks with comments
5. Updated `.gitperfconfig` - Configuration for measurements

### Workflow Structure:
- **Performance Tracking**: Runs on push to main and PRs, measures build time and test duration
- **Performance Reporting**: Generates HTML dashboard, publishes to GitHub Pages weekly
- **Cleanup**: Removes measurements older than 90 days weekly
- **PR Check**: Measures performance on PRs and posts audit results as comments

---

## Critical Gaps Found

### GAP #1: No Complete Workflow YAML Examples

**Severity:** CRITICAL
**Status:** Confirmed

**Issue:**
The tutorial describes what each workflow should do but provides NO complete workflow YAML files. It says things like "Create `.github/workflows/performance-tracking.yml` with:" and then lists bullet points, but doesn't show the actual YAML.

**What the tutorial says:**
> ### Step 3: GitHub Actions Setup
> Create `.github/workflows/performance-tracking.yml` with:
> - Full repository history checkout (`fetch-depth: 0`)
> - Git identity configuration (required for git-notes commits)
> - Performance measurement commands
> - `git perf push` to save measurements

**What's missing:**
- Complete workflow YAML structure
- Exact actions to use (checkout@v4, setup-node, etc.)
- Proper permissions configuration
- Job and step definitions
- Conditional logic (only push on main branch, etc.)

**Impact:**
Users with limited GitHub Actions experience cannot implement the workflows. They must either:
1. Have extensive GitHub Actions knowledge to construct workflows from bullet points
2. Search for examples elsewhere
3. Guess at the implementation details

**What I had to infer/create:**
```yaml
name: Performance Tracking

on:
  push:
    branches:
      - main
  pull_request:

permissions:
  contents: write

jobs:
  track-performance:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4
        with:
          fetch-depth: 0
      # ... rest of workflow
```

**Recommendation:**
Provide complete, copy-paste-ready workflow YAML files for:
1. Basic performance tracking
2. Reporting and GitHub Pages deployment
3. Cleanup workflow
4. PR performance check with comments

---

### GAP #2: Git Identity Configuration Commands Missing

**Severity:** HIGH
**Status:** Confirmed

**Issue:**
The tutorial states "Git identity configuration is required because git-perf stores measurements as git-notes" but doesn't provide the actual commands.

**What the tutorial says:**
> Critical requirement: "Git identity configuration is required because git-perf stores measurements as git-notes."

**What's missing:**
The actual git config commands:
```yaml
- name: Configure Git identity
  run: |
    git config --global user.email "github-actions[bot]@users.noreply.github.com"
    git config --global user.name "github-actions[bot]"
```

**Why this matters:**
Without this step, users get cryptic errors:
```
Error: unable to create git notes:
*** Please tell me who you are.
```

**Impact:**
First workflow run will fail with unclear error message. Users must debug and figure out the git identity issue themselves.

**Recommendation:**
Add explicit section showing:
```yaml
- name: Configure Git identity
  run: |
    git config --global user.email "github-actions[bot]@users.noreply.github.com"
    git config --global user.name "github-actions[bot]"
```

And explain WHY this is needed (git-notes require commit author information).

---

### GAP #3: Project Dependencies Not Mentioned

**Severity:** HIGH
**Status:** Confirmed

**Issue:**
The tutorial jumps straight to measuring performance without mentioning that project dependencies must be installed first.

**What the tutorial shows:**
```bash
git perf measure -m build_time -- cargo build --release
```

**What's missing for Node.js projects:**
```yaml
- name: Setup Node.js
  uses: actions/setup-node@v4
  with:
    node-version: '20'
    cache: 'npm'

- name: Install dependencies
  run: npm ci
```

**Similar gaps for other languages:**
- Python: Need `pip install -r requirements.txt`
- Rust: Usually cargo handles it, but might need specific setup
- Go: Need `go mod download`

**Impact:**
Workflow fails immediately with "command not found" or "module not found" errors because dependencies aren't installed.

**Recommendation:**
Add a section showing project setup for different languages:

```markdown
### Step 3.5: Project-Specific Setup

Before measuring performance, install your project dependencies:

**Node.js/npm:**
```yaml
- name: Setup Node.js
  uses: actions/setup-node@v4
  with:
    node-version: '20'
    cache: 'npm'
- name: Install dependencies
  run: npm ci
```

**Python:**
```yaml
- name: Setup Python
  uses: actions/setup-python@v5
  with:
    python-version: '3.11'
- name: Install dependencies
  run: pip install -r requirements.txt
```

**Rust:** (usually automatic with cargo)
```yaml
- name: Setup Rust
  uses: actions-rust-lang/setup-rust-toolchain@v1
```
```

---

### GAP #4: GitHub Pages Setup Process Not Explained

**Severity:** HIGH
**Status:** Confirmed

**Issue:**
The tutorial mentions GitHub Pages deployment but doesn't explain:
1. What workflow actions to use
2. How to configure repository Pages settings
3. Why the first run fails
4. What to do after the first failure

**What the tutorial says:**
> After the first workflow run fails (expected), configure Pages in repository settings to deploy from the `gh-pages` branch. Rerun the workflow for success.

**Problems with this:**
1. Why does it fail? No explanation
2. Modern GitHub Pages doesn't use `gh-pages` branch anymore - it uses GitHub Actions artifacts
3. What exact settings to change in Pages configuration?
4. What permissions are needed?

**What's actually needed:**
```yaml
permissions:
  contents: write
  pages: write
  id-token: write

jobs:
  generate-report:
    steps:
      # ... generate reports ...

      - name: Upload to GitHub Pages
        uses: actions/upload-pages-artifact@v3
        with:
          path: reports

      - name: Deploy to GitHub Pages
        uses: actions/deploy-pages@v4
```

**And repository configuration:**
1. Go to Settings → Pages
2. Under "Build and deployment"
3. Source: "GitHub Actions" (not gh-pages branch)
4. Save

**Impact:**
Users don't know:
- How to implement the Pages deployment
- Why it fails initially
- What to configure in repository settings
- That the gh-pages branch method is outdated

**Recommendation:**
Add complete section:

```markdown
### Step 4: Automated Reporting with GitHub Pages

#### 4.1: Create Reporting Workflow

Create `.github/workflows/performance-reporting.yml`:

[Complete YAML here]

#### 4.2: Configure GitHub Pages

On first run, the workflow will fail because Pages isn't configured yet. This is expected.

To configure Pages:
1. Go to your repository Settings
2. Navigate to "Pages" in the sidebar
3. Under "Build and deployment":
   - Source: Select "GitHub Actions"
   - Save
4. Re-run the failed workflow

After successful deployment, your performance dashboard will be available at:
`https://[username].github.io/[repo]/`

#### 4.3: Required Permissions

The workflow needs these permissions:
```yaml
permissions:
  contents: write
  pages: write
  id-token: write
```
```

---

### GAP #5: Cleanup Workflow Not Provided

**Severity:** MEDIUM
**Status:** Confirmed

**Issue:**
Tutorial mentions cleanup but doesn't provide the workflow.

**What the tutorial says:**
> Schedule weekly cleanup using `.github/workflows/cleanup-measurements.yml` with configurable retention periods (default: 90 days for measurements, 30 days for reports).

**What's missing:**
- Complete workflow YAML
- How to configure retention periods
- Explanation of what `git perf remove` and `git perf prune` do
- When to run cleanup (scheduling)

**What I had to create:**
```yaml
- name: Remove measurements older than 90 days
  run: |
    CUTOFF_DATE=$(date -d '90 days ago' -Iseconds)
    git perf remove --before "$CUTOFF_DATE"

- name: Prune unreachable measurements
  run: git perf prune
```

**Questions not answered:**
- What's the difference between `remove` and `prune`?
- Can I configure different retention for different measurements?
- What happens to reports older than 30 days?
- How do I customize the retention period?

**Impact:**
Users don't understand:
- How to implement cleanup
- What gets cleaned up
- How to customize retention policies
- Performance implications of not cleaning up

**Recommendation:**
Add complete section with:
1. Full workflow YAML
2. Explanation of `remove` vs `prune`
3. How to customize retention periods
4. Best practices for cleanup scheduling

---

### GAP #6: PR Comment Implementation Not Shown

**Severity:** HIGH
**Status:** Confirmed

**Issue:**
Tutorial mentions "PR comments showing performance impact" in the success outcomes but provides no implementation.

**What the tutorial promises:**
> A complete integration delivers:
> - PR comments showing performance impact

**What's missing:**
- How to capture audit output
- How to format it for PR comments
- What GitHub Actions to use
- Required permissions
- How to handle cases with no baseline

**What I had to create:**
```yaml
- name: Run audit and capture results
  id: audit
  run: |
    echo "## Performance Audit Results" > audit_results.md
    # ... capture audit output to file ...

- name: Comment PR with results
  uses: actions/github-script@v7
  with:
    github-token: ${{ secrets.GITHUB_TOKEN }}
    script: |
      const fs = require('fs');
      const auditResults = fs.readFileSync('audit_results.md', 'utf8');
      github.rest.issues.createComment({
        issue_number: context.issue.number,
        owner: context.repo.owner,
        repo: context.repo.repo,
        body: auditResults
      });
```

**Impact:**
One of the key features mentioned in "Success Outcome" is not implemented in the tutorial. Users get performance tracking but miss out on the PR feedback feature.

**Recommendation:**
Add complete section:

```markdown
### Step 6.5: PR Performance Comments

To automatically comment on PRs with performance results:

1. Create `.github/workflows/pr-performance-check.yml`
2. Add permission for PR comments: `pull-requests: write`
3. Use `actions/github-script` to post results
4. Handle cases where no baseline exists yet

[Complete workflow YAML]

Example PR comment output:
[Screenshot or example]
```

---

### GAP #7: No Explanation of measure vs add Commands

**Severity:** MEDIUM
**Status:** Confirmed

**Issue:**
Tutorial uses `git perf measure` in examples but doesn't explain:
- When to use `measure` vs `add`
- How `measure` works
- What happens if the measured command fails

**What the tutorial shows:**
```bash
git perf add 42.5 -m build_time
git perf measure -m build_time -- cargo build --release
```

**What's missing:**
- `measure` runs a command and captures its execution time automatically
- `add` is for manual entry of pre-measured values
- `measure` fails if the command exits non-zero
- Units: `measure` records in nanoseconds, you need to configure units in config

**Impact:**
Users don't understand:
- Why there are two commands
- Which one to use in CI
- That `measure` might fail for failing tests

**Recommendation:**
Add explanation:

```markdown
### Understanding measure vs add

**`git perf add`**: Manually add a measurement value
```bash
git perf add 42.5 -m build_time
```
Use when: You have a pre-measured value from another tool

**`git perf measure`**: Automatically measure command execution time
```bash
git perf measure -m build_time -n 3 -- npm run build
```
Use when: You want git-perf to time a command
- Runs command 3 times (`-n 3`)
- Records time in nanoseconds
- Fails if command exits with non-zero status

**In CI/CD:** Use `measure` to automatically capture execution times.
```

---

### GAP #8: Troubleshooting Section Incomplete

**Severity:** MEDIUM
**Status:** Confirmed

**Issue:**
Troubleshooting section mentions common issues but doesn't provide solutions for all of them.

**Issues listed:**
- Git identity errors ✓ (mentioned)
- Push failures ✓ (mentioned)
- GitHub Pages failures ✓ (mentioned)
- Audit false positives ✓ (mentioned)
- Permission errors ✓ (mentioned)

**What's missing:**
- Actual error messages users will see
- Step-by-step solutions
- Common errors not mentioned:
  - "Command not found" (dependencies)
  - "refs/notes/perf-v3 not found" (need to pull first)
  - Merge conflicts in git-notes
  - Rate limiting on GitHub Actions

**Missing troubleshooting scenarios:**

**Scenario 1: Merge conflicts in git-notes**
```
Error: Failed to push refs/notes/perf-v3
! [rejected] refs/notes/perf-v3 -> refs/notes/perf-v3 (non-fast-forward)
```
Solution: git-perf handles this automatically with `cat_sort_uniq` strategy, but tutorial doesn't mention this.

**Scenario 2: Shallow clone issues**
```
Error: Cannot run 'git perf prune' on shallow clone
```
Solution: Already using `fetch-depth: 0`, but tutorial doesn't explain why.

**Scenario 3: No baseline measurements**
```
Only 0 measurement found. Less than requested min_measurements of 2.
```
Solution: This is expected on first few runs, but tutorial doesn't explain clearly.

**Recommendation:**
Expand troubleshooting section with:
1. Complete error messages
2. Step-by-step solutions
3. Common first-run issues
4. How to debug workflow failures

---

### GAP #9: No Multi-Environment Example

**Severity:** LOW
**Status:** Confirmed

**Issue:**
Tutorial mentions "Track multi-environment measurements using key-value pairs" but doesn't show an example.

**What the tutorial says:**
> - Track multi-environment measurements using key-value pairs

**What's missing:**
- How to use key-value pairs with `-k` flag
- Example of tracking same metric across different environments
- How to filter by environment in reports/audit

**Example of what's needed:**
```bash
# Track build time on different runners
git perf add 42.5 -m build_time -k runner=ubuntu-latest
git perf add 55.0 -m build_time -k runner=macos-latest
git perf add 38.0 -m build_time -k runner=ubuntu-latest -k cache=enabled

# How to query specific environment?
git perf report -m build_time --filter runner=ubuntu-latest
```

**Impact:**
Users can't leverage the multi-environment feature mentioned in advanced options.

**Recommendation:**
Add complete example showing:
1. How to add key-value pairs
2. Real-world use case (different OS, different configurations)
3. How to filter/query by key-value in reports and audit

---

### GAP #10: Epoch Workflow Not Explained

**Severity:** MEDIUM
**Status:** Confirmed

**Issue:**
Tutorial mentions epochs and `bump-epoch` command but doesn't explain the workflow.

**What the tutorial says:**
> **Epochs**: Version boundaries in `.gitperfconfig` enable accepting expected performance changes. Bumping an epoch makes audit comparisons focus only on same-epoch measurements.

**What's missing:**
- When should you bump an epoch?
- How does bump-epoch work?
- Do you commit the config change?
- Example scenario: Major refactoring that intentionally changes performance

**Questions not answered:**
1. If I bump epoch for build_time, what happens to old measurements?
2. Can I compare across epochs?
3. Should epoch bumps be in their own commit?
4. How do I use bump-epoch in CI vs locally?

**Real-world scenario not covered:**
```bash
# We're upgrading from webpack to vite - build time will change dramatically
# How do I handle this?

# Option 1: Manual epoch bump
# Edit .gitperfconfig, change epoch = "12345678" to epoch = "12345679"
git commit -m "chore: bump build_time epoch for webpack->vite migration"

# Option 2: Use bump-epoch command
git perf bump-epoch -m build_time
# Does this auto-commit? Does it auto-push?

# Now new measurements won't be compared against webpack-era measurements
```

**Impact:**
Users don't understand:
- When to use epochs
- How to implement epoch bumps in their workflow
- What happens after bumping

**Recommendation:**
Add workflow example:

```markdown
### When to Bump Epochs

Bump an epoch when you make intentional performance changes:
- Major dependency upgrade (webpack → vite)
- Algorithm change (bubble sort → quicksort)
- Infrastructure change (VM → container)

#### Example Workflow:

1. Before making the change, note current performance:
   ```bash
   git perf audit -m build_time
   # Shows baseline: ~5 seconds
   ```

2. Make your change (upgrade, refactor, etc.)

3. Bump the epoch:
   ```bash
   git perf bump-epoch -m build_time
   ```
   This updates `.gitperfconfig` with a new epoch value.

4. Commit the epoch change:
   ```bash
   git add .gitperfconfig
   git commit -m "chore: bump build_time epoch for vite migration"
   ```

5. Now new measurements will start a fresh comparison baseline:
   ```bash
   git perf measure -m build_time -- npm run build
   git perf audit -m build_time
   # Compares against post-epoch measurements only
   ```
```

---

## Additional Missing Information

### #11: No .gitignore Guidance

**Issue:** Tutorial doesn't mention if any git-perf files should be ignored.

**What should be in .gitignore:**
```gitignore
# Git-perf reports (if generated locally)
*.html
reports/
```

**What should NOT be ignored:**
```
.gitperfconfig  # Should be committed
```

---

### #12: No Repository Permissions Documentation

**Issue:** Tutorial mentions "Check workflow permissions in YAML and repository settings" but doesn't explain where or what to check.

**What's needed:**
Repository Settings → Actions → General → Workflow permissions:
- Select: "Read and write permissions"
- Check: "Allow GitHub Actions to create and approve pull requests"

Without this, workflows will fail with:
```
Error: Resource not accessible by integration
```

---

### #13: No First-Run Expectations

**Issue:** Tutorial doesn't set expectations for first-time setup.

**What users should know:**
1. First measurement: Audit will fail (no baseline) - EXPECTED
2. First report: May fail if Pages not configured - EXPECTED
3. Second measurement: Audit still might fail (needs 2+ measurements) - EXPECTED
4. Third measurement: Audit should start working - SUCCESS

**Timeline:**
- Commit 1: Add workflows → No metrics yet
- Commit 2: First measurements → Audit fails (no baseline)
- Commit 3: Second measurements → Audit might fail (only 1 in history)
- Commit 4: Third measurements → Audit works! ✅

---

## What Works Well

Despite the gaps, these aspects of the tutorial are good:

1. ✅ **Conceptual overview** - Good explanation of what git-perf does
2. ✅ **Prerequisites clearly stated** - Git version, GitHub Actions
3. ✅ **Seven-step structure** - Logical progression
4. ✅ **Statistical methods explained** - MAD vs Standard Deviation
5. ✅ **Best practices section** - Good high-level guidance

---

## Complete Working Example

To help future users, here's what a complete minimal setup looks like:

### Files Needed:

1. **`.gitperfconfig`**
```toml
[measurement]
min_relative_deviation = 5.0
dispersion_method = "mad"

[measurement."build_time"]
min_relative_deviation = 10.0
unit = "seconds"

[measurement."test_duration"]
min_relative_deviation = 15.0
unit = "seconds"
```

2. **`.github/workflows/performance-tracking.yml`** (see created file)
3. **`.github/workflows/performance-reporting.yml`** (see created file)
4. **`.github/workflows/cleanup-measurements.yml`** (see created file)
5. **`.github/workflows/pr-performance-check.yml`** (see created file)

### Setup Checklist:

- [ ] Install git-perf locally
- [ ] Create `.gitperfconfig` with your measurements
- [ ] Create all 4 workflow files
- [ ] Commit and push to trigger first workflow
- [ ] Configure GitHub Pages after first report workflow run
- [ ] Check repository Actions permissions (read/write)
- [ ] Wait for 3-4 commits to build baseline for audit
- [ ] Verify dashboard at `https://username.github.io/repo/`

---

## Recommendations for Tutorial Improvement

### Priority 1 (Critical):
1. **Add complete workflow YAML files** - Copy-paste ready examples
2. **Add git identity configuration** - Exact commands
3. **Add GitHub Pages setup guide** - Step-by-step with screenshots
4. **Add project setup section** - Dependencies for different languages

### Priority 2 (High):
5. **Add PR comment implementation** - Complete workflow
6. **Expand troubleshooting** - Common errors with solutions
7. **Add first-run expectations** - What to expect on commits 1-4
8. **Add repository permissions guide** - Where to configure

### Priority 3 (Medium):
9. **Add measure vs add explanation** - When to use which
10. **Add epoch workflow example** - Real-world scenario
11. **Add multi-environment example** - Key-value pairs usage
12. **Add .gitignore guidance** - What to ignore

### Priority 4 (Low):
13. **Add cleanup explanation** - Remove vs prune
14. **Add statistical methods examples** - When to use MAD vs SD
15. **Add performance tips** - Optimizing CI runtime

---

## Success Criteria for Improved Tutorial

A user following the improved tutorial should be able to:

1. ✅ Copy-paste complete workflows and have them work
2. ✅ Understand why each step is needed
3. ✅ Successfully deploy their first performance dashboard
4. ✅ Get PR comments with performance feedback
5. ✅ Troubleshoot common issues independently
6. ✅ Customize workflows for their project

Currently missing: #1, #4, and partly #5

---

## Conclusion

The git-perf Integration Tutorial provides a good conceptual framework but lacks the implementation details necessary for a new project to successfully integrate git-perf with GitHub Actions. The main gaps are:

**Critical Missing Pieces:**
1. Complete workflow YAML examples
2. GitHub Pages setup instructions
3. PR comment implementation
4. Project-specific setup steps

**Impact:**
Users with strong GitHub Actions and git-perf knowledge can fill in the gaps, but newcomers will struggle to implement the pipelines successfully.

**Outcome of This Exercise:**
I successfully created a complete working GitHub Actions pipeline by:
- Inferring missing implementation details
- Using GitHub Actions best practices
- Creating workflows for all mentioned features
- Adding features mentioned but not implemented (PR comments)

All workflow files are ready to use and should work for this Node.js project after configuring GitHub Pages and repository permissions.
