const arr1 = [-2, 1, -3, 4, -1, 2, 1, -5, 4];
const arr2 = [-1, -2];

function largestContinuousSubarraySum(array) {
    let sum;
    for(let currLeftBound = 0; currLeftBound < array.length; currLeftBound++) {
        for(let currRightBound = currLeftBound; currRightBound < array.length; currRightBound++) {
            let currSum = array.slice(currLeftBound, currRightBound + 1).reduce(((r, v) => r += v), 0);
            if((!sum && sum != 0) || currSum > sum) sum = currSum;
        }
    }
    return sum;
}

console.log(largestContinuousSubarraySum(arr1));
console.log(largestContinuousSubarraySum(arr2));