# Orbit Multi-Tenant Architecture - Quick Reference

## Key Files & Their Locations

### Core Multi-Tenant Infrastructure

| Component | File Path | Purpose |
|-----------|-----------|---------|
| **Current Context** | `/Users/ujackson/projects/orbit/orbit_web/app/models/current.rb` | Workspace & user context management |
| **Workspace Concern** | `/Users/ujackson/projects/orbit/orbit_web/app/models/concerns/workspace_ownable.rb` | Default scoping, validation, helpers |
| **Authentication** | `/Users/ujackson/projects/orbit/orbit_web/app/controllers/concerns/authentication.rb` | Auth flow, workspace assignment, session mgmt |
| **Application Controller** | `/Users/ujackson/projects/orbit/orbit_web/app/controllers/application_controller.rb` | Base controller with auth filters |
| **Inertia Controller** | `/Users/ujackson/projects/orbit/orbit_web/app/controllers/inertia_controller.rb` | Shared data to React frontend |

### Models (Workspace-Scoped)

| Model | File Path | Pattern |
|-------|-----------|---------|
| **Workspace** | `/Users/ujackson/projects/orbit/orbit_web/app/models/workspace.rb` | Root multi-tenant entity |
| **Conversation** | `/Users/ujackson/projects/orbit/orbit_web/app/models/conversation.rb` | Scoped via `WorkspaceOwnable`, example pattern |
| **Contact** | `/Users/ujackson/projects/orbit/orbit_web/app/models/contact.rb` | Scoped via `WorkspaceOwnable`, unique email per workspace |
| **Message** | `/Users/ujackson/projects/orbit/orbit_web/app/models/message.rb` | Cascading scope through Conversation |
| **Attachment** | `/Users/ujackson/projects/orbit/orbit_web/app/models/attachment.rb` | Cascading scope through Message |

### Controllers (API/View Handlers)

| Controller | File Path | Pattern |
|-----------|-----------|---------|
| **Workspace Controller** | `/Users/ujackson/projects/orbit/orbit_web/app/controllers/workspace_controller.rb` | Main workspace views (inbox, contacts, settings) |
| **Integrations Controller** | `/Users/ujackson/projects/orbit/orbit_web/app/controllers/integrations_controller.rb` | Integration management API |
| **OAuth Controller** | `/Users/ujackson/projects/orbit/orbit_web/app/controllers/integrations/oauth_controller.rb` | OAuth callback handler |
| **Setup Controller** | `/Users/ujackson/projects/orbit/orbit_web/app/controllers/setup_controller.rb` | Onboarding flow |

### Frontend - Integration Management

| Component | File Path | Layer |
|-----------|-----------|-------|
| **useIntegrations Hook** | `/Users/ujackson/projects/orbit/orbit_web/app/frontend/features/integrations/hooks/useIntegrations.ts` | Data layer - TanStack Query |
| **integrationsStore** | `/Users/ujackson/projects/orbit/orbit_web/app/frontend/features/integrations/store/integrationsStore.ts` | State layer - Zustand |
| **IntegrationCatalog** | `/Users/ujackson/projects/orbit/orbit_web/app/frontend/features/integrations/components/IntegrationCatalog.tsx` | Container component |
| **OAuthConnectDialog** | `/Users/ujackson/projects/orbit/orbit_web/app/frontend/features/integrations/components/OAuthConnectDialog.tsx` | OAuth flow UI |
| **ApiKeyConnectDialog** | `/Users/ujackson/projects/orbit/orbit_web/app/frontend/features/integrations/components/ApiKeyConnectDialog.tsx` | API key entry UI |
| **IntegrationCard** | `/Users/ujackson/projects/orbit/orbit_web/app/frontend/features/integrations/components/IntegrationCard.tsx` | Card pattern |

### Frontend - Settings UI

| Component | File Path | Purpose |
|-----------|-----------|---------|
| **SettingsView** | `/Users/ujackson/projects/orbit/orbit_web/app/frontend/features/settings/SettingsView.tsx` | Main settings orchestrator |
| **SettingsSidebar** | `/Users/ujackson/projects/orbit/orbit_web/app/frontend/features/settings/components/SettingsSidebar.tsx` | Navigation sidebar (260px) |
| **IntegrationsSettings** | `/Users/ujackson/projects/orbit/orbit_web/app/frontend/features/settings/components/IntegrationsSettings.tsx` | Integrations section |
| **SettingSection** | `/Users/ujackson/projects/orbit/orbit_web/app/frontend/features/settings/patterns/SettingSection.tsx` | Section pattern |

