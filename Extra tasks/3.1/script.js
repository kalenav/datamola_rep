const arr = [-2, 1, -3, 4, -1, 2, 1, -5, 4];

function largestContinuousSubarraySum(array) {
    let sum;
    for(let currLeftBound = 0; currLeftBound < array.length; currLeftBound++) {
        for(let currRightBound = 0; currRightBound < array.length; currRightBound++) {
            let currSum = array.slice(currLeftBound, currRightBound + 1).reduce(((r, v) => r += v), 0);
            if(!sum) sum = currSum;
            else if(currSum > sum) sum = currSum;
        }
    }
    return sum;
}

console.log(largestContinuousSubarraySum(arr));