// @ts-nocheck
import { Counter, type CounterPrivateState } from '@eddalabs/counter-contract';
import type { MidnightProviders } from '@midnight-ntwrk/midnight-js-types';
import type { DeployedContract, FoundContract } from '@midnight-ntwrk/midnight-js-contracts';
import type { ImpureCircuitId } from '@midnight-ntwrk/compact-js';

export type CounterCircuits = any;

export const CounterPrivateStateId = 'counterPrivateState';

export type CounterProviders = MidnightProviders<any, typeof CounterPrivateStateId, CounterPrivateState>;

export type CounterContract = any;

export type DeployedCounterContract = any;

export type UserAction = {
  increment: string | undefined;  
};

export type DerivedState = {
  readonly round: bigint;
};

export const emptyState: DerivedState = {
  round: 0n,
};
