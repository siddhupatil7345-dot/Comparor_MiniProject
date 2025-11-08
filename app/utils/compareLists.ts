export function compareLists(listA: string, listB: string) {
  const a = listA.split("\n").map(x => x.trim()).filter(Boolean);
  const b = listB.split("\n").map(x => x.trim()).filter(Boolean);

  const setA = new Set(a);
  const setB = new Set(b);

  const uniqueA = a.filter(x => !setB.has(x));
  const uniqueB = b.filter(x => !setA.has(x));
  const intersection = a.filter(x => setB.has(x));
  const union = Array.from(new Set([...a, ...b]));

  return { uniqueA, uniqueB, intersection, union };
}
