# Orbit Enterprise Component Taxonomy

## 🎯 Four-Layer Architecture

Orbit follows a strict 4-layer component model to prevent prop drilling, visual drift, and performance regressions.

```
Feature → Pattern → Primitive → Design Tokens
  │         │          │             │
  └─────────┴──────────┴─────────────┘
     Never skip layers
```

---

## 🧱 Layer 1: Primitives

**Location:** `src/shared/ui/primitives/`

Design system atoms with styling, accessibility, and visual states only.

### Must Contain:
✅ Styling
✅ Accessibility (ARIA labels, focus states)
✅ Visual states (default, hover, active, focus, disabled)

### Must NOT Contain:
❌ Business logic
❌ Data fetching
❌ Feature-specific knowledge

### Available Primitives:
- `Avatar` - User/contact avatar with accent colors
- `Button` - Primary action button with variants (primary, secondary, outline, ghost, danger)
- `IconButton` - Icon-only action button
- `Chip` - Tag/label component with semantic variants
- `CardSurface` - Elevated container surface
- `InputField` - Text input with validation states
- `SkeletonLoader` - Loading placeholder
- `AiBadge` - AI indicator badge

### Usage Example:
```tsx
import { Button, Chip, Avatar } from '@/shared/ui/primitives';

<Button variant="primary" size="md" onClick={handleAction}>
  Save Changes
</Button>
```

---

## 🧩 Layer 2: Patterns

**Location:** `src/features/[feature]/patterns/`

Reusable UI structures that combine primitives. Know about layout but NOT data sources.

### Must Contain:
✅ Layout composition
✅ Primitive assembly
✅ Visual grouping
✅ Spacing/rhythm
✅ All lifecycle states (default, hover, selected, loading, empty, error, focused)

### Must NOT Contain:
❌ API calls
❌ Data fetching
❌ Server state management

### Available Patterns:

#### Inbox Patterns (`src/features/inbox/patterns/`)
- `ConversationRow` - List item for conversation display
- `ConversationRowSkeleton` - Loading state
- `ConversationRowEmpty` - Empty state
- `MessageCard` - Message display container
- `MessageCardSkeleton` - Loading state
- `MessageCardError` - Error state

#### AI Patterns (`src/features/ai/patterns/`)
- `AIInsightBlock` - AI insight container with variants (summary, suggestion, insight)
- `AIInsightBlockEmpty` - Empty state

### Usage Example:
```tsx
import { ConversationRow } from '@/features/inbox/patterns';

<ConversationRow
  senderName="John Doe"
  subject="Meeting Request"
  preview="Can we schedule a call?"
  timestamp={new Date()}
  channelColor="#0284C7"
  channelLabel="Email"
  isSelected={false}
  onClick={() => selectConversation(id)}
/>
```

---

## 🧭 Layer 3: Layout Components

**Location:** `src/app/layout/` or `src/features/[feature]/components/`

Structural containers that manage panel arrangement, focus mode, and workspace shell.

### Responsibilities:
✅ Panel visibility
✅ Keyboard scope
✅ Scroll regions
✅ Spatial organization

### Must NOT Contain:
❌ Feature logic
❌ Data transformation
❌ Business rules

### Available Layouts:
- `WorkspaceRail` - Left navigation rail (72px)
- `ConversationsPane` - Conversation list panel (320px)
- `ThreadPane` - Message thread panel (flex)
- `AIContextPanel` - AI context panel (360px)

### Usage Example:
```tsx
import { ConversationsPane } from '@/features/inbox/components/ConversationsPane';

<ConversationsPane
  conversations={conversations}
  isLoading={isLoading}
  searchQuery={searchQuery}
  onSearchChange={setSearchQuery}
/>
```

---

## ⭐ Layer 4: Feature Containers

**Location:** `src/features/[feature]/containers/`

Connect patterns with hooks and API. **This is the ONLY place where data enters UI.**

### Responsibilities:
✅ Call hooks
✅ Pass data into patterns
✅ Handle user actions
✅ Server state management

### Must NOT Contain:
❌ Base styling
❌ Layout rules
❌ Primitive definitions

### Available Containers:

#### Inbox Containers
- `ConversationListContainer` - Connects conversations data with ConversationRow pattern
- `MessageTimelineContainer` - Connects message data with MessageCard pattern

#### AI Containers
- `AISummaryContainer` - Connects AI summary hook with AIInsightBlock
- `SuggestedReplyContainer` - Connects suggested reply hook with AIInsightBlock + editing logic

### Usage Example:
```tsx
import { ConversationListContainer } from '@/features/inbox/containers/ConversationListContainer';

export const InboxView = () => {
  const { conversations, isLoading } = useConversations();
  
  return (
    <ConversationListContainer
      conversations={conversations}
      isLoading={isLoading}
    />
  );
};
```

