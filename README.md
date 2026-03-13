# Inferno Repair - Professional Electronics Repair Management Platform

A production-ready SaaS platform for electronics repair shops to manage tickets, customers, invoices, and payments.

## Features

- **Ticket Management**: Create, track, and manage repair tickets with status updates
- **Customer Database**: Maintain detailed customer profiles with repair history
- **Invoice System**: Generate and track invoices with payment processing via Paystack
- **Email Notifications**: Automated emails for ticket confirmations, status updates, and invoices via Resend
- **Support Management**: Add support email for escalations and inquiries
- **Real-time Updates**: Live status tracking for customers
- **Warranty Tracking**: Monitor warranty periods and coverage
- **Dashboard**: Overview of all tickets, revenue, and shop metrics

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui with Lucide Icons
- **Database**: Supabase (PostgreSQL with RLS)
- **Email**: Resend for transactional emails
- **Payments**: Paystack for secure payment processing
- **Hosting**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm (or npm/yarn)
- Supabase account
- Resend account
- Paystack account (for payments)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd inferno-repair

# Install dependencies
pnpm install

# Create environment file
cp .env.example .env.local

# Add your credentials to .env.local
```

### Environment Setup

See [PRODUCTION_SETUP.md](./PRODUCTION_SETUP.md) for detailed instructions on:
- Setting up Supabase database
- Configuring Resend email
- Integrating Paystack payments

### Development

```bash
# Start development server
pnpm dev

# Open http://localhost:3000
```

### Database

The application uses Supabase PostgreSQL. To set up:

1. Create a Supabase project
2. Run the schema from `lib/database.sql` in Supabase SQL editor
3. Add credentials to `.env.local`

See [PRODUCTION_SETUP.md](./PRODUCTION_SETUP.md) for detailed steps.

## Project Structure

```
├── app/                    # Next.js App Router pages
│   ├── (app)/             # Protected app routes (dashboard, tickets, etc.)
│   ├── (auth)/            # Authentication routes (login, register)
│   ├── (public)/          # Public routes (landing, tracking)
│   └── layout.tsx         # Root layout
├── components/            # Reusable React components
│   ├── ui/               # shadcn/ui components
│   ├── modals/           # Modal components
│   ├── app-sidebar.tsx   # Navigation sidebar
│   └── ...               # Other components
├── lib/                   # Utility functions and services
│   ├── actions/          # Server actions for database operations
│   ├── supabase/         # Supabase client setup
│   ├── types.ts          # TypeScript type definitions
│   ├── email.ts          # Resend email service
│   ├── paystack.ts       # Paystack payment service
│   ├── mock-api.ts       # Mock data for development
│   └── database.sql      # Database schema
├── public/               # Static assets
└── package.json          # Dependencies

```

## API Documentation

### Server Actions (lib/actions/)

#### Tickets
- `createTicket(shopId, data)` - Create new ticket
- `getTicket(ticketId, shopId)` - Fetch single ticket
- `listTickets(shopId, options)` - List all tickets with filters
- `updateTicket(ticketId, shopId, updates)` - Update ticket
- `addTicketNote(ticketId, shopId, note)` - Add note to ticket
- `getDashboardStats(shopId)` - Get ticket statistics

#### Customers
- `createCustomer(shopId, data)` - Create customer record
- `getCustomer(customerId, shopId)` - Fetch customer details
- `listCustomers(shopId, options)` - Search and list customers
- `updateCustomer(customerId, shopId, updates)` - Update customer
- `getCustomerHistory(customerId, shopId)` - Get full customer history
- `deleteCustomer(customerId, shopId)` - Delete customer

#### Invoices
- `createInvoice(shopId, data)` - Create invoice
- `getInvoice(invoiceId, shopId)` - Fetch invoice
- `listInvoices(shopId, options)` - List invoices with filters
- `updateInvoice(invoiceId, shopId, updates)` - Update invoice
- `markInvoiceAsPaid(invoiceId, shopId, paystackRef)` - Mark as paid
- `deleteInvoice(invoiceId, shopId)` - Delete invoice

### Email Service (lib/email.ts)

```typescript
// Send ticket confirmation
await sendTicketConfirmation(customer, ticket, shopName);

// Send status update
await sendTicketStatusUpdate(customer, ticket, shopName, supportEmail);

// Send invoice
await sendInvoiceEmail(customer, invoice, ticket, shopName, supportEmail);

// Send support escalation
await sendSupportEscalation(ticket, customer, supportEmail, shopName, reason);
```

### Payment Service (lib/paystack.ts)

```typescript
// Initialize payment
const response = await initializePayment({
  email: customer.email,
  amount: invoice.amount,
  metadata: { ticket_id, shop_id, invoice_id }
});

// Verify payment
const verification = await verifyPayment(reference);
```

## Pages

### Public Routes
- `/` - Landing page with features and pricing
- `/track` - Public ticket lookup
- `/track/[code]` - Public ticket details

### Authentication Routes
- `/login` - Shop owner login
- `/register` - New shop registration
- `/onboarding` - 4-step setup wizard

### Protected Routes (Requires Login)
- `/dashboard` - Main dashboard with stats
- `/tickets` - Ticket list and management
- `/tickets/[id]` - Ticket details with full history
- `/customers` - Customer database with search
- `/invoices` - Invoice management and tracking
- `/settings` - Shop settings and support email

## Development Features

### Mock Data
For development without Supabase, the app includes mock data:
- `lib/mock-data.ts` - Sample tickets, customers, invoices
- `lib/mock-api.ts` - Simulated API responses

To use mock data, environment variables are optional.

### Form Validation
Components include built-in validation for:
- Email addresses
- Required fields
- Numeric values
- Date ranges

### Loading States
All data-fetching pages include:
- Skeleton loaders
- Loading spinners
- Error messages
- Retry capabilities

## Deployment

### Vercel (Recommended)

```bash
# Push to GitHub
git push origin main

# Connect to Vercel
# Vercel auto-deploys on push
```

Then add environment variables in Vercel dashboard:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `RESEND_API_KEY`
- `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY`
- `PAYSTACK_SECRET_KEY`
- `NEXT_PUBLIC_APP_URL`

See [PRODUCTION_SETUP.md](./PRODUCTION_SETUP.md) for detailed deployment guide.

## Best Practices

### Security
- Always use `SUPABASE_SERVICE_ROLE_KEY` only in server-side code
- Keep Paystack secret key in environment variables
- Enable RLS in Supabase for data isolation
- Use HTTPS in production

### Database
- Run regular backups in Supabase
- Monitor query performance
- Use indexes for frequent queries
- Implement pagination for large result sets

### Emails
- Test emails with `onboarding@resend.dev` first
- Configure domain DKIM/SPF before production
- Monitor delivery rates in Resend dashboard

### Payments
- Always use test keys during development
- Verify payments server-side with Paystack
- Handle payment callbacks securely
- Log all transactions

## Troubleshooting

### Database Issues
Check `PRODUCTION_SETUP.md` Database Setup section

### Email Issues
Check `PRODUCTION_SETUP.md` Email Configuration section

### Payment Issues
Check `PRODUCTION_SETUP.md` Payment Setup section

## Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## Support

For setup issues, see [PRODUCTION_SETUP.md](./PRODUCTION_SETUP.md)

For detailed architecture and API usage, check comments in:
- `lib/actions/` - Server actions documentation
- `lib/types.ts` - Type definitions
- Individual component files

## License

Proprietary - Inferno Repair
