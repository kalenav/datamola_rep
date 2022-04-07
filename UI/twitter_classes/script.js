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
        const comment = new Comment(this._generateCommentId(), text, new Date(), this._user);
        if(!Comment.validate(comment)) return false;
        tweet.comments.push(comment);
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

    get length() {
        return this._tweets.length;
    }
}

class HeaderView {
    _container;

    constructor(containerId) {
        this._container = document.getElementById(containerId);
    }

    display(user, empty) {
        this._container.innerHTML = user;
        const loginButton = document.getElementById("header-login-button");
        if(empty) loginButton.innerHTML = "Log In";
        else loginButton.innerHTML = "Log Out";
    }
}

class ViewUtils {
    static getDateNumbers(date) {
        const day = Math.floor(date.getDate() / 10) === 0 ? `0${date.getDate()}` : date.getDate();
        const month = Math.floor(date.getMonth() / 10) === 0 ? `0${date.getMonth() + 1}` : date.getMonth() + 1;
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

    static getOwn(tweets) {
        return tweets.map((tweet) => tweet.author === controller.user ? true : false);
    }
}

class TweetFeedView {
    _container;

    constructor(containerId) {
        this._container = document.getElementById(containerId);
    }

    display(tweets, own, all) { // tweets: Array<Tweet>, own: Array<Boolean>
        this._container.innerHTML = '<section class="new-tweet"><p>New tweet</p><input type="textarea" placeholder="Input text" id="new-tweet"></section>';
        const tweetsSection = ViewUtils.newTag('section', 'tweets');
        tweetsSection.innerHTML = `
        <button class="filters-button">Filters</button>
        <div id="filter-block">
            <textarea class="filter" placeholder="Author name" id='author-name-filter'></textarea>
            <div class="filter" id='date-filter'>
                <div class="date-filter-block from">
                    <p class="date-filter-text">From</p>
                    <div class="date-filter-lists">
                        <select class="date-filter-list day" name="day-from" id='day-from-filter'>
                            <option value="1" selected='selected'>1</option>
                            <option value="2">2</option>
                            <option value="3">3</option>
                            <option value="4">4</option>
                            <option value="5">5</option>
                            <option value="6">6</option>
                            <option value="7">7</option>
                            <option value="8">8</option>
                            <option value="9">9</option>
                            <option value="10">10</option>
                            <option value="11">11</option>
                            <option value="12">12</option>
                            <option value="13">13</option>
                            <option value="14">14</option>
                            <option value="15">15</option>
                            <option value="16">16</option>
                            <option value="17">17</option>
                            <option value="18">18</option>
                            <option value="19">19</option>
                            <option value="20">20</option>
                            <option value="21">21</option>
                            <option value="22">22</option>
                            <option value="23">23</option>
                            <option value="24">24</option>
                            <option value="25">25</option>
                            <option value="26">26</option>
                            <option value="27">27</option>
                            <option value="28">28</option>
                            <option value="29">29</option>
                            <option value="30">30</option>
                            <option value="31">31</option>
                        </select>
                        <select class="date-filter-list month" name="month-from" id='month-from-filter'>
                            <option value="1" selected='selected'>1</option>
                            <option value="2">2</option>
                            <option value="3">3</option>
                            <option value="4">4</option>
                            <option value="5">5</option>
                            <option value="1">6</option>
                            <option value="2">7</option>
                            <option value="3">8</option>
                            <option value="4">9</option>
                            <option value="5">10</option>
                            <option value="1">11</option>
                            <option value="2">12</option>
                        </select>
                        <select class="date-filter-list year" name="year-from" id='year-from-filter'>
                            <option value="1">2022</option>
                            <option value="2">2021</option>
                            <option value="3">2020</option>
                            <option value="4">2019</option>
                            <option value="5" selected='selected'>2018</option>
                        </select>
                    </div>
                </div>
                <div class="date-filter-block to">
                    <p class="date-filter-text">To</p>
                    <div class="date-filter-lists">
                        <select class="date-filter-list day" name="day-to" id='day-to-filter'>
                            <option value="1">1</option>
                            <option value="2">2</option>
                            <option value="3">3</option>
                            <option value="4">4</option>
                            <option value="5">5</option>
                            <option value="6">6</option>
                            <option value="7">7</option>
                            <option value="8">8</option>
                            <option value="9">9</option>
                            <option value="10">10</option>
                            <option value="11">11</option>
                            <option value="12">12</option>
                            <option value="13">13</option>
                            <option value="14">14</option>
                            <option value="15">15</option>
                            <option value="16">16</option>
                            <option value="17">17</option>
                            <option value="18">18</option>
                            <option value="19">19</option>
                            <option value="20">20</option>
                            <option value="21">21</option>
                            <option value="22">22</option>
                            <option value="23">23</option>
                            <option value="24">24</option>
                            <option value="25">25</option>
                            <option value="26">26</option>
                            <option value="27">27</option>
                            <option value="28">28</option>
                            <option value="29">29</option>
                            <option value="30">30</option>
                            <option value="31" selected='selected'>31</option>
                        </select>
                        <select class="date-filter-list month" name="month-to" id='month-to-filter'>
                            <option value="1">1</option>
                            <option value="2">2</option>
                            <option value="3">3</option>
                            <option value="4">4</option>
                            <option value="5">5</option>
                            <option value="1">6</option>
                            <option value="2">7</option>
                            <option value="3">8</option>
                            <option value="4">9</option>
                            <option value="5">10</option>
                            <option value="1">11</option>
                            <option value="2" selected='selected'>12</option>
                        </select>
                        <select class="date-filter-list year" name="year-to" id='year-to-filter'>
                            <option value="1" selected='selected'>2022</option>
                            <option value="2">2021</option>
                            <option value="3">2020</option>
                            <option value="4">2019</option>
                            <option value="5">2018</option>
                        </select>
                    </div>
                </div>
            </div>
            <textarea class="filter" placeholder="Tweet text" id='tweet-text-filter'></textarea>
            <textarea class="filter" placeholder="Hashtags" id='hashtags-filter'></textarea>
            <button id='filter-submit'>Filter</button>
        </div>`
        tweets.forEach((tweet, index) => {
            const newTweet = ViewUtils.newTag('div', 'tweet');
            newTweet.setAttribute('data-id', tweet.id);
            const isOwn = own[index];
            const authorInfoContainer = isOwn ? ViewUtils.newTag('div', 'author-info-block') : newTweet;

            const dateNumbers = ViewUtils.getDateNumbers(tweet.date);
            authorInfoContainer.appendChild(ViewUtils.newTag('p', 'author-info', `by ${tweet.author} on ${dateNumbers.day}.${dateNumbers.month} at ${dateNumbers.hours}:${dateNumbers.minutes}`));
            if(isOwn) { 
                const buttonsContainer = ViewUtils.newTag('div', 'own-tweet-buttons');
                const editButton = ViewUtils.newTag('button', 'own-tweet-button');
                editButton.appendChild(ViewUtils.newTag('i', 'fa-solid fa-pen-to-square edit own-tweet-tool'));
                const deleteButton = ViewUtils.newTag('button', 'own-tweet-button');
                deleteButton.appendChild(ViewUtils.newTag('i', 'fa-solid fa-trash delete own-tweet-tool'));
                buttonsContainer.appendChild(editButton);
                buttonsContainer.appendChild(deleteButton);
                authorInfoContainer.appendChild(buttonsContainer);
                newTweet.appendChild(authorInfoContainer);
            }
            newTweet.appendChild(ViewUtils.newTag('p', 'tweet-text', ViewUtils.wrapHashtags(tweet.text)));
            newTweet.appendChild(ViewUtils.newTag('p', '', `${tweet.comments.length} replies`));
            tweetsSection.appendChild(newTweet);
        });
        if(!all) {
            const loadMoreButtonContainer = ViewUtils.newTag('div', 'align-fix');
            loadMoreButtonContainer.appendChild(ViewUtils.newTag('button', 'load-more', 'Load more'));
            tweetsSection.appendChild(loadMoreButtonContainer);
        }
        this._container.appendChild(tweetsSection);
    }
}

class FilterView {
    _container;

