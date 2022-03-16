const arr1 = [7, 1, 5, 3, 6, 4];
const arr2 = [1, 2, 3, 4, 5];
const arr3 = [7, 6, 4, 3, 1];

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

    let auxiliary = new Array(array.length).fill(0);
    let profit = 0;

    // функция ниже пройдётся по всем возможным правильным способам заполнения 
    // вспомогательного массива. так как совершенно очевидно, что ради достижения
    // максимальной прибыли за любой покупкой должна следовать продажа, т.е. вспомогательный
    // массив не может содержать отдельно единицу или двойку, то логичным будет утверждение,
    // что цифры 1 и 2 всегда должны следовать парами и разделяться только нулями, если
    // они будут разделяться вообще. в первой своей итерации функция переберёт все
    // возможные варианты расположения первой пары цифр 1 и 2. для массива
    // длиной, например, 4, это будут следующие варианты:
    // [1, 2, 0, 0], [1, 0, 2, 0], [1, 0, 0, 2], [0, 1, 2, 0], [0, 1, 0, 2], [0, 0, 1, 2]
    // второй своей итерацией функция аналогичным образом переберёт 
    // все возможные варианты расположения второй пары цифр 1 и 2, т.е. той пары, 
    // которая идёт после первой цифры 2. таким образом, функция "разбивает"
    // вспомогательный массив на подмассивы и перебирает возможные варианты заполнения
    // этих подмассивов, после чего процесс повторяется рекурсивно до тех пор,
    // пока на очередную пару цифр 1 и 2 просто не останется места

    function insertPairs(leftBound) {
        if(leftBound >= auxiliary.length - 2) { // условие выхода - больше некуда вставлять пару цифр 1 и 2
            let currProfit = 0;
            for(let i = 0; i < array.length; i++) { // посчитали прибыль для текущего вспомогательного массива
                if(auxiliary[i] === 1) currProfit -= array[i];
                if(auxiliary[i] === 2) currProfit += array[i];
            }
            if(currProfit > profit) profit = currProfit; 
            return;
        }
        for(let currOnePosition = leftBound + 1; currOnePosition < auxiliary.length - 1; currOnePosition++) {
            auxiliary[currOnePosition] = 1;
            for(let currTwoPosition = currOnePosition + 1; currTwoPosition < auxiliary.length; currTwoPosition++) {
                auxiliary[currTwoPosition] = 2; // положили по нужным индексам 1 и 2,..
                allPossibleAuxiliaryArrays.push(auxiliary.slice()); // ...запомнили массив, в котором текущая пара 1 и 2 - последняя...
                insertPairs(currTwoPosition);   // ...и вызвали функцию от "подмассива"

                // после того, как строка выше выполнилась, т.е. для текущего
                // уровня вложенности и текущего расположения цифр 1 и 2
                // были обработаны все возможные правильные варианты заполнения
                // вспомогательного массива, нужно убрать двойку с позиции,
                // которая была обработана
                auxiliary[currTwoPosition] = 0;
            }

            // после обработки текущей позиции единицы чистим её и всё, что идёт после неё

            for(let i = currOnePosition; i < auxiliary.length; i++) auxiliary[i] = 0; 
        }
    }

    insertPairs(-1);

    return profit;
}

console.log(greatestProfit(arr1));
console.log(greatestProfit(arr2));
console.log(greatestProfit(arr3));