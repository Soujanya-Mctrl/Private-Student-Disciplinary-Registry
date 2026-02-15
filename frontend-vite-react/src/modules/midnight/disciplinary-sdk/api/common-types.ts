// @ts-nocheck
import { type DisciplinaryRecordPrivateState, DisciplinaryRecord, createPrivateState } from '@eddalabs/disciplinary-record-contract';
import type { ImpureCircuitId } from '@midnight-ntwrk/compact-js';
import type { MidnightProviders } from '@midnight-ntwrk/midnight-js-types';
import type { DeployedContract, FoundContract } from '@midnight-ntwrk/midnight-js-contracts';

export type DisciplinaryCircuits = any;

export const DisciplinaryPrivateStateId = 'disciplinaryPrivateState';

export type DisciplinaryProviders = MidnightProviders<any, typeof DisciplinaryPrivateStateId, DisciplinaryRecordPrivateState>;

export type DisciplinaryContract = any;

export type DeployedDisciplinaryContract = any;

export type UserAction = {
  register: string | undefined;  
  addAction: string | undefined;
  verify: string | undefined;
};

export type DerivedState = {
  readonly totalStudents: bigint;
  readonly privateState: DisciplinaryRecordPrivateState;
  readonly turns: UserAction;
};

export const emptyState: DerivedState = {
  totalStudents: 0n,
  privateState: createPrivateState(),
  turns: { register: undefined, addAction: undefined, verify: undefined },
};
