# Bootstrap — Platform detection

Run once at the start of `/build-product` if `.project/runtime.json` does not exist.

**Recommended:** run project setup first — only one IDE folder is created:

```bash
npm run setup -- --tool cursor --clean
```

## Supported platforms

Same IDs as **OpenSpec** `openspec init --tools` — see [platforms/registry.json](../platforms/registry.json).

## Detection order (if runtime.json missing)

1. **Explicit override** — `/build-product --platform cursor` or manual `.project/runtime.json`
2. **Existing runtime** — `.project/runtime.json` from `npm run setup`
3. **OpenSpec config** — `openspec/config.yaml` configured tools
4. **Single platform folder** — only one `{skillsDir}/build-product/SKILL.md` on disk
5. **Environment hints** — `CURSOR_*`, `CLAUDE_CODE`, etc.
6. **Ask user** — numbered list from registry

## runtime.json (written by npm run setup)

```json
{
  "platformId": "cursor",
  "platformName": "Cursor",
  "delegation": "task-tool",
  "parallelAgents": true,
  "commandSyntax": "hyphen",
  "detected": false,
  "configuredTools": ["cursor"]
}
```

## Reconfigure platform

```bash
npm run setup -- --tool claude --clean
```

`--clean` removes other platform directories (`.cursor/`, `.claude/`, …) from the project root.
