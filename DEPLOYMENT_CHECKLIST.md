# Inferno Repair - Quick Deployment Checklist

## ⏱️ Estimated Time: 2-3 hours (one-time setup)

## Phase 1: Get API Keys (30 minutes)

### Supabase
```
1. Go to https://supabase.com/dashboard
2. Sign up or login
3. Click "New Project"
4. Fill in details (project name, password, region)
5. Wait 5-10 minutes for creation
6. Go to Settings → API
7. Copy Project URL → NEXT_PUBLIC_SUPABASE_URL
8. Copy anon public key → NEXT_PUBLIC_SUPABASE_ANON_KEY
9. Copy service_role secret → SUPABASE_SERVICE_ROLE_KEY ⚠️ KEEP SECRET
```

### Resend
```
1. Go to https://resend.com/dashboard
2. Sign up or login
3. Verify email address
4. Go to API Keys
5. Create new API key
6. Copy key → RESEND_API_KEY
```

### Paystack
```
1. Go to https://dashboard.paystack.com
2. Sign up or login
3. Complete KYC verification
4. Go to Settings → API Keys & Webhooks
5. Copy Public Key (Test) → NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY
6. Copy Secret Key (Test) → PAYSTACK_SECRET_KEY
```

## Phase 2: Configure Environment (15 minutes)

```bash
# In your project root
cp .env.example .env.local

# Edit .env.local and add:
NEXT_PUBLIC_SUPABASE_URL=your_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key_here
SUPABASE_SERVICE_ROLE_KEY=your_key_here
RESEND_API_KEY=your_key_here
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=your_key_here
PAYSTACK_SECRET_KEY=your_key_here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Phase 3: Setup Database (15 minutes)

```
1. Open Supabase dashboard
2. Go to project → SQL Editor
3. Click "New Query"
4. Open lib/database.sql from your project
5. Copy entire contents
6. Paste into SQL editor
7. Click "Run"
8. Wait for confirmation (should see "Success")
9. Go to Tables section and verify 5 tables created:
   - shops
   - customers
   - tickets
   - invoices
   - team_members
```

## Phase 4: Test Locally (30 minutes)

```bash
# Install dependencies (if not done)
pnpm install

# Start dev server
pnpm dev

# Open http://localhost:3000

# Test flow:
1. Register new shop (fill form, submit)
2. Go through onboarding
3. Create first ticket
4. Check console for email log (Resend not sent in dev without key)
5. Create invoice
6. Test Paystack flow (use test card: 4111 1111 1111 1111)
7. Verify payment marks invoice as paid
8. Go to public track page, enter ticket code
9. Verify public can see ticket details
```

## Phase 5: Deploy to Vercel (45 minutes)

```bash
# 1. Push code to GitHub
git add .
git commit -m "Production ready setup"
git push origin main

# 2. In Vercel Dashboard
# Go to https://vercel.com
# Click "New Project"
# Select your GitHub repository
# Click Import

# 3. Configure Environment Variables
# In Vercel project settings → Environment Variables
# Add each variable from .env.local:
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
RESEND_API_KEY
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY
PAYSTACK_SECRET_KEY
NEXT_PUBLIC_APP_URL=https://yourdomain.vercel.app

# 4. Click "Deploy"
# Wait 2-5 minutes for build

# 5. Test production deployment
# Click "Visit" once deploy succeeds
# Run through same test flow as local
```

## Phase 6: Go Live (Optional - 30 minutes)

### Switch to Paystack Live Keys
```
1. Go to Paystack dashboard
2. Change from Test to Live mode
3. Copy Live Public Key
4. Copy Live Secret Key
5. Update in Vercel Environment Variables
6. Redeploy with "Redeploy" button
```

### Add Custom Domain (Optional)
```
1. In Vercel dashboard → Settings → Domains
2. Add your domain (yourshop.com)
3. Update DNS records as shown
4. Wait 24-48 hours for DNS propagation
5. Update NEXT_PUBLIC_APP_URL to your domain
```

### Enable Resend Email Domain
```
1. In Resend dashboard → Domains
2. Add custom domain
3. Update DNS DKIM/SPF records
4. Verify domain
5. Update FROM_EMAIL in lib/email.ts
```

## ✅ Post-Deployment Checklist

Run this checklist after deployment:

```
- [ ] Homepage loads (public landing page)
- [ ] Can register new shop
- [ ] Can login
- [ ] Dashboard shows (even if no data)
- [ ] Can create ticket
- [ ] Can add customer
- [ ] Email sent for ticket creation (check Resend dashboard)
- [ ] Can view ticket details
- [ ] Can add note to ticket
- [ ] Can create invoice
- [ ] Paystack payment flow works (test mode)
- [ ] Invoice marked as paid after payment
- [ ] Can view customers list
- [ ] Can search customers
- [ ] Can view invoices list
- [ ] Can see dashboard stats
- [ ] Public ticket tracking works (enter any ticket code)
- [ ] Settings page loads
- [ ] Can update support email in settings
- [ ] No errors in Vercel logs
- [ ] No errors in browser console
- [ ] Mobile layout works (test on phone)
- [ ] Light and dark mode toggle works
```

## 🚨 Common Issues & Fixes

### "Database connection error"
```
Solution:
- Check NEXT_PUBLIC_SUPABASE_URL is exactly copied
- Check NEXT_PUBLIC_SUPABASE_ANON_KEY has no extra spaces
- Verify in Vercel → Deployments → Function Logs
- Run database.sql again if tables missing
```

### "Email not sending"
```
Solution:
- Check RESEND_API_KEY in environment variables
- Use onboarding@resend.dev for testing first
- Check Resend dashboard → Emails section
- Verify sender email is configured
```

### "Payment page not loading"
```
Solution:
- Check PAYSTACK_SECRET_KEY is set
- Verify NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY is in .env
- Use test card in test mode: 4111 1111 1111 1111
- Check browser console for errors
- Verify callback URL is correct
```

### "Can't login to dashboard"
```
Solution:
- Use any email/password to register (development mode)
- Check local storage in DevTools if persisting issues
- For production auth, see ARCHITECTURE.md
```

## 📞 Support Resources

### Official Documentation
- Supabase: https://supabase.com/docs
- Resend: https://resend.com/docs
- Paystack: https://paystack.com/docs
- Next.js: https://nextjs.org/docs
- Vercel: https://vercel.com/docs

### Project Documentation
- README.md - Overview and setup
- PRODUCTION_SETUP.md - Detailed setup guide
- ARCHITECTURE.md - System design and flow
- IMPLEMENTATION.md - What was built

### Key Files for Reference
- `.env.example` - Environment template
- `lib/database.sql` - Database schema
- `lib/types.ts` - Type definitions
- `lib/actions/` - Server actions (CRUD)
- `lib/email.ts` - Email templates
- `lib/paystack.ts` - Payment API

## 🎯 Success Criteria

Your deployment is successful when:

1. ✅ All pages load without errors
2. ✅ Can create and view tickets
3. ✅ Data persists in Supabase database
4. ✅ Emails send via Resend
5. ✅ Paystack payment flow works
6. ✅ Dashboard shows real statistics
7. ✅ No 404 or redirect errors
8. ✅ Mobile responsive design works
9. ✅ Public ticket tracking accessible
10. ✅ Settings page saves support email

**When all 10 are passing: YOU'RE LIVE! 🎉**

---

## Quick Links (Bookmark These!)

- Supabase Dashboard: https://supabase.com/dashboard
- Resend Dashboard: https://resend.com/dashboard
- Paystack Dashboard: https://dashboard.paystack.com
- Vercel Dashboard: https://vercel.com/dashboard
- Project Repo: (your GitHub link)
- Live App: (will be your Vercel URL after deployment)

## Next Steps After Launch

1. Add more team members
2. Integrate Supabase Auth for real user management
3. Set up Paystack webhooks for automatic payment verification
4. Add analytics (PostHog/Mixpanel)
5. Enable real-time notifications with Supabase subscriptions
6. Create PDF invoice export
7. Build mobile app (React Native)
8. Add inventory management
9. Implement customer self-service portal
10. Create admin reporting dashboard

---

**Total Effort: ~2-3 hours for complete setup and deployment**

Good luck! 🚀
