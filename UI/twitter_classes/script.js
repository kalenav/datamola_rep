'use strict';

/* eslint linebreak-style: ['error', 'windows'] */
/* eslint 'require-jsdoc': ['error', {
    'require': {
            "FunctionDeclaration": false,
            "MethodDefinition": false,
            "ClassDeclaration": false,
            "ArrowFunctionExpression": false,
            "FunctionExpression": false
    }
}] */
/* eslint indent: 'error' */
/* eslint max-len: ['error', { 'code': 500 }] */

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

    static validate(tw) {
        return (
            tw instanceof Tweet &&
            tw._id && typeof(tw._id) === 'string' &&
            (tw.text || tw.text === '') &&
            typeof(tw.text) === 'string' &&
            tw.text.length <= 280 &&
            tw._createdAt &&
            tw._createdAt instanceof Date &&
            tw._author !== '' &&
            typeof(tw._author) === 'string' &&
            tw.comments &&
            tw.comments instanceof Array
        );
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
            com instanceof Comment &&
            com._id &&
            typeof(com._id) === 'string' &&
            (com.text || com.text === '') &&
            typeof(com.text) === 'string' &&
            com.text.length <= 280 &&
            com._createdAt &&
            com._createdAt instanceof Date &&
            com._author !== '' &&
            typeof(com._author) === 'string'
        );
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
        for (let i = 0; i < tws.length; i++) {
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
        if (filterConfig) {
            if (filterConfig.author) result = result.filter((tweet) => tweet.author.includes(filterConfig.author));
            if (filterConfig.dateFrom) result = result.filter((tweet) => tweet.date >= filterConfig.dateFrom);
            if (filterConfig.dateTo) result = result.filter((tweet) => tweet.date <= filterConfig.dateTo);
            if (filterConfig.hashtags) {
                result = result.filter((tweet) => filterConfig.hashtags.every((hashtag) => {
                    const hashtagStart = tweet.text.indexOf(hashtag);
                    if (hashtagStart === -1) return false; // хэштег не был найден
                    const hashtagEnd = hashtagStart + hashtag.length - 1;
                    if (hashtagEnd === tweet.text.length - 1) return true; // хэштегом заканчивается текст твита
                    const nextCharCode = tweet.text.charCodeAt(hashtagEnd + 1);
                    if ((nextCharCode >= englishAlphabetLeftBound && nextCharCode <= englishAlphabetRightBound) ||
                    (nextCharCode >= russianAlphabetLeftBound && nextCharCode <= russianAlpahbetRightBound)) return false; // после хэштега идёт буквенный символ, т.е. хэштег продолжается
                    return true;
                }));
            };
            if (filterConfig.text || filterConfig.text === '') result = result.filter((tweet) => tweet.text.includes(filterConfig.text));
        }
        result.sort((tweet1, tweet2) => tweet1.date > tweet2.date ? -1 : 1);
        return result.slice(skip, skip + top);
    }

    get(id) {
        return this._tweets.find((tw) => tw.id === id);
    }

    add(text) {
        const newTweet = new Tweet(this._generateTweetId(), text, new Date(), this._user, []);
        if (Tweet.validate(newTweet)) {
            this._tweets.push(newTweet);
            return true;
        }
        return false;
    }

    edit(id, text) {
        const tweet = this.get(id);
        if (tweet.author !== this._user) return false;
        const snapshot = tweet.text;
        tweet.text = text;
        if (Tweet.validate(tweet)) return true;
        tweet.text = snapshot;
        return false;
    }

    remove(id) {
        const tweetIndex = this._tweets.findIndex((tw) => tw.id === id);
        if (tweetIndex === -1 || this._tweets[tweetIndex].author !== this._user) return false;
        this._tweets.splice(tweetIndex, 1);
        return true;
    }

    addComment(id, text) {
        const tweet = this.get(id);
        if (!tweet) return false;
        tweet.comments.push(new Comment(this._generateCommentId(), text, new Date(), this._user));
        return true;
    }

    _generateTweetId() {
        return String(Number(this._tweets[this._tweets.length - 1].id) + 1);
    }

    _generateCommentId() {
        return ('c' + String(this._tweets.reduce((oldestCommentId, tweet) => {
            const currTweetOldestCommentId = tweet.comments.reduce((r, comment) => {
                const currCommentId = Number(comment.id.slice(1, comment.id.length));
                return currCommentId > r ? currCommentId : r;
            }, 0);
            return currTweetOldestCommentId > oldestCommentId ? currTweetOldestCommentId : oldestCommentId;
        }, 0) + 1));
    }

    get user() {
        return this._user;
    }
    set user(newUser) {
        this._user = newUser;
    }
}

