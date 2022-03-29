function createList(title, list) {
    const container = document.getElementById("container");
    const h2 = document.createElement("h2");
    h2.append(title);
    container.appendChild(h2);

    const upperList = document.createElement("ul");

    function createListPoint(listPoint, parent) {
        const div = document.createElement("div");
        div.style.border = "solid grey 1px";
        div.append(listPoint.value);
        if(listPoint.children) {
            const subList = document.createElement("ul");
            listPoint.children.forEach((v) => {
                const li = document.createElement("li");
                createListPoint(v, li);
                subList.appendChild(li);
            });
            div.appendChild(subList);
        }
        parent.appendChild(div);
        return;
    }

    list.forEach((v) => {
        const li = document.createElement("li");
        createListPoint(v, li);
        upperList.appendChild(li);
    });
    container.appendChild(upperList);
}