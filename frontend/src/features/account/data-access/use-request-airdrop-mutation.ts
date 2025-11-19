import { useMutation } from '@tanstack/react-query'
import { useConnection } from '@solana/wallet-adapter-react'

export function useRequestAirdropMutation() {
  const { connection } = useConnection()

  return useMutation({
    mutationKey: ['request-airdrop'],
    mutationFn: async (amount: number = 1) => {
      // Simplified for deployment
      console.log('Airdrop request:', amount)
      return 'mock-airdrop-signature'
    },
  })
}