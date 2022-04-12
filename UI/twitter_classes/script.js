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

    toString() {
        let result = `${this._id}:::${this.text}:::${this._createdAt}:::${this._author}:::`;
        this.comments.forEach((com) => { result += `${com}` });
        return result + ';;';
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

    toString() {
        return `${this._id}::${this.text}::${this._createdAt}::${this.author}++`;
    }
}

class TweetFeed {
    _tweets;

    constructor() {
        this.restore();
    }

    addAll(tws) {
        const toReturn = [];
        for (let i = 0; i < tws.length; i++) {
            const currTweet = tws[i];
            Tweet.validate(currTweet) ? this._tweets.push(currTweet) : toReturn.push(currTweet);
        }
        this.save();
        return toReturn;
    }

    clear() {
        this._tweets = [];
        this.save();
    }

    getPage(skip = 0, top = 10, filterConfig) {
        let result = this._tweets.slice();
        if (filterConfig) {
            if (filterConfig.author) result = result.filter((tweet) => filterConfig.author.split(' ').some((auth) => tweet.author.includes(auth)));
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
            this.save();
            return true;
        }
        return false;
    }

    edit(id, text) {
        const tweet = this.get(id);
        if (tweet.author !== this._user) return false;
        const snapshot = tweet.text;
        tweet.text = text;
        if (Tweet.validate(tweet)) 
        {
            this.save();
            return true;
        }
        tweet.text = snapshot;
        return false;
    }

    remove(id) {
        const tweetIndex = this._tweets.findIndex((tw) => tw.id === id);
        if (tweetIndex === -1 || this._tweets[tweetIndex].author !== this._user) return false;
        this._tweets.splice(tweetIndex, 1);
        this.save();
        return true;
    }

    addComment(id, text) {
        const tweet = this.get(id);
        if (!tweet) return false;
        const comment = new Comment(this._generateCommentId(), text, new Date(), this._user);
        if(!Comment.validate(comment)) return false;
        tweet.comments.push(comment);
        this.save();
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

    save() {
        window.localStorage.tweets = JSON.stringify(this._tweets);
    }

    restore() {
        this._tweets = JSON.parse(window.localStorage.tweets).map((tweet) => new Tweet(
            tweet._id, 
            tweet.text, 
            new Date(tweet._createdAt), 
            tweet._author,
            tweet.comments.map((com) => new Comment(
                com._id,
                com.text,
                new Date(com._createdAt),
                com._author
            ))));

        this._user = window.localStorage.lastUser;
    }
}

class HeaderView {
    _container;

    constructor(containerId) {
        this._container = document.getElementById(containerId);
    }

    display(user, displayHomeButton) {
        this._container.innerHTML = user ?? '';
        const loginButton = document.getElementById("header-login-button");
        loginButton.innerHTML = user ? "Log Out" : "Log In";
        const homeButton = document.getElementById('header-home-button');
        if(displayHomeButton) {
            homeButton.style.display = 'inline-block';
        }
        else {
            homeButton.style.display = 'none';
        }
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
        const limiters = [' ', '.', ',', '!', '?', ';'];
        for(let i = 0; i < text.length; i++) {
            if(text[i] === '#') {
                while(i < text.length && !limiters.includes(text[i])) {
                    hashtag += text[i++];
                }
                text = text.split(hashtag).join(`<span class='hashtag'>${hashtag}</span>`);
                hashtag = "";
            }
        }
        return text;
    }

    static newTag(tagName, attributes, text) {
        const tag = document.createElement(tagName);
        for(let attribute in attributes) {
            tag.setAttribute(attribute, attributes[attribute]);
        }
        if(text) tag.innerHTML = text.split('\n').join('<br>');
        return tag;
    }
}

class TweetFeedView {
    _container;

    constructor(containerId) {
        this._container = document.getElementById(containerId);
    }

