import { NextResponse } from 'next/server';
import { TIER_CONFIG } from '@/types/subscription';

export async function GET() {
  try {
    // Convert the tier config object to an array
    const tiers = Object.values(TIER_CONFIG);
    
    return NextResponse.json(tiers);
  } catch (error) {
    console.error('Error fetching tiers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subscription tiers' },
      { status: 500 }
    );
  }
} 