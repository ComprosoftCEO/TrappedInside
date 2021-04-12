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
