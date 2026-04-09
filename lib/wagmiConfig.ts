import { http, createConfig, createStorage, cookieStorage } from 'wagmi';
import { base } from 'wagmi/chains';
import { baseAccount, injected } from 'wagmi/connectors';
import { Attribution } from 'ox/erc8021';

const DATA_SUFFIX = Attribution.toDataSuffix({
  codes: ['bc_o1nz9jjh'],
});

export const wagmiConfig = createConfig({
  chains: [base],
  connectors: [
    injected(),
    baseAccount({
      appName: 'BlockStack',
    }),
  ],
  storage: createStorage({ storage: cookieStorage }),
  transports: {
    [base.id]: http(),
  },
  dataSuffix: DATA_SUFFIX,
  ssr: true,
});

declare module 'wagmi' {
  interface Register {
    config: typeof wagmiConfig;
  }
}
