'use client'

import { useMemo } from 'react'
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react'
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui'

const RPC_ENDPOINT =
  process.env.NEXT_PUBLIC_SOLANA_RPC_URL ?? 'https://api.mainnet-beta.solana.com'

export default function SolanaWalletProvider({ children }: { children: React.ReactNode }) {
  // Pass empty array — wallet-standard-wallet-adapter-react auto-detects
  // Phantom/Solflare from the Wallet Standard API injected by extensions.
  // Passing legacy adapters (PhantomWalletAdapter etc.) alongside auto-detected
  // Standard adapters causes duplicates and a race where the wrong adapter wins.
  const wallets = useMemo(() => [], [])

  return (
    <ConnectionProvider endpoint={RPC_ENDPOINT}>
      <WalletProvider wallets={wallets} autoConnect={false}>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  )
}
