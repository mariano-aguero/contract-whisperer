import Anthropic from "@anthropic-ai/sdk"
import { env } from "./env"
import { parseJSONFromText } from "./json-parser"
import type {
  ContractFunction,
  Risk,
  SecurityAnalysis,
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

export async function analyzeContractSecurity(
  sourceCode: string,
  contractName: string,
  abi: any[],
  isVerified: boolean = false,
  contractAddress?: string
): Promise<SecurityAnalysis> {
  const prompt = `You are an expert in detecting malicious smart contracts and token scams. Analyze the following Solidity contract for security threats.

Contract Name: ${contractName}
Contract Address: ${contractAddress ? contractAddress.toLowerCase() : "Not provided"}
Verification Status: ${isVerified ? "✓ VERIFIED on blockchain explorer (Etherscan/Basescan)" : "⚠ NOT VERIFIED - Higher risk"}

Source Code:
${sourceCode}

ABI:
${JSON.stringify(abi, null, 2)}

IMPORTANT: Contract verification status is a significant security indicator:
- VERIFIED contracts have their source code publicly auditable and match the deployed bytecode, which is a POSITIVE sign
- UNVERIFIED contracts cannot be inspected and should be treated with MORE SUSPICION
- Consider verification status when calculating risk scores and confidence levels

Analyze the contract for the following threat types with specific detection criteria:

1. **Honeypot**: 
   Definition: You CAN buy the token but you CANNOT sell it (or only the deployer can sell).
   Detection indicators:
   - Blacklist mechanisms that prevent selling
   - Hidden transfer restrictions in _transfer or transfer functions
   - Impossible tax conditions that make selling fail
   - Functions that block specific addresses from selling
   - Different logic for buy vs sell operations
   - Conditions that always revert on sell but not on buy

2. **Scam Token**: 
   Definition: General fraudulent token designed to steal funds. Can include honeypots, rug pulls, fake airdrops, etc.
   Detection indicators:
   - Token designed to defraud users
   - Misleading functionality or documentation
   - Hidden malicious code
   - Fake token impersonating legitimate projects
   - Use when the exact scam mechanism is unclear

3. **Rug Pull**: 
   Definition: The team can withdraw liquidity OR dump the token supply, leaving the token worthless.
   Detection indicators:
   - Unlocked liquidity (no liquidity lock contract)
   - Functions to withdraw all funds or liquidity
   - Large team/owner allocations without vesting
   - Mint functions without caps or with owner-controlled minting
   - Owner can remove liquidity at any time
   - Note: Not necessarily a honeypot (sometimes both can apply)

4. **Malicious/Backdoor**: 
   Definition: Contract contains hidden owner-controlled functions or backdoors.
   Detection indicators:
   - Hidden admin functions not clearly documented
   - Blacklist/whitelist mechanisms controlled by owner
   - Pause functionality that can freeze all transfers
   - Arbitrary token minting controlled by owner
   - Tax manipulation functions (setTax, setFee, etc.)
   - Ownership transfer without timelock or governance
   - Functions that can change critical parameters arbitrarily
   - Owner privileges that are excessive or undocumented

5. **Fake Token/Impersonation**: 
   Definition: Token copies the name and symbol of another legitimate project but has a different contract address.
   Detection indicators:
   - Name/symbol matches well-known tokens (USDT, USDC, WETH, LINK, etc.)
   - Contract address doesn't match the official token address
   - Attempts to impersonate legitimate projects
   - **CRITICAL**: Before flagging as fake, you MUST compare the contract address (provided above in lowercase) with known official addresses
   - **ALWAYS normalize both addresses to lowercase before comparison** (Ethereum addresses are case-insensitive)
   - Example: If the contract name is "ChainLink Token" or symbol is "LINK":
     * Official LINK address: 0x514910771af9ca656af840dff83e8264ecf986ca (lowercase)
     * If the provided contract address matches this (case-insensitive), it is LEGITIMATE, NOT fake
   - Common official addresses (all in lowercase for comparison):
     * LINK: 0x514910771af9ca656af840dff83e8264ecf986ca
     * USDT: 0xdac17f958d2ee523a2206206994597c13d831ec7
     * USDC: 0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48
     * WETH: 0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2
   - Only flag as fake if the normalized lowercase addresses are DIFFERENT

6. **Soft Rug**: 
   Definition: Not a direct exploit, but abusive practices that harm token holders.
   Detection indicators:
   - Excessive taxes on transfers (>10% is suspicious, >20% is very high)
   - Infinite or unlimited token emissions without caps
   - Hidden unlock schedules for team tokens
   - Centralized control without transparency or governance
   - High fees that benefit the owner disproportionately
   - Lack of renounced ownership when promised

7. **Valid/Safe**: 
   If the contract doesn't match any of the above threat patterns, classify it as safe.
   Characteristics of safe contracts:
   - Standard ERC20 implementation (e.g., OpenZeppelin)
   - Reasonable or no taxes
   - No hidden owner privileges
   - Transparent and well-documented functionality
   - Renounced ownership or proper governance
   - **VERIFIED on blockchain explorer (strong positive indicator)**
   - Clean code without suspicious patterns

Respond in JSON format:
{
  "overallRisk": "safe" | "low" | "medium" | "high" | "critical",
  "riskScore": 0-100,
  "threats": [
    {
      "type": "honeypot" | "scam" | "rugpull" | "malicious" | "backdoor" | "fake-token" | "soft-rug",
      "severity": "low" | "medium" | "high" | "critical",
      "confidence": 0-100,
      "description": "Detailed explanation of the threat with specific code references",
      "indicators": ["specific code pattern 1", "specific code pattern 2", "specific function or variable name"]
    }
  ],
  "recommendation": "Overall recommendation for users (safe to use, use with caution, avoid completely, etc.)"
}

Guidelines:
- Be thorough but accurate - only report threats you can substantiate with code evidence
- Provide specific code references (function names, variable names, line patterns) in indicators
- Confidence should reflect certainty: 100 = definite proof, 70-90 = strong evidence, 50-69 = moderate evidence, 30-49 = weak evidence, <30 = unlikely
- riskScore mapping: 0-20 = safe, 21-40 = low risk, 41-60 = medium risk, 61-80 = high risk, 81-100 = critical risk
- If no threats found, return empty threats array with "safe" overallRisk and score 0-20
- A contract can have multiple threat types (e.g., both honeypot AND rugpull)
- Prioritize user safety: better to warn about potential issues than miss real threats
- For standard OpenZeppelin or well-known implementations, be less suspicious unless there are clear modifications`

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
    const securityAnalysis = parseJSONFromText<SecurityAnalysis>(content.text)

    if (!securityAnalysis) {
      console.error("Could not parse JSON from Claude security analysis response")
      console.error("Response text (first 1000 chars):", content.text.substring(0, 1000))
      throw new Error("Could not parse JSON from Claude security analysis response")
    }

    // Validate the structure
    if (!securityAnalysis.overallRisk || typeof securityAnalysis.riskScore !== 'number' || !Array.isArray(securityAnalysis.threats)) {
      throw new Error("Invalid security analysis structure from Claude")
    }

    return securityAnalysis
  } catch (error) {
    console.error("Error analyzing contract security with Claude:", error)
    if (error instanceof Error) {
      throw new Error(`Failed to analyze contract security with AI: ${error.message}`)
    }
    throw new Error("Failed to analyze contract security with AI")
  }
}

