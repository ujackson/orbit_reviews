# Orbit Multi-Tenant Architecture & Patterns - Comprehensive Analysis

## Overview

Orbit is built with a sophisticated multi-tenant architecture that uses workspace-scoped data models, Current context management, and a clear controller/view separation. The system supports both OAuth and API-key integrations as reference implementations for credential management.

---

## 1. WORKSPACE SCOPING & CURRENT CONTEXT

### Current.rb - Context Management Foundation
**File:** `/app/models/current.rb`

```ruby
class Current < ActiveSupport::CurrentAttributes
  attribute :workspace, :user

  def workspace_or_raise!
    workspace || raise(ActiveRecord::RecordNotFound, "No workspace context set...")
  end
end
```

**Pattern Usage:**
- `Current.workspace` - Access the current workspace in any context (controller, model, job)
- `Current.user` - Access the authenticated user
- `Current.workspace_or_raise!` - Validate workspace context before operations

### Established Convention:
- All workspace-scoped operations use `Current.workspace`
- Set in authentication flow (see Authentication concern)
- Cleared on logout
- Automatically included in queries via default_scope

---

## 2. WORKSPACE OWNERSHIP PATTERN

### WorkspaceOwnable Concern
**File:** `/app/models/concerns/workspace_ownable.rb`

```ruby
module WorkspaceOwnable
  extend ActiveSupport::Concern

  included do
    belongs_to :workspace, optional: true
    default_scope { where(workspace: Current.workspace_or_raise!) }
    validates :workspace, presence: true
    before_validation :set_workspace, on: :create, if: -> { workspace.nil? }
  end

  private

  def set_workspace
    self.workspace = Current.workspace
  end

  class_methods do
    def across_all_workspaces
      unscoped
    end

    def find_across_workspaces(id)
      unscoped.find(id)
    end
  end
end
```

**Foreign Key Naming Convention:**
- **Standard FK:** `workspace_id` (UUID, not bigint)
- **Type:** UUID (Postgres UUID type) for workspace references
- **Pattern:** All workspace-scoped models use `workspace_id`

**Examples in Codebase:**
- Conversations: `t.uuid :workspace_id, null: false`
- Contacts: `t.uuid :workspace_id, null: false`
- Messages: Indirect through Conversation
- Attachments: Indirect through Message

**Scope Index Pattern:**
```ruby
# Compound unique indexes with workspace_id
add_index :conversations, [:external_id, :external_source, :workspace_id], 
  unique: true, name: 'index_conversations_on_external_id_and_source_and_workspace'
add_index :contacts, [:workspace_id, :email], unique: true
```

---

## 3. AUTHENTICATION & WORKSPACE ASSIGNMENT

### Authentication Concern
**File:** `/app/controllers/concerns/authentication.rb`

```ruby
module Authentication
  extend ActiveSupport::Concern

  included do
    before_action :require_authentication
    before_action :require_workspace
    helper_method :authenticated?
  end

  class_methods do
    def allow_unauthenticated_access(**options)
      skip_before_action :require_authentication, **options
      skip_before_action :require_workspace, **options
    end

    def allow_authenticated_without_workspace(**options)
      skip_before_action :require_workspace, **options
    end
  end

  private

  def require_authentication
    return if resume_session
    request_authentication
  end

  def require_workspace
    return if Current.workspace.present?
    redirect_to setup_path
  end
```

**Controller Usage Example:**
```ruby
class IntegrationsController < ApplicationController
  before_action :set_workspace

  private

  def set_workspace
    @workspace = Current.workspace
    head :forbidden unless @workspace
  end
end
```

**WorkOS Integration Pattern:**
```ruby
def load_workos_session
  # ... session loading ...
  
  # Auto-select organization if only one membership
  org_id = auto_select_workos_organization!(session, result[:user])
  
  # Create or find workspace for org
  workspace = ensure_workspace_for_org(org_id)
  Current.workspace = workspace
end

def ensure_workspace_for_org(org_id)
  Workspace.find_or_create_by!(remote_id: org_id) do |workspace|
    organization = WorkOS::Organizations.get_organization(id: org_id)
    workspace.id = organization.external_id if organization.external_id.present?
  end
end
```

---

