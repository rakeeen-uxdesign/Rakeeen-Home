/**
 * Every card this bot sends is meant to be glanced at and acted on, not kept
 * around — so every one of them self-deletes a minute after it (last)
 * appeared — EXCEPT the Focus card, which is meant to be left open and
 * checked back on, so it's cancelled instead. A single message can carry
 * either state across its life (e.g. the hub message becomes the Focus
 * card when you tap Focus, then back to a normal card if you tap Main
 * Menu), so timers are tracked per message id and replaced, not stacked.
 */
const CARD_LIFETIME_MS = 60_000;
const timers = new Map();

export function scheduleExpire(message, ms = CARD_LIFETIME_MS) {
  if (!message) return;
  cancelExpire(message);
  const handle = setTimeout(() => {
    timers.delete(message.id);
    message.delete().catch(() => {});
  }, ms);
  timers.set(message.id, handle);
}

export function cancelExpire(message) {
  if (!message) return;
  const handle = timers.get(message.id);
  if (handle) {
    clearTimeout(handle);
    timers.delete(message.id);
  }
}
