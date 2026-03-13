// ─────────────────────────────────────────────────────────────────────────────
// Inferno Repair — TypeScript types aligned to Database Schema v2
// ─────────────────────────────────────────────────────────────────────────────

// ─── SHOP ─────────────────────────────────────────────────────────────────────
export type Shop = {
  id: string;
  name: string;
  owner_name: string;
  email: string;
  support_email?: string | null;
  phone?: string | null;
  status: 'active' | 'inactive' | 'suspended';
  country?: string | null;
  currency_code: string;
  timezone: string;
  created_at: string;
  updated_at: string;
};

// ─── ROLES — exact schema CHECK values ───────────────────────────────────────
export type TeamMemberRole =
  | 'owner'
  | 'admin'
  | 'manager'
  | 'technician'
  | 'partsspecialist'
  | 'customersupport'
  | 'frontdesk';

export const ROLE_LABELS: Record<TeamMemberRole, string> = {
  owner:           'Owner',
  admin:           'Admin',
  manager:         'Manager',
  technician:      'Technician',
  partsspecialist: 'Parts Specialist',
  customersupport: 'Customer Support',
  frontdesk:       'Front Desk',
};

export const ROLE_DESCRIPTIONS: Record<TeamMemberRole, string> = {
  owner:           'Full access including billing, settings, and all data',
  admin:           'Same access as owner except transferring ownership',
  manager:         'Manage staff, tickets, customers, and invoices',
  technician:      'Create and update repair tickets, log diagnosis and notes',
  partsspecialist: 'Manage parts orders and waiting-parts ticket statuses',
  customersupport: 'Handle customer communication and ticket follow-up',
  frontdesk:       'Intake devices, create tickets, and collect deposits',
};

export const ROLE_NAV: Record<TeamMemberRole, string[]> = {
  owner:           ['dashboard', 'tickets', 'customers', 'invoices', 'settings'],
  admin:           ['dashboard', 'tickets', 'customers', 'invoices', 'settings'],
  manager:         ['dashboard', 'tickets', 'customers', 'invoices', 'settings'],
  technician:      ['dashboard', 'tickets', 'customers'],
  partsspecialist: ['dashboard', 'tickets'],
  customersupport: ['dashboard', 'tickets', 'customers'],
  frontdesk:       ['dashboard', 'tickets', 'customers'],
};

export const MANAGEMENT_ROLES: TeamMemberRole[] = ['owner', 'admin', 'manager'];

// ─── TEAM MEMBER ──────────────────────────────────────────────────────────────
export type TeamMemberStatus = 'pending' | 'active' | 'inactive';

export type TeamMember = {
  id: string;
  shop_id: string;
  user_id?: string | null;
  name: string;
  email: string;
  phone?: string | null;
  role: TeamMemberRole;
  status: TeamMemberStatus;
  invited_at?: string | null;
  accepted_at?: string | null;
  last_seen_at?: string | null;
  created_at: string;
  updated_at: string;
};

// ─── AUTH SESSION ─────────────────────────────────────────────────────────────
export type AuthUser = {
  team_member_id: string; // team_members.id  (FK used for note authorship etc.)
  auth_user_id: string;   // auth.users.id
  shop_id: string;
  name: string;
  email: string;
  role: TeamMemberRole;
  access_token: string;   // JWT forwarded to server actions for RLS
  currency_code: string;  // From shops.currency_code — used for formatting
};

// ─── CUSTOMER ─────────────────────────────────────────────────────────────────
export type Customer = {
  id: string;
  shop_id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  repair_count: number;
  last_repair_date?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
};

// ─── DEVICE ───────────────────────────────────────────────────────────────────
export type Device = {
  id: string;
  shop_id: string;
  customer_id: string;
  device_type: string;
  brand: string;
  model: string;
  serial_number?: string | null;
  imei?: string | null;
  color?: string | null;
  accessories: string[];
  created_at: string;
  updated_at: string;
};

// ─── TICKET ───────────────────────────────────────────────────────────────────
export type TicketStatus =
  | 'open'
  | 'diagnosed'
  | 'in_progress'
  | 'waiting_parts'
  | 'awaiting_approval'
  | 'ready_for_pickup'
  | 'completed'
  | 'cancelled';

export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent';

