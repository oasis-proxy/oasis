/**
 * Performs a deep equality check between two values.
 * This is deterministic and ignores object property key ordering, 
 * making it safer than JSON.stringify for dirty state tracking.
 * 
 * @param {*} a First value
 * @param {*} b Second value
 * @returns {boolean} True if values are deeply equal
 */
export function isEqual(a, b) {
  if (a === b) return true;

  if (a && b && typeof a === 'object' && typeof b === 'object') {
    if (a.constructor !== b.constructor) return false;

    let length, i;
    if (Array.isArray(a)) {
      length = a.length;
      if (length != b.length) return false;
      for (i = length; i-- !== 0;) {
        if (!isEqual(a[i], b[i])) return false;
      }
      return true;
    }

    const keys = Object.keys(a);
    length = keys.length;
    if (length !== Object.keys(b).length) return false;

    for (i = length; i-- !== 0;) {
      if (!Object.prototype.hasOwnProperty.call(b, keys[i])) return false;
    }

    for (i = length; i-- !== 0;) {
      const key = keys[i];
      if (!isEqual(a[key], b[key])) return false;
    }

    return true;
  }

  // Handle NaN equality
  return a !== a && b !== b;
}
