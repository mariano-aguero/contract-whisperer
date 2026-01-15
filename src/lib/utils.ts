import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Normalizes an Ethereum address to lowercase for case-insensitive comparison
 * This is useful when comparing addresses that may have different checksum formats
 */
export function normalizeAddress(address: string): string {
  return address.toLowerCase()
}
