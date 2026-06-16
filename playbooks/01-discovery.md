# Playbook 01: Discovery

**Agent:** 01-system-analyst, 02-tech-advisor  
**Outputs:** `docs/requirements.md`, `docs/tech-stack.md`, `docs/pages-spec.md`

## Steps

1. Orchestrator greets user, asks for initial product description
2. Orchestrator asks 15–30 questions from `question-bank.md` (batch in 2–3 messages max)
3. Task → System Analyst: write `requirements.md`
4. Gate: user approves requirements
5. Task → Tech Advisor: write `tech-stack.md` with 3 options
6. Gate: user picks stack
7. Task → System Analyst: write `pages-spec.md`
8. Gate: user approves page list

## OpenSpec

```bash
/opsx:propose "ProjectName — initial requirements"
```

Link `docs/requirements.md` content to `openspec/changes/{id}/specs/`.

## Quality checklist

- [ ] Every user role has defined permissions
- [ ] Every entity has CRUD or read-only scope defined
- [ ] Every page has route, name, functionality, roles
- [ ] NFR section covers scale, language, security
