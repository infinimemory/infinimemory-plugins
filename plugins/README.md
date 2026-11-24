# Infinimemory plugins

**Sign in first.** Every coding-agent plugin and MCP server uses the login from the Infinimemory CLI, and refuses to run
without it (Claude Code shows "not logged in" at session start; the MCP servers won't start):

```sh
npx @tryrecallai/cli login          # opens your browser; this machine gets its own key
npx @tryrecallai/cli setup --all    # every agent found on this machine; or setup <agent> for one
npx @tryrecallai/cli doctor         # what works: login, this folder's realm, each agent's hooks and last capture
```

The login lives in `~/.infinimemory/config.json`; `ifm logout` turns every plugin off again. `INFINIMEMORY_API_KEY` overrides it
(CI, servers without a browser). Every agent uses the realm **`repo_<repository>__<id>`** (the
id is the first 16 hex of sha256 of the git remote, or of the folder's path without one; a worktree shares its main
repository's realm unless `INFINIMEMORY_ISOLATE_WORKTREES=true`), from any subfolder, so all your agents share one memory per
repository, and two repositories with the same folder name never share one. Notes in the older `project-<folder>`
realm are still found until you merge it (console → Realms → Merge; `ifm doctor` points it out). `ifm connect <realm>` links a folder to another realm (saved in
`.infinimemory.json`, found from any subfolder up to the repository root); `INFINIMEMORY_REALM` overrides it for a session, and
`INFINIMEMORY_BASE_URL` points at another deployment.

| Agent | What Infinimemory does there | Install |
| --- | --- | --- |
| [Claude Code](claude-code) | About at session start, relevant notes with each prompt, the conversation saved turn by turn; the Infinimemory tools and `/ifm:save`, `/ifm:find`, `/ifm:pause` | `/plugin marketplace add infinimemory/infinimemory-plugins`, then `/plugin install ifm@infinimemory` |
| [Codex](codex) | About, notes with each prompt, turn-by-turn saving (`~/.codex/hooks.json`); Infinimemory tools | `ifm setup codex`, then approve the hooks once with `/hooks` in Codex |
| Gemini CLI | About, notes with each prompt, turn-by-turn saving (`~/.gemini/settings.json`); Infinimemory tools | `ifm setup gemini` |
| Qwen Code | About, notes with each prompt, turn-by-turn saving (`~/.qwen/settings.json`); Infinimemory tools | `ifm setup qwen` |
| Factory Droid | About, notes with each prompt, turn-by-turn saving (`~/.factory/hooks.json`) | `ifm setup factory` |
| [OpenCode](opencode) | About and notes with each message, turn-by-turn saving (a plugin in `~/.config/opencode/plugins/`); Infinimemory tools | `ifm setup opencode` |
| [Cline](cline) | About and notes before each run, turn-by-turn saving (a plugin in `~/.cline/plugins/ifm/`) | `ifm setup cline` |
| [Amp](amp) | About and notes appended to each prompt, turn-by-turn saving (a plugin in `~/.config/amp/plugins/ifm/`) | `ifm setup amp` |
| [Cursor](cursor) | About at session start, turn-by-turn saving (`~/.cursor/hooks.json`); Cursor's prompt hook can't add context, so notes come through the Infinimemory tools; optional always-on rule | `ifm setup cursor`; optionally copy `ifm.mdc` to `.cursor/rules/` |
| Copilot (CLI) | As on Cursor: About at session start, turn-by-turn saving (`~/.copilot/hooks/ifm.json`), notes through the Infinimemory tools. Copilot hooks are in preview | `ifm setup copilot` |
| Windsurf / Devin | About and notes with each prompt; **your prompts** are saved (its hooks carry no reply, so answers are not) | `ifm setup devin` |
| Kiro | About and notes with each prompt (global hooks in `~/.kiro/hooks/`); your prompts are saved (no reply in its hooks); Infinimemory tools | `ifm setup kiro` |
| [Browser](browser) | Save the page (button, right-click, `Alt+Shift+S`) or a selection, with private parts and secrets removed first; find from the toolbar; sign in through the console | `chrome://extensions` → Developer mode → Load unpacked → `plugins/browser`, then Settings → Sign in with Infinimemory |

Agents without hooks (Zed, Aider, Continue): add the Infinimemory MCP server (`ifm mcp`) and a rule telling the agent to
use `ifm_find` and `ifm_save`; finding works, saving depends on the model.

MCP tools: `ifm_save`, `ifm_find`, `ifm_about`, `ifm_remove`, `ifm_notes`, `ifm_graph` (the earlier names
`memory_add` and `memory_search` still work).

## How capture works

Each agent's hooks run one shared core (`hook.mjs`; `ifm setup` copies it to `~/.infinimemory/bin/`). It keeps your prompt
and the agent's reply in a local spool (`~/.infinimemory/state/`), and sends only the new turns, appended to one file per
session. A send that fails or times out is retried later without duplicates or a second charge. Agents that wait on
their hooks get an instant answer; the send runs in the background.

## Privacy

Saving conversations is on by default. Before anything is written to disk or sent:

- text inside `<private>…</private>` becomes `[private]` (a message that is all private is not kept at all);
- likely secrets are masked: provider tokens (`sk-…`, `ghp_…`, `xox…-`, `AKIA…`, Infinimemory's own `rc_…`), `*_KEY=`,
  `TOKEN`/`SECRET`/`PASSWORD` assignments, `Bearer` tokens, JWTs, private keys, passwords in URLs. Infinimemory's server
  masks provider tokens in captured turns a second time. This is best-effort: put anything that must never leave
  your machine inside `<private>`;
- tool calls and tool output are never sent.

To stop saving: `ifm pause [hours]` (or `/ifm:pause` in Claude Code) pauses this machine, `ifm pause off`
resumes; `"save": false` in a repository's `.infinimemory.json` turns it off there; `INFINIMEMORY_SAVE=off` turns it off for a
session (`INFINIMEMORY_CAPTURE=off` still works). Finding notes keeps working in every case.

## License

Copyright © 2026 Infinimemory. All rights reserved. Proprietary software; see `LICENSE` at the repository root.
