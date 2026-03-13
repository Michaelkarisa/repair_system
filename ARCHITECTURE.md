# Inferno Repair - Architecture & Implementation Guide

## Overview

Inferno Repair is a production-ready SaaS platform built with Next.js 16, Supabase, Resend, and Paystack. This document outlines the complete architecture and how all systems integrate.

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Client Layer (Browser)                    │
│  Next.js Components | React 19 | TypeScript | Tailwind CSS       │
│  shadcn/ui | Lucide Icons | Client State Management              │
└──────────────────────┬──────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│              Application Layer (Next.js Server)                  │
│  App Router | Server Components | Server Actions                 │
│  Route Handlers | Middleware | Form Validation                   │
└──────────────────────┬──────────────────────────────────────────┘
                       │
        ┌──────────────┼──────────────┬──────────────┐
        ▼              ▼              ▼              ▼
┌─────────────────┐ ┌──────────────┐ ┌───────────┐ ┌──────────────┐
│  Supabase       │ │   Resend     │ │ Paystack  │ │ Vercel       │
│  PostgreSQL     │ │   Email API  │ │ Payments  │ │ Hosting      │
│  Auth/RLS       │ │              │ │           │ │              │
│  Real-time      │ │ Transactional│ │ Webhooks  │ │ Serverless   │
└─────────────────┘ └──────────────┘ └───────────┘ └──────────────┘
```

## Data Flow

### Ticket Creation Flow

```
1. Customer fills ticket form
   ↓
2. Client validates form (TypeScript types)
   ↓
3. Server action called (createTicket)
   ↓
4. Supabase inserts ticket with RLS check
   ↓
5. Email service sends confirmation (Resend)
   ↓
6. Dashboard stats updated via revalidatePath
   ↓
7. Customer receives confirmation email
```

### Payment Processing Flow

```
1. Customer views invoice
   ↓
2. Clicks "Pay with Paystack"
   ↓
3. Server initializes payment (initializePayment)
   ↓
4. Paystack returns payment URL
   ↓
5. Customer completes payment
   ↓
6. Paystack redirects to callback URL
   ↓
7. Server verifies payment (verifyPayment)
   ↓
8. Invoice marked as paid in Supabase
   ↓
9. Confirmation email sent (Resend)
```

## Directory Structure Explained

### `/app` - Page Routes

```
app/
├── page.tsx              # Landing page (public)
├── (public)/             # Public route group
│   ├── track/            # Public ticket lookup
│   └── [code]/           # Dynamic ticket tracking
├── (auth)/               # Authentication route group
│   ├── login/            # Shop owner login
│   ├── register/         # New shop registration
│   └── onboarding/       # Setup wizard
├── (app)/                # Protected route group
│   ├── layout.tsx        # Sidebar + top bar layout
│   ├── dashboard/        # Main dashboard
│   ├── tickets/          # Ticket management
│   │   └── [id]/         # Ticket details
│   ├── customers/        # Customer database
│   ├── invoices/         # Invoice management
│   └── settings/         # Shop settings
└── layout.tsx            # Root layout
```

### `/components` - Reusable Components

```
components/
├── ui/                   # shadcn/ui components
│   ├── button.tsx
│   ├── card.tsx
│   ├── input.tsx
│   └── ... (50+ components)
├── app-sidebar.tsx       # Navigation sidebar
├── top-bar.tsx          # Header bar
├── footer.tsx           # Footer component
├── stats-card.tsx       # Dashboard stat card
├── status-badge.tsx     # Status indicator
├── feature-card.tsx     # Landing page feature card
├── pricing-card.tsx     # Pricing tier card
├── ticket-status-timeline.tsx  # Repair progress
├── modals/
│   └── new-ticket-modal.tsx    # Ticket creation form
└── ... (other components)
```

### `/lib` - Business Logic

```
lib/
├── types.ts              # TypeScript type definitions
├── database.sql          # Database schema
├── mock-data.ts          # Development mock data
├── mock-api.ts           # Development mock API
├── email.ts              # Resend email service
├── paystack.ts           # Paystack payment API
├── supabase/
│   └── client.ts         # Supabase client initialization
└── actions/              # Server actions (CRUD operations)
    ├── tickets.ts        # Ticket management
    ├── customers.ts      # Customer management
    ├── invoices.ts       # Invoice management
    └── auth.ts           # Authentication
