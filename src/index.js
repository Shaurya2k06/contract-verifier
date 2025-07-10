const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');
require('dotenv').config();

class ContractVerifier {
  constructor() {
    this.networks = {
      ethereum: {
        name: 'Ethereum',
        url: 'https://api.etherscan.io/api',
        apiKey: process.env.ETHERSCAN_API_KEY,
        explorerUrl: 'https://etherscan.io'
      },
      polygon: {
        name: 'Polygon',
        url: 'https://api.polygonscan.com/api',
        apiKey: process.env.POLYGONSCAN_API_KEY,
        explorerUrl: 'https://polygonscan.com'
      },
      bsc: {
        name: 'BNB Smart Chain',
        url: 'https://api.bscscan.com/api',
        apiKey: process.env.BSCSCAN_API_KEY,
        explorerUrl: 'https://bscscan.com'
      },
      arbitrum: {
        name: 'Arbitrum',
        url: 'https://api.arbiscan.io/api',
        apiKey: process.env.ARBISCAN_API_KEY,
        explorerUrl: 'https://arbiscan.io'
      },
      optimism: {
        name: 'Optimism',
        url: 'https://api-optimistic.etherscan.io/api',
        apiKey: process.env.OPTIMISM_API_KEY,
        explorerUrl: 'https://optimistic.etherscan.io'
      },
      base: {
        name: 'Base',
        url: 'https://api.basescan.org/api',
        apiKey: process.env.BASESCAN_API_KEY,
        explorerUrl: 'https://basescan.org'
      }
    };
  }

  async verifyContract(options) {
    const {
      network,
      address,
      sourcePath,
      contractName,
      compilerVersion,
      constructorArgs = '',
      optimized = false,
      runs = 200,
      evmVersion = 'default'
    } = options;

    try {
      // Validate network
      if (!this.networks[network]) {
        throw new Error(`Unsupported network: ${network}. Supported networks: ${Object.keys(this.networks).join(', ')}`);
      }

      const networkConfig = this.networks[network];
      
      // Check API key
      if (!networkConfig.apiKey) {
        throw new Error(`API key not found for ${networkConfig.name}. Please set ${network.toUpperCase()}_API_KEY in your .env file`);
      }

      // Validate contract address
      if (!this.isValidAddress(address)) {
        throw new Error(`Invalid contract address: ${address}`);
      }

      // Read source code
      const sourceCode = await this.readSourceCode(sourcePath);
      
      // Prepare verification request
      const verificationData = {
        module: 'contract',
        action: 'verifysourcecode',
        apikey: networkConfig.apiKey,
        contractaddress: address,
        sourceCode: sourceCode,
        codeformat: 'solidity-single-file',
        contractname: contractName,
        compilerversion: compilerVersion,
        optimizationUsed: optimized ? '1' : '0',
        runs: runs.toString(),
        constructorArguements: constructorArgs,
        evmversion: evmVersion
      };

      console.log(`🔍 Verifying contract ${contractName} on ${networkConfig.name}...`);
      console.log(`📍 Contract Address: ${address}`);
      console.log(`🔧 Compiler Version: ${compilerVersion}`);
      console.log(`⚙️  Optimization: ${optimized ? 'Enabled' : 'Disabled'} ${optimized ? `(${runs} runs)` : ''}`);
      
      // Submit verification
      const response = await this.submitVerification(network, verificationData);
      
      if (response.status === '1') {
        console.log(`✅ Verification submitted successfully!`);
        console.log(`📄 GUID: ${response.result}`);
        
        // Poll for verification status
        const finalStatus = await this.pollVerificationStatus(network, response.result);
        
        if (finalStatus.success) {
          console.log(`🎉 Contract verified successfully on ${networkConfig.name}!`);
          console.log(`🔗 View on explorer: ${networkConfig.explorerUrl}/address/${address}#code`);
        }
        
        return finalStatus;
      } else {
        throw new Error(`Verification failed: ${response.message || response.result}`);
      }

    } catch (error) {
      console.error(`❌ Error: ${error.message}`);
      throw error;
    }
  }

  async readSourceCode(sourcePath) {
    try {
      if (!await fs.pathExists(sourcePath)) {
        throw new Error(`Source file not found: ${sourcePath}`);
      }

      const sourceCode = await fs.readFile(sourcePath, 'utf8');
      
      if (!sourceCode.trim()) {
        throw new Error(`Source file is empty: ${sourcePath}`);
      }

      return sourceCode;
    } catch (error) {
      throw new Error(`Failed to read source file: ${error.message}`);
    }
  }