## 4. CONTROLLER STRUCTURE & PATTERNS

### InertiaController - Shared Data Provider
**File:** `/app/controllers/inertia_controller.rb`

```ruby
class InertiaController < ApplicationController
  inertia_share flash: -> {
    {
      notice: flash[:notice],
      alert: flash[:alert],
      success: flash[:success],
      error: flash[:error]
    }
  }
  
  inertia_share currentWorkspace: -> {
    WorkspaceSerializer.new(Current.workspace).to_h if Current.workspace.present?
  }
  
  inertia_share currentUser: -> {
    UserSerializer.new(Current.user).to_h if Current.user.present?
  }
  
  inertia_share authRoutes: -> {
    {
      login: main_app.login_path,
      logout: main_app.logout_path
    }
  }
end
```

**Pattern:** Props shared across ALL views via Inertia (React integration)

### Workspace Controller - Main View Handler
**File:** `/app/controllers/workspace_controller.rb`

```ruby
class WorkspaceController < InertiaController
  def inbox
    render_workspace(current_view: "inbox", inbox_view_id: normalized_inbox_view)
  end

  def contacts
    render_workspace(current_view: "contacts")
  end

  def settings
    render_workspace(current_view: "settings", settings_section: "integrations")
  end

  private

  def render_workspace(current_view:, inbox_view_id: "all", settings_section: "integrations")
    render inertia: "workspace/index", props: {
      currentWorkspace: WorkspaceSerializer.new(Current.workspace).to_h,
      currentView: current_view,
      settingsSection: settings_section,
      integrationOnboarding: params[:onboarding] == "1",
    }
  end
end
```

### Integrations Controller - API Pattern
**File:** `/app/controllers/integrations_controller.rb`

```ruby
class IntegrationsController < ApplicationController
  before_action :set_workspace

  def index
    catalog = OrbitConnect::CatalogPresenter.new(owner: Current.workspace).as_json
    connections = OrbitConnect::Connection
      .where(owner: Current.workspace)
      .includes(:credential, :provider_app)
      .order(created_at: :desc)

    render json: {
      catalog: catalog,
      connections: connections.map { |conn| connection_json(conn) }
    }
  end

  def connect
    result = OrbitConnect::ConnectionManager.start!(
      provider_key: params[:provider_key],
      owner: Current.workspace,
      initiator: Current.user,
      return_to: workspace_settings_url(workspace_id: @workspace.id)
    )

    if result.redirect?
      render json: { redirect_url: result.redirect_url }
    else
      render json: { props: result.props }
    end
  rescue OrbitConnect::Error => e
    render json: { error: e.message }, status: :unprocessable_entity
  end

  private

  def set_workspace
    @workspace = Current.workspace
    head :forbidden unless @workspace
  end

  def authorize_connection!(connection)
    head :forbidden unless connection.owner == Current.workspace
  end
end
```

**before_action Pattern:**
- Standard: `before_action :require_authentication` (inherited from ApplicationController)
- Standard: `before_action :require_workspace` (inherited from ApplicationController)
- Custom: `before_action :set_workspace` in IntegrationsController

**Routing Pattern:**
```
GET  /w/:workspace_id/integrations
POST /w/:workspace_id/integrations/:provider_key/connect
POST /w/:workspace_id/integrations/:provider_key/credentials
DELETE /w/:workspace_id/integrations/connections/:id
POST /w/:workspace_id/integrations/connections/:id/sync
```

---

## 5. MODEL SCOPING & RELATIONSHIPS

### Workspace Model
**File:** `/app/models/workspace.rb`

```ruby
class Workspace < ApplicationRecord
  validates :remote_id, presence: true, uniqueness: true

  has_many :conversations, dependent: :destroy
  has_many :messages, through: :conversations
  has_many :contacts, dependent: :destroy

  def workos_organization
    @workos_organization ||= WorkOS::Organizations.get_organization(id: remote_id)
  end
end
```

**Key Pattern:**
- `remote_id` (string) - External org ID from WorkOS
- `id` - Can be overridden with `organization.external_id`
- All relationships cascade delete

### Conversation Model - Example Scoped Model
**File:** `/app/models/conversation.rb`

