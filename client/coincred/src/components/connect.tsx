'use client'
import { useAccount, useConnect, useDisconnect } from 'wagmi'

export default function ConnectButton() {
  const { address, isConnected } = useAccount()
  const { connect, connectors } = useConnect()
  const { disconnect } = useDisconnect()

  if (isConnected)
    return (
      <div>
        <p>Connected to: {address}</p>
        <button onClick={() => disconnect()}>Disconnect</button>
      </div>
    )

  return (
    <button onClick={() => connect({ connector: connectors[0] })}>
      Connect Wallet
    </button>
  )
}
