"use server"

import { z } from "zod"
import { actionClient } from "@/lib/safe-action"
import {
  getContractSourceCode,
  getContractABI,
  getContractTransactions,
  parseABI,
  isERC20Token,
  getTokenInfo,
} from "@/lib/etherscan"
import { analyzeContract, analyzeContractSecurity } from "@/lib/anthropic"
import { isAddress, formatEther } from "viem"
import type { ContractAnalysis, Transaction, ContractImplementation } from "./types"

const analyzeContractSchema = z.object({
  address: z.string().refine((addr) => isAddress(addr), {
    message: "Invalid Ethereum address",
  }),
  network: z.enum(["ethereum", "base"]).default("ethereum"),
})

/**
 * Helper function to add delay between API calls to avoid rate limiting
 */
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Helper function to parse source code from different formats
 */
function parseSourceCode(sourceCode: string): string {
  if (sourceCode.startsWith("{{")) {
    // Multi-file format
    try {
      const parsed = JSON.parse(sourceCode.slice(1, -1))
      return Object.values(parsed.sources || {})
        .map((s: any) => s.content)
        .join("\n\n")
    } catch {
      return sourceCode
    }
  } else if (sourceCode.startsWith("{")) {
    // Single file JSON format
    try {
      const parsed = JSON.parse(sourceCode)
      return Object.values(parsed.sources || {})
        .map((s: any) => s.content)
        .join("\n\n")
    } catch {
      return sourceCode
    }
  }
  return sourceCode
}

/**
 * Helper function to analyze a single contract (proxy or implementation)
 */
async function analyzeSingleContract(
  address: string,
  network: "ethereum" | "base"
): Promise<{
  sourceCode: string
  contractName: string
  compiler: string
  optimization: boolean
  summary: string
  risks: any[]
  functions: any[]
  abi: any[]
  isVerified: boolean
}> {
  // Fetch contract source code
  const contractData = await getContractSourceCode(address, network)

  if (!contractData.result || contractData.result.length === 0) {
    throw new Error("Contract not found or not verified")
  }

  const contract = contractData.result[0]

  // Check if contract is verified (has source code)
  const isVerified = !!(contract.SourceCode && contract.SourceCode.trim() !== "")

  if (!contract.SourceCode) {
    throw new Error(
      "Contract source code not available. The contract must be verified on Etherscan/Basescan."
    )
  }

  // Parse source code
  const sourceCode = parseSourceCode(contract.SourceCode)

  // Add delay to avoid rate limiting
  await delay(300)

  // Fetch contract ABI
  const abiString = await getContractABI(address, network)
  const abi = parseABI(abiString)

  // Analyze with Claude AI
  const analysis = await analyzeContract(
    sourceCode,
    contract.ContractName,
    abi
  )

  return {
    sourceCode,
    contractName: contract.ContractName,
    compiler: contract.CompilerVersion,
    optimization: contract.OptimizationUsed === "1",
    summary: analysis.summary,
    risks: analysis.risks,
    functions: analysis.functions,
    abi,
    isVerified,
  }
}

export const analyzeContractAction = actionClient
  .schema(analyzeContractSchema)
  .action(async ({ parsedInput }): Promise<ContractAnalysis> => {
    const { address, network } = parsedInput

    try {
      // 1. Fetch contract source code to check if it's a proxy
      const contractData = await getContractSourceCode(address, network)

      if (!contractData.result || contractData.result.length === 0) {
        throw new Error("Contract not found or not verified")
      }

      const contract = contractData.result[0]
      const isProxy = contract.Proxy === "1"
      const implementationAddress = contract.Implementation

      // 2. Analyze the main contract (proxy or regular contract)
      const mainAnalysis = await analyzeSingleContract(address, network)

      // 2.5. Check if contract is ERC20 and fetch token info
      const isERC20 = isERC20Token(mainAnalysis.abi)
      let tokenInfo = null
      
      if (isERC20) {
        console.log(`Detected ERC20 token, fetching token info for ${address}`)
        tokenInfo = await getTokenInfo(address, network)
      }

      // Add delay before fetching transactions
      await delay(300)

      // 3. Fetch recent transactions
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

      // 4. Build the result
      const result: ContractAnalysis = {
        address,
        network,
        summary: mainAnalysis.summary,
        risks: mainAnalysis.risks,
        functions: mainAnalysis.functions,
        recentTransactions: transactions,
        sourceCode: mainAnalysis.sourceCode,
        contractName: mainAnalysis.contractName,
        compiler: mainAnalysis.compiler,
        optimization: mainAnalysis.optimization,
        isProxy,
        isERC20,
        tokenInfo: tokenInfo || undefined,
        isVerified: mainAnalysis.isVerified,
      }

      // 5. If it's a proxy, analyze the implementation contract
      if (isProxy && implementationAddress && isAddress(implementationAddress)) {
        try {
          console.log(`Analyzing implementation contract: ${implementationAddress}`)
          
          // Add delay before analyzing implementation contract
          await delay(300)
          
          const implAnalysis = await analyzeSingleContract(implementationAddress, network)
          console.log(`Implementation analysis completed successfully for ${implementationAddress}`)

          const implementation: ContractImplementation = {
            address: implementationAddress,
            summary: implAnalysis.summary,
            risks: implAnalysis.risks,
            functions: implAnalysis.functions,
            sourceCode: implAnalysis.sourceCode,
            contractName: implAnalysis.contractName,
            compiler: implAnalysis.compiler,
            optimization: implAnalysis.optimization,
            isVerified: implAnalysis.isVerified,
          }

          result.implementation = implementation
          console.log(`Implementation added to result object`)
        } catch (implError) {
          console.error("Error analyzing implementation contract:", implError)
          console.error("Implementation error details:", implError instanceof Error ? implError.message : String(implError))
          // Continue without implementation analysis if it fails
        }
      } else {
        console.log(`Proxy check: isProxy=${isProxy}, implementationAddress=${implementationAddress}, isAddress=${implementationAddress ? isAddress(implementationAddress) : 'N/A'}`)
      }

      // 6. Perform security analysis (honeypot, scam, rugpull detection)
      try {
        console.log(`Performing security analysis for ${address}`)
        
        // Add delay before security analysis
        await delay(300)
        
        const securityAnalysis = await analyzeContractSecurity(
          mainAnalysis.sourceCode,
          mainAnalysis.contractName,
          mainAnalysis.abi,
          mainAnalysis.isVerified,
          address
        )
        
        result.securityAnalysis = securityAnalysis
      } catch (securityError) {
        console.error("Error performing security analysis:", securityError)
        // Continue without security analysis if it fails
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
