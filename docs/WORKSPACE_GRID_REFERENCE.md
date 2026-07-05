# 📐 Orbit Workspace Grid Reference

> **Quick reference for panel widths, workspace layouts, and spatial consistency**

---

## 🎯 The Sacred Grid (Never Change These)

```typescript
// /src/shared/tokens/design-tokens.ts

export const layout = {
  rail:             { width: '72px' },   // System navigation
  conversationsPane: { width: '320px' },  // Inbox list
  settingsSidebar:  { width: '260px' },  // Configuration nav
  aiPane:           { width: '360px' },  // AI Context Panel
  threadPane:       { minWidth: '480px' }, // Flex, but min width
} as const;
```

**Why Sacred?**  
Enterprise users build muscle memory. Panel locations must be predictable.

---

## 🏗️ Four Workspace Layout Patterns

### 1️⃣ Mode A — Conversation Workspace (Inbox)

```
┌──────┬─────────┬──────────────────┬──────────┐
│ Rail │  List   │      Thread      │ AI Panel │
│ 72px │  320px  │   Flex (480+)    │  360px   │
└──────┴─────────┴──────────────────┴──────────┘
```

**Total Width:** `72 + 320 + 480+ + 360 = 1,232px minimum`

**Pages:**
- Inbox (All, Assigned, Mentions, AI Queue, Closed)

**Implementation:**
```tsx
<Box sx={{ display: 'flex', flex: 1 }}>
  <ConversationsPane width={layout.conversationsPane.width} />
  <ThreadPane sx={{ flex: 1, minWidth: layout.threadPane.minWidth }} />
  <AIContextPanel width={layout.aiPane.width} />
</Box>
```

**Surface Layers:**
```
Rail:         color.surface.navigation (#FCFCFC)
List:         color.surface.navigation (#FCFCFC)
Thread:       color.surface.work       (#FFFEFB - warmest)
AI Panel:     color.surface.ai         (violet tint)
```

---

### 2️⃣ Mode B — Management Workspace (Contacts, Users, Billing)

```
┌──────┬──────────────────────────────────┐
│ Rail │       Full Workspace Surface      │
│ 72px │            Flex (full)            │
└──────┴──────────────────────────────────┘
```

**Total Width:** `72 + flex = Full viewport`

**Pages:**
- Contacts
- Users & Roles
- Billing
- Integrations (future)
- Analytics (future)

**Implementation:**
```tsx
<Box sx={{ display: 'flex', flex: 1 }}>
  <Box sx={{ flex: 1, bgcolor: color.surface.work }}>
    {/* Full-width management surface */}
  </Box>
</Box>
```

**Surface Layers:**
```
Rail:         color.surface.navigation (#FCFCFC)
Workspace:    color.surface.work       (#FFFEFB)
```

---

### 3️⃣ Mode C — Builder Workspace (Rules & Automation)

```
┌──────┬──────────────────────────┬──────────┐
│ Rail │    Canvas / Builder      │ AI Helper│
│ 72px │      Flex (600+)         │  360px   │
└──────┴──────────────────────────┴──────────┘
                                   (Optional)
```

**Total Width:** `72 + 600+ (+ 360 optional) = Adaptive`

**Pages:**
- Rules & Automation

**Implementation:**
```tsx
<Box sx={{ display: 'flex', flex: 1 }}>
  <Box sx={{ flex: 1, minWidth: '600px', bgcolor: color.surface.work }}>
    {/* Canvas / Flow Builder */}
  </Box>
  {showAIHelper && (
    <AIHelperPanel width={layout.aiPane.width} />
  )}
</Box>
```

**Surface Layers:**
```
Rail:         color.surface.navigation (#FCFCFC)
Canvas:       color.surface.work       (#FFFEFB)
AI Helper:    color.surface.ai         (violet tint)
```

**Notes:**
- AI Helper panel is optional, user can toggle
- Canvas area needs horizontal scroll if content exceeds viewport
- Infinite canvas pattern (like Figma, Linear workflows)

---

### 4️⃣ Mode D — Configuration Workspace (Settings)

```
┌──────┬──────────┬──────────────────────────┐
│ Rail │ Sidebar  │   Configuration Canvas   │
│ 72px │  260px   │       Flex (520+)        │
└──────┴──────────┴──────────────────────────┘
```

**Total Width:** `72 + 260 + 520+ = 852px minimum`

**Pages:**
- Settings (Appearance, Notifications, Integrations, Users, Security, Billing)

**Implementation:**
```tsx
<Box sx={{ display: 'flex', flex: 1 }}>
  <SettingsSidebar width={layout.settingsSidebar.width} />
  <Box sx={{ flex: 1, minWidth: '520px', bgcolor: color.surface.work }}>
    {/* Configuration panel */}
  </Box>
</Box>
```

**Surface Layers:**
```
Rail:         color.surface.navigation (#FCFCFC)
Sidebar:      color.surface.navigation (#FCFCFC)
Canvas:       color.surface.work       (#FFFEFB)
```

**Notes:**
- Sidebar spatially replaces conversation list (same 260-320px range)
- Instant section switching (no transitions)
- Canvas area contains settings controls

---

## 📊 Grid Compliance Matrix