    constructor(containerId) {
        this._container = document.getElementById(containerId);
    }

    display() {
        this._container.style.left = '0';
    }

    hide() {
        this._container.style.left = 'calc(-100% - 2rem)';
    }
}

class TweetView {
    _container;

    constructor(containerId) {
        this._container = document.getElementById(containerId);
    }

    display(tweet, isOwn) {
        this._container.innerHTML = '';
        const tweetContainer = ViewUtils.newTag('section', 'tweet');
        tweetContainer.setAttribute('data-id', `${tweet.id}`);
        const authorInfoContainer = isOwn ? ViewUtils.newTag('div', 'author-info-block') : tweetContainer;

        const dateNumbers = ViewUtils.getDateNumbers(tweet.date);
        authorInfoContainer.appendChild(ViewUtils.newTag('p', 'author-info', `Tweet by ${tweet.author} on ${dateNumbers.day}.${dateNumbers.month} at ${dateNumbers.hours}:${dateNumbers.minutes}`));
        if(isOwn) { 
            const buttonsContainer = ViewUtils.newTag('div', 'own-tweet-buttons');
            const editButton = ViewUtils.newTag('button', 'own-tweet-button');
            editButton.appendChild(ViewUtils.newTag('i', 'fa-solid fa-pen-to-square own-tweet-tool edit'));
            const deleteButton = ViewUtils.newTag('button', 'own-tweet-button');
            deleteButton.appendChild(ViewUtils.newTag('i', 'fa-solid fa-trash own-tweet-tool delete'));
            buttonsContainer.appendChild(editButton);
            buttonsContainer.appendChild(deleteButton);
            authorInfoContainer.appendChild(buttonsContainer);
            authorInfoContainer.style.marginRight = '10%';
            tweetContainer.appendChild(authorInfoContainer);
        }
        tweetContainer.appendChild(ViewUtils.newTag('p', 'tweet-text', ViewUtils.wrapHashtags(tweet.text)));
        this._container.appendChild(tweetContainer);

        const commentsContainer = ViewUtils.newTag('section', 'comments');
        tweet.comments.forEach((comment) => {
            const currCommentContainer = ViewUtils.newTag('div', 'comment');
            const dateNumbers = ViewUtils.getDateNumbers(comment.date);
            currCommentContainer.appendChild(ViewUtils.newTag('p', 'author-name', `Comment by ${comment.author} on ${dateNumbers.day}.${dateNumbers.month} at ${dateNumbers.hours}:${dateNumbers.minutes}`));
            currCommentContainer.appendChild(ViewUtils.newTag('p', 'comment-text', comment.text));
            commentsContainer.appendChild(currCommentContainer);
        });
        this._container.appendChild(commentsContainer);

        const newCommentContainer = ViewUtils.newTag('section', 'new-comment');
        newCommentContainer.appendChild(ViewUtils.newTag('p', '', 'Leave a comment'));
        const commentTextarea = ViewUtils.newTag('input');
        commentTextarea.setAttribute('id', 'new-comment-textarea');
        commentTextarea.setAttribute('type', 'textarea');
        commentTextarea.setAttribute('placeholder', 'Input text');
        newCommentContainer.appendChild(commentTextarea);
        this._container.appendChild(newCommentContainer);
    }
}

class Controller {
    _feed;
    _headerView;
    _tweetFeedView;
    _filterView;
    _tweetView;

