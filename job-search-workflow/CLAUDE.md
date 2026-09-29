# Job Search Workflow Optimization

This directory holds planning, notes, and decisions for optimizing Jonathan's job search workflow. It lives in the
LISW (LinkedIn Secret Weapon) repo for durability and organization, **not** because the work is necessarily about LISW.

## Scope

- The goal is a faster, less tedious, more effective job search: finding roles, researching companies and contacts,
  outreach, applications, follow-ups, interview prep, and tracking all of it.
- The mechanism for any given optimization is open. It might be:
  - a new LISW feature
  - a Claude skill, scheduled task, or agent workflow
  - a standalone script or small tool
  - a spreadsheet, doc, or other process change
  - an existing third-party tool
- Don't default to "build it into the extension." Pick whatever fits the problem best, and note why.

## Conventions

- Branches for this work live under `!job-search-workflow/` (e.g. `!job-search-workflow/planning`), not the dated
  feature-branch scheme used for LISW features. Quote the name in shells (`'!job-search-workflow/...'`) since `!`
  triggers history expansion in zsh/bash.
- Keep notes and plans in this directory. Update this file as the scope and working conventions evolve.
- For LISW-specific architecture and commands, see the root `CLAUDE.md`.
