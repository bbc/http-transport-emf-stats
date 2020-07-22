/**
 * Converts the first non empty character of the string to upper case and the remaining to lower case
 * removing all empty spaces if any.
 *
 * It throws a TypeError if the input is not a string.
 *
 * @param {string} input
 * @throws TypeError
 */
export function capitalise(input) {
  if (typeof input !== 'string') throw new TypeError('The input parameter is not a string');

  const i = input.trim().toLowerCase();
  return `${i.charAt(0).toUpperCase()}${i.slice(1)}`;
}

/**
 * Converts the input string to camel case.
 *
 * It throws a TypeError if the input or the the splitToken or both are not strings.
 *
 * @param {string} input the input string
 * @param {boolean} allCapital true if we want to capitalise all
 * @param {string} splitToken the token to split the string with
 * @throws TypeError if either one or all the parameters are not strings
 */
export function camelCase(input, allCapital = false, splitToken = '.') {
  if (typeof input !== 'string') throw new TypeError('The "input" parameter is not a string');
  if (typeof allCapital !== 'boolean') throw new TypeError('The "allCapital" parameter is not a boolean');
  if (typeof splitToken !== 'string') throw new TypeError('The "splitToken" parameter is not a string');

  const split = input.split(splitToken);

  const reducer = (accumulator, current) => `${accumulator.trim()}${capitalise(current)}`;

  const args = [reducer];

  if (allCapital) {
    // adds an empty initial value to the reduce function
    // @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/reduce
    args.push('');
  }

  return split.reduce(...args);
}
