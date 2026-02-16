import { createRootRoute, Outlet } from '@tanstack/react-router';
import * as pino from "pino";
import { ThemeProvider } from "@/components/theme-provider";
import { MidnightMeshProvider } from "@/modules/midnight/wallet-widget/contexts/wallet";
import { DisciplinaryAppProvider } from '../modules/midnight/disciplinary-sdk/contexts';
import { MainLayout } from "@/layouts/layout";
import { DemoModeProvider } from "@/contexts/demo-mode";

import { MidnightWallet } from "@/modules/midnight/wallet-widget/ui/midnightWallet";

export const logger = pino.pino({
  level: "trace",
});

// Update this with your deployed contract address
const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS!;

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <DemoModeProvider>
        <MidnightMeshProvider logger={logger}>
          <DisciplinaryAppProvider logger={logger} contractAddress={contractAddress}>
            <MainLayout>
              <Outlet />
            </MainLayout>
            <MidnightWallet />
          </DisciplinaryAppProvider>
        </MidnightMeshProvider>
      </DemoModeProvider>
    </ThemeProvider>
  );
}
