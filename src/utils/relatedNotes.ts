import type { NoteData } from "./notion";

export function getRelatedNotes(
  allNotes: NoteData[],
  current: NoteData,
  limit = 3
): NoteData[] {
  const others = allNotes.filter(n => n.id !== current.id);
  const tagSet = new Set(current.tags ?? []);

  const byTag = others
    .filter(n => (n.tags ?? []).some(t => tagSet.has(t)))
    .toSorted(
      (a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime()
    );

  const picked = new Set<string>();
  const result: NoteData[] = [];

  for (const note of byTag) {
    if (result.length >= limit) break;
    if (!picked.has(note.id)) {
      picked.add(note.id);
      result.push(note);
    }
  }

  if (result.length < limit) {
    const latest = others
      .toSorted(
        (a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime()
      )
      .filter(n => !picked.has(n.id));
    for (const note of latest) {
      if (result.length >= limit) break;
      result.push(note);
    }
  }

  return result;
}
