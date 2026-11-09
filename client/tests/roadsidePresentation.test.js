import { describe, expect, it } from 'vitest';
import { roadsideSignalMapLabel } from '../src/modules/driver/roadsidePresentation.js';

describe('roadside commuter map label', () => {
  it('shows the commuter and their destination note', () => {
    expect(
      roadsideSignalMapLabel({
        commuter: { displayName: 'Maria S.' },
        destinationNote: '  Victoria Public Market  ',
      }),
    ).toBe('Maria S.: Victoria Public Market');
  });

  it('uses safe fallbacks for incomplete live data', () => {
    expect(roadsideSignalMapLabel({})).toBe('Commuter: Destination not provided');
  });
});
