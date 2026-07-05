# Orbit Settings - Enterprise Configuration Interface

## Overview

The Orbit Settings module provides enterprise-grade system configuration following Google Workspace-style controls. This is NOT a consumer settings form - it's an operational, infrastructure-level interface designed for serious enterprise users.

## Architecture

```
/src/features/settings/
├── SettingsView.tsx              # Main container with routing
├── components/
│   ├── SettingsSidebar.tsx       # Left navigation rail
│   ├── SettingsHeader.tsx        # Page title and description
│   ├── AppearanceSettings.tsx    # Theme controls
│   ├── NotificationsSettings.tsx # Notification preferences (COMPLETE)
│   └── PlaceholderSettings.tsx   # Placeholder for unbuilt sections
└── patterns/
    ├── SettingRow.tsx            # Reusable toggle row pattern
    └── SettingSection.tsx        # Section container with dividers
```

## Design Philosophy

### Orbit Enterprise Visual Intelligence System

**Color Distribution:**
- **Neutral: 85-90%** - Entire settings interface uses neutral surfaces
- **Functional: 8-10%** - Status indicators use desaturated tones
- **Accent: 2-3%** - Action colors appear only for primary decisions

**Surface Hierarchy:**
- **Layer 1 (Environment):** Settings sidebar - `color.surface.navigation`
- **Layer 3 (Work Surface):** Main content panel - `color.surface.work`
- **Tonal Borders:** `alpha(color.neutral[900], 0.04)` instead of visible borders

### UI Principles

1. **Structured Toggle Rows** - No cards, no heavy styling
2. **Calm Enterprise Spacing** - 8px grid system throughout
3. **Inline Descriptions** - Context below each setting label
4. **Subtle Dividers** - Minimal tonal separation between rows
5. **Document-First Typography** - Calm, professional, readable

## Sections

### ✅ Appearance (Complete)
- Dark mode toggle
- Uses semantic SettingRow pattern

### ✅ Notifications (Complete)
Enterprise notification controls with 5 major sections:

#### 1. Channel Preferences
- Email notifications
- Slack notifications
- WhatsApp notifications
- Push notifications

#### 2. AI Assistance Notifications
- AI-generated summaries
- Suggested replies
- Urgent message detection
- Sentiment change alerts

#### 3. Assignment & Status Updates
- New assignments
- Status changes
- Mentions and replies
- Team activity

#### 4. Automation Alerts
- Rule execution alerts
- Automation failures
- Integration errors

#### 5. Summary Digests
- Weekly digest
- Monthly report

### 🚧 Integrations (Placeholder)
Future: Grid-based integration list with status badges

### 🚧 Users & Roles (Placeholder)
Future: Table-driven user management interface

### 🚧 Security (Placeholder)
Future: SSO, MFA, API keys, session management

### 🚧 Billing (Placeholder)
Future: Plan overview, usage metrics, invoices

## Component API

### SettingRow

```tsx
<SettingRow
  label="Email notifications"
  description="Receive notifications via email for new messages and updates"
  checked={emailNotifications}
  onChange={setEmailNotifications}
  disabled={false}
/>
```

**Props:**
- `label: string` - Setting name
- `description: string` - Inline help text
- `checked: boolean` - Toggle state
- `onChange: (checked: boolean) => void` - State handler
- `disabled?: boolean` - Disable interaction

**Visual Behavior:**
- Hover: Subtle neutral background (`alpha(neutral[900], 0.02)`)
- Transition: 120ms ease
- Switch color: `color.functional.primary` when enabled

### SettingSection

```tsx
<SettingSection
  title="Channel Preferences"
  description="Choose where you want to receive notifications"
  isFirst={true}
>
  {/* SettingRow components */}
</SettingSection>
```

**Props:**
- `title: string` - Section heading
- `description?: string` - Optional section description
- `children: React.ReactNode` - Setting rows and dividers
- `isFirst?: boolean` - Remove top border for first section

**Visual Behavior:**
- Surface: `color.surface.work` (white/cream)
- Border: `alpha(neutral[900], 0.04)` minimal tonal border
- Dividers: `alpha(neutral[900], 0.06)` between sections

