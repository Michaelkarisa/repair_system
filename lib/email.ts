'use server';

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@infernorepair.com';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

async function sendEmail(to: string, subject: string, html: string) {
  if (!RESEND_API_KEY) {
    console.warn('[email] Resend API key not configured. Logging email instead:');
    console.log(`TO: ${to}\nSUBJECT: ${subject}`);
    return { success: true, simulated: true };
  }
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({ from: FROM_EMAIL, to, subject, html }),
    });
    if (!response.ok) throw new Error(`Email API ${response.status}`);
    return { success: true };
  } catch (error) {
    console.error('[email] Send error:', error);
    return { success: false, error: String(error) };
  }
}

const baseStyle = `
  body{font-family:'Segoe UI',Arial,sans-serif;background:#f8fafc;margin:0;padding:0}
  .wrap{max-width:600px;margin:0 auto;padding:24px}
  .card{background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 16px rgba(0,0,0,.08)}
  .header{background:#ff4d2e;padding:28px 32px;color:#fff}
  .header h1{margin:0;font-size:22px;font-weight:700}
  .header p{margin:6px 0 0;opacity:.85;font-size:14px}
  .body{padding:28px 32px}
  .badge{display:inline-block;padding:6px 14px;background:#fff3f0;color:#ff4d2e;border-radius:6px;font-weight:700;font-size:18px;letter-spacing:.04em;border:2px solid #ff4d2e}
  .row{display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid #f1f5f9;font-size:14px}
  .label{color:#94a3b8;font-weight:600;font-size:12px;text-transform:uppercase;letter-spacing:.06em}
  .value{color:#1e293b;font-size:14px}
  .btn{display:inline-block;padding:12px 28px;background:#ff4d2e;color:#fff;text-decoration:none;border-radius:8px;font-weight:700;font-size:15px;margin-top:20px}
  .otp{font-size:36px;font-weight:800;letter-spacing:.3em;color:#ff4d2e;font-family:monospace;background:#fff3f0;padding:16px 24px;border-radius:8px;border:2px dashed #ff4d2e;display:inline-block;margin:16px 0}
  .footer{text-align:center;padding:20px;font-size:12px;color:#94a3b8}
`;

// ─── TEAM INVITE ──────────────────────────────────────────────────────────────
export async function sendTeamInvite(opts: {
  to: string;
  name: string;
  shopName: string;
  role: string;
  otp: string;
  invitedBy: string;
}) {
  const { to, name, shopName, role, otp, invitedBy } = opts;
  const loginUrl = `${APP_URL}/login`;

  const html = `<!DOCTYPE html><html><head><style>${baseStyle}</style></head><body>
  <div class="wrap">
    <div class="card">
      <div class="header">
        <h1>You're invited to join ${shopName}</h1>
        <p>Invitation from ${invitedBy}</p>
      </div>
      <div class="body">
        <p>Hi ${name},</p>
        <p>You've been added to <strong>${shopName}</strong> as a <strong>${role}</strong>.</p>
        <p>Use the one-time password below to log in. You'll be asked to set a new password after your first login.</p>
        <div style="text-align:center">
          <div class="otp">${otp}</div>
        </div>
        <div style="background:#f8fafc;border-radius:8px;padding:16px;margin:16px 0">
          <div class="label">Your login email</div>
          <div class="value" style="font-size:16px;font-weight:600;margin-top:4px">${to}</div>
        </div>
        <p style="font-size:13px;color:#64748b">⏰ This OTP expires in 24 hours. If you didn't expect this, ignore this email.</p>
        <a href="${loginUrl}" class="btn">Log In Now →</a>
      </div>
    </div>
    <div class="footer">${shopName} · Powered by Inferno Repair</div>
  </div></body></html>`;

  return sendEmail(to, `You're invited to ${shopName} — Your Login Code`, html);
}

// ─── TICKET CONFIRMATION ──────────────────────────────────────────────────────
export async function sendTicketConfirmation(opts: {
  to: string;
  customerName: string;
  shopName: string;
  ticketCode: string;
  deviceBrand: string;
  deviceModel: string;
  issueDescription: string;
  estimatedCost: number;
  estimatedDate: string;
}) {
  const { to, customerName, shopName, ticketCode, deviceBrand, deviceModel, issueDescription, estimatedCost, estimatedDate } = opts;
  const trackUrl = `${APP_URL}/track/${ticketCode}`;

  const html = `<!DOCTYPE html><html><head><style>${baseStyle}</style></head><body>
  <div class="wrap">
    <div class="card">
      <div class="header">
        <h1>Repair Ticket Received</h1>
        <p>Thank you for choosing ${shopName}</p>
      </div>
      <div class="body">
        <p>Hi ${customerName},</p>
        <p>Your device has been checked in. Here are your repair details:</p>
        <div style="text-align:center;margin:20px 0">
          <div class="label">Your Ticket Number</div>
          <div class="badge" style="margin-top:8px">${ticketCode}</div>
        </div>
        <div class="row"><span class="label">Device</span><span class="value">${deviceBrand} ${deviceModel}</span></div>
        <div class="row"><span class="label">Issue</span><span class="value">${issueDescription}</span></div>
        <div class="row"><span class="label">Estimated Cost</span><span class="value">$${estimatedCost}</span></div>
        <div class="row" style="border:none"><span class="label">Est. Completion</span><span class="value">${estimatedDate}</span></div>
        <p style="margin-top:20px;font-size:14px;color:#64748b">Track your repair status anytime using the button below.</p>
        <a href="${trackUrl}" class="btn">Track My Repair →</a>
      </div>
    </div>
    <div class="footer">${shopName}</div>
  </div></body></html>`;

  return sendEmail(to, `[${ticketCode}] Repair Received — ${shopName}`, html);
}

