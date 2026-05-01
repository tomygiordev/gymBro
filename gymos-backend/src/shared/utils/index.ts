export function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, '').slice(-10);
}

export function normalizeDocumentNumber(doc: string): string {
  return doc.replace(/[^A-Z0-9]/gi, '').toUpperCase();
}

export function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

export function formatCurrency(amount: number, currency = 'ARS'): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
  }).format(amount / 100);
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function daysBetween(start: Date, end: Date): number {
  const diffTime = Math.abs(end.getTime() - start.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export function isDateExpired(date: Date): boolean {
  return date < new Date();
}

export function isWithinDays(date: Date, days: number): boolean {
  const now = new Date();
  const futureDate = addDays(now, days);
  return date <= futureDate && date >= now;
}

export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export function generateInvoiceNumber(tenantId: string, sequence: number): string {
  const year = new Date().getFullYear();
  const tenantPrefix = tenantId.slice(0, 4).toUpperCase();
  return `${tenantPrefix}-${year}-${sequence.toString().padStart(6, '0')}`;
}

export class ApiError extends Error {
  constructor(
    public readonly code: string,
    public readonly message: string,
    public readonly statusCode: number = 400,
  ) {
    super(message);
    this.name = 'ApiError';
  }

  static badRequest(message: string, code = 'BAD_REQUEST'): ApiError {
    return new ApiError(code, message, 400);
  }

  static unauthorized(message = 'Unauthorized', code = 'UNAUTHORIZED'): ApiError {
    return new ApiError(code, message, 401);
  }

  static forbidden(message = 'Forbidden', code = 'FORBIDDEN'): ApiError {
    return new ApiError(code, message, 403);
  }

  static notFound(message = 'Not found', code = 'NOT_FOUND'): ApiError {
    return new ApiError(code, message, 404);
  }

  static conflict(message: string, code = 'CONFLICT'): ApiError {
    return new ApiError(code, message, 409);
  }

  static internal(message = 'Internal server error', code = 'INTERNAL'): ApiError {
    return new ApiError(code, message, 500);
  }
}