# Git-Perf Integration Guide - Gaps and Problems Report

**Date:** 2025-12-14
**Repository:** kaihowl/Test-git-perf
**Git-perf Version Tested:** 0.2.0 (installer claimed 0.18.0)

## Executive Summary

The Git-perf integration guide found at https://github.com/kaihowl/git-perf is significantly outdated and contains multiple inaccuracies that make it difficult to follow. The guide references commands and workflows that don't exist in the current version of the tool.

## Gaps and Problems Found

### GAP #1: Version Mismatch and Confusion
**Issue:** The installer output claims to be installing "git-perf 0.18.0" but the installed version reports as "git-perf 0.2.0"
```bash
# Installer output:
downloading git-perf 0.18.0 x86_64-unknown-linux-gnu

# Actual version:
$ git perf --version
git-perf 0.2.0
```
**Impact:** Users cannot determine which version they actually have installed.
**Recommendation:** Fix version reporting consistency between installer and binary.

---

### GAP #2: Missing Prerequisites in Quick Start
**Issue:** The integration guide doesn't mention that project dependencies need to be installed before running tests.
**What happened:** Attempted to run tests immediately after following the guide, but `jest` was not found.
```bash
$ npm run test:unit
sh: 1: jest: not found
```
**Impact:** First-time users will encounter immediate failures.
**Recommendation:** Add a prerequisites section that includes `npm install` or equivalent.

---

### GAP #3: JUnit Reporter Configuration Not Explained
**Issue:** The guide mentions importing JUnit XML but doesn't explain how to configure Jest to output JUnit format.
**What's missing:**
- Need to install `jest-junit` package
- Need to configure Jest with the reporter

**Steps required but not documented:**
```bash
npm install --save-dev jest-junit
npm run test:unit -- --reporters=default --reporters=jest-junit
```
**Impact:** Users cannot generate the required XML file format.
**Recommendation:** Add detailed instructions for configuring test frameworks to output JUnit XML.

---

### GAP #4: `import` Command Doesn't Exist
**Issue:** The integration guide prominently features the `git perf import junit` command, but this command doesn't exist in version 0.2.0.
```bash
$ git perf import junit ./junit.xml
error: unrecognized subcommand 'import'
```
**Available commands in 0.2.0:**
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

**Impact:** CRITICAL - The core workflow described in the guide cannot be followed.
**Recommendation:** Either update the guide to remove references to `import`, or clarify which version supports this command.

---

### GAP #5: Complete CLI Syntax Mismatch
**Issue:** The guide shows incorrect command syntax for `git perf add`.

**Guide shows:**
```bash
git perf add build_time 42.5
```

**Actual syntax required:**
```bash
git perf add -m build_time 42.5
# or
git perf add --measurement build_time 42.5
```

**Error when following guide:**
```bash
$ git perf add build_time 42.5
error: unexpected argument '42.5' found
```
**Impact:** Users cannot successfully add measurements by following the guide.
**Recommendation:** Update all command examples to use correct syntax with flags.

---

### GAP #6: `git-perf-origin` Remote Setup Unclear
**Issue:** The guide mentions that git-perf uses a special remote called `git-perf-origin` but:
- Doesn't show how to verify it's set up
- Doesn't appear in `git remote -v` output
- No clear documentation on how it works

**Expected behavior:** Should automatically use the `origin` remote
**Actual behavior:** Works, but users cannot verify the configuration
**Impact:** Users unsure if remote is configured correctly.
**Recommendation:** Add commands to verify remote setup and explain the internal mechanism.

---

### GAP #7: `audit` Command Workflow Not Explained
**Issue:** The quick start shows `git perf audit -m build_time` but doesn't explain that:
- Audit requires at least 2 measurements (configurable via `--min-measurements`)
- Measurements need to be on different commits, not all on HEAD
- Audit compares HEAD against historical commits

**What happened:**
```bash
$ git perf audit -m build_time
⏭️ 'build_time'
Only 0 measurement found. Less than requested min_measurements of 2. Skipping test.
```

