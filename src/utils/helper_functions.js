// Binary search to find the first element >= target
export const binarySearchLowerBound = (arr, target, key = null) => {
  let left = 0;
  let right = arr.length - 1;
  let result = -1; // Default if all elements are < target

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    const value = key ? arr[mid][key] : arr[mid];
    if (value >= target) {
      // This index might be valid, but we need to check if there's an earlier one
      result = mid;
      right = mid - 1;
    } else {
      // This index is too early, look in the right half
      left = mid + 1;
    }
  }
  return result;
};

// Binary search to find the last element <= target
export const binarySearchUpperBound = (arr, target, key = null) => {
  let left = 0;
  let right = arr.length - 1;
  let result = -1; // Default if all elements are > target

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    const value = key ? arr[mid][key] : arr[mid];
    if (value <= target) {
      result = mid;
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }
  return result;
};