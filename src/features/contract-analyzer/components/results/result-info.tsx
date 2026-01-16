import { Code, CheckCircle2, FileText } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import type { ContractAnalysis } from "../../types"

interface ResultHeaderProps {
  title: string
  address: string
  isVerified?: boolean
  isProxy?: boolean
  isERC20?: boolean
  network?: string
  tokenInfo?: ContractAnalysis["tokenInfo"]
  implementation?: boolean
}

export function ResultHeader({
  title,
  address,
  isVerified,
  isProxy,
  isERC20,
  network,
  tokenInfo,
  implementation,
}: ResultHeaderProps) {
  return (
    <CardHeader>
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <CardTitle className="flex items-center gap-2">
            <Code className="h-5 w-5" />
            {title}
            {isERC20 && tokenInfo && (
              <Badge variant="success" className="text-xs">
                ERC20
              </Badge>
            )}
          </CardTitle>
          {tokenInfo && (
            <p className="mt-1 text-sm text-muted-foreground">
              {tokenInfo.name} ({tokenInfo.symbol})
            </p>
          )}
          <CardDescription className="font-mono text-xs">
            {address}
          </CardDescription>
        </div>
        <div className="flex gap-2">
          {isVerified && (
            <Badge variant="success" className="flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" />
              Verified
            </Badge>
          )}
          {isProxy && <Badge variant="secondary">Proxy</Badge>}
          {implementation && <Badge variant="success">Implementation</Badge>}
          {network && (
            <Badge variant="outline" className="capitalize">
              {network}
            </Badge>
          )}
        </div>
      </div>
    </CardHeader>
  )
}

interface ResultSummaryProps {
  summary: string
  compiler?: string
  optimization?: boolean
  contractName?: string
}

export function ResultSummary({
  summary,
  compiler,
  optimization,
  contractName,
}: ResultSummaryProps) {
  return (
    <CardContent>
      <div className="space-y-4">
        <div>
          <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold">
            <FileText className="h-4 w-4" />
            Summary
          </h3>
          <p className="text-sm text-muted-foreground">{summary}</p>
        </div>
        {(compiler || contractName) && (
          <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
            {contractName && <span>Contract: {contractName}</span>}
            {compiler && <span>Compiler: {compiler}</span>}
            {optimization !== undefined && (
              <span>Optimization: {optimization ? "Enabled" : "Disabled"}</span>
            )}
          </div>
        )}
      </div>
    </CardContent>
  )
}
