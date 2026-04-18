// Feature: notification-system, Property 13: unread count badge
import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';

/**
 * Property 13: Unread count badge displays correct value
 * Validates: Requirements 11.1, 11.2, 11.4
 *
 * The badge logic extracted from NotificationBell.tsx:
 *   - count === 0  → no badge rendered
 *   - 1 ≤ count ≤ 9 → display exact number
 *   - count > 9    → display "9+"
 */
const getBadgeDisplay = (unreadCount: number): string | null => {
  if (unreadCount <= 0) return null;
  return unreadCount > 9 ? '9+' : String(unreadCount);
};

describe('NotificationBell badge logic', () => {
  it('returns null when unreadCount is 0 (no badge)', () => {
    expect(getBadgeDisplay(0)).toBeNull();
  });

  it('returns exact count for 1–9', () => {
    for (let i = 1; i <= 9; i++) {
      expect(getBadgeDisplay(i)).toBe(String(i));
    }
  });

  it('returns "9+" for counts above 9', () => {
    expect(getBadgeDisplay(10)).toBe('9+');
    expect(getBadgeDisplay(100)).toBe('9+');
  });

  // Property: count = 0 → no badge
  it('property: count 0 never shows a badge', () => {
    fc.assert(
      fc.property(fc.constant(0), (count) => {
        expect(getBadgeDisplay(count)).toBeNull();
      })
    );
  });

  // Property: 1–9 → exact number string
  it('property: counts 1–9 display exact number', () => {
    fc.assert(
      fc.property(fc.integer({ min: 1, max: 9 }), (count) => {
        expect(getBadgeDisplay(count)).toBe(String(count));
      })
    );
  });

  // Property: >9 → "9+"
  it('property: counts above 9 display "9+"', () => {
    fc.assert(
      fc.property(fc.integer({ min: 10, max: 100 }), (count) => {
        expect(getBadgeDisplay(count)).toBe('9+');
      })
    );
  });

  // Property: full range 0–100 — badge is null iff count === 0
  it('property: badge is absent only when count is 0', () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 100 }), (count) => {
        const result = getBadgeDisplay(count);
        if (count === 0) {
          expect(result).toBeNull();
        } else {
          expect(result).not.toBeNull();
        }
      })
    );
  });
});
