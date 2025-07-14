#!/usr/bin/env node

/**
 * Stripe Mode Switcher
 * 
 * This script helps you switch between Stripe test and live modes
 * Usage: node scripts/stripe-mode-switch.js [test|live]
 */

const fs = require('fs');
const path = require('path');

const ENV_FILE = path.join(process.cwd(), '.env.local');

function updateEnvFile(mode) {
  if (!['test', 'live'].includes(mode)) {
    console.error('❌ Invalid mode. Use "test" or "live"');
    process.exit(1);
  }

  try {
    let envContent = '';
    
    if (fs.existsSync(ENV_FILE)) {
      envContent = fs.readFileSync(ENV_FILE, 'utf8');
    }

    // Update or add STRIPE_MODE
    if (envContent.includes('STRIPE_MODE=')) {
      envContent = envContent.replace(/STRIPE_MODE=.*/g, `STRIPE_MODE=${mode}`);
    } else {
      envContent += `\nSTRIPE_MODE=${mode}\n`;
    }

    fs.writeFileSync(ENV_FILE, envContent);
    
    console.log(`✅ Stripe mode switched to: ${mode.toUpperCase()}`);
    console.log(`📁 Updated: ${ENV_FILE}`);
    
    if (mode === 'live') {
      console.log('⚠️  WARNING: You are now in LIVE mode. Real payments will be processed!');
    } else {
      console.log('🧪 You are now in TEST mode. No real payments will be processed.');
    }
    
  } catch (error) {
    console.error('❌ Error updating environment file:', error.message);
    process.exit(1);
  }
}

function showCurrentMode() {
  try {
    if (fs.existsSync(ENV_FILE)) {
      const envContent = fs.readFileSync(ENV_FILE, 'utf8');
      const modeMatch = envContent.match(/STRIPE_MODE=(.+)/);
      if (modeMatch) {
        const currentMode = modeMatch[1].trim();
        console.log(`📊 Current Stripe mode: ${currentMode.toUpperCase()}`);
        
        if (currentMode === 'live') {
          console.log('⚠️  WARNING: LIVE mode is active - real payments will be processed!');
        } else {
          console.log('🧪 TEST mode is active - no real payments will be processed.');
        }
      } else {
        console.log('❓ STRIPE_MODE not found in .env.local (defaults to test)');
      }
    } else {
      console.log('❓ .env.local file not found (defaults to test mode)');
    }
  } catch (error) {
    console.error('❌ Error reading environment file:', error.message);
  }
}

// Command line interface
const args = process.argv.slice(2);
const command = args[0];

if (!command || command === 'status') {
  showCurrentMode();
} else if (command === 'test' || command === 'live') {
  updateEnvFile(command);
} else {
  console.log(`
🎯 Stripe Mode Switcher

Usage:
  node scripts/stripe-mode-switch.js [command]

Commands:
  test     Switch to test mode (safe for development)
  live     Switch to live mode (real payments!)
  status   Show current mode (default)

Examples:
  node scripts/stripe-mode-switch.js test
  node scripts/stripe-mode-switch.js live
  node scripts/stripe-mode-switch.js status
`);
} 