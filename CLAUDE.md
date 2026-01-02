# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A React-based Telegram community web portal with Supabase backend for managing rooms, posts, and banners. Features a three-column layout with authentication, board management, and an admin panel.

## Development Commands

### Essential Commands
```bash
npm run dev        # Start Vite dev server (default port 5173)
npm run build      # Production build
npm run preview    # Preview production build
npm run lint       # Run ESLint
```

### Environment Setup
Requires `.env` file with Supabase credentials:
```
VITE_SUPABASE_URL=<your-supabase-url>
VITE_SUPABASE_ANON_KEY=<your-supabase-anon-key>
```

## Architecture

### Data Layer Architecture

**Dual Storage System:**
- **Supabase (Remote)**: Posts, site configuration (banners, rooms), production data
- **IndexedDB (Local)**: User authentication data, client-side session persistence

**Key Pattern**: The app uses IndexedDB for user storage (`src/data/userStorage.js`) and Supabase for all content (posts, banners, rooms via `src/api/`). This hybrid approach keeps user data local while content is centralized.

### API Structure (`src/api/`)

All Supabase operations organized by domain:
- `posts.js`: CRUD for posts, pagination, pinning, view tracking
- `users.js`: User management operations
- `siteConfig.js`: Manages three config types in single `site_config` table:
  - `type: 'banner'` - Left sidebar banners
  - `type: 'room'` - Telegram room grid items
  - `type: 'right_banner'` - Right sidebar ads

**Important**: `site_config` table uses `type` field to differentiate between banners/rooms/right_banners. Each has converter functions (`convertBannersFromDB`, `convertRoomsFromDB`, etc.) to transform DB schema to frontend format.

### Authentication Flow

1. User registers/logs in via `AuthContext` (`src/context/AuthContext.jsx`)
2. Credentials hashed and stored in IndexedDB via `userStorage`
3. Session persisted to `localStorage` with key `currentUser`
4. `AuthModal` component handles all auth UI states: login, signup, findId, findPassword
5. Modal controlled globally via `authModalOpen` state in AuthContext

### Component Architecture

**Layout Components:**
- `Header`: Navigation, auth triggers
- `Sidebar`: Left column (login box, banners)
- `RightSidebar`: Right column (ads/banners)
- `Footer`: Site footer

**Content Components:**
- `Board`: Reusable post list with pagination, search, pinning
- `RoomGrid`: Telegram room grid display with pin-to-top functionality
- `MainBanner`: Scrolling banner carousel

**Pages:**
- `Home`: Main landing with room grid
- `FreeBoardPage`: Free discussion board
- `ScammerBoardPage`: Scammer reports board
- `WritePage`: Post creation/editing (category-aware)
- `AdminPage`: Admin panel at `/isc8806` route (banners, rooms, posts management)

### State Management

- **Global Auth State**: React Context (`AuthContext`)
- **No Redux/Zustand**: Uses React hooks and context for state
- **Local Persistence**: `localStorage` for session, IndexedDB for user data

### Routing Structure

```
/                    → Home (room grid)
/free                → Free board
/free/write          → Write post (category: free)
/scammer             → Scammer board
/scammer/write       → Write post (category: scammer)
/isc8806             → Admin panel (protected route)
```

## Database Schema (Supabase)

### posts table
- Standard post fields: id, title, content, author, category, views, created_at
- `pinned`: Boolean for sticky posts
- `category`: 'free' | 'scammer'

### site_config table (multi-purpose)
- Unified table with `type` discriminator
- Fields: id, type, name, description, image_url, link, display_order, members, is_pinned, created_at
- Types: 'banner', 'room', 'right_banner'

### Custom RPC
- `increment_views(post_id)`: Atomic view counter increment

## Code Patterns

### Supabase Query Pattern
```javascript
const { data, error } = await supabase
  .from('table')
  .select('*')
  .eq('field', value)
  .order('created_at', { ascending: false });

if (error) throw error;
return data;
```

### Data Conversion Pattern
API layer returns Supabase schema, converter functions transform to frontend format:
```javascript
// DB: { name, description, image_url }
// Frontend: { title, text, image }
convertBannersFromDB(dbData)
```

### Error Handling
- Try/catch in all async functions
- Console.error for logging
- Throw errors to be caught by UI components
- Non-critical operations (like view increments) fail silently

## Styling

- Inline styles using JavaScript objects (no CSS modules/styled-components)
- Global styles in `src/index.css` and `src/App.css`
- Component-specific styles defined in `styles` constants within components

## Important Notes

- **Admin Route**: `/isc8806` is the admin panel path
- **Password Security**: Client-side hashing is intentionally simple (see `userStorage.hashPassword` comment) - not production-grade
- **Session Management**: Uses both localStorage (session token) and IndexedDB (user records)
- **Telegram ID Validation**: Must start with `@` character
- **Banner Management**: Drag-and-drop reordering updates `display_order` field