```ruby
class Conversation < ApplicationRecord
  belongs_to :workspace
  belongs_to :sender, class_name: 'Contact', optional: true
  has_many :messages, dependent: :destroy
  has_many :attachments, through: :messages

  enum status: { unread: 0, read: 1, archived: 2 }
  enum priority: { normal: 0, high: 1, urgent: 2 }
  enum channel: { email: 0, sms: 1, whatsapp: 2, instagram: 3, slack: 4 }

  scope :active, -> { where(status: [:unread, :read]) }
  scope :by_channel, ->(channel) { where(channel: channel) }
  scope :by_status, ->(status) { where(status: status) unless status == 'all' }

  validates :workspace_id, :external_id, :external_source, presence: true
  validates :external_id, uniqueness: { scope: [:workspace_id, :external_source] }

  # ... instance methods ...
end
```

**Scoping Pattern:**
- Implicitly scoped via `WorkspaceOwnable` concern
- Query: `Conversation.find(id)` returns workspace-scoped result
- To bypass: `Conversation.across_all_workspaces.find(id)`

### Contact Model - Workspace-Scoped
**File:** `/app/models/contact.rb`

```ruby
class Contact < ApplicationRecord
  belongs_to :workspace
  has_many :messages_sent, class_name: 'Message', foreign_key: 'sender_id'
  has_many :conversations_started, class_name: 'Conversation', foreign_key: 'sender_id'

  validates :workspace_id, :email, presence: true
  validates :email, uniqueness: { scope: :workspace_id }
end
```

**Uniqueness Pattern:**
- Email unique per workspace, not globally
- Uses composite key: `workspace_id + email`

### Message Model - Cascading Workspace Access
**File:** `/app/models/message.rb`

```ruby
class Message < ApplicationRecord
  belongs_to :conversation
  belongs_to :sender, class_name: 'Contact'
  has_many :attachments, dependent: :destroy

  enum status: { unread: 0, read: 1, archived: 2 }

  validates :conversation_id, :external_id, :channel, presence: true
  validates :external_id, uniqueness: { scope: :conversation_id }

  # Messages are automatically workspace-scoped through conversation
  # No explicit WorkspaceOwnable needed
end
```

---

## 6. EXISTING INTEGRATIONS PATTERN

### OrbitConnect Integration Framework
**Location:** Gem - `orbit_connect` (from migrations)

**Schema Pattern:**
```ruby
create_table :orbit_connect_connections do |t|
  t.string "owner_type", null: false  # "Workspace" or user type
  t.uuid "owner_id", null: false      # Workspace ID or user ID
  t.string "provider_key", null: false
  t.string "status", default: "pending"
  t.string "health_status"
  t.jsonb "health_payload", default: {}
  t.datetime "last_synced_at"
  t.string "external_name"
  t.jsonb "settings", default: {}
  # ... more fields
end

create_table :orbit_connect_credentials do |t|
  t.bigint "connection_id", null: false
  t.string "credential_type", default: "oauth"
  t.jsonb "encrypted_data"  # Encrypted credentials
  t.datetime "expires_at"
end
```

**Key Patterns:**
1. **Polymorphic Owner:** `owner_type: "Workspace"`, `owner_id: workspace_id`
2. **Encrypted Storage:** `orbit_connect_credentials.encrypted_data` stores sensitive data
3. **Health Tracking:** `health_status`, `health_payload` for error tracking
4. **External Names:** `external_name` for display (user@gmail.com, etc.)
5. **Settings:** `settings` jsonb for provider-specific configuration

### Connection Manager Service
**Usage Pattern from IntegrationsController:**

```ruby
# Start OAuth flow
result = OrbitConnect::ConnectionManager.start!(
  provider_key: params[:provider_key],
  owner: Current.workspace,
  initiator: Current.user,
  return_to: workspace_settings_url(workspace_id: @workspace.id)
)

# Submit API key credentials
connection = OrbitConnect::ConnectionManager.submit_credentials!(
  provider_key: params[:provider_key],
  owner: Current.workspace,
  initiator: Current.user,
  credentials: credential_params
)

# Complete OAuth callback
connection = OrbitConnect::ConnectionManager.complete_oauth!(
  provider_key: params[:provider_key],
  code: params[:code],
  state: params[:state]
)

# Disconnect
OrbitConnect::ConnectionManager.disconnect!(connection, actor: Current.user)

# Sync data
OrbitConnect::SyncConnectionJob.perform_later(connection.id, trigger: "manual")
```

