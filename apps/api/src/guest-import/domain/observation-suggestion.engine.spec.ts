import { detectSuggestionsFromObservation } from './observation-suggestion.engine';

describe('observation-suggestion.engine', () => {
  it('detecta intolerancia alimentaria', () => {
    const result = detectSuggestionsFromObservation('Intolerancia lactosa');

    expect(result).toEqual([
      expect.objectContaining({ kind: 'intolerancia_alimentaria' }),
    ]);
  });

  it('detecta incompatibilidad con objetivo', () => {
    const result = detectSuggestionsFromObservation(
      'No sentar con Juan Perez',
    );

    expect(result[0]).toMatchObject({
      kind: 'incompatibilidad',
      targetHint: 'Juan Perez',
    });
  });

  it('detecta afinidad con objetivo', () => {
    const result = detectSuggestionsFromObservation(
      'Prefiere sentar con Maria Lopez',
    );

    expect(result[0]).toMatchObject({
      kind: 'afinidad',
      targetHint: 'Maria Lopez',
    });
  });
});
