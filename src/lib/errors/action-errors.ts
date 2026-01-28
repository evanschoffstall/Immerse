/**
 * Error thrown when a user attempts to access or modify a resource they don't own
 */
export class ForbiddenError extends Error {
  constructor(resource: string = "resource") {
    super(`Forbidden: You don't have access to this ${resource}`);
    this.name = "ForbiddenError";
  }
}

/**
 * Error thrown when a requested resource cannot be found
 */
export class NotFoundError extends Error {
  constructor(resource: string) {
    super(`${resource.charAt(0).toUpperCase() + resource.slice(1)} not found`);
    this.name = "NotFoundError";
  }
}

/**
 * Error thrown when input validation fails
 */
export class ValidationError extends Error {
  constructor(message: string) {
    super(`Validation failed: ${message}`);
    this.name = "ValidationError";
  }
}
