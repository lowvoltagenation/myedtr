# Stripe Setup Guide

This guide explains how to configure Stripe payments for MyEdtr using the modern `price_data` approach.

## Modern Approach: No Manual Product Setup Required

MyEdtr now uses Stripe's modern `price_data` approach, which means:

- ✅ **No need to create products in Stripe dashboard**
- ✅ **No price ID environment variables required**
- ✅ **Pricing is defined inline using `price_data`**
- ✅ **Easier to maintain and update**
- ✅ **Works seamlessly in both test and live modes**

## Plan Configuration

The subscription plans are defined in the codebase:

- **MyEdtr Pro**: $29/month - Core professional features for serious editors
- **MyEdtr Featured**: $59/month - Premium tier with maximum visibility and features

## Environment Variables

### Required Variables

You need to set these environment variables in your `.env.local` file:

#### For Test Mode (Default)
```bash
# Stripe Configuration
STRIPE_MODE=test

# Test mode keys
STRIPE_TEST_SECRET_KEY=sk_test_...
STRIPE_TEST_PUBLISHABLE_KEY=pk_test_...
NEXT_PUBLIC_STRIPE_TEST_PUBLISHABLE_KEY=pk_test_...
STRIPE_TEST_WEBHOOK_SECRET=whsec_...
```

#### For Live Mode (Production)
```bash
# Stripe Configuration
STRIPE_MODE=live

# Live mode keys
STRIPE_LIVE_SECRET_KEY=sk_live_...
STRIPE_LIVE_PUBLISHABLE_KEY=pk_live_...
NEXT_PUBLIC_STRIPE_LIVE_PUBLISHABLE_KEY=pk_live_...
STRIPE_LIVE_WEBHOOK_SECRET=whsec_...
```

## Getting Your Stripe Keys

### 1. Go to Stripe Dashboard

- **Test Mode**: https://dashboard.stripe.com/test/apikeys
- **Live Mode**: https://dashboard.stripe.com/apikeys

### 2. Copy Your Keys

1. **Publishable Key**: Starts with `pk_test_` or `pk_live_`
2. **Secret Key**: Starts with `sk_test_` or `sk_live_`

### 3. Set Up Webhooks

1. Go to https://dashboard.stripe.com/test/webhooks (or live version)
2. Create a new webhook endpoint
3. Set the endpoint URL to: `https://your-domain.com/api/stripe/webhooks`
4. Select the following events:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Copy the webhook secret (starts with `whsec_`)

## Mode Switching

### Development Environment

Use the provided scripts to switch between test and live modes:

```bash
# Switch to test mode
npm run stripe:test

# Switch to live mode (use with caution)
npm run stripe:live

# Check current mode
npm run stripe:status
```

### Production Environment

Set the `STRIPE_MODE` environment variable:

```bash
# For test mode (safe for staging)
STRIPE_MODE=test

# For live mode (production only)
STRIPE_MODE=live
```

## Testing

### Test Cards

Use these test card numbers in test mode:

- **Success**: `4242424242424242`
- **Declined**: `4000000000000002`
- **Requires 3D Secure**: `4000002500003155`

### Testing Webhooks

Use Stripe CLI to test webhooks locally:

```bash
# Install Stripe CLI
npm install -g stripe-cli

# Login to Stripe
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:3000/api/stripe/webhooks
```

### Manual Sync (Development)

In test mode, webhooks may not be automatically triggered. MyEdtr includes a manual sync feature:

1. **Automatic sync**: After successful payments, subscription data refreshes automatically
2. **Manual sync button**: If status doesn't update, use the "Refresh Status" button
3. **Sync API**: Call `POST /api/stripe/sync-subscription` to manually sync with Stripe
4. **Debug mode**: Development builds show webhook status and sync options

### Common Development Issues

#### Subscription Status Not Updating

**Cause**: Webhooks not triggered in test mode

**Solutions**:
1. **Use manual sync**: Click "Refresh Status" after payment
2. **Set up webhook forwarding**: Use Stripe CLI (see above)
3. **Check debug info**: Development mode shows sync status
4. **API sync**: Call the sync endpoint directly

#### Test Mode Payments

**Cause**: Real webhooks aren't sent in test mode without forwarding

**Solutions**:
1. **Stripe CLI forwarding**: Recommended for webhook testing
2. **Manual refresh**: Use built-in sync functionality
3. **Database check**: Verify subscription records directly

## Debugging

### Debug Tools

1. **Debug Page**: Visit `/debug-stripe` to check your configuration
2. **API Endpoint**: Call `/api/stripe/debug` to get configuration status
3. **Pricing Page**: Debug component shows current mode (development only)

### Common Issues

1. **"Stripe not initialized"**: Missing environment variables
2. **"Invalid plan"**: Plan not found in configuration
3. **"No Stripe customer found"**: User doesn't have a subscription record

### Verification Checklist

- [ ] Environment variables are set for current mode
- [ ] Publishable keys start with `pk_test_` or `pk_live_`
- [ ] Secret keys start with `sk_test_` or `sk_live_`
- [ ] Webhook secret starts with `whsec_`
- [ ] Webhook endpoint is configured in Stripe dashboard
- [ ] Required webhook events are selected
- [ ] Application restarted after environment changes

## Security Notes

### Production Deployment

1. **Never commit API keys to version control**
2. **Use environment variables for all sensitive data**
3. **Test thoroughly in test mode before going live**
4. **Monitor webhooks for delivery failures**
5. **Set up proper error handling and logging**

### Key Management

- Store keys in your hosting platform's environment variables
- Use different keys for different environments
- Rotate keys periodically
- Monitor key usage in Stripe dashboard

## Migration from Old Approach

If you're migrating from the old approach that required price IDs:

1. Remove these environment variables (no longer needed):
   - `STRIPE_TEST_PRO_PRICE_ID`
   - `STRIPE_TEST_FEATURED_PRICE_ID`
   - `STRIPE_LIVE_PRO_PRICE_ID`
   - `STRIPE_LIVE_FEATURED_PRICE_ID`

2. Keep these environment variables:
   - All the API keys (secret, publishable, webhook)
   - `STRIPE_MODE` setting

3. Products created in Stripe dashboard are no longer needed (but won't hurt if left)

## Support

If you encounter issues:

1. Check the debug page at `/debug-stripe`
2. Verify all environment variables are set correctly
3. Test webhook delivery in Stripe dashboard
4. Check application logs for specific error messages

The modern approach eliminates most common configuration issues by removing the need for manual product setup! 