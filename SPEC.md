# ResendMail - Email Composer Web App

## Project Overview

**Project Name**: ResendMail
**Project Type**: Mobile-first web application
**Core Functionality**: A send-only email client that uses the Resend API for sending formatted emails, managing contacts, and using email templates. All operations happen client-side for security.
**Target Users**: Professionals and developers who need a simple, secure way to send formatted emails using Resend.

---

## UI/UX Specification

### Layout Structure

**Mobile-First Design**
- Primary experience: Mobile (< 768px)
- Tablet: 768px - 1024px
- Desktop: > 1024px

**Page Sections**
1. **Header** - App title, settings toggle, send button
2. **Sidebar** (desktop) / **Bottom Sheet** (mobile) - Navigation between Compose, Contacts, Templates
3. **Main Content Area** - Dynamic based on selected view
4. **Floating Action Button** - Quick compose on mobile

**Navigation Structure**
- Tab-based navigation at bottom (mobile) / left sidebar (desktop)
- Tabs: Compose, Contacts, Templates, Settings

### Visual Design

**Color Palette**
- Background Primary: `#0A0A0B` (near black)
- Background Secondary: `#141416` (dark gray)
- Background Tertiary: `#1C1C1F` (card background)
- Accent Primary: `#E11D48` (rose-600, warm red)
- Accent Secondary: `#FB7185` (rose-400)
- Accent Gradient: `linear-gradient(135deg, #E11D48 0%, #F43F5E 100%)`
- Text Primary: `#FAFAFA` (white)
- Text Secondary: `#A1A1AA` (zinc-400)
- Text Muted: `#71717A` (zinc-500)
- Border: `#27272A` (zinc-800)
- Success: `#22C55E` (green-500)
- Error: `#EF4444` (red-500)
- Warning: `#F59E0B` (amber-500)

**Typography**
- Font Family: `"Outfit", sans-serif` (Google Fonts)
- Headings: 
  - H1: 32px / 700 weight
  - H2: 24px / 600 weight
  - H3: 18px / 600 weight
- Body: 14px / 400 weight
- Small: 12px / 400 weight
- Line Height: 1.5

**Spacing System**
- Base unit: 4px
- Spacing scale: 4, 8, 12, 16, 24, 32, 48, 64
- Container padding: 16px (mobile), 24px (tablet), 32px (desktop)
- Card padding: 16px
- Gap between elements: 12px

**Visual Effects**
- Border radius: 8px (small), 12px (medium), 16px (large), 24px (xl)
- Box shadow: `0 4px 24px rgba(0, 0, 0, 0.4)`
- Backdrop blur for modals: `blur(16px)`
- Subtle glow on accent elements: `0 0 20px rgba(225, 29, 72, 0.3)`
- Smooth transitions: 200ms ease-out

### Components

**1. API Key Input Modal**
- Appears on first load or when API key is invalid
- Input field with show/hide toggle
- Save button with loading state
- Help link to Resend dashboard

**2. Email Composer**
- Subject input (large, prominent)
- From email display (read-only, from API key)
- To field with autocomplete from contacts
- CC/BCC toggle
- Rich text editor toolbar:
  - Bold, Italic, Underline
  - Bullet list, Numbered list
  - Link insertion
  - Heading styles (H1, H2, H3)
- Content area (editable div with formatting)
- Attachment area:
  - Drag & drop zone
  - File list with remove option
  - Max 10MB per file
- Send button (prominent, accent colored)

**3. Contact List**
- Search/filter input
- Contact cards:
  - Avatar (initials)
  - Name
  - Email
  - Add to compose action
- Empty state with helpful message
- Loading skeleton

**4. Template List**
- Template cards:
  - Template name
  - Subject preview
  - Preview button
  - Use template button
- Empty state
- Loading skeleton

**5. Settings Panel**
- API Key management (show/update)
- Default "From" email (from API response)
- Clear all data option
- App info

**6. Navigation**
- Mobile: Fixed bottom tab bar
- Desktop: Fixed left sidebar
- Active state: Accent color + icon fill

### Animations

