/**
 * Test Turso Connection
 * Run this to verify your Turso setup works
 */

import { turso } from './turso';

async function testConnection() {
  try {
    console.log('Testing Turso connection...');
    
    // Simple test query
    const result = await turso.execute('SELECT 1 as test');
    
    console.log('✅ Turso connected successfully!');
    console.log('Result:', result);
    
    return true;
  } catch (error: any) {
    console.error('❌ Turso connection failed:');
    console.error(error.message);
    
    if (error.message.includes('Missing Turso environment variables')) {
      console.error('\n💡 Make sure you have in .env.local:');
      console.error('   TURSO_DATABASE_URL=libsql://...');
      console.error('   TURSO_AUTH_TOKEN=eyJ...');
    }
    
    return false;
  }
}

// Run if called directly
if (require.main === module) {
  testConnection().then((success) => {
    process.exit(success ? 0 : 1);
  });
}

export { testConnection };

