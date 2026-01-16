import { env } from "./env"
import type {
  EtherscanContractResponse,
  EtherscanABIResponse,
  EtherscanTransactionResponse,
  TokenInfo,
} from "@/features/contract-analyzer/types"
import { createPublicClient, http, type Address } from "viem"
import { mainnet, base } from "viem/chains"

const ETHERSCAN_API_URL = "https://api.etherscan.io/v2/api"
const BASESCAN_API_URL = "https://api.etherscan.io/v2/api"

export async function getContractSourceCode(
  address: string,
  network: "ethereum" | "base" = "ethereum"
): Promise<EtherscanContractResponse> {
  const apiUrl = network === "ethereum" ? ETHERSCAN_API_URL : BASESCAN_API_URL
  const apiKey =
    network === "ethereum" ? env.ETHERSCAN_API_KEY : env.BASESCAN_API_KEY
  const chainId = network === "ethereum" ? "1" : "8453"

  if (!apiKey) {
    throw new Error(`API key for ${network} is not configured`)
  }

  const url = `${apiUrl}?chainid=${chainId}&module=contract&action=getsourcecode&address=${address}&apikey=${apiKey}`

  const response = await fetch(url, {
    cache: "no-store",
  })

  if (!response.ok) {
    throw new Error(
      `Failed to fetch contract source code: ${response.statusText}`
    )
  }

  const data: EtherscanContractResponse = await response.json()

  if (data.status !== "1") {
    const errorMessage = data.message || "Unknown error"

    // Provide more helpful error messages based on common Etherscan responses
    if (errorMessage === "NOTOK") {
      throw new Error(
        `Etherscan API error: Invalid API key or rate limit exceeded. Please check your ${network === "ethereum" ? "ETHERSCAN_API_KEY" : "BASESCAN_API_KEY"} in the .env file.`
      )
    }

    if (errorMessage.includes("Invalid API Key")) {
      throw new Error(
        `Invalid API key for ${network}. Please verify your ${network === "ethereum" ? "ETHERSCAN_API_KEY" : "BASESCAN_API_KEY"} in the .env file.`
      )
    }

    if (errorMessage.includes("rate limit")) {
      throw new Error(
        `Rate limit exceeded for ${network} API. Please wait a moment and try again.`
      )
    }

    throw new Error(`Etherscan API error: ${errorMessage}`)
  }

  return data
}

export async function getContractABI(
  address: string,
  network: "ethereum" | "base" = "ethereum"
): Promise<string> {
  const apiUrl = network === "ethereum" ? ETHERSCAN_API_URL : BASESCAN_API_URL
  const apiKey =
    network === "ethereum" ? env.ETHERSCAN_API_KEY : env.BASESCAN_API_KEY
  const chainId = network === "ethereum" ? "1" : "8453"

  if (!apiKey) {
    throw new Error(`API key for ${network} is not configured`)
  }

  const url = `${apiUrl}?chainid=${chainId}&module=contract&action=getabi&address=${address}&apikey=${apiKey}`

  const response = await fetch(url, {
    cache: "no-store",
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch contract ABI: ${response.statusText}`)
  }

  const data: EtherscanABIResponse = await response.json()

  if (data.status !== "1") {
    const errorMessage = data.message || "Unknown error"

    // Provide more helpful error messages based on common Etherscan responses
    if (errorMessage === "NOTOK") {
      throw new Error(
        `Etherscan API error: Invalid API key or rate limit exceeded. Please check your ${network === "ethereum" ? "ETHERSCAN_API_KEY" : "BASESCAN_API_KEY"} in the .env file.`
      )
    }

    if (errorMessage.includes("Invalid API Key")) {
      throw new Error(
        `Invalid API key for ${network}. Please verify your ${network === "ethereum" ? "ETHERSCAN_API_KEY" : "BASESCAN_API_KEY"} in the .env file.`
      )
    }

    if (errorMessage.includes("rate limit")) {
      throw new Error(
        `Rate limit exceeded for ${network} API. Please wait a moment and try again.`
      )
    }

    throw new Error(`Etherscan API error: ${errorMessage}`)
  }

  return data.result
}

export async function getContractTransactions(
  address: string,
  network: "ethereum" | "base" = "ethereum",
  limit: number = 10
): Promise<EtherscanTransactionResponse> {
  const apiUrl = network === "ethereum" ? ETHERSCAN_API_URL : BASESCAN_API_URL
  const apiKey =
    network === "ethereum" ? env.ETHERSCAN_API_KEY : env.BASESCAN_API_KEY
  const chainId = network === "ethereum" ? "1" : "8453"

  if (!apiKey) {
    throw new Error(`API key for ${network} is not configured`)
  }

  const url = `${apiUrl}?chainid=${chainId}&module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&page=1&offset=${limit}&sort=desc&apikey=${apiKey}`

  const response = await fetch(url, {
    cache: "no-store",
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch transactions: ${response.statusText}`)
  }

  const data: EtherscanTransactionResponse = await response.json()

  if (data.status !== "1") {
    const errorMessage = data.message || "Unknown error"

    // Provide more helpful error messages based on common Etherscan responses
    if (errorMessage === "NOTOK") {
      throw new Error(
        `Etherscan API error: Invalid API key or rate limit exceeded. Please check your ${network === "ethereum" ? "ETHERSCAN_API_KEY" : "BASESCAN_API_KEY"} in the .env file.`
      )
    }

    if (errorMessage.includes("Invalid API Key")) {
      throw new Error(
        `Invalid API key for ${network}. Please verify your ${network === "ethereum" ? "ETHERSCAN_API_KEY" : "BASESCAN_API_KEY"} in the .env file.`
      )
    }

    if (errorMessage.includes("rate limit")) {
      throw new Error(
        `Rate limit exceeded for ${network} API. Please wait a moment and try again.`
      )
    }

    throw new Error(`Etherscan API error: ${errorMessage}`)
  }

  return data
}

export function parseABI(abiString: string): any[] {
  try {
    return JSON.parse(abiString)
  } catch (error) {
    console.error("Failed to parse ABI:", error)
    return []
  }
}

/**
 * Checks if a contract is an ERC20 token by verifying standard functions in the ABI
 */
export function isERC20Token(abi: any[]): boolean {
  const requiredFunctions = [
    "name",
    "symbol",
    "decimals",
    "totalSupply",
    "balanceOf",
    "transfer",
  ]

  const functionNames = abi
    .filter((item) => item.type === "function")
    .map((item) => item.name)

  return requiredFunctions.every((fn) => functionNames.includes(fn))
}

/**
 * Fetches token information from the blockchain using viem
 */
export async function getTokenInfo(
  address: string,
  network: "ethereum" | "base" = "ethereum"
): Promise<TokenInfo | null> {
  const chain = network === "ethereum" ? mainnet : base

  const client = createPublicClient({
    chain,
    transport: http(),
  })

  const erc20Abi = [
    {
      name: "name",
      type: "function",
      stateMutability: "view",
      inputs: [],
      outputs: [{ type: "string" }],
    },
    {
      name: "symbol",
      type: "function",
      stateMutability: "view",
      inputs: [],
      outputs: [{ type: "string" }],
    },
    {
      name: "decimals",
      type: "function",
      stateMutability: "view",
      inputs: [],
      outputs: [{ type: "uint8" }],
    },
    {
      name: "totalSupply",
      type: "function",
      stateMutability: "view",
      inputs: [],
      outputs: [{ type: "uint256" }],
    },
  ] as const

  try {
    const [name, symbol, decimals, totalSupply] = await Promise.all([
      client.readContract({
        address: address as Address,
        abi: erc20Abi,
        functionName: "name",
      }),
      client.readContract({
        address: address as Address,
        abi: erc20Abi,
        functionName: "symbol",
      }),
      client.readContract({
        address: address as Address,
        abi: erc20Abi,
        functionName: "decimals",
      }),
      client.readContract({
        address: address as Address,
        abi: erc20Abi,
        functionName: "totalSupply",
      }),
    ])

    return {
      name: name as string,
      symbol: symbol as string,
      decimals: decimals as number,
      totalSupply: totalSupply?.toString(),
    }
  } catch (error) {
    console.error("Error fetching token info:", error)
    return null
  }
}
