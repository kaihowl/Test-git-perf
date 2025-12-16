# Git-Perf Integration Guide Gap Analysis

**Date:** 2025-12-16
**Repository:** kaihowl/Test-git-perf
**Git-perf Version:** 0.2.0
**Integration Guide URL:** https://github.com/kaihowl/git-perf

## Executive Summary

I followed the git-perf integration guide from https://github.com/kaihowl/git-perf step-by-step and documented all gaps, problems, and missing information. While the basic workflow commands work, there are several critical issues that prevent successful integration:

1. **CRITICAL:** The `import` command featured prominently in the guide does not exist in v0.2.0
2. Version mismatch between installer output and actual installed version
3. Missing prerequisites section (dependencies installation)
4. Incomplete explanation of commit-based audit workflow
5. Storage location documentation mismatch
6. No feedback/progress indicators on commands

## Test Environment

- **Platform:** Linux 6.1.158
- **Node.js:** v20+ (npm based project)
- **Git:** Available
- **Project Type:** TypeScript/Jest-based demo-utils library
- **Repository:** https://github.com/kaihowl/Test-git-perf.git
- **Branch:** terragon/review-gitperf-integration-69m0q9

---

## Gaps and Problems Found

### GAP #1: Version Mismatch Between Installer and Binary

**Severity:** Medium
**Status:** Confirmed

**Issue:**
The installer reports installing "git-perf 0.18.0" but the actual installed binary reports version "git-perf 0.2.0".

**Steps to Reproduce:**
```bash
$ curl --proto '=https' --tlsv1.2 -LsSf https://github.com/kaihowl/git-perf/releases/latest/download/git-perf-installer.sh | sh
# Output: downloading git-perf 0.18.0 x86_64-unknown-linux-gnu

$ git perf --version
# Output: git-perf 0.2.0
```

**Impact:**
Users cannot determine which version they actually have installed, leading to confusion about which features are available.

**Recommendation:**
Fix version reporting consistency between installer and binary.

---

### GAP #2: Missing Prerequisites Section

**Severity:** High
**Status:** Confirmed

**Issue:**
The integration guide jumps straight into the basic workflow without mentioning that project dependencies must be installed first. Additionally, for JUnit import functionality, the guide doesn't mention installing the JUnit reporter package.

**Steps to Reproduce:**
```bash
# Following guide exactly after installation
$ npm test
# Error: sh: 1: jest: not found

# For JUnit import attempt
$ npm test -- --reporters=jest-junit
# Error: Could not resolve a module for a custom reporter. Module name: jest-junit
```

**Required steps not mentioned in guide:**
```bash
npm install                           # Install project dependencies
npm install --save-dev jest-junit     # For JUnit XML generation
```

**Impact:**
First-time users encounter immediate failures when trying to follow the guide.

**Recommendation:**
Add a "Prerequisites" section before "Basic workflow" that includes:
1. Installing project dependencies
2. Installing test reporters for JUnit XML generation (jest-junit, pytest-junit, etc.)
3. Verifying git repository is initialized

---

### GAP #3: CRITICAL - `import` Command Does Not Exist

**Severity:** CRITICAL
**Status:** Confirmed

**Issue:**
The integration guide features the `git perf import junit` command prominently in the "Data Import" section, but this command does not exist in version 0.2.0.

**Guide shows:**
```bash
cargo nextest run --profile ci
git perf import junit target/nextest/ci/junit.xml
git perf audit --measurement "test::*"
```

**Actual result:**
```bash
$ git perf import junit junit.xml
error: unrecognized subcommand 'import'
  tip: a similar subcommand exists: 'report'
```

**Available commands in v0.2.0:**
- measure
- add
- push
- pull
- report
- audit
- bump-epoch
- remove
- prune
- list-commits

**Impact:**
The entire "Data Import" section of the guide is unusable. Users cannot import JUnit XML or Criterion JSON as described.

**Recommendation:**
Either:
1. Remove the import section entirely from the guide until the feature is implemented
2. Add a version note indicating which version will support `import`
3. Update the guide to show the current workaround (if any exists)
4. Clarify if `import` was removed from an earlier version and why

---

### GAP #4: Audit Workflow Not Explained

**Severity:** High
**Status:** Confirmed

**Issue:**
The guide shows running `git perf audit` immediately after `git perf add`, but doesn't explain that:
1. Audit requires at least 2 measurements (configurable via `--min-measurements`)
2. Measurements must be on different commits, not all on HEAD
3. Audit compares HEAD against historical commit measurements
4. The workflow requires creating commits between measurements

**Guide shows:**
```bash
git perf add 42.5 -m build_time
git perf audit -m build_time
git perf push
```

