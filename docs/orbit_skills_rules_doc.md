# Orbit Rails + Inertia Skills / Rules Document

## Purpose

This document is the maintained backend doctrine for `/Users/ujackson/projects/orbit/orbit_web`.

It is intentionally grounded in the current codebase, not earlier implementation prompts. Use it together with:

- the global skill `$orbit-rails-backend-doctrine`
- the repo-local [AGENTS.md](/Users/ujackson/projects/orbit/orbit_web/AGENTS.md)
- `docs/llms-full.txt` for supporting Inertia guidance
- the configured global MCP server `workos` for current WorkOS/AuthKit documentation

Before making a substantive backend decision, use a short rule check:

`Rule check: <family> -> <governing rule(s)>.`

Supported backend rule families:

- `backend/current-state`
- `backend/inertia-contracts`
- `backend/auth-tenancy`

---

## 1. Current Implementation Snapshot

### 1.1 Stack actually in use

- Rails `8.1.2`
- Inertia Rails + React pages under `app/frontend`
- Vite Rails
- WorkOS for authentication
- Alba serializers
- Typelizer-generated frontend types
- PostgreSQL
- Solid Cache / Solid Queue / Solid Cable gems installed

### 1.2 Backend surface implemented today

- Root route renders `WorkspaceController#index`
- WorkOS login, callback, and logout flows are implemented
- Session restoration happens in `Authentication`
- `Current` carries `user` and `workspace`
- `Workspace` is the only persisted tenant model in the current schema
- Setup is a multi-step session-backed flow: `workspace -> team -> channels -> complete`
- Inertia shared flash props are configured
- Serializer-backed generated frontend types exist for setup and workspace

### 1.3 Backend surface not yet implemented locally

These should be treated as planned architecture, not current fact:

- local RBAC tables and policy layer
- local memberships/users domain model
- conversation/message/contact/integration persistence
- audit log persistence
- rules engine persistence
- billing/security management backends

Do not write docs or code comments that present those as already implemented.

---

## 2. Current Code Truths

### 2.1 Auth and session rules

- Auth provider defaults to WorkOS via `config/initializers/auth.rb`.
- The callback exchanges an auth code for a sealed WorkOS session and stores it in an HTTP-only cookie.
- `Authentication#resume_session` restores session state and sets `Current.user`.
- `Current.workspace` is resolved from the WorkOS organization id by finding a local `Workspace` with matching `remote_id`.
- If a user is authenticated but no local workspace exists yet, the app redirects into setup.

### 2.2 Tenancy rules

- The app currently models tenancy locally as `Workspace`.
- New tenant-owned models should use `workspace_id`, not a parallel tenant key, unless the architecture is explicitly changed everywhere.
- `WorkspaceOwnable` is the intended concern for tenant-scoped records.
- Tenant context must be derived server-side from `Current.workspace`; never trust client-provided workspace identifiers for authorization.

### 2.3 Inertia contract rules

- Rails owns routes and page props.
- Inertia pages should consume explicit server props, not rebuild backend truth on the client.
- Shared props belong in `InertiaController`.
- Request keys are normalized with `deep_underscore_params!`.
- JSON array params must preserve empty arrays; current behavior restores arrays after Rails deep-munge.

### 2.4 Serializer and type rules

- Use Alba serializers for backend-to-frontend contracts.
- Keep frontend prop keys in lower camel case through the serializer layer.
- When serializer-backed props change, regenerate or update Typelizer-generated types.
- Do not maintain parallel hand-written types for data already sourced from serializers unless there is a clear need.

---

## 3. Rules Derived from `docs/llms-full.txt`

Use `docs/llms-full.txt` as supporting framework guidance, not product doctrine.

Rules to keep applying:

- Handle authentication and authorization on the server.
- Pass capability flags and authorization results to Inertia pages as props when needed.
- Use Rails-side asset versioning as the source of truth.
- Keep the app in the Rails + Inertia model rather than splitting into a separate SPA architecture.

Rules not to overclaim:

- `docs/llms-full.txt` is not evidence that a product feature exists in Orbit.
- Third-party examples do not override the current implementation in this repo.

---

## 4. Verified Drift in the Current Codebase

These are real mismatches discovered in the current repo and should guide future cleanup.

### 4.1 WorkOS webhook drift

`app/controllers/webhooks_controller.rb` still references:

- `Organization`
- `workos_organization_id`
- `soft_delete!`
- `skip_before_action :set_current_context`

Those do not match the current local schema and controller stack. Treat this webhook controller as stale until it is reconciled with the `Workspace` model or a new organization model is introduced.

### 4.2 Test boot drift

`bundle exec rails test test/controllers/auth_controller_test.rb` currently fails before running assertions because:

- `config/initializers/js_from_routes.rb` assumes `JsFromRoutes` is loaded
- the gem is only bundled in development, not test

This means the initializer is not yet test-safe.

### 4.3 Test expectation drift

`test/controllers/auth_controller_test.rb` references route helpers that do not match the current routing table. Any backend test work should verify route names with `bundle exec rails routes` first.

---

## 5. Backend Decision Rules

### 5.1 `backend/current-state`

Use this when deciding what Orbit backend features already exist.

- Prefer current schema, routes, controllers, serializers, and tests over older prompts or roadmap docs.
- Separate implemented behavior from planned architecture.
- If a stale file contradicts the working stack, name the drift explicitly before changing behavior.

### 5.2 `backend/inertia-contracts`

Use this for controllers, page props, serializers, and frontend-generated types.

- Rails owns the contract.
- Serializer output is the main backend/frontend data boundary.
- Typelizer output should track serializer-backed props.
- Keep shared Inertia behavior centralized.

### 5.3 `backend/auth-tenancy`

Use this for WorkOS, workspace context, and tenant-scoped models.

- Workspace context must come from authenticated session restoration on the server.
- New tenant-owned models should default to local workspace scoping.
- Do not claim local RBAC or organization-sync behavior is implemented unless the supporting models and data flows exist.
- Use the `workos` MCP server when auth changes need current WorkOS details.

---

## 6. File-Level Operating Guidance

### 6.1 Controllers

- Keep auth, redirects, setup flow, and prop shaping in controllers.
- Move shared controller behavior into concerns or `InertiaController`.
- Avoid coupling controller behavior to speculative future models.

### 6.2 Models

- Keep tenant ownership explicit through `workspace_id`.
- Default-scope tenant-owned records only when the model is truly workspace-bound.
- Provide explicit unscoped escape hatches for administrative use, not general app flow.

### 6.3 Frontend contract layer

- Generated route helpers and generated types are part of the contract surface.
- Backend changes that alter props, routes, or setup payloads should consider the generated frontend artifacts.

### 6.4 Tests and tooling

- Initializers must be safe in all environments they load in.
- Verify route helper names from the actual router.
- Treat failing boot-time configuration as a backend correctness issue, not only a test issue.

---

## 7. Current Safe Summary

The app is currently a Rails 8 + Inertia foundation with:

- working WorkOS auth flow
- local workspace creation/lookup
- session-backed setup
- serializer/type-generation infrastructure
- frontend shell and setup UI scaffolding

It is not yet a complete enterprise inbox backend. Future backend work should extend from this foundation and keep this document aligned with actual code after each meaningful change.