  async submitVerification(network, data) {
    const config = this.networks[network];
    
    try {
      const response = await axios.post(config.url, new URLSearchParams(data), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        timeout: 30000 // 30 second timeout
      });

      return response.data;
    } catch (error) {
      if (error.response) {
        throw new Error(`API request failed: ${error.response.status} ${error.response.statusText}`);
      } else if (error.request) {
        throw new Error(`Network error: Unable to reach ${config.name} API`);
      } else {
        throw new Error(`Request error: ${error.message}`);
      }
    }
  }

  async pollVerificationStatus(network, guid, maxAttempts = 12) {
    const config = this.networks[network];
    let attempts = 0;

    console.log(`⏳ Polling verification status...`);

    while (attempts < maxAttempts) {
      try {
        const response = await axios.get(config.url, {
          params: {
            module: 'contract',
            action: 'checkverifystatus',
            guid: guid,
            apikey: config.apiKey
          },
          timeout: 10000
        });

        const status = response.data.result;
        
        if (status === 'Success') {
          return { success: true, status: 'verified', message: 'Contract verified successfully' };
        } else if (status === 'Fail') {
          return { 
            success: false, 
            status: 'failed', 
            message: response.data.message || 'Verification failed'
          };
        } else if (status.includes('Pending')) {
          console.log(`⏳ Verification pending... (${attempts + 1}/${maxAttempts})`);
          await this.sleep(5000); // Wait 5 seconds
        } else {
          console.log(`🔄 Status: ${status} (${attempts + 1}/${maxAttempts})`);
          await this.sleep(5000);
        }
      } catch (error) {
        console.error(`Error checking status: ${error.message}`);
        await this.sleep(5000);
      }

      attempts++;
    }

    return { 
      success: false, 
      status: 'timeout', 
      message: 'Verification timeout - check manually on explorer'
    };
  }

  isValidAddress(address) {
    // Basic Ethereum address validation
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Method to get supported networks
  getSupportedNetworks() {
    return Object.keys(this.networks);
  }

  // Method to get network info
  getNetworkInfo(network) {
    return this.networks[network];
  }

  // Method to encode constructor arguments
  encodeConstructorArgs(types, values) {
    if (!types || !values || types.length !== values.length) {
      throw new Error('Types and values arrays must have the same length');
    }

    if (types.length === 0) {
      return '';
    }

    let encoded = '0x';
    
    for (let i = 0; i < types.length; i++) {
      const type = types[i];
      const value = values[i];
      
      switch (type) {
        case 'uint256':
          encoded += this.encodeUint256(value);
          break;
        case 'address':
          encoded += this.encodeAddress(value);
          break;
        case 'string':
          encoded += this.encodeString(value);
          break;
        default:
          throw new Error(`Unsupported type: ${type}`);
      }
    }
    
    return encoded;
  }

  // Encode uint256 value
  encodeUint256(value) {
    const num = BigInt(value);
    return num.toString(16).padStart(64, '0');
  }

  // Encode address value
  encodeAddress(address) {
    if (!this.isValidAddress(address)) {
      throw new Error(`Invalid address: ${address}`);
    }
    return address.slice(2).toLowerCase().padStart(64, '0');
  }

  // Encode string value (simplified)
  encodeString(str) {
    // This is a simplified string encoding - for production use, consider using ethers.js
    const hex = Buffer.from(str, 'utf8').toString('hex');
    const length = hex.length / 2;
    const lengthHex = length.toString(16).padStart(64, '0');
    const paddedHex = hex.padEnd(Math.ceil(hex.length / 64) * 64, '0');
    return lengthHex + paddedHex;
  }

  // Get contract verification status
  async getVerificationStatus(network, address) {
    const config = this.networks[network];
    
    if (!config) {
      throw new Error(`Unsupported network: ${network}`);
    }

    if (!config.apiKey) {
      throw new Error(`API key not found for ${network}`);
    }

    try {
      const response = await axios.get(config.url, {
        params: {
          module: 'contract',
          action: 'getsourcecode',
          address: address,
          apikey: config.apiKey
        }
      });

      const result = response.data.result[0];
      
      if (result.SourceCode) {
        return {
          verified: true,
          contractName: result.ContractName,
          compilerVersion: result.CompilerVersion,
          optimizationUsed: result.OptimizationUsed === '1',
          runs: result.Runs,
          sourceCode: result.SourceCode
        };
      } else {
        return {
          verified: false,
          message: 'Contract source code not verified'
        };
      }
    } catch (error) {
      throw new Error(`Failed to check verification status: ${error.message}`);
    }
  }

  // Validate compiler version format
  isValidCompilerVersion(version) {
    // Format: v0.8.19+commit.e7d8d7db or similar
    return /^v\d+\.\d+\.\d+\+commit\.[a-f0-9]+$/.test(version);
  }

  // Get available compiler versions from API
  async getCompilerVersions(network = 'ethereum') {
    const config = this.networks[network];
    
    if (!config) {
      throw new Error(`Unsupported network: ${network}`);
    }

    try {
      const response = await axios.get(config.url, {
        params: {
          module: 'contract',
          action: 'solcversions',
          apikey: config.apiKey
        }
      });

      if (response.data.status === '1') {
        return response.data.result;
      } else {
        throw new Error('Failed to fetch compiler versions');
      }
    } catch (error) {
      throw new Error(`Failed to get compiler versions: ${error.message}`);
    }
  }
}

module.exports = ContractVerifier;
