# Contract Verifier Examples

## 1. Basic Contract Verification

```bash
# Verify a simple contract without constructor arguments
contract-verifier verify \
  --network polygon \
  --address 0x1234567890123456789012345678901234567890 \
  --source ./examples/SimpleStorage.sol \
  --contract SimpleStorage \
  --version v0.8.19+commit.e7d8d7db
```

## 2. Contract with Constructor Arguments

```bash
# Verify contract with constructor arguments
# If constructor takes (uint256 _initialValue) and you deployed with value 100:
# The hex encoded argument would be: 0x0000000000000000000000000000000000000000000000000000000000000064

contract-verifier verify \
  --network ethereum \
  --address 0x1234567890123456789012345678901234567890 \
  --source ./examples/SimpleStorage.sol \
  --contract SimpleStorage \
  --version v0.8.19+commit.e7d8d7db \
  --args 0x0000000000000000000000000000000000000000000000000000000000000064
```

## 3. Optimized Contract

```bash
# Verify contract compiled with optimization
contract-verifier verify \
  --network bsc \
  --address 0x1234567890123456789012345678901234567890 \
  --source ./examples/SimpleStorage.sol \
  --contract SimpleStorage \
  --version v0.8.19+commit.e7d8d7db \
  --optimized \
  --runs 1000
```

## 4. Contract with Specific EVM Version

```bash
# Verify contract with specific EVM version
contract-verifier verify \
  --network arbitrum \
  --address 0x1234567890123456789012345678901234567890 \
  --source ./examples/SimpleStorage.sol \
  --contract SimpleStorage \
  --version v0.8.19+commit.e7d8d7db \
  --evm-version london
```

## 5. Constructor Argument Encoding Examples

### Single uint256 argument (value: 100)
```bash
--args 0x0000000000000000000000000000000000000000000000000000000000000064
```

### Address argument (address: 0x742d35Cc6634C0532925a3b8D82d8C20C2f84c3c)
```bash
--args 0x000000000000000000000000742d35cc6634c0532925a3b8d82d8c20c2f84c3c
```

### String argument (value: "Hello World")
```bash
--args 0x00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000000b48656c6c6f20576f726c64000000000000000000000000000000000000000000
```

### Multiple arguments (uint256: 100, address: 0x742d35Cc6634C0532925a3b8D82d8C20C2f84c3c)
```bash
--args 0x0000000000000000000000000000000000000000000000000000000000000064000000000000000000000000742d35cc6634c0532925a3b8d82d8c20c2f84c3c
```

## 6. Programmatic Usage Example

```javascript
const ContractVerifier = require('contract-verifier');

async function verifyContract() {
  const verifier = new ContractVerifier();
  
  try {
    const result = await verifier.verifyContract({
      network: 'polygon',
      address: '0x1234567890123456789012345678901234567890',
      sourcePath: './examples/SimpleStorage.sol',
      contractName: 'SimpleStorage',
      compilerVersion: 'v0.8.19+commit.e7d8d7db',
      constructorArgs: '0x0000000000000000000000000000000000000000000000000000000000000064',
      optimized: true,
      runs: 200
    });

    if (result.success) {
      console.log('✅ Contract verified successfully!');
    } else {
      console.error('❌ Verification failed:', result.message);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

verifyContract();
```

## 7. Hardhat Integration Example

```javascript
// hardhat.config.js
const { task } = require("hardhat/config");
const ContractVerifier = require('contract-verifier');

task("verify-custom", "Verify contract with contract-verifier")
  .addParam("address", "Contract address")
  .addParam("contract", "Contract name")
  .addOptionalParam("network", "Network name", "ethereum")
  .setAction(async (taskArgs, hre) => {
    const verifier = new ContractVerifier();
    
    // Get compiler version from Hardhat config
    const compilerVersion = hre.config.solidity.compilers[0].version;
    
    const result = await verifier.verifyContract({
      network: taskArgs.network,
      address: taskArgs.address,
      sourcePath: `./contracts/${taskArgs.contract}.sol`,
      contractName: taskArgs.contract,
      compilerVersion: `v${compilerVersion}+commit.e7d8d7db`,
      optimized: hre.config.solidity.settings?.optimizer?.enabled || false,
      runs: hre.config.solidity.settings?.optimizer?.runs || 200
    });

    if (result.success) {
      console.log("✅ Contract verified successfully!");
    } else {
      console.error("❌ Verification failed:", result.message);
    }
  });
```

## 8. Common Error Solutions

### API Key Not Found
```bash
# Make sure your .env file has the correct API key
ETHERSCAN_API_KEY=your_actual_api_key_here
```

### Invalid Contract Address
```bash
# Address must be a valid Ethereum address (42 characters starting with 0x)
--address 0x1234567890123456789012345678901234567890
```

### Source File Not Found
```bash
# Use absolute path or relative path from current directory
--source ./contracts/MyContract.sol
# or
--source /full/path/to/MyContract.sol
```

### Compiler Version Mismatch
```bash
# Get exact compiler version from your build artifacts
# Format: v{version}+commit.{commit_hash}
--version v0.8.19+commit.e7d8d7db
```

## 9. Getting Compiler Version

### From Hardhat
```bash
# Check hardhat.config.js
npx hardhat compile --show-stack-traces
```

### From Foundry
```bash
# Check foundry.toml or use forge
forge --version
```

### From Remix
```
// Check the compiler tab in Remix IDE
// Look for the version in compilation details
```

## 10. Network-Specific Examples

### Ethereum Mainnet
```bash
contract-verifier verify \
  --network ethereum \
  --address 0x... \
  --source ./Contract.sol \
  --contract MyContract \
  --version v0.8.19+commit.e7d8d7db
```

### Polygon
```bash
contract-verifier verify \
  --network polygon \
  --address 0x... \
  --source ./Contract.sol \
  --contract MyContract \
  --version v0.8.19+commit.e7d8d7db
```

### Arbitrum
```bash
contract-verifier verify \
  --network arbitrum \
  --address 0x... \
  --source ./Contract.sol \
  --contract MyContract \
  --version v0.8.19+commit.e7d8d7db
```

### Base
```bash
contract-verifier verify \
  --network base \
  --address 0x... \
  --source ./Contract.sol \
  --contract MyContract \
  --version v0.8.19+commit.e7d8d7db
```
