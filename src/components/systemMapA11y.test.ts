import { describe, expect, it } from 'vitest';
import { isSystemNodeDisabled, systemNodeAriaLabel } from './systemMapA11y';

describe('systemMapA11y', () => {
  it('describes node label, state, and selection for assistive tech', () => {
    expect(systemNodeAriaLabel('GATEWAY', 'accessible', true)).toBe('GATEWAY, accessible, selected');
    expect(systemNodeAriaLabel('AUTH', 'locked', false)).toBe('AUTH, locked');
  });

  it('marks non-actionable node states as disabled', () => {
    expect(isSystemNodeDisabled('accessible')).toBe(false);
    expect(isSystemNodeDisabled('locked')).toBe(true);
    expect(isSystemNodeDisabled('breached')).toBe(true);
    expect(isSystemNodeDisabled('defended')).toBe(true);
  });
});