    display(found, tweets, own, all, filterValues) { // tweets: Array<Tweet>, own: Array<Boolean>
        if(!found) {
            this._container.innerHTML = '';
            this._container.appendChild(ViewUtils.newTag('p', { class: 'not-found' }, 'No such tweets were found.'));
            this._container.appendChild(ViewUtils.newTag('a', { class: 'not-found link', id: 'not-found-link' }, 'Return to main page'));
            return;
        }
        this._container.innerHTML = '';
        this._displayNewTweetSection(this._container);
        const tweetsSection = ViewUtils.newTag('section', { class: 'tweets' });
        this._appendFilters(tweetsSection, filterValues);
        tweets.forEach((tweet, index) => {
            const newTweet = ViewUtils.newTag('div', { class: 'tweet', 'data-id': tweet.id });
            const isOwn = own[index];
            const authorInfoContainer = isOwn ? ViewUtils.newTag('div', { class: 'author-info-block' }) : newTweet;

            const dateNumbers = ViewUtils.getDateNumbers(tweet.date);
            authorInfoContainer.appendChild(ViewUtils.newTag('p', { class: 'author-info' }, `by ${tweet.author} on ${dateNumbers.day}.${dateNumbers.month} at ${dateNumbers.hours}:${dateNumbers.minutes}`));
            if(isOwn) { 
                const buttonsContainer = ViewUtils.newTag('div', { class: 'own-tweet-buttons' });
                const editButton = ViewUtils.newTag('button', { class: 'own-tweet-button' });
                editButton.appendChild(ViewUtils.newTag('i', { class: 'fa-solid fa-pen-to-square edit own-tweet-tool' }));
                const deleteButton = ViewUtils.newTag('button', { class: 'own-tweet-button' });
                deleteButton.appendChild(ViewUtils.newTag('i', { class: 'fa-solid fa-trash delete own-tweet-tool' }));
                buttonsContainer.appendChild(editButton);
                buttonsContainer.appendChild(deleteButton);
                authorInfoContainer.appendChild(buttonsContainer);
                newTweet.appendChild(authorInfoContainer);
            }
            newTweet.appendChild(ViewUtils.newTag('p', { class: 'tweet-text' }, ViewUtils.wrapHashtags(tweet.text)));
            newTweet.appendChild(ViewUtils.newTag('p', null, `${tweet.comments.length} replies`));
            tweetsSection.appendChild(newTweet);
        });
        if(!all) {
            const loadMoreButtonContainer = ViewUtils.newTag('div', { class: 'align-fix' });
            loadMoreButtonContainer.appendChild(ViewUtils.newTag('button', { class: 'load-more' }, 'Load more'));
            tweetsSection.appendChild(loadMoreButtonContainer);
        }
        this._container.appendChild(tweetsSection);
    }

    _appendFilters(parent, filterValues = {}) { // filterValues: { author: string, dateFrom: Date, ... }
        parent.appendChild(ViewUtils.newTag('button', { class: 'filters-button' }, 'Filters'));
        const filterBlock = ViewUtils.newTag('div', { id: 'filter-block' });
        const authorNameTextarea = ViewUtils.newTag('textarea', { class: 'filter', placeholder: 'author1 author2 ...', id: 'author-name-filter'});
        authorNameTextarea.value = filterValues.author || '';
        const tweetTextTextarea = ViewUtils.newTag('textarea', { class: 'filter', placeholder: 'Tweet text', id: 'tweet-text-filter'});
        tweetTextTextarea.value = filterValues.text || '';
        const hashtagsTextarea = ViewUtils.newTag('textarea', { class: 'filter', placeholder: '#hashtag1 #hashtag2 ...', id: 'hashtags-filter' });
        hashtagsTextarea.value = filterValues.hashtags ? filterValues.hashtags.join(' ') : ''; 

        const dateFilterBlock = ViewUtils.newTag('div', { class: 'filter', id: 'date-filter' });
        const dateFilterBlockFrom = ViewUtils.newTag('div', { class: 'date-filter-block from' });
        dateFilterBlockFrom.appendChild(ViewUtils.newTag('p', { class: 'date-filter-text' }, 'From'));
        const dateFromInputContainer = ViewUtils.newTag('div', { class: 'date-filter-lists' });
        dateFromInputContainer.appendChild(ViewUtils.newTag('input', { type: 'date', id: 'date-from' }));
        dateFromInputContainer.value = filterValues.dateFrom;
        dateFilterBlockFrom.appendChild(dateFromInputContainer);
        const dateFilterBlockTo = ViewUtils.newTag('div', { class: 'date-filter-block to' });
        dateFilterBlockTo.appendChild(ViewUtils.newTag('p', { class: 'date-filter-text' }, 'To'));
        const dateToInputContainer = ViewUtils.newTag('div', { class: 'date-filter-lists' });
        dateToInputContainer.appendChild(ViewUtils.newTag('input', { type: 'date', id: 'date-to' }));
        dateToInputContainer.value = filterValues.dateTo;
        dateFilterBlockTo.appendChild(dateToInputContainer);
        dateFilterBlock.appendChild(dateFilterBlockFrom);
        dateFilterBlock.appendChild(dateFilterBlockTo);

        filterBlock.appendChild(authorNameTextarea);
        filterBlock.appendChild(dateFilterBlock);
        filterBlock.appendChild(tweetTextTextarea);
        filterBlock.appendChild(hashtagsTextarea);
        filterBlock.appendChild(ViewUtils.newTag('button', { id: 'filter-submit' }, 'Filter'));
        filterBlock.appendChild(ViewUtils.newTag('button', { id: 'filter-clear' }, 'Clear filters'));

        parent.appendChild(filterBlock);
    }

