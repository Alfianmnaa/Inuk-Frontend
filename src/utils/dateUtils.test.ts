import { describe, it, expect } from 'vitest';
import {
  isFridayPon,
  ceilToFridayPon,
  getAllFridayPons,
  formatDateToLocalDateInput,
  formatFridayPonDisplay,
  toUTCDateTimeString,
} from './dateUtils';

describe('dateUtils', () => {
  describe('isFridayPon', () => {
    it('returns true for a known Friday Pon date', () => {
      // Use ceilToFridayPon to get a guaranteed Friday Pon date
      // Jan 1, 2025 is Wednesday, the first Friday Pon after it should be valid
      const knownDate = new Date('2025-01-01T00:00:00');
      const fridayPon = ceilToFridayPon(knownDate);
      
      // Verify the result from ceilToFridayPon is indeed Friday Pon
      expect(isFridayPon(fridayPon)).toBe(true);
      expect(fridayPon.getDay()).toBe(5); // Friday
    });

    it('returns false for a known non-Friday-Pon date', () => {
      // 2024-01-01 is Monday (getDay() === 1), not Friday
      const monday = new Date('2024-01-01T00:00:00');
      expect(isFridayPon(monday)).toBe(false);

      // 2024-01-06 is Saturday (getDay() === 6), not Friday
      const saturday = new Date('2024-01-06T00:00:00');
      expect(isFridayPon(saturday)).toBe(false);

      // 2024-01-07 is Sunday (getDay() === 0), not Friday
      const sunday = new Date('2024-01-07T00:00:00');
      expect(isFridayPon(sunday)).toBe(false);
    });

    it('correctly identifies dates that are Friday but not Pon', () => {
      // Find a Friday that is NOT a Friday Pon
      // Get a Friday Pon, then get the next Friday (7 days later)
      const someDate = new Date('2025-01-01T00:00:00');
      const fridayPon = ceilToFridayPon(someDate);
      
      // Add 7 days to get next Friday (should NOT be Pon)
      const nextFriday = new Date(fridayPon);
      nextFriday.setDate(nextFriday.getDate() + 7);
      
      // Should be Friday but not Friday Pon
      expect(nextFriday.getDay()).toBe(5); // Friday
      expect(isFridayPon(nextFriday)).toBe(false);
    });
  });

  describe('ceilToFridayPon', () => {
    it('returns same date if already Friday Pon', () => {
      // Get a guaranteed Friday Pon
      const knownDate = new Date('2025-01-01T00:00:00');
      const fridayPon = ceilToFridayPon(knownDate);
      
      // Passing the Friday Pon date should return the same date
      const result = ceilToFridayPon(fridayPon);
      expect(result.getDate()).toBe(fridayPon.getDate());
      expect(result.getMonth()).toBe(fridayPon.getMonth());
      expect(result.getFullYear()).toBe(fridayPon.getFullYear());
    });

    it('returns next Friday Pon if not already Friday Pon', () => {
      // Jan 1, 2024 is Monday
      const monday = new Date('2024-01-01T00:00:00');
      const result = ceilToFridayPon(monday);
      
      // Should get a Friday (day 5)
      expect(result.getDay()).toBe(5);
      // And should be a Friday Pon
      expect(isFridayPon(result)).toBe(true);
    });

    it('works across month boundaries', () => {
      // Pick a date near month end that's not Friday
      const endOfMonth = new Date('2024-01-28T00:00:00'); // Sunday
      const result = ceilToFridayPon(endOfMonth);
      
      // Should get first Friday Pon after
      expect(result.getDay()).toBe(5); // Friday
      expect(isFridayPon(result)).toBe(true);
    });

    it('works across year boundaries', () => {
      // Dec 31, 2024 is Tuesday
      const endOfYear = new Date('2024-12-31T00:00:00');
      const result = ceilToFridayPon(endOfYear);
      
      // Should get first Friday Pon in 2025
      expect(result.getFullYear()).toBe(2025);
      expect(result.getDay()).toBe(5); // Friday
      expect(isFridayPon(result)).toBe(true);
    });
  });

  describe('getAllFridayPons', () => {
    it('returns array of Date objects for single year range', () => {
      const fridayPons = getAllFridayPons(2024, 2024);
      expect(Array.isArray(fridayPons)).toBe(true);
      expect(fridayPons.length).toBeGreaterThan(0);
      fridayPons.forEach((date) => {
        expect(date instanceof Date).toBe(true);
      });
    });

    it('returns Friday Pon dates for year range', () => {
      const fridayPons = getAllFridayPons(2024, 2025);
      expect(fridayPons.length).toBeGreaterThan(0);
      // All returned dates should be Friday Pon
      fridayPons.forEach((date) => {
        expect(date.getDay()).toBe(5); // Friday
        expect(isFridayPon(date)).toBe(true);
      });
    });

    it('returns empty array for invalid range', () => {
      const fridayPons = getAllFridayPons(2025, 2024); // invalid: start > end
      expect(Array.isArray(fridayPons)).toBe(true);
      expect(fridayPons.length).toBe(0);
    });
  });

  describe('formatDateToLocalDateInput', () => {
    it('formats date as YYYY-MM-DD', () => {
      const date = new Date('2024-01-15T12:00:00');
      const result = formatDateToLocalDateInput(date);
      expect(result).toBe('2024-01-15');
    });

    it('pads single-digit month and day with zeros', () => {
      const date = new Date('2024-03-05T12:00:00');
      const result = formatDateToLocalDateInput(date);
      expect(result).toBe('2024-03-05');
    });

    it('handles end of year dates', () => {
      const date = new Date('2024-12-31T00:00:00');
      const result = formatDateToLocalDateInput(date);
      expect(result).toBe('2024-12-31');
    });
  });

  describe('formatFridayPonDisplay', () => {
    it('formats date with Indonesian locale', () => {
      const date = new Date('2024-01-05T00:00:00');
      const result = formatFridayPonDisplay(date);
      // Should contain "Januari" (Indonesian for January)
      expect(result).toContain('Januari');
      expect(result).toContain('5');
      expect(result).toContain('2024');
    });

    it('formats different months in Indonesian', () => {
      // June = Juni in Indonesian
      const juneDate = new Date('2024-06-15T00:00:00');
      const juneResult = formatFridayPonDisplay(juneDate);
      expect(juneResult).toContain('Juni');
    });
  });

  describe('toUTCDateTimeString', () => {
    it('returns ISO string format', () => {
      const date = new Date('2024-01-05T12:00:00Z');
      const result = toUTCDateTimeString(date);
      expect(result).toBe('2024-01-05T12:00:00.000Z');
    });

    it('returns ISO string for various dates', () => {
      const date = new Date('2025-06-20T08:30:00.000Z');
      const result = toUTCDateTimeString(date);
      expect(result).toContain('2025-06-20');
      expect(result).toContain('08:30:00');
    });
  });
});
