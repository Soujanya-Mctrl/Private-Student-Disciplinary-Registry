import { type Logger } from 'pino';
import { type ContractAddress } from '@midnight-ntwrk/compact-runtime';
import * as Rx from 'rxjs';
import { DisciplinaryRecord, DisciplinaryRecordPrivateState, createPrivateState } from '@eddalabs/disciplinary-record-contract';
import { deployContract, findDeployedContract } from '@midnight-ntwrk/midnight-js-contracts';
import { PrivateStateProvider } from '@midnight-ntwrk/midnight-js-types';
import { CompiledContract } from '@midnight-ntwrk/compact-js';
import { DisciplinaryPrivateStateId, DisciplinaryProviders, DeployedDisciplinaryContract, emptyState, UserAction, type DerivedState } from './common-types';

// @ts-ignore
const disciplinaryCompiledContract = CompiledContract.make('disciplinary', DisciplinaryRecord.Contract as any).pipe(
  CompiledContract.withVacantWitnesses,
  CompiledContract.withCompiledFileAssets(`${window.location.origin}/midnight/disciplinary`),
);

export interface ContractControllerInterface {
  readonly deployedContractAddress: ContractAddress;   
  readonly state$: Rx.Observable<DerivedState>;
  registerStudent: (studentId: bigint) => Promise<void>;
  addDisciplinaryAction: (studentId: bigint, reasonHash: bigint) => Promise<void>;
  verifyRecord: (studentId: bigint) => Promise<bigint>;
  getLatestReasonHash: (studentId: bigint) => Promise<bigint>;
  initializeContract: () => Promise<void>;
}

export class ContractController implements ContractControllerInterface {
  readonly deployedContractAddress: ContractAddress;
  readonly state$: Rx.Observable<DerivedState>;
  readonly privateStates$: Rx.Subject<DisciplinaryRecordPrivateState>;
  readonly turns$: Rx.Subject<UserAction>;
  readonly currentHashedAddress$: Rx.Observable<bigint>;

  private constructor(
    public readonly contractPrivateStateId: typeof DisciplinaryPrivateStateId,
    public readonly deployedContract: DeployedDisciplinaryContract,
    public readonly providers: DisciplinaryProviders,
    private readonly logger: Logger,
  ) {
    const combine = (_acc: DerivedState, value: DerivedState): DerivedState => {
      return {
        totalStudents: value.totalStudents,
        managerId: value.managerId,
        isAdmin: value.isAdmin,
        currentHashedAddress: value.currentHashedAddress,
        privateState: value.privateState,
        turns: value.turns,        
      };
    };
    this.deployedContractAddress = deployedContract.deployTxData.public.contractAddress;
    this.turns$ = new Rx.Subject<UserAction>();
    this.privateStates$ = new Rx.Subject<DisciplinaryRecordPrivateState>();

    // Reactive hashed address from wallet provider
    this.currentHashedAddress$ = Rx.of(providers.walletProvider).pipe(
      Rx.switchMap((wallet) => {
        const address = (wallet as any).getBech32Address ? (wallet as any).getBech32Address() : "unknown";
        return Rx.from(this.hashAddress(address.toString()));
      }),
      Rx.startWith(0n),
      Rx.shareReplay(1)
    );

    this.state$ = Rx.combineLatest(
      [
        providers.publicDataProvider
          .contractStateObservable(this.deployedContractAddress, { type: 'all' })
          .pipe(Rx.map((contractState) => DisciplinaryRecord.ledger(contractState.data))),
        Rx.concat(
          Rx.from(
            Rx.defer(() => providers.privateStateProvider.get(contractPrivateStateId) as Promise<DisciplinaryRecordPrivateState>),
          ),
          this.privateStates$,
        ),
        Rx.concat(Rx.of<UserAction>({ register: undefined, addAction: undefined, verify: undefined }), this.turns$),
        this.currentHashedAddress$,
      ],
      (ledgerState, privateState, userActions, hashedAddress) => {
        const managerId = (ledgerState.manager as any).lookup(0n) ?? 0n;
        // DEV OVERRIDE: Allow any connected wallet to act as admin in UI
        const isAdmin = hashedAddress !== 0n; // managerId !== 0n && managerId === hashedAddress;
        
        const result: DerivedState = {
          totalStudents: ledgerState.totalStudents,
          managerId: managerId,
          isAdmin: isAdmin,
          currentHashedAddress: hashedAddress,
          privateState: privateState,
          turns: userActions,
        };
        return result;
      },
    ).pipe(
      Rx.scan(combine, emptyState),
      Rx.retry({
        // sometimes websocket fails, if want to add attempts, include count in the object
        delay: 500,
      }),
    );
  }

