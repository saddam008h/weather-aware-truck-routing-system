/**
 * An error whose message came from our API and is safe to show to the user as-is
 * (e.g. "Couldn't find a location matching ..."). Anything else gets a generic toast.
 */
export class ApiError extends Error {}
