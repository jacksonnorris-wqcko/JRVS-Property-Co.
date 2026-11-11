# Start a New JRVS Property Co. Chat

Copy the prompt below into a new ChatGPT conversation whenever the previous JRVS chat reaches its usage limit. It is intentionally self-contained and points the new conversation to the durable GitHub handover.

---

## Copy-and-paste prompt

We're continuing the existing JRVS Property Co. application project. Do not restart the project or ask me to explain its history.

**GitHub repository:** https://github.com/jacksonnorris-wqcko/JRVS-Property-Co.  
**Desktop development branch:** `desktop-transition`  
**Stable browser/PWA branch:** `main` — read-only unless I explicitly request changes to it.

You have access to my connected GitHub repository. Use that access to continue directly from the existing code. Do not ask me to upload the project ZIP or HTML files while the GitHub connection is available.

### Mandatory first steps

1. Inspect the live repository and fetch the latest commit at `desktop-transition`. Do not trust a version number or commit hash from an old chat.
2. Read `PROJECT_STATUS.md` in full.
3. Read `docs/CHATGPT_CONTINUITY.md`.
4. Check the current desktop version in `package.json`, `src-tauri/Cargo.toml` and `src-tauri/tauri.conf.json`.
5. Read the latest desktop release notes and inspect the relevant source files before changing anything.
6. Confirm the current active task and next action recorded in `PROJECT_STATUS.md`.

### How to work

- Continue from the latest code and recorded next action. Do not rebuild from scratch.
- Make desktop changes only on `desktop-transition`. Never push desktop work to `main`.
- Before substantial implementation, update the active task and next checkpoint in `PROJECT_STATUS.md` and commit that handover note first. This is important: I may hit the ChatGPT usage limit without warning and may be unable to request a summary.
- After each meaningful code or test milestone, update `PROJECT_STATUS.md` in the same commit where practical, or immediately afterwards. Always leave a clear next action.
- Work directly in GitHub when possible. Do not ask me to repeat known decisions or provide files already available in the repository.
- Preserve current features, business data, photo data, IDs, cross-links and JOB/QUO/INV numbering. Do not clear browser data or perform destructive migrations.
- Keep the UI compact and polished, but never hide or clip content. Use the existing in-app toast and styled confirmation-dialog patterns rather than browser alert/confirm pop-ups.
- Preserve approved JRVS branding and logo. Approved palette: sage olive `#899B68`, warm cream `#F7F1DF`, with the established dark desktop treatment.
- Treat the stable `main` PWA as a fallback. Do not merge or overwrite it as part of desktop development.
- Never claim something is tested unless it has actually been tested. Separate code implemented, build passed, CI passed and user-tested.
- For a release, include only the current release's release notes in the release ZIP. Do not include old release notes.
- Do not add `[release]` to an ordinary development commit. Only use the documented signed-release path when I explicitly ask to ship a release.

### If the conversation is interrupted

The most recent committed `PROJECT_STATUS.md` is the handover. Re-fetch the live branch head, read that file and continue from its active task/next action. Do not ask me to create a summary or handover prompt.

### First response

After checking the repository, briefly tell me the verified branch/version, the task recorded as next, and any important discrepancy you found. Then continue the work where possible rather than asking me to repeat information.
