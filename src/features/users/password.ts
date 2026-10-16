// Temporary password for an account the Admin creates. The backend wants at least 8 characters; this
// gives 12 with every character class, and leaves out look-alikes (0/O, 1/l/I) so it can be read out.
const UPPER = "ABCDEFGHJKLMNPQRSTUVWXYZ";
const LOWER = "abcdefghijkmnpqrstuvwxyz";
const DIGITS = "23456789";
const SYMBOLS = "#@$%&*!?";
const ALL = UPPER + LOWER + DIGITS + SYMBOLS;

const LENGTH = 12;

/** Uniform index in [0, max) from the platform CSPRNG. */
function randomIndex(max: number): number {
  const buf = new Uint32Array(1);
  // Rejection sampling keeps the pick unbiased when 2^32 is not a multiple of max.
  const limit = Math.floor(0x1_0000_0000 / max) * max;
  do crypto.getRandomValues(buf);
  while (buf[0] >= limit);
  return buf[0] % max;
}

const pick = (set: string) => set[randomIndex(set.length)];

export function generatePassword(): string {
  const chars = [pick(UPPER), pick(LOWER), pick(DIGITS), pick(SYMBOLS)];
  while (chars.length < LENGTH) chars.push(pick(ALL));
  // Fisher–Yates, so the guaranteed classes are not always the first four characters.
  for (let i = chars.length - 1; i > 0; i--) {
    const j = randomIndex(i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  return chars.join("");
}