**Why it failed:** All measurements were added to the same commit (HEAD), so there's no history to compare against.

**Impact:** Users don't understand the fundamental workflow of tracking performance over commits.
**Recommendation:** Add a section explaining the commit-based workflow and show an example spanning multiple commits.

---

### GAP #8: Configuration File Format Not Well Documented
**Issue:** The guide shows a basic `.gitperfconfig` example but doesn't explain:
- All available configuration options
- How measurement-specific configs override defaults
- The syntax for wildcard patterns like `[measurement."test::*"]`

**Impact:** Users cannot fully leverage configuration options.
**Recommendation:** Provide comprehensive configuration reference documentation.

---

### GAP #9: `measure` Command Provides No Feedback
**Issue:** When running `git perf measure` with a long-running command, there's no progress indicator or output.
```bash
$ git perf measure -m build_time -n 3 -- npm run build
# ... no output, unclear if running or hung
```
**Impact:** Users don't know if the command is working or frozen.
**Recommendation:** Add progress indicators or verbose output option.

---

### GAP #10: Data Storage Mechanism Not Explained
**Issue:** The guide doesn't explain that measurements are stored in git notes at `refs/notes/perf-v3`.
**What users should know:**
- Measurements are stored as git notes
- Can inspect them with `git notes --ref=refs/notes/perf-v3 show HEAD`
- They're pushed separately from regular commits

**Impact:** Users don't understand how the system works under the hood or how to troubleshoot.
**Recommendation:** Add an "How It Works" section explaining the git notes mechanism.

---

### GAP #11: Missing Examples for Complete Workflows
**Issue:** The guide shows individual commands but doesn't provide complete end-to-end examples like:
- Setting up CI/CD integration
- Measuring test performance over time
- Handling performance regressions in PRs
- Creating reports and interpreting them

**Impact:** Users struggle to see how to use git-perf in real-world scenarios.
**Recommendation:** Add comprehensive tutorials and real-world examples.

---

## Commands That Work (Verified)

### Installation
```bash
curl --proto '=https' --tlsv1.2 -LsSf https://github.com/kaihowl/git-perf/releases/latest/download/git-perf-installer.sh | sh
```
✅ Successfully installed git-perf 0.2.0

### Add Measurement
```bash
git perf add -m build_time 42.5
```
✅ Successfully added measurement

### Push Measurements
```bash
git perf push
```
✅ Successfully pushed to remote (with retry warning)

### List Commits with Measurements
```bash
git perf list-commits
```
✅ Successfully lists commits

### Generate Report
```bash
git perf report -m build_time -o output.html
```
✅ Successfully generated HTML report

---

## Commands That Don't Work (From Guide)

### Import (Doesn't Exist)
```bash
git perf import junit target/nextest/ci/junit.xml
```
❌ Command not found in v0.2.0

### Add (Incorrect Syntax in Guide)
```bash
git perf add build_time 42.5
```
❌ Fails - requires `-m` flag

### Audit (Requires Historical Data)
```bash
git perf audit -m build_time
```
❌ Fails when all measurements are on HEAD commit

---

## Recommendations Summary

1. **Update the guide** to match version 0.2.0 CLI syntax
2. **Remove references** to non-existent `import` command or clarify version availability
3. **Add prerequisites section** including dependency installation
4. **Document the commit-based workflow** more clearly
5. **Add troubleshooting section** with common errors
6. **Provide end-to-end examples** for real-world usage
7. **Fix version reporting** consistency
8. **Add progress indicators** to long-running commands
9. **Expand configuration documentation**
10. **Create a migration guide** if `import` command was removed from an older version

---

## Test Environment

- Platform: Linux 6.1.158
- Node.js: Latest (installed via npm)
- Git: Available in system
- Project: TypeScript/Jest-based demo-utils library
- Repository: https://github.com/kaihowl/Test-git-perf.git