class HeaderView {
    _container;

    constructor(containerId) {
        this._container = document.getElementById(containerId);
    }

    display(user) {
        this._container.innerHTML = user;
        const button = document.getElementById("header-button");
        if(button.innerHTML === "Log In") button.innerHTML = "Log Out";
    }
}

class ViewUtils {
    static getDateNumbers(date) {
        const day = Math.floor(date.getDate() / 10) === 0 ? `0${date.getDate()}` : date.getDate();
        const month = Math.floor(date.getMonth() / 10) === 0 ? `0${date.getMonth()}` : date.getMonth();
        const hours = Math.floor(date.getHours() / 10) === 0 ? `0${date.getHours()}` : date.getHours();
        const minutes = Math.floor(date.getMinutes() / 10) === 0 ? `0${date.getMinutes()}` : date.getMinutes();
        return {day, month, hours, minutes};
    }
    
    static wrapHashtags(text) {
        let hashtag = "";
        for(let i = 0; i < text.length; i++) {
            if(text[i] === '#') {
                while(i < text.length && text[i] != ' ') {
                    hashtag += text[i++];
                }
                text = text.split(hashtag).join(`<span class='hashtag'>${hashtag}</span>`);
                hashtag = "";
            }
        }
        return text;
    }

    static newTag(tagName, className, text) {
        const tag = document.createElement(tagName);
        if(className) tag.setAttribute('class', className);
        if(text) tag.innerHTML = text;
        return tag;
    }
}

class TweetFeedView {
    _container;

    constructor(containerId) {
        this._container = document.getElementById(containerId);
    }

    display(tweets) { // tweets: Array<Tweet>
        this._container.innerHTML = '<section class="new-tweet"><p>New tweet</p><input type="textarea" placeholder="Input text"></section>';
        const tweetsSection = ViewUtils.newTag('section', 'tweets');
        tweetsSection.appendChild(ViewUtils.newTag('button', 'filters-button', 'Filters'))
        tweets.forEach((tweet) => {
            const newTweet = ViewUtils.newTag('div', 'tweet');

            const dateNumbers = ViewUtils.getDateNumbers(tweet.date);
            newTweet.appendChild(ViewUtils.newTag('p', 'author-info', `by ${tweet.author} on ${dateNumbers.day}.${dateNumbers.month} at ${dateNumbers.hours}:${dateNumbers.minutes}`));
            newTweet.appendChild(ViewUtils.newTag('p', 'tweet-text', ViewUtils.wrapHashtags(tweet.text)));
            newTweet.appendChild(ViewUtils.newTag('p', '', `${tweet.comments.length} replies`));
            tweetsSection.appendChild(newTweet);
        });
        const loadMoreButtonContainer = ViewUtils.newTag('div', 'align-fix');
        loadMoreButtonContainer.appendChild(ViewUtils.newTag('button', 'load-more', 'Load more'));
        tweetsSection.appendChild(loadMoreButtonContainer);
        this._container.appendChild(tweetsSection);
    }
}

class FilterView {
    _container;

    constructor(containerId) {
        this._container = document.getElementById(containerId);
    }

    display(filterChoices) { // filterChoices: Array<Boolean>
        this._container.children.forEach((option, i) => {
            if(filterChoices[i]) option.setAttribute('selected', '');
            else option.removeAttribute('selected');
        });
    }
}

class TweetView {
    _container;

    constructor(containerId) {
        this._container = document.getElementById(containerId);
    }

