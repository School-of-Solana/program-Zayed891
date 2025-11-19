import { useWallet, useConnection } from '@solana/wallet-adapter-react'
import { useMemo } from 'react'

export function useSolana() {
  const { publicKey, connected } = useWallet()
  const { connection } = useConnection()

  const account = useMemo(() => {
    if (!publicKey || !connected) {
      return null
    }
    return {
      address: publicKey.toString(),
      publicKey
    }
  }, [publicKey, connected])

  // Mock cluster object for compatibility
  const cluster = useMemo(() => ({
    id: 'devnet',
    name: 'devnet',
    label: 'Devnet',
    endpoint: 'https://api.devnet.solana.com'
  }), [])

  return {
    account,
    connection,
    connected,
    cluster
  }
}