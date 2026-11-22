/** `dialogue.progress` errors that mean the agent could not hear the visitor */
export const HEARING_FAILURES = ["no-speech", "other-speaker"];

/**
 * Counts voice turns in a row the agent could not hear. `miss` answers true once the
 * run reaches the threshold, so the avatar can react (a "don't know" shrug); then it
 * stays quiet until the visitor is heard again (`heard`), so a noisy room does not
 * make it shrug over and over.
 */
export class MissedTurns {
  private count = 0;
  private reacted = false;

  constructor(private readonly threshold = 2) {}

  miss(): boolean {
    if (this.reacted) return false;
    this.count++;
    if (this.count < this.threshold) return false;
    this.reacted = true;
    this.count = 0;
    return true;
  }

  heard() {
    this.count = 0;
    this.reacted = false;
  }
}
