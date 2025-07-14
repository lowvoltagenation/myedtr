import { NextResponse } from 'next/server';
import { getStripeInfo } from '@/lib/stripe/config';

export async function GET() {
  try {
    const info = getStripeInfo();
    
    return NextResponse.json({
      ...info,
      timestamp: new Date().toISOString(),
      message: info.isConfigured 
        ? `✅ Stripe is configured in ${info.mode} mode using modern price_data approach`
        : `❌ Stripe is not properly configured in ${info.mode} mode`,
    });
  } catch (error) {
    console.error('Error getting Stripe info:', error);
    return NextResponse.json(
      { error: 'Failed to get Stripe configuration info' },
      { status: 500 }
    );
  }
} 