import { createSafeActionClient } from "next-safe-action"

export const actionClient = createSafeActionClient({
  handleServerError(e) {
    // Return the error message to the client
    if (e instanceof Error) {
      return e.message
    }
    return "Something went wrong while executing the operation."
  },
})
