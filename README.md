# Mailosaur OTP Authentication Demo

A Next.js application demonstrating different one-time password (OTP) authentication flows using custom backend APIs with Twilio and Nodemailer.

## Features

- 🔗 **Magic Link Authentication** - Email-based passwordless login
- 📱 **SMS Authentication** - Phone number verification with OTP codes
- 🔐 **TOTP Authentication** - Time-based OTP using authenticator apps (Google Authenticator, Authy, etc.)

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Gmail account with App Password (for email functionality)
- Twilio account (for SMS functionality)

### Installation

1. Clone and install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your service credentials:
```bash
# Application Settings
NEXT_PUBLIC_BASE_URL=http://localhost:3000
JWT_SECRET=your-jwt-secret-key-change-this-in-production

# Email Configuration (Nodemailer)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
FROM_EMAIL=noreply@yourdomain.com

# Twilio Configuration
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=+1234567890
```

3. Configure third-party services:
   - **Gmail SMTP**: Enable 2FA and generate an App Password for SMTP_PASS
   - **Twilio**: Create account, get Account SID, Auth Token, and phone number

4. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Authentication Methods

### Magic Link (`/auth/magic-link`)
- Enter email address
- Receive magic link via email (using Nodemailer)
- Click link to authenticate and create session

### SMS Authentication (`/auth/sms`)
- Enter phone number with country code
- Receive 6-digit code via SMS (using Twilio)
- Enter code to verify and create session

### TOTP Authentication (`/auth/totp`)
- Enter identifier (email/phone)
- Scan QR code with authenticator app
- Enter 6-digit TOTP code to complete setup and create session

## Project Structure

```
src/
├── app/
│   ├── api/auth/           # Authentication API routes
│   │   ├── magic-link/     # Magic link send/verify endpoints
│   │   ├── sms/           # SMS send/verify endpoints
│   │   ├── totp/          # TOTP setup/verify endpoints
│   │   ├── session/       # Session management
│   │   └── logout/        # Logout endpoint
│   ├── auth/              # Frontend auth pages
│   │   ├── magic-link/    # Magic link login page
│   │   ├── sms/          # SMS authentication page
│   │   └── totp/         # TOTP/Authenticator app page
│   ├── success/          # Post-authentication success page
│   ├── layout.tsx        # Root layout
│   ├── page.tsx         # Home page with auth method selection
│   └── globals.css      # Global styles
└── components/          # Reusable React components
```

## Technologies

- **Next.js 14** - React framework with App Router and TypeScript
- **Twilio** - SMS functionality via `twilio` package
- **Nodemailer** - Email functionality for magic links
- **OTPAuth** - TOTP generation and verification
- **JWT** - Session tokens and magic link tokens
- **QRCode** - QR code generation for TOTP
- **Tailwind CSS 4.x** - Utility-first CSS framework

## Session Management

- Uses HTTP-only cookies with JWT tokens for secure session management
- Session tokens contain user info (email/phone/identifier, auth method, login time)
- 24-hour session expiration
- In-memory storage for OTP codes and TOTP secrets (use Redis/database in production)

## License

MIT