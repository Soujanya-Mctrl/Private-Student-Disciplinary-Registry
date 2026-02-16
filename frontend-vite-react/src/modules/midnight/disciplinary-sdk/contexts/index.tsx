import { DeployedProvider } from './disciplinary-deployment';
import { LocalStorageProvider } from './disciplinary-localStorage';
import { Provider } from './disciplinary-providers';
import { Logger } from 'pino';
import { ContractAddress } from '@midnight-ntwrk/compact-runtime';

export * from './disciplinary-providers';
export * from './disciplinary-localStorage';
export * from './disciplinary-localStorage-class';
export * from './disciplinary-deployment';
export * from './disciplinary-deployment-class';

interface AppProviderProps {
  children: React.ReactNode;
  logger: Logger;  
  contractAddress: ContractAddress;
}

export const DisciplinaryAppProvider = ({ children, logger, contractAddress }: AppProviderProps) => {
  return (
    <LocalStorageProvider logger={logger}>
      <Provider logger={logger}>
        <DeployedProvider logger={logger} contractAddress={contractAddress}>
          {children}
        </DeployedProvider>
      </Provider>
    </LocalStorageProvider>
  );
};
