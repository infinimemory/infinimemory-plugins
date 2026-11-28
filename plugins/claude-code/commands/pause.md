---
description: Pause MemStack's capture on this machine (incognito); `/mem:pause off` resumes
argument-hint: [hours | off]
allowed-tools: Bash(node:*)
---

!`node "${CLAUDE_PLUGIN_ROOT}/scripts/mem.mjs" pause $ARGUMENTS`

Tell the user, in one line, what the command above printed. Do not save anything to MemStack while capture is paused.
