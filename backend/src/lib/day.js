// Ported from src/domain/day.ts — keep in sync by hand, it's a couple of pure
// date functions with no framework dependency, not worth sharing a build step
// for. Only the pieces this bot actually needs: focus sessions count toward
// the real calendar day (no 04:00 rollback — that's water/fitness only, and
// the bot handles water's own lock window via prayer times instead).

function mondayFirstIndex(date) {
  const d = date.getDay();
  return d === 0 ? 6 : d - 1;
}

export function getPomoTodayIdx(now = new Date()) {
  return mondayFirstIndex(new Date(now));
}

export function isFriday(now = new Date()) {
  return now.getDay() === 5;
}