### Database Migrations

| Migration | File Path | Schema |
|-----------|-----------|--------|
| **Workspaces** | `/Users/ujackson/projects/orbit/orbit_web/db/migrate/20260302060934_create_workspaces.rb` | Base workspace table |
| **Conversations** | `/Users/ujackson/projects/orbit/orbit_web/db/migrate/20260420230932_create_conversations.rb` | uuid workspace_id, foreign key |
| **Messages** | `/Users/ujackson/projects/orbit/orbit_web/db/migrate/20260420230939_create_messages.rb` | Scoped through conversation |
| **Contacts** | `/Users/ujackson/projects/orbit/orbit_web/db/migrate/20260420230942_create_contacts.rb` | uuid workspace_id, composite unique |
| **Attachments** | `/Users/ujackson/projects/orbit/orbit_web/db/migrate/20260420230941_create_attachments.rb` | Scoped through message |
| **OrbitConnect** | `/Users/ujackson/projects/orbit/orbit_web/db/migrate/20260418213739_create_orbit_connect_connections.orbit_connect.rb` | Integration connections (polymorphic owner) |

### Documentation

| Doc | File Path | Content |
|-----|-----------|---------|
| **Workspace Architecture** | `/Users/ujackson/projects/orbit/orbit_web/docs/WORKSPACE_ARCHITECTURE.md` | 3-layer spatial model, 4 workspace modes |
| **Architecture Summary** | `/Users/ujackson/projects/orbit/orbit_web/docs/ARCHITECTURE_SUMMARY.md` | Component taxonomy, 4-layer architecture |
| **Integration System** | `/Users/ujackson/projects/orbit/orbit_web/docs/INTEGRATION_SYSTEM.md` | Integration framework overview |
| **Integration Guide** | `/Users/ujackson/projects/orbit/orbit_web/docs/INTEGRATION_SYSTEM_GUIDE.md` | User-facing integration walkthrough |
| **Multi-Tenant Patterns** | `/Users/ujackson/projects/orbit/orbit_web/docs/MULTI_TENANT_PATTERNS.md` | This comprehensive guide |

---

## Established Patterns - Copy/Paste Ready

### 1. Workspace-Scoped Model
```ruby
class YourModel < ApplicationRecord
  include WorkspaceOwnable  # <- Adds all the scoping magic
  
  validates :some_field, presence: true
  # All queries automatically scoped to Current.workspace
end
```

### 2. Workspace-Scoped Controller
```ruby
class YourController < ApplicationController
  # Inherited:
  # - before_action :require_authentication
  # - before_action :require_workspace

  before_action :set_workspace  # <- Always add this
  
  def index
    items = YourModel.all  # <- Automatically workspace-scoped
    render json: { items: items }
  end

  private

  def set_workspace
    @workspace = Current.workspace
    head :forbidden unless @workspace
  end
end
```

### 3. API URLs with Workspace Scoping
```ruby
# Backend routes (config/routes.rb)
scope "/w/:workspace_id" do
  resources :your_resources
end

# Frontend usage (TypeScript)
const response = await fetch(`/w/${workspace?.id}/your_resources`);
```

### 4. Foreign Key Convention
```ruby
# Migration
class CreateYourModel < ActiveRecord::Migration[8.1]
  def change
    create_table :your_models do |t|
      t.uuid :workspace_id, null: false  # <- UUID type
      t.string :name
      t.timestamps
    end
    
    add_index :your_models, :workspace_id
    add_foreign_key :your_models, :workspaces
  end
end
```

### 5. TanStack Query with Workspace Scoping
```typescript
const useYourResources = () => {
  const { workspace } = useWorkspace();

  const { data, isLoading } = useQuery({
    queryKey: ['yourResources', workspace?.id],  // <- Include workspace ID
    queryFn: async () => {
      const response = await fetch(`/w/${workspace?.id}/your_resources`);
      return response.json();
    },
    enabled: !!workspace?.id,
  });

  return { data, isLoading };
};
```

