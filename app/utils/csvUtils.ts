export function splitCSV(csv: string, linesPerFile: number): string[] {
  if (!csv.trim()) return [];
  const lines = csv.trim().split(/\r?\n/);
  const result: string[] = [];

  for (let i = 0; i < lines.length; i += linesPerFile) {
    const chunk = lines.slice(i, i + linesPerFile).join("\n");
    result.push(chunk);
  }

  return result;
}
