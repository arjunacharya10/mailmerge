# Mail Merge Tool - Because I hate having to pay for this

A Next.js application for sending personalized bulk emails via Gmail. Upload a CSV file with recipient data, compose templates with personalization variables, and send your email campaigns.

## Features

- **Gmail OAuth Integration** - Securely connect to your Gmail account
- **CSV Upload** - Import recipients from any CSV file with any column names
- **Template Personalization** - Use `{{variable}}` syntax for dynamic content (supports spaces like `{{First Name}}`)
- **Email Preview** - Preview personalized emails with navigation through all recipients
- **Bulk Send** - Send to multiple recipients with rate limiting
- **Save as Drafts** - Save emails as Gmail drafts for later scheduling via Gmail

## Setup

### 1. Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" → "New Project"
3. Name it (e.g., "Mail Merge Tool") and click "Create"
4. Enable the **Gmail API**:
   - Navigate to "APIs & Services" > "Library"
   - Search for "Gmail API" and click on it
   - Click "Enable"

### 2. Configure OAuth Consent Screen

1. Go to "APIs & Services" > "OAuth consent screen"
2. Select **"External"** user type (or "Internal" for Google Workspace)
3. Click "Create"
4. Fill in the required fields:
   - **App name**: Mail Merge Tool
   - **User support email**: Your email
   - **Developer contact**: Your email
5. Click "Save and Continue"
6. On the "Scopes" page, click "Add or Remove Scopes" and add:
   - `openid`
   - `email`
   - `profile`
   - `https://www.googleapis.com/auth/gmail.send`
   - `https://www.googleapis.com/auth/gmail.compose`
7. Click "Save and Continue"
8. On "Test users", click "Add Users" and add your Gmail address
9. Click "Save and Continue"

> **Note**: While in "Testing" mode, only users added to the test users list can use the app.

### 3. Create OAuth Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth client ID"
3. Select **"Web application"**
4. Name it (e.g., "Mail Merge Web Client")
5. Under **"Authorized JavaScript origins"**, add:
   ```
   http://localhost:3000
   ```
6. Under **"Authorized redirect URIs"**, add:
   ```
   http://localhost:3000/api/auth/callback/google
   ```
7. Click "Create"
8. **Copy the Client ID and Client Secret** (you'll need these next)

#### Redirect URI Format

The callback URL follows this pattern:
```
{YOUR_APP_URL}/api/auth/callback/google
```

Examples:
| Environment | Redirect URI |
|-------------|--------------|
| Local (port 3000) | `http://localhost:3000/api/auth/callback/google` |
| Production | `https://yourdomain.com/api/auth/callback/google` |

> **Important**: The redirect URI must match EXACTLY, including the protocol (http/https), port, and path.

### 4. Configure Environment Variables

Create a `.env.local` file in the project root:

```bash
# Google OAuth Credentials (from step 3)
GOOGLE_CLIENT_ID=your_client_id_here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_client_secret_here

# NextAuth Configuration
AUTH_SECRET=your_random_secret_here
NEXTAUTH_URL=http://localhost:3000
```

#### Generate AUTH_SECRET

Run this command to generate a secure secret:
```bash
openssl rand -base64 32
```

Or use any random string generator to create a 32+ character string.

### 5. Install Dependencies & Run

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) (or the port shown in terminal) to use the application.

## Usage

### 1. Sign In
Click "Sign in with Google" and authorize the application. You'll be asked to grant permission to:
- Send emails on your behalf
- Create and manage drafts

### 2. Upload CSV
Upload a CSV file containing your recipients. The CSV should have:
- An email column (auto-detected, or select manually)
- Any additional columns for personalization

**Example CSV:**
```csv
Email ID,First Name,Last Name,Company,Role
john@example.com,John,Smith,Acme Corp,CEO
jane@example.com,Jane,Doe,Tech Inc,CTO
```

Column names can include spaces and will be available as template variables.

### 3. Compose Template
Write your email using `{{variable}}` placeholders that match your CSV columns:

**Subject:** 
```
Hello {{First Name}}, exciting news for {{Company}}!
```

**Body:**
```
Hi {{First Name}},

I wanted to reach out regarding your role as {{Role}} at {{Company}}...

Best regards,
Your Name
```

**Tips:**
- Click on any "Available" variable tag to insert it at your cursor position
- Variable names must match your CSV column names exactly
- Preview different recipients using the ← → navigation buttons

### 4. Send or Save as Drafts

**Send Now:**
- Sends all personalized emails immediately
- Shows real-time progress

**Save as Drafts:**
- Saves all emails to your Gmail Drafts folder
- To schedule them:
  1. Open Gmail → Drafts
  2. Open each draft
  3. Click the arrow next to "Send"
  4. Select "Schedule send" and pick your time

## Troubleshooting

### "redirect_uri_mismatch" Error
The redirect URI in Google Cloud Console doesn't match your app URL.

**Fix:**
1. Check which port your app is running on (shown in terminal)
2. Go to Google Cloud Console → APIs & Services → Credentials
3. Edit your OAuth client
4. Add the correct redirect URI: `http://localhost:PORT/api/auth/callback/google`
5. Wait 1-2 minutes for changes to propagate

### "Invalid Credentials" Error
Your OAuth token has expired.

**Fix:**
- Sign out and sign back in to get a fresh token

### "Access Denied" or "App Not Verified"
You're not added as a test user, or the consent screen isn't configured.

**Fix:**
1. Go to Google Cloud Console → OAuth consent screen
2. Under "Test users", add your Gmail address
3. Make sure the Gmail API scopes are added

### Emails Not Appearing in Drafts
Make sure you have the `gmail.compose` scope enabled.

**Fix:**
1. Sign out from the app
2. Go to [Google Account Permissions](https://myaccount.google.com/permissions)
3. Remove "Mail Merge Tool" from the list
4. Sign back into the app (you'll see a new consent screen with draft permissions)

## Important Notes

### Gmail Sending Limits
- **Free Gmail accounts**: ~100 emails/day
- **Google Workspace**: ~2,000 emails/day (varies by plan)

Exceeding these limits will result in temporary blocks. The app adds a 500ms delay between emails to help avoid rate limiting.

### Security
- OAuth tokens are stored in your browser session only
- Tokens auto-refresh when they expire
- No email content or recipient data is stored on any server
- The app only requests necessary Gmail permissions

### App Verification
While your app is in "Testing" mode in Google Cloud Console:
- Only test users can use it
- Users see an "unverified app" warning (click "Advanced" → "Go to Mail Merge Tool")

To remove the warning, you'd need to submit for Google verification (not necessary for personal use).

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

## Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `GOOGLE_CLIENT_ID` | OAuth Client ID from Google Cloud | `123...apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | OAuth Client Secret | `GOCSPX-...` |
| `AUTH_SECRET` | Random string for session encryption | `abc123...` (32+ chars) |
| `NEXTAUTH_URL` | Your app's base URL | `http://localhost:3000` |

## License

MIT
