const englishAlphabetLeftBound = 65;
const englishAlphabetRightBound = 122;
const russianAlphabetLeftBound = 1040;
const russianAlpahbetRightBound = 1103;

class Tweet {

    _id;
    _createdAt;
    _author;

    constructor(id, text, date, author, comments) {
        this._id = id;
        this.text = text;
        this._createdAt = date;
        this._author = author;
        this.comments = comments;
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
            tw instanceof Tweet
            && tw._id
            && typeof(tw._id) === "string"
            && (tw.text || tw.text === "")
            && typeof(tw.text) === "string"
            && tw.text.length <= 280
            && tw._createdAt
            && tw._createdAt instanceof Date
            && tw._author !== ""
            && typeof(tw._author) === "string"
            && tw.comments
            && tw.comments instanceof Array
        )
    }
}

class Comment {

    _id;
    _createdAt;
    _author;

    constructor(id, text, date, author) {
        this._id = id;
        this.text = text;
        this._createdAt = date;
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
            com instanceof Comment
            && com._id
            && typeof(com._id) === "string"
            && (com.text || com.text === "")
            && typeof(com.text) === "string"
            && com.text.length <= 280
            && com._createdAt
            && com._createdAt instanceof Date
            && com._author !== ""
            && typeof(com._author) === "string"
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
            if(filterConfig.dateFrom) result = result.filter((tweet) => tweet.date >= filterConfig.dateFrom);
            if(filterConfig.dateTo) result = result.filter((tweet) => tweet.date <= filterConfig.dateTo);
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
        result.sort((tweet1, tweet2) => tweet1.date > tweet2.date ? -1 : 1);
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







const tweets = [
    new Tweet(
        "1",
        "Some text here",
        new Date("2022-03-09T22:22:22"),
        "Alice",
        []
    ),
    
    new Tweet(
        "2",
        "Some other text here",
        new Date("2022-03-09T23:22:00"),
        "Bob",
        []
    ),
    
    new Tweet(
        "3",
        "Text with a #hashtag here",
        new Date("2022-03-10T20:20:00"),
        "Charlie",
        []
    ),
    
    new Tweet(
        "4",
        "Another #text with a #hashtag here",
        new Date("2022-03-11T12:03:05"),
        "Daniel",
        []
    ),
    
    new Tweet(
        "5",
        "Text is what this is",
        new Date("2022-03-11T13:05:01"),
        "Ethan",
        []
    ),
    
    new Tweet(
        "6",
        "Let your #imagination run wild, don't limit yourself. You can do much better than this.",
        new Date("2022-03-12T19:25:00"),
        "Felicia",
        [
            new Comment("c42", "Thanks for the insipiration! I will do my best not to let you down.", new Date("2022-03-12T19:25:25"), "Konstantin")
        ]
    ),
    
    new Tweet(
        "7",
        "Wow, check out the #tweet below! I would never think it would be this easy to make that guy #write sensible tweets. Cheers, Felix!",
        new Date("2022-03-12T19:30:42"),
        "George",
        [
            new Comment("c43", "And I took that personally. Sheesh. You didn't even #try talking to me to think that it would be difficult. Oh well.", new Date("2022-03-12T19:30:50"), "Konstantin")
        ]
    ),
    
    new Tweet(
        "8",
        "Ahem... With that out of the way, let's get into the #tweets. Eight done, twelve more to go. Just going to get myself a cup of #tea and I'll get right into it.",
        new Date("2022-03-12T19:32:21"),
        "Konstantin",
        []
    ),
    
    new Tweet(
        "9",
        "Guys, anyone #online?",
        new Date("2022-03-12T19:33:33"),
        "Leonard",
        []
    ),
    
    new Tweet(
        "10",
        "Yeah, I am, what is it?",
        new Date("2022-03-12T19:33:50"),
        "Miranda",
        [
            new Comment("c44", "FYI, there is a comment section under each tweet. Oh well. A friend of mine will continue my thought in the text tweet.", new Date("2022-03-12T19:34:24"), "Leonard")
        ]
    ),
    
    new Tweet(
        "11",
        "Hey everyone! Leonard and I wish to write the remaining nine #tweets so this Konstantin guy doesn't need to.",
        new Date("2022-03-12T19:35:00"),
        "Natalie",
        []
    ),
    
    new Tweet(
        "12",
        "What an #idea! I'm in.",
        new Date("2022-03-12T19:35:50"),
        "Olivia",
        []
    ),
    
    new Tweet(
        "13",
        "I'd like to #join too!",
        new Date("2022-03-12T19:36:14"),
        "Patrick",
        []
    ),
    
    new Tweet(
        "14",
        "Wow, that a #community! I want to be a part of it too! And screw the #comments - write as much #tweets as you can!",
        new Date("2022-03-12T19:36:42"),
        "Quentin",
        [
            new Comment("c45", "Come on now. He needs to have comments or his mentors won't be happy. Did you even read the homework task? Duh.", new Date("2022-03-12T19:37:03"), "Leonard"),
            new Comment("c46", "Oh, right, right, sorry. And some comments too.", new Date("2022-03-12T19:37:30"), "Quentin")
        ]
    ),
    
    new Tweet(
        "15",
        "I don't have the slightest #idea why we are doing this, but I guess we are!",
        new Date("2022-03-12T19:37:54"),
        "Rose",
        []
    ),
    
    new Tweet(
        "16",
        "Almost there, guys, keep it up! Post those #tweets like there's no tomorrow!",
        new Date("2022-03-12T19:38:22"),
        "Simon",
        []
    ),
    
    new Tweet(
        "17",
        "Has anyone noticed that the names of #tweets posters are in alphabetic order yet?",
        new Date("2022-03-12T19:38:51"),
        "Timothy",
        [
            new Comment("c47", "No.", new Date("2022-03-12T19:39:10"), "Anonymous")
        ]
    ),
    
    new Tweet(
        "18",
        "Wow, Timothy's right! We must keep it going like this! Everyone, quick, think of a #friend whose name starts with letters after U!",
        new Date("2022-03-12T19:39:33"),
        "Ulrich",
        [ 
            new Comment("c48", "Do acquaintances count?", new Date("2022-03-12T19:39:55"), "Victoria"),
            new Comment("c49", "Think later, you have the next letter! Quick, make a tweet before someone ruins it!", new Date("2022-03-12T19:40:12"), "Ulrich"),
            new Comment("c50", "Oh god... I'm late, aren't I?", new Date("2022-03-12T19:44:42"), "Victoria"),
            new Comment("c51", "No you aren't! Yet!", new Date("2022-03-12T19:44:50"), "Ulrich"),
            new Comment("c52", "You sure? I'm pretty certain someone has already posted a tweet.", new Date("2022-03-12T19:45:13"), "Victoria"),
            new Comment("c53", "JUST POST THE DAMN TWEET!", new Date("2022-03-12T19:45:20"), "Ulrich")
        ]
    ),
    
    new Tweet(
        "19",
        "Okay, okay, I posted a #tweet. Jeez.",
        new Date("2022-03-12T19:45:44"),
        "Victoria",
        [
            new Comment("c54", "Could you have waited a little longer?", new Date("2022-03-12T19:45:53"), "Ulrich")
        ]
    ),
    
    new Tweet(
        "20",
        "Okay, even though there were some issues back there, I hereby declare our #feat accomplished. WITH the alphabetical order kept.",
        new Date("2022-03-12T19:46:22"),
        "Wendy",
        []
    ),

    new Tweet(
        "21",
        "Wow, now that's a 'good morning'. That was quite a ride. Too bad I wasn't here then.",
        new Date("2022-03-13T08:46:31"),
        "Xavier",
        []
    ),

    new Tweet(
        "22",
        "Just who do you think you are? He was supposed to do it by himself!",
        new Date("2022-03-13T13:43:21"),
        "Yana",
        [
            new Comment("c55", "I'm more concerned by the fact that it takes him more than a day to get a cup of tea...", new Date("2022-03-13T21:28:03"), "Leonard")
        ]
    ),

    new Tweet(
        "23",
        "I don't think he's coming back... You did well, guys. Go do #something else.",
        new Date("2022-03-14T22:26:01"),
        "Zoe",
        []
    ),

    new Tweet(
        "24",
        "Uh, hey, everyone! Sorry for the late arrival! Uhm... I have uh... Another task I need to do... Does anyone want to #help me out?",
        new Date("2022-04-25T22:22:22"),
        "Konstantin",
        []
    )
]

function tests() {
    let testsPassed = 0;

    const feed = new TweetFeed(tweets);
    let expecting;
    let actual;
    console.log(feed);

    console.log("test 1: feed.getPage()");
    expecting = tweets.slice(14, 24).reverse();
    actual = feed.getPage();
    if(actual.every((v, i) => actual[i] === expecting[i])) {
        testsPassed++;
        console.log("passed");
    }
    else console.log("FAILED");

    console.log("");

    console.log("test 2: feed.getPage(0, 10)");
    expecting = tweets.slice(14, 24).reverse();
    actual = feed.getPage(0, 10);
    if(actual.every((v, i) => actual[i] === expecting[i])) {
        testsPassed++;
        console.log("passed");
    }
    else console.log("FAILED");

    console.log("");

    console.log("test 3: feed.getPage(10, 10)");
    expecting = tweets.slice(4, 14).reverse();
    actual = feed.getPage(10, 10);
    if(actual.every((v, i) => actual[i] === expecting[i])) {
        testsPassed++;
        console.log("passed");
    }
    else console.log("FAILED");

    console.log("");

    console.log("test 4: feed.getPage(0, 10, {author: 'e'})")
    expecting = [tweets[22], tweets[20], tweets[19], tweets[14], tweets[13], tweets[10], tweets[8], tweets[6], tweets[5], tweets[3], tweets[2], tweets[0]];
    actual = feed.getPage(0, 10, {author: "e"});
    if(actual.every((v, i) => actual[i] === expecting[i])) {
        testsPassed++;
        console.log("passed");
    }
    else console.log("FAILED");

    console.log("");

    console.log("test 5: feed.getPage(0, 5, {hashtags: ['tweet']})");
    expecting = [tweets[18], tweets[6]];
    actual = feed.getPage(0, 5, {hashtags: ["tweet"]});
    if(actual.every((v, i) => actual[i] === expecting[i])) {
        testsPassed++;
        console.log("passed");
    }
    else console.log("FAILED");

    console.log("");

    console.log("test 6: feed.get('13')");
    expecting = tweets[12];
    actual = feed.get("13");
    if(expecting === actual) {
        testsPassed++;
        console.log("passed");
    }
    else console.log("FAILED");

    console.log("");

    console.log("7: feed.get('not an actual id')");
    expecting = undefined;
    actual = feed.get("not an actual id");
    if(expecting === actual) {
        testsPassed++;
        console.log("passed");
    }
    else console.log("FAILED");

    console.log("");

    console.log("test 8: Tweet.validate(new Tweet('1', 'hi there', new Date(), 'someone', []))");
    if(Tweet.validate(new Tweet('1', 'hi there', new Date(), 'someone', []))) {
        testsPassed++;
        console.log("passed");
    }
    else console.log("FAILED");

    console.log("");

    console.log("test 9: Tweet.validate(feed.get('3'))");
    if(Tweet.validate(feed.get('3'))) {
        testsPassed++;
        console.log("passed");
    }
    else console.log("FAILED");

    console.log("");

    console.log("test 10: Tweet.validate(new Tweet('id', '', new Date(), 'e', []))");
    if(Tweet.validate(new Tweet('id', '', new Date(), 'e', []))) {
        testsPassed++;
        console.log("passed");
    }
    else console.log("FAILED");

    console.log("");

    console.log("test 11: Tweet.validate(new Tweet('', 'text', new Date(), 'a beeper perhaps', []))")
    if(!Tweet.validate(new Tweet('', 'text', new Date(), 'a beeper perhaps', []))) {
        testsPassed++;
        console.log("passed");
    }
    else console.log("FAILED");

    console.log("");

    console.log("test 12: Tweet.validate(new Tweet('123', 'this text is over 280 symbols this text is over 280 symbols this text is over 280 symbols this text is over 280 symbols this text is over 280 symbols this text is over 280 symbols this text is over 280 symbols this text is over 280 symbols this text is over 280 symbols this text is over 280 symbols', 'some very wordy fella', []))");
    if(!Tweet.validate(new Tweet('123', 'this text is over 280 symbols this text is over 280 symbols this text is over 280 symbols this text is over 280 symbols this text is over 280 symbols this text is over 280 symbols this text is over 280 symbols this text is over 280 symbols this text is over 280 symbols this text is over 280 symbols', 'some very wordy fella', []))) {
        testsPassed++;
        console.log("passed");
    }
    else console.log("FAILED");

    console.log("");

    console.log("test 13: Tweet.validate(new Tweet('42', 'i always say morning instead of good morning', 'some very shady fella', []))");
    if(Tweet.validate(new Tweet('42', 'i always say morning instead of good morning', 'some very shady fella', []))) {
        testsPassed++;
        console.log("passed");
    }
    else console.log("FAILED");

    console.log("");

    console.log("test 14: Tweet.validate(new Tweet('256', 'who am I?', '', []))");
    if(!Tweet.validate(new Tweet('256', 'who am I?', '', []))) {
        testsPassed++;
        console.log("passed");
    }
    else console.log("FAILED");

    console.log("");

    console.log("test 15: Tweet.validate(new Tweet('512', 'alrighty then', 'some very agreeable fella',  {}))");
    if(!Tweet.validate(new Tweet('512', 'alrighty then', 'some very agreeable fella',  {}))) {
        testsPassed++;
        console.log("passed");
    }
    else console.log("FAILED");

    console.log("");

    console.log("test 16: feed.add(\"i'm a text!\")");
    feed.add("i'm a text!");
    actual = tweets[tweets.length - 1];
    if(
    actual.id === "25"
    && actual.text === "i'm a text!"
    && actual.createdAt
    && actual.author === "TEST_USER"
    && actual.comments instanceof Array
    && actual.comments.length === 0) {
        testsPassed++;
        console.log("passed");
    }
    else console.log("FAILED");

    console.log("");

    console.log("test 17: feed.edit('25', \"i'm still a text, but different!\") (current user is the author)")
    feed.edit('25', "i'm still a text, but different!");
    if(tweets[tweets.length - 1].text === "i'm still a text, but different!") {
        testsPassed++;
        console.log("passed");
    }
    else console.log("FAILED");

    console.log("");

    feed.user = "OTHER_USER";
    console.log("test 18: feed.edit('25', \"i'm yet another text!\") (current user is not the author)");
    feed.edit('25', "i'm yet another text!");
    if(tweets[tweets.length - 1].text === "i'm still a text, but different!") {
        testsPassed++;
        console.log("passed");
    }
    else console.log("FAILED");
    feed.user = "TEST_USER";

    console.log("");

    console.log("test 19: feed.edit('25', \"this text is over 280 symbols this text is over 280 symbols this text is over 280 symbols this text is over 280 symbols this text is over 280 symbols this text is over 280 symbols this text is over 280 symbols this text is over 280 symbols this text is over 280 symbols this text is over 280 symbols\")");
    if(!feed.edit('25', "this text is over 280 symbols this text is over 280 symbols this text is over 280 symbols this text is over 280 symbols this text is over 280 symbols this text is over 280 symbols this text is over 280 symbols this text is over 280 symbols this text is over 280 symbols this text is over 280 symbols")) {
        testsPassed++;
        console.log("passed");
    }
    else console.log("FAILED");

    console.log("");

    console.log("test 20: feed.remove('25') (user is the author)");
    if(feed.remove('25')) {
        testsPassed++;
        console.log("passed");
    }
    else console.log("FAILED");

    console.log("");

    console.log("test 21: feed.remove('15') (user is not he author)");
    if(!feed.remove('15')) {
        testsPassed++;
        console.log("passed");
    }
    else console.log("FAILED");

    console.log("");

    console.log("test 22: feed.remove('not an actual id')");
    if(!feed.remove('not an actual id')) {
        testsPassed++;
        console.log("passed");
    }
    else console.log("FAILED");

    console.log("");

    console.log("test 23: Comment.validate(new Comment('c1024', 'some text', 'some very unoriginal fella'))");
    if(Comment.validate(new Comment('c1024', 'some text', 'some very unoriginal fella'))) {
        testsPassed++;
        console.log("passed");
    }    
    else console.log("FAILED");

    console.log("");

    console.log("test 24: Comment.validate(new Comment('', '', 'some empty fella'))");
    if(Comment.validate(new Comment('', '', 'some empty fella'))) {
        testsPassed++;
        console.log("passed");
    }
    else console.log("FAILED");

    console.log("");

    /*
    console.log("test 25: feed.addComment('2', 'what a great tweet!')");
    if(feed.addComment('2', 'what a great tweet!')) {
        const comment = tweets[1].comments[0];
        if(comment.id === "c56"
        && comment.text === "what a great tweet!"
        && comment.createdAt
        && comment.author === "TEST_USER") {
            testsPassed++;
            console.log("passed");
        }
        else console.log("FAILED");
    }

    console.log("");
    */

    console.log("test 26: feed.user = 'OTHER_USER'");
    feed.user = 'OTHER_USER';
    if(feed.user === "OTHER_USER") {
        testsPassed++;
        console.log("passed");
    }
    else console.log("FAILED");

    console.log("");
    console.log("==========================================");
    console.log("");

    console.log(`${testsPassed}/26 tests passed`);
}