    _filtersDisplayed = false;
    _currShownTweets;
    _currFilterConfig;

    constructor(tweets) {
        this._feed = new TweetFeed(tweets);
        this._headerView = new HeaderView('username');
        this._addHeaderEventListeners();
        this._tweetFeedView = new TweetFeedView('main-container');
        this._initFeed();
        this._filterView = new FilterView('filter-block');
        this._addTweetFeedEventListeners();
        this._addFilterEventListeners();
        this._tweetView = new TweetView('main-container');
    }

    setCurrentUser(user) {
        this._feed.user = user;
        this._headerView.display(user, user ? false : true);
        this.getFeed(0, this._currShownTweets, this._currFilterConfig);
        this._addHeaderEventListeners();
    }
    
    addTweet(text) {
        if(this._feed.add(text)) {
            this._currShownTweets++;
            this.getFeed(0, this._currShownTweets, this._currFilterConfig);
        }
    }
    
    editTweet(id, text) {
        if(this._feed.edit(id, text)) {
            this._currShownTweets++;
            if(document.getElementById('new-comment-textarea')) {
                this.showTweet(document.getElementsByClassName('tweet')[0].dataset.id);
            }
            else this.getFeed(0, this._currShownTweets, this._currFilterConfig);
        }
    }
    
    removeTweet(id) {
        if(this._feed.remove(id)) {
            this._currShownTweets++;
            this.getFeed(0, this._currShownTweets, this._currFilterConfig);
        }
    }

    _initFeed() {
        const tweets = this._feed.getPage();
        const own = this._feed.user ? ViewUtils.getOwn(tweets) : new Array(tweets.length).fill(false);
        this._tweetFeedView.display(tweets, own);
        this._currShownTweets = 10;
    }
    
