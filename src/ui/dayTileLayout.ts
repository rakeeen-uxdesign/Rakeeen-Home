/** Columns of the date tile when the day number's lit width is odd; even widths get one more. */
export const BASE_TILE_COLUMNS = 13;

export interface DayTileLayout {
  /** Columns in the tile, rim included. */
  columns: number;
  /** First lit column of each glyph. */
  starts: number[];
}

/**
 * Sizes the date tile around the day number so it sits dead centre on whole columns: one
 * column between glyphs, and if the lit width has the wrong parity for the base tile, the
 * tile gains a column instead of the glyphs being pushed apart. The inner margins are then
 * equal on both sides.
 */
export function layoutDayTile(widths: number[]): DayTileLayout {
  const ink = widths.reduce((sum, w) => sum + w, 0) + (widths.length - 1);
  const columns = ink % 2 === BASE_TILE_COLUMNS % 2 ? BASE_TILE_COLUMNS : BASE_TILE_COLUMNS + 1;
  let x = (columns - ink) / 2;
  const starts = widths.map((w) => {
    const start = x;
    x += w + 1;
    return start;
  });
  return { columns, starts };
}