---

## 7. OAUTH & CREDENTIAL MANAGEMENT UI PATTERNS

### Integration Hook - Data Fetching
**File:** `/app/frontend/features/integrations/hooks/useIntegrations.ts`

```typescript
export const useIntegrations = () => {
  const { workspace } = useWorkspace();
  const queryClient = useQueryClient();

  // Fetch integrations catalog and connections
  const { data, isLoading, error, refetch } = useQuery<IntegrationCatalogResponse>({
    queryKey: ['integrations', workspace?.id],
    queryFn: async () => {
      const response = await fetch(`/w/${workspace?.id}/integrations`, {
        headers: { 'Accept': 'application/json' },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch integrations');
      }
      return response.json();
    },
    enabled: !!workspace?.id,
  });

  // Connect integration mutation
  const connectMutation = useMutation({
    mutationFn: async ({ providerKey, credentials }: { 
      providerKey: string; 
      credentials?: any 
    }) => {
      const url = credentials
        ? `/w/${workspace?.id}/integrations/${providerKey}/credentials`
        : `/w/${workspace?.id}/integrations/${providerKey}/connect`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': document.querySelector<HTMLMetaElement>(
            'meta[name="csrf-token"]'
          )?.content || '',
        },
        body: credentials ? JSON.stringify(credentials) : undefined,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to connect');
      }
      return response.json();
    },
    onSuccess: (data) => {
      // If OAuth, redirect to OAuth URL
      if (data.redirect_url) {
        window.location.href = data.redirect_url;
      } else {
        queryClient.invalidateQueries({ queryKey: ['integrations'] });
      }
    },
  });

  return {
    catalog: data?.catalog || [],
    connections: data?.connections || [],
    isLoading,
    connectIntegration: connectMutation.mutate,
    disconnectIntegration: disconnectMutation.mutate,
    // ... more methods
  };
};
```

**Pattern Key Points:**
- Uses `useWorkspace()` provider for workspace context
- Workspace ID in all API URLs
- TanStack Query for server state
- CSRF token from meta tag for POST requests
- OAuth redirects via `window.location.href`

### OAuth Connect Dialog Component
**File:** `/app/frontend/features/integrations/components/OAuthConnectDialog.tsx`

```typescript
export const OAuthConnectDialog = ({
  open,
  integration,
  onClose,
  onConnect,
}: OAuthConnectDialogProps) => {
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = async () => {
    setIsConnecting(true);
    
    // In real implementation:
    // 1. Open OAuth popup window
    // 2. Redirect to OAuth provider
    // 3. Handle callback
    // 4. Exchange code for tokens
    // 5. Store credentials securely (backend only)
    
    const mockAccountInfo = {
      accountName: integration.name === 'Gmail' ? 'user@example.com' : 'Example Account',
      accountEmail: 'user@example.com',
      scopes: integration.scopes || [],
    };
    
    onConnect(integration.id, mockAccountInfo);
    setIsConnecting(false);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Connect {integration.name}</DialogTitle>
      <DialogContent>
        {/* Description */}
        <Typography>{integration.description}</Typography>

        {/* Security Notice */}
        <Alert icon={<SecurityIcon />} severity="info">
          You'll be redirected to {integration.oauthProvider} to authorize Orbit.
          Your credentials are never stored by Orbit.
        </Alert>

        {/* Permissions List */}
        {integration.scopes && (
          <List>
            {integration.scopes.map((scope) => (
              <ListItem key={scope}>
                <CheckIcon /> {getScopeDescription(scope)}
              </ListItem>
            ))}
          </List>
        )}
      </DialogContent>
      <DialogActions>
        <Button variant="outlined" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="contained" onClick={handleConnect} disabled={isConnecting}>
          {isConnecting ? 'Connecting...' : 'Connect'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
```

**UI Patterns:**
- Displays integration icon and name
- Shows scope permissions
- Security notice for credential handling
- Disabled state during connection
- Documentation link to integration guide

### API Key Connect Dialog
**File:** `/app/frontend/features/integrations/components/ApiKeyConnectDialog.tsx`

