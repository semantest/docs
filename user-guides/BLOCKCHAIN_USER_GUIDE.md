# Semantest Blockchain Certification User Guide

## Overview

Semantest's blockchain integration provides immutable test certification, cryptographic proof of execution, and compliance automation through smart contracts. This guide covers setup, workflows, and best practices for blockchain-based test certification.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Smart Contract Setup](#smart-contract-setup)
3. [Certification Workflows](#certification-workflows)
4. [Multi-Chain Support](#multi-chain-support)
5. [Compliance Integration](#compliance-integration)
6. [API Reference](#api-reference)
7. [Troubleshooting](#troubleshooting)

## Getting Started

### Blockchain Capabilities Overview

**Core Features**:
- **Immutable Test Records**: Permanent, tamper-proof test execution records
- **Cryptographic Proof**: Digital signatures and hash verification
- **Smart Contract Automation**: Automated compliance and verification
- **Multi-Chain Support**: Ethereum, Polygon, Arbitrum, and private chains
- **IPFS Integration**: Decentralized storage for large test data

**Use Cases**:
- Regulatory compliance (FDA, SOX, PCI-DSS)
- Legal evidence preservation
- Supply chain testing verification
- Partner certification and validation
- Quality gate enforcement

### Prerequisites

- Semantest platform v2.0.0+
- Node.js 18+ with Web3 support
- Blockchain wallet (MetaMask, WalletConnect)
- Gas tokens for chosen blockchain networks

### Quick Setup

1. **Install blockchain package**:
```bash
npm install @semantest/blockchain
```

2. **Initialize blockchain integration**:
```bash
npx semantest-blockchain init
```

3. **Configure blockchain networks**:
```javascript
// semantest.blockchain.config.js
module.exports = {
  networks: {
    ethereum: {
      enabled: true,
      rpcUrl: 'https://mainnet.infura.io/v3/YOUR_API_KEY',
      contractAddress: '0x...',
      gasPrice: 'auto'
    },
    polygon: {
      enabled: true,
      rpcUrl: 'https://polygon-rpc.com',
      contractAddress: '0x...',
      gasPrice: 'auto'
    }
  },
  ipfs: {
    enabled: true,
    gateway: 'https://ipfs.io/ipfs/',
    pinning: 'pinata' // or 'infura', 'fleek'
  }
};
```

## Smart Contract Setup

### TestRegistry Contract

The core smart contract for test certification:

```solidity
// TestRegistry.sol
pragma solidity ^0.8.19;

contract TestRegistry {
    struct TestRecord {
        bytes32 testHash;
        address certifier;
        uint256 timestamp;
        string ipfsHash;
        TestStatus status;
        bytes signature;
    }
    
    enum TestStatus {
        PENDING,
        CERTIFIED,
        FAILED,
        REVOKED
    }
    
    mapping(bytes32 => TestRecord) public testRecords;
    mapping(address => bool) public authorizedCertifiers;
    
    event TestCertified(
        bytes32 indexed testId,
        address indexed certifier,
        string ipfsHash
    );
    
    function certifyTest(
        bytes32 testId,
        bytes32 testHash,
        string memory ipfsHash,
        bytes memory signature
    ) external onlyCertifier {
        require(testRecords[testId].timestamp == 0, "Test already exists");
        
        testRecords[testId] = TestRecord({
            testHash: testHash,
            certifier: msg.sender,
            timestamp: block.timestamp,
            ipfsHash: ipfsHash,
            status: TestStatus.CERTIFIED,
            signature: signature
        });
        
        emit TestCertified(testId, msg.sender, ipfsHash);
    }
    
    function verifyTest(bytes32 testId) 
        external 
        view 
        returns (bool valid, TestRecord memory record) 
    {
        record = testRecords[testId];
        valid = record.timestamp > 0 && 
                record.status == TestStatus.CERTIFIED;
    }
}
```

### Contract Deployment

```javascript
import { ContractDeployer } from '@semantest/blockchain';

const deployer = new ContractDeployer({
  network: 'polygon',
  privateKey: process.env.DEPLOYER_PRIVATE_KEY,
  gasLimit: 5000000
});

// Deploy TestRegistry contract
const contract = await deployer.deploy('TestRegistry', {
  constructorArgs: [
    process.env.INITIAL_CERTIFIER_ADDRESS
  ],
  verify: true, // Verify on block explorer
  libraries: {} // Any required libraries
});

console.log('Contract deployed at:', contract.address);
console.log('Transaction hash:', contract.transactionHash);
```

### Access Control Setup

```javascript
import { AccessControl } from '@semantest/blockchain';

const accessControl = new AccessControl({
  contractAddress: '0x...',
  network: 'polygon'
});

// Add authorized certifiers
await accessControl.addCertifier('0x1234...', {
  role: 'senior-tester',
  permissions: ['certify', 'revoke'],
  expiresAt: new Date('2025-12-31')
});

// Set up multi-signature requirements
await accessControl.setMultiSigConfig({
  required: 2,
  signers: [
    '0x1234...',
    '0x5678...',
    '0x9abc...'
  ]
});
```

## Certification Workflows

### Basic Test Certification

```javascript
import { BlockchainCertifier } from '@semantest/blockchain';

const certifier = new BlockchainCertifier({
  network: 'polygon',
  contractAddress: '0x...',
  privateKey: process.env.CERTIFIER_PRIVATE_KEY,
  ipfs: {
    gateway: 'https://ipfs.io/ipfs/',
    pinning: 'pinata'
  }
});

// Certify test execution
async function certifyTestExecution(testData) {
  try {
    // 1. Generate test hash
    const testHash = await certifier.generateTestHash(testData);
    
    // 2. Upload detailed data to IPFS
    const ipfsHash = await certifier.uploadToIPFS({
      testResults: testData.results,
      metadata: testData.metadata,
      artifacts: testData.artifacts,
      timestamp: new Date().toISOString()
    });
    
    // 3. Create cryptographic signature
    const signature = await certifier.signTestData(testHash);
    
    // 4. Submit to blockchain
    const transaction = await certifier.certifyTest({
      testId: testData.id,
      testHash: testHash,
      ipfsHash: ipfsHash,
      signature: signature
    });
    
    console.log('Test certified:', {
      testId: testData.id,
      transactionHash: transaction.hash,
      blockNumber: transaction.blockNumber,
      gasUsed: transaction.gasUsed,
      ipfsHash: ipfsHash
    });
    
    return {
      certified: true,
      transactionHash: transaction.hash,
      certificateUrl: `https://certificate.semantest.com/${testData.id}`
    };
    
  } catch (error) {
    console.error('Certification failed:', error);
    throw new CertificationError(error.message);
  }
}
```

### Batch Certification

```javascript
// Optimize gas costs with batch operations
async function batchCertifyTests(testDataArray) {
  const batchSize = 10; // Optimize based on gas limits
  const results = [];
  
  for (let i = 0; i < testDataArray.length; i += batchSize) {
    const batch = testDataArray.slice(i, i + batchSize);
    
    // Prepare batch data
    const batchData = await Promise.all(
      batch.map(async (testData) => ({
        testId: testData.id,
        testHash: await certifier.generateTestHash(testData),
        ipfsHash: await certifier.uploadToIPFS(testData),
        signature: await certifier.signTestData(testData)
      }))
    );
    
    // Submit batch to blockchain
    const batchTransaction = await certifier.batchCertifyTests(batchData);
    
    results.push({
      batchIndex: Math.floor(i / batchSize),
      testCount: batch.length,
      transactionHash: batchTransaction.hash,
      gasUsed: batchTransaction.gasUsed,
      gasOptimization: calculateGasOptimization(batch.length, batchTransaction.gasUsed)
    });
  }
  
  return results;
}

// Gas optimization calculation
function calculateGasOptimization(testCount, actualGas) {
  const individualGas = testCount * 150000; // Estimated individual gas cost
  const savings = individualGas - actualGas;
  const savingsPercent = (savings / individualGas) * 100;
  
  return {
    estimatedIndividual: individualGas,
    actualBatch: actualGas,
    gassSaved: savings,
    optimizationPercent: savingsPercent.toFixed(2)
  };
}
```

### Test Verification

```javascript
// Verify test certification
async function verifyTestCertification(testId) {
  try {
    // 1. Query blockchain for test record
    const blockchainRecord = await certifier.getTestRecord(testId);
    
    if (!blockchainRecord.exists) {
      throw new VerificationError('Test record not found on blockchain');
    }
    
    // 2. Retrieve detailed data from IPFS
    const ipfsData = await certifier.getFromIPFS(blockchainRecord.ipfsHash);
    
    // 3. Verify cryptographic integrity
    const isValidSignature = await certifier.verifySignature(
      blockchainRecord.testHash,
      blockchainRecord.signature,
      blockchainRecord.certifier
    );
    
    // 4. Verify test data integrity
    const computedHash = await certifier.generateTestHash(ipfsData);
    const isValidHash = computedHash === blockchainRecord.testHash;
    
    // 5. Check certifier authorization
    const isCertifierAuthorized = await certifier.isCertifierAuthorized(
      blockchainRecord.certifier,
      blockchainRecord.timestamp
    );
    
    const verification = {
      testId: testId,
      certified: true,
      validSignature: isValidSignature,
      validHash: isValidHash,
      authorizedCertifier: isCertifierAuthorized,
      certificationDate: new Date(blockchainRecord.timestamp * 1000),
      certifier: blockchainRecord.certifier,
      transactionHash: blockchainRecord.transactionHash,
      blockNumber: blockchainRecord.blockNumber,
      ipfsHash: blockchainRecord.ipfsHash,
      
      // Overall verification result
      verified: isValidSignature && isValidHash && isCertifierAuthorized
    };
    
    return verification;
    
  } catch (error) {
    console.error('Verification failed:', error);
    return {
      testId: testId,
      certified: false,
      error: error.message,
      verified: false
    };
  }
}
```

## Multi-Chain Support

### Network Configuration

```javascript
const multiChainConfig = {
  networks: {
    ethereum: {
      chainId: 1,
      name: 'Ethereum Mainnet',
      rpcUrl: 'https://mainnet.infura.io/v3/YOUR_API_KEY',
      contractAddress: '0x...',
      gasPrice: 'auto',
      useCase: 'high-value-certifications',
      costTier: 'premium'
    },
    polygon: {
      chainId: 137,
      name: 'Polygon',
      rpcUrl: 'https://polygon-rpc.com',
      contractAddress: '0x...',
      gasPrice: 'auto',
      useCase: 'standard-operations',
      costTier: 'standard'
    },
    arbitrum: {
      chainId: 42161,
      name: 'Arbitrum One',
      rpcUrl: 'https://arb1.arbitrum.io/rpc',
      contractAddress: '0x...',
      gasPrice: 'auto',
      useCase: 'batch-processing',
      costTier: 'economy'
    },
    private: {
      chainId: 1337,
      name: 'Enterprise Private Chain',
      rpcUrl: 'https://private-chain.company.com',
      contractAddress: '0x...',
      gasPrice: '1000000000', // 1 gwei
      useCase: 'enterprise-internal',
      costTier: 'free'
    }
  },
  
  // Smart network selection
  selectionRules: [
    {
      condition: 'testValue > 1000000', // High-value tests
      network: 'ethereum'
    },
    {
      condition: 'batchSize > 10', // Batch operations
      network: 'arbitrum'
    },
    {
      condition: 'internal === true', // Internal tests
      network: 'private'
    },
    {
      condition: 'default',
      network: 'polygon'
    }
  ]
};
```

### Cross-Chain Verification

```javascript
import { CrossChainVerifier } from '@semantest/blockchain';

const crossChainVerifier = new CrossChainVerifier({
  networks: ['ethereum', 'polygon', 'arbitrum'],
  consensus: {
    required: 2, // Require 2 out of 3 networks to agree
    timeout: 30000 // 30 second timeout
  }
});

// Verify test across multiple chains
async function crossChainVerify(testId) {
  const verifications = await Promise.allSettled([
    verifyOnNetwork(testId, 'ethereum'),
    verifyOnNetwork(testId, 'polygon'),
    verifyOnNetwork(testId, 'arbitrum')
  ]);
  
  const validVerifications = verifications
    .filter(result => result.status === 'fulfilled' && result.value.verified)
    .map(result => result.value);
  
  const consensus = validVerifications.length >= crossChainVerifier.config.consensus.required;
  
  return {
    testId: testId,
    crossChainVerified: consensus,
    verificationCount: validVerifications.length,
    networks: validVerifications.map(v => v.network),
    details: validVerifications
  };
}

async function verifyOnNetwork(testId, network) {
  const networkCertifier = new BlockchainCertifier({
    network: network,
    contractAddress: multiChainConfig.networks[network].contractAddress
  });
  
  const verification = await networkCertifier.verifyTest(testId);
  return { ...verification, network: network };
}
```

### Gas Optimization Strategies

```javascript
import { GasOptimizer } from '@semantest/blockchain';

const gasOptimizer = new GasOptimizer({
  networks: ['ethereum', 'polygon', 'arbitrum'],
  optimization: {
    batchThreshold: 5, // Batch operations when > 5 tests
    gasLimitMultiplier: 1.2, // 20% buffer for gas estimates
    maxGasPrice: {
      ethereum: '100000000000', // 100 gwei max
      polygon: '50000000000',   // 50 gwei max
      arbitrum: '1000000000'    // 1 gwei max
    }
  }
});

// Optimize certification strategy
async function optimizeCertification(tests) {
  const optimization = await gasOptimizer.optimize(tests);
  
  console.log('Optimization strategy:', {
    totalTests: tests.length,
    recommendedNetwork: optimization.network,
    batchStrategy: optimization.batchStrategy,
    estimatedCost: optimization.estimatedCost,
    estimatedTime: optimization.estimatedTime
  });
  
  // Execute optimized strategy
  switch (optimization.strategy) {
    case 'batch':
      return await batchCertifyTests(tests);
    case 'individual':
      return await Promise.all(tests.map(certifyTestExecution));
    case 'hybrid':
      return await hybridCertification(tests, optimization.batches);
  }
}
```

## Compliance Integration

### Regulatory Compliance Automation

```javascript
import { ComplianceManager } from '@semantest/blockchain';

const complianceManager = new ComplianceManager({
  regulations: ['FDA-21CFR11', 'SOX', 'PCI-DSS', 'GDPR'],
  blockchain: {
    network: 'ethereum', // Use mainnet for regulatory compliance
    retention: 'permanent',
    encryption: 'AES-256-GCM'
  }
});

// FDA 21 CFR Part 11 compliance
async function fdaCompliantCertification(testData) {
  // Validate FDA requirements
  const fdaValidation = await complianceManager.validateFDA(testData);
  
  if (!fdaValidation.compliant) {
    throw new ComplianceError('FDA validation failed', fdaValidation.issues);
  }
  
  // Enhanced test data for FDA compliance
  const fdaEnhancedData = {
    ...testData,
    
    // FDA required metadata
    metadata: {
      ...testData.metadata,
      regulation: 'FDA-21CFR11',
      documentType: 'Electronic Record',
      retentionPeriod: 'permanent',
      accessControls: fdaValidation.accessControls,
      auditTrail: await generateAuditTrail(testData),
      digitalSignature: await generateFDASignature(testData)
    },
    
    // Electronic signature requirements
    electronicSignature: {
      signerIdentity: process.env.FDA_SIGNER_ID,
      timestamp: new Date().toISOString(),
      meaning: 'Approval of test execution results',
      biometricHash: await generateBiometricHash(),
      witnessSignature: await getWitnessSignature()
    }
  };
  
  // Certify with enhanced compliance data
  return await certifyTestExecution(fdaEnhancedData);
}

// SOX compliance for financial systems
async function soxCompliantCertification(testData) {
  const soxValidation = await complianceManager.validateSOX(testData);
  
  const soxEnhancedData = {
    ...testData,
    
    metadata: {
      ...testData.metadata,
      regulation: 'SOX',
      controlTesting: soxValidation.controlTesting,
      materialWeakness: soxValidation.materialWeakness,
      managementAssertion: soxValidation.managementAssertion,
      auditEvidence: await generateSOXEvidence(testData)
    }
  };
  
  return await certifyTestExecution(soxEnhancedData);
}
```

### Legal Evidence Preservation

```javascript
// Generate legal-grade evidence package
async function generateLegalEvidence(testId) {
  const certification = await verifyTestCertification(testId);
  
  if (!certification.verified) {
    throw new Error('Cannot generate legal evidence for unverified test');
  }
  
  // Compile comprehensive evidence package
  const evidencePackage = {
    summary: {
      testId: testId,
      certificationDate: certification.certificationDate,
      jurisdiction: 'United States',
      legalStandard: 'Federal Rules of Evidence',
      evidenceType: 'Electronic Record'
    },
    
    // Blockchain proof
    blockchainEvidence: {
      network: certification.network,
      contractAddress: certification.contractAddress,
      transactionHash: certification.transactionHash,
      blockNumber: certification.blockNumber,
      blockHash: await getBlockHash(certification.blockNumber),
      confirmations: await getConfirmations(certification.transactionHash)
    },
    
    // Cryptographic proof
    cryptographicEvidence: {
      testHash: certification.testHash,
      signature: certification.signature,
      publicKey: await getCertifierPublicKey(certification.certifier),
      hashAlgorithm: 'SHA-256',
      signatureAlgorithm: 'ECDSA-secp256k1'
    },
    
    // Chain of custody
    chainOfCustody: await generateChainOfCustody(testId),
    
    // Legal certifications
    legalCertifications: {
      notarization: await requestNotarization(testId),
      timestampService: await getTimestampService(certification.transactionHash),
      witnessStatements: await getWitnessStatements(testId)
    }
  };
  
  // Generate legal evidence PDF
  const evidencePDF = await generateEvidencePDF(evidencePackage);
  
  // Store in secure evidence vault
  const vaultStorage = await storeInEvidenceVault(evidencePDF);
  
  return {
    evidenceId: vaultStorage.evidenceId,
    downloadUrl: vaultStorage.secureUrl,
    expiresAt: vaultStorage.expiresAt,
    legalHash: vaultStorage.legalHash
  };
}
```

### Audit Trail Generation

```javascript
// Comprehensive audit trail for compliance
async function generateAuditTrail(testData) {
  const auditTrail = {
    events: [],
    metadata: {
      generatedAt: new Date().toISOString(),
      generatedBy: 'Semantest Audit System',
      regulation: testData.regulation,
      retentionPeriod: 'permanent'
    }
  };
  
  // Test execution events
  auditTrail.events.push({
    timestamp: testData.startTime,
    event: 'TEST_STARTED',
    user: testData.executor,
    details: {
      testId: testData.id,
      testSuite: testData.suite,
      environment: testData.environment
    }
  });
  
  // Result validation events
  if (testData.results) {
    auditTrail.events.push({
      timestamp: testData.results.timestamp,
      event: 'RESULTS_VALIDATED',
      user: testData.validator,
      details: {
        passed: testData.results.passed,
        failed: testData.results.failed,
        validationMethod: testData.results.validationMethod
      }
    });
  }
  
  // Blockchain certification event
  auditTrail.events.push({
    timestamp: new Date().toISOString(),
    event: 'BLOCKCHAIN_CERTIFICATION',
    user: process.env.CERTIFIER_ID,
    details: {
      network: 'polygon',
      gasUsed: 'pending',
      ipfsHash: 'pending'
    }
  });
  
  return auditTrail;
}
```

## API Reference

### BlockchainCertifier Class

```typescript
class BlockchainCertifier {
  constructor(config: BlockchainConfig);
  
  // Core certification methods
  certifyTest(testData: TestCertificationData): Promise<CertificationResult>;
  batchCertifyTests(testDataArray: TestCertificationData[]): Promise<BatchResult>;
  verifyTest(testId: string): Promise<VerificationResult>;
  
  // IPFS integration
  uploadToIPFS(data: any): Promise<string>;
  getFromIPFS(hash: string): Promise<any>;
  pinToIPFS(hash: string): Promise<boolean>;
  
  // Cryptographic operations
  generateTestHash(testData: any): Promise<string>;
  signTestData(testHash: string): Promise<string>;
  verifySignature(hash: string, signature: string, address: string): Promise<boolean>;
  
  // Network operations
  getGasEstimate(operation: string, data: any): Promise<number>;
  getNetworkStatus(): Promise<NetworkStatus>;
  
  // Compliance helpers
  generateComplianceReport(testId: string): Promise<ComplianceReport>;
  exportLegalEvidence(testId: string): Promise<LegalEvidence>;
}
```

### Configuration Interfaces

```typescript
interface BlockchainConfig {
  network: string;
  contractAddress: string;
  privateKey?: string;
  rpcUrl: string;
  gasLimit?: number;
  gasPrice?: string;
  ipfs?: IPFSConfig;
}

interface TestCertificationData {
  id: string;
  hash?: string;
  results: TestResults;
  metadata: TestMetadata;
  signature?: string;
}

interface CertificationResult {
  certified: boolean;
  transactionHash: string;
  blockNumber: number;
  gasUsed: number;
  ipfsHash: string;
  certificateUrl: string;
}

interface VerificationResult {
  testId: string;
  verified: boolean;
  certificationDate: Date;
  certifier: string;
  transactionHash: string;
  ipfsHash: string;
  validSignature: boolean;
  validHash: boolean;
}
```

## Troubleshooting

### Common Issues

#### Transaction Failures

**Issue**: Transaction reverted or failed

**Diagnosis**:
```javascript
// Check transaction status
const receipt = await web3.eth.getTransactionReceipt(txHash);
console.log('Transaction status:', receipt.status);

// Decode revert reason
if (receipt.status === false) {
  const revertReason = await getRevertReason(txHash);
  console.log('Revert reason:', revertReason);
}
```

**Solutions**:
```javascript
// Increase gas limit
const gasEstimate = await contract.methods.certifyTest().estimateGas();
const gasLimit = Math.floor(gasEstimate * 1.2); // 20% buffer

// Handle network congestion
const gasPrice = await getOptimalGasPrice();
if (gasPrice > maxGasPrice) {
  // Queue transaction for later
  await queueTransaction(transactionData);
}

// Retry mechanism
async function certifyWithRetry(testData, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await certifyTest(testData);
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await delay(2000 * (i + 1)); // Exponential backoff
    }
  }
}
```

#### IPFS Upload Issues

**Issue**: IPFS upload timeout or failure

**Solutions**:
```javascript
// Multiple IPFS gateways
const ipfsGateways = [
  'https://ipfs.infura.io:5001',
  'https://ipfs.fleek.co',
  'https://gateway.pinata.cloud'
];

