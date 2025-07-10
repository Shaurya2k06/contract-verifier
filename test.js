const ContractVerifier = require('./src/index');

async function testContractVerifier() {
  console.log('🧪 Testing Contract Verifier...\n');
  
  const verifier = new ContractVerifier();
  
  // Test 1: Get supported networks
  console.log('✅ Test 1: Get supported networks');
  const networks = verifier.getSupportedNetworks();
  console.log('Networks:', networks);
  console.log('');
  
  // Test 2: Get network info
  console.log('✅ Test 2: Get network info');
  const ethInfo = verifier.getNetworkInfo('ethereum');
  console.log('Ethereum info:', ethInfo);
  console.log('');
  
  // Test 3: Address validation
  console.log('✅ Test 3: Address validation');
  console.log('Valid address:', verifier.isValidAddress('0x742d35Cc6634C0532925a3b8D82d8C20C2f84c3c'));
  console.log('Invalid address:', verifier.isValidAddress('0x123'));
  console.log('');
  
  // Test 4: Read source file
  console.log('✅ Test 4: Read source file');
  try {
    const sourceCode = await verifier.readSourceCode('./examples/SimpleStorage.sol');
    console.log('Source code length:', sourceCode.length);
    console.log('Source code preview:', sourceCode.substring(0, 100) + '...');
  } catch (error) {
    console.log('Error reading source:', error.message);
  }
  console.log('');
  
  console.log('🎉 All tests completed!');
}

testContractVerifier().catch(console.error);
