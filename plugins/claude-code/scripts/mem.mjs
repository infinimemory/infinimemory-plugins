#!/usr/bin/env node
// MemStack for Claude Code. Copyright © 2026 MemStack. All rights reserved.
// Run by the plugin's hooks: `node mem.mjs <start|prompt|turn_end|compact|end>` with the hook's JSON on stdin, and by
// /mem:pause: `node mem.mjs pause [hours|off]`.
// The work is done by hook.mjs, the same core `mem hook` runs for every agent (copied from packages/cli/bin).
import { pause, runHook } from "./hook.mjs";

const [mode, arg] = process.argv.slice(2);
if (mode === "pause") {
  const off = /^(off|resume|0)$/i.test(arg ?? ""), hours = Number(arg || 1);
  const until = pause(off ? 0 : hours > 0 ? hours : 1);
  console.log(until ? `MemStack capture is paused on this machine until ${new Date(until).toLocaleString()}. Find still works. /mem:pause off resumes it.` : "MemStack capture resumed.");
} else {
  await runHook("claude-code", mode);
}
