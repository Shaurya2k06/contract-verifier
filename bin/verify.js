#!/usr/bin/env node

const { Command } = require('commander');
const ContractVerifier = require('../src/index');
const path = require('path');

const program = new Command();

program
  .name('contract-verifier')
  .description('CLI tool to verify smart contracts on block explorers')
  .version('1.0.0');

program
  .command('verify')
  .description('Verify a smart contract on a block explorer')
  .requiredOption('-n, --network <network>', 'Network (ethereum, polygon, bsc, arbitrum, optimism, base)')
  .requiredOption('-a, --address <address>', 'Contract address (0x...)')
  .requiredOption('-s, --source <path>', 'Path to source file (.sol)')
  .requiredOption('-c, --contract <name>', 'Contract name (must match the contract name in source)')
  .requiredOption('-v, --version <version>', 'Compiler version (e.g., v0.8.19+commit.e7d8d7db)')
  .option('--args <args>', 'Constructor arguments (hex encoded)', '')
  .option('--optimized', 'Enable optimization', false)
  .option('--runs <runs>', 'Optimization runs', '200')
  .option('--evm-version <version>', 'EVM version (default, london, berlin, etc.)', 'default')
  .action(async (options) => {
    try {
      const verifier = new ContractVerifier();
      
      // Validate network
      const supportedNetworks = verifier.getSupportedNetworks();
      if (!supportedNetworks.includes(options.network)) {
        console.error(`❌ Error: Unsupported network "${options.network}"`);
        console.error(`✅ Supported networks: ${supportedNetworks.join(', ')}`);
        process.exit(1);
      }

      // Validate address
      if (!verifier.isValidAddress(options.address)) {
        console.error(`❌ Error: Invalid contract address "${options.address}"`);
        console.error(`✅ Address must be a valid Ethereum address (42 characters starting with 0x)`);
        process.exit(1);
      }

      // Validate compiler version
      if (!verifier.isValidCompilerVersion(options.version)) {
        console.error(`❌ Error: Invalid compiler version format "${options.version}"`);
        console.error(`✅ Version must be in format: v0.8.19+commit.e7d8d7db`);
        process.exit(1);
      }

      // Resolve source path
      const sourcePath = path.resolve(options.source);

      // Check if source file exists
      if (!await require('fs-extra').pathExists(sourcePath)) {
        console.error(`❌ Error: Source file not found at "${sourcePath}"`);
        process.exit(1);
      }

      console.log('🚀 Starting contract verification...\n');

      const result = await verifier.verifyContract({
        network: options.network,
        address: options.address,
        sourcePath: sourcePath,
        contractName: options.contract,
        compilerVersion: options.version,
        constructorArgs: options.args,
        optimized: options.optimized,
        runs: parseInt(options.runs),
        evmVersion: options.evmVersion
      });

      if (result.success) {
        console.log('\n✅ Verification completed successfully!');
        console.log('🎉 Your contract is now verified and publicly accessible!');
        process.exit(0);
      } else {
        console.error(`\n❌ Verification failed: ${result.message}`);
        console.error('💡 Please check your inputs and try again');
        process.exit(1);
      }
    } catch (error) {
      console.error(`\n❌ Error: ${error.message}`);
      
      // Provide helpful error suggestions
      if (error.message.includes('API key')) {
        console.error('💡 Make sure to set your API keys in the .env file');
        console.error('   Run: contract-verifier setup');
      } else if (error.message.includes('Source file')) {
        console.error('💡 Check that the source file path is correct');
      } else if (error.message.includes('Network error')) {
        console.error('💡 Check your internet connection and try again');
      }
      
      process.exit(1);
    }
  });

program
  .command('networks')
  .description('List supported networks')
  .action(() => {
    const verifier = new ContractVerifier();
    const networks = verifier.getSupportedNetworks();
    
    console.log('📡 Supported Networks:\n');
    networks.forEach(network => {
      const info = verifier.getNetworkInfo(network);
      console.log(`• ${network.padEnd(10)} - ${info.name}`);
    });
    
    console.log('\n💡 Make sure to set the corresponding API keys in your .env file');
  });