- Dynamic field rendering based on integration requirements
- Password field visibility toggle
- Field validation with error messages
- Secure credential handling (no client-side storage)

---

## 8. SETTINGS/ADMIN UI STRUCTURE

### Settings View - Mode D (Configuration Workspace)
**File:** `/app/frontend/features/settings/SettingsView.tsx`

**Architecture:**
- Left sidebar: 260px (navigation surface)
- Right workspace: flex (work surface)
- Pattern: Settings sidebar + configuration panels

### Settings Sidebar Component
**File:** `/app/frontend/features/settings/components/SettingsSidebar.tsx`

```typescript
const sections = [
  { id: 'appearance', label: 'Appearance', icon: <PaletteIcon /> },
  { id: 'notifications', label: 'Notifications', icon: <NotificationsIcon /> },
  { id: 'integrations', label: 'Integrations', icon: <IntegrationIcon /> },
  { id: 'users', label: 'Users & Roles', icon: <PeopleIcon /> },
  { id: 'security', label: 'Security', icon: <SecurityIcon /> },
  { id: 'billing', label: 'Billing', icon: <PaymentIcon /> },
];

// Layout pattern:
// width: layout.settingsSidebar.width (260px)
// bgcolor: color.surface.navigation
// border: 1px solid alpha(color.neutral[900], 0.04)
```

**Component Organization:**
- Each section has dedicated component (IntegrationsSettings, etc.)
- Sidebar uses `selectedSection` state
- Workspace renders active section component
- Instant switching without transitions

### Integration Settings Pattern
**File:** `/app/frontend/features/settings/components/IntegrationsSettings.tsx`

```typescript
export const IntegrationsSettings = () => {
  const {
    connections,
    connectIntegration,
    disconnectIntegration,
    isLoading,
  } = useIntegrations();

  return (
    <Box>
      {/* Channel Integrations Section */}
      <SettingSection
        title="Channel Integrations"
        description="Connect your communication channels..."
        isFirst
      >
        <IntegrationCatalog
          connections={connections}
          onConnect={handleConnect}
          onDisconnect={handleDisconnect}
          onSettings={handleSettings}
          showSearch={true}
          showTabs={true}
        />
      </SettingSection>

      {/* API & Webhooks Section */}
      <SettingSection
        title="API & Webhooks"
        description="Manage API keys and webhook endpoints..."
      >
        {/* API Keys Management */}
        {/* Webhooks Management */}
      </SettingSection>
    </Box>
  );
};
```

**UI Pattern:**
- Uses `SettingSection` pattern component
- Integrations catalog with search/filter
- API key creation dialog
- Webhook endpoint management
- Status badges for connections
- Connection metadata display

### Setting Section Pattern Component
**File:** `/app/frontend/features/settings/patterns/SettingSection.tsx`

```typescript
interface SettingSectionProps {
  title: string;
  description: string;
  isFirst?: boolean;
  children: React.ReactNode;
}

export const SettingSection = ({
  title,
  description,
  isFirst,
  children,
}: SettingSectionProps) => {
  return (
    <Box
      sx={{
        pb: spacing[32],
        borderBottom: `1px solid ${alpha(color.neutral[900], 0.06)}`,
        ...(isFirst ? { pt: spacing[40] } : { pt: spacing[40] }),
      }}
    >
      <Box sx={{ mb: spacing[24] }}>
        <Typography sx={{ fontSize: typography.fontSize.lg, fontWeight: 'semibold' }}>
          {title}
        </Typography>
        <Typography sx={{ fontSize: typography.fontSize.sm, color: text.secondary }}>
          {description}
        </Typography>
      </Box>
      {children}
    </Box>
  );
};
```

**Pattern Usage:**
- Consistent section headers
- Description text
- Divider between sections
- Consistent spacing (40px between, 32px bottom)
- First section has top padding

---

## 9. ROUTING PATTERNS

### Workspace-Scoped Routes
**File:** `/config/routes.rb` (partial)

