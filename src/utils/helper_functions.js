// Binary search to find the first element >= target
export const binarySearchLowerBound = (arr, target, key = null) => {
  let left = 0;
  let right = arr.length - 1;
  let result = arr.length; // Default if all elements are < target

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    const value = key ? arr[mid][key] : arr[mid];
    if (value >= target) {
      result = mid;
      right = mid - 1;
    } else {
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

// Helper function to find the last index that satisfies a condition
export const findLastIndex= (array, predicate) => {
  for (let i = array.length - 1; i >= 0; i--) {
    if (predicate(array[i])) {
      return i;
    }
  }
  return -1;
}