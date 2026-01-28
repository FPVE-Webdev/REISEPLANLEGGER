'use client'

interface TransportInfo {
  [key: string]: any
}

interface TransportCalloutProps {
  transport: TransportInfo
  compact?: boolean
}

export function TransportCallout({ transport, compact = false }: TransportCalloutProps) {
  if (!transport) return null

  return (
    <div className={compact ? "text-xs text-arctic-300" : "p-3 bg-arctic-900/50 rounded border border-arctic-700"}>
      <p className={compact ? "" : "text-sm font-semibold text-aurora-cyan mb-2"}>Transport Info</p>
      <pre className={compact ? "text-xs" : "text-xs overflow-auto"}>{JSON.stringify(transport, null, 2)}</pre>
    </div>
  )
}
