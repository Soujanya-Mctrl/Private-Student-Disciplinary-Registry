
import path from 'path';
import fs from 'fs';
import * as api from './api';
import { currentDir, UndeployedConfig } from './config';
import { createLogger } from './logger';
import { createPrivateState } from '@eddalabs/disciplinary-record-contract';

const logDir = path.resolve(currentDir, '..', 'logs', 'deploy', `${new Date().toISOString().replace(/:/g, '-')}.log`);
const logger = await createLogger(logDir);

// Genesis seed for local standalone network
const GENESIS_MINT_WALLET_SEED = '0000000000000000000000000000000000000000000000000000000000000001';

async function deploy() {
  logger.info('Starting deployment to persistent local network...');
  api.setLogger(logger);

  // 1. Configure for Local Network (UndeployedConfig has fixed ports)
  const config = new UndeployedConfig();
  logger.info(`Connecting to node at ${config.node}`);

  // 2. Initialize Wallet with Genesis Seed (already funded)
  const walletContext = await api.buildWalletAndWaitForFunds(config, GENESIS_MINT_WALLET_SEED);
  const providers = await api.configureProviders(walletContext, config);

  // 3. Deploy Contract
  logger.info('Deploying contract...');
  const contract = await api.deploy(providers, createPrivateState()); 
  const address = contract.deployTxData.public.contractAddress;
  
  logger.info(`Contract deployed at: ${address}`);

  // 4. Write deployment.json
  const deploymentPath = path.resolve(currentDir, '..', '..', 'disciplinary-contract', 'deployment.json');
  const deploymentData = {
    contractAddress: address,
    network: 'local', // Mark as local
    deployedAt: new Date().toISOString(),
  };

  fs.writeFileSync(deploymentPath, JSON.stringify(deploymentData, null, 2));
  logger.info(`Wrote deployment info to ${deploymentPath}`);
  
  console.log('\nDeployment Successful!');
  console.log('Contract Address:', address);
  console.log('Update your frontend .env file with this address if it changed.');

  // Close wallet before exiting
  await api.closeWallet(walletContext);
  process.exit(0);
}

deploy().catch((err) => {
  logger.error('Deployment failed', err);
  console.error(err);
  process.exit(1);
});