### 6. OAuth Flow with Workspace Context
```typescript
// Frontend
const connectIntegration = async (providerKey: string) => {
  const response = await fetch(
    `/w/${workspace?.id}/integrations/${providerKey}/connect`,
    { method: 'POST' }
  );
  const data = await response.json();
  
  if (data.redirect_url) {
    window.location.href = data.redirect_url;  // Redirect to OAuth provider
  }
};

// Backend
def connect
  result = OrbitConnect::ConnectionManager.start!(
    provider_key: params[:provider_key],
    owner: Current.workspace,           # <- Workspace as owner
    initiator: Current.user,
    return_to: workspace_settings_url(workspace_id: @workspace.id)
  )
  
  render json: { redirect_url: result.redirect_url }
end
```

---

## Critical Implementation Details

### Foreign Keys
- **Type:** UUID (not bigint)
- **Naming:** Always `workspace_id`
- **Uniqueness:** Always composite with workspace_id when needed
- **Pattern:** `add_foreign_key :table, :workspaces`

### Controller Before Actions
```ruby
# Inherited automatically from ApplicationController
before_action :require_authentication
before_action :require_workspace

# Custom
before_action :set_workspace

# Skip if needed
allow_unauthenticated_access only: [:public_action]
allow_authenticated_without_workspace only: [:setup]
```

### Accessing Workspace
- **In Models:** Via `WorkspaceOwnable` (automatic default_scope)
- **In Controllers:** `@workspace = Current.workspace`
- **In Jobs:** `Current.workspace` (set before job runs)
- **In Services:** Pass `workspace:` parameter

### Data Layering (Frontend)
- **Server state:** TanStack Query (useQuery, useMutation)
- **UI state:** Zustand (Integrations, UI preferences)
- **Workspace context:** useWorkspace() provider hook
- **Component hierarchy:** Containers → Patterns → Primitives

### Settings UI Structure
- **Sidebar:** 260px navigation surface (color.surface.navigation)
- **Workspace:** flex work surface (color.surface.work)
- **Sections:** SettingSection pattern component
- **Section switching:** Instant, no transitions

### Integration Management
- **Catalog:** 50+ integrations by category
- **Types:** OAuth (external auth) or API Key (stored encrypted)
- **Storage:** orbit_connect_connections (polymorphic owner)
- **Credentials:** orbit_connect_credentials (encrypted JSONB)
- **Status:** pending, connected, error with health tracking

### Routing Convention
- **Pattern:** `/w/:workspace_id/resource`
- **All authenticated routes:** Scoped under workspace
- **OAuth callbacks:** Outside scope (can handle any workspace)
- **Helper:** `workspace_path(id)`, `workspace_settings_url(workspace_id:)`

---

## Testing Workspace Scoping

```ruby
# Test isolation per workspace
workspace1 = Workspace.create!(remote_id: "org_1")
workspace2 = Workspace.create!(remote_id: "org_2")

Current.workspace = workspace1
item1 = YourModel.create!(name: "Item 1")

Current.workspace = workspace2
items = YourModel.all
items.count  # => 0, workspace2 doesn't see workspace1's data

item_from_ws1 = YourModel.across_all_workspaces.find(item1.id)
item_from_ws1  # => Found, but explicit unscoping required
```

---

## When to Use Each Pattern

| Scenario | Pattern |
|----------|---------|
| New domain model | Include `WorkspaceOwnable`, use uuid workspace_id |
| New API endpoint | Add `before_action :set_workspace`, include workspace in URL |
| New settings section | Create component in settings/components/, add sidebar entry |
| New integration | Add to OrbitConnect catalog (existing gem) |
| New data fetch | TanStack Query with workspace in cache key |
| UI state | Zustand store |
| Credential storage | orbit_connect_credentials encrypted JSONB |

---

## Known Limitations & Future Work

From documentation review:
- Mode B (Management/Contacts) & Mode C (Builder/Rules) are placeholders
- User Management & RBAC not yet implemented (planned)
- Settings sections: Appearance & Notifications complete, rest planned
- Integration settings UI not implemented yet
- API documentation UI not implemented yet

---

## Security Best Practices

1. Always set workspace in controller before operations
2. Use `before_action :require_workspace` for all authenticated routes
3. Never store credentials on frontend
4. Use encrypted JSONB for sensitive data at rest
5. Include workspace_id in all unique constraints
6. Test workspace isolation boundaries
7. Use `@workspace = Current.workspace` and validate non-nil
8. Return 403 Forbidden for unauthorized workspace access