```ruby
# Workspace routes
get "/w/:workspace_id", to: redirect("/w/%{workspace_id}/inbox/all"), as: :workspace
get "/w/:workspace_id/inbox/:view_id", to: "workspace#inbox", as: :workspace_inbox
get "/w/:workspace_id/contacts", to: "workspace#contacts", as: :workspace_contacts
get "/w/:workspace_id/rules", to: "workspace#rules", as: :workspace_rules
get "/w/:workspace_id/settings", to: "workspace#settings", as: :workspace_settings

scope "/w/:workspace_id" do
  # All routes under this scope get workspace_id param
  resources :integrations, only: [:index]
  post "/integrations/:provider_key/connect", to: "integrations#connect"
  post "/integrations/:provider_key/credentials", to: "integrations#credentials"
  delete "/integrations/connections/:id", to: "integrations#disconnect"
  post "/integrations/connections/:id/sync", to: "integrations#sync"
end

# OAuth callback (outside workspace scope - can handle all workspaces)
post "/integrations/oauth/:provider_key/callback", to: "integrations/oauth#callback"
```

**Key Patterns:**
- All authenticated routes scoped under `/w/:workspace_id`
- workspace_id in every URL
- OAuth callback outside scope (handles multiple workspaces)
- RESTful actions for resource operations

---

## 10. FRONTEND DATA LAYER PATTERNS

### Workspace Provider
**Pattern:** `useWorkspace()` hook provides workspace context

```typescript
const { workspace } = useWorkspace();
// workspace = { id, name, remoteId, ... }

// Used in:
// - useIntegrations() hook
// - API URL construction
// - Cache key creation (queryKey: ['integrations', workspace?.id])
```

### Data Fetching with TanStack Query
**Pattern:** 
- `useQuery` for server state
- `useMutation` for mutations
- Workspace ID in cache keys
- `queryClient.invalidateQueries()` for updates

### Store Management with Zustand
**File:** `/app/frontend/features/integrations/store/integrationsStore.ts`

```typescript
interface IntegrationsStore {
  connections: IntegrationConnection[];
  addConnection: (connection: IntegrationConnection) => void;
  updateConnection: (id: string, updates: Partial<IntegrationConnection>) => void;
  removeConnection: (id: string) => void;
  getConnection: (integrationId: string) => IntegrationConnection | undefined;
}

export const useIntegrationsStore = create<IntegrationsStore>((set, get) => ({
  connections: [],
  addConnection: (connection) =>
    set((state) => ({
      connections: [...state.connections, connection],
    })),
  // ... more methods
}));
```

**Pattern:**
- UI state in Zustand
- Server state in TanStack Query
- No mix of concerns

---

## 11. DATABASE SCHEMA PATTERNS

### UUID for Workspace References
**Pattern: All workspace foreign keys are UUID**

```ruby
# Conversations
t.uuid :workspace_id, null: false

# Contacts  
t.uuid :workspace_id, null: false

# Messages (indirect through conversation)
# No direct workspace_id field
```

### Composite Unique Indexes
**Pattern: Always include workspace_id in unique constraints**

```ruby
# Conversations
add_index :conversations, 
  [:external_id, :external_source, :workspace_id], 
  unique: true

# Contacts
add_index :contacts, 
  [:workspace_id, :email], 
  unique: true

# Messages
add_index :messages, 
  [:external_id, :conversation_id], 
  unique: true  # conversation_id implicitly scopes to workspace
```

### Foreign Key Constraints
**Pattern:**

```ruby
add_foreign_key :conversations, :workspaces
add_foreign_key :contacts, :workspaces
add_foreign_key :messages, :conversations
add_foreign_key :attachments, :messages
```

---

## 12. SETUP/ONBOARDING PATTERNS

### SetupController Flow
**File:** `/app/controllers/setup_controller.rb`

```ruby
class SetupController < InertiaController
  allow_authenticated_without_workspace only: %i[show update]

  STEP_FIELDS = {
    "workspace" => %i[workspace_name industry],
    "team" => %i[team_size role],
    "channels" => %i[use_cases channels]
  }.freeze

  def complete_setup
    workos_config = Rails.configuration.auth.fetch(:workos)
    result = ::Setup::CompleteWorkspaceProvisioning.new(
      user: Current.user,
      sealed_session: session_cookie_value,
      cookie_password: workos_config.fetch(:cookie_password),
      client_id: workos_config.fetch(:client_id),
      setup_data: session[:setup_data] || {}
    ).call

    set_session_cookie!(result.sealed_session)
    Current.workspace = result.workspace  # SET WORKSPACE AFTER PROVISIONING
    session[:setup] = session[:setup_data]
    session.delete(:setup_data)

    redirect_to workspace_settings_path(
      result.workspace.id, 
      onboarding: "1"
    ), flash: { success: "Welcome!" }
  end
end
```

