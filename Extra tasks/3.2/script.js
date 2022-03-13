const arr1 = [7, 1, 5, 3, 6, 4];
const arr2 = [1, 2, 3, 4, 5];

function greatestProfit(array) {
    // создаётся вспомогательный массив, который будет заполняться цифрами 0, 1 и 2 
    // всеми возможными способами в той степени, в которой это осмысленно
    // цифра 0 будет означать, что в соответствующий день брокер не делает ничего
    // цифра 1 будет означать, что в соответствующий день брокер покупает акцию
    // цифра 2 будет означать, что в соответствующий день брокер продаёт акцию
    // "в той степени, в которой это осмысленно" означает, что, например, не будут
    // рассматриваться варианты этого массива, в которых первая цифра 2 идёт раньше, чем 1,
    // или идёт несколько цифр 1 или цифр 2 подряд
    // перебрав все возможные правильные способы заполнения этого массива и высчитывая
    // прибыль для каждого, найдём максимальную прибыль

    const allPossibleAuxiliaryArrays = [new Array(array.length).fill(0)];
    let auxiliary = new Array(array.length).fill(0);

    function insertPairs(leftBound) {
        if(leftBound >= auxiliary.length - 2) {
            allPossibleAuxiliaryArrays.push(auxiliary.slice())
            return;
        }
        for(let currOnePosition = leftBound + 1; currOnePosition < auxiliary.length - 1; currOnePosition++) {
            auxiliary[currOnePosition] = 1;
            for(let currTwoPosition = currOnePosition + 1; currTwoPosition < auxiliary.length; currTwoPosition++) {
                auxiliary[currTwoPosition] = 2;
                insertPairs(currTwoPosition);
                auxiliary[currTwoPosition] = 0;
            }
            for(let i = currOnePosition; i < auxiliary.length; i++) auxiliary[i] = 0;
        }
    }

    debugger;
    insertPairs(-1);

    let greatestProfit = 0;
    console.log(allPossibleAuxiliaryArrays);
}

// greatestProfit(arr1);
// greatestProfit(arr2);