```

## Database Schema

### Tables Structure

**shops** - Store owner account
- id (UUID primary key)
- name, owner_name, email
- support_email (for escalations)
- phone, created_at, updated_at

**customers** - Customer profiles
- id, shop_id (foreign key)
- name, email, phone
- device_models (array), repair_count
- last_repair_date, created_at, updated_at

**tickets** - Repair tickets
- id, shop_id, customer_id (foreign keys)
- code (unique ticket number)
- device_type, brand, model
- issue_description, condition_notes
- status, priority
- cost_estimate, cost_final
- warranty_days, warranty_expires_at
- deposit_amount, notes (array)
- created_at, updated_at, completed_at

**invoices** - Payment tracking
- id, shop_id, ticket_id (foreign keys)
- amount, status
- payment_method, paystack_reference
- created_at, updated_at, paid_at, due_date

**team_members** - Staff accounts
- id, shop_id (foreign key)
- name, email, role
- created_at, updated_at

### Security (RLS Policies)

All tables have Row Level Security enabled:
- Shop owners can only see their own data
- Foreign key constraints ensure data isolation
- Service role key needed for admin operations

## Authentication Flow

### Current Implementation (Development)

For development, authentication is simulated:
- Login validates email/password locally
- Redirects to dashboard
- No session persistence yet

### For Production (Recommended)

Implement Supabase Auth:

1. **Setup Email/Password Auth**
   - Enable in Supabase Auth settings
   - Configure email templates

2. **Session Management**
   - Use `@supabase/ssr` for server-side sessions
   - HTTP-only cookies for security
   - Auto-refresh tokens

3. **Protected Routes**
   - Middleware checks authentication
   - Redirects to login if not authenticated
   - Maintains shop context

4. **User Context**
   - Create React context for current user
   - Pass shop_id through context
   - Available in all pages and components

## Email Integration (Resend)

### Email Types

1. **Ticket Confirmation**
   - Triggered: When ticket is created
   - To: Customer email
   - Contains: Ticket number, device info, estimated cost

2. **Status Update**
   - Triggered: When ticket status changes
   - To: Customer email
   - Contains: New status, support contact

3. **Invoice Email**
   - Triggered: When invoice is generated
   - To: Customer email
   - Contains: Invoice amount, payment link, due date

4. **Support Escalation**
   - Triggered: Manual or automatic (overdue tickets)
   - To: Support email
   - Contains: Ticket details, escalation reason

### Implementation

```typescript
// In server actions, after database update:
await sendTicketConfirmation(customer, ticket, shopName);

// Or in API routes:
const { success, error } = await sendEmail(to, subject, html);
```

## Payment Integration (Paystack)

### Payment Lifecycle

1. **Invoice Created**
   - Generate invoice from completed ticket
   - Customer can click "Pay" button

2. **Payment Initialized**
   ```typescript
   const response = await initializePayment({
     email: customer.email,
     amount: invoice.amount,
     metadata: { ticket_id, shop_id, invoice_id }
   });
   // Returns authorization_url to redirect customer
   ```

3. **Customer Pays**
   - Redirected to Paystack hosted page
   - Customer enters card details
   - Paystack processes payment

4. **Verification**
   - Callback from Paystack to your server
   - Server verifies with Paystack API
   - Update invoice status to "paid"
   - Send confirmation email

5. **Reconciliation**
   - All payments visible in Paystack dashboard
   - Webhook integration for automatic updates

### Test Cards (Development)

```
Card Number: 4111 1111 1111 1111
Expiry: Any future date (MM/YY format)
CVV: Any 3 digits
OTP: 123456
```

## Component State Management

### Server Components (Default)

Most pages use server components:
- No hydration issues
- Direct database access
- Built-in caching
- Better SEO

```typescript
// app/(app)/dashboard/page.tsx - Server Component
export default async function Dashboard() {
  const data = await getDashboardStats(shopId);
  return <div>{data}</div>;
}
```

### Client Components

Used for interactivity:
- Forms and input
- Modal dialogs
- Real-time updates
- Client-side filtering

```typescript
// components/new-ticket-modal.tsx - Client Component
'use client';
export function NewTicketModal() {
  const [open, setOpen] = useState(false);
  // Form logic here
}
```

### Form Handling

```typescript
// Using Server Actions
async function handleSubmit(formData: FormData) {
  const result = await createTicket(shopId, {
    // data from formData
  });
  
  if (result.error) {
    // Show error toast
  }
}
```

## Error Handling

### Server-Side

```typescript
try {
  const data = await supabase.from('tickets').select();
} catch (error) {
  console.error('[v0] Error:', error);
  return { data: null, error: 'Failed to fetch' };
}
```

### Client-Side

```typescript
const [error, setError] = useState<string | null>(null);

