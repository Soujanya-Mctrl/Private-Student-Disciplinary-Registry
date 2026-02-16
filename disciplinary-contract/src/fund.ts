/**
 * Standalone funding script.
 * 
 * Usage:
 *   npm run build && node dist/fund.js
 */

import * as readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import * as Rx from 'rxjs';
import { WebSocket } from 'ws';
import pino from 'pino';
import pinoPretty from 'pino-pretty';

import { setNetworkId, getNetworkId } from '@midnight-ntwrk/midnight-js-network-id';
import { toHex } from '@midnight-ntwrk/midnight-js-utils';
import * as ledger from '@midnight-ntwrk/ledger-v7';

import {
  createKeystore,
  InMemoryTransactionHistoryStorage,
  type UnshieldedKeystore,
  UnshieldedWallet,
  PublicKey,
} from '@midnight-ntwrk/wallet-sdk-unshielded-wallet';
import { ShieldedWallet } from '@midnight-ntwrk/wallet-sdk-shielded';
import { DustWallet } from '@midnight-ntwrk/wallet-sdk-dust-wallet';
import { WalletFacade, type CombinedTokenTransfer } from '@midnight-ntwrk/wallet-sdk-facade';
import { generateRandomSeed, HDWallet, Roles } from '@midnight-ntwrk/wallet-sdk-hd';

// @ts-expect-error: needed for apollo WS transport
globalThis.WebSocket = WebSocket;

const INDEXER = process.env.INDEXER_URL ?? 'http://127.0.0.1:8088/api/v3/graphql';
const INDEXER_WS = process.env.INDEXER_WS_URL ?? 'ws://127.0.0.1:8088/api/v3/graphql/ws';
const NODE = process.env.NODE_URL ?? 'http://127.0.0.1:9944';
const PROOF_SERVER = process.env.PROOF_SERVER_URL ?? 'http://127.0.0.1:6300';
const NETWORK_ID = process.env.NETWORK_ID ?? 'undeployed';

const logger = pino(
  { level: process.env.DEBUG_LEVEL ?? 'info' },
  pinoPretty({ colorize: true, sync: true, translateTime: true, ignore: 'pid,time', singleLine: false }),
);

// Helper frames for status
const frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
async function withStatus<T>(message: string, fn: () => Promise<T>): Promise<T> {
  let i = 0;
  const interval = setInterval(() => {
    process.stdout.write(`\r  ${frames[i++ % frames.length]} ${message}`);
  }, 80);
  try {
    const result = await fn();
    clearInterval(interval);
    process.stdout.write(`\r  ✓ ${message}\n`);
    return result;
  } catch (e) {
    clearInterval(interval);
    process.stdout.write(`\r  ✗ ${message}\n`);
    throw e;
  }
}

function deriveKeysFromSeed(seed: string) {
  const hdWallet = HDWallet.fromSeed(Buffer.from(seed, 'hex'));
  if (hdWallet.type !== 'seedOk') throw new Error('Failed to initialize HDWallet from seed');

  const result = hdWallet.hdWallet
    .selectAccount(0)
    .selectRoles([Roles.Zswap, Roles.NightExternal, Roles.Dust])
    .deriveKeysAt(0);

  if (result.type !== 'keysDerived') throw new Error('Failed to derive keys');
  hdWallet.hdWallet.clear();
  return result.keys;
}

