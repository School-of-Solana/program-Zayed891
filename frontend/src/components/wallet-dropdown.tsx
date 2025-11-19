import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'

export function WalletDropdown() {
  return (
    <div className="flex items-center">
      <WalletMultiButton />
    </div>
  )
}
