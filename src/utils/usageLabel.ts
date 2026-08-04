/**
 * Names the thumbnails that would lose an upload, for the confirmation on its tile.
 *
 * An element keeps its reference when the image behind it goes, so those thumbnails
 * simply draw nothing there. Two names is as many as a tile holds, and they are sorted
 * so the same image always names the same two, whatever order the store lists them in.
 */
/** A long name would push the sentence past the tile, and the full list is in the title. */
function shorten(name: string): string {
  return name.length > 22 ? `${name.slice(0, 21).trimEnd()}\u2026` : name;
}

export function usageLabel(names: string[]): string {
  if (names.length === 0) return 'Not used anywhere';

  const sorted = [...names].sort((a, b) => a.localeCompare(b)).map(shorten);
  if (sorted.length === 1) return `${sorted[0]} will lose this image`;
  if (sorted.length === 2) return `${sorted[0]} and ${sorted[1]} will lose this image`;

  const rest = sorted.length - 2;
  return `${sorted[0]}, ${sorted[1]} and ${rest} more thumbnail${rest === 1 ? '' : 's'} will lose this image`;
}
