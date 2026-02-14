// @ts-nocheck
import { type CounterPrivateState, Counter, createPrivateState } from '@eddalabs/counter-contract';
import type { ImpureCircuitId } from '@midnight-ntwrk/compact-js';
import type { MidnightProviders } from '@midnight-ntwrk/midnight-js-types';
import type { DeployedContract, FoundContract } from '@midnight-ntwrk/midnight-js-contracts';

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
  readonly privateState: CounterPrivateState;
  readonly turns: UserAction;
};

export const emptyState: DerivedState = {
  round: 0n,
  privateState: createPrivateState(0),
  turns: { increment: undefined },
};