**Pattern:**
- Multi-step form in session
- Validates before advancing
- Calls provisioning service
- Sets workspace after creation
- Redirects to settings with onboarding flag

### Integration Onboarding Pattern
**IntegrationCatalog in Setup Context:**
- Accepts `filterCategories` prop to show only relevant integrations
- Accepts `maxItems` prop to limit display
- Used in setup flow with focused category selection

---

## 13. KEY CONVENTIONS SUMMARY

| Aspect | Convention | Example |
|--------|-----------|---------|
| **Workspace Reference** | `workspace_id` (UUID) | `t.uuid :workspace_id` |
| **Foreign Key Constraints** | Standard Rails FKs | `add_foreign_key :table, :workspaces` |
| **Uniqueness with Scope** | Include workspace_id | `unique: { scope: :workspace_id }` |
| **Default Scoping** | `WorkspaceOwnable` concern | `default_scope { where(workspace: Current.workspace_or_raise!) }` |
| **Bypass Scoping** | `.across_all_workspaces` or `.unscoped` | `Model.across_all_workspaces.find(id)` |
| **Context Access** | `Current.workspace` | Automatic in all layers |
| **Controller Inheritance** | `InertiaController` | Provides shared props |
| **Before Actions** | Standard auth filters | Inherited, can customize |
| **Settings Navigation** | Sidebar + Section pattern | 260px sidebar + flex workspace |
| **Integration Connection** | `owner_type: "Workspace"`, `owner_id: uuid` | Polymorphic relationship |
| **OAuth Redirect** | `window.location.href` | External auth flow |
| **API Key Storage** | Encrypted JSONB | `orbit_connect_credentials.encrypted_data` |
| **Routing** | `/w/:workspace_id/...` | All scoped routes |
| **Data Fetching** | TanStack Query with workspace in cache key | `['integrations', workspace?.id]` |
| **Credential Retrieval** | Never on frontend, backend only | API returns `masked_value` if needed |

---

## 14. SECURITY PATTERNS

### Credential Handling
1. **Never store on frontend:** Credentials only on backend
2. **Encryption at rest:** `orbit_connect_credentials.encrypted_data` (JSONB, encrypted)
3. **Secure transmission:** HTTPS only
4. **CSRF Protection:** Meta tag CSRF token in mutations
5. **OAuth security:** State parameter for CSRF protection

### Workspace Authorization
1. **Default scoping:** Models auto-filter by `Current.workspace`
2. **Authorization checks:** `authorize_connection!(connection)` in controllers
3. **Workspace header validation:** `set_workspace` method validates access
4. **400 Forbidden:** For unauthorized workspace access

### User Authorization
1. **Before actions:** `before_action :require_authentication`
2. **Before actions:** `before_action :require_workspace`
3. **Actor tracking:** `initiator: Current.user` in service calls
4. **Audit logs:** Via `orbit_connect_audit_logs` table

---

## 15. IMPLEMENTATION CHECKLIST FOR SIMILAR FEATURES

When building workspace-scoped features, follow:

- [ ] Add `workspace_id: uuid` to model table
- [ ] Add `belongs_to :workspace` to model
- [ ] Include `WorkspaceOwnable` concern
- [ ] Add foreign key constraint to workspaces
- [ ] Create composite unique index with workspace_id
- [ ] Use `Current.workspace` in queries/services
- [ ] Add `before_action :set_workspace` in controller
- [ ] Add authorization check: `head :forbidden unless @workspace`
- [ ] Include workspace ID in all API route params
- [ ] Pass workspace ID in JavaScript fetch URLs
- [ ] Use workspace ID in TanStack Query cache keys
- [ ] Render via InertiaController (auto-passes workspace)
- [ ] Add credentials to encrypted JSONB field
- [ ] Log actions via audit system
- [ ] Test across_all_workspaces and scoping boundaries

---

