'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from './theme-provider';
import { Toaster } from './ui/sonner';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

import { Environment, ParaProvider } from '@getpara/react-sdk';
import '@getpara/react-sdk/styles.css';
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 30,
    },
  },
});
export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <ParaProvider
        paraClientConfig={{
          env: Environment.DEV,
          apiKey: process.env.NEXT_PUBLIC_PARA_API_KEY || '',
        }}
        config={{
          appName:
            process.env.NEXT_PUBLIC_PARA_APP_NAME || 'Solana Time-base wallet',
        }}
        externalWalletConfig={{
          wallets: ['PHANTOM', 'BACKPACK', 'SOLFLARE'],
          solanaConnector: {
            config: {
              endpoint:
                process.env.NEXT_PUBLIC_SOLANA_RPC_URL ||
                'https://devnet.api.solana.com',
              chain: 'devnet',
              appIdentity: {
                name:
                  process.env.NEXT_PUBLIC_PARA_APP_NAME ||
                  'Solana Time-base wallet',
                uri:
                  typeof window !== 'undefined'
                    ? `${window.location.protocol}//${window.location.host}`
                    : '',
              },
            },
          },
        }}
        paraModalConfig={{
          disablePhoneLogin: true,
          disableEmailLogin: false,
          authLayout: ['AUTH:CONDENSED', 'EXTERNAL:FULL'],
          onRampTestMode: true,
          logo: '/sol.svg',
          theme: {
            foregroundColor: '#9945FF',
            backgroundColor: '',
            accentColor: '',
            font: 'Space Mono',
            borderRadius: 'sm',
          },
          oAuthMethods: ['GOOGLE', 'TWITTER'],
          recoverySecretStepEnabled: true,
        }}
      >
        <ThemeProvider
          attribute='class'
          defaultTheme='system'
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster richColors />
        </ThemeProvider>
      </ParaProvider>
      {/* <ReactQueryDevtools initialIsOpen={false} /> */}
    </QueryClientProvider>
  );
}
