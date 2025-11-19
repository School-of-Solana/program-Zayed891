import { PublicKey } from '@solana/web3.js'
import { useMemo } from 'react'
import { useParams } from 'react-router'
import { AppHero } from '@/components/app-hero'
import { AppExplorerLink } from '@/components/app-explorer-link'
import { ellipsify } from '@/lib/utils'

export default function AccountFeatureDetail() {
  const params = useParams() as { address: string }
  const address = useMemo(() => {
    if (!params.address || typeof params.address !== 'string') {
      return
    }
    try {
      new PublicKey(params.address)
      return params.address
    } catch {
      return
    }
  }, [params])
  
  if (!address) {
    return <div>Error loading account</div>
  }

  return (
    <div>
      <AppHero
        title={<h1 className="text-5xl font-bold">Account Details</h1>}
        subtitle={
          <div className="my-4">
            <AppExplorerLink address={address.toString()} label={ellipsify(address.toString())} />
          </div>
        }
      >
        <div className="my-4">
          <div className="text-center p-4 bg-base-200 rounded">
            <p>Account management features are available in demo mode only for this deployment</p>
          </div>
        </div>
      </AppHero>
      <div className="space-y-8">
        <div className="text-center p-4 bg-base-200 rounded">
          <p>Account details for {ellipsify(address.toString())}</p>
        </div>
      </div>
    </div>
  )
}