| Page | Mode | Layout | Grid Compliance |
|------|------|--------|----------------|
| **Inbox (All)** | A | 72 + 320 + flex + 360 | ✅ Perfect |
| **Inbox (Assigned)** | A | 72 + 320 + flex + 360 | ✅ Perfect |
| **Contacts** | B | 72 + flex | ✅ Perfect |
| **Rules** | C | 72 + flex (+ 360) | 🚧 Planned |
| **Settings/Appearance** | D | 72 + 260 + flex | ✅ Perfect |
| **Settings/Notifications** | D | 72 + 260 + flex | ✅ Perfect |
| **Settings/Integrations** | D | 72 + 260 + flex | 🚧 Planned |
| **Settings/Users** | D | 72 + 260 + flex | 🚧 Planned |
| **Settings/Security** | D | 72 + 260 + flex | 🚧 Planned |
| **Settings/Billing** | D | 72 + 260 + flex | 🚧 Planned |

---

## 🎨 Surface Token Usage

### Layer System

```
Layer 1 - Environment:   #F8F8F8  (Background, rarely visible)
Layer 2 - Navigation:    #FCFCFC  (Rails, sidebars, lists)
Layer 3 - Work:          #FFFEFB  (Primary focus, warmest)
Layer 4 - Intelligence:  Violet   (AI tint)
```

### When to Use Each Surface

| Surface | Use For | Examples |
|---------|---------|----------|
| `color.surface.environment` | Outer background | Modal overlays, dialogs |
| `color.surface.navigation` | System chrome | Rail, sidebar, conversation list |
| `color.surface.work` | Primary workspace | Thread pane, config canvas, tables |
| `color.surface.ai` | AI features | AI Context Panel, AI suggestions |

---

## ⚡ Responsive Behavior

### Desktop First (1280px+)

All layouts work as designed:
- Mode A: 72 + 320 + 480+ + 360 = 1,232px+ ✅
- Mode B: 72 + flex = works at any size ✅
- Mode C: 72 + 600+ (+ 360) = 1,032px+ ✅
- Mode D: 72 + 260 + 520+ = 852px+ ✅

**Minimum Recommended:** `1280px viewport width`

---

### Tablet (768px - 1279px)

**Recommended Adaptations:**

**Mode A (Inbox):**
```
Option 1 - Collapse AI Panel by default
72 + 320 + flex = 760px minimum ✅

Option 2 - Make conversation list collapsible
72 + flex (thread) + 360 (AI) = works
```

**Mode B (Management):** No changes needed ✅

**Mode C (Builder):** Hide AI Helper by default ✅

**Mode D (Settings):** No changes needed ✅

---

### Mobile (<768px)

**Not recommended for Orbit enterprise workflows.**

If mobile support is required:
- Full-screen single-pane navigation
- Bottom navigation bar replaces rail
- Stack layouts vertically
- This breaks the workspace model intentionally

**Orbit is desktop-first by design.**

---

## 🔒 Grid Enforcement Rules

### ✅ DO

- Use exact token values: `layout.rail.width`, `layout.conversationsPane.width`
- Keep panel widths consistent across pages
- Use flex for primary work areas
- Preserve spatial memory (panels in same locations)

### ❌ DON'T

- Hardcode pixel values (use tokens)
- Change panel widths per page
- Add arbitrary new panel sizes
- Rearrange panel order between pages

---

## 🧩 Adding New Workspace Modes

If you need a new layout pattern:

1. **Identify the mode:** A/B/C/D or truly new?
2. **Check if existing modes fit:** 90% of cases fit A/B/C/D
3. **If new mode needed:**
   - Add to `layout` tokens
   - Document in this file
   - Update `/docs/WORKSPACE_ARCHITECTURE.md`
   - Get design review

**Most new pages fit existing modes:**
- Analytics → Mode B (Management)
- AI Agents → Mode C (Builder)
- Logs → Mode B (Management)
- Profile → Mode D (Configuration)

---

## 📏 Spacing Between Panels

**Borders:**
```typescript
// Tonal borders only (no strong visual lines)
borderRight: `1px solid ${alpha(color.neutral[900], 0.04)}`
borderLeft:  `1px solid ${alpha(color.neutral[900], 0.04)}`
```

**Gaps:**
- No explicit gaps between panels
- Borders provide visual separation
- Surface tone differences handle hierarchy

---

## 🎯 Panel Minimum Widths

| Panel | Min Width | Rationale |
|-------|-----------|-----------|
| **Rail** | 72px (fixed) | Icon + label requires this |
| **Conversations List** | 320px (fixed) | Contact name + preview + metadata |
| **Settings Sidebar** | 260px (fixed) | Icon + section label + padding |
| **Thread Pane** | 480px (min) | Message content readability |
| **AI Panel** | 360px (fixed) | Summary + actions + padding |
| **Canvas/Builder** | 600px (min) | Flow builder drag space |

**Never go below these minimums.** They're based on content requirements.

---

## 🚀 Quick Implementation Checklist

When building a new page:

- [ ] Identify workspace mode (A/B/C/D)
- [ ] Use correct layout tokens from `design-tokens.ts`
- [ ] Apply correct surface tokens for visual hierarchy
- [ ] Test at 1280px, 1440px, 1920px viewport widths
- [ ] Verify panel widths match spec exactly
- [ ] Check that spatial memory is preserved (panels in expected locations)
- [ ] Ensure borders use tonal alpha values (not solid colors)

---

## 📚 Related Documentation

- [Navigation Intelligence](/docs/NAVIGATION_INTELLIGENCE.md)
- [Workspace Architecture](/docs/WORKSPACE_ARCHITECTURE.md)
- [Implementation Status](/docs/IMPLEMENTATION_STATUS.md)
- [Design Tokens](/src/shared/tokens/design-tokens.ts)

---

**Last Updated:** February 22, 2026  
**Maintained By:** Design System Team  
**Status:** Production Standard — DO NOT DEVIATE
