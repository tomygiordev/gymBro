import { describe, expect, it } from '@jest/globals';
import {
  addDays,
  formatCurrency,
  generateInvoiceNumber,
  generateSlug,
  getInitials,
  normalizeDocumentNumber,
  normalizePhone,
} from './index';

describe('shared utils', () => {
  it('normalizes member contact identifiers', () => {
    expect(normalizePhone('+54 9 11 4567-8900')).toBe('1145678900');
    expect(normalizeDocumentNumber('dni 35.412.678')).toBe('DNI35412678');
  });

  it('formats names, slugs and money consistently', () => {
    expect(getInitials('María', 'García')).toBe('MG');
    expect(generateSlug('GymOS Centro!')).toBe('gymos-centro');
    expect(formatCurrency(49900)).toContain('499');
  });

  it('creates stable dates and invoice numbers', () => {
    const start = new Date('2026-01-15T00:00:00.000Z');

    expect(addDays(start, 30).toISOString()).toBe('2026-02-14T00:00:00.000Z');
    expect(generateInvoiceNumber('abcd-tenant', 42)).toMatch(/^ABCD-\d{4}-000042$/);
  });
});