export type Ticket = {
  id: string;
  shop_id: string;
  customer_id: string;
  device_id?: string | null;
  assigned_to?: string | null;
  code: string;
  issue_description: string;
  diagnosis?: string | null;
  status: TicketStatus;
  priority: TicketPriority;
  cost_estimate: number;
  cost_final?: number | null;
  deposit_amount: number;
  warranty_days?: number | null;
  warranty_expires_at?: string | null;
  lock_code?: string | null;
  intake_condition?: string | null;
  internal_notes?: string | null;
  created_at: string;
  updated_at: string;
  completed_at?: string | null;
};

// ─── TICKET NOTE ──────────────────────────────────────────────────────────────
export type TicketNote = {
  id: string;
  ticket_id: string;
  author_team_member_id?: string | null;
  note: string;
  is_internal: boolean;
  created_at: string;
  author?: Pick<TeamMember, 'id' | 'name' | 'role'> | null;
};

// ─── TICKET STATUS HISTORY ────────────────────────────────────────────────────
export type TicketStatusHistory = {
  id: string;
  ticket_id: string;
  changed_by_team_member_id?: string | null;
  old_status?: string | null;
  new_status: string;
  changed_at: string;
  note?: string | null;
  changed_by?: Pick<TeamMember, 'id' | 'name' | 'role'> | null;
};

// ─── INVOICE ──────────────────────────────────────────────────────────────────
export type InvoiceStatus = 'draft' | 'sent' | 'partially_paid' | 'paid' | 'overdue' | 'cancelled';

export type Invoice = {
  id: string;
  shop_id: string;
  ticket_id: string;
  invoice_number: string;
  amount: number;
  amount_paid: number;
  status: InvoiceStatus;
  due_date?: string | null;
  paid_at?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
};

// ─── PAYMENT ──────────────────────────────────────────────────────────────────
export type PaymentMethod = 'paystack' | 'cash' | 'transfer' | 'mpesa' | 'card';
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'reversed';

export type Payment = {
  id: string;
  shop_id: string;
  invoice_id: string;
  amount: number;
  payment_method: PaymentMethod;
  reference?: string | null;
  external_reference?: string | null;
  status: PaymentStatus;
  paid_at: string;
  created_at: string;
};

// ─── SUBSCRIPTION ─────────────────────────────────────────────────────────────
export type SubscriptionPlan = 'starter' | 'professional' | 'enterprise';
export type SubscriptionStatus = 'trialing' | 'active' | 'paused' | 'cancelled' | 'past_due';

export type Subscription = {
  id: string;
  shop_id: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  billing_cycle: 'monthly' | 'yearly';
  auto_renew: boolean;
  current_period_start?: string | null;
  current_period_end?: string | null;
  trial_ends_at?: string | null;
  paystack_reference?: string | null;
  paystack_customer_code?: string | null;
  cancelled_at?: string | null;
  downgrade_at?: string | null;
  created_at: string;
  updated_at: string;
};

// ─── LABEL MAPS ───────────────────────────────────────────────────────────────
export const TICKET_STATUS_LABELS: Record<TicketStatus, string> = {
  open:              'Open',
  diagnosed:         'Diagnosed',
  in_progress:       'In Progress',
  waiting_parts:     'Waiting for Parts',
  awaiting_approval: 'Awaiting Approval',
  ready_for_pickup:  'Ready for Pickup',
  completed:         'Completed',
  cancelled:         'Cancelled',
};

export const TICKET_PRIORITY_LABELS: Record<TicketPriority, string> = {
  low:    'Low',
  medium: 'Medium',
  high:   'High',
  urgent: 'Urgent',
};

export const INVOICE_STATUS_LABELS: Record<InvoiceStatus, string> = {
  draft:          'Draft',
  sent:           'Sent',
  partially_paid: 'Partially Paid',
  paid:           'Paid',
  overdue:        'Overdue',
  cancelled:      'Cancelled',
};

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  paystack: 'Paystack',
  cash:     'Cash',
  transfer: 'Bank Transfer',
  mpesa:    'M-Pesa',
  card:     'Card',
};

// ─── ERROR HELPER ─────────────────────────────────────────────────────────────
export type DbError = {
  message: string;
  code?: string;
  details?: string;
  hint?: string;
};

export type ActionResult<T> =
  | { data: T; error: null }
  | { data: null; error: DbError | string };