    getFeed(skip, top, filterConfig) {
        const tweets = this._feed.getPage(skip, top, filterConfig);
        const own = this._feed.user ? ViewUtils.getOwn(tweets) : new Array(tweets.length).fill(false);
        const tweetsLeft = this._feed.getPage(skip, this._feed.length, filterConfig).length - tweets.length;
        this._tweetFeedView.display(tweets, own, tweetsLeft === 0);
        this._filterView = new FilterView('filter-block');
        this._addTweetFeedEventListeners();
        this._addFilterEventListeners();
        this._currShownTweets = tweets.length;
    }
    
    showTweet(id) {
        const tweet = this._feed.get(id);
        if(tweet) this._tweetView.display(tweet, tweet.author === this._feed.user);
        this._addTweetEventListeners();
        this._currShownTweets = 0;
        this._currFilterConfig = {};
    }

    toggleFilters() {
        if(this._filtersDisplayed) {
            this._filterView.hide();
            this._filtersDisplayed = false;
        }
        else {
            this._filterView.display();
            this._filtersDisplayed = true;
        }
    }

    showLoginForm() {
        const self = this;

        document.getElementById('main-container').innerHTML = `
        <section class="auth-window">
            <div class="auth-window-header">
                <p class="auth-window-header-text">Logging In</p>
            </div>
            <form class="auth-window-form">
                <textarea class="auth-window-textarea username" placeholder="Input username"></textarea>
                <textarea class="auth-window-textarea password" placeholder="Input password"></textarea>
                <button id="auth-window-button">Log In</button>
            </form>
            <p class="auth-window-misc-text">Not a user yet? <a id="signup-link" class="link">Sign up</a></p>
            <p class="auth-window-misc-text"><a id="main-page-link" class="link">Return to main page</a></p>
        </section>
        `;

        const form = document.getElementsByClassName('auth-window-form')[0];
        form.addEventListener('submit', (e) => {
            e.preventDefault(); // чтобы не переходило на страницу с твитами само по себе
            const username = form.getElementsByClassName('username')[0].value;
            const password = form.getElementsByClassName('password')[0].value;
            const possibleUser = { username, password };
            if(userList.has(possibleUser)) {
                self.setCurrentUser(username);
            }
        });

        document.getElementById('signup-link').addEventListener('click', () => {
            self.showSignupForm();
        });

        document.getElementById('main-page-link').addEventListener('click', () => {
            self.getFeed();
        });
    }

    showSignupForm() {
        const self = this;

        document.getElementById('main-container').innerHTML = `
        <section class="auth-window">
            <div class="auth-window-header">
                <p class="auth-window-header-text">Signing Up</p>
            </div>
            <form class="auth-window-form">
                <textarea class="auth-window-textarea username" placeholder="Input username"></textarea>
                <textarea class="auth-window-textarea password" placeholder="Input password"></textarea>
                <textarea class="auth-window-textarea password confirm" placeholder="Confirm password"></textarea>
                <button id="auth-window-button">Sign up</button>
            </form>
            <p class="auth-window-misc-text">Already a user? <a id="login-link" class="link">Log in</a></p>
            <p class="auth-window-misc-text"><a id="main-page-link" class="link">Return to main page</a></p>
        </section>
        `;

        const form = document.getElementsByClassName('auth-window-form')[0];
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const username = form.getElementsByClassName('username')[0].value;
            const password = form.getElementsByClassName('password')[0].value;
            const passwordConfirm = form.getElementsByClassName('confirm')[0].value;
            if(password !== passwordConfirm) {
                self.showSignupForm();
                return;
            }
            const newUser = { username, password };
            if(!userList.has(newUser)) userList.addUser(newUser);
            self.getFeed();
        });

        document.getElementById('login-link').addEventListener('click', () => {
            self.showLoginForm();
        });

