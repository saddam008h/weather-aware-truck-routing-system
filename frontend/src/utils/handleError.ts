import { toast } from "sonner";

import { ApiError } from "@/types/shared";

/**
 * Shows an error toast. Messages written by our API (ApiError) are shown as-is
 * since they say exactly what's wrong; anything else (network down, a bug) gets
 * the generic `message`.
 */
export function handleError({ error, message }: { error: Error; message: string }) {
  if (error instanceof ApiError) {
    toast.error(error.message);
    return;
  }

  toast.error(message);
}
