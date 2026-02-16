import type * as __compactRuntime from '@midnight-ntwrk/compact-runtime';

export type Witnesses<PS> = {
}

export type ImpureCircuits<PS> = {
  initialize(context: __compactRuntime.CircuitContext<PS>, managerId_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  registerStudent(context: __compactRuntime.CircuitContext<PS>,
                  studentId_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  addDisciplinaryAction(context: __compactRuntime.CircuitContext<PS>,
                        studentId_0: bigint,
                        reasonHash_0: bigint,
                        authManagerId_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  verifyRecord(context: __compactRuntime.CircuitContext<PS>, studentId_0: bigint): __compactRuntime.CircuitResults<PS, bigint>;
  getLatestReasonHash(context: __compactRuntime.CircuitContext<PS>,
                      studentId_0: bigint): __compactRuntime.CircuitResults<PS, bigint>;
}

export type PureCircuits = {
}

export type Circuits<PS> = {
  initialize(context: __compactRuntime.CircuitContext<PS>, managerId_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  registerStudent(context: __compactRuntime.CircuitContext<PS>,
                  studentId_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  addDisciplinaryAction(context: __compactRuntime.CircuitContext<PS>,
                        studentId_0: bigint,
                        reasonHash_0: bigint,
                        authManagerId_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  verifyRecord(context: __compactRuntime.CircuitContext<PS>, studentId_0: bigint): __compactRuntime.CircuitResults<PS, bigint>;
  getLatestReasonHash(context: __compactRuntime.CircuitContext<PS>,
                      studentId_0: bigint): __compactRuntime.CircuitResults<PS, bigint>;
}

export type Ledger = {
  readonly totalStudents: bigint;
  accounts: {
    isEmpty(): boolean;
    size(): bigint;
    member(key_0: bigint): boolean;
    lookup(key_0: bigint): bigint;
    [Symbol.iterator](): Iterator<[bigint, bigint]>
  };
  reasons: {
    isEmpty(): boolean;
    size(): bigint;
    member(key_0: bigint): boolean;
    lookup(key_0: bigint): bigint;
    [Symbol.iterator](): Iterator<[bigint, bigint]>
  };
  manager: {
    isEmpty(): boolean;
    size(): bigint;
    member(key_0: bigint): boolean;
    lookup(key_0: bigint): bigint;
    [Symbol.iterator](): Iterator<[bigint, bigint]>
  };
}

export type ContractReferenceLocations = any;

export declare const contractReferenceLocations : ContractReferenceLocations;

export declare class Contract<PS = any, W extends Witnesses<PS> = Witnesses<PS>> {
  witnesses: W;
  circuits: Circuits<PS>;
  impureCircuits: ImpureCircuits<PS>;
  constructor(witnesses: W);
  initialState(context: __compactRuntime.ConstructorContext<PS>): __compactRuntime.ConstructorResult<PS>;
}

export declare function ledger(state: __compactRuntime.StateValue | __compactRuntime.ChargedState): Ledger;
export declare const pureCircuits: PureCircuits;