    display(tweet) {
        this._container.innerHTML = '';
        const tweetContainer = document.createElement('section');
        tweetContainer.setAttribute('class', 'tweet');

        const dateNumbers = ViewUtils.getDateNumbers(tweet.date);
        tweetContainer.appendChild(ViewUtils.newTag('p', 'author-info', `by ${tweet.author} on ${dateNumbers.day}.${dateNumbers.month} at ${dateNumbers.hours}:${dateNumbers.minutes}`));
        tweetContainer.appendChild(ViewUtils.newTag('p', 'tweet-text', ViewUtils.wrapHashtags(tweet.text)));

        this._container.appendChild(tweetContainer);

        const commentsContainer = document.createElement('section');
        commentsContainer.setAttribute('class', 'comments');
        tweet.comments.forEach((comment) => {
            const currCommentContainer = document.createElement('div');
            currCommentContainer.setAttribute('class', 'comment');

            const dateNumbers = ViewUtils.getDateNumbers(comment.date);
            currCommentContainer.appendChild(ViewUtils.newTag('p', 'author-name', `Comment by ${comment.author} on ${dateNumbers.day}.${dateNumbers.month} at ${dateNumbers.hours}:${dateNumbers.minutes}`));
            currCommentContainer.appendChild(ViewUtils.newTag('p', 'comment-text', comment.text));
            commentsContainer.appendChild(currCommentContainer);
        });
        this._container.appendChild(commentsContainer);
    }
}

function setCurrentUser(user) {
    feed.user = user;
    headerView.display(user);
}

function addTweet(text) {
    if(feed.add(text)) tweetFeedView.display(feed.getPage());;
}

function editTweet(id, text) {
    if(feed.edit(id, text)) tweetFeedView.display(feed.getPage());
}

function removeTweet(id) {
    if(feed.remove(id)) tweetFeedView.display(feed.getPage());
}

function getFeed(skip, top, filterConfig) {
    tweetFeedView.display(feed.getPage(skip, top, filterConfig));
}

function showTweet(id) {
    const tweet = feed.get(id);
    if(tweet) tweetView.display(tweet);
}


