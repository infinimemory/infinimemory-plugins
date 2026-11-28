# MemStack plugins

**Sign in first.** Every coding-agent plugin and MCP server uses the login from the MemStack CLI, and refuses to run
without it (Claude Code shows "not logged in" at session start; the MCP servers won't start):

```sh
npx @tryrecallai/cli login          # opens your browser; this machine gets its own key
npx @tryrecallai/cli setup --all    # every agent found on this machine; or setup <agent> for one
npx @tryrecallai/cli doctor         # what works: login, this folder's realm, each agent's hooks and last capture
```

The login lives in `~/.memstack/config.json`; `mem logout` turns every plugin off again. `MEMSTACK_API_KEY` overrides it
(CI, servers without a browser). Every agent uses the realm **`repo_<repository>__<id>`** (the
id is the first 16 hex of sha256 of the git remote, or of the folder's path without one; a worktree shares its main
repository's realm unless `MEMSTACK_ISOLATE_WORKTREES=true`), from any subfolder, so all your agents share one memory per
repository, and two repositories with the same folder name never share one. Notes in the older `project-<folder>`
realm are still found until you merge it (console → Realms → Merge; `mem doctor` points it out). `mem connect <realm>` links a folder to another realm (saved in
`.memstack.json`, found from any subfolder up to the repository root); `MEMSTACK_REALM` overrides it for a session, and
`MEMSTACK_BASE_URL` points at another deployment.

| Agent | What MemStack does there | Install |
| --- | --- | --- |
| [Claude Code](claude-code) | About at session start, relevant notes with each prompt, the conversation saved turn by turn; the MemStack tools and `/mem:save`, `/mem:find`, `/mem:pause` | `/plugin marketplace add infinimemory/infinimemory-plugins`, then `/plugin install mem@memstack` |
| [Codex](codex) | About, notes with each prompt, turn-by-turn saving (`~/.codex/hooks.json`); MemStack tools | `mem setup codex`, then approve the hooks once with `/hooks` in Codex |
| Gemini CLI | About, notes with each prompt, turn-by-turn saving (`~/.gemini/settings.json`); MemStack tools | `mem setup gemini` |
| Qwen Code | About, notes with each prompt, turn-by-turn saving (`~/.qwen/settings.json`); MemStack tools | `mem setup qwen` |
| Factory Droid | About, notes with each prompt, turn-by-turn saving (`~/.factory/hooks.json`) | `mem setup factory` |
| [OpenCode](opencode) | About and notes with each message, turn-by-turn saving (a plugin in `~/.config/opencode/plugins/`); MemStack tools | `mem setup opencode` |
| [Cline](cline) | About and notes before each run, turn-by-turn saving (a plugin in `~/.cline/plugins/mem/`) | `mem setup cline` |
| [Amp](amp) | About and notes appended to each prompt, turn-by-turn saving (a plugin in `~/.config/amp/plugins/mem/`) | `mem setup amp` |
| [Cursor](cursor) | About at session start, turn-by-turn saving (`~/.cursor/hooks.json`); Cursor's prompt hook can't add context, so notes come through the MemStack tools; optional always-on rule | `mem setup cursor`; optionally copy `mem.mdc` to `.cursor/rules/` |
| Copilot (CLI) | As on Cursor: About at session start, turn-by-turn saving (`~/.copilot/hooks/mem.json`), notes through the MemStack tools. Copilot hooks are in preview | `mem setup copilot` |
| Windsurf / Devin | About and notes with each prompt; **your prompts** are saved (its hooks carry no reply, so answers are not) | `mem setup devin` |
| Kiro | About and notes with each prompt (global hooks in `~/.kiro/hooks/`); your prompts are saved (no reply in its hooks); MemStack tools | `mem setup kiro` |
| [Browser](browser) | Save the page (button, right-click, `Alt+Shift+S`) or a selection, with private parts and secrets removed first; find from the toolbar; sign in through the console | `chrome://extensions` → Developer mode → Load unpacked → `plugins/browser`, then Settings → Sign in with MemStack |

Agents without hooks (Zed, Aider, Continue): add the MemStack MCP server (`mem mcp`) and a rule telling the agent to
use `mem_find` and `mem_save`; finding works, saving depends on the model.

MCP tools: `mem_save`, `mem_find`, `mem_about`, `mem_remove`, `mem_notes`, `mem_graph` (the earlier names
`memory_add` and `memory_search` still work).

## How capture works

Each agent's hooks run one shared core (`hook.mjs`; `mem setup` copies it to `~/.memstack/bin/`). It keeps your prompt
and the agent's reply in a local spool (`~/.memstack/state/`), and sends only the new turns, appended to one file per
session. A send that fails or times out is retried later without duplicates or a second charge. Agents that wait on
their hooks get an instant answer; the send runs in the background.

## Privacy

Saving conversations is on by default. Before anything is written to disk or sent:

- text inside `<private>…</private>` becomes `[private]` (a message that is all private is not kept at all);
- likely secrets are masked: provider tokens (`sk-…`, `ghp_…`, `xox…-`, `AKIA…`, MemStack's own `rc_…`), `*_KEY=`,
  `TOKEN`/`SECRET`/`PASSWORD` assignments, `Bearer` tokens, JWTs, private keys, passwords in URLs. MemStack's server
  masks provider tokens in captured turns a second time. This is best-effort: put anything that must never leave
  your machine inside `<private>`;
- tool calls and tool output are never sent.

To stop saving: `mem pause [hours]` (or `/mem:pause` in Claude Code) pauses this machine, `mem pause off`
resumes; `"save": false` in a repository's `.memstack.json` turns it off there; `MEMSTACK_SAVE=off` turns it off for a
session (`MEMSTACK_CAPTURE=off` still works). Finding notes keeps working in every case.

## License

Copyright © 2026 MemStack. All rights reserved. Proprietary software; see `LICENSE` at the repository root.
