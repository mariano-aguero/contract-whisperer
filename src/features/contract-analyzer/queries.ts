import {
  getContractSourceCode,
  getContractABI,
  parseABI,
} from "@/lib/etherscan"
import { analyzeContract as analyzeContractAI } from "@/lib/anthropic"

/**
 * Helper function to add delay between API calls to avoid rate limiting
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Helper function to parse source code from different formats
 */
export function parseSourceCode(sourceCode: string): string {
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
 * Fetches and analyzes a single contract (proxy or implementation)
 */
export async function analyzeSingleContract(
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
  const isVerified = !!(
    contract.SourceCode && contract.SourceCode.trim() !== ""
  )

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
  const analysis = await analyzeContractAI(
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
