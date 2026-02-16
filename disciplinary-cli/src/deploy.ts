import path from 'path';
import fs from 'fs';
import * as readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import * as api from './api';
import { currentDir, UndeployedConfig, PreprodConfig, PreviewConfig, Config } from './config';
import { createLogger } from './logger';
import { createPrivateState } from '@eddalabs/disciplinary-record-contract';

const logDir = path.resolve(currentDir, '..', 'logs', 'deploy', `${new Date().toISOString().replace(/:/g, '-')}.log`);
const logger = await createLogger(logDir);

// Genesis seed for local standalone network
const GENESIS_MINT_WALLET_SEED = '0000000000000000000000000000000000000000000000000000000000000001';

async function deploy() {
  const rl = readline.createInterface({ input, output });
  
  console.log('\n🚀 Midnight Student Registry Deployment\n');
  
  // 1. Choose Network
  const networkArg = process.argv[2]?.toLowerCase() || 'local';
  let config: Config;
  let networkName: string;

  if (networkArg === 'preprod') {
    config = new PreprodConfig();
    networkName = 'preprod';
  } else if (networkArg === 'preview') {
    config = new PreviewConfig();
    networkName = 'preview';
  } else {
    config = new UndeployedConfig();
    networkName = 'local';
  }

  logger.info(`Target Network: ${networkName}`);
  logger.info(`Connecting to node at ${config.node}`);

  // 2. Resolve Seed
  let seed = GENESIS_MINT_WALLET_SEED;
  const customSeed = await rl.question('Enter your Hex Seed (32-byte hex string) [Leave blank for default]: ');
  if (customSeed.trim()) {
    seed = customSeed.trim();
  } else {
    console.log(`Using genesis seed: ${seed}`);
  }
  rl.close();

  api.setLogger(logger);

  // 3. Initialize Wallet
  const walletContext = await api.buildWalletAndWaitForFunds(config, seed);
  const providers = await api.configureProviders(walletContext, config);

  // 4. Deploy Contract
  logger.info('Deploying contract...');
  const contract = await api.deploy(providers, createPrivateState()); 
  const address = contract.deployTxData.public.contractAddress;
  
  logger.info(`Contract deployed at: ${address}`);

  // 5. Initialize Contract (Set Manager)
  // We use the unshielded address as the Manager ID for authorization
  const managerBech32 = walletContext.unshieldedKeystore.getBech32Address().toString();
  // Simple hash-to-bigint for the Field using node:crypto
  const crypto = await import('node:crypto');
  const managerId = BigInt('0x' + crypto.createHash('sha256').update(managerBech32).digest('hex').slice(0, 62));
  
  await api.initialize(contract, managerId);
  logger.info(`Contract initialized with Manager ID: ${managerId}`);

  // 6. Write deployment.json
  const deploymentPath = path.resolve(currentDir, '..', '..', 'disciplinary-contract', 'deployment.json');
  const deploymentData = {
    contractAddress: address,
    network: networkName,
    deployedAt: new Date().toISOString(),
  };

  fs.writeFileSync(deploymentPath, JSON.stringify(deploymentData, null, 2));
  logger.info(`Wrote deployment info to ${deploymentPath}`);
  
  console.log('\n✅ Deployment Successful!');
  console.log('Network:', networkName);
  console.log('Contract Address:', address);
  console.log('Update your frontend .env file with this address.');

  // Close wallet before exiting
  await api.closeWallet(walletContext);
  process.exit(0);
}

deploy().catch((err) => {
  logger.error('Deployment failed', err);
  console.error(err);
  process.exit(1);
});
