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

let playareaBlocked = false;

const game_result = document.getElementById('game-result');

for(let i = 0; i < 3; i++) {
    for(let j = 0; j < 3; j++) {
        playarea[i][j] = document.getElementById(`${i + 1}_${j + 1}`);
    }
}

function getTargetCoords(target) {
    const id = target.getAttribute('id');
    return [Number(id[0]) - 1, Number(id[2]) - 1];
}

function setCell(target, x) {
    const coords = getTargetCoords(target);
    const i = coords[0];
    const j = coords[1];
    if(playareaState[i][j]) return;
    playareaState[i][j] = x ? 1 : 2;
    if(x) target.children[0].style.opacity = '1';
    else target.children[1].style.opacity = '1';
}

function addRandomO() {
    if(playareaState.every((row) => row.every((v) => v !== 0))) return;
    let i, j;
    do {
        i = Math.floor(Math.random() * 3);
        j = Math.floor(Math.random() * 3);
    }
    while(playareaState[i][j] != 0);
    setCell(playarea[i][j], false);
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

function checkForDraw() {
    return playareaState.every((row) => row.every((v) => v !== 0));
}

document.getElementById('playarea').addEventListener('click', (e) => {
    if(playareaBlocked) return;
    const target = e.target.parentElement;
    const coords = getTargetCoords(target);
    const i = coords[0];
    const j = coords[1];
    if(playareaState[i][j] !== 0) return;
    setCell(target, true);
    if(checkForGameEnd(true)) {
        playareaBlocked = true;
        game_result.innerHTML = `
            <div class='spinning red'>Y</div><div class='spinning green'>O</div><div class='spinning blue bordering'>U</div> 
            <div class='spinning magenta'>W</div><div class='spinning cyan'>O</div><div class='spinning yellow'>N</div>
        `;
        const animationNumber = Math.floor(Math.random() * 3) + 1;
        [...game_result.getElementsByClassName('spinning')].forEach((letter, index) => {
            letter.style.animation = `letter-anim${animationNumber} 1s infinite`;
            if(animationNumber !== 1) letter.style.animationDelay = `${index * 1/12}s`;
        });
        return;
    }
    addRandomO();
    if(checkForGameEnd(false)) {
        playareaBlocked = true;
        game_result.innerHTML = 'you lost :(';
        return;
    }
    if(checkForDraw()) {
        game_result.innerHTML = 'it\'s a draw!';
    }
});

document.getElementById('reset').addEventListener('click', () => {
    playareaBlocked = false;
    game_result.innerHTML = '';
    for(let i = 0; i < 3; i++) {
        for(let j = 0; j < 3; j++) {
            clearCell(i, j);
            playareaState[i][j] = 0;
        }
    }
});