// ─── STATUS UPDATE ────────────────────────────────────────────────────────────
export async function sendStatusUpdate(opts: {
  to: string;
  customerName: string;
  shopName: string;
  shopPhone: string;
  supportEmail: string;
  ticketCode: string;
  newStatus: string;
  deviceBrand: string;
  deviceModel: string;
}) {
  const { to, customerName, shopName, shopPhone, supportEmail, ticketCode, newStatus, deviceBrand, deviceModel } = opts;
  const trackUrl = `${APP_URL}/track/${ticketCode}`;

  const statusMessages: Record<string, { label: string; note: string; color: string }> = {
    in_progress:      { label: 'In Progress',        note: 'Our technician is actively working on your device.',            color: '#8b5cf6' },
    waiting_parts:    { label: 'Waiting for Parts',  note: 'We\'ve ordered the necessary parts. We\'ll update you soon.',   color: '#f59e0b' },
    ready_for_pickup: { label: 'Ready for Pickup! 🎉', note: 'Your device is repaired and ready. Please come pick it up.',  color: '#10b981' },
    completed:        { label: 'Completed',           note: 'Your repair is complete. Thank you for choosing us!',          color: '#10b981' },
    cancelled:        { label: 'Cancelled',           note: 'Your repair ticket has been cancelled. Please contact us.',    color: '#ef4444' },
  };

  const info = statusMessages[newStatus] ?? { label: newStatus, note: 'Your repair status has been updated.', color: '#ff4d2e' };

  const html = `<!DOCTYPE html><html><head><style>${baseStyle}</style></head><body>
  <div class="wrap">
    <div class="card">
      <div class="header">
        <h1>Repair Status Update</h1>
        <p>${deviceBrand} ${deviceModel} — ${ticketCode}</p>
      </div>
      <div class="body">
        <p>Hi ${customerName},</p>
        <div style="text-align:center;margin:20px 0;padding:20px;background:#f8fafc;border-radius:10px">
          <div class="label">Current Status</div>
          <div style="font-size:20px;font-weight:800;color:${info.color};margin-top:8px">${info.label}</div>
        </div>
        <p style="font-size:15px;color:#334155">${info.note}</p>
        <a href="${trackUrl}" class="btn">View Ticket Status →</a>
        <div style="margin-top:28px;padding-top:20px;border-top:1px solid #f1f5f9;font-size:13px;color:#64748b">
          Questions? Call us at ${shopPhone} or email <a href="mailto:${supportEmail}" style="color:#ff4d2e">${supportEmail}</a>
        </div>
      </div>
    </div>
    <div class="footer">${shopName}</div>
  </div></body></html>`;

  return sendEmail(to, `[${ticketCode}] Status Update: ${info.label}`, html);
}

// ─── INVOICE EMAIL ────────────────────────────────────────────────────────────
export async function sendInvoiceEmail(opts: {
  to: string;
  customerName: string;
  shopName: string;
  supportEmail: string;
  invoiceId: string;
  invoiceNumber: string;
  ticketCode: string;
  deviceBrand: string;
  deviceModel: string;
  amount: number;
  dueDate: string;
}) {
  const { to, customerName, shopName, supportEmail, invoiceId, invoiceNumber, ticketCode, deviceBrand, deviceModel, amount, dueDate } = opts;
  const payUrl = `${APP_URL}/invoices/${invoiceId}`;

  const html = `<!DOCTYPE html><html><head><style>${baseStyle}</style></head><body>
  <div class="wrap">
    <div class="card">
      <div class="header">
        <h1>Invoice — ${invoiceNumber}</h1>
        <p>${shopName}</p>
      </div>
      <div class="body">
        <p>Hi ${customerName},</p>
        <p>Your repair has been completed. Please find your invoice below.</p>
        <div class="row"><span class="label">Invoice #</span><span class="value" style="font-family:monospace;font-weight:700">${invoiceNumber}</span></div>
        <div class="row"><span class="label">Ticket</span><span class="value">${ticketCode}</span></div>
        <div class="row"><span class="label">Device</span><span class="value">${deviceBrand} ${deviceModel}</span></div>
        <div class="row"><span class="label">Due Date</span><span class="value">${dueDate}</span></div>
        <div style="display:flex;justify-content:space-between;padding:16px 0;font-size:20px;font-weight:800;color:#ff4d2e">
          <span>TOTAL DUE</span><span>$${amount}</span>
        </div>
        <a href="${payUrl}" class="btn">View & Pay Invoice →</a>
        <p style="margin-top:24px;font-size:13px;color:#64748b">Questions? <a href="mailto:${supportEmail}" style="color:#ff4d2e">${supportEmail}</a></p>
      </div>
    </div>
    <div class="footer">${shopName}</div>
  </div></body></html>`;

  return sendEmail(to, `Invoice ${invoiceNumber} — $${amount} due — ${shopName}`, html);
}
