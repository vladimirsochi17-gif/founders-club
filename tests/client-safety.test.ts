import { afterEach, describe, expect, it, vi } from 'vitest';
import { readModel, resolveRoute } from '../src/components/generated/core';
import { knownPage } from '../server/lib/routes';

afterEach(() => vi.unstubAllGlobals());
describe('client safety regression', () => {
  it('does not restore account or privilege data from legacy local storage', () => {
    vi.stubGlobal('localStorage', { getItem: (key: string) => key === 'fc-design-v3' ? JSON.stringify({ logged: true, subscribed: true, adminRole: 'superadmin', email: 'other@example.test' }) : null });
    const model = readModel();
    expect(model.logged).toBe(false);
    expect(model.subscribed).toBe(false);
    expect(model.adminRole).toBeUndefined();
    expect(model.email).toBe('');
  });
  it('handles corrupt encoded route segments without crashing the page', () => {
    expect(resolveRoute('/p/%E0%A4%A').id).toBe('210');
  });
  it('resolves server-backed public and authenticated routes', () => {
    expect(resolveRoute('/p/new-project').id).toBe('035');
    expect(resolveRoute('/dashboard/projects').id).toBe('133');
    expect(resolveRoute('/route-that-does-not-exist').id).toBe('210');
    expect(knownPage('/route-that-does-not-exist')).toBe(false);
    expect(knownPage('/p/mindflow/reviews')).toBe(true);
    expect(knownPage('/p/mindflow/unknown-subpage')).toBe(false);
  });
});
