import { PublicKey } from '@solana/web3.js'

export function AccountUiButtons({ address }: { address: PublicKey | string }) {
  return (
    <div className="space-x-2">
      <button className="btn btn-xs" disabled>
        Airdrop (Demo Mode)
      </button>
      <button className="btn btn-xs" disabled>
        Send (Demo Mode)
      </button>
      <button className="btn btn-xs" disabled>
        Receive (Demo Mode)
      </button>
    </div>
  )
}
