export type SystemNodeState = 'locked' | 'accessible' | 'breached' | 'defended';

export function systemNodeAriaLabel(label: string, state: SystemNodeState, selected: boolean): string {
  const selection = selected ? ', selected' : '';
  return `${label}, ${state}${selection}`;
}

export function isSystemNodeDisabled(state: SystemNodeState): boolean {
  return state === 'locked' || state === 'breached' || state === 'defended';
}
