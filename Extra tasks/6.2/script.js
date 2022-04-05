const playarea = [
    [null, null, null], 
    [null, null, null], 
    [null, null, null]
];

const playareaState = [
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0]
];

for(let i = 0; i < 3; i++) {
    for(let j = 0; j < 3; j++) {
        playarea[i][j] = document.getElementById(`${i + 1}_${j + 1}`);
    }
}

function setCell(i, j, x) {
    if(playareaState[i][j]) return;
    playareaState[i][j] = x ? 1 : 2;
    if(x) playarea[i][j].children[0].style.opacity = '1';
    else playarea[i][j].children[1].style.opacity = '1';
}

function clearCell(i, j) {
    [...playarea[i][j].children].forEach((v) => v.style.opacity = '0');
}

function checkForGameEnd(win) {
    const checkingFor = win ? 1 : 2;
    if(playareaState.some((currRow) => currRow.every((v) => v === checkingFor))) return true;
    for(let j = 0; j < 3; j++) {
        for(let i = 0; i < 3; i++) {
            if(playareaState[i][j] !== checkingFor) break;
            if(i === 2) return true;
        }
    }
    for(let i = 0; i < 3; i++) {
        if(playareaState[i][i] !== checkingFor) break;
        if(i === 2) return true;
    }
    for(let i = 2; i >= 0; i--) {
        if(playareaState[i][2 - i] !== checkingFor) break;
        if(i === 0) return true;
    }
    return false;
}