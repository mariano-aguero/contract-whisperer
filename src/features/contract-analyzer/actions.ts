"use server"

import { z } from "zod"
import { actionClient } from "@/lib/safe-action"
import {
  getContractSourceCode,
  isERC20Token,
  getTokenInfo,
  getContractTransactions,
} from "@/lib/etherscan"
import { analyzeContractSecurity as analyzeContractSecurityAI } from "@/lib/anthropic"
import { isAddress, formatEther } from "viem"
import type { ContractAnalysis, Transaction, ContractImplementation } from "./types"
import { analyzeSingleContract, delay } from "./queries"

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
          // Continue without implementation analysis if it fails
        }
      }

      // 6. Perform security analysis (honeypot, scam, rugpull detection)
      try {
        console.log(`Performing security analysis for ${address}`)

        // Add delay before security analysis
        await delay(300)

        const securityAnalysis = await analyzeContractSecurityAI(
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
        // If it's our friendly AI error, pass it through without the prefix
        if (error.message.includes("AI service is currently unavailable")) {
          throw error
        }
        throw new Error(`Failed to analyze contract: ${error.message}`)
      }
      throw new Error("Failed to analyze contract")
    }
  })