const handleSubmit = async () => {
  try {
    const result = await createTicket(shopId, data);
    if (result.error) {
      setError(result.error);
    }
  } catch (error) {
    setError(String(error));
  }
};
```

## Performance Optimizations

### Database
- Indexes on frequently queried fields
- Pagination for large result sets
- Caching with `revalidatePath()`
- Connection pooling via Supabase

### Frontend
- Image optimization with Next.js
- Code splitting with dynamic imports
- CSS-in-JS tree shaking
- Bundle analysis with `next/bundle-analyzer`

### Deployment
- Vercel edge caching
- Automatic code splitting
- Image CDN with Vercel
- Automatic backups (Supabase)

## Scaling Considerations

### Current Capacity
- Supabase free tier: 500MB database
- Resend: 100 emails/day free
- Paystack: No limits

### When to Upgrade

1. **Database**
   - Switch to Supabase Pro ($25/month)
   - Or AWS RDS/Aurora for 1000s of shops

2. **Email**
   - Upgrade Resend plan for higher limits
   - Or use SendGrid/Mailgun

3. **Payments**
   - No limits, but enable advanced fraud detection
   - Implement webhook verification

4. **Hosting**
   - Vercel Pro for higher concurrency
   - Add Redis for session caching
   - Use Upstash Redis for rate limiting

## Monitoring & Logging

### Supabase
- Check "Logs" tab for query performance
- Monitor database size in "Settings"
- Set up email alerts for quotas

### Resend
- View email delivery status in dashboard
- Check bounce rates and complaints
- Monitor for API rate limits

### Paystack
- Review transaction logs
- Check refund history
- Verify webhook deliveries

### Vercel
- Check deployment logs for errors
- Monitor function duration
- Review analytics for traffic

## Security Checklist

- [ ] Enable HTTPS/SSL certificate
- [ ] Set `SUPABASE_SERVICE_ROLE_KEY` only on server
- [ ] Use environment variables for secrets
- [ ] Enable RLS on all database tables
- [ ] Validate all user inputs
- [ ] Sanitize form data
- [ ] Use CSRF protection
- [ ] Verify Paystack webhooks
- [ ] Regular security audits
- [ ] Monitor error logs for attacks

## Development Workflow

```bash
# Local development
npm run dev

# Test email locally
# Use Resend onboarding@resend.dev

# Test payments
# Use Paystack test mode

# Before deployment
npm run build
npm run start

# Check for errors
npm run lint
```

## Deployment Checklist

- [ ] Update PRODUCTION_SETUP.md
- [ ] Get Supabase credentials
- [ ] Get Resend API key
- [ ] Get Paystack keys
- [ ] Create .env.local with credentials
- [ ] Run database migration
- [ ] Test all features
- [ ] Deploy to Vercel
- [ ] Set environment variables in Vercel
- [ ] Test in production
- [ ] Monitor logs
- [ ] Update support email in app

## Next Steps

1. **Authentication**: Implement Supabase Auth for real user management
2. **Webhooks**: Set up Paystack webhooks for automatic payment verification
3. **Analytics**: Add PostHog/Mixpanel for usage tracking
4. **Notifications**: Add real-time updates with Supabase subscriptions
5. **Reporting**: Create PDF invoices and repair reports
6. **Mobile App**: Build React Native app with shared API

## Support & Resources

- [Next.js Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Resend Docs](https://resend.com/docs)
- [Paystack Docs](https://paystack.com/docs)
- [shadcn/ui Components](https://ui.shadcn.com)

---

For production deployment instructions, see [PRODUCTION_SETUP.md](./PRODUCTION_SETUP.md)