---

## 🧠 AI-Specific Components

Orbit has a special AI component layer that sits between Pattern and Feature.

### AI Visual Language Rules:
✅ Visually consistent (purple tint, AI badges)
✅ Editable inline
✅ Reversible actions
✅ Subtle emphasis (no strong colors)
✅ Supportive, not authoritative

### AI-Specific Primitives:
- `AiBadge` - AI indicator with icon

### AI-Specific Patterns:
- `AIInsightBlock` - Base AI content container with editing states

### AI-Specific Containers:
- `AISummaryContainer` - AI summary with loading/error states
- `SuggestedReplyContainer` - AI suggestion with inline editing

---

## 📊 State Ownership Rules

| Layer     | Owns State? | Type            |
|-----------|-------------|-----------------|
| Primitive | ❌ No       | -               |
| Pattern   | ❌ No       | -               |
| Layout    | ⚠️ UI only  | Panel visibility, focus |
| Feature   | ✅ Yes      | Server data, interactions |

### State Management:
- **Server State:** TanStack Query (in hooks)
- **UI State:** Zustand (in stores)
- **Local State:** React useState (in containers)

---

## 🔄 Dependency Direction (FAANG Rule)

### ✅ Allowed:
```
Feature → Pattern → Primitive → Tokens
Layout → Pattern → Primitive → Tokens
```

### ❌ Forbidden:
```
Primitive → Feature  ❌
Pattern → Feature    ❌
Primitive → Pattern  ❌
```

---

## 📁 Folder Structure

```
src/
├── shared/
│   ├── ui/
│   │   └── primitives/        ← Layer 1
│   └── tokens/                ← Design tokens
│
├── features/
│   ├── inbox/
│   │   ├── patterns/          ← Layer 2
│   │   ├── containers/        ← Layer 4
│   │   ├── components/        ← Layer 3 (feature-specific layouts)
│   │   ├── hooks/
│   │   ├── store/
│   │   └── types/
│   │
│   └── ai/
│       ├── patterns/          ← Layer 2 (AI-specific)
│       ├── containers/        ← Layer 4
│       ├── components/        ← Layer 3
│       ├── hooks/
│       └── types/
│
└── app/
    └── layout/                ← Layer 3 (global layouts)
```

---

## ✅ Component Creation Checklist

Before creating a new component, ask:

1. **Can this be a primitive?**
   - [ ] Does it have NO business logic?
   - [ ] Does it have NO feature knowledge?
   - [ ] Is it reusable across features?
   
2. **Can this be a pattern?**
   - [ ] Does it combine multiple primitives?
   - [ ] Does it define layout structure?
   - [ ] Does it have NO data fetching?
   
3. **Is this a layout component?**
   - [ ] Does it manage panel arrangement?
   - [ ] Does it orchestrate scroll regions?
   - [ ] Does it have NO feature logic?
   
4. **Is this a feature container?**
   - [ ] Does it connect data with patterns?
   - [ ] Does it call hooks?
   - [ ] Does it handle user actions?

---

## 🎨 Lifecycle States

Every Pattern must define these states:

- **Default** - Normal resting state
- **Hover** - Mouse over interaction
- **Selected** - Active/chosen state
- **Loading** - Data fetching state (Skeleton variant)
- **Empty** - No data state (Empty variant)
- **Error** - Failed state (Error variant)
- **Focused** - Keyboard navigation state

### Example:
```tsx
// Pattern with all states
export const ConversationRow = ({ isSelected, isFocused, onClick }) => { ... }
export const ConversationRowSkeleton = () => { ... }  // Loading
export const ConversationRowEmpty = ({ message }) => { ... }  // Empty
```

---

## 🚀 Benefits

Following this taxonomy ensures:

✅ **Predictable** - Clear component boundaries
✅ **Scalable** - Easy to add new features
✅ **Composable** - Reusable building blocks
✅ **Maintainable** - No prop drilling
✅ **Performant** - Optimized re-renders
✅ **Enterprise-grade** - FAANG-level architecture

---

## 🔒 Governance

### Before Merging:
- [ ] Component exists in correct layer
- [ ] No layer-skipping
- [ ] Dependency direction is correct
- [ ] All lifecycle states defined
- [ ] No prop drilling
- [ ] No duplicate patterns

### Code Review Checklist:
- [ ] Primitives contain NO business logic
- [ ] Patterns contain NO data fetching
- [ ] Containers handle ALL data entry
- [ ] Layouts manage ONLY structure
- [ ] Design tokens used throughout
- [ ] TypeScript types exported

---

**This taxonomy is the foundation of Orbit's enterprise architecture. Enforce it strictly.**
