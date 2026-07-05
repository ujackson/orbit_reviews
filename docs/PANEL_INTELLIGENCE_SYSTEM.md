# 🧠 Orbit Enterprise Panel Intelligence System

> **The most advanced layer in modern enterprise UX**

---

## 🎯 Goal

**Panels must feel:**
- ✅ Predictable
- ✅ Intelligent
- ✅ Non-intrusive
- ✅ Context-aware

**Orbit should never feel like:**
- ❌ "Too many sidebars"

**Instead users should feel:**
- ✅ "Orbit shows me what I need when I need it"

---

## 🧱 1. Panel Roles (Foundation)

Orbit has **3 panel types**. Each behaves differently.

### 🟣 SYSTEM PANEL — Left Rail

**Purpose:** Global navigation + identity

**Rules:**
- ✅ Never resizes
- ✅ Never overlays
- ✅ Never disappears
- ✅ State persists across all workspaces

**Mental Model:**
> "This is Orbit itself."

**Current Implementation:**
```typescript
// /src/app/layout/WorkspaceRail.tsx
width: layout.rail.width, // 72px — fixed forever
```

**Status:** ✅ Production-ready

---

### 🟢 WORKSPACE PANELS — Structural Panels

**Examples:**
- Conversation List (Inbox)
- Settings Sidebar (Configuration)
- Rules Builder Sidebar (future)

**Purpose:** Define the layout of a workspace mode

**Rules:**
- ✅ Always visible in their workspace mode
- ✅ No animations that distract
- ✅ Change only when switching workspace type

**Users must feel:**
> "I changed environment."

**NOT:**
> ❌ "The UI shifted randomly."

**Current Implementation:**
```typescript
// Inbox Mode
conversationsPane: 320px (always visible)

// Settings Mode
settingsSidebar: 260px (always visible)
```

**Status:** ✅ Production-ready

---

### 🔵 CONTEXT PANELS — Intelligent Panels (Right Side)

**This is where Orbit becomes elite.**

**Examples:**
- AI Summary
- Customer Metadata
- Suggested Actions
- Automation Suggestions

**Purpose:** Adaptive Intelligence Surfaces

**Rules:**
- ✅ Adapt to user focus (cursor gravity)
- ✅ Morph content, not multiply panels
- ✅ Support three cognitive states (Passive, Assistive, Active)
- ✅ Collapsible, remembers state
- ✅ Context-aware content switching

**Current Implementation:**
```typescript
// /src/features/ai/components/AIContextPanel.tsx
width: layout.aiPane.width, // 360px
collapsible: true,
stateful: true (Zustand)
```

**Status:** 🚧 Needs intelligence enhancement

---

## 🧭 2. Panel Intelligence States

Every context panel supports **three cognitive states**:

### 🟢 Passive State — Awareness

**When:** No user interaction, background intelligence

**Panel Shows:**
- AI conversation summary
- Customer metadata tags
- Activity timeline
- Sentiment analysis

**Design Principle:**
> Never steal focus. User can glance when needed.

**Current Status:** ✅ Implemented in Inbox

**Example (Inbox AI Panel):**
```tsx
<Box>
  <AISummary conversation={conversation} />
  <CustomerMetadata contact={contact} />
  <ActivityTimeline events={events} />
</Box>
```

**Behavior:**
- Subtle, scannable
- No animations
- Doesn't demand attention

---

### 🟡 Assistive State — Engagement

**Triggered when user:**
- Selects text in thread
- Clicks an entity (customer, company)
- Types in reply box
- Hovers over action button

**Panel Adapts:**

**Example 1 — User types in reply box:**
```
Panel switches to:
- Tone suggestions
- Reply confidence score
- Quick action buttons
- Grammar/style hints
```

**Example 2 — User selects text:**
```
Panel switches to:
- "Create rule from this"
- "Add to knowledge base"
- "Translate selection"
```

**Design Principle:**
> Orbit feels alive. Panel anticipates user needs.

**Current Status:** 🚧 Not implemented

**Implementation Plan:**
```typescript
// Listen to thread interactions
onTextSelect={(text) => setPanelMode('assistive', { selectedText: text })}
onReplyFocus={() => setPanelMode('assistive', { context: 'reply' })}
```

---

