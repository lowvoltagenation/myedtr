# Stripe Setup Guide for MyEdtr Phase 2

## 🔧 Environment Variables Required

Add these environment variables to your `.env.local` file:

```bash
# Stripe Keys
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Stripe Price IDs (create these in Stripe Dashboard)
STRIPE_PRO_PRICE_ID=price_...
STRIPE_FEATURED_PRICE_ID=price_...
```

## 📋 Stripe Dashboard Setup

### 1. Create Products and Prices

#### Pro Plan ($29/month)
```
Product Name: "MyEdtr Pro"
Description: "Core professional features for serious editors"
Price: $29.00 USD / month
Price ID: Copy this to STRIPE_PRO_PRICE_ID
```

#### Featured Plan ($59/month)  
```
Product Name: "MyEdtr Featured"
Description: "Premium tier with maximum visibility and features"
Price: $59.00 USD / month
Price ID: Copy this to STRIPE_FEATURED_PRICE_ID
```

### 2. Configure Webhooks

Add webhook endpoint: `https://your-domain.com/api/stripe/webhooks`

**Events to listen for:**
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_succeeded`
- `invoice.payment_failed`

Copy the webhook signing secret to `STRIPE_WEBHOOK_SECRET`.

### 3. Enable Customer Portal

Configure the Customer Portal in Stripe Dashboard:
- Enable subscription management
- Enable payment method updates
- Set return URL to your settings page

## 🔗 Integration Points

### Checkout Flow
- User clicks "Get Started" on pricing page
- Creates Stripe Checkout session via `/api/stripe/create-checkout-session`
- Redirects to Stripe-hosted checkout
- Handles success/cancel redirects back to pricing page

### Subscription Management
- "Manage Subscription" buttons redirect to Stripe Customer Portal
- Portal handles plan changes, payment methods, billing history
- Webhooks keep database in sync with Stripe

### Database Sync
- Webhooks update `subscriptions` table with Stripe data
- `users.current_tier_id` updated based on subscription status
- Usage limits enforced based on active tier

## 🧪 Testing

### Test Card Numbers
- Success: `4242424242424242`
- Declined: `4000000000000002`
- 3D Secure: `4000002500003155`

### Test Workflow
1. Use test Stripe keys in development
2. Create test subscriptions with test cards
3. Verify webhook events in Stripe Dashboard
4. Check database updates in Supabase
5. Test subscription management flows

## 🚀 Phase 2 Implementation Status

### ✅ Completed Infrastructure
- [x] Stripe configuration setup (`src/lib/stripe/config.ts`)
- [x] Client-side Stripe integration (`src/lib/stripe/client.ts`)
- [x] Stripe service layer (`src/lib/stripe/service.ts`)
- [x] API endpoints for checkout and portal sessions
- [x] Webhook handling for subscription events
- [x] Updated pricing page with Stripe integration
- [x] React hooks for Stripe operations (`src/hooks/useStripe.ts`)

### 🔄 Next Steps
1. **Configure Stripe Account**: Set up products, prices, and webhooks
2. **Add Environment Variables**: Configure all required Stripe keys
3. **Test Payment Flow**: Verify end-to-end subscription process
4. **Deploy Webhooks**: Ensure webhook endpoint is accessible
5. **Test Database Sync**: Confirm subscription data updates correctly

### 🎯 Success Criteria
- [ ] Users can subscribe to Pro and Featured plans
- [ ] Subscription status syncs between Stripe and database
- [ ] Users can manage subscriptions via Customer Portal
- [ ] Feature access updates based on subscription tier
- [ ] Failed payments and cancellations handled gracefully

---

**Ready for testing once Stripe account is configured!** 🚀 