async function uploadWithRetry(data) {
  for (const gateway of ipfsGateways) {
    try {
      return await uploadToGateway(data, gateway);
    } catch (error) {
      console.warn(`Upload failed for ${gateway}:`, error.message);
    }
  }
  throw new Error('All IPFS gateways failed');
}

// Optimize upload size
function optimizeForIPFS(data) {
  return {
    // Compress large test artifacts
    artifacts: compressArtifacts(data.artifacts),
    // Keep essential data uncompressed
    results: data.results,
    metadata: data.metadata
  };
}
```

#### Gas Optimization Issues

**Issue**: High gas costs affecting operations

**Solutions**:
```javascript
// Batch operations
const BATCH_SIZE = 10;
const batches = chunkArray(tests, BATCH_SIZE);

for (const batch of batches) {
  await batchCertifyTests(batch);
  // Wait between batches to avoid nonce issues
  await delay(5000);
}

// Use Layer 2 solutions
const l2Config = {
  network: 'polygon', // 100x cheaper than Ethereum
  fallbackToL1: true
};

// Gas price optimization
async function getOptimalGasPrice() {
  const gasStation = await fetch('https://gasstation-mainnet.matic.network/');
  const data = await gasStation.json();
  return web3.utils.toWei(data.fast.toString(), 'gwei');
}
```

### Best Practices

1. **Cost Optimization**:
   - Use batch operations for multiple certifications
   - Choose appropriate network based on value and urgency
   - Monitor gas prices and queue operations during low-cost periods

2. **Security**:
   - Use hardware wallets for high-value operations
   - Implement multi-signature for sensitive certifications
   - Regular security audits of smart contracts

3. **Compliance**:
   - Understand regulatory requirements for your industry
   - Maintain comprehensive audit trails
   - Regular compliance reviews and updates

4. **Reliability**:
   - Implement retry mechanisms with exponential backoff
   - Use multiple IPFS gateways for redundancy
   - Monitor blockchain network status

### Getting Help

1. **Documentation**: https://docs.semantest.com/blockchain
2. **Blockchain Forum**: https://community.semantest.com/blockchain
3. **GitHub Issues**: https://github.com/semantest/blockchain/issues
4. **Smart Contract Audits**: https://audits.semantest.com
5. **Support Email**: blockchain-support@semantest.com

---

**Last Updated**: January 18, 2025  
**Version**: 1.0.0  
**Maintainer**: Semantest Blockchain Team