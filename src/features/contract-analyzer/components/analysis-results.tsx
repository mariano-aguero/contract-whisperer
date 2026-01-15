"use client"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  AlertTriangle,
  CheckCircle2,
  Code,
  FileText,
  History,
  Shield,
} from "lucide-react"
import type { ContractAnalysis } from "../types"

interface AnalysisResultsProps {
  analysis: ContractAnalysis
}

export function AnalysisResults({ analysis }: AnalysisResultsProps) {
  const getRiskColor = (level: string) => {
    switch (level) {
      case "high":
        return "destructive"
      case "medium":
        return "warning"
      case "low":
        return "success"
      default:
        return "outline"
    }
  }

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString()
  }

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <CardTitle>{analysis.contractName}</CardTitle>
              <CardDescription className="font-mono text-xs">
                {analysis.address}
              </CardDescription>
            </div>
            <Badge variant="outline" className="capitalize">
              {analysis.network}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold">
                <FileText className="h-4 w-4" />
                Summary
              </h3>
              <p className="text-sm text-muted-foreground">
                {analysis.summary}
              </p>
            </div>
            {analysis.compiler && (
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span>Compiler: {analysis.compiler}</span>
                {analysis.optimization !== undefined && (
                  <span>
                    Optimization:{" "}
                    {analysis.optimization ? "Enabled" : "Disabled"}
                  </span>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="risks" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="risks">
            <Shield className="me-2 h-4 w-4" />
            Risks
          </TabsTrigger>
          <TabsTrigger value="functions">
            <Code className="me-2 h-4 w-4" />
            Functions
          </TabsTrigger>
          <TabsTrigger value="transactions">
            <History className="me-2 h-4 w-4" />
            Transactions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="risks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Risk Analysis</CardTitle>
              <CardDescription>
                Potential risks identified by AI
              </CardDescription>
            </CardHeader>
            <CardContent>
              {analysis.risks.length === 0 ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  No significant risks identified
                </div>
              ) : (
                <div className="space-y-4">
                  {analysis.risks.map((risk, index) => (
                    <div
                      key={index}
                      className="rounded-lg border p-4 space-y-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <AlertTriangle
                            className={`h-4 w-4 ${
                              risk.level === "high"
                                ? "text-destructive"
                                : risk.level === "medium"
                                  ? "text-yellow-500"
                                  : "text-blue-500"
                            }`}
                          />
                          <h4 className="font-semibold">{risk.title}</h4>
                        </div>
                        <div className="flex gap-2">
                          <Badge variant={getRiskColor(risk.level)}>
                            {risk.level}
                          </Badge>
                          <Badge variant="outline">{risk.category}</Badge>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {risk.description}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="functions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Main Functions</CardTitle>
              <CardDescription>
                Contract functions with explanations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {analysis.functions.map((func, index) => (
                  <AccordionItem key={index} value={`function-${index}`}>
                    <AccordionTrigger>
                      <div className="flex items-center gap-2">
                        <code className="text-sm font-mono">{func.name}</code>
                        <Badge variant="outline" className="text-xs">
                          {func.stateMutability}
                        </Badge>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-3 pt-2">
                        <p className="text-sm">{func.description}</p>
                        <Separator />
                        <div className="space-y-2">
                          <p className="text-xs font-semibold">Signature:</p>
                          <code className="block rounded bg-muted p-2 text-xs">
                            {func.signature}
                          </code>
                        </div>
                        {func.inputs.length > 0 && (
                          <div className="space-y-2">
                            <p className="text-xs font-semibold">Parameters:</p>
                            <ul className="space-y-1 text-xs">
                              {func.inputs.map((input, i) => (
                                <li key={i} className="font-mono">
                                  {input.name}: {input.type}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {func.outputs.length > 0 && (
                          <div className="space-y-2">
                            <p className="text-xs font-semibold">Returns:</p>
                            <ul className="space-y-1 text-xs">
                              {func.outputs.map((output, i) => (
                                <li key={i} className="font-mono">
                                  {output.name || `output${i}`}: {output.type}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>
                Last 10 contract transactions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analysis.recentTransactions.map((tx, index) => (
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
                          variant={
                            tx.status === "success" ? "success" : "destructive"
                          }
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
        </TabsContent>
      </Tabs>
    </div>
  )
}
