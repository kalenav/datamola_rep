class Node {
    constructor(value) {
        this.next = null;
        this.value = value;
    }
}

class List {
    constructor(value) {
        this.root = new Node(value);
    }

    addNode(value, i) {
        const newNode = new Node(value);
        let ithNode = this.root;
        let iPlusFirstNode = this.root.next;
        let currNodeIndex = 0;
        while(currNodeIndex !== i && ithNode.next !== null) {
            ithNode = ithNode.next;
            iPlusFirstNode = ithNode.next;
            currNodeIndex++;
        }

        // возвращаем false только тогда, когда i указан, но неверный;
        // неуказанный i - не проблема
        if(i !== undefined && currNodeIndex !== i) return false;

        ithNode.next = newNode;

        // если i не указан, то это эквивалентно i, равному текущей длине списка;
        // в таком случае в iPlusFirstNode будет лежать null, и ничего не сломается
        newNode.next = iPlusFirstNode; 
        return true;
    }

    removeNode(i) {
        if(this.root.next === null) return false;
        if(i === 0) {
            this.root.next = this.root;
            return true;
        }
        let prevNode;
        let ithNode = this.root;
        let nextNode = this.root.next;
        let currNodeIndex = 0;
        while(currNodeIndex !== i && ithNode.next !== null) {
            prevNode = ithNode;
            ithNode = ithNode.next;
            nextNode = ithNode.next;
            currNodeIndex++;
        }
        if(i !== undefined && currNodeIndex !== i) return false; // аналогично методу addNode()
        prevNode.next = nextNode; 
        // нужный узел удалится сборщиком мусора после выполнения метода, 
        // т.к. на него не ссылается ничего, кроме ithNode
        return true;
    }

    print() {
        let result = "";
        let currNode = this.root;
        do {
            result += `${currNode.value}`;
            result += (currNode.next !== null) ? ", " : "";
            currNode = currNode.next;
        }
        while(currNode !== null);
        console.log(result);
    }
}