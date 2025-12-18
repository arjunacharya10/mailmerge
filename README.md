# Mail Merge Tool

A Next.js application for sending personalized bulk emails via Gmail. Upload a CSV file with recipient data, compose templates with personalization variables, and send or schedule your email campaigns.

## Features

- **Gmail OAuth Integration** - Securely connect to your Gmail account
- **CSV Upload** - Import recipients from any CSV file
- **Template Personalization** - Use `{{variable}}` syntax for dynamic content
- **Email Preview** - Preview personalized emails before sending
- **Bulk Send** - Send to multiple recipients with rate limiting
- **Schedule Send** - Create drafts for later sending

## Setup

### 1. Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the **Gmail API**:
   - Navigate to "APIs & Services" > "Library"
   - Search for "Gmail API" and enable it

### 2. Configure OAuth Consent Screen

1. Go to "APIs & Services" > "OAuth consent screen"
2. Select "External" user type (or "Internal" for Google Workspace)
3. Fill in the required fields:
   - App name: "Mail Merge Tool"
   - User support email: Your email
   - Developer contact: Your email
4. Add scopes:
   - `openid`
   - `email`
   - `profile`
   - `https://www.googleapis.com/auth/gmail.send`
5. Add your test email to the test users list (required for external apps in testing mode)

### 3. Create OAuth Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth client ID"
3. Select "Web application"
4. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (for development)
   - `https://yourdomain.com/api/auth/callback/google` (for production)
5. Copy the Client ID and Client Secret

### 4. Configure Environment Variables

Create a `.env.local` file in the project root:

```bash
# Google OAuth Credentials
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here

# NextAuth Configuration
AUTH_SECRET=your_random_secret_here
NEXTAUTH_URL=http://localhost:3000
```

Generate `AUTH_SECRET` with:
```bash
openssl rand -base64 32
```

### 5. Install Dependencies & Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to use the application.

## Usage

### 1. Sign In
Click "Sign in with Google" and authorize the application to send emails on your behalf.

### 2. Upload CSV
Upload a CSV file containing your recipients. The CSV should have:
- An email column (auto-detected)
- Any additional columns for personalization (name, company, etc.)

Example CSV:
```csv
email,name,company
john@example.com,John Smith,Acme Corp
jane@example.com,Jane Doe,Tech Inc
```

### 3. Compose Template
Write your email using `{{variable}}` placeholders that match your CSV columns:

**Subject:** `Hello {{name}}, exciting news from us!`

**Body:**
```
Hi {{name}},

I wanted to reach out regarding {{company}}...

Best regards,
Your Name
```

### 4. Preview & Send
- Select different recipients to preview personalized emails
- Choose "Send Now" or "Schedule Send"
- Monitor progress in real-time

## Important Notes

### Gmail Sending Limits
- **Free Gmail accounts**: ~100 emails/day
- **Google Workspace**: Higher limits based on your plan

### Scheduled Emails
Scheduled emails are saved as drafts in your Gmail. The Gmail API doesn't support native schedule send like the web interface, so for true scheduling, you can:
1. Use "Send Now" at your desired time
2. Use the drafts created and schedule them via Gmail web interface

### Security
- OAuth tokens are stored in your session only
- No email data is stored on any server
- The app only requests permission to send emails

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **Auth**: Auth.js (NextAuth v5) with Google Provider
- **Styling**: Tailwind CSS
- **Email**: Gmail API via googleapis
- **CSV**: Papa Parse

## Development

```bash
# Development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

## License

MIT
