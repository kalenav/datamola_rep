function createCalendar(elem, year, month) {
    const table = document.createElement("table");
    const headerRow = document.createElement("th");
    const dayNames = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
    for(let i = 0; i < 7; i++) {
        const currCell = document.createElement("td");
        currCell.append(dayNames[i]);
        currCell.style.border = "solid black 1px";
        headerRow.appendChild(currCell);
    }
    headerRow.style.backgroundColor = "lightgray";
    table.appendChild(headerRow);

    const C = Math.floor(year / 100);
    const Y = (year % 100 - (month === 11 || month === 12) ? 1 : 0);
    let currDayOfTheWeek = Math.floor(1 + Math.floor(2.6 * ((month + 9) % 12 + 1) - 0.2) - C + Y + Math.floor(Y / 4) + Math.floor(C / 4)) % 7; // https://cs.uwaterloo.ca/~alopez-o/math-faq/node73.html
    let monthLength;
    if(month === 1 || month === 3 || month === 5 || month === 7 || month === 8 || month === 10 || month === 12) monthLength = 31;
    else if(month !== 2) monthLength = 30;
    else if(year % 4 !== 0) monthLength = 28;
    else monthLength = 29;
    let currDay = 1;

    function newWeek() {
        const row = document.createElement("tr");
        for(let i = 0; i < 7; i++) {
            const currCell = document.createElement("td");
            currCell.style.border = "solid black 1px";
            row.appendChild(currCell);
        }
        return row;
    }

    let currRow = newWeek();
    for(; currDay <= monthLength; currDay++, currDayOfTheWeek = (currDayOfTheWeek + 1) % 7) {
        currRow.children[currDayOfTheWeek].append(currDay);
        if(currDayOfTheWeek === 6) {
            table.appendChild(currRow);
            currRow = newWeek();
        }
    }
    table.style.borderCollapse = "collapse";
    elem.appendChild(table);
    console.log(elem.innerHTML);
}