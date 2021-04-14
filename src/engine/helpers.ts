/**
 * Generate a random float [min, max)
 *
 * Code from: https://www.codegrepper.com/code-examples/javascript/generate+random+float+number+in+range+javascript
 */
export function randomFloat(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

/**
 * Generate a random integer [min, max]
 *
 * Code from: https://www.codegrepper.com/code-examples/javascript/generate+random+float+number+in+range+javascript
 */
export function randomInt(min: number, max: number): number {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Pick a random value from an array
 *
 * @param values Array to pick a random value from
 * @returns Random value
 */
export function pickRandomArray<T>(values: T[]): T {
  return values[randomInt(0, values.length - 1)];
}

/**
 * Wrap a number to a given range.
 *
 * Code is from: https://stackoverflow.com/questions/50054676/what-is-the-correct-way-to-get-a-number-modulo-range-such-that-the-returned-valu
 *
 * @param x Number to wrap
 * @param min Minimum number in range
 * @param max Maximum number in range
 * @param includeMax If set to true, the maximum value is included in this range. The default is true.
 * @returns Wrapped value
 */
export function wrapNumber(x: number, min: number, max: number, includeMax = true): number {
  const d = max - min;
  return x === max && includeMax ? x : ((((x - min) % d) + d) % d) + min;
}

/**
 * Clamp a value between two numbers, so min <= x <= max
 *
 * @param x Number to clamp
 * @param min Minimum value
 * @param max Maximum value
 * @returns Clamped number
 */
export function clamp(x: number, min: number, max: number): number {
  return Math.min(Math.max(x, min), max);
}

/**
 * Test if a number is between two values
 *
 * @param x Number to test
 * @param min Minimum value
 * @param max Maximum value
 * @returns True if min <= x <= max
 */
export function isBetween(x: number, min: number, max: number): boolean {
  return x >= min && x <= max;
}

/**
 * Determine if a number is basically an integer
 *
 * @param x The number
 * @param threshhold Threshshold to use
 * @returns True if X is basically an integer
 */
export function isBasicallyInteger(x: number, threshhold = 0): boolean {
  return isBetween(x, Math.round(x) - threshhold, Math.round(x) + threshhold);
}

/**
 * Test if an angel is between two other angles
 *
 * @param angle   Angle to test
 * @param a       First angle to test against
 * @param b       Second angle to test against
 * @returns       True if the angle is between the two angles
 */
export function isAngleBetween(angle: number, a: number, b: number): boolean {
  const maxDistance = normalizeAngle(b - a); // 90 degrees
  return Math.abs(normalizeAngle(a - angle)) < maxDistance && Math.abs(normalizeAngle(b - angle)) < maxDistance;
}

/**
 * Normalize angle between -PI and +PI radians
 *
 * @param angle     Angle to normalize
 * @return          Normalized angle
 */
export function normalizeAngle(angle: number): number {
  return Math.atan2(Math.sin(angle), Math.cos(angle));
}
