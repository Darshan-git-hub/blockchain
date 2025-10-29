import { defaultWagmiConfig } from '@web3modal/wagmi/react/config'
import { cookieStorage, createStorage } from 'wagmi'
import { liskSepolia } from 'wagmi/chains'

// ✅ Add your local chain definition
const anvilLocal = {
  id: 31337,
  name: 'Anvil Local',
  network: 'localhost',
  nativeCurrency: {
    decimals: 18,
    name: 'Ethereum',
    symbol: 'ETH'
  },
  rpcUrls: {
    default: {
      http: ['http://192.168.137.1:8545'] // ← your Anvil RPC URL
    },
    public: {
      http: ['http://192.168.137.1:8545']
    }
  }
} as const

// ✅ Your WalletConnect project ID (from cloud.walletconnect.com)
export const projectId = "a354850f4268cf041c5c0ba35d69e4ae"
if (!projectId) throw new Error('Project ID is not defined')

// ✅ Metadata shown in wallet connection modal
const metadata = {
  name: 'CoinCred',
  description: 'CoinCred DApp (Local Blockchain)',
  url: 'http://localhost:3000', // use your frontend URL
  icons: ['https://avatars.githubusercontent.com/u/37784886']
}

// ✅ Create Wagmi + Web3Modal config
const chains = [anvilLocal, liskSepolia] as const

export const config = defaultWagmiConfig({
  chains,
  projectId,
  metadata,
  ssr: true,
  storage: createStorage({
    storage: cookieStorage
  })
})
