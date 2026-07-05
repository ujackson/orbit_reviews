# Orbit Keyboard Shortcuts

## Global Shortcuts

| Shortcut | Action |
|----------|--------|
| `⌘K` / `Ctrl+K` | Open Command Palette |

## Inbox Navigation

| Shortcut | Action |
|----------|--------|
| `J` | Next conversation |
| `K` | Previous conversation |
| `Enter` | Open selected conversation |

## Conversation Actions

| Shortcut | Action |
|----------|--------|
| `E` | Assign to me |
| `C` | Close/Archive conversation |
| `R` | Mark as pending |
| `N` | Add internal note (focus) |

## Command Palette

Once opened with `⌘K`:

| Shortcut | Action |
|----------|--------|
| `↑↓` | Navigate commands |
| `Enter` | Execute selected command |
| `Esc` | Close palette |

## Available Commands

- **Navigation**
  - Go to Inbox
  - Go to Assigned to Me
  - Go to Contacts
  
- **Actions**
  - Assign to Me (E)
  - Close Conversation (C)
  - Archive Conversation

- **Settings**
  - Switch to Dark/Light Mode

## Architecture Highlights

### 4-Region Layout
- **Rail** (72px): Navigation sidebar
- **Conversations** (320px): Message list
- **Thread** (flex): Message detail view
- **Context** (360px): AI insights panel

### State Management
- **Server State**: TanStack Query for API data
- **UI State**: Zustand for local state (theme, selected items, panels)
- **Routing**: React Router with view-based navigation

### AI Features
- Real-time message summaries
- Intent & priority detection
- Suggested replies with feedback
- Entity extraction (email, phone, company)
- Next best action recommendations
