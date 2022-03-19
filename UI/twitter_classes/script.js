class Tweet {

    _id;
    _date;
    _author;

    constructor(id, text, date, author, comments) {
        this.id = id;
        this.text = text;
        this.date = date;
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
        return this._date;
    }
    set date(newDate) {
        this._date = newDate;
    }

    get author() {
        return this._author;
    }
    set author(newAuthor) {
        this._author = newAuthor;
    }

    
}