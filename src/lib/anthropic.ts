import Anthropic from "@anthropic-ai/sdk"
import { env } from "./env"
import { parseJSONFromText } from "./json-parser"
import type {
  ContractFunction,
  Risk,
} from "@/features/contract-analyzer/types"

interface AnalysisResult {
  summary: string
  risks: Risk[]
  functions: ContractFunction[]
}

/**
 * Singleton instance of the Anthropic client
 */
let anthropicClient: Anthropic | null = null

/**
 * Gets the singleton instance of the Anthropic client
 */
function getAnthropicClient(): Anthropic {
  if (!anthropicClient) {
    anthropicClient = new Anthropic({
      apiKey: env.ANTHROPIC_API_KEY,
    })
  }
  return anthropicClient
}

export async function analyzeContract(
  sourceCode: string,
  contractName: string,
  abi: any[]
): Promise<AnalysisResult> {
  const prompt = `You are a smart contract security expert. Analyze the following Solidity contract and provide:

1. A clear, simple summary of what the contract does (2-3 sentences for non-technical users)
2. A list of potential risks and security concerns
3. Descriptions of the main functions

Contract Name: ${contractName}

Source Code:
${sourceCode}

ABI:
${JSON.stringify(abi, null, 2)}

Please respond in JSON format with this structure:
{
  "summary": "Simple explanation of what the contract does",
  "risks": [
    {
      "level": "high" | "medium" | "low",
      "title": "Risk title",
      "description": "Detailed description",
      "category": "security" | "centralization" | "scam" | "other"
    }
  ],
  "functions": [
    {
      "name": "functionName",
      "signature": "functionName(uint256,address)",
      "stateMutability": "view" | "pure" | "nonpayable" | "payable",
      "description": "What this function does in simple terms",
      "inputs": [{"name": "param", "type": "uint256"}],
      "outputs": [{"name": "result", "type": "bool"}]
    }
  ]
}

Focus on:
- Dangerous functions (selfdestruct, delegatecall, etc.)
- Access control issues
- Reentrancy vulnerabilities
- Centralization risks (owner privileges)
- Common scam patterns (honeypots, rugpulls)
- Gas optimization issues

Be concise but thorough. Prioritize high-severity issues.`

  try {
    const anthropic = getAnthropicClient()
    
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-5-20250929",
      max_tokens: 16384,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    })

    const content = message.content[0]
    if (content.type !== "text") {
      throw new Error("Unexpected response type from Claude")
    }

    // Extract and parse JSON using the utility
    const analysis = parseJSONFromText<AnalysisResult>(content.text)

    if (!analysis) {
      console.error("Could not parse JSON from Claude response")
      console.error("Response text (first 1000 chars):", content.text.substring(0, 1000))
      throw new Error("Could not parse JSON from Claude response")
    }

    // Validate the structure
    if (!analysis.summary || !Array.isArray(analysis.risks) || !Array.isArray(analysis.functions)) {
      throw new Error("Invalid analysis structure from Claude")
    }

    return analysis
  } catch (error) {
    console.error("Error analyzing contract with Claude:", error)
    if (error instanceof Error) {
      throw new Error(`Failed to analyze contract with AI: ${error.message}`)
    }
    throw new Error("Failed to analyze contract with AI")
  }
}

