type TableLike = { label: string };

export function suggestNextTableLabels(
  existing: TableLike[],
  count: number,
): string[] {
  const used = new Set(existing.map((table) => table.label.trim()));
  const labels: string[] = [];
  let index = 1;

  while (labels.length < count) {
    const candidate = `M${index}`;
    if (!used.has(candidate)) {
      labels.push(candidate);
      used.add(candidate);
    }
    index += 1;
  }

  return labels;
}

export function defaultNextTableLabel(existing: TableLike[]): string {
  return suggestNextTableLabels(existing, 1)[0] ?? 'M1';
}
