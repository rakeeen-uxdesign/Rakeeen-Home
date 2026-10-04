/**
 * Every card this bot sends is meant to be glanced at and acted on, not kept
 * around — so every one of them self-deletes a minute after it first appears,
 * independent of how many times its buttons get clicked in that window.
 */
const CARD_LIFETIME_MS = 60_000;

export function scheduleExpire(message, ms = CARD_LIFETIME_MS) {
  if (!message) return;
  setTimeout(() => {
    message.delete().catch(() => {});
  }, ms);
}
