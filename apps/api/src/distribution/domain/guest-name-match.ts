/** Coincidencia flexible por nombre (misma semántica que seat-affinity / restrictions). */
export function guestNamesMatch(guestName: string, targetHint: string): boolean {
  const normalizedGuest = guestName.trim().toLowerCase();
  const normalizedTarget = targetHint.trim().toLowerCase();

  return (
    normalizedGuest.includes(normalizedTarget) ||
    normalizedTarget.includes(normalizedGuest)
  );
}

export function guestNamePairKey(leftName: string, rightName: string): string {
  const left = leftName.trim().toLowerCase();
  const right = rightName.trim().toLowerCase();
  return left < right ? `${left}|${right}` : `${right}|${left}`;
}
