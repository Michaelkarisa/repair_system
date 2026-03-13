# Inferno Repair - Quick Start Guide

## 🚀 Get Running in 3 Steps

### Step 1: Create `.env.local`

```env
# Copy from .env.example and fill in your keys
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key
RESEND_API_KEY=your_resend_key
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=your_paystack_public_key
PAYSTACK_SECRET_KEY=your_paystack_secret_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Step 2: Run Database Schema

```bash
# Open Supabase SQL Editor and run:
# Copy entire contents of: lib/database.sql
# Paste and execute in SQL Editor
```

### Step 3: Start Development

```bash
pnpm install
pnpm dev
# Open http://localhost:3000
```

---

## 📋 API Keys Needed

| Service | Key Name | Where to Get |
|---------|----------|-------------|
| Supabase | Project URL, Anon Key, Service Key | supabase.com/dashboard |
| Resend | API Key | resend.com/dashboard |
| Paystack | Public & Secret Key (Test) | dashboard.paystack.com |

---

## 🔑 Environment Variables Reference

```
NEXT_PUBLIC_SUPABASE_URL       → Settings > API > Project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY  → Settings > API > anon key
SUPABASE_SERVICE_ROLE_KEY      → Settings > API > service_role (SECRET!)
RESEND_API_KEY                 → Dashboard > API Keys
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY → Settings > API Keys (Public Key)
PAYSTACK_SECRET_KEY            → Settings > API Keys (Secret Key)
NEXT_PUBLIC_APP_URL            → localhost:3000 (local) or domain (prod)
```

---

## 📱 Test Account (Development)

```
Email: any@email.com
Password: any password
→ Auto-creates shop on register
```

---

## 💳 Test Paystack Card

```
Card: 4111 1111 1111 1111
Expiry: Any future date (MM/YY)
CVV: Any 3 digits
OTP: 123456
```

---

## 📧 Test Email (Development)

For Resend testing without setup:
```
FROM_EMAIL: onboarding@resend.dev
(Update in lib/email.ts)
```

---

## 🗄️ Database Tables

| Table | Purpose |
|-------|---------|
| shops | Store owner accounts |
| customers | Customer profiles |
| tickets | Repair tickets |
| invoices | Payment tracking |
| team_members | Staff accounts |

---

## 🔗 Key Files

| File | Purpose |
|------|---------|
| lib/types.ts | TypeScript definitions |
| lib/actions/\* | Database operations |
| lib/email.ts | Email templates |
| lib/paystack.ts | Payment API |
| lib/database.sql | Database schema |
| .env.example | Environment template |

---

## 📄 Documentation Map

| Document | Purpose | Read Time |
|----------|---------|-----------|
| BUILD_SUMMARY.md | What was built | 5 min |
| QUICK_START.md | This guide | 2 min |
| DEPLOYMENT_CHECKLIST.md | Deploy steps | 10 min |
| PRODUCTION_SETUP.md | Detailed setup | 20 min |
| ARCHITECTURE.md | System design | 15 min |
| README.md | Overview | 10 min |

**Start with:** QUICK_START.md (you're here!)
**Then read:** DEPLOYMENT_CHECKLIST.md (for deployment)

---

## ✅ Development Checklist

- [ ] Copy .env.example → .env.local
- [ ] Add all API keys to .env.local
- [ ] Run database.sql in Supabase
- [ ] Run `pnpm install`
- [ ] Run `pnpm dev`
- [ ] Register new shop
- [ ] Go through onboarding
- [ ] Create test ticket
- [ ] Create test customer
- [ ] Test invoice creation
- [ ] Verify public tracking works

---

## 🚨 Troubleshooting

### "Module not found" errors
```bash
pnpm install
pnpm dev
```

### "Database connection error"
- Check SUPABASE_URL and keys are correct
- Verify tables exist in Supabase dashboard
- Check RLS policies aren't blocking

### "Email not sending"
- Add RESEND_API_KEY to environment
- Check email format is valid
- Review Resend dashboard for errors

### "Payment page blank"
- Verify PAYSTACK_SECRET_KEY is set
- Check callback URL is correct
- Use test mode with test card

### ".env.local not recognized"
- Restart dev server: `pnpm dev`
- Clear cache: `rm -rf .next`
- Try: `npm run dev` instead of pnpm

---

## 🎯 Page Routes

**Public**
- `/` - Landing
- `/track` - Lookup
- `/track/[code]` - Details

**Auth**
- `/login` - Login
- `/register` - Register
- `/onboarding` - Setup

**App** (Protected)
- `/dashboard` - Home
- `/tickets` - Manage
- `/tickets/[id]` - Details
- `/customers` - Database
- `/invoices` - Payments
- `/settings` - Config

---

## 🔐 Security Tips

✅ Keep `.env.local` in `.gitignore` (already is)
✅ Never share SUPABASE_SERVICE_ROLE_KEY
✅ Keep PAYSTACK_SECRET_KEY private
✅ Don't commit secrets to GitHub
✅ Use environment variables in production

---

## 📊 What's Working

✅ Full UI/UX (all pages)
✅ Form validation
✅ Loading states
✅ Error handling
✅ Responsive design
✅ Type safety
✅ Database schema
✅ API integration ready
✅ Email ready (Resend)
✅ Payments ready (Paystack)

---

## ⚡ Quick Commands

```bash
# Development
pnpm dev              # Start dev server
pnpm build           # Build for production
pnpm start           # Run production build
pnpm lint            # Check code quality

# Database
# Run lib/database.sql in Supabase SQL Editor

# Deployment
git push origin main # Push to GitHub
# Then deploy via Vercel dashboard
```

---

## 🎓 Learn More

- Next.js: https://nextjs.org/docs
- TypeScript: https://www.typescriptlang.org/docs
- Supabase: https://supabase.com/docs
- Tailwind: https://tailwindcss.com/docs
- shadcn/ui: https://ui.shadcn.com

---

## ⏱️ Time Estimates

| Task | Time |
|------|------|
| Setup environment | 15 min |
| Create database | 15 min |
| Test locally | 30 min |
| Fix any issues | 30 min |
| Deploy to Vercel | 15 min |
| Test production | 20 min |
| **Total** | **2-3 hours** |

---

## 🎉 Success Indicators

You're ready to go live when:

✅ Can register and login
✅ Can create tickets
✅ Can create customers
✅ Can create invoices
✅ Payment test flow works
✅ Email sends (check Resend)
✅ Dashboard shows stats
✅ Public tracking works
✅ Mobile looks good
✅ No console errors

---

## 🚀 Next After Launch

1. Switch to Paystack live keys
2. Add custom domain
3. Configure email domain
4. Implement real authentication
5. Add more features
6. Monitor and optimize
7. Gather user feedback
8. Iterate and improve

---

## 📞 Need Help?

| Issue | Solution |
|-------|----------|
| Setup | See PRODUCTION_SETUP.md |
| Deployment | See DEPLOYMENT_CHECKLIST.md |
| Architecture | See ARCHITECTURE.md |
| Overview | See README.md |
| Feature list | See IMPLEMENTATION.md |

---

**Ready? Start here:**

1. Create `.env.local` with your keys
2. Run database schema
3. Start dev server
4. Register a shop
5. Test the system

**Then deploy using DEPLOYMENT_CHECKLIST.md**

Good luck! 🚀