**Actual result when following guide:**
```bash
$ git perf add 42.5 -m build_time
$ git perf audit -m build_time
⏭️ 'build_time'
Only 0 measurement found. Less than requested min_measurements of 2. Skipping test.
```

**Why it fails:**
- Audit looks at ancestor commits, not HEAD
- Need measurements on at least 2 different ancestor commits
- The guide doesn't explain you need to commit code between measurements

**Working example:**
```bash
# On commit A
git perf add 42.5 -m build_time
git commit -m "some change"

# On commit B (child of A)
git perf add 45.0 -m build_time
git commit -m "another change"

# On commit C (child of B)
git perf add 39.5 -m build_time

# Now audit works - compares commit C against ancestors A and B
git perf audit -m build_time
✅ 'build_time'
```

**Impact:**
Users don't understand the fundamental workflow and get immediate failures when following the guide.

**Recommendation:**
Add a section explaining:
1. Git-perf tracks performance OVER TIME across commits
2. Audit compares current commit against historical performance
3. You need to add measurements to multiple commits to use audit
4. Provide a complete example showing commits between measurements

---

### GAP #5: Storage Location Documentation Mismatch

**Severity:** Low
**Status:** Confirmed

**Issue:**
The guide states "Performance data stores in `refs/notes/perf-v3`" but measurements are actually written to `refs/notes/perf-v3-write` initially, and only copied to `refs/notes/perf-v3` after a `git perf push`.

**Guide states:**
> Storage Model: Performance data stores in `refs/notes/perf-v3` as line-delimited field-separated records.

**Actual behavior:**
```bash
$ git perf add 42.5 -m build_time
$ git show-ref | grep perf-v3
refs/notes/perf-v3-write            # Measurements written here first
refs/notes/perf-v3-write-9dbafc52   # Additional write ref

$ git perf push
# Now refs/notes/perf-v3 is created

$ git show-ref | grep perf-v3
refs/notes/perf-v3                   # Read ref created after push
refs/notes/perf-v3-write
refs/notes/perf-v3-write-9dbafc52
```

**Impact:**
Users trying to debug or inspect measurements using `git notes --ref=refs/notes/perf-v3 show HEAD` will fail if they haven't pushed yet. Minor confusion about the internal mechanism.

**Recommendation:**
Update the guide to explain:
1. Measurements are written to `refs/notes/perf-v3-write` locally
2. The `refs/notes/perf-v3` ref is created/updated during push/pull
3. Add commands to inspect local measurements: `git notes --ref=refs/notes/perf-v3-write show HEAD`

---

### GAP #6: No Feedback from Commands

**Severity:** Medium
**Status:** Confirmed

**Issue:**
The `git perf add` and `git perf measure` commands run silently with no output, even when successful. Users cannot tell if the command worked or is hanging.

**Examples:**
```bash
$ git perf add 42.5 -m build_time
# ... no output at all

$ git perf measure -m build_time -n 3 -- npm run build
# ... no output during ~10 second build process
# ... no output when complete
```

**Impact:**
- Users don't know if long-running `measure` commands are working or frozen
- No confirmation that `add` succeeded
- Poor user experience, especially for CI/CD integration

**Recommendation:**
Add output/feedback:
- `add`: Print confirmation like "✓ Added measurement: build_time=42.5 to commit abc123"
- `measure`: Show progress indicator or verbose output:
  - "Running iteration 1/3..."
  - "Iteration 1: 2.7s"
  - "Average: 2.8s (added as 2800000000 ns)"

---

### GAP #7: `measure` Command Fails on Non-Zero Exit Codes

**Severity:** Medium
**Status:** Confirmed

**Issue:**
The `git perf measure` command fails when the measured command exits with a non-zero status code, even though you may want to measure performance of failing tests.

**Example:**
```bash
$ git perf measure -m test_suite -n 3 -- npm test
Error: Command 'npm' failed to run:
# ... test output showing 2 failed tests
```

**Impact:**
Cannot measure performance of test suites with failing tests, which is a common use case during development.

**Recommendation:**
Add an option like `--ignore-exit-code` or `--allow-failure` to measure commands that may fail.

---

### GAP #8: Epoch Configuration Not Explained

**Severity:** Medium
**Status:** Partial (mentioned but not explained)

**Issue:**
The guide shows epoch configuration but doesn't explain:
1. What epochs are used for
2. How to choose an epoch value
3. What happens when epochs don't match
4. When to use `bump-epoch` command

**From guide:**
```toml
[measurement."build_time"]
epoch = "12345678"
```

