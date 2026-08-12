# Orbit Local Instructions

## Use Orbit doctrine for frontend decisions

For work in this repo involving UI, layout, navigation, panels, design-system structure, component boundaries, integrations UX, or frontend architecture review, use the global skill `$orbit-decision-doctrine`.

Before making a substantive Orbit-specific decision, perform a short rule check:

1. Identify the doctrine family:
   - `workspace/navigation`
   - `component taxonomy`
   - `panels/integrations`
2. Read the matching reference in `$orbit-decision-doctrine`.
3. State the governing rule in one short line.
4. Make the decision or note the override.

Use this format:

`Rule check: <family> -> <governing rule(s)>.`

Examples:

- `Rule check: workspace/navigation -> rail remains fixed at 72px and context augments rather than owning the workflow.`
- `Rule check: component taxonomy -> feature logic stays in containers/hooks, not primitives or patterns.`
- `Rule check: panels/integrations -> settings should avoid dominant AI surfaces and keep connection flows explicit.`

## Enforcement

- Do not invent layouts, component boundaries, navigation patterns, or panel behavior that conflict with the documented Orbit model.
- Prefer Orbit doctrine over generic framework defaults for relevant frontend work.
- Before changing shared UI, layout, tokens, or MUI components, check `/Users/ujackson/projects/orbit/res/orbit_ui` and treat it as the canonical Orbit visual/component reference.
- If the existing code or an explicit user instruction contradicts the doctrine, state the contradiction plainly and follow the stronger source of truth.
- Do not force doctrine checks for backend-only Ruby, database, deployment, or unrelated infrastructure work.

## Use Orbit doctrine for backend decisions

For work in this repo involving Rails controllers, models, routes, WorkOS auth, tenancy, serializers, Typelizer-generated types, Inertia page props, backend tests, or backend architecture review, use the global skill `$orbit-rails-backend-doctrine`.

Before making a substantive backend decision, perform a short backend rule check:

1. Identify the doctrine family:
   - `backend/current-state`
   - `backend/inertia-contracts`
   - `backend/auth-tenancy`
2. Read the matching reference in `$orbit-rails-backend-doctrine`.
3. State the governing rule in one short line.
4. Make the decision or note the override.

Use this format:

`Rule check: <family> -> <governing rule(s)>.`

Examples:

- `Rule check: backend/current-state -> Workspace is the tenant root; persisted review, inbox, integration, membership, automation, and AI records are live data surfaces.`
- `Rule check: backend/inertia-contracts -> Rails owns routes and props, and serializer-backed types must stay aligned.`
- `Rule check: backend/auth-tenancy -> workspace context comes from the authenticated WorkOS session, not client input.`

Backend-specific rules:

- Prefer current code over older roadmap docs when they conflict.
- Use `docs/orbit_skills_rules_doc.md` as the maintained backend doctrine summary and keep it synced with implementation.
- Use `docs/llms-full.txt` as supporting Rails/Inertia guidance, not as product truth.
- Use the configured global MCP server `workos` for current WorkOS/AuthKit reference.

## Refactor guardrails from repository review

- Treat `Workspace` as the tenant root and derive authority from `Current.workspace`; `:workspace_id` route params are navigation context, not authorization proof.
- For workspace-owned records, prefer explicit `Current.workspace.<association>` queries over bare model queries that rely on `WorkspaceOwnable` default scope.
- Add or update cross-workspace tests when touching page controllers, API controllers, serializers, or services that read tenant-owned records.
- Treat `/w/:workspace_id/api/...` as the canonical workspace API route surface; avoid expanding the legacy `/workspaces/:workspace_id/...` AI/RAG routes unless compatibility requires it.
- Do not copy large static frontend datasets as source-of-truth patterns for persisted domains. Migrate feature views toward serializer-backed Inertia props, generated types, route helpers, or typed API hooks.
- Treat settings/security/billing/team controls as UI scaffolding unless the Rails route, model/service, and tests for that behavior exist.

## Source material

The doctrine is synthesized from `/Users/ujackson/projects/orbit/orbit_web/docs`.

- Treat `ATTRIBUTIONS.md` as non-decision metadata.
- Treat `llms-full.txt` as third-party framework material, not Orbit product doctrine.
