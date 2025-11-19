import { ArrowUpRightFromSquare } from 'lucide-react'

export function AppExplorerLink({
  className,
  label = '',
  address
}: {
  className?: string
  label: string
  address: string
}) {
  const explorerUrl = `https://explorer.solana.com/address/${address}?cluster=devnet`
  
  return (
    <a
      href={explorerUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={className ? className : `link font-mono inline-flex gap-1`}
    >
      {label}
      <ArrowUpRightFromSquare size={12} />
    </a>
  )
}