**What's missing:**
- Why is the value "12345678"? Is it arbitrary?
- What happens if my measurements have epoch "0" but config says "12345678"?
- When should I bump the epoch?
- How do epochs relate to audit?

**Impact:**
Users see audit failures due to epoch mismatches and don't understand why:
```bash
⏭️ 'build_time'
Only 0 measurement found. Less than requested min_measurements of 2. Skipping test.
# Actual cause: epoch mismatch filtered out all measurements
```

**Recommendation:**
Add detailed explanation:
- Epochs group measurements for comparison (only same-epoch measurements are compared)
- When you intentionally change performance (algorithm, dependencies), bump epoch
- Epoch values are arbitrary identifiers (could use date: "20251216")
- Show how to check current epoch in measurements
- Explain `bump-epoch` command usage

---

### GAP #9: Remote Setup Behavior Unclear

**Severity:** Low
**Status:** Works but undocumented

**Issue:**
The guide mentions `git-perf-origin` remote but doesn't show when/how it's created.

**What the guide says:**
> `git perf push`/`pull` automatically use a `git-perf-origin` remote, auto-creating it from your `origin` URL if needed.

**Actual behavior (verified):**
```bash
$ git remote -v
origin  https://github.com/kaihowl/Test-git-perf.git (fetch)

$ git perf push
# ... push happens

$ git remote -v
git-perf-origin  https://github.com/kaihowl/Test-git-perf.git (fetch)
git-perf-origin  https://github.com/kaihowl/Test-git-perf.git (push)
origin           https://github.com/kaihowl/Test-git-perf.git (fetch)
```

**Impact:**
Minor - users might be confused about the extra remote appearing, but it works correctly.

**Recommendation:**
Add a note that `git-perf-origin` will be automatically created on first push if it doesn't exist, and users can verify with `git remote -v`.

---

### GAP #10: No Option to Add Measurements to Past Commits

**Severity:** Medium
**Status:** Confirmed

**Issue:**
There's no way to add measurements to commits other than HEAD. This makes it harder to populate historical data.

**Attempted:**
```bash
$ git perf add 50.0 -m build_time --commit eae6fd0
error: unexpected argument '--commit' found

$ git perf add --help
# No option for specifying commit
```

**Impact:**
- Cannot backfill historical data without checking out each commit
- Harder to set up initial baseline measurements

**Recommendation:**
Consider adding a `--commit <SHA>` option to `add` command, or document the workaround (checkout commit, add measurement, checkout back).

---

### GAP #11: Wildcard Pattern Support Not Demonstrated

**Severity:** Low
**Status:** Mentioned but not explained

**Issue:**
The guide mentions wildcard patterns like `test::*` and `measurement."test::*"` but doesn't explain:
- What the double-colon convention means
- How wildcards work in audit
- How to structure measurement names for wildcards

**From guide:**
```bash
git perf audit --measurement "test::*"
```

**What's missing:**
- Examples of measurement naming conventions
- Do wildcards work with `add` or only `audit`/`report`?
- Can you use other patterns like `*::performance` or `test::unit::*`?

**Impact:**
Minor - users may not leverage the pattern matching capabilities effectively.

**Recommendation:**
Add examples showing:
```bash
# Hierarchical naming
git perf add 100 -m "test::unit::string_utils"
git perf add 250 -m "test::integration::api"

# Audit all tests
git perf audit -m "test::*"

# Audit only unit tests
git perf audit -m "test::unit::*"
```

---

### GAP #12: No Explanation of Statistical Methods

**Severity:** Low
**Status:** Mentioned but not explained

**Issue:**
The guide mentions "Standard Deviation" and "Median Absolute Deviation (MAD)" but doesn't explain when to use which.

**From guide:**
> **Statistical Analysis**: Two dispersion methods available:
> - *Standard Deviation*: Best for normally distributed, stable data
> - *Median Absolute Deviation (MAD)*: Recommended for outlier-prone environments

**What's missing:**
- How to determine if your data is "outlier-prone"
- Examples of when each method is appropriate
- What the numbers in audit output mean (z-score, μ, σ, MAD, n)

**Audit output example:**
```
✅ 'build_time'
z-score (mad): ↓ 0.28
Head: μ: 39.500 σ: 0.000 MAD: 0.000 n: 1
Tail: μ: 40.000 σ: 2.546 MAD: 1.800 n: 2
```

**Impact:**
Minor - default works, but users may not understand the output or know when to change methods.

**Recommendation:**
Add a section explaining:
- μ (mu) = mean/average
- σ (sigma) = standard deviation
- MAD = median absolute deviation
- n = number of measurements
- z-score = how many standard deviations from mean
- When to use MAD (CI environments, inconsistent runners)

---

## What Works (Verified Working Commands)

