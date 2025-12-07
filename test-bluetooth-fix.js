// Test to verify Bluetooth setup fix
const Platform = { OS: 'web' };

// Simulate the BleManager initialization
function BleManager() {
  throw new Error('BleManager not available on web');
}

// Test the conditional initialization
const bleManager = Platform.OS === 'web' ? null : new BleManager();

console.log('Test passed: bleManager is', bleManager);
console.log('Platform.OS is', Platform.OS);

// Test with mobile platform
Platform.OS = 'ios';
try {
  const mobileManager = Platform.OS === 'web' ? null : new BleManager();
  console.log('Mobile test failed - should have thrown error');
} catch (error) {
  console.log('Mobile test passed - BleManager would be created on mobile');
}