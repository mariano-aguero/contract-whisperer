import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import type { Transaction } from "../../types"

interface TransactionsTabProps {
  transactions: Transaction[]
}

export function TransactionsTab({ transactions }: TransactionsTabProps) {
  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString()
  }

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Transactions</CardTitle>
        <CardDescription>Last 10 contract transactions</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {transactions.map((tx, index) => (
            <div
              key={index}
              className="flex items-start justify-between rounded-lg border p-3"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <code className="text-xs font-mono">
                    {truncateAddress(tx.hash)}
                  </code>
                  <Badge
                    variant={tx.status === "success" ? "success" : "destructive"}
                    className="text-xs"
                  >
                    {tx.status}
                  </Badge>
                </div>
                <div className="text-xs text-muted-foreground">
                  <span>From: {truncateAddress(tx.from)}</span>
                  <span className="mx-2">→</span>
                  <span>To: {truncateAddress(tx.to)}</span>
                </div>
                {tx.method && (
                  <p className="text-xs text-muted-foreground">
                    Method: {tx.method}
                  </p>
                )}
              </div>
              <div className="text-end">
                <p className="text-sm font-semibold">{tx.value} ETH</p>
                <p className="text-xs text-muted-foreground">
                  {formatTimestamp(tx.timestamp)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