### 🔴 Active State — Command Mode

**Triggered when user explicitly invokes AI:**
- Clicks "Use Draft"
- Clicks "Assign to AI"
- Clicks "Create Rule"
- Uses keyboard shortcut

**Panel Behavior:**
- Expands slightly (360px → 400px)
- AI response appears
- Action buttons become primary

**Key Rule:**
> Expansion must feel intentional — never automatic.

**Current Status:** 🚧 Not implemented

**Implementation:**
```typescript
// Explicit user command
<Button onClick={() => {
  setPanelState('active');
  setPanelWidth(400); // Expand
  triggerAIDraft();
}}>
  Use AI Draft
</Button>
```

**Visual Cue:**
- Purple gradient intensifies
- Panel elevation increases
- Subtle glow effect

---

## ⚡ 3. Panel Behavior Rules (Critical)

These prevent chaos as Orbit grows.

### ✅ Rule 1 — Panels Never Compete

**Principle:** Only ONE intelligence panel dominates at a time.

**❌ Bad:**
```
[Thread] [AI Panel] [Customer Panel] [Tasks Panel] [Automation Panel]
                    ↑ All fighting for attention
```

**✅ Good:**
```
[Thread] [Intelligence Panel: Tabs]
         └─ AI | Customer | Tasks | Activity
            ↑ One panel, multiple contexts
```

**Implementation:**

Use **tabbed interface** inside context panel:

```tsx
<Tabs value={activeTab}>
  <Tab label="AI" icon={<AutoAwesomeIcon />} />
  <Tab label="Customer" icon={<PersonIcon />} />
  <Tab label="Tasks" icon={<TaskIcon />} />
  <Tab label="Activity" icon={<HistoryIcon />} />
</Tabs>
```

**Behavior:**
- Only one tab active at a time
- Tab switches are instant (no transitions)
- Active tab remembered per conversation

**Current Status:** 🚧 Partially implemented (tabs exist, need enhancement)

---

### ✅ Rule 2 — Panels Should Morph, Not Multiply

**Principle:** Transform existing panel content instead of adding new panels.

**Examples:**

| Workspace | Panel Content | Same Panel, Different Intelligence |
|-----------|---------------|-----------------------------------|
| **Inbox** | AI Summary, Suggested Replies | Conversation-focused |
| **Contacts** | Relationship Insights, Sentiment | Person-focused |
| **Rules** | Automation Suggestions, Triggers | Workflow-focused |
| **Settings** | Validation Tips, Security Hints | Configuration-focused |

**Implementation:**
```tsx
// Same AIContextPanel component
<AIContextPanel 
  mode={currentWorkspace} // 'inbox' | 'contacts' | 'rules' | 'settings'
  context={contextData}
/>
```

**Visual Continuity:**
- Panel stays in same location (360px right)
- Content morphs with subtle fade (120ms)
- Purple gradient intensity varies by workspace

**Current Status:** 🚧 Not implemented (panel is inbox-specific)

---

### ✅ Rule 3 — Panels Follow Cursor Gravity

**Principle:** Where the user acts determines panel behavior.

**Examples:**

| User Action | Panel Response |
|------------|----------------|
| **Clicks conversation in list** | Shows AI summary of that conversation |
| **Clicks contact name** | Shows relationship insights for that contact |
| **Hovers rule node** | Shows automation suggestions for that rule |
| **Focuses reply box** | Shows tone suggestions, quick actions |

**Mental Model:**
> Panel = mirror of focus.

**Implementation:**
```typescript
// Cursor gravity system
const [focusContext, setFocusContext] = useState<FocusContext>({
  type: 'conversation' | 'contact' | 'rule',
  id: string,
  action: 'view' | 'edit' | 'reply',
});

// Panel adapts
<AIContextPanel context={focusContext} />
```

**Current Status:** 🚧 Partially implemented (follows selected conversation)

---

## 🧩 4. Panel Modes by Workspace

Here's how intelligence scales across Orbit.

### 📥 Inbox Mode

**Right Panel Tabs:**
```
AI | Customer | Tasks | Activity
```

**Tab Contents:**

