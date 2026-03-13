# Inferno Repair - Production Setup Guide

This guide walks you through setting up Inferno Repair for production deployment with real database, email, payment processing, team management, and subscription billing.

## Table of Contents
1. [Database Setup (Supabase)](#database-setup)
2. [Email Configuration (Resend)](#email-configuration)
3. [Payment Setup (Paystack)](#payment-setup)
4. [Subscriptions & Team Management](#subscriptions-and-team-management)
5. [Environment Variables](#environment-variables)
6. [Deployment](#deployment)
7. [Testing Production Features](#testing-production-features)

---

## Database Setup

### Supabase Configuration

1. **Create a Supabase Project**
   - Go to [supabase.com](https://supabase.com)
   - Click "New Project"
   - Choose your region (pick closest to your users)
   - Set a secure database password
   - Wait for project creation (5-10 minutes)

2. **Create Database Tables**
   - In Supabase dashboard, go to "SQL Editor"
   - Click "New Query"
   - Copy the entire contents of `lib/database.sql`
   - Paste into the SQL editor and run

3. **Get Your Credentials**
   - Go to Settings → API
   - Copy `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - Copy `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Copy `service_role` secret → `SUPABASE_SERVICE_ROLE_KEY` (keep this secret!)

### Authentication Setup (Optional but Recommended)

1. Enable Email/Password Auth in Supabase
   - Go to Authentication → Providers
   - Enable "Email"
   - Configure email templates if needed

2. Set up RLS (Row Level Security)
   - The database.sql file already includes RLS policies
   - Verify they're created by checking the "Auth" tab in Supabase

---

## Email Configuration

### Resend Setup

1. **Create Resend Account**
   - Go to [resend.com](https://resend.com)
   - Sign up with your email
   - Verify your email address

2. **Get Your API Key**
   - Dashboard → API Keys
   - Create new API key
   - Copy the key → `RESEND_API_KEY`

3. **Configure Sender Email**
   - The app uses `noreply@infernorepair.com`
   - You'll need to configure a domain or use Resend's subdomain
   - For testing: use `onboarding@resend.dev`

4. **Update in Production**
   - Change the `FROM_EMAIL` in `lib/email.ts`
   - Use your actual domain email address

### Email Templates Included

The system sends 4 types of emails:
1. **Ticket Confirmation** - Sent when customer submits a repair
2. **Status Updates** - Sent when ticket status changes
3. **Invoice Notification** - Sent when repair is complete
4. **Support Escalation** - Sent to support email for urgent issues

---

## Payment Setup

### Paystack Integration

1. **Create Paystack Account**
   - Go to [paystack.com](https://paystack.com)
   - Sign up and verify your account
   - Complete KYC verification

2. **Get Your Keys**
   - Settings → API Keys & Webhooks
   - Copy `Public Key` → `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY`
   - Copy `Secret Key` → `PAYSTACK_SECRET_KEY`

3. **Test Mode**
   - Start with test keys from Paystack
   - Test payment flow before going live
   - Use test card: 4111 1111 1111 1111 (CVV: any 3 digits, date: any future date)

4. **Go Live**
   - Complete Paystack verification
   - Switch to live keys
   - Ensure SSL certificate is active

### Payment Flow

1. Customer views invoice
2. Clicks "Pay with Paystack"
3. Redirected to Paystack payment page
4. Payment processed and verified
5. Invoice marked as paid in database
6. Customer receives confirmation email

---

## Environment Variables

### Create `.env.local` file

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Resend
RESEND_API_KEY=your_resend_api_key

# Paystack
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=your_paystack_public_key
PAYSTACK_SECRET_KEY=your_paystack_secret_key

# Application
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

### For Vercel Deployment

1. Go to Vercel project settings
2. Environment Variables
3. Add each variable listed above
4. Redeploy the application

---

## Deployment

### Deploy to Vercel

1. **Connect Repository**
   - Push your code to GitHub
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Select your GitHub repository

2. **Configure Environment**
   - Vercel will detect Next.js
   - In Settings → Environment Variables, add all variables from `.env.local`
   - Click Deploy

3. **Domain Configuration**
   - Vercel → Settings → Domains
   - Add your custom domain
   - Update DNS records as shown

4. **SSL Certificate**
   - Vercel provides automatic SSL
   - Verify HTTPS works before Paystack live

### Post-Deployment Checklist

- [ ] Database queries working (check Network tab)
- [ ] Emails sending (test ticket creation)
- [ ] Payment flow completes (test with Paystack test card)
- [ ] Support email receives escalations
- [ ] Customer history populates correctly
- [ ] Invoice tracking works

---

## Database Backup

### Regular Backups

1. Supabase automatically backs up daily
2. To manual backup:
   - Dashboard → Database → Backups
   - Click "Create Backup"

3. To restore:
   - Go to Backups
   - Click "Restore" next to desired backup

---

## Monitoring & Logs

### Supabase Logs
- Dashboard → Logs
- Monitor database queries and performance

### Vercel Logs
- Vercel → Deployments → Logs
- Check for runtime errors

### Email Logs
- Resend → Emails
- View sent emails and delivery status

### Payment Logs
- Paystack → Payments
- View all transactions and refunds

---

## Troubleshooting

### Database Connection Issues
```
Error: "Failed to fetch..."
- Check NEXT_PUBLIC_SUPABASE_URL is correct
- Verify NEXT_PUBLIC_SUPABASE_ANON_KEY is valid
- Check RLS policies aren't blocking queries
```

### Email Not Sending
```
Error: "Email service not configured"
- Verify RESEND_API_KEY is set
- Check email address is valid
- Use onboarding@resend.dev for testing
```

### Payment Failures
```
Error: "Payment initialization failed"
- Verify PAYSTACK_SECRET_KEY is correct
- Check amount is in correct currency (kobo)
- Ensure NEXT_PUBLIC_APP_URL is set correctly
- Use test keys before going live
```

---

## Support Email Management

The support email is used for:
- Escalations when repairs are overdue
- Customer inquiries that need attention
- System notifications

To update support email:
1. Go to Dashboard → Settings
2. Update "Support Email" field
3. Changes take effect immediately

---

## Next Steps

1. Complete environment variable setup
2. Run database migration (lib/database.sql)
3. Test email functionality
4. Test payment flow with test cards
5. Deploy to Vercel
6. Monitor logs for issues
7. Announce to first users!

For detailed API documentation, see `lib/actions/` folder comments.
