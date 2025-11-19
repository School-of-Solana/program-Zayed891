import { useConnection } from '@solana/wallet-adapter-react'
import { useQuery } from '@tanstack/react-query'

export function useClusterVersion() {
  const { connection } = useConnection()
  return useQuery({
    retry: false,
    queryKey: ['version', { endpoint: connection.rpcEndpoint }],
    queryFn: async () => {
      try {
        const version = await connection.getVersion()
        return version
      } catch (error) {
        throw new Error('Failed to connect to cluster')
      }
    },
  })
}
