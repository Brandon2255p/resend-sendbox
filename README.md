# ResendMail

A modern, mobile-first email composer built with Next.js that interfaces with the [Resend](https://resend.com) API to send beautiful emails.

## Features

- 📧 **Email Composer** - Write and send emails with a clean, intuitive interface
- 👥 **Contacts Management** - Manage your email contacts list
- 📝 **Templates** - Save and reuse email templates
- ⚙️ **API Key Management** - Securely store your Resend API key
- 📱 **Responsive Design** - Works great on desktop and mobile devices
- 🎨 **Modern UI** - Beautiful dark theme with smooth animations

## Getting Started

### Prerequisites

- [Bun](https://bun.sh) - Fast JavaScript runtime and package manager
- A [Resend](https://resend.com) API key

### Installation

```bash
# Install dependencies
bun install

# Start development server
bun dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Configuration

1. On first launch, you'll be prompted to enter your Resend API key
2. Get your API key from [Resend Dashboard](https://resend.com/api-keys)
3. The API key is stored securely in your browser's local storage

## Project Structure

```
src/
├── app/
│   ├── api/resend/route.ts   # Proxy API route for Resend
│   ├── layout.tsx             # Root layout
│   ├── page.tsx              # Main application page
│   └── globals.css            # Global styles
├── components/
│   ├── ApiKeyModal.tsx        # API key input modal
│   ├── ContactsList.tsx       # Contacts management
│   ├── EmailComposer.tsx      # Email composition form
│   ├── Navigation.tsx         # App navigation
│   ├── RichTextEditor.tsx     # Rich text editing
│   ├── Settings.tsx           # App settings
│   ├── TemplatesList.tsx      # Email templates
│   └── Toast.tsx              # Toast notifications
└── lib/
    ├── resend.ts              # Resend API utilities
    └── storage.ts             # Local storage utilities
```

## API Endpoints

### POST /api/resend

Proxy endpoint for Resend API calls.

**Request Body:**
```json
{
  "apiKey": "re_xxxxxxxx",
  "endpoint": "/emails",
  "method": "POST",
  "body": {
    "from": "onboarding@resend.dev",
    "to": "user@example.com",
    "subject": "Hello World",
    "html": "<p>Hello world</p>"
  }
}
```

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **UI Library**: React 19
- **Styling**: Tailwind CSS 4
- **Icons**: Lucide React
- **Runtime**: Bun
- **Language**: TypeScript

## Scripts

| Command | Description |
|---------|-------------|
| `bun dev` | Start development server |
| `bun build` | Build for production |
| `bun start` | Start production server |
| `bun lint` | Run ESLint |
| `bun typecheck` | Run TypeScript type checking |

## Deployment

This project is configured for deployment on [Vercel](https://vercel.com):

```bash
# Build and deploy
vercel --prod
```

## License

[License](LICENSE)
