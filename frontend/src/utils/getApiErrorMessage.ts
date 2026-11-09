/**
 * Pulls a readable message out of an error response from our Django API.
 *
 * DRF sends either {"detail": "..."} or field errors like
 * {"departure_time": ["Departure time is in the past."]}. Returns null when
 * the body has neither (e.g. a proxy's HTML error page).
 */
export async function getApiErrorMessage({ response }: { response: Response }) {
  const body: unknown = await response.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return null;
  }

  if ("detail" in body && typeof body.detail === "string") {
    return body.detail;
  }

  const firstFieldErrors = Object.values(body).find(Array.isArray);
  return typeof firstFieldErrors?.[0] === "string" ? firstFieldErrors[0] : null;
}
