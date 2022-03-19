const englishAlphabetLeftBound = 65;
const englishAlphabetRightBound = 122;
const russianAlphabetLeftBound = 1040;
const russianAlpahbetRightBound = 1103;

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

    addComment(id, text) {
    }

    static validate(tw) {
        return (
            tw.id
            && typeof(tw.id) === "string"
            && tw.text
            && typeof(tw.text) === "string"
            && tw.text.length <= 280
            && tw.createdAt
            && tw.createdAt instanceof Date
            && tw.author !== ""
            && typeof(tw.author) === "string"
            && tw.comments
            && tw.comments instanceof Array
        )
    }
}

class Comment {

    _id;
    _createdAt;
    _author;

    constructor(id, text, author) {
        this._id = id;
        this.text = text;
        this._createdAt = new Date();
        this.author = author;
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

    static validate(com) {
        return (
            com.id
            && typeof(com.id) === "string"
            && com.text
            && typeof(com.text) === "string"
            && com.text.length <= 280
            && com.createdAt
            && com.createdAt instanceof Date
            && com.author !== ""
            && typeof(com.author) === "string"
        )
    }
}

class TweetFeed {

    _tweets;
    _user;

    constructor(tws) {
        this._tweets = tws.slice();
    }

    addAll(tws) {
        const toReturn = [];
        for(let i = 0; i < tws.length; i++) {
            const currTweet = tws[i];
            Tweet.validate(currTweet) ? this._tweets.push(currTweet) : toReturn.push(currTweet);
        }
        return toReturn;
    }

    clear() {
        this._tweets = [];
    }

    getPage(skip = 0, top = 10, filterConfig) {
        let result = this._tweets.slice();
        if(filterConfig) {
            if(filterConfig.author) result = result.filter((tweet) => tweet.author.includes(filterConfig.author));
            if(filterConfig.dateFrom) result = result.filter((tweet) => tweet.createdAt >= filterConfig.dateFrom);
            if(filterConfig.dateTo) result = result.filter((tweet) => tweet.createdAt <= filterConfig.dateTo);
            if(filterConfig.hashtags) result = result.filter((tweet) => filterConfig.hashtags.every((hashtag) => {
                let hashtagStart = tweet.text.indexOf(hashtag);
                if(hashtagStart === -1) return false; // хэштег не был найден
                let hashtagEnd = hashtagStart + hashtag.length - 1;
                if(hashtagEnd === tweet.text.length - 1) return true; // хэштегом заканчивается текст твита
                let nextCharCode = tweet.text.charCodeAt(hashtagEnd + 1);
                if((nextCharCode >= englishAlphabetLeftBound && nextCharCode <= englishAlphabetRightBound) 
                || (nextCharCode >= russianAlphabetLeftBound && nextCharCode <= russianAlpahbetRightBound)) return false; // после хэштега идёт буквенный символ, т.е. хэштег продолжается
                return true;
            }));
            if(filterConfig.text || filterConfig.text === "") result = result.filter((tweet) => tweet.text.includes(filterConfig.text));
        }
        result.sort((tweet1, tweet2) => tweet1.createdAt > tweet2.createdAt ? -1 : 1);
        return result.slice(skip, skip + top);
    }

    get(id) {
        return this._tweets.find((tw) => tw.id === id);
    }

    add(text) {
        const newTweet = new Tweet(String(Number(this._tweets[this._tweets.length - 1].id) + 1), text, new Date(), this._user, []);
        if(Tweet.validate(newTweet)) {
            this._tweets.push(newTweet);
            return true;
        }
        return false;
    }

    edit(id, text) {
        const tweet = get(id);
        if(tweet.author !== this._user) return false;
        let snapshot = tweet.text;
        tweet.text = text;
        if(Tweet.validate(tweet)) return true;
        tweet.text = snapshot;
        return false;
    }

    remove(id) {
        const tweetIndex = this._tweets.findIndex((tw) => tw.id === id);
        if(tweetIndex === -1 || this._tweets[tweetIndex].author !== this._user) return false;
        this._tweets = this._tweets.splice(tweetIndex, 1);
        return true;
    }

    get user() {
        return this._user;
    }
    set user(newUser) {
        this._user = user;
    }
}