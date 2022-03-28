const arr1 = [9, 2, 0, 1];
const arr2 = [1, 2, 3, 4];
const arr3 = [0, 9, 1, 5];
const arr4 = [5, 0, 0, 6];
const arr5 = [0, 0, 0, 0];

function getLargestTime(arr) {
  const result = [];
  const processed = [false, false, false, false];
  
  function findCurrMax(limiter) {
    let currMax = arr.reduce((r, v, i) => (!processed[i] && v > r && v <= limiter) ? v : r, 0);
    processed[arr.findIndex((v) => v === currMax)] = true;
    return currMax;
  }
  
  result.push(findCurrMax(2));
  if(result[0] === 2) result.push(findCurrMax(3));
  else result.push(findCurrMax(9));
  result.push(findCurrMax(5));
  result.push(findCurrMax(9));
  return result;
}

console.log(getLargestTime(arr1));
console.log(getLargestTime(arr2));
console.log(getLargestTime(arr3));
console.log(getLargestTime(arr4));
console.log(getLargestTime(arr5));