| Tab | Content | Status |
|-----|---------|--------|
| **AI** | Summary, Suggested Replies, Tone Analysis | ✅ Implemented |
| **Customer** | Contact info, Company, Communication history | 🚧 Planned |
| **Tasks** | Related tasks, Create task, Due dates | 🚧 Planned |
| **Activity** | Timeline, Status changes, Assignments | 🚧 Planned |

**Primary Default:** AI tab

**Panel State:** Always visible (360px)

**Visual:** Purple AI gradient (current implementation)

**Current Status:** ✅ AI tab complete, others planned

---

### 👤 Contacts Mode

**Panel Transforms Into:**
```
Profile Insights | Communication | Company Intelligence
```

**Content:**

| Section | Intelligence |
|---------|-------------|
| **Profile Insights** | Sentiment trend, Response time, Preferred channel |
| **Communication** | Recent conversations, Email threads, Message history |
| **Company Intelligence** | Company size, Industry, Recent news |

**Visual Change:**
- Purple AI gradient becomes **softer** (12-15% desaturation)
- More emphasis on neutral data display
- Less "AI magic," more "relationship intelligence"

**Current Status:** 🚧 Not implemented (Contacts is placeholder)

---

### ⚙️ Rules & Automation Mode

**Panel Becomes:**
```
Rule Suggestions | Trigger Diagnostics | Automation Preview
```

**Content:**

| Section | Intelligence |
|---------|-------------|
| **Rule Suggestions** | "Based on conversations, you might want to..." |
| **Trigger Diagnostics** | Test trigger conditions, Recent matches |
| **Automation Preview** | Simulate rule execution, Impact analysis |

**Visual:**
- Purple gradient for AI suggestions
- Blue-tinted surface for diagnostics
- Think **Zapier + AI assistant**

**Current Status:** 🚧 Not implemented (Rules is placeholder)

---

### 🔧 Settings Mode

**Panel Should:**

**❌ NOT dominate** — Enterprise admins hate AI clutter in configuration.

**Instead:**

```
Small helper panel:
- Validation tips
- Security recommendations
- Best practices
```

**Or:**

```
Panel hidden by default
- Only appears on demand
- User can toggle with shortcut
```

**Why:**

> Configuration requires focus, not assistance.

**Current Status:** 🚧 Not implemented (Settings has no panel currently)

**Recommendation:** Hide panel entirely in Settings mode.

---

## 🎛️ 5. Panel Motion Design (Enterprise Psychology)

**Motion should communicate confidence, not playfulness.**

### ✅ Use:

```typescript
transition: {
  duration: 0.12,  // 120ms — fast, decisive
  ease: 'easeOut', // Natural deceleration
}
```

**Effects:**
- Subtle opacity fade (0.95 → 1.0)
- Smooth slide (no bounce)
- Elevation change (subtle shadow)

### ❌ Avoid:

- ❌ Floating popovers (feels unstable)
- ❌ Unpredictable overlays (breaks spatial memory)
- ❌ Bounce animations (too playful)
- ❌ Confetti/celebration effects (not enterprise)

**Orbit should feel like:**
> A control system — not a social app.

**Current Implementation:**
```tsx
// /src/features/inbox/InboxView.tsx
<motion.div
  initial={false}
  animate={{ opacity: hasFocus ? 0.95 : 1 }}
  transition={{ duration: 0.12, ease: 'easeOut' }}
>
```

**Status:** ✅ Aligned with enterprise psychology

---

## 🧠 6. Panel Density Intelligence

**Orbit should auto-adjust density based on screen size.**

### Small Screens (< 1280px)

**Behavior:**
```
Context panel collapses into icon
- Hover to peek (floating overlay)
- Click to expand (takes over thread area)
- Keyboard shortcut to toggle
```

**Why:**
- Preserves thread reading space
- Panel still accessible
- No permanent clutter

### Standard Screens (1280px - 1920px)

**Behavior:**
```
Context panel visible (360px)
- Standard 4-region layout
- All content visible
```

**Current implementation.**

### Ultra-wide Monitors (> 1920px)

**Behavior:**
```
Context panel widens (360px → 440px)
- Shows additional metadata
- Larger AI summaries
- More breathing room
```

**Why:**
> Enterprise users often use 32" monitors — design for that.

**Implementation:**
```tsx
// Responsive panel width
const panelWidth = useMemo(() => {
  if (viewportWidth < 1280) return 0; // Collapsed
  if (viewportWidth > 1920) return 440; // Wide
  return 360; // Standard
}, [viewportWidth]);
```

**Current Status:** 🚧 Not implemented (fixed 360px)

---

## 🔐 7. Panel Governance (Enterprise Requirement)

**Panels must respect:**
- RBAC permissions
- Data visibility rules
- Workspace scope

### Example: Role-Based Panel Content

| Role | Panel Intelligence |
|------|-------------------|
| **Support Agent** | AI + Suggested Replies |
| **Manager** | AI + Analytics + SLA metrics |
| **Admin** | AI + Audit logs + Security alerts |

**Implementation:**
```tsx
<AIContextPanel 
  conversation={conversation}
  userRole={currentUser.role}
  permissions={currentUser.permissions}
/>

// Inside component
if (permissions.includes('view_analytics')) {
  tabs.push({ label: 'Analytics', content: <Analytics /> });
}
```

**Current Status:** 🚧 Not implemented (future: RBAC integration)

---

## 🎨 8. Visual Language for Panel Intelligence

Orbit already uses **purple for AI** — excellent decision.

### Refine Into Three Visual Layers:

| Layer | Color | Meaning | Usage |
|-------|-------|---------|-------|
| **Intelligence** | Purple gradient | AI-powered content | AI summaries, suggestions |
| **System** | Neutral gray | System-level data | Metadata, tags, status |
| **Entity** | Soft blue/green | User/company data | Contact info, company intelligence |

**Examples:**

```tsx
// AI Intelligence
background: color.surface.ai, // Purple tint
border: aiVisualLanguage.border, // Purple accent

// System Data
background: color.surface.navigation, // Neutral
color: text.secondary, // Gray text

// Entity Data
background: alpha(blue[500], 0.05), // Soft blue tint
icon: <PersonIcon sx={{ color: blue[600] }} />
```

**Why This Works:**

> Panels visually communicate meaning without reading labels.

**Current Status:** ✅ Purple = AI implemented

---

## 🚀 9. What FAANG Products Do (Why This Matters)

**Orbit's architecture aligns with:**

| Product | Panel Intelligence Pattern |
|---------|---------------------------|
| **Linear** | Contextual inspector (adapts to selection) |
| **Figma** | Right properties panel (morphs by tool) |
| **Slack** | Thread intelligence panel (AI summaries) |
| **Google Admin** | Contextual sidebar (help + actions) |
| **Notion** | Page properties panel (context-aware) |

**Those tools scale because panels are:**
- ✅ Stateful
- ✅ Adaptive
- ✅ Predictable

**Orbit follows the same pattern.**

---

## 📊 Panel Intelligence Implementation Checklist

### Core Panel System

- [x] **System Panel (Rail)** — 72px fixed, always visible
- [x] **Workspace Panels** — Conversation List (320px), Settings Sidebar (260px)
- [x] **Context Panel** — AI panel (360px), collapsible, stateful

### Intelligence States

- [x] **Passive State** — AI summary, metadata (Inbox)
- [ ] **Assistive State** — Responds to text selection, reply focus
- [ ] **Active State** — Panel expansion on explicit AI commands

### Panel Behavior Rules

- [ ] **Panels Never Compete** — Tab system (AI | Customer | Tasks | Activity)
- [ ] **Panels Morph** — Content changes by workspace mode
- [ ] **Cursor Gravity** — Panel follows user focus

### Panel Modes by Workspace

- [x] **Inbox Mode** — AI tab implemented
- [ ] **Inbox Mode** — Customer, Tasks, Activity tabs
- [ ] **Contacts Mode** — Relationship insights transformation
- [ ] **Rules Mode** — Automation suggestions panel
- [ ] **Settings Mode** — Hide panel or minimal helper

### Advanced Features

- [ ] **Panel Density Intelligence** — Responsive width (< 1280px, > 1920px)
- [ ] **Panel Governance** — RBAC-based content
- [ ] **Visual Language** — Purple/Gray/Blue semantic colors
- [ ] **Motion Design** — 120ms, easeOut, no bounce

---

## 🎯 Implementation Phases

### Phase 1 — Tab System (Current Priority)

**Goal:** AI | Customer | Tasks | Activity tabs in Inbox

**Tasks:**
1. Enhance AIContextPanel with tab navigation
2. Create CustomerTab component (contact info, history)
3. Create TasksTab component (related tasks, create task)
4. Create ActivityTab component (timeline, status changes)
5. Remember active tab per conversation (Zustand)

**Estimated Time:** 1 week

**Impact:** High — Prevents panel competition

---

### Phase 2 — Intelligence States

**Goal:** Assistive and Active states

**Tasks:**
1. Listen to text selection in thread
2. Listen to reply box focus
3. Adapt panel content based on user action
4. Implement panel expansion (360px → 400px) for Active state
5. Add keyboard shortcuts for AI commands

**Estimated Time:** 1 week

**Impact:** High — Makes panel feel intelligent

---

### Phase 3 — Workspace Morphing

**Goal:** Panel adapts to Contacts, Rules, Settings

**Tasks:**
1. Create ContactsContextPanel variant
2. Create RulesContextPanel variant
3. Implement context-aware content switching
4. Add workspace-specific visual language

**Estimated Time:** 2 weeks

**Impact:** Medium — Scales to all workspaces

---

### Phase 4 — Density Intelligence

**Goal:** Responsive panel behavior

**Tasks:**
1. Detect viewport width
2. Collapse panel on small screens (< 1280px)
3. Widen panel on ultra-wide (> 1920px)
4. Add hover-to-peek on collapsed state

**Estimated Time:** 3 days

**Impact:** Medium — Better UX on different screen sizes

---

### Phase 5 — RBAC Governance

**Goal:** Role-based panel content

**Tasks:**
1. Integrate with RBAC system
2. Filter tabs/content by user permissions
3. Add audit logging for panel interactions

**Estimated Time:** 1 week

**Impact:** Low (for now) — Enterprise compliance

---

## 🏆 Success Metrics

**When Panel Intelligence is complete, users should:**

✅ **Never feel overwhelmed** — One panel, multiple contexts  
✅ **Trust the panel** — Shows relevant info without asking  
✅ **Use keyboard shortcuts** — G+P to toggle panel, ⌘+Tab to switch tabs  
✅ **Experience "magic moments"** — Panel anticipates needs (Assistive state)  
✅ **Work faster** — AI suggestions reduce 3-click tasks to 1-click  

**Quantitative Metrics:**

| Metric | Target |
|--------|--------|
| **Panel toggle speed** | < 50ms |
| **Tab switch speed** | < 30ms |
| **Assistive state trigger** | < 100ms after user action |
| **Panel collapse memory** | 100% persistence |

---

## 📚 Related Documentation

- [Workspace Architecture](/docs/WORKSPACE_ARCHITECTURE.md) — 3-layer spatial model
- [Navigation Intelligence](/docs/NAVIGATION_INTELLIGENCE.md) — Keyboard shortcuts
- [Workspace Grid Reference](/docs/WORKSPACE_GRID_REFERENCE.md) — Panel dimensions
- [Implementation Status](/docs/IMPLEMENTATION_STATUS.md) — Feature completion

---

## 🔥 Next Level: Predictive Panel Intelligence

**Future evolution (Phase 6+):**

### Machine Learning Panel Behavior

**Orbit learns:**
- Which tabs users prefer per conversation type
- When users collapse panel (time of day, conversation load)
- Which AI suggestions users accept/reject

**Panel adapts:**
- Auto-switches to preferred tab
- Collapses during high-load periods
- Improves suggestion relevance

**Example:**

```
User always checks "Customer" tab first when message 
is from enterprise accounts → Panel auto-switches to 
Customer tab for enterprise messages.
```

**This is the ultimate panel intelligence.**

---

**Status:** Framework Complete, Implementation in Progress  
**Last Updated:** February 22, 2026  
**Next:** Implement Phase 1 (Tab System)

---

## ✅ Key Takeaways

1. **Three panel types** — System (rail), Workspace (sidebars), Context (AI panel)
2. **Three intelligence states** — Passive, Assistive, Active
3. **Three behavior rules** — Never compete, morph not multiply, cursor gravity
4. **Context-aware** — Panel content changes by workspace mode
5. **Enterprise psychology** — 120ms motion, no playfulness, predictable

**This is what makes Orbit elite.**
