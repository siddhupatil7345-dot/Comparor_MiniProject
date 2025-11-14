export function columnizeText(text: string, delimiter: string): string[][] {
  if (!text.trim()) return [];
  const lines = text.trim().split(/\r?\n/);
  return lines.map((line) => line.split(delimiter));
}
