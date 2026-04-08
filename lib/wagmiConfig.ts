import { http, createConfig, createStorage, cookieStorage } from 'wagmi';
import { base } from 'wagmi/chains';
import { coinbaseWallet, injected } from 'wagmi/connectors';
import { Attribution } from 'ox/erc8021';

const DATA_SUFFIX = Attribution.toDataSuffix({
  codes: ['bc_o1nz9jjh'],
});

export const wagmiConfig = createConfig({
  chains: [base],
  connectors: [
    injected(),
    coinbaseWallet({
      appName: 'BlockStack',
      preference: { options: 'smartWalletOnly' },
    }),
  ],
  storage: createStorage({ storage: cookieStorage }),
  transports: {
    [base.id]: http(),
  },
  dataSuffix: DATA_SUFFIX,
  ssr: true,
});
