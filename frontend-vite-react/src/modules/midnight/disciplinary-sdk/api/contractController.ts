import { type Logger } from 'pino';
import { type ContractAddress } from '@midnight-ntwrk/compact-runtime';
import * as Rx from 'rxjs';
import { DisciplinaryRecord, DisciplinaryRecordPrivateState, createPrivateState } from '@eddalabs/disciplinary-record-contract';
import { deployContract, findDeployedContract } from '@midnight-ntwrk/midnight-js-contracts';
import { PrivateStateProvider } from '@midnight-ntwrk/midnight-js-types';
import { CompiledContract } from '@midnight-ntwrk/compact-js';
import { DisciplinaryPrivateStateId, DisciplinaryProviders, DeployedDisciplinaryContract, emptyState, UserAction, type DerivedState } from './common-types';

const disciplinaryCompiledContract = CompiledContract.make('disciplinary', DisciplinaryRecord.Contract).pipe(
  CompiledContract.withVacantWitnesses,
  CompiledContract.withCompiledFileAssets(`${window.location.origin}/midnight/disciplinary`),
);

export interface ContractControllerInterface {
  readonly deployedContractAddress: ContractAddress;   
  readonly state$: Rx.Observable<DerivedState>;
  registerStudent: (studentId: bigint) => Promise<void>;
  addDisciplinaryAction: (studentId: bigint) => Promise<void>;
  verifyRecord: (studentId: bigint) => Promise<bigint>;
}

export class ContractController implements ContractControllerInterface {
  readonly deployedContractAddress: ContractAddress;
  readonly state$: Rx.Observable<DerivedState>;
  readonly privateStates$: Rx.Subject<DisciplinaryRecordPrivateState>;
  readonly turns$: Rx.Subject<UserAction>;  

  private constructor(
    public readonly contractPrivateStateId: typeof DisciplinaryPrivateStateId,
    public readonly deployedContract: DeployedDisciplinaryContract,
    public readonly providers: DisciplinaryProviders,
    private readonly logger: Logger,
  ) {
    const combine = (_acc: DerivedState, value: DerivedState): DerivedState => {
      return {
        totalStudents: value.totalStudents,
        privateState: value.privateState,
        turns: value.turns,        
      };
    };
    this.deployedContractAddress = deployedContract.deployTxData.public.contractAddress;
    this.turns$ = new Rx.Subject<UserAction>();
    this.privateStates$ = new Rx.Subject<DisciplinaryRecordPrivateState>();
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
      ],
      (ledgerState, privateState, userActions) => {
        const result: DerivedState = {
          totalStudents: ledgerState.totalStudents,
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

  async registerStudent(studentId: bigint): Promise<void> {
    this.logger?.info('registering student');
    this.turns$.next({ register: 'registering student', addAction: undefined, verify: undefined });

    try {
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

  async addDisciplinaryAction(studentId: bigint): Promise<void> {
    this.logger?.info('adding disciplinary action');
    this.turns$.next({ register: undefined, addAction: 'adding disciplinary action', verify: undefined });

    try {
      const txData = await this.deployedContract.callTx.addDisciplinaryAction(studentId);
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
    const deployedContract = await deployContract(providers, {
      compiledContract: disciplinaryCompiledContract,
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

    const deployedContract = await findDeployedContract(providers, {
      contractAddress,
      compiledContract: disciplinaryCompiledContract,
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
