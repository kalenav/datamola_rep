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
            tw instanceof Tweet
            && tw.id
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
            com instanceof Comment
            && com.id
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







const tweets = [
    {
        id: "1",
        text: "Some text here",
        createdAt: new Date("2022-03-09T22:22:22"),
        author: "Alice",
        comments: []
    },
    
    {
        id: "2",
        text: "Some other text here",
        createdAt: new Date("2022-03-09T23:22:00"),
        author: "Bob",
        comments: []
    },
    
    {
        id: "3",
        text: "Text with a #hashtag here",
        createdAt: new Date("2022-03-10T20:20:00"),
        author: "Charlie",
        comments: []
    },
    
    {
        id: "4",
        text: "Another #text with a #hashtag here",
        createdAt: new Date("2022-03-11T12:03:05"),
        author: "Daniel",
        comments: []
    },
    
    {
        id: "5",
        text: "Text is what this is",
        createdAt: new Date("2022-03-11T13:05:01"),
        author: "Ethan",
        comments: []
    },
    
    {
        id: "6",
        text: "Let your #imagination run wild, don't limit yourself. You can do much better than this.",
        createdAt: new Date("2022-03-12T19:25:00"),
        author: "Felicia",
        comments: [
            {
                id: "c42",
                text: "Thanks for the insipiration! I will do my best not to let you down.",
                createdAt: new Date("2022-03-12T19:25:25"),
                author: "Konstantin"
            }
        ]
    },
    
    {
        id: "7",
        text: "Wow, check out the #tweet below! I would never think it would be this easy to make that guy #write sensible tweets. Cheers, Felix!",
        createdAt: new Date("2022-03-12T19:30:42"),
        author: "George",
        comments: [
            {
                id: "c43",
                text: "And I took that personally. Sheesh. You didn't even #try talking to me to think that it would be difficult. Oh well.",
                createdAt: new Date("2022-03-12T19:30:50"),
                author: "Konstantin"
            }
        ]
    },
    
    {
        id: "8",
        text: "Ahem... With that out of the way, let's get into the #tweets. Eight done, twelve more to go. Just going to get myself a cup of #tea and I'll get right into it.",
        createdAt: new Date("2022-03-12T19:32:21"),
        author: "Konstantin",
        comments: []
    },
    
    {
        id: "9",
        text: "Guys, anyone #online?",
        createdAt: new Date("2022-03-12T19:33:33"),
        author: "Leonard",
        comments: []
    },
    
    {
        id: "10",
        text: "Yeah, I am, what is it?",
        createdAt: new Date("2022-03-12T19:33:50"),
        author: "Miranda",
        comments: [
            {
                id: "c44",
                text: "FYI, there is a comment section under each tweet. Oh well. A friend of mine will continue my thought in the text tweet.",
                createdAt: new Date("2022-03-12T19:34:24"),
                author: "Leonard"
            }
        ]
    },
    
    {
        id: "11",
        text: "Hey everyone! Leonard and I wish to write the remaining nine #tweets so this Konstantin guy doesn't need to.",
        createdAt: new Date("2022-03-12T19:35:00"),
        author: "Natalie",
        comments: []
    },
    
    {
        id: "12",
        text: "What an #idea! I'm in.",
        createdAt: new Date("2022-03-12T19:35:50"),
        author: "Olivia",
        comments: []
    },
    
    {
        id: "13",
        text: "I'd like to #join too!",
        createdAt: new Date("2022-03-12T19:36:14"),
        author: "Patrick",
        comments: []
    },
    
    {
        id: "14",
        text: "Wow, that a #community! I want to be a part of it too! And screw the #comments - write as much #tweets as you can!",
        createdAt: new Date("2022-03-12T19:36:42"),
        author: "Quentin",
        comments: [
            {
                id: "c45",
                text: "Come on now. He needs to have comments or his mentors won't be happy. Did you even read the homework task? Duh.",
                createdAt: new Date("2022-03-12T19:37:03"),
                author: "Leonard"
            },

            {
                id: "c46",
                text: "Oh, right, right, sorry. And some comments too.",
                createdAt: new Date("2022-03-12T19:37:30"),
                author: "Quentin"
            }
        ]
    },
    
    {
        id: "15",
        text: "I don't have the slightest #idea why we are doing this, but I guess we are!",
        createdAt: new Date("2022-03-12T19:37:54"),
        author: "Rose",
        comments: []
    },
    
    {
        id: "16",
        text: "Almost there, guys, keep it up! Post those #tweets like there's no tomorrow!",
        createdAt: new Date("2022-03-12T19:38:22"),
        author: "Simon",
        comments: []
    },
    
    {
        id: "17",
        text: "Has anyone noticed that the names of #tweets posters are in alphabetic order yet?",
        createdAt: new Date("2022-03-12T19:38:51"),
        author: "Timothy",
        comments: [
            {
                id: "c47",
                text: "No.",
                createdAt: new Date("2022-03-12T19:39:10"),
                author: "Anonymous"
            }
        ]
    },
    
    {
        id: "18",
        text: "Wow, Timothy's right! We must keep it going like this! Everyone, quick, think of a #friend whose name starts with letters after U!",
        createdAt: new Date("2022-03-12T19:39:33"),
        author: "Ulrich",
        comments: [ 
            {
                id: "c48",
                text: "Do acquaintances count?",
                createdAt: new Date("2022-03-12T19:39:55"),
                author: "Victoria"
            },

            {
                id: "c49",
                text: "Think later, you have the next letter! Quick, make a tweet before someone ruins it!",
                createdAt: new Date("2022-03-12T19:40:12"),
                author: "Ulrich"
            },

            {
                id: "c50",
                text: "Oh god... I'm late, aren't I?",
                createdAt: new Date("2022-03-12T19:44:42"),
                author: "Victoria"
            },

            {
                id: "c51",
                text: "No you aren't! Yet!",
                createdAt: new Date("2022-03-12T19:44:50"),
                author: "Ulrich"
            },

            {
                id: "c52",
                text: "You sure? I'm pretty certain someone has already posted a tweet.",
                createdAt: new Date("2022-03-12T19:45:13"),
                author: "Victoria"
            },

            {
                id: "c53",
                text: "JUST POST THE DAMN TWEET!",
                createdAt: new Date("2022-03-12T19:45:20"),
                author: "Ulrich"
            },
        ]
    },
    
    {
        id: "19",
        text: "Okay, okay, I posted a #tweet. Jeez.",
        createdAt: new Date("2022-03-12T19:45:44"),
        author: "Victoria",
        comments: [
            {
                id: "c54",
                text: "Could you have waited a little longer?",
                createdAt: new Date("2022-03-12T19:45:53"),
                author: "Ulrich"
            }
        ]
    },
    
    {
        id: "20",
        text: "Okay, even though there were some issues back there, I hereby declare our #feat accomplished. WITH the alphabetical order kept.",
        createdAt: new Date("2022-03-12T19:46:22"),
        author: "Wendy",
        comments: []
    },

    {
        id: "21",
        text: "Wow, now that's a 'good morning'. That was quite a ride. Too bad I wasn't here then.",
        createdAt: new Date("2022-03-13T08:46:31"),
        author: "Xavier",
        comments: []
    },

    {
        id: "22",
        text: "Just who do you think you are? He was supposed to do it by himself!",
        createdAt: new Date("2022-03-13T13:43:21"),
        author: "Yana",
        comments: [
            {
                id: "c55",
                text: "I'm more concerned by the fact that it takes him more than a day to get a cup of tea...",
                createdAt: new Date("2022-03-13T21:28:03"),
                author: "Leonard"
            }
        ]
    },

    {
        id: "23",
        text: "I don't think he's coming back... You did well, guys. Go do #something else.",
        createdAt: new Date("2022-03-14T22:26:01"),
        author: "Zoe",
        comments: []
    },

    {
        id: "24",
        text: "Uh, hey, everyone! Sorry for the late arrival! Uhm... I have uh... Another task I need to do... Does anyone want to #help me out?",
        createdAt: new Date("2022-04-25T22:22:22"),
        author: "Konstantin",
        comments: []
    }
]

function tests() {
    let testsPassed = 0;

    const feed = new TweetFeed(tweets);
    let expecting;
    let actual;
}