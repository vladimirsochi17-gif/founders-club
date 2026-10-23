import { describe, expect, it } from 'vitest';
import { SCREEN_SPECS } from '../src/components/generated/screenSpecs';

describe('screen registry contract', () => {
  it('contains all 236 unique Screen IDs', () => {
    expect(SCREEN_SPECS).toHaveLength(236);
    expect(new Set(SCREEN_SPECS.map((screen) => screen.id)).size).toBe(236);
    expect(SCREEN_SPECS[0].id).toBe('001');
    expect(SCREEN_SPECS.at(-1)?.id).toBe('236');
  });

  it('defines routing, priority, motion and state requirements for every screen', () => {
    for (const screen of SCREEN_SPECS) {
      expect(screen.route).toBeTruthy();
      expect(['P0', 'P1', 'P2']).toContain(screen.priority);
      expect(screen.motion).toBeTruthy();
      expect(screen.composition).toBeTruthy();
      expect(screen.actions).toBeTruthy();
      expect(screen.states).toBeTruthy();
      expect(screen.back).toBeTruthy();
    }
  });
});