  private async hashAddress(address: string): Promise<bigint> {
    if (address === "unknown") return 0n;
    const encoder = new TextEncoder();
    const data = encoder.encode(address);
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer)).slice(0, 31);
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return BigInt('0x' + hashHex);
  }

  private async getAuthManagerId(): Promise<bigint> {
    const wallet = await this.providers.walletProvider;
    const address = (wallet as any).getBech32Address ? (wallet as any).getBech32Address() : "unknown";
    return this.hashAddress(address.toString());
  }

  async registerStudent(studentId: bigint): Promise<void> {
    this.logger?.info('registering student');
    this.turns$.next({ register: 'registering student', addAction: undefined, verify: undefined });

    try {
      // const authManagerId = await this.getAuthManagerId(); // Auth removed for public registration
      const txData = await this.deployedContract.callTx.registerStudent(studentId);
      this.logger?.trace({
        registerStudent: {
          message: 'registering student - blockchain info',
          txHash: txData.public.txHash,
          blockHeight: txData.public.blockHeight,
        },
      });
      this.turns$.next({
        register: undefined,
        addAction: undefined,
        verify: undefined,
      });
    } catch (e) {
      this.turns$.next({
        register: undefined,
        addAction: undefined,
        verify: undefined,
      });
      throw e;
    }
  }

  async addDisciplinaryAction(studentId: bigint, reasonHash: bigint): Promise<void> {
    this.logger?.info('adding disciplinary action');
    this.turns$.next({ register: undefined, addAction: 'adding disciplinary action', verify: undefined });

    try {
      const authManagerId = await this.getAuthManagerId();
      const txData = await this.deployedContract.callTx.addDisciplinaryAction(studentId, reasonHash, authManagerId);
      this.logger?.trace({
        addDisciplinaryAction: {
          message: 'adding disciplinary action - blockchain info',
          txHash: txData.public.txHash,
          blockHeight: txData.public.blockHeight,
        },
      });
      this.turns$.next({
        register: undefined,
        addAction: undefined,
        verify: undefined,
      });
    } catch (e) {
      this.turns$.next({
        register: undefined,
        addAction: undefined,
        verify: undefined,
      });
      throw e;
    }
  }

  async verifyRecord(studentId: bigint): Promise<bigint> {
    this.logger?.info('verifying record');
    this.turns$.next({ register: undefined, addAction: undefined, verify: 'verifying record' });

    try {
      const txData = await this.deployedContract.callTx.verifyRecord(studentId);
      this.logger?.trace({
        verifyRecord: {
          message: 'verifying record - blockchain info',
          txHash: txData.public.txHash,
          blockHeight: txData.public.blockHeight,
        },
      });
      const result = txData.public.result as bigint;
      this.turns$.next({
        register: undefined,
        addAction: undefined,
        verify: undefined,
      });
      return result;
    } catch (e) {
      this.turns$.next({
        register: undefined,
        addAction: undefined,
        verify: undefined,
      });
      throw e;
    }
  }

  async getLatestReasonHash(studentId: bigint): Promise<bigint> {
    try {
      const txData = await this.deployedContract.callTx.getLatestReasonHash(studentId);
      return txData.public.result as bigint;
    } catch (e) {
      this.logger?.error('Error getting reason hash', e);
      return 0n;
    }
  }

  async initializeContract(): Promise<void> {
    this.logger?.info('initializing contract');
    try {
      const authManagerId = await this.getAuthManagerId();
      await this.deployedContract.callTx.initialize(authManagerId);
    } catch (e) {
      this.logger?.error('Error initializing contract', e);
      throw e;
    }
  }

  static async deploy(
    contractPrivateStateId: typeof DisciplinaryPrivateStateId,    
    providers: DisciplinaryProviders,
    logger: Logger,
  ): Promise<ContractController> {
    logger.info({
      deployContract: {
        action: "Deploying contract",
        contractPrivateStateId, 
        providers       
      },
    });    
    // @ts-ignore
    const deployedContract = await deployContract(providers, {
      compiledContract: disciplinaryCompiledContract as any,
      privateStateId: contractPrivateStateId,
      initialPrivateState: await ContractController.getPrivateState(contractPrivateStateId, providers.privateStateProvider),
    });

    logger.trace({
      contractDeployed: {
        action: "Contract was deployed",
        contractPrivateStateId,
        finalizedDeployTxData: deployedContract.deployTxData.public,
      },
    });

    return new ContractController(contractPrivateStateId, deployedContract, providers, logger);
  }

  static async join(
    contractPrivateStateId: typeof DisciplinaryPrivateStateId,   
    providers: DisciplinaryProviders,
    contractAddress: ContractAddress,
    logger: Logger,
  ): Promise<ContractController> {
    logger.info({
      joinContract: {
        action: "Joining contract",
        contractPrivateStateId,
        contractAddress,
      },
    });

    // @ts-ignore
    const deployedContract = await findDeployedContract(providers, {
      contractAddress,
      compiledContract: disciplinaryCompiledContract as any,
      privateStateId: contractPrivateStateId,
      initialPrivateState: await ContractController.getPrivateState(contractPrivateStateId, providers.privateStateProvider),
    });

    logger.trace({
      contractJoined: {
        action: "Join the contract successfully",
        contractPrivateStateId,
        finalizedDeployTxData: deployedContract.deployTxData.public,
      },
    });

    return new ContractController(contractPrivateStateId, deployedContract, providers, logger);
  }

  private static async getPrivateState(
    disciplinaryPrivateStateId: typeof DisciplinaryPrivateStateId,
    privateStateProvider: PrivateStateProvider<typeof DisciplinaryPrivateStateId, DisciplinaryRecordPrivateState>,
  ): Promise<DisciplinaryRecordPrivateState> {
    const existingPrivateState = await privateStateProvider.get(disciplinaryPrivateStateId);
    const initialState = await this.getOrCreateInitialPrivateState(disciplinaryPrivateStateId, privateStateProvider);
    return existingPrivateState ?? initialState;
  }

  static async getOrCreateInitialPrivateState(
    disciplinaryPrivateStateId: typeof DisciplinaryPrivateStateId,
    privateStateProvider: PrivateStateProvider<typeof DisciplinaryPrivateStateId, DisciplinaryRecordPrivateState>,
  ): Promise<DisciplinaryRecordPrivateState> {
    let state = await privateStateProvider.get(disciplinaryPrivateStateId);
    
    if (state === null) {
      state = this.createPrivateState();
      await privateStateProvider.set(disciplinaryPrivateStateId, state);
    }
    return state;
  }

  private static createPrivateState(): DisciplinaryRecordPrivateState {    
    return createPrivateState();
  }
}