const tweets = [
    new Tweet(
        '1',
        'Some text here',
        new Date('2022-03-09T22:22:22'),
        'Alice',
        [],
    ),

    new Tweet(
        '2',
        'Some other text here',
        new Date('2022-03-09T23:22:00'),
        'Bob',
        [],
    ),

    new Tweet(
        '3',
        'Text with a #hashtag here',
        new Date('2022-03-10T20:20:00'),
        'Charlie',
        [],
    ),

    new Tweet(
        '4',
        'Another #text with a #hashtag here',
        new Date('2022-03-11T12:03:05'),
        'Daniel',
        [],
    ),

    new Tweet(
        '5',
        'Text is what this is',
        new Date('2022-03-11T13:05:01'),
        'Ethan',
        [],
    ),

    new Tweet(
        '6',
        'Let your #imagination run wild, don\'t limit yourself. You can do much better than this.',
        new Date('2022-03-12T19:25:00'),
        'Felicia',
        [
            new Comment('c42', 'Thanks for the insipiration! I will do my best not to let you down.', new Date('2022-03-12T19:25:25'), 'Konstantin'),
        ],
    ),

    new Tweet(
        '7',
        'Wow, check out the #tweet below! I would never think it would be this easy to make that guy #write sensible tweets. Cheers, Felix!',
        new Date('2022-03-12T19:30:42'),
        'George',
        [
            new Comment('c43', 'And I took that personally. Sheesh. You didn\'t even #try talking to me to think that it would be difficult. Oh well.', new Date('2022-03-12T19:30:50'), 'Konstantin'),
        ],
    ),

    new Tweet(
        '8',
        'Ahem... With that out of the way, let\'s get into the #tweets. Eight done, twelve more to go. Just going to get myself a cup of #tea and I\'ll get right into it.',
        new Date('2022-03-12T19:32:21'),
        'Konstantin',
        [],
    ),

    new Tweet(
        '9',
        'Guys, anyone #online?',
        new Date('2022-03-12T19:33:33'),
        'Leonard',
        [],
    ),

    new Tweet(
        '10',
        'Yeah, I am, what is it?',
        new Date('2022-03-12T19:33:50'),
        'Miranda',
        [
            new Comment('c44', 'FYI, there is a comment section under each tweet. Oh well. A friend of mine will continue my thought in the text tweet.', new Date('2022-03-12T19:34:24'), 'Leonard'),
        ],
    ),

    new Tweet(
        '11',
        'Hey everyone! Leonard and I wish to write the remaining nine #tweets so this Konstantin guy doesn\'t need to.',
        new Date('2022-03-12T19:35:00'),
        'Natalie',
        [],
    ),

    new Tweet(
        '12',
        'What an #idea! I\'m in.',
        new Date('2022-03-12T19:35:50'),
        'Olivia',
        [],
    ),

    new Tweet(
        '13',
        'I\'d like to #join too!',
        new Date('2022-03-12T19:36:14'),
        'Patrick',
        [],
    ),

    new Tweet(
        '14',
        'Wow, that a #community! I want to be a part of it too! And screw the #comments - write as much #tweets as you can!',
        new Date('2022-03-12T19:36:42'),
        'Quentin',
        [
            new Comment('c45', 'Come on now. He needs to have comments or his mentors won\'t be happy. Did you even read the homework task? Duh.', new Date('2022-03-12T19:37:03'), 'Leonard'),
            new Comment('c46', 'Oh, right, right, sorry. And some comments too.', new Date('2022-03-12T19:37:30'), 'Quentin'),
        ],
    ),

    new Tweet(
        '15',
        'I don\'t have the slightest #idea why we are doing this, but I guess we are!',
        new Date('2022-03-12T19:37:54'),
        'Rose',
        [],
    ),

    new Tweet(
        '16',
        'Almost there, guys, keep it up! Post those #tweets like there\'s no tomorrow!',
        new Date('2022-03-12T19:38:22'),
        'Simon',
        [],
    ),

    new Tweet(
        '17',
        'Has anyone noticed that the names of #tweets posters are in alphabetic order yet?',
        new Date('2022-03-12T19:38:51'),
        'Timothy',
        [
            new Comment('c47', 'No.', new Date('2022-03-12T19:39:10'), 'Anonymous'),
        ],
    ),

    new Tweet(
        '18',
        'Wow, Timothy\'s right! We must keep it going like this! Everyone, quick, think of a #friend whose name starts with letters after U!',
        new Date('2022-03-12T19:39:33'),
        'Ulrich',
        [
            new Comment('c48', 'Do acquaintances count?', new Date('2022-03-12T19:39:55'), 'Victoria'),
            new Comment('c49', 'Think later, you have the next letter! Quick, make a tweet before someone ruins it!', new Date('2022-03-12T19:40:12'), 'Ulrich'),
            new Comment('c50', 'Oh god... I\'m late, aren\'t I?', new Date('2022-03-12T19:44:42'), 'Victoria'),
            new Comment('c51', 'No you aren\'t! Yet!', new Date('2022-03-12T19:44:50'), 'Ulrich'),
            new Comment('c52', 'You sure? I\'m pretty certain someone has already posted a tweet.', new Date('2022-03-12T19:45:13'), 'Victoria'),
            new Comment('c53', 'JUST POST THE DAMN TWEET!', new Date('2022-03-12T19:45:20'), 'Ulrich'),
        ],
    ),

    new Tweet(
        '19',
        'Okay, okay, I posted a #tweet. Jeez.',
        new Date('2022-03-12T19:45:44'),
        'Victoria',
        [
            new Comment('c54', 'Could you have waited a little longer?', new Date('2022-03-12T19:45:53'), 'Ulrich'),
        ],
    ),

    new Tweet(
        '20',
        'Okay, even though there were some issues back there, I hereby declare our #feat accomplished. WITH the alphabetical order kept.',
        new Date('2022-03-12T19:46:22'),
        'Wendy',
        [],
    ),

    new Tweet(
        '21',
        'Wow, now that\'s a \'good morning\'. That was quite a ride. Too bad I wasn\'t here then.',
        new Date('2022-03-13T08:46:31'),
        'Xavier',
        [],
    ),

    new Tweet(
        '22',
        'Just who do you think you are? He was supposed to do it by himself!',
        new Date('2022-03-13T13:43:21'),
        'Yana',
        [
            new Comment('c55', 'I\'m more concerned by the fact that it takes him more than a day to get a cup of tea...', new Date('2022-03-13T21:28:03'), 'Leonard'),
        ],
    ),

    new Tweet(
        '23',
        'I don\'t think he\'s coming back... You did well, guys. Go do #something else.',
        new Date('2022-03-14T22:26:01'),
        'Zoe',
        [],
    ),

    new Tweet(
        '24',
        'Uh, hey, everyone! Sorry for the late arrival! Uhm... I have uh... Another task I need to do... Does anyone want to #help me out?',
        new Date('2022-03-19T22:22:22'),
        'Konstantin',
        [],
    ),
];

