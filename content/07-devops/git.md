---
title: Git for SDETs
navTitle: Git
slug: git
category: devops
difficulty: beginner
order: 5
status: published
tags:
  - devops
  - git
  - version-control
related:
  - title: Maven
    url: /devops/maven/
  - title: GitHub Actions
    url: /devops/github-actions/
---

## Why this matters

Test code is code. It lives in a repository, ships through pull requests, and
runs in CI — all on top of Git. An SDET who is fluent in Git collaborates
cleanly, recovers from mistakes without panic, and reads history to understand
why a test changed. Shaky Git skills show up as broken branches, lost work, and
messy merges.

## The mental model

Git tracks snapshots of your project across three areas:

```text
Working directory  →  Staging area (index)  →  Repository (commits)
   (edit files)         (git add)                (git commit)
```

You edit files, **stage** the changes you want to keep together, then **commit**
them as a snapshot with a message. Branches are just movable pointers to
commits.

## The everyday commands

```bash
git clone <url>            # copy a remote repo locally
git status                 # what changed / what's staged
git add <file>             # stage specific files (prefer this over `git add .`)
git commit -m "message"    # snapshot the staged changes
git push                   # send commits to the remote
git pull                   # fetch + merge remote changes
```

<div class="callout callout--important">
<p class="callout__title">Stage deliberately</p>
<p>Prefer <code>git add path/to/file</code> over <code>git add .</code>. Staging
specific files keeps unrelated changes (and accidental secrets or debug output)
out of your commit, and makes each commit tell one coherent story.</p>
</div>

## Branching workflow

Feature branches keep work isolated until it's ready:

```bash
git switch -c feature/add-checkout-tests   # create + switch (modern form)
# ... work, commit ...
git push -u origin feature/add-checkout-tests
# open a pull request, review, merge to main
```

`git switch` and `git restore` are the modern, clearer replacements for the
overloaded `git checkout` (which did both branch-switching and file-restoring).

## Merge vs rebase

Both integrate changes; they shape history differently.

- **Merge** preserves the true history and creates a merge commit. Safe default,
  especially on shared branches.
- **Rebase** replays your commits on top of another branch for a linear history.
  Cleaner log, but rewrites commit hashes.

<div class="callout callout--warning">
<p class="callout__title">Never rebase shared history</p>
<p>Rebasing commits that others have already pulled rewrites history everyone
shares, causing painful conflicts. Rebase only your own local, unpushed work.
When in doubt on a shared branch, merge.</p>
</div>

## Resolving conflicts

A conflict happens when two branches change the same lines. Git marks them:

```text
<<<<<<< HEAD
timeout = Duration.ofSeconds(10)
=======
timeout = Duration.ofSeconds(15)
>>>>>>> feature/longer-timeout
```

Edit the file to the correct final state, remove the markers, then:

```bash
git add <file>       # mark the conflict resolved
git commit           # (or `git rebase --continue`)
```

## Undo and recovery — the safety net

| Situation | Command |
|---|---|
| Unstage a file | `git restore --staged <file>` |
| Discard local edits | `git restore <file>` |
| Amend the last (unpushed) commit | `git commit --amend` |
| Undo a commit, keep changes | `git reset --soft HEAD~1` |
| Revert a pushed commit safely | `git revert <hash>` |
| Temporarily shelve work | `git stash` / `git stash pop` |
| Recover "lost" commits | `git reflog` |

<div class="callout callout--realworld">
<p class="callout__title">Real world: reflog is your undo history</p>
<p>Think you lost commits after a bad reset or rebase? <code>git reflog</code>
shows where HEAD has been. The commits are almost always still there — check out
or reset to the hash. Very few things in Git are truly unrecoverable.</p>
</div>

## Reset vs revert

- `git reset` moves the branch pointer (rewrites history) — use on local,
  unpushed work.
- `git revert` creates a new commit that undoes a previous one (safe on shared
  branches, history preserved). This is the right tool to undo something already
  pushed.

## Common mistakes

- `git add .` sweeping up unrelated changes or secrets.
- Committing to `main` directly instead of a feature branch.
- `git reset --hard` on work you can't recover (destructive).
- Rebasing shared branches and breaking teammates' history.
- Vague commit messages ("fix", "update") that make history useless.

## Interview perspective

<div class="callout callout--interview">
<p class="callout__title">Interview tip</p>
<p>Know the three areas (working/staging/repo), merge vs rebase (and why not to
rebase shared history), and reset vs revert (local rewrite vs safe undo of a
pushed commit). Mentioning <code>git reflog</code> as a recovery tool signals
real-world confidence.</p>
</div>

## Practice

Create a feature branch, make two commits, then practice: amend the last commit
message, stash and restore a change, and undo a pushed commit with `git revert`
instead of `reset`.
