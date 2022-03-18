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
        if(i !== undefined && currNodeIndex !== i) return false; // i больше длины списка или меньше нуля
        ithNode.next = newNode;
        newNode.next = iPlusFirstNode;
        return true;
    }
}