async function buildWallet(seed: string) {
  const keys = deriveKeysFromSeed(seed);
  const shieldedSecretKeys = ledger.ZswapSecretKeys.fromSeed(keys[Roles.Zswap]);
  const dustSecretKey = ledger.DustSecretKey.fromSeed(keys[Roles.Dust]);
  const unshieldedKeystore = createKeystore(keys[Roles.NightExternal], getNetworkId());

  const shieldedWallet = ShieldedWallet({
    networkId: getNetworkId(),
    indexerClientConnection: { indexerHttpUrl: INDEXER, indexerWsUrl: INDEXER_WS },
    provingServerUrl: new URL(PROOF_SERVER),
    relayURL: new URL(NODE.replace(/^http/, 'ws')),
  }).startWithSecretKeys(shieldedSecretKeys);

  const unshieldedWallet = UnshieldedWallet({
    networkId: getNetworkId(),
    indexerClientConnection: { indexerHttpUrl: INDEXER, indexerWsUrl: INDEXER_WS },
    txHistoryStorage: new InMemoryTransactionHistoryStorage(),
  }).startWithPublicKey(PublicKey.fromKeyStore(unshieldedKeystore));

  const dustWallet = DustWallet({
    networkId: getNetworkId(),
    costParameters: { additionalFeeOverhead: 300_000_000_000_000n, feeBlocksMargin: 5 },
    indexerClientConnection: { indexerHttpUrl: INDEXER, indexerWsUrl: INDEXER_WS },
    provingServerUrl: new URL(PROOF_SERVER),
    relayURL: new URL(NODE.replace(/^http/, 'ws')),
  } as any).startWithSecretKey(dustSecretKey, ledger.LedgerParameters.initialParameters().dust);

  const wallet = new WalletFacade(shieldedWallet, unshieldedWallet, dustWallet);
  await wallet.start(shieldedSecretKeys, dustSecretKey);

  return { wallet, shieldedSecretKeys, dustSecretKey, unshieldedKeystore };
}

async function main() {
  setNetworkId(NETWORK_ID);

  console.log('\n╔══════════════════════════════════════════════════════════╗');
  console.log('║           Midnight Wallet Funding Script                ║');
  console.log('╚══════════════════════════════════════════════════════════╝\n');

  const rl = readline.createInterface({ input, output });

  // 1. Get Sender Seed
  const seedInput = await rl.question('Enter SENDER hex seed (the one with funds): ');
  if (!seedInput.trim()) {
      console.error("❌ Seed is required to sign the transaction.");
      process.exit(1);
  }
  const seed = seedInput.trim();

  // 2. Build Sender Wallet
  const { wallet, shieldedSecretKeys, dustSecretKey, unshieldedKeystore } = await withStatus(
    'Building sender wallet...',
    () => buildWallet(seed),
  );

  // 3. Wait for Sync
  await withStatus('Syncing wallet...', () =>
    Rx.firstValueFrom(
      wallet.state().pipe(
        Rx.filter((s) => s.isSynced),
      ),
    ),
  );
  
  const state = await Rx.firstValueFrom(wallet.state());
  const balance = (state.unshielded?.balances[ledger.nativeToken().raw] ?? 0n);
  console.log(`  ✓ Sender Balance: ${balance.toLocaleString()} tNight`);

  if (balance < 1000_0000000n) {
      console.warn("  ⚠ Warning: Balance might be too low.");
  }

  // 4. Get Recipient
  const recipient = await rl.question('\nEnter RECIPIENT address (from your browser wallet): ');
  if (!recipient.trim()) {
      console.error("❌ Recipient address is required.");
      process.exit(1);
  }
  
  // 5. Transfer logic
  const amountConfig = await rl.question('Enter amount to send (default 1000): ');
  const amountStr = amountConfig.trim() || "1000";
  const amount = BigInt(amountStr) * 10000000n; // Convert to base units

  console.log(`\n  Preparing to send ${amountStr} tNight to ${recipient.trim()}...`);

  try {
      const ttl = new Date(Date.now() + 60 * 60 * 1000);
      
      const transfer: CombinedTokenTransfer[] = [{
        type: 'unshielded',
        outputs: [{
            amount: amount,
            receiverAddress: recipient.trim(),
            type: ledger.unshieldedToken().raw,
        }]
      }];

      const recipe = await wallet.transferTransaction(
          transfer,
          { shieldedSecretKeys, dustSecretKey },
          { ttl }
      );

      const signedRecipe = await wallet.signRecipe(recipe, (payload) => 
          unshieldedKeystore.signData(payload)
      );

      const finalizedTx = await wallet.finalizeRecipe(signedRecipe);
      
      await withStatus('Submitting transaction...', async () => {
          await wallet.submitTransaction(finalizedTx);
      });

      console.log(`\n  ✅ Success! Funds sent.`);
      console.log(`  Wait ~10-20 seconds for them to appear in your browser wallet.`);

  } catch (error) {
      console.error("\n❌ Transfer failed:", error);
  } finally {
      rl.close();
      await wallet.stop();
      process.exit(0);
  }
}

main();