program
  .command('setup')
  .description('Show setup instructions')
  .action(() => {
    console.log('🔧 Setup Instructions:\n');
    console.log('1. Create a .env file in your project root');
    console.log('2. Add your API keys:\n');
    console.log('   ETHERSCAN_API_KEY=your_etherscan_api_key');
    console.log('   POLYGONSCAN_API_KEY=your_polygonscan_api_key');
    console.log('   BSCSCAN_API_KEY=your_bscscan_api_key');
    console.log('   ARBISCAN_API_KEY=your_arbiscan_api_key');
    console.log('   OPTIMISM_API_KEY=your_optimism_api_key');
    console.log('   BASESCAN_API_KEY=your_basescan_api_key\n');
    console.log('3. Get API keys from:');
    console.log('   • Etherscan: https://etherscan.io/apis');
    console.log('   • Polygonscan: https://polygonscan.com/apis');
    console.log('   • BSCScan: https://bscscan.com/apis');
    console.log('   • Arbiscan: https://arbiscan.io/apis');
    console.log('   • Optimism: https://optimistic.etherscan.io/apis');
    console.log('   • BaseScan: https://basescan.org/apis\n');
    console.log('4. Run your first verification:');
    console.log('   contract-verifier verify --network ethereum --address 0x... --source ./Contract.sol --contract MyContract --version v0.8.19+commit.e7d8d7db');
  });

program
  .command('status')
  .description('Check verification status of a contract')
  .requiredOption('-n, --network <network>', 'Network name')
  .requiredOption('-a, --address <address>', 'Contract address')
  .action(async (options) => {
    try {
      const verifier = new ContractVerifier();
      
      console.log(`🔍 Checking verification status for ${options.address} on ${options.network}...\n`);
      
      const status = await verifier.getVerificationStatus(options.network, options.address);
      
      if (status.verified) {
        console.log('✅ Contract is verified!');
        console.log(`📄 Contract Name: ${status.contractName}`);
        console.log(`🔧 Compiler Version: ${status.compilerVersion}`);
        console.log(`⚙️  Optimization: ${status.optimizationUsed ? 'Enabled' : 'Disabled'}`);
        if (status.optimizationUsed) {
          console.log(`🔄 Runs: ${status.runs}`);
        }
      } else {
        console.log('❌ Contract is not verified');
        console.log(`💡 ${status.message}`);
      }
    } catch (error) {
      console.error(`❌ Error: ${error.message}`);
      process.exit(1);
    }
  });

program
  .command('versions')
  .description('Get available compiler versions')
  .option('-n, --network <network>', 'Network name', 'ethereum')
  .action(async (options) => {
    try {
      const verifier = new ContractVerifier();
      
      console.log(`📋 Fetching compiler versions for ${options.network}...\n`);
      
      const versions = await verifier.getCompilerVersions(options.network);
      
      console.log('Available compiler versions:');
      versions.slice(0, 20).forEach((version, index) => {
        console.log(`${index + 1}. ${version}`);
      });
      
      if (versions.length > 20) {
        console.log(`... and ${versions.length - 20} more versions`);
      }
    } catch (error) {
      console.error(`❌ Error: ${error.message}`);
      process.exit(1);
    }
  });

program
  .command('encode-args')
  .description('Encode constructor arguments')
  .requiredOption('-t, --types <types>', 'Argument types (comma-separated, e.g., uint256,address)')
  .requiredOption('-v, --values <values>', 'Argument values (comma-separated)')
  .action((options) => {
    try {
      const verifier = new ContractVerifier();
      
      const types = options.types.split(',').map(t => t.trim());
      const values = options.values.split(',').map(v => v.trim());
      
      console.log(`🔧 Encoding constructor arguments...\n`);
      console.log(`Types: ${types.join(', ')}`);
      console.log(`Values: ${values.join(', ')}\n`);
      
      const encoded = verifier.encodeConstructorArgs(types, values);
      
      console.log(`✅ Encoded arguments: ${encoded}`);
      console.log(`\n💡 Use this value with the --args flag`);
    } catch (error) {
      console.error(`❌ Error: ${error.message}`);
      process.exit(1);
    }
  });

// Handle unknown commands
program.on('command:*', function (operands) {
  console.error(`❌ Unknown command: ${operands[0]}`);
  console.log('Run "contract-verifier --help" for available commands');
  process.exit(1);
});

// Show help if no arguments provided
if (process.argv.length === 2) {
  program.help();
}

program.parse();