- Page transitions: Fade + slide (150ms)
- Button press: Scale down 0.98 (100ms)
- Card hover: Subtle lift + border glow
- Modal: Fade in + scale from 0.95 (200ms)
- Toast notifications: Slide in from top
- Loading: Pulse animation on skeleton
- Send success: Checkmark animation

---

## Functionality Specification

### Core Features

**1. API Key Management**
- Store API key in localStorage (never sent to any server)
- Validate API key on entry
- Fetch account info to get "from" email
- Allow updating key anytime

**2. Email Composition**
- Rich text editor with formatting
- Subject line
- To, CC, BCC fields with email validation
- Autocomplete from saved contacts
- Attachments (max 10MB each, multiple files)
- HTML content from rich editor

**3. Send Email**
- Use Resend API `/emails` endpoint
- Handle attachments via base64
- Show sending progress
- Success/error feedback
- Clear form after send

**4. Contacts Management**
- Fetch contacts from Resend Audiences API
- Display in searchable list
- Quick-add to composer
- Cache contacts in localStorage (refresh on demand)

**5. Templates Management**
- Fetch templates from Resend Templates API
- Display template list with previews
- Load template into composer
- Show template subject and HTML content

### User Interactions and Flows

**First-time User Flow**
1. App loads → API key modal appears
2. User enters Resend API key
3. App validates key and fetches account info
4. Main composer view loads
5. User can now send emails

**Compose Email Flow**
1. User taps compose (or app loads)
2. Enter subject, recipients, content
3. Optionally add attachments
4. Tap send
5. See success/error feedback

**Use Contact Flow**
1. Navigate to Contacts tab
2. Search or scroll to find contact
3. Tap contact → opens composer with email pre-filled

**Use Template Flow**
1. Navigate to Templates tab
2. Browse available templates
3. Tap "Use Template" → opens composer with template content

### Data Handling

**localStorage**
- `resend_api_key`: Encrypted API key
- `resend_contacts`: Cached contacts array
- `resend_templates`: Cached templates array
- `resend_account`: Account info (from email, etc.)

**Resend API Endpoints Used**
- `POST /emails` - Send email
- `GET /contacts` - List contacts
- `GET /templates` - List templates
- `GET /me` - Get account info

### Edge Cases

- Invalid API key: Show error, prompt re-entry
- Network error: Show retry option
- Large attachment: Show error, suggest smaller file
- Empty required fields: Highlight and prevent send
- Template load failure: Show error toast
- Contact fetch failure: Show cached data if available

---

## Acceptance Criteria

### Visual Checkpoints
- [ ] Dark theme with rose accent colors applied consistently
- [ ] Mobile layout shows bottom navigation, desktop shows sidebar
- [ ] All interactive elements have hover/focus states
- [ ] Rich text editor toolbar is functional and styled
- [ ] Loading states show skeleton animations
- [ ] Modals have backdrop blur effect
- [ ] Toast notifications appear for success/error

### Functional Checkpoints
- [ ] API key can be saved to localStorage
- [ ] API key persists across page reloads
- [ ] Emails can be composed with rich text formatting
- [ ] Attachments can be added (up to 10MB)
- [ ] Contacts can be fetched from Resend API
- [ ] Templates can be fetched from Resend API
- [ ] Email can be sent via Resend API
- [ ] Contact autocomplete works in To field
- [ ] Template content loads into composer
- [ ] Error states are handled gracefully

### Performance
- [ ] Initial load < 3 seconds
- [ ] API calls show loading states
- [ ] Smooth animations (60fps)
- [ ] No layout shift during loading

---

## Technical Implementation

### Dependencies
- React 19
- Next.js 16 (App Router)
- Tailwind CSS 4
- Lucide React (icons)
- TipTap or custom rich text editor

### API Calls (Client-Side)
All Resend API calls made directly from browser using fetch():
```
POST https://api.resend.com/emails
GET https://api.resend.com/contacts
GET https://api.resend.com/templates
GET https://api.resend.com/me
```

### Security Considerations
- API key never leaves browser
- No backend server
- localStorage only (not cookies)
- Input sanitization for rich text

---

*Specification Version: 1.0*
*Last Updated: 2026-03-10*
