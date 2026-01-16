"use client"

import { useState } from "react"
import { useAction } from "next-safe-action/hooks"
import { analyzeContractAction } from "../actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { AlertCircle, Loader2, Search } from "lucide-react"
import { AnalysisResults } from "./analysis-results"
import { AnalysisSkeleton } from "./analysis-skeleton"
import { ThemeToggle } from "@/components/theme-toggle"

export function ContractAnalyzer() {
  const [address, setAddress] = useState("")
  const [network, setNetwork] = useState<"ethereum" | "base">("ethereum")

  const { execute, result, isExecuting } = useAction(analyzeContractAction)

  const hasErrored = result?.serverError || result?.validationErrors

  const handleAnalyze = () => {
    if (!address) return
    execute({ address, network })
  }

  return (
    <div className="container mx-auto max-w-6xl space-y-8 py-8">
      <div className="flex items-start justify-between">
        <div className="flex-1 space-y-2 text-center">
          <h1 className="text-4xl font-bold tracking-tight">
            Contract Whisperer
          </h1>
          <p className="text-lg text-muted-foreground">
            Analyze Ethereum smart contracts with AI
          </p>
        </div>
        <ThemeToggle />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Analyze Contract</CardTitle>
          <CardDescription>
            Enter the address of a verified contract on Etherscan or Basescan
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="address">Contract Address</Label>
            <Input
              id="address"
              placeholder="0x..."
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              disabled={isExecuting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="network">Network</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={network === "ethereum" ? "default" : "outline"}
                onClick={() => setNetwork("ethereum")}
                disabled={isExecuting}
              >
                Ethereum
              </Button>
              <Button
                type="button"
                variant={network === "base" ? "default" : "outline"}
                onClick={() => setNetwork("base")}
                disabled={isExecuting}
              >
                Base
              </Button>
            </div>
          </div>

          <Button
            onClick={handleAnalyze}
            disabled={!address || isExecuting}
            className="w-full"
          >
            {isExecuting ? (
              <>
                <Loader2 className="me-2 h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Search className="me-2 h-4 w-4" />
                Analyze Contract
              </>
            )}
          </Button>

          {hasErrored && !isExecuting && (
            <div className="flex items-start gap-2 rounded-lg border border-destructive bg-destructive/10 p-4">
              <AlertCircle className="h-5 w-5 text-destructive" />
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium text-destructive">Error</p>
                <p className="text-sm text-muted-foreground">
                  {result?.serverError ===
                  "The AI service is currently unavailable. Please try again later."
                    ? "The AI service is currently unavailable. Please try again later."
                    : result?.serverError ||
                      (result?.validationErrors && "Invalid address format") ||
                      "Could not analyze the contract. Verify that the address is correct and the contract is verified."}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {isExecuting && <AnalysisSkeleton />}
      {!isExecuting && result?.data && (
        <AnalysisResults analysis={result.data} />
      )}
    </div>
  )
}
