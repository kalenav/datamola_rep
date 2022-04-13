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

/* class Tweet {
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
} */

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

            const dateNumbers = ViewUtils.getDateNumbers(new Date(tweet.createdAt));
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

        const dateNumbers = ViewUtils.getDateNumbers(new Date(tweet.createdAt));
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
            const dateNumbers = ViewUtils.getDateNumbers(new Date(comment.createdAt));
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
    _user;
    _token;
    _currFeed;
    _headerView;
    _tweetFeedView;
    _filterView;
    _tweetView;

    _filtersDisplayed = false;
    _currShownTweets;
    _currFilterConfig = {};

    constructor() {
        this._restoreUser()
        .then(() => {
            this._headerView = new HeaderView('username');
            this._addHeaderEventListeners();
            this._tweetFeedView = new TweetFeedView('main-container');
            this._initFeed()
            .then(() => {
                this._filterView = new FilterView('filter-block');
                this._addTweetFeedEventListeners();
                this._addFilterEventListeners();
                this._tweetView = new TweetView('main-container');
            });
        });
    }

    setCurrentUser(user) {
        this._user = user;
        this._headerView.display(user, false);
        this.getFeed(0, this._currShownTweets, this._currFilterConfig);
        this._addHeaderEventListeners();
    }
    
    addTweet(text) {
        api.addTweet(this._token, text)
        .then(response => response.json())
        .then(response => {
            if(response.id) {
                this.getFeed(0, 10, this._currFilterConfig);
            }
            else {
                alert('There\'s something wrong with your tweet. Make sure it\'s less than 280 symbols long.');
            }
        });
    }
    
    editTweet(id, text) {
        api.editTweet(id, this._token, text)
        .then(response => response.json())
        .then(response => {
            if(response.id) {
                this.getFeed(0, 10, this._currFilterConfig);
            }
            else {
                alert('There\'s something wrong with your tweet. Make sure it\'s less than 280 symbols long.');
            }
        });
    }
    
    removeTweet(id) {
        api.removeTweet(id, this._token)
        .then(response => {
            if(response.ok) {
                this.getFeed(0, 10, this._currFilterConfig);
            };
        })
    }

    _initFeed() {
        return api.getTweets()
        .then(response => response.json())
        .then(response => {
            const tweets = [...response];
            const own = this._user ? this._getOwn(tweets) : new Array(tweets.length).fill(false);
            this._tweetFeedView.display(true, tweets, own);
            this._currShownTweets = 10;
            this._currFeed = tweets.slice();
            const user = this._user;
            this._headerView.display(user, user ? true : false)
        });
    }
    
    getFeed(skip, top, filterConfig) {
        const self = this;
        let hashtagsStr;
        if(filterConfig.hashtags) hashtagsStr = filterConfig.hashtags.map((ht) => ht.slice(1)).join(',');

        api.getTweets(
            filterConfig.author, 
            filterConfig.text,
            filterConfig.dateFrom,
            filterConfig.dateTo,
            skip,
            top,
            hashtagsStr
        )
        .then(response => response.json())
        .then(response => {
            const tweets = [...response];
            if(tweets.length === 0) {
                self._tweetFeedView.display(false);
                self._headerView.display(self._user, true);
                document.getElementById('not-found-link').addEventListener('click', () => {
                    self.getFeed();
                });
            }
            else {
                const own = self._user ? self._getOwn(tweets) : new Array(tweets.length).fill(false);
                api.getTweets(
                    filterConfig.author, 
                    filterConfig.text,
                    filterConfig.dateFrom,
                    filterConfig.dateTo,
                    skip,
                    top + 1,
                    hashtagsStr
                )
                .then(response => response.json())
                .then(response => [...response].length >= tweets.length)
                .then(allTweetsShown => {
                    self._tweetFeedView.display(true, tweets, own, allTweetsShown, self._currFilterConfig);
                    self._headerView.display(self._user, false)
                })
                .then(() => {
                    self._filterView = new FilterView('filter-block');
                    self._addTweetFeedEventListeners();
                    self._addFilterEventListeners();
                    self._currShownTweets = tweets.length;
                });
            }
        })
    }
    
    showTweet(id) {
        const tweet = this._currFeed.find((tweet) => tweet.id === id);
        if(tweet) this._tweetView.display(tweet, tweet.author === this._user);
        this._addTweetEventListeners();
        this._currShownTweets = 0;
        this._currFilterConfig = {};
        this._headerView.display(this._user, true);
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
            api.login(username, password)
            .then(response => response.json()) 
            .then(response => {
                if(response.token) {
                    self.setCurrentUser(username);
                    self._token = response.token;
                    window.localStorage.lastUser = username;
                    window.localStorage.lastUserPassword = password;
                }
                else {
                    alert('Such a user doesn\'t exist or you have misspelled something.');
                }
            });
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
            api.register(username, password)
            .then(response => response.json())
            .then(response => {
                if(response.id) {
                    alert('Registered successfully!');
                }
            })
            // const newUser = { username, password };
            // if(!userList.has(newUser)) userList.addUser(newUser);
            // self.getFeed();
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
            self.getFeed(0, 10, self._currFilterConfig);
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
                if(!self._user) {
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
            tweetEditTextarea.value = this._currFeed.find((tweet) => tweet.id === tweetId).text;
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
        return tweets.map((tweet) => tweet.author === this._user ? true : false);
    }

    _displayErrorPage() {
        const mainContainer = document.getElementById('main-container')
        mainContainer.innerHTML = '';
        mainContainer.appendChild(ViewUtils.newTag('p', { class: 'error' }, 'Oh no! An error seems to have occurred.'));
        const linkToMainPage = ViewUtils.newTag('a', { class: 'not-found link', id: 'not-found-link' }, 'Return to main page');
        const self = this;
        linkToMainPage.addEventListener('click', () => {
            self.getFeed();
        });
        mainContainer.appendChild(linkToMainPage);
    }

    _restoreUser() {
        const lastUser = window.localStorage.lastUser;
        const lastUserPassword = window.localStorage.lastUserPassword;
        return api.login(lastUser, lastUserPassword)
        .then(response => response.json())
        .then(response => response.token) 
        .then(token => {
            if(token) {
                this._user = lastUser;
                this._token = token;
            }
            else {
                this._user = '';
                this._token = '';
            }
        })
    }
}

