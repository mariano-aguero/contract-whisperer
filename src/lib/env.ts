import "server-only"
import { z } from "zod"

const envSchema = z.object({
  ANTHROPIC_API_KEY: z.string().min(1, "ANTHROPIC_API_KEY is required"),
  ETHERSCAN_API_KEY: z.string().min(1, "ETHERSCAN_API_KEY is required"),
  BASESCAN_API_KEY: z.string().optional(),
})

export const env = envSchema.parse({
  ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
  ETHERSCAN_API_KEY: process.env.ETHERSCAN_API_KEY,
  BASESCAN_API_KEY: process.env.BASESCAN_API_KEY,
})
