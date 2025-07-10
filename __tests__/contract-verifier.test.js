const ContractVerifier = require('../src/index');
const fs = require('fs-extra');
const path = require('path');

describe('ContractVerifier', () => {
  let verifier;

  beforeEach(() => {
    verifier = new ContractVerifier();
  });

  describe('Network Support', () => {
    test('should return supported networks', () => {
      const networks = verifier.getSupportedNetworks();
      expect(networks).toContain('ethereum');
      expect(networks).toContain('polygon');
      expect(networks).toContain('bsc');
      expect(networks).toContain('arbitrum');
      expect(networks).toContain('optimism');
      expect(networks).toContain('base');
    });

    test('should return network info', () => {
      const ethInfo = verifier.getNetworkInfo('ethereum');
      expect(ethInfo).toHaveProperty('name', 'Ethereum');
      expect(ethInfo).toHaveProperty('url', 'https://api.etherscan.io/api');
      expect(ethInfo).toHaveProperty('explorerUrl', 'https://etherscan.io');
    });
  });

  describe('Address Validation', () => {
    test('should validate correct Ethereum addresses', () => {
      const validAddresses = [
        '0x742d35Cc6634C0532925a3b8D82d8C20C2f84c3c',
        '0x0000000000000000000000000000000000000000',
        '0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF'
      ];

      validAddresses.forEach(address => {
        expect(verifier.isValidAddress(address)).toBe(true);
      });
    });

    test('should reject invalid Ethereum addresses', () => {
      const invalidAddresses = [
        '0x123',
        '742d35Cc6634C0532925a3b8D82d8C20C2f84c3c',
        '0x742d35Cc6634C0532925a3b8D82d8C20C2f84c3',
        '0x742d35Cc6634C0532925a3b8D82d8C20C2f84c3cc',
        '',
        null,
        undefined
      ];

      invalidAddresses.forEach(address => {
        expect(verifier.isValidAddress(address)).toBe(false);
      });
    });
  });

  describe('Source Code Reading', () => {
    test('should read source code from existing file', async () => {
      const sourceCode = await verifier.readSourceCode('./examples/SimpleStorage.sol');
      expect(sourceCode).toContain('contract SimpleStorage');
      expect(sourceCode).toContain('pragma solidity');
    });

    test('should throw error for non-existent file', async () => {
      await expect(verifier.readSourceCode('./non-existent.sol'))
        .rejects.toThrow('Source file not found');
    });
  });

  describe('Constructor Arguments', () => {
    test('should encode uint256 constructor argument', () => {
      const encoded = verifier.encodeConstructorArgs(['uint256'], [100]);
      expect(encoded).toBe('0x0000000000000000000000000000000000000000000000000000000000000064');
    });

    test('should encode address constructor argument', () => {
      const address = '0x742d35Cc6634C0532925a3b8D82d8C20C2f84c3c';
      const encoded = verifier.encodeConstructorArgs(['address'], [address]);
      expect(encoded).toBe('0x000000000000000000000000742d35cc6634c0532925a3b8d82d8c20c2f84c3c');
    });

    test('should encode multiple constructor arguments', () => {
      const encoded = verifier.encodeConstructorArgs(
        ['uint256', 'address'], 
        [100, '0x742d35Cc6634C0532925a3b8D82d8C20C2f84c3c']
      );
      expect(encoded).toBe('0x0000000000000000000000000000000000000000000000000000000000000064000000000000000000000000742d35cc6634c0532925a3b8d82d8c20c2f84c3c');
    });
  });

  describe('Configuration', () => {
    test('should handle missing API keys gracefully', () => {
      // Mock environment without API keys
      const originalEnv = process.env;
      process.env = {};
      
      const verifierWithoutKeys = new ContractVerifier();
      const ethInfo = verifierWithoutKeys.getNetworkInfo('ethereum');
      
      expect(ethInfo.apiKey).toBeUndefined();
      
      // Restore environment
      process.env = originalEnv;
    });
  });
});
