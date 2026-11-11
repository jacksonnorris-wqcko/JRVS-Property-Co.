# ChatGPT Development Continuity — JRVS Property Co.

This document defines how ChatGPT should preserve project continuity when a conversation reaches its usage limit or is moved to a new chat.

## The continuity principle

**Never rely on the previous conversation being available. GitHub must contain the latest usable handover while work is happening.**

The user may hit a ChatGPT limit without being able to ask for a summary, a handover or a final prompt. For that reason, the handover is part of normal development work, not an end-of-chat activity.

- `PROJECT_STATUS.md` is the living handover and records the exact current state and next action.
- `NEW_CHAT_PROMPT.md` is the reusable prompt the user can paste into a fresh conversation.
- `npm run handover:check` validates the live desktop version against this status document and checks that the new-chat/continuity instructions are present; the Windows CI build runs this check.
- The GitHub repository and latest commits are the source of truth for application code.
- The previous chat is useful context when available, but must never be required to resume safely.

## Required checkpoint rhythm

### 1. Before substantial work — checkpoint first

Before editing application code for a task with multiple steps:

1. Fetch the current `desktop-transition` head and inspect relevant files.
2. Update `PROJECT_STATUS.md` with:
   - the task currently being worked on;
   - the user's requested outcome and constraints;
   - planned files/areas to inspect or change;
   - the first implementation/test checkpoint;
   - known risks or things that must not be changed.
3. Commit this checkpoint to `desktop-transition` before the main implementation.

This ensures that an unexpected end to the conversation still leaves the next chat with the task and intent, even if no code change was completed.

### 2. During implementation — save progress in small milestones

After each meaningful milestone, update `PROJECT_STATUS.md` and commit the relevant code and status together when practical.

Examples of meaningful milestones:

- diagnosis completed and root cause identified;
- first implementation committed;
- one feature or workflow completed;
- build/test result received;
- test failure identified and narrowed down;
- release candidate prepared.

Do not wait for the whole feature to be finished before updating the handover. If a task needs several commits, keep the status file aligned with the latest checkpoint.

### 3. After testing — record evidence, not assumptions

Record exactly what happened:

- **Implemented:** code is present.
- **Local check passed:** a stated local validation passed.
- **Windows CI passed:** the relevant GitHub Actions run for the relevant commit passed.
- **User-tested:** the user confirmed the behaviour in the installed/running app.
- **Not verified:** testing has not happened or the available evidence is insufficient.

Do not turn a successful compile into a claim that data migration, backup restoration, offline operation, RAW processing or installer upgrades are proven.

For a bug, retain the reproduction details, affected tab/window size, observed behaviour, relevant files and next diagnostic action.

### 4. At the end of a task or before changing topics

Update the status file with:

- what changed and which commits contain the change;
- what was tested and the actual result;
- what remains unfinished;
- the single clearest next action;
- any decision that must not be revisited without the user's approval.

A final chat response is useful, but the committed status file is the durable record.

## What the living handover must contain

Keep `PROJECT_STATUS.md` useful and current. It should always state:

1. Repository and active branch.
2. Current desktop application version.
3. Stable/fallback branch and what must remain untouched.
4. Current task and the exact next action.
5. Recently completed work and the commits/files that contain it.
6. Important fixed decisions and product constraints.
7. Testing completed, failed and not yet performed.
8. Outstanding risks and release-readiness checks.
9. Build/release rules and relevant technical reference files.

Avoid copying the entire commit history into the status document. The next chat can inspect GitHub history directly; the handover should explain what matters and where to continue.

## Branch and data safety rules

- Desktop development: `desktop-transition` only.
- Stable browser/PWA fallback: `main`; do not change it during desktop tasks.
- Inspect the live branch head before every task. A commit hash recorded in an old conversation is not proof it is still the head.
- Do not recreate working features from memory; inspect the current source first.
- Preserve the user's data and existing record IDs, relationships, photo originals/edits and number sequences.
- Do not perform destructive migrations or clear existing browser data as a shortcut.
- Preserve the established JRVS logo and brand palette.
- Keep release notes for the current release only in the release ZIP.

## When opening a new conversation

Follow `NEW_CHAT_PROMPT.md`. The new chat must:

1. Read `PROJECT_STATUS.md` and this file.
2. Inspect the live `desktop-transition` branch and current version configuration.
3. Read relevant release notes and source files.
4. Continue from the recorded next action.
5. Avoid asking the user to upload repository files when connected GitHub access can retrieve them.

## Important limitation

A new ChatGPT conversation cannot depend on the previous chat's private working context or an unfinished response. GitHub commits and the latest committed handover are the recovery mechanism. Therefore, checkpoint early and often; never save all continuity work for the end of a conversation.
