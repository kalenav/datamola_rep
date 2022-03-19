class Tweet {

    _id;
    _createdAt;
    _author;

    constructor(id, text, author, comments) {
        this.id = id;
        this.text = text;
        this.createdAt = new Date();
        this.author = author;
        this.comments = comments.slice();
    }

    get id() {
        return this._id;
    }
    set id(newId) {
        this._id = newId;
    }

    get date() {
        return this._createdAt;
    }
    set date(newDate) {
        this._createdAt = newDate;
    }

    get author() {
        return this._author;
    }
    set author(newAuthor) {
        this._author = newAuthor;
    }
}