import { env } from "./env"
import type {
  EtherscanContractResponse,
  EtherscanABIResponse,
  EtherscanTransactionResponse,
} from "@/features/contract-analyzer/types"

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
    throw new Error(`Failed to fetch contract source code: ${response.statusText}`)
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
