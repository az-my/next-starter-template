#!/usr/bin/env node

/**
 * Test script to verify OAuth configuration
 * Run with: node scripts/test-oauth.js
 */

// Load environment variables from .env.local
require('dotenv').config({ path: '.env.local' });

const requiredEnvVars = [
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET'
];

const optionalEnvVars = [
  'GOOGLE_DRIVE_FOLDER_ID',
  'NEXT_PUBLIC_APP_URL'
];

console.log('🔍 Checking OAuth Configuration...\n');

// Check required environment variables
console.log('Required Environment Variables:');
let allRequiredPresent = true;
requiredEnvVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    console.log(`  ✅ ${varName}: ${value.substring(0, 8)}...`);
  } else {
    console.log(`  ❌ ${varName}: MISSING`);
    allRequiredPresent = false;
  }
});

console.log('\nOptional Environment Variables:');
optionalEnvVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    console.log(`  ✅ ${varName}: ${value}`);
  } else {
    console.log(`  ⚠️  ${varName}: Not set`);
  }
});

console.log('\nEnvironment:');
console.log(`  NODE_ENV: ${process.env.NODE_ENV || 'development'}`);

// Test redirect URI generation
console.log('\nRedirect URI Test:');
const isDevelopment = process.env.NODE_ENV === 'development';
const baseUrl = isDevelopment 
  ? 'http://localhost:3000' 
  : process.env.NEXT_PUBLIC_APP_URL;

if (baseUrl) {
  const redirectUri = `${baseUrl}/drive-upload`;
  console.log(`  ✅ Redirect URI: ${redirectUri}`);
} else {
  console.log('  ❌ Cannot determine redirect URI - NEXT_PUBLIC_APP_URL not set for production');
}

console.log('\n📋 Summary:');
if (allRequiredPresent) {
  console.log('  ✅ All required environment variables are present');
  console.log('  🚀 OAuth should work correctly');
} else {
  console.log('  ❌ Missing required environment variables');
  console.log('  🔧 Please set the missing variables and try again');
}

console.log('\n📖 For setup instructions, see: OAUTH_SETUP.md'); 