# Stripe Setup Guide for MyEdtr Phase 2

This guide covers setting up Stripe for both test and live modes in your application.

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

## Environment Variables

### Stripe Mode Selection

Set the Stripe mode using the `STRIPE_MODE` environment variable:

```bash
# Use test mode (default)
STRIPE_MODE=test

# Use live mode
STRIPE_MODE=live
```

### Test Mode Keys

For development and testing, set up your test mode keys:

```bash
# Test mode keys
STRIPE_TEST_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_TEST_PUBLISHABLE_KEY=pk_test_...
STRIPE_TEST_WEBHOOK_SECRET=whsec_...

# Test mode plan price IDs (optional, will fallback to generic ones)
STRIPE_TEST_PRO_PRICE_ID=price_...
STRIPE_TEST_FEATURED_PRICE_ID=price_...
```

### Live Mode Keys

For production, set up your live mode keys:

```bash
# Live mode keys
STRIPE_LIVE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_LIVE_PUBLISHABLE_KEY=pk_live_...
STRIPE_LIVE_WEBHOOK_SECRET=whsec_...

# Live mode plan price IDs (optional, will fallback to generic ones)
STRIPE_LIVE_PRO_PRICE_ID=price_...
STRIPE_LIVE_FEATURED_PRICE_ID=price_...
```

### Fallback Keys (Optional)

You can also set generic keys that will be used as fallbacks:

```bash
# Generic keys (used as fallback if mode-specific keys are not available)
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Generic plan price IDs
STRIPE_PRO_PRICE_ID=price_...
STRIPE_FEATURED_PRICE_ID=price_...
```

## How It Works

1. **Mode Detection**: The system checks the `STRIPE_MODE` environment variable (defaults to "test")
2. **Key Selection**: Based on the mode, it selects the appropriate keys:
   - Test mode: Uses `STRIPE_TEST_*` keys
   - Live mode: Uses `STRIPE_LIVE_*` keys
3. **Fallback**: If mode-specific keys are not found, it falls back to generic `STRIPE_*` keys
4. **Validation**: The system validates that all required keys are present before initializing

## Configuration Status

You can check your Stripe configuration status by:

1. **API Endpoint**: Visit `/api/stripe/config` to see configuration details
2. **Test Page**: Visit `/test-stripe` to see a visual configuration dashboard

## Switching Between Modes

### Development
```bash
# Test with test keys
STRIPE_MODE=test npm run dev

# Test with live keys (be careful!)
STRIPE_MODE=live npm run dev
```

### Production
```bash
# Always use live mode in production
STRIPE_MODE=live
```

## Security Best Practices

1. **Never commit real keys** to version control
2. **Use different webhook endpoints** for test and live modes
3. **Test thoroughly** in test mode before switching to live
4. **Monitor webhook logs** to ensure proper event handling
5. **Use environment-specific** price IDs for different plans

## Webhook Setup

Set up separate webhook endpoints for test and live modes:

### Test Mode Webhook
- URL: `https://your-domain.com/api/stripe/webhooks`
- Events: `customer.subscription.*`, `invoice.payment_*`
- Use `STRIPE_TEST_WEBHOOK_SECRET`

### Live Mode Webhook
- URL: `https://your-domain.com/api/stripe/webhooks` (same endpoint)
- Events: `customer.subscription.*`, `invoice.payment_*`
- Use `STRIPE_LIVE_WEBHOOK_SECRET`

## Troubleshooting

### Common Issues

1. **"Stripe not initialized" error**
   - Check that your mode-specific keys are set correctly
   - Verify the `STRIPE_MODE` environment variable

2. **"Missing price ID" error**
   - Ensure you have price IDs set for your current mode
   - Check both mode-specific and generic price ID variables

3. **Webhook signature verification failed**
   - Verify you're using the correct webhook secret for your mode
   - Ensure the webhook secret matches your Stripe dashboard

### Debug Information

The application logs include mode information to help with debugging:
- All Stripe operations log the current mode
- Webhook events include mode tracking in metadata
- Configuration status is available via the API endpoint

## Environment Variable Summary

### Required for Test Mode
```bash
STRIPE_MODE=test
STRIPE_TEST_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_TEST_PUBLISHABLE_KEY=pk_test_...
STRIPE_TEST_WEBHOOK_SECRET=whsec_...
```

### Required for Live Mode
```bash
STRIPE_MODE=live
STRIPE_LIVE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_LIVE_PUBLISHABLE_KEY=pk_live_...
STRIPE_LIVE_WEBHOOK_SECRET=whsec_...
```

### Optional (Plan-specific Price IDs)
```bash
# Test mode plans
STRIPE_TEST_PRO_PRICE_ID=price_...
STRIPE_TEST_FEATURED_PRICE_ID=price_...

# Live mode plans
STRIPE_LIVE_PRO_PRICE_ID=price_...
STRIPE_LIVE_FEATURED_PRICE_ID=price_...
``` 