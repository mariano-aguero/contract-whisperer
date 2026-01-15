"use server"

import { z } from "zod"
import { actionClient } from "@/lib/safe-action"
import {
  getContractSourceCode,
  getContractABI,
  getContractTransactions,
  parseABI,
} from "@/lib/etherscan"
import { analyzeContract } from "@/lib/anthropic"
import { isAddress, formatEther } from "viem"
import type { ContractAnalysis, Transaction } from "./types"

const analyzeContractSchema = z.object({
  address: z.string().refine((addr) => isAddress(addr), {
    message: "Invalid Ethereum address",
  }),
  network: z.enum(["ethereum", "base"]).default("ethereum"),
})

export const analyzeContractAction = actionClient
  .schema(analyzeContractSchema)
  .action(async ({ parsedInput }): Promise<ContractAnalysis> => {
    const { address, network } = parsedInput

    try {
      // 1. Fetch contract source code from Etherscan/Basescan
      const contractData = await getContractSourceCode(address, network)

      if (!contractData.result || contractData.result.length === 0) {
        throw new Error("Contract not found or not verified")
      }

      const contract = contractData.result[0]

      if (!contract.SourceCode) {
        throw new Error(
          "Contract source code not available. The contract must be verified on Etherscan/Basescan."
        )
      }

      // Parse source code (handle both single file and JSON format)
      let sourceCode = contract.SourceCode
      if (sourceCode.startsWith("{{")) {
        // Multi-file format
        try {
          const parsed = JSON.parse(sourceCode.slice(1, -1))
          sourceCode = Object.values(parsed.sources || {})
            .map((s: any) => s.content)
            .join("\n\n")
        } catch {
          // If parsing fails, use as is
        }
      } else if (sourceCode.startsWith("{")) {
        // Single file JSON format
        try {
          const parsed = JSON.parse(sourceCode)
          sourceCode = Object.values(parsed.sources || {})
            .map((s: any) => s.content)
            .join("\n\n")
        } catch {
          // If parsing fails, use as is
        }
      }

      // 2. Fetch contract ABI using dedicated endpoint
      const abiString = await getContractABI(address, network)
      const abi = parseABI(abiString)

      // 2. Fetch recent transactions
      const txData = await getContractTransactions(address, network, 10)
      const transactions: Transaction[] = txData.result.map((tx) => ({
        hash: tx.hash,
        from: tx.from,
        to: tx.to,
        value: formatEther(BigInt(tx.value)),
        timestamp: parseInt(tx.timeStamp),
        method: tx.functionName || undefined,
        status: tx.isError === "0" ? "success" : "failed",
      }))

      // 3. Analyze with Claude AI
      const analysis = await analyzeContract(
        sourceCode,
        contract.ContractName,
        abi
      )

      // 4. Combine all data
      const result: ContractAnalysis = {
        address,
        network,
        summary: analysis.summary,
        risks: analysis.risks,
        functions: analysis.functions,
        recentTransactions: transactions,
        sourceCode,
        contractName: contract.ContractName,
        compiler: contract.CompilerVersion,
        optimization: contract.OptimizationUsed === "1",
      }

      return result
    } catch (error) {
      console.error("Error analyzing contract:", error)
      if (error instanceof Error) {
        throw new Error(`Failed to analyze contract: ${error.message}`)
      }
      throw new Error("Failed to analyze contract")
    }
  })