### Installation ✅
```bash
curl --proto '=https' --tlsv1.2 -LsSf https://github.com/kaihowl/git-perf/releases/latest/download/git-perf-installer.sh | sh
```

### Configuration ✅
```toml
# .gitperfconfig
[measurement]
min_relative_deviation = 5.0
dispersion_method = "mad"
epoch = "00000000"

[measurement."build_time"]
min_relative_deviation = 10.0
unit = "ms"
epoch = "305419896"  # Must match actual epoch in measurements
```

### Add Single Measurement ✅
```bash
git perf add 42.5 -m build_time
```

### Measure Command Runtime ✅
```bash
git perf measure -m build_time -n 3 -- npm run build
```

### Audit Performance ✅ (with historical data)
```bash
git perf audit -m build_time
```

### Push to Remote ✅
```bash
git perf push
```

### Pull from Remote ✅
```bash
git perf pull
```

### Generate HTML Report ✅
```bash
git perf report -m build_time -o output.html
```

### List Commits with Measurements ✅
```bash
git perf list-commits
```

---

## Commands That Don't Work

### Import (Does Not Exist) ❌
```bash
git perf import junit junit.xml
# Error: unrecognized subcommand 'import'
```

### Add with Incorrect Syntax (if following old docs) ❌
Note: Current guide shows correct syntax, but some older references might show:
```bash
git perf add build_time 42.5  # Wrong - missing -m flag
# Correct:
git perf add -m build_time 42.5  # Right
```

---

## Recommended Guide Improvements

### Priority Order:

1. **CRITICAL - Fix Import Section:**
   - Remove `import` command references OR
   - Add version note: "Import feature coming in v0.3.0" OR
   - Document the workaround/alternative

2. **HIGH - Add Prerequisites Section:**
   ```markdown
   ## Prerequisites

   Before using git-perf, ensure:

   1. Git repository is initialized
   2. Project dependencies are installed:
      ```bash
      npm install  # or your package manager
      ```
   3. (Optional) For JUnit import, install reporter:
      ```bash
      npm install --save-dev jest-junit
      ```
   ```

3. **HIGH - Explain Commit-Based Workflow:**
   ```markdown
   ## How Git-Perf Works

   Git-perf tracks performance OVER TIME across commits:

   1. Make measurements on different commits:
      ```bash
      # Commit A
      git perf add 42.5 -m build_time
      git commit -m "initial version"

      # Commit B
      git perf add 45.0 -m build_time
      git commit -m "added feature"

      # Commit C
      git perf add 39.5 -m build_time
      ```

   2. Audit compares HEAD against ancestor commits:
      ```bash
      git perf audit -m build_time
      # Compares commit C (39.5) against ancestors A and B
      ```
   ```

4. **MEDIUM - Add Feedback/Progress:**
   - Update tools to provide user feedback
   - Or document that silence means success

5. **MEDIUM - Explain Epochs:**
   ```markdown
   ## Epochs

   Epochs group measurements for comparison. When you make an intentional
   performance change (new algorithm, updated dependencies), bump the epoch
   to start fresh comparison:

   ```bash
   git perf bump-epoch -m build_time
   ```

   Measurements with different epochs won't be compared.
   ```

6. **LOW - Document Storage Mechanism:**
   ```markdown
   ## How It Works (Under the Hood)

   Measurements are stored as git notes:
   - Write: `refs/notes/perf-v3-write` (local)
   - Read: `refs/notes/perf-v3` (after push/pull)

   Inspect measurements:
   ```bash
   git notes --ref=refs/notes/perf-v3-write show HEAD
   ```
   ```

---

## Testing Checklist for Guide Validation

When updating the guide, verify these work:

- [ ] Fresh installation on clean system
- [ ] `npm install` mentioned before any npm commands
- [ ] Basic workflow commands work in sequence
- [ ] Audit works with >= 2 commits
- [ ] Epoch configuration explained and correct
- [ ] Remove or fix import section
- [ ] All example commands are tested and work
- [ ] Remote push/pull works
- [ ] Report generation works

---

## Summary

The git-perf integration guide provides a good overview but has critical gaps that prevent successful integration:

**Most Critical Issues:**
1. `import` command doesn't exist (guide's main feature)
2. Audit workflow not explained (causes immediate failure)
3. Missing prerequisites (can't run any commands)

**Quick Wins:**
1. Add prerequisites section
2. Remove/fix import section
3. Add working example of commit-based workflow

The basic commands (`add`, `measure`, `audit`, `push`, `report`) all work correctly once you understand the commit-based workflow and have proper setup. With guide improvements, this tool can be very useful for tracking performance over time.