        document.getElementById('main-page-link').addEventListener('click', () => {
            self.getFeed();
        });
    }

    _addHeaderEventListeners() {
        const self = this;

        document.getElementById('header-home-button').addEventListener('click', () => {
            self.getFeed();
        });

        document.getElementById('header-login-button').addEventListener('click', () => {
            if(!self.user) { // всё ещё не понимаю, почему оно при логауте переходит на страницу логина 
                self.showLoginForm();
            }
            else {
                self.setCurrentUser('');
            }
        });
    }

    _addTweetFeedEventListeners() {
        const self = this;

        document.getElementsByClassName('filters-button')[0].addEventListener('click', () => {
            self.toggleFilters();
        });
        
        document.getElementsByClassName('tweets')[0].addEventListener('click', (e) => {
            let target = e.target;
            if(target.tagName === 'BUTTON' ||
            target.tagName === 'I' ||
            target.tagName === 'SELECT' ||
            target.tagName === 'OPTION') return;    
            while(!target.classList.contains('tweet')) target = target.parentElement;
            self.showTweet(target.dataset.id);
        });

        document.getElementsByClassName('load-more')[0].addEventListener('click', () => {
            self.getFeed(0, self._currShownTweets + 10, self._currFilterConfig);
        });

        document.getElementById('new-tweet').addEventListener('keyup', (e) => {
            if(e.keyCode !== 13) return;
            self.addTweet(e.target.value);
        });

        document.getElementsByClassName('tweets')[0].addEventListener('click', (e) => {
            const target = e.target;
            if(target.tagName !== 'I') return;
            let parentTweet = target;
            while(!parentTweet.classList.contains('tweet')) parentTweet = parentTweet.parentElement; 
            const tweetId = parentTweet.dataset.id;
            if(target.classList.contains('edit')) {
                const tweetEditTextarea = ViewUtils.newTag('textarea');
                tweetEditTextarea.style.position = 'fixed';
                tweetEditTextarea.style.width = '700px';
                tweetEditTextarea.style.top = '40%';
                tweetEditTextarea.style.right = 'calc(50% - 350px)';
                tweetEditTextarea.style.resize = 'vertical';
                tweetEditTextarea.style.fontSize = '1.5rem';
                tweetEditTextarea.value = self._feed.get(tweetId).text;
                const body = document.body;
                body.appendChild(tweetEditTextarea);
                tweetEditTextarea.addEventListener('keyup', (e) => {
                    const target = e.target;
                    if(e.keyCode !== 13) return;
                    self.editTweet(tweetId, target.value);
                    body.removeChild(target);
                });
            }
            if(target.classList.contains('delete')) {
                self.removeTweet(tweetId);
                self.getFeed(0, self._currShownTweets - 1, self._currFilterConfig);
            }
        });
    }

    _addFilterEventListeners() {
        const self = this;

        const authorTextarea = document.getElementById('author-name-filter');
        const dateFilterBlock = document.getElementById('date-filter');
        const tweetTextTextarea = document.getElementById('tweet-text-filter');
        const hashtagsTextarea = document.getElementById('hashtags-filter');

        document.getElementById('filter-submit').addEventListener('click', () => {
            self._createFilterConfig(authorTextarea, dateFilterBlock, tweetTextTextarea, hashtagsTextarea);
            self.getFeed(0, 10, self._currFilterConfig);
        });
    }

    _addTweetEventListeners() {
        const self = this;

        const newCommentTextarea = document.getElementById('new-comment-textarea');
        newCommentTextarea.addEventListener('keyup', (e) => {
            if(e.keyCode !== 13) return;
            const tweet = document.getElementsByClassName('tweet')[0];
            const tweetId = tweet.dataset.id;
            if(!self._feed.addComment(tweetId, newCommentTextarea.value)) return;
            self.showTweet(tweetId);
        });

        document.getElementsByClassName('tweet')[0].addEventListener('click', (e) => {
            const target = e.target;
            if(target.tagName !== 'I') return;
            let parentTweet = target;
            while(!parentTweet.classList.contains('tweet')) parentTweet = parentTweet.parentElement; 
            const tweetId = parentTweet.dataset.id;
            if(target.classList.contains('edit')) {
                const tweetEditTextarea = ViewUtils.newTag('textarea');
                tweetEditTextarea.style.position = 'fixed';
                tweetEditTextarea.style.width = '700px';
                tweetEditTextarea.style.top = '40%';
                tweetEditTextarea.style.right = 'calc(50% - 350px)';
                tweetEditTextarea.style.resize = 'vertical';
                tweetEditTextarea.style.fontSize = '1.5rem';
                tweetEditTextarea.value = self._feed.get(tweetId).text;
                const body = document.body;
                body.appendChild(tweetEditTextarea);
                tweetEditTextarea.addEventListener('keyup', (e) => {
                    const target = e.target;
                    if(e.keyCode !== 13) return;
                    self.editTweet(tweetId, target.value);
                    body.removeChild(target);
                });
            }
            if(target.classList.contains('delete')) {
                self.removeTweet(tweetId);
                self.getFeed(0, self._currShownTweets - 1, self._currFilterConfig);
            }
        });
    }

    _createFilterConfig(authorTextarea, dateFilterBlock, tweetTextTextarea, hashtagsTextarea) {
        const from = dateFilterBlock.getElementsByClassName('from')[0].getElementsByClassName('date-filter-lists')[0];
        const choicesFrom = [from.children[1], from.children[0], from.children[2]]; // классу даты нужен сначала месяц, потом день
        const dateFrom = new Date(choicesFrom.map((choice) => choice.options[choice.selectedIndex].text).join('.'));
        const to = dateFilterBlock.getElementsByClassName('to')[0].getElementsByClassName('date-filter-lists')[0];
        const choicesTo = [to.children[1], to.children[0], to.children[2]];
        const dateTo = new Date(choicesTo.map((choice) => choice.options[choice.selectedIndex].text).join('.'));
        this._currFilterConfig = {
            'author': authorTextarea.value,
            dateFrom,
            dateTo,
            'text': tweetTextTextarea.value,
            'hashtags': hashtagsTextarea.value ? hashtagsTextarea.value.split(' ') : [],
        };
    }

    get user() {
        return this._feed.user;
    }
}