function tests() {
    let testsPassed = 0;

    const feed = new TweetFeed(tweets);
    feed.user = 'TEST_USER';
    let expecting;
    let actual;
    console.log(feed);

    console.log('test 1: feed.getPage()');
    expecting = tweets.slice(14, 24).reverse();
    actual = feed.getPage();
    if (actual.every((v, i) => actual[i] === expecting[i])) {
        testsPassed++;
        console.log('passed');
    } else console.log('FAILED');

    console.log('');

    console.log('test 2: feed.getPage(0, 10)');
    expecting = tweets.slice(14, 24).reverse();
    actual = feed.getPage(0, 10);
    if (actual.every((v, i) => actual[i] === expecting[i])) {
        testsPassed++;
        console.log('passed');
    } else console.log('FAILED');

    console.log('');

    console.log('test 3: feed.getPage(10, 10)');
    expecting = tweets.slice(4, 14).reverse();
    actual = feed.getPage(10, 10);
    if (actual.every((v, i) => actual[i] === expecting[i])) {
        testsPassed++;
        console.log('passed');
    } else console.log('FAILED');

    console.log('');

    console.log('test 4: feed.getPage(0, 10, {author: \'e\'})');
    expecting = [tweets[22], tweets[20], tweets[19], tweets[14], tweets[13], tweets[10], tweets[8], tweets[6], tweets[5], tweets[3], tweets[2], tweets[0]];
    actual = feed.getPage(0, 10, {author: 'e'});
    if (actual.every((v, i) => actual[i] === expecting[i])) {
        testsPassed++;
        console.log('passed');
    } else console.log('FAILED');

    console.log('');

    console.log('test 5: feed.getPage(0, 5, {hashtags: [\'tweet\']})');
    expecting = [tweets[18], tweets[6]];
    actual = feed.getPage(0, 5, {hashtags: ['tweet']});
    if (actual.every((v, i) => actual[i] === expecting[i])) {
        testsPassed++;
        console.log('passed');
    } else console.log('FAILED');

    console.log('');

    console.log('test 6: feed.get(\'13\')');
    expecting = tweets[12];
    actual = feed.get('13');
    if (expecting === actual) {
        testsPassed++;
        console.log('passed');
    } else console.log('FAILED');

    console.log('');

    console.log('test 7: feed.get(\'not an actual id\')');
    expecting = undefined;
    actual = feed.get('not an actual id');
    if (expecting === actual) {
        testsPassed++;
        console.log('passed');
    } else console.log('FAILED');

    console.log('');

    console.log('test 8: Tweet.validate(new Tweet(\'1\', \'hi there\', new Date(), \'someone\', []))');
    if (Tweet.validate(new Tweet('1', 'hi there', new Date(), 'someone', []))) {
        testsPassed++;
        console.log('passed');
    } else console.log('FAILED');

    console.log('');

    console.log('test 9: Tweet.validate(feed.get(\'3\'))');
    if (Tweet.validate(feed.get('3'))) {
        testsPassed++;
        console.log('passed');
    } else console.log('FAILED');

    console.log('');

    console.log('test 10: Tweet.validate(new Tweet(\'id\', \'\', new Date(), \'e\', []))');
    if (Tweet.validate(new Tweet('id', '', new Date(), 'e', []))) {
        testsPassed++;
        console.log('passed');
    } else console.log('FAILED');

    console.log('');

    console.log('test 11: Tweet.validate(new Tweet(\'\', \'text\', new Date(), \'a beeper perhaps\', []))');
    if (!Tweet.validate(new Tweet('', 'text', new Date(), 'a beeper perhaps', []))) {
        testsPassed++;
        console.log('passed');
    } else console.log('FAILED');

    console.log('');

    console.log('test 12: Tweet.validate(new Tweet(\'123\', \'this text is over 280 symbols this text is over 280 symbols this text is over 280 symbols this text is over 280 symbols this text is over 280 symbols this text is over 280 symbols this text is over 280 symbols this text is over 280 symbols this text is over 280 symbols this text is over 280 symbols\', new Date(), \'some very wordy fella\', []))');
    if (!Tweet.validate(new Tweet('123', 'this text is over 280 symbols this text is over 280 symbols this text is over 280 symbols this text is over 280 symbols this text is over 280 symbols this text is over 280 symbols this text is over 280 symbols this text is over 280 symbols this text is over 280 symbols this text is over 280 symbols', new Date(), 'some very wordy fella', []))) {
        testsPassed++;
        console.log('passed');
    } else console.log('FAILED');

    console.log('');

    console.log('test 13: Tweet.validate(new Tweet(\'42\', \'i always say morning instead of good morning\', new Date(), \'some very shady fella\', []))');
    if (Tweet.validate(new Tweet('42', 'i always say morning instead of good morning', new Date(), 'some very shady fella', []))) {
        testsPassed++;
        console.log('passed');
    } else console.log('FAILED');

    console.log('');

    console.log('test 14: Tweet.validate(new Tweet(\'256\', \'who am I?\', new Date(), \'\', []))');
    if (!Tweet.validate(new Tweet('256', 'who am I?', new Date(), '', []))) {
        testsPassed++;
        console.log('passed');
    } else console.log('FAILED');

    console.log('');

    console.log('test 15: Tweet.validate(new Tweet(\'512\', \'alrighty then\', new Date(), \'some very agreeable fella\',  {}))');
    if (!Tweet.validate(new Tweet('512', 'alrighty then', new Date(), 'some very agreeable fella', {}))) {
        testsPassed++;
        console.log('passed');
    } else console.log('FAILED');

    console.log('');

    console.log('test 16: feed.add(\'i\'m a text!\')');
    feed.add('i\'m a text!');
    actual = feed.getPage(0, 25)[0];
    if (
        Tweet.validate(actual) &&
        actual.id === '25' &&
        actual.text === 'i\'m a text!' &&
        actual.date &&
        actual.author === 'TEST_USER' &&
        actual.comments instanceof Array &&
        actual.comments.length === 0) {
        testsPassed++;
        console.log('passed');
    } else console.log('FAILED');

    console.log('');

    console.log('test 17: feed.edit(\'25\', \'i\'m still a text, but different!\') (current user is the author)');
    feed.edit('25', 'i\'m still a text, but different!');
    if (feed.getPage(0, 25)[0].text === 'i\'m still a text, but different!') {
        testsPassed++;
        console.log('passed');
    } else console.log('FAILED');

    console.log('');

    feed.user = 'OTHER_USER';
    console.log('test 18: feed.edit(\'25\', \'i\'m yet another text!\') (current user is not the author)');
    feed.edit('25', 'i\'m yet another text!');
    if (feed.getPage(0, 25)[0].text === 'i\'m still a text, but different!') {
        testsPassed++;
        console.log('passed');
    } else console.log('FAILED');
    feed.user = 'TEST_USER';

    console.log('');

    console.log('test 19: feed.edit(\'25\', \'this text is over 280 symbols this text is over 280 symbols this text is over 280 symbols this text is over 280 symbols this text is over 280 symbols this text is over 280 symbols this text is over 280 symbols this text is over 280 symbols this text is over 280 symbols this text is over 280 symbols\')');
    if (!feed.edit('25', 'this text is over 280 symbols this text is over 280 symbols this text is over 280 symbols this text is over 280 symbols this text is over 280 symbols this text is over 280 symbols this text is over 280 symbols this text is over 280 symbols this text is over 280 symbols this text is over 280 symbols')) {
        testsPassed++;
        console.log('passed');
    } else console.log('FAILED');

    console.log('');

    console.log('test 20: feed.remove(\'25\') (user is the author)');
    if (feed.remove('25')) {
        testsPassed++;
        console.log('passed');
    } else console.log('FAILED');

    console.log('');

    console.log('test 21: feed.remove(\'15\') (user is not he author)');
    if (!feed.remove('15')) {
        testsPassed++;
        console.log('passed');
    } else console.log('FAILED');

    console.log('');

    console.log('test 22: feed.remove(\'not an actual id\')');
    if (!feed.remove('not an actual id')) {
        testsPassed++;
        console.log('passed');
    } else console.log('FAILED');

    console.log('');

    console.log('test 23: Comment.validate(new Comment(\'c1024\', \'some text\', \'some very unoriginal fella\'))');
    if (Comment.validate(new Comment('c1024', 'some text', new Date(), 'some very unoriginal fella'))) {
        testsPassed++;
        console.log('passed');
    } else console.log('FAILED');

    console.log('');

    console.log('test 24: Comment.validate(new Comment(\'\', \'\', \'some empty fella\'))');
    if (!Comment.validate(new Comment('', '', new Date(), 'some empty fella'))) {
        testsPassed++;
        console.log('passed');
    } else console.log('FAILED');

    console.log('');

    console.log('test 25: feed.addComment(\'2\', \'what a great tweet!\')');
    if (feed.addComment('2', 'what a great tweet!')) {
        const comment = tweets[1].comments[0];
        if (comment.id === 'c56' &&
        comment.text === 'what a great tweet!' &&
        comment.date &&
        comment.author === 'TEST_USER') {
            testsPassed++;
            console.log('passed');
        } else console.log('FAILED');
    } else console.log('FAILED');

    console.log('');

    console.log('test 26: feed.user = \'OTHER_USER\'');
    feed.user = 'OTHER_USER';
    if (feed.user === 'OTHER_USER') {
        testsPassed++;
        console.log('passed');
    } else console.log('FAILED');

    console.log('');

    console.log('test 27: feed.addAll([\n    new Tweet(\'190\', \'tweettext\', new Date(), \'Hans\', []),\n    new Tweet(\'11\', \'anotherTweetText\', new Date(), \'another Hans\', [new Comment(\'c222\', \'morning\', new Date(), \'another Hans\')])\n])');
    if (feed.addAll([
        new Tweet('190', 'tweettext', new Date(), 'Hans', []),
        new Tweet('11', 'anotherTweetText', new Date(), 'another Hans', [new Comment('c222', 'morning', new Date(), 'another Hans')]),
    ]).length === 0 && feed.get('190') && feed.get('11')) {
        testsPassed++;
        console.log('passed');
    } else console.log('FAILED');

    console.log('');

    console.log('test 28: feed.addAll([\n    new Tweet([\'\', \'tweettext\', new Date(), \'another Hans\', [])\n    new Tweet(\'188\', \'tweetText\', new Date(), \'another Hans\', [])\n])');
    const temp = new Tweet('', 'tweettext', new Date(), 'another Hans', []);
    if (feed.addAll([temp, new Tweet('188', 'tweetText', new Date(), 'another Hans', [])])[0] === temp && feed.get('188')) {
        testsPassed++;
        console.log('passed');
    } else console.log('FAILED');

    console.log('');

    console.log('test 29: feed.clear()');

    feed.clear();
    if (feed.getPage(0, 10).length === 0) {
        testsPassed++;
        console.log('passed');
    } else console.log('FAILED');

    console.log('');

    console.log('');
    console.log('==========================================');
    console.log('');

    console.log(`${testsPassed}/29 tests passed`);
}

// tests();

const feed = new TweetFeed(tweets);

const headerView = new HeaderView('username');
const tweetFeedView = new TweetFeedView('main-container');
const filterView = new FilterView(''); // фильтр-блока пока и нет, собственно
const tweetView = new TweetView('main-container');

setTimeout(() => {
    setCurrentUser('kostek');
    setTimeout(() => {
        getFeed();
        setTimeout(() => {
            addTweet('this is a new tweet by kostek');
            setTimeout(() => {
                editTweet('25', 'this is an edited tweet by kostek');
                setTimeout(() => {
                    removeTweet('25');
                    setTimeout(() => {
                        showTweet('18');
                    }, 2000);
                }, 2000);
            }, 2000);
        }, 2000);
    }, 2000);
}, 2000);