    _displayNewTweetSection(parent) {
        const newTweetSection = ViewUtils.newTag('section', { class: 'new-tweet' });
        newTweetSection.appendChild(ViewUtils.newTag('p', null, 'New tweet'));
        newTweetSection.appendChild(ViewUtils.newTag('textarea', { placeholder: 'Input new tweet', id: 'new-tweet' }));
        const postButtonContainer = ViewUtils.newTag('div', { class: 'new-tweet-button-container' });
        postButtonContainer.appendChild(ViewUtils.newTag('button', { id: 'new-tweet-button' }, 'Post'));
        newTweetSection.appendChild(postButtonContainer);
        parent.appendChild(newTweetSection);
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
        const tweetContainer = ViewUtils.newTag('section', { class: 'tweet', 'data-id': tweet.id });
        const authorInfoContainer = isOwn ? ViewUtils.newTag('div', { class: 'author-info-block' }) : tweetContainer;

        const dateNumbers = ViewUtils.getDateNumbers(tweet.date);
        authorInfoContainer.appendChild(ViewUtils.newTag('p', { class: 'author-info' }, `Tweet by ${tweet.author} on ${dateNumbers.day}.${dateNumbers.month} at ${dateNumbers.hours}:${dateNumbers.minutes}`));
        if(isOwn) { 
            const buttonsContainer = ViewUtils.newTag('div', { class: 'own-tweet-buttons' });
            const editButton = ViewUtils.newTag('button', { class: 'own-tweet-button' });
            editButton.appendChild(ViewUtils.newTag('i', { class: 'fa-solid fa-pen-to-square own-tweet-tool edit' }));
            const deleteButton = ViewUtils.newTag('button', { class: 'own-tweet-button' });
            deleteButton.appendChild(ViewUtils.newTag('i', { class: 'fa-solid fa-trash own-tweet-tool delete' }));
            buttonsContainer.appendChild(editButton);
            buttonsContainer.appendChild(deleteButton);
            authorInfoContainer.appendChild(buttonsContainer);
            authorInfoContainer.style.marginRight = '10%';
            tweetContainer.appendChild(authorInfoContainer);
        }
        tweetContainer.appendChild(ViewUtils.newTag('p', { class: 'tweet-text' }, ViewUtils.wrapHashtags(tweet.text)));
        this._container.appendChild(tweetContainer);

        const commentsContainer = ViewUtils.newTag('section', { class: 'comments' });
        tweet.comments.forEach((comment) => {
            const currCommentContainer = ViewUtils.newTag('div', { class: 'comment' });
            const dateNumbers = ViewUtils.getDateNumbers(comment.date);
            currCommentContainer.appendChild(ViewUtils.newTag('p', { class: 'author-name' }, `Comment by ${comment.author} on ${dateNumbers.day}.${dateNumbers.month} at ${dateNumbers.hours}:${dateNumbers.minutes}`));
            currCommentContainer.appendChild(ViewUtils.newTag('p', { class: 'comment-text' }, comment.text));
            commentsContainer.appendChild(currCommentContainer);
        });
        this._container.appendChild(commentsContainer);

        const newCommentContainer = ViewUtils.newTag('section', { class: 'new-comment' });
        newCommentContainer.appendChild(ViewUtils.newTag('p', null, 'Leave a comment'));
        const commentTextarea = ViewUtils.newTag('textarea', { id: 'new-comment-textarea', placeholder: 'Input comment' });
        const newCommentButtonContainer = ViewUtils.newTag('div', { class: 'new-comment-button-container' });
        newCommentButtonContainer.appendChild(ViewUtils.newTag('button', { id: 'new-comment-submit' }, 'Reply'));
        newCommentContainer.appendChild(commentTextarea);
        newCommentContainer.appendChild(newCommentButtonContainer);
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

    constructor() {
        this._feed = new TweetFeed();
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
        window.localStorage.lastUser = user;
        this._headerView.display(user, false);
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
        const own = this._feed.user ? this._getOwn(tweets) : new Array(tweets.length).fill(false);
        this._tweetFeedView.display(true, tweets, own);
        this._currShownTweets = 10;
        const user = this._feed.user;
        this._headerView.display(user, user ? true : false);
    }
    
    getFeed(skip, top, filterConfig) {
        const tweets = this._feed.getPage(skip, top, filterConfig);
        if(tweets.length === 0) {
            this._tweetFeedView.display(false);
            this._headerView.display(this._feed.user, true);
            const self = this;
            document.getElementById('not-found-link').addEventListener('click', () => {
                self.getFeed();
            });
            return;
        }
        else {
            const own = this._feed.user ? this._getOwn(tweets) : new Array(tweets.length).fill(false);
            const tweetsLeft = this._feed.getPage(skip, this._feed.length, filterConfig).length - tweets.length;
            this._tweetFeedView.display(true, tweets, own, tweetsLeft === 0, this._currFilterConfig);
            this._headerView.display(this._feed.user, false);
        }
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
        this._headerView.display(this._feed.user, true);
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

        self._displayAuthWindow(document.getElementById('main-container'), true);

        const form = document.getElementsByClassName('auth-window-form')[0];
        form.addEventListener('submit', (e) => {
            e.preventDefault(); // чтобы не переходило на страницу с твитами само по себе
            const username = form.getElementsByClassName('username')[0].value;
            const password = form.getElementsByClassName('password')[0].value;
            const possibleUser = { username, password };
            if(userList.has(possibleUser)) {
                self.setCurrentUser(username);
            }
            else {
                alert('Such a user doesn\'t exist or you have misspelled something.');
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

        self._displayAuthWindow(document.getElementById('main-container'), false);

        const form = document.getElementsByClassName('auth-window-form')[0];
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const username = form.getElementsByClassName('username')[0].value;
            const password = form.getElementsByClassName('password')[0].value;
            const passwordConfirm = form.getElementsByClassName('confirm')[0].value;
            if(password !== passwordConfirm) {
                alert('The passwords don\'t match up. Make sure they are identical.');
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

        // как я понял, при логауте и перерисовке хидера кнопка
        // логина успевает перерисоваться и подцепить себе
        // event listener ещё до того, как событие click
        // считается закончившимся, и в итоге происходит как будто
        // двойное нажатие на кнопку, первое из которых было
        // по кнопке log out, а второе - уже по log in, и вместо
        // главной страницы при нажатии на log out пользователя
        // переносит на форму авторизации. поэтому цепляем event listener
        // на кнопку логина только тогда, когда страница прогрузилась

        window.addEventListener('load', () => { 
            document.getElementById('header-login-button').addEventListener('click', (e) => {
                if(!self._feed.user) {
                    self.showLoginForm();
                }
                else {
                    self.setCurrentUser('');
                }
            });
        })
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
            target.tagName === 'OPTION' ||
            target.tagName === 'TEXTAREA') return;    
            while(!target.classList.contains('tweet')) target = target.parentElement;
            self.showTweet(target.dataset.id);
        });

        const loadMoreButton = document.getElementsByClassName('load-more')[0];
        if(loadMoreButton) {
            loadMoreButton.addEventListener('click', () => {
                self.getFeed(0, self._currShownTweets + 10, self._currFilterConfig);
            });
        }  

        // this внутри ивента ссылается не на контроллер, поэтому bind
        document.getElementsByClassName('tweets')[0].addEventListener('click', self._setOwnTweetButtonsEventListeners.bind(self));
        
        document.getElementsByClassName('tweets')[0].addEventListener('click', (e) => {
            const target = e.target
            if(target.tagName !== 'SPAN') return;
            self._currFilterConfig = {
                author: '',
                dateFrom: new Date(0),
                dateTo: new Date(),
                text: '',
                hashtags: [ target.innerHTML ]
            }
            self.getFeed(0, 10, self._currFilterConfig);
        });

        document.getElementById('new-tweet-button').addEventListener('click', () => {
            self.addTweet(document.getElementById('new-tweet').value);
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

        document.getElementById('filter-clear').addEventListener('click', () => {
            authorTextarea.value = '';
            dateFilterBlock.getElementsByClassName('from')[0].getElementsByClassName('date-filter-lists')[0].children[0].value = '';
            dateFilterBlock.getElementsByClassName('to')[0].getElementsByClassName('date-filter-lists')[0].children[0].value = '';
            tweetTextTextarea.value = '';
            hashtagsTextarea.value = '';
        });
    }

    _addTweetEventListeners() {
        const self = this;

        const newCommentTextarea = document.getElementById('new-comment-textarea');
        document.getElementById('new-comment-submit').addEventListener('click', () => {
            const tweetId = document.getElementsByClassName('tweet')[0].dataset.id;
            if(!self._feed.addComment(tweetId, newCommentTextarea.value)) return;
            self.showTweet(tweetId);
        });

        document.getElementsByClassName('tweet')[0].addEventListener('click', self._setOwnTweetButtonsEventListeners.bind(self));
    }

    _createFilterConfig(authorTextarea, dateFilterBlock, tweetTextTextarea, hashtagsTextarea) {
        const from = dateFilterBlock.getElementsByClassName('from')[0].getElementsByClassName('date-filter-lists')[0];
        const dateFrom = from.children[0].valueAsDate;
        const to = dateFilterBlock.getElementsByClassName('to')[0].getElementsByClassName('date-filter-lists')[0];
        const dateTo = to.children[0].valueAsDate;
        this._currFilterConfig = {
            'author': authorTextarea.value,
            'dateFrom': dateFrom,
            'dateTo': dateTo,
            'text': tweetTextTextarea.value,
            'hashtags': hashtagsTextarea.value ? hashtagsTextarea.value.split(' ').filter((hashtag) => hashtag[0] === '#') : [],
        };
    }

    _setOwnTweetButtonsEventListeners(e) {
        const target = e.target;
        if(target.tagName !== 'I') return;
        let parentTweet = target;
        while(!parentTweet.classList.contains('tweet')) parentTweet = parentTweet.parentElement; 
        const tweetId = parentTweet.dataset.id;
        if(target.classList.contains('edit')) {
            const tweetEditTextareaContainer = ViewUtils.newTag('div', { id: 'tweet-edit-textarea-container' });
            const tweetEditTextarea = ViewUtils.newTag('textarea', { id: 'tweet-edit-textarea' });
            tweetEditTextarea.value = this._feed.get(tweetId).text;
            tweetEditTextareaContainer.appendChild(tweetEditTextarea);
            const doneButton = ViewUtils.newTag('button', { class: 'tweet-active-edit-button', id: 'tweet-edit-done' }, 'Done');
            const cancelButton = ViewUtils.newTag('button', { class: 'tweet-active-edit-button', id: 'tweet-edit-cancel' }, 'Cancel');
            const buttonContainer = ViewUtils.newTag('div', { class: 'tweet-active-edit-button-container' });
            buttonContainer.appendChild(doneButton);
            buttonContainer.appendChild(cancelButton);
            tweetEditTextareaContainer.appendChild(buttonContainer);
            const body = document.body;
            body.appendChild(tweetEditTextareaContainer);
            document.getElementById('tweet-edit-done').addEventListener('click', () => {
                this.editTweet(tweetId, tweetEditTextarea.value);
                body.removeChild(tweetEditTextareaContainer);
            });
            document.getElementById('tweet-edit-cancel').addEventListener('click', () => {
                body.removeChild(tweetEditTextareaContainer);
            })
        }
        if(target.classList.contains('delete')) {
            const choice = confirm('Are you sure?');
            if(choice) {
                this.removeTweet(tweetId);
                this.getFeed(0, this._currShownTweets - 1, this._currFilterConfig);
            }
        }
    }

    _displayAuthWindow(parent, isLogin) {
        parent.innerHTML = '';

        const authWindow = ViewUtils.newTag('section', { class: 'auth-window' });
        
        const authWindowHeader = ViewUtils.newTag('div', { class: 'auth-window-header' });
        authWindowHeader.appendChild(ViewUtils.newTag('p', { class: 'auth-window-header-text' }, isLogin ? 'Logging in' : 'Signing up'));
        
        const form = ViewUtils.newTag('form', { class: 'auth-window-form' });
        form.appendChild(ViewUtils.newTag('textarea', { class: 'auth-window-textarea username', required: '', placeholder: 'Input username' }));
        form.appendChild(ViewUtils.newTag('textarea', { class: 'auth-window-textarea password', required: '', placeholder: 'Input password' }));
        if(!isLogin) form.appendChild(ViewUtils.newTag('textarea', { class: 'auth-window-textarea password confirm', required: '', placeholder: 'Confirm password' }));
        form.appendChild(ViewUtils.newTag('button', { id: 'auth-window-button' }, isLogin ? 'Log in' : 'Sign up'));

        let otherActionText;
        
        if(!isLogin) {
            otherActionText = ViewUtils.newTag('p', { class: 'auth-window-misc-text' }, 'Already a user? ');
            otherActionText.appendChild(ViewUtils.newTag('a', { id: 'login-link', class: 'link' }, 'Log in'));
        }
        else {
            otherActionText = ViewUtils.newTag('p', { class: 'auth-window-misc-text' }, 'Not a user yet? ');
            otherActionText.appendChild(ViewUtils.newTag('a', { id: 'signup-link', class: 'link' }, 'Sign up'));
        }

        const returnToMainPageText = ViewUtils.newTag('p', { class: 'auth-window-misc-text' });
        returnToMainPageText.appendChild(ViewUtils.newTag('a', { id: 'main-page-link', class: 'link' }, 'Return to main page'));

        authWindow.appendChild(authWindowHeader);
        authWindow.appendChild(form);
        authWindow.appendChild(otherActionText);
        authWindow.appendChild(returnToMainPageText);

        parent.appendChild(authWindow);
    }

    _getOwn(tweets) {
        return tweets.map((tweet) => tweet.author === this._feed.user ? true : false);
    }
}

class UserList {
    _users = [];

    constructor() {
        this.restore();
    }

    addUser(user) {
        this._users.push(user);
        this.save();
    }

    has(user) {
        return this._users.some((el) => el.username === user.username && el.password === user.password);
    }

    save() {
        window.localStorage.users = JSON.stringify(this._users);
    }

    restore() {
        this._users = JSON.parse(window.localStorage.users);
    }
}

function initLocalStorage(usersstr, tweetsstr) {
    window.localStorage.setItem('users', usersstr);
    window.localStorage.setItem('tweets', tweetsstr);
    window.localStorage.setItem('lastUser', '');
}

class TweetFeedApiService {
    _serverAddress;

    constructor(address) {
        this._serverAddress = address;
    }

    login(login, password) {
        return fetch(this._serverAddress + '/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'accept': 'application/json',
            },
            body: JSON.stringify({
                login,
                password,
            }),
        });
    }

    register(login, password) {
        return fetch(this._serverAddress + '/registration', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'accept': 'application/json',
            },
            body: JSON.stringify({
                login,
                password,
            }),
        });
    }

    getTweets(author, text, dateFrom, dateTo, from, count, hashtags) {
        return fetch(this._serverAddress + '/tweet', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'accept': 'application/json',
            },
            body: JSON.stringify({
                author,
                text,
                dateFrom,
                dateTo,
                from,
                count,
                hashtags,
            }),
        });
    }

    addTweet(auth, text) {
        return fetch(this._serverAddress + '/tweet', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'accept': 'application/json',
                'Authorization': auth,
            },
            body: JSON.stringify({
                text,
            }),
        });
    } 

    editTweet(id, auth, text) {
        return fetch(this._serverAddress + '/tweet', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'accept': 'application/json',
                'Authorization': auth,
            },
            body: JSON.stringify({
                login,
                password,
            }),
            path: id,
        });
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

const usersstr = '[{"username":"Zoe","password":"pass"},{"username":"Ulrich","password":"pass"}]';
const tweetsstr = JSON.stringify(tweets);

if(!window.localStorage.users || !window.localStorage.tweets || window.localStorage.lastUser === undefined) initLocalStorage(usersstr, tweetsstr);

const userList = new UserList();
const controller = new Controller(tweets);
const api = new TweetFeedApiService('https://jslabapi.datamola.com');