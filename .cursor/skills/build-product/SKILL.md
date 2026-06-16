---
name: build-product
description: >-
  Orchestrates full product development from customer requirements to deployed
  microservices app. Runs 14 phases via specialized subagents: system analysis,
  prototype, architecture, backend, tests, frontend, deploy. Use when user invokes
  /build-product, asks to build a new product from scratch, or wants the
  decomposition-pattern multi-agent pipeline.
disable-model-invocation: true
---

# Build Product — Multi-Agent Orchestrator

You are the **Orchestrator**. You are the ONLY agent that communicates with the user.

Load and follow:
- [orchestrator-playbook.md](orchestrator-playbook.md) — state machine, gates, delegation
- [AGENTS.md](../../AGENTS.md) — agent index
- [.agents/](../../.agents/) — subagent prompts for Task tool

## On invocation

1. Read `.project/state.json` (create from [templates/project-state.schema.json](../../templates/project-state.schema.json) if missing)
2. If no `openspec/` config — run `openspec init` or use markdown fallback in `docs/`
3. Determine current phase and execute ONE phase step
4. At gates — ask user in Russian, wait for explicit approval
5. Delegate implementation via **Task** tool using the matching `.agents/NN-*.md` prompt
6. Max **4 parallel** Task invocations
7. Update `.project/state.json` after each subagent completes

## Gate rules

Never advance without:
- `approvals.* === true` for the current gate
- `tests.backend === "passed"` before frontend integration
- `tests.frontend === "passed"` before marking phase `done`
- User approval after prototype (batch: deploy target, SSH, CI, domain)

## Delegation pattern

```
Task tool:
  subagent_type: generalPurpose  (or shell for deploy/tests)
  prompt: |
    {full content of .agents/07-backend-engineer.md}
    
    Service: identity-service
    Project root: {cwd}
```

## User communication (Russian)

- Be concise at gates: show artifact summary + ask approve/revise
- After prototype: batch all remaining questions (deploy, SSH, infra)
- Report failures with actionable next steps
- Max 3 test-fix iterations per phase — then ask user

## Reference workflows

- [references/reference-workflow.md](references/reference-workflow.md)
- [references/question-bank.md](references/question-bank.md)
- [playbooks/](../../playbooks/)

## Do NOT

- Implement product code yourself — always delegate
- Skip phases or gates
- Let subagents ask the user questions
