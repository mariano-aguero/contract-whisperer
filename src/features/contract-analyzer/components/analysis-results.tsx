"use client"

import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Code, History, Shield, ShieldAlert } from "lucide-react"
import type { ContractAnalysis } from "../types"
import { ResultHeader, ResultSummary } from "./results/result-info"
import { RisksTab } from "./results/risks-tab"
import { SecurityTab } from "./results/security-tab"
import { FunctionsTab } from "./results/functions-tab"
import { TransactionsTab } from "./results/transactions-tab"

interface AnalysisResultsProps {
  analysis: ContractAnalysis
}

export function AnalysisResults({ analysis }: AnalysisResultsProps) {
  return (
    <div className="space-y-6">
      <Card>
        <ResultHeader
          title={analysis.contractName || "Contract"}
          address={analysis.address}
          isVerified={analysis.isVerified}
          isProxy={analysis.isProxy}
          isERC20={analysis.isERC20}
          network={analysis.network}
          tokenInfo={analysis.tokenInfo}
        />
        <ResultSummary
          summary={analysis.summary}
          compiler={analysis.compiler}
          optimization={analysis.optimization}
        />
      </Card>

      {analysis.implementation && (
        <Card>
          <ResultHeader
            title="Implementation Contract"
            address={analysis.implementation.address}
            isVerified={analysis.implementation.isVerified}
            implementation
          />
          <ResultSummary
            summary={analysis.implementation.summary}
            compiler={analysis.implementation.compiler}
            optimization={analysis.implementation.optimization}
            contractName={analysis.implementation.contractName}
          />
        </Card>
      )}

      <Tabs defaultValue="risks" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="risks">
            <Shield className="me-2 h-4 w-4" />
            Risks
          </TabsTrigger>
          <TabsTrigger value="security">
            <ShieldAlert className="me-2 h-4 w-4" />
            Security
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
          <RisksTab risks={analysis.risks} isProxy={analysis.isProxy} />

          {analysis.implementation && (
            <RisksTab
              risks={analysis.implementation.risks}
              isImplementation
              address={analysis.implementation.address}
            />
          )}
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <SecurityTab securityAnalysis={analysis.securityAnalysis} />
        </TabsContent>

        <TabsContent value="functions" className="space-y-4">
          <FunctionsTab
            functions={analysis.functions}
            isProxy={analysis.isProxy}
          />

          {analysis.implementation && (
            <FunctionsTab
              functions={analysis.implementation.functions}
              isImplementation
              address={analysis.implementation.address}
            />
          )}
        </TabsContent>

        <TabsContent value="transactions" className="space-y-4">
          <TransactionsTab transactions={analysis.recentTransactions} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