class UserList {
    _users;

    constructor(users) {
        this._users = users ? users.slice() : [];
    }

    addUser(user) {
        this._users.push(user);
    }

    has(user) {
        return this._users.some((el) => el.username === user.username && el.password === user.password);
    }
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

const userList = new UserList();
const controller = new Controller(tweets);

// function tests() {
//     let testsPassed = 0;

//     const feed = new TweetFeed(tweets);
//     feed.user = 'TEST_USER';
//     let expecting;
//     let actual;
//     console.log(feed);

//     console.log('test 1: feed.getPage()');
//     expecting = tweets.slice(14, 24).reverse();
//     actual = feed.getPage();
//     if (actual.every((v, i) => actual[i] === expecting[i])) {
//         testsPassed++;
//         console.log('passed');
//     } else console.log('FAILED');

//     console.log('');

//     console.log('test 2: feed.getPage(0, 10)');
//     expecting = tweets.slice(14, 24).reverse();
//     actual = feed.getPage(0, 10);
//     if (actual.every((v, i) => actual[i] === expecting[i])) {
//         testsPassed++;
//         console.log('passed');
//     } else console.log('FAILED');

//     console.log('');

//     console.log('test 3: feed.getPage(10, 10)');
//     expecting = tweets.slice(4, 14).reverse();
//     actual = feed.getPage(10, 10);
//     if (actual.every((v, i) => actual[i] === expecting[i])) {
//         testsPassed++;
//         console.log('passed');
//     } else console.log('FAILED');

//     console.log('');

//     console.log('test 4: feed.getPage(0, 10, {author: \'e\'})');
//     expecting = [tweets[22], tweets[20], tweets[19], tweets[14], tweets[13], tweets[10], tweets[8], tweets[6], tweets[5], tweets[3], tweets[2], tweets[0]];
//     actual = feed.getPage(0, 10, {author: 'e'});
//     if (actual.every((v, i) => actual[i] === expecting[i])) {
//         testsPassed++;
//         console.log('passed');
//     } else console.log('FAILED');

//     console.log('');

//     console.log('test 5: feed.getPage(0, 5, {hashtags: [\'tweet\']})');
//     expecting = [tweets[18], tweets[6]];
//     actual = feed.getPage(0, 5, {hashtags: ['tweet']});
//     if (actual.every((v, i) => actual[i] === expecting[i])) {
//         testsPassed++;
//         console.log('passed');
//     } else console.log('FAILED');

//     console.log('');

//     console.log('test 6: feed.get(\'13\')');
//     expecting = tweets[12];
//     actual = feed.get('13');
//     if (expecting === actual) {
//         testsPassed++;
//         console.log('passed');
//     } else console.log('FAILED');

//     console.log('');

//     console.log('test 7: feed.get(\'not an actual id\')');
//     expecting = undefined;
//     actual = feed.get('not an actual id');
//     if (expecting === actual) {
//         testsPassed++;
//         console.log('passed');
//     } else console.log('FAILED');

//     console.log('');

//     console.log('test 8: Tweet.validate(new Tweet(\'1\', \'hi there\', new Date(), \'someone\', []))');
//     if (Tweet.validate(new Tweet('1', 'hi there', new Date(), 'someone', []))) {
//         testsPassed++;
//         console.log('passed');
//     } else console.log('FAILED');

//     console.log('');

//     console.log('test 9: Tweet.validate(feed.get(\'3\'))');
//     if (Tweet.validate(feed.get('3'))) {
//         testsPassed++;
//         console.log('passed');
//     } else console.log('FAILED');

//     console.log('');

//     console.log('test 10: Tweet.validate(new Tweet(\'id\', \'\', new Date(), \'e\', []))');
//     if (Tweet.validate(new Tweet('id', '', new Date(), 'e', []))) {
//         testsPassed++;
//         console.log('passed');
//     } else console.log('FAILED');

//     console.log('');

//     console.log('test 11: Tweet.validate(new Tweet(\'\', \'text\', new Date(), \'a beeper perhaps\', []))');
//     if (!Tweet.validate(new Tweet('', 'text', new Date(), 'a beeper perhaps', []))) {
//         testsPassed++;
//         console.log('passed');
//     } else console.log('FAILED');

//     console.log('');

//     console.log('test 12: Tweet.validate(new Tweet(\'123\', \'this text is over 280 symbols this text is over 280 symbols this text is over 280 symbols this text is over 280 symbols this text is over 280 symbols this text is over 280 symbols this text is over 280 symbols this text is over 280 symbols this text is over 280 symbols this text is over 280 symbols\', new Date(), \'some very wordy fella\', []))');
//     if (!Tweet.validate(new Tweet('123', 'this text is over 280 symbols this text is over 280 symbols this text is over 280 symbols this text is over 280 symbols this text is over 280 symbols this text is over 280 symbols this text is over 280 symbols this text is over 280 symbols this text is over 280 symbols this text is over 280 symbols', new Date(), 'some very wordy fella', []))) {
//         testsPassed++;
//         console.log('passed');
//     } else console.log('FAILED');

//     console.log('');

//     console.log('test 13: Tweet.validate(new Tweet(\'42\', \'i always say morning instead of good morning\', new Date(), \'some very shady fella\', []))');
//     if (Tweet.validate(new Tweet('42', 'i always say morning instead of good morning', new Date(), 'some very shady fella', []))) {
//         testsPassed++;
//         console.log('passed');
//     } else console.log('FAILED');

//     console.log('');

//     console.log('test 14: Tweet.validate(new Tweet(\'256\', \'who am I?\', new Date(), \'\', []))');
//     if (!Tweet.validate(new Tweet('256', 'who am I?', new Date(), '', []))) {
//         testsPassed++;
//         console.log('passed');
//     } else console.log('FAILED');

//     console.log('');

//     console.log('test 15: Tweet.validate(new Tweet(\'512\', \'alrighty then\', new Date(), \'some very agreeable fella\',  {}))');
//     if (!Tweet.validate(new Tweet('512', 'alrighty then', new Date(), 'some very agreeable fella', {}))) {
//         testsPassed++;
//         console.log('passed');
//     } else console.log('FAILED');

//     console.log('');

//     console.log('test 16: feed.add(\'i\'m a text!\')');
//     feed.add('i\'m a text!');
//     actual = feed.getPage(0, 25)[0];
//     if (
//         Tweet.validate(actual) &&
//         actual.id === '25' &&
//         actual.text === 'i\'m a text!' &&
//         actual.date &&
//         actual.author === 'TEST_USER' &&
//         actual.comments instanceof Array &&
//         actual.comments.length === 0) {
//         testsPassed++;
//         console.log('passed');
//     } else console.log('FAILED');

//     console.log('');

//     console.log('test 17: feed.edit(\'25\', \'i\'m still a text, but different!\') (current user is the author)');
//     feed.edit('25', 'i\'m still a text, but different!');
//     if (feed.getPage(0, 25)[0].text === 'i\'m still a text, but different!') {
//         testsPassed++;
//         console.log('passed');
//     } else console.log('FAILED');

//     console.log('');

//     feed.user = 'OTHER_USER';
//     console.log('test 18: feed.edit(\'25\', \'i\'m yet another text!\') (current user is not the author)');
//     feed.edit('25', 'i\'m yet another text!');
//     if (feed.getPage(0, 25)[0].text === 'i\'m still a text, but different!') {
//         testsPassed++;
//         console.log('passed');
//     } else console.log('FAILED');
//     feed.user = 'TEST_USER';

//     console.log('');

//     console.log('test 19: feed.edit(\'25\', \'this text is over 280 symbols this text is over 280 symbols this text is over 280 symbols this text is over 280 symbols this text is over 280 symbols this text is over 280 symbols this text is over 280 symbols this text is over 280 symbols this text is over 280 symbols this text is over 280 symbols\')');
//     if (!feed.edit('25', 'this text is over 280 symbols this text is over 280 symbols this text is over 280 symbols this text is over 280 symbols this text is over 280 symbols this text is over 280 symbols this text is over 280 symbols this text is over 280 symbols this text is over 280 symbols this text is over 280 symbols')) {
//         testsPassed++;
//         console.log('passed');
//     } else console.log('FAILED');

//     console.log('');

//     console.log('test 20: feed.remove(\'25\') (user is the author)');
//     if (feed.remove('25')) {
//         testsPassed++;
//         console.log('passed');
//     } else console.log('FAILED');

//     console.log('');

//     console.log('test 21: feed.remove(\'15\') (user is not he author)');
//     if (!feed.remove('15')) {
//         testsPassed++;
//         console.log('passed');
//     } else console.log('FAILED');

//     console.log('');

//     console.log('test 22: feed.remove(\'not an actual id\')');
//     if (!feed.remove('not an actual id')) {
//         testsPassed++;
//         console.log('passed');
//     } else console.log('FAILED');

//     console.log('');

//     console.log('test 23: Comment.validate(new Comment(\'c1024\', \'some text\', \'some very unoriginal fella\'))');
//     if (Comment.validate(new Comment('c1024', 'some text', new Date(), 'some very unoriginal fella'))) {
//         testsPassed++;
//         console.log('passed');
//     } else console.log('FAILED');

//     console.log('');

//     console.log('test 24: Comment.validate(new Comment(\'\', \'\', \'some empty fella\'))');
//     if (!Comment.validate(new Comment('', '', new Date(), 'some empty fella'))) {
//         testsPassed++;
//         console.log('passed');
//     } else console.log('FAILED');

//     console.log('');

//     console.log('test 25: feed.addComment(\'2\', \'what a great tweet!\')');
//     if (feed.addComment('2', 'what a great tweet!')) {
//         const comment = tweets[1].comments[0];
//         if (comment.id === 'c56' &&
//         comment.text === 'what a great tweet!' &&
//         comment.date &&
//         comment.author === 'TEST_USER') {
//             testsPassed++;
//             console.log('passed');
//         } else console.log('FAILED');
//     } else console.log('FAILED');

//     console.log('');

//     console.log('test 26: feed.user = \'OTHER_USER\'');
//     feed.user = 'OTHER_USER';
//     if (feed.user === 'OTHER_USER') {
//         testsPassed++;
//         console.log('passed');
//     } else console.log('FAILED');

//     console.log('');

//     console.log('test 27: feed.addAll([\n    new Tweet(\'190\', \'tweettext\', new Date(), \'Hans\', []),\n    new Tweet(\'11\', \'anotherTweetText\', new Date(), \'another Hans\', [new Comment(\'c222\', \'morning\', new Date(), \'another Hans\')])\n])');
//     if (feed.addAll([
//         new Tweet('190', 'tweettext', new Date(), 'Hans', []),
//         new Tweet('11', 'anotherTweetText', new Date(), 'another Hans', [new Comment('c222', 'morning', new Date(), 'another Hans')]),
//     ]).length === 0 && feed.get('190') && feed.get('11')) {
//         testsPassed++;
//         console.log('passed');
//     } else console.log('FAILED');

//     console.log('');

//     console.log('test 28: feed.addAll([\n    new Tweet([\'\', \'tweettext\', new Date(), \'another Hans\', [])\n    new Tweet(\'188\', \'tweetText\', new Date(), \'another Hans\', [])\n])');
//     const temp = new Tweet('', 'tweettext', new Date(), 'another Hans', []);
//     if (feed.addAll([temp, new Tweet('188', 'tweetText', new Date(), 'another Hans', [])])[0] === temp && feed.get('188')) {
//         testsPassed++;
//         console.log('passed');
//     } else console.log('FAILED');

//     console.log('');

//     console.log('test 29: feed.clear()');

//     feed.clear();
//     if (feed.getPage(0, 10).length === 0) {
//         testsPassed++;
//         console.log('passed');
//     } else console.log('FAILED');

//     console.log('');

//     console.log('');
//     console.log('==========================================');
//     console.log('');

//     console.log(`${testsPassed}/29 tests passed`);
// }

// tests();
