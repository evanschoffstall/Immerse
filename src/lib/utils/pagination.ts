/**
 * Centralized pagination utilities
 * Eliminates duplicate pagination logic across the codebase
 */

/**
 * Standard pagination metadata interface
 */
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

/**
 * Parse pagination query parameters with validation
 */
export function parsePaginationParams(query: URLSearchParams) {
  const page = Math.max(1, parseInt(query.get("page") || "1", 10));
  const limit = Math.min(
    100,
    Math.max(1, parseInt(query.get("limit") || "20", 10))
  );
  const skip = (page - 1) * limit;

  return { page, limit, skip };
}

/**
 * Build pagination metadata from counts
 */
export function buildPaginationMeta(
  page: number,
  limit: number,
  total: number
): PaginationMeta {
  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
    hasNext: page * limit < total,
    hasPrev: page > 1,
  };
}

/**
 * Build complete paginated response with data + metadata
 */
export function paginatedResponse<T>(
  data: T[],
  total: number,
  page: number,
  limit: number
) {
  return {
    data,
    pagination: buildPaginationMeta(page, limit, total),
  };
}

/**
 * Build named paginated response (for resources with custom key names)
 * e.g., { beings: [...], pagination: {...} }
 */
export function namedPaginatedResponse<T>(
  key: string,
  data: T[],
  total: number,
  page: number,
  limit: number
) {
  return {
    [key]: data,
    pagination: buildPaginationMeta(page, limit, total),
  };
}
