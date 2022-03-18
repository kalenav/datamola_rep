function add(a, b) {
    if(arguments.length === 2) return a + b;
    else return (arg) => arg + a;
}

function sub(a, b) {
    if(arguments.length === 2) return a - b;
    else return (arg) => arg - a;
}

function mul(a, b) {
    if(arguments.length === 2) return a * b;
    else return (arg) => arg * a;
}

function div(a, b) {
    if(arguments.length === 2) return a / b;
    else return (arg) => arg / a;
}

function pipe(...operations) {
    return function(num) {
        for(let operation of operations) num = operation(num);
        return num;
    }
}

function tests() {
    let testsPassed = 0;

    const add1 = add(1);
    const sub2 = sub(2);
    const mul3 = mul(3);
    const div4 = div(4);

    console.log("add1 = add(1), sub2 = sub(2), mul3 = mul(3), div4 = div(4)");

    console.log("");

    console.log("test 1: add1(5)");
    if(add1(5) === 6) {
        testsPassed++;
        console.log("passed");
    }
    else console.log("FAILED");

    console.log("");

    console.log("test 2: sub2(11)");
    if(sub2(11) === 9) {
        testsPassed++;
        console.log("passed");
    }
    else console.log("FAILED");

    console.log("");

    console.log("test 3: mul3(10)");
    if(mul3(10) === 30) {
        testsPassed++;
        console.log("passed");
    }
    else console.log("FAILED");

    console.log("");

    console.log("test 4: div4(124)");
    if(div4(124) === 31) {
        testsPassed++;
        console.log("passed");
    }
    else console.log("FAILED");

    console.log("");

    console.log("test 5: pipe(add(3), sub(10))(11)");
    if(pipe(add(3), sub(10))(11) === 4) {
        testsPassed++;
        console.log("passed");
    }
    else console.log("FAILED");

    console.log("");

    console.log("test 6: pipe(add(1), add(1), mul(5), add(1), sub(3))(19)");
    if(pipe(add(1), add(1), mul(5), add(1), sub(3))(19) === 103) {
        testsPassed++;
        console.log("passed");
    }
    else console.log("FAILED");

    console.log("");

    console.log("test 7: pipe(div(1), div(1), div(1), mul(1), div(1), mul(1), mul(1), div(1))(1)");
    if(pipe(div(1), div(1), div(1), mul(1), div(1), mul(1), mul(1), div(1))(1) === 1) {
        testsPassed++;
        console.log("passed");
    }
    else console.log("FAILED");

    console.log("");

    console.log("test 8: pipe(mul(3), div(3), mul(15), div(15), mul(1024), div(1024), add(3))(-5)");
    if(pipe(mul(3), div(3), mul(15), div(15), mul(1024), div(1024), add(3))(-5) === -2) {
        testsPassed++;
        console.log("passed");
    }
    else console.log("FAILED");

    console.log("");

    console.log("test 9: pipe(mul(2), mul(2), mul(2), mul(2), mul(2))(2)");
    if(pipe(mul(2), mul(2), mul(2), mul(2), mul(2))(2) === 64) {
        testsPassed++;
        console.log("passed");
    }
    else console.log("FAILED");

    console.log("");

    console.log("test 10: pipe(mul(123412), mul(6745734), div(15246), mul(375471), div(15133322), add(1))(0)");
    if(pipe(mul(123412), mul(6745734), div(15246), mul(375471), div(15133322), add(1))(0) === 1) {
        testsPassed++;
        console.log("passed");
    }
    else console.log("FAILED");

    console.log("");

    console.log(`${testsPassed}/10 tests passed`)
}


