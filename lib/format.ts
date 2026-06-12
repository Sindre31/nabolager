// Norwegian number formatting (matches the prototype's toLocaleString('nb-NO')).
export function fmt(n: number | null | undefined): string {
  return (n || 0).toLocaleString('nb-NO');
}

export function rating(n: number): string {
  return n.toFixed(1);
}

export function initialsOf(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
}