## Design Tokens Used

### Semantic Surface Tokens
```typescript
color.surface.navigation  // Settings sidebar background
color.surface.work        // Main content area background
```

### Action Tokens
```typescript
action.primary           // Switch active state, selected sidebar item
action.primaryHover      // Hover states
```

### Spacing (8px Grid)
```typescript
spacing[4]   // 4px  - Tight spacing
spacing[8]   // 8px  - Base unit
spacing[16]  // 16px - Row padding
spacing[20]  // 20px - Row horizontal padding
spacing[24]  // 24px - Sidebar padding
spacing[32]  // 32px - Section spacing
spacing[48]  // 48px - Page padding vertical
spacing[64]  // 64px - Page padding horizontal
```

### Typography
```typescript
typography.fontSize.sm    // 12px - Descriptions
typography.fontSize.md    // 14px - Labels, sidebar items
typography.fontSize.lg    // 15px - Section titles
typography.fontSize.xl    // 16px - Sidebar header
typography.fontSize.xxl   // 18px - Page titles

typography.fontWeight.normal     // 400
typography.fontWeight.medium     // 500
typography.fontWeight.semibold   // 600
```

### Text Colors
```typescript
text.primary   // Main labels, headings
text.secondary // Sidebar items (unselected)
text.tertiary  // Descriptions, helper text
```

## Navigation

Settings is accessible from the workspace rail:
- **Path:** `/w/:workspaceId/settings`
- **Icon:** Settings gear icon at bottom of rail
- **Active state:** Blue indicator bar + tinted background

## State Management

Currently uses React `useState` for local component state. All settings are ephemeral (not persisted).

**Future:** 
- Add persistence layer (localStorage or Supabase)
- Add "Save Changes" primary action button
- Add unsaved changes warning

## Extending Settings

### Adding a New Section

1. **Create the settings component:**
```tsx
// /src/features/settings/components/IntegrationsSettings.tsx
export const IntegrationsSettings = () => {
  return (
    <Box>
      <SettingSection
        title="Connected Services"
        description="Manage your integrations"
        isFirst
      >
        {/* Your content */}
      </SettingSection>
    </Box>
  );
};
```

2. **Register in SettingsView.tsx:**
```tsx
{selectedSection === 'integrations' && <IntegrationsSettings />}
```

3. **The sidebar item already exists** - no changes needed

### Creating Custom Setting Controls

Beyond toggles, you can create:
- **Select dropdowns** - Maintain minimal enterprise styling
- **Input fields** - Use neutral borders and subtle focus states
- **Radio groups** - Keep structured row pattern
- **Slider controls** - Rare, but use `color.functional.primary`

**Rule:** Any new control must follow the SettingRow structure:
- Left: Label + description
- Right: Control
- Hover: Subtle neutral background
- No card backgrounds

## Enterprise Design Compliance

✅ **Neutral-first** - 90%+ of UI is desaturated gray  
✅ **Structured rows** - No colorful cards or marketing visuals  
✅ **Tonal hierarchy** - Surface differences instead of borders  
✅ **Calm spacing** - 8px grid creates breathing room  
✅ **Document-first** - Typography optimized for scanning  
✅ **Operational tone** - System controls, not consumer settings  

## Comparison to Consumer Settings

| Consumer Settings | Orbit Enterprise Settings |
|-------------------|--------------------------|
| Colorful cards | Neutral structured rows |
| Heavy borders | Tonal surface differences |
| Marketing copy | Operational descriptions |
| Visual decoration | Functional clarity |
| Tabs | Sidebar navigation |
| Modal dialogs | In-place controls |

## Future Enhancements

1. **Persistence** - Save settings to backend
2. **Validation** - Required field checks
3. **Permissions** - Admin-only sections
4. **Search** - Filter settings by keyword
5. **Export/Import** - Configuration backup
6. **Audit Log** - Track setting changes
7. **Tooltips** - Additional contextual help
8. **Keyboard navigation** - Tab through settings

---

**Status:** Appearance and Notifications sections complete. Other sections use placeholders and are ready for implementation following the established patterns.
