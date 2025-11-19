import { PublicKey } from '@solana/web3.js'
import { useConnection } from '@solana/wallet-adapter-react'
import { useQuery } from '@tanstack/react-query'

export function useGetBalanceQuery({ address }: { address: PublicKey | string }) {
  const { connection } = useConnection()
  
  const publicKey = typeof address === 'string' ? new PublicKey(address) : address

  return useQuery({
    retry: false,
    queryKey: ['get-balance', { endpoint: connection.rpcEndpoint, address: publicKey.toBase58() }],
    queryFn: async () => {
      const balance = await connection.getBalance(publicKey)
      return { value: balance }
    },
  })
}
