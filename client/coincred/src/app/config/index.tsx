import { defaultWagmiConfig } from '@web3modal/wagmi/react/config'
import { cookieStorage, createStorage } from 'wagmi'
import { defineChain } from 'viem'

// 👇 Local Anvil test chain
const localAnvil = defineChain({
  id: 31337,
  name: 'Local Anvil',
  nativeCurrency: {
    name: 'Ether',
    symbol: 'ETH',
    decimals: 18
  },
  rpcUrls: {
    default: { http: [process.env.NEXT_PUBLIC_RPC_URL || 'http://10.185.76.64:8545'] }
  },
})

export const projectId = 'a354850f4268cf041c5c0ba35d69e4ae'

if (!projectId) throw new Error('Project ID is not defined')

const metadata = {
  name: 'CoinCred',
  description: 'Local Blockchain Testing with Anvil',
  url: 'http://localhost:3000',
  icons: ['https://avatars.githubusercontent.com/u/37784886']
}

export const config = defaultWagmiConfig({
  chains: [localAnvil],
  projectId,
  metadata,
  ssr: true,
  storage: createStorage({
    storage: cookieStorage,
  }),
})
