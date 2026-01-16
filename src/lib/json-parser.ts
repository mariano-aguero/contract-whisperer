/**
 * Extracts and parses JSON from a text response that may contain
 * markdown code blocks or direct JSON.
 *
 * Implements multiple parsing strategies:
 * 1. Attempts to parse the entire text as JSON
 * 2. Extracts JSON from markdown code blocks (```json or ```)
 * 3. Finds the first complete JSON object using brace balancing
 */
export function parseJSONFromText<T = any>(text: string): T | null {
  const trimmedText = text.trim()

  // Strategy 1: Attempt to parse the entire text as JSON
  try {
    return JSON.parse(trimmedText) as T
  } catch {
    // Continue with the following strategies
  }

  // Strategy 2: Extract JSON from markdown code blocks using brace balancing
  const codeBlockStart = trimmedText.match(/```(?:json)?\s*/)
  if (codeBlockStart) {
    const jsonStart = codeBlockStart.index! + codeBlockStart[0].length
    const extracted = extractBalancedJSON(trimmedText, jsonStart)

    if (extracted) {
      try {
        return JSON.parse(extracted) as T
      } catch (parseError) {
        console.error("Failed to parse JSON from code block:", parseError)
        console.error("Extracted JSON string:", extracted.substring(0, 500))
      }
    }
  }

  // Strategy 3: Find the first complete JSON object (without code block)
  const extracted = extractBalancedJSON(trimmedText, 0)
  if (extracted) {
    try {
      return JSON.parse(extracted) as T
    } catch (parseError) {
      console.error("Failed to parse extracted JSON:", parseError)
      console.error("Extracted JSON string:", extracted.substring(0, 500))
    }
  }

  return null
}

/**
 * Extracts a complete JSON object from a starting position,
 * using brace balancing and correctly handling strings and escaped characters.
 */
function extractBalancedJSON(text: string, startPos: number): string | null {
  const firstBrace = text.indexOf("{", startPos)
  if (firstBrace === -1) {
    return null
  }

  let braceCount = 0
  let inString = false
  let escapeNext = false
  let jsonEnd = -1

  for (let i = firstBrace; i < text.length; i++) {
    const char = text[i]

    if (escapeNext) {
      escapeNext = false
      continue
    }

    if (char === "\\") {
      escapeNext = true
      continue
    }

    if (char === '"') {
      inString = !inString
      continue
    }

    if (!inString) {
      if (char === "{") {
        braceCount++
      } else if (char === "}") {
        braceCount--
        if (braceCount === 0) {
          jsonEnd = i + 1
          break
        }
      }
    }
  }

  if (jsonEnd !== -1) {
    return text.substring(firstBrace, jsonEnd)
  }

  return null
}
