# Contract Verifier 🔍

A Node.js CLI tool to automate smart contract verification on block explorers like Etherscan, Polygonscan, and more.

## 🎯 Objective

Smart contract developers often have to manually verify their deployed contracts on Etherscan, which is time-consuming and error-prone. contract-verifier aims to streamline that process via a single command, allowing devs to verify contracts directly from the CLI or scripts.

## 🚀 Key Features

- 🔍 Supports Etherscan, Polygonscan, BSCScan, Arbiscan, Optimism, and Base
- 📂 Reads .sol source files and constructor args
- 🛠️ CLI + programmatic API for flexibility
- ✅ Verifies contracts with single or no constructor args
- 🌐 Uses .env for secure API key storage
- ⚙️ Easily integrates with Hardhat/Foundry deployment workflows
- 📊 Automatic verification status polling
- 🎨 Beautiful CLI interface with emojis and colors

## Usage

### Install
npm install -g contract-verifier

#### Setup
contract-verifier setup

### Verify
contract-verifier verify \
  --network ethereum \
  --address 0x742d35Cc6634C0532925a3b8D82d8C20C2f84c3c \
  --source ./MyContract.sol \
  --contract MyContract \
  --version v0.8.19+commit.e7d8d7db
---

**Happy verifying! 🚀**