function initLocalStorage(usersstr, tweetsstr) {
    window.localStorage.setItem('users', usersstr);
    window.localStorage.setItem('tweets', tweetsstr);
    window.localStorage.setItem('lastUser', '');
}

class TweetFeedApiService {
    _serverAddress;
    _defaultHeaders = {
        'Content-Type': 'application/json',
        'accept': 'application/json',
    };

    constructor(address) {
        this._serverAddress = address;
    }

    login(login, password) {
        return this._createRequest('/login', 'POST', {}, {
            login,
            password,
        })
    }

    register(login, password) {
        return this._createRequest('/registration', 'POST', {}, {
            login,
            password,
        });
    }

    getTweets(author, text, dateFrom, dateTo, from = 0, count = 10, hashtags) {
        let url = new URL(this._serverAddress + '/tweet');
        const filters = {};
        if(author) filters['author'] = author;
        if(text) filters['text'] = text;
        filters['dateFrom'] = (dateFrom || new Date(0)).toISOString();
        filters['dateTo'] = (dateTo || new Date()).toISOString();
        filters['from'] = from;
        filters['count'] = count;
        if(hashtags) filters['hashtags'] = hashtags;
        url.search = new URLSearchParams(filters).toString();
        return fetch(url);
    }

    addTweet(auth, text) {
        return this._createRequest('/tweet', 'POST', { 'Authorization': 'Bearer ' + auth }, { text });
    } 

    editTweet(id, auth, text) {
        return this._createRequest(`/tweet/${id}`, 'PUT', { 'Authorization': 'Bearer ' + auth }, { text });
    }

    removeTweet(id, auth) {
        return this._createRequest(`/tweet/${id}`, 'DELETE', { 'Authorization': 'Bearer ' + auth });
    }

    addComment(tweetId, auth, text) {
        return this._createRequest(`/tweet/${tweetId}/comment`, 'POST', { 'Authorization': 'Bearer ' + auth }, { text }); 
    }

    editComment(tweetId, id, auth, text) {
        return this._createRequest(`/tweet/${tweetId}/comment/${id}`, 'PUT', { 'Authorization': 'Bearer ' + auth }, { text });
    }

    removeComment(tweetId, id, auth) {
        return this._createRequest(`/tweet/${tweetId}/comment/${id}`, 'DELETE', { 'Authorization': 'Bearer ' + auth })
    }

    _createRequest(path, method, extraHeaders = {}, bodyobj = {}) {
        const headers = {};
        for(let header in this._defaultHeaders) headers[header] = this._defaultHeaders[header];
        for(let header in extraHeaders) headers[header] = extraHeaders[header];
        return fetch(this._serverAddress + path, {
            method,
            headers,
            body: method !== 'GET' ? JSON.stringify(bodyobj) : undefined,
        })
    }
}

if(window.localStorage.lastUser === undefined) {
    window.localStorage.lastUser = '';
    window.localStorage.lastUserPassword = '';
}

const api = new TweetFeedApiService('https://jslabapi.datamola.com');
const controller = new Controller();