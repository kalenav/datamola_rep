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
        const year = date.getFullYear();
        const hours = Math.floor(date.getHours() / 10) === 0 ? `0${date.getHours()}` : date.getHours();
        const minutes = Math.floor(date.getMinutes() / 10) === 0 ? `0${date.getMinutes()}` : date.getMinutes();
        return {day, month, year, hours, minutes};
    }
    
    static wrapHashtags(text) {
        let hashtag = "";
        const limiters = [' ', '.', ',', '!', '?', ';', '\n'];
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

    display(found, tweets, own, all, filterValues, filtersHidden) { // tweets: Array<Tweet>, own: Array<Boolean>
        if(!found) {
            this._container.innerHTML = '';
            this._container.appendChild(ViewUtils.newTag('p', { class: 'not-found' }, 'No such tweets were found.'));
            this._container.appendChild(ViewUtils.newTag('a', { class: 'not-found link', id: 'not-found-link' }, 'Return to main page'));
            return;
        }
        this._container.innerHTML = '';
        this._displayNewTweetSection(this._container);
        const tweetsSection = ViewUtils.newTag('section', { class: 'tweets' });
        this._appendFilters(tweetsSection, filterValues, filtersHidden);
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

    _appendFilters(parent, filterValues = {}, filtersHidden) { // filterValues: { author: string, dateFrom: Date, ... }
        parent.appendChild(ViewUtils.newTag('button', { class: 'filters-button' }, 'Filters'));
        const filterBlock = ViewUtils.newTag('div', { class: filtersHidden ? 'hidden' : '', id: 'filter-block' });

        const authorLabel = ViewUtils.newTag('label', { class: 'filter-label' }, 'Author');
        const authorNameTextarea = ViewUtils.newTag('textarea', { class: 'filter', placeholder: 'Press enter to add to author filter list', id: 'author-name-filter'});
        authorNameTextarea.value = filterValues.author || '';
        const selectedAuthorsContainer = ViewUtils.newTag('div', { class: 'selected-filters-list-container' });
        selectedAuthorsContainer.appendChild(ViewUtils.newTag('ul', { class: 'selected-filters-list', id: 'selected-authors-list' }));
        const tweetTextLabel = ViewUtils.newTag('label', { class: 'filter-label' }, 'Tweet text');
        const tweetTextTextarea = ViewUtils.newTag('textarea', { class: 'filter', placeholder: 'Tweet text', id: 'tweet-text-filter'});
        tweetTextTextarea.value = filterValues.text || '';
        const hashtagsLabel = ViewUtils.newTag('label', { class: 'filter-label' }, 'Hashtags');
        const hashtagsTextarea = ViewUtils.newTag('textarea', { class: 'filter', placeholder: 'Press enter to add to hashtag filter list', id: 'hashtags-filter' });
        hashtagsTextarea.value = filterValues.hashtags ? filterValues.hashtags.join(' ') : ''; 
        const selectedHashtagsContainer = ViewUtils.newTag('div', { class: 'selected-filters-list-container' });
        selectedHashtagsContainer.appendChild(ViewUtils.newTag('ul', { class: 'selected-filters-list', id: 'selected-hashtags-list' }));

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

        const filterButtonsContainer = ViewUtils.newTag('div', { id: 'filter-buttons-container' });
        filterButtonsContainer.appendChild(ViewUtils.newTag('button', { id: 'filter-submit' }, 'Apply filters'));
        filterButtonsContainer.appendChild(ViewUtils.newTag('button', { id: 'filter-clear' }, 'Clear filters'));

        filterBlock.appendChild(authorLabel);
        filterBlock.appendChild(authorNameTextarea);
        filterBlock.appendChild(selectedAuthorsContainer);
        filterBlock.appendChild(dateFilterBlock);
        filterBlock.appendChild(tweetTextLabel);
        filterBlock.appendChild(tweetTextTextarea);
        filterBlock.appendChild(hashtagsLabel);
        filterBlock.appendChild(hashtagsTextarea);
        filterBlock.appendChild(selectedHashtagsContainer);
        filterBlock.appendChild(filterButtonsContainer);

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
        this._container.classList.toggle('hidden');
    }

    hide() {
        this._container.classList.toggle('hidden');
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
    _currFilterConfig = {
        author: '',
        dateFrom: null,
        dateTo: null,
        text: '',
        hashtags: [],
    };
    _filterRestoreBuffer = {
        authors: [],
        hashtags: [],
        dateFrom: null,
        dateTo: null,
    }

    _shortPollingIntervalId;

    constructor() {
        return (async () => {
            try {
                await this._restoreUser();
                this._headerView = new HeaderView('username');
                this._headerView.display(this._user, false);
                this._addHeaderEventListeners();
                this._tweetFeedView = new TweetFeedView('main-container');
                await this._initFeed();
                this._filterView = new FilterView('filter-block');
                this._addTweetFeedEventListeners();
                this._addFilterEventListeners();
                this._tweetView = new TweetView('main-container');
            }
            catch(e) {
                this._displayErrorPage();
            }
        })();
    }

    _setCurrentUser(user) {
        this._user = user;
        if(!user) this._token = '';
        this._headerView.display(user, false);
        this._getFeed();
    }
    
    async _addTweet(text) {
        if(text.length > 280) {
            alert('There\'s something wrong with your tweet. Make sure it\'s no more than 280 symbols long.');
            return;
        }
        if(text.trim() === '') {
            alert('Your tweet can\'t be empty.');
            return;
        }
        try {
            const response = await this._getResponseJSON(api.addTweet(this._token, text));
            if(response.id) {
                document.getElementById('new-tweet').value = '';
                this._getFeed();
            }
            else if(response.statusCode === 401) {
                this._showLoginForm();
            }
            else {
                console.log(response);
            }
        }
        catch(e) {
            this._displayErrorPage();
        }
    }
    
    async _editTweet(id, text) {
        const response = await this._getResponseJSON(api.editTweet(id, this._token, text));
        try {
            if(response.id) {
                if(document.getElementsByClassName('tweets')[0]) this._getFeed();
                else {
                    this._currFeed.unshift({ 
                        id: response.id,
                        author: response.author,
                        createdAt: response.createdAt,
                        text: response.text,
                        comments: response.comments.slice() 
                    });
                    this._showTweet(response.id);
                }
            }
            else if(response.statusCode === 401) {
                this._showLoginForm();
            }
            else alert('There\'s something wrong with your tweet. Make sure it\'s less than 280 symbols long.');
        }
        catch(e) {
            this._displayErrorPage();
        }
    }
    
    async _removeTweet(id) {
        const response = await api.removeTweet(id, this._token);
        try {
            if(response.ok) {
                this._getFeed();
            }
            else if(response.statusCode === 401) {
                this._showLoginForm();
            }
        }
        catch(e) {
            this._displayErrorPage();
        }
    }

    async _initFeed() {
        const response = await this._getResponseJSON(api.getTweets());
        try {
            const tweets = [...response];
            const own = this._user ? this._getOwn(tweets) : new Array(tweets.length).fill(false);
            this._tweetFeedView.display(true, tweets, own);
            this._currShownTweets = 10;
            this._currFeed = tweets.slice();
            const user = this._user;
            this._headerView.display(user, false);
            this._resetShortPollingInterval();
        }
        catch(e) {
            this._displayErrorPage();
        }
    }
    
    async _getFeed(skip = 0, top = 10, filterConfig = this._currFilterConfig) {
        const self = this;
        let hashtagsStr;
        if(filterConfig.hashtags) hashtagsStr = filterConfig.hashtags.map((ht) => ht.slice(1)).join(',');

        const newTweetText = this._getValueToSave(document.getElementById('new-tweet'), 'value');
        const authorTextareaText = this._getValueToSave(document.getElementById('author-name-filter'), 'value');
        const tweetTextTextareaText = this._getValueToSave(document.getElementById('tweet-text-filter'), 'value');
        const hashtagsTextareaText = this._getValueToSave(document.getElementById('hashtags-filter'), 'value');

        const currActiveElement = document.activeElement;
        const currActiveElementId = currActiveElement.tagName === 'TEXTAREA' ? currActiveElement.getAttribute('id') : '';

        try {
            const authors = filterConfig.author.split(',');
            let tweets = [];
            let foundTweetsCount = 0;
            await new Promise(async function(resolve, reject) {
                for(let i = 0; i < authors.length; i++) {
                    const response = await self._getResponseJSON(api.getTweets(
                        authors[i],
                        filterConfig.text,
                        filterConfig.dateFrom,
                        filterConfig.dateTo,
                        skip,
                        top + 1,
                        hashtagsStr,
                    ));
                    foundTweetsCount += response.length;
                    tweets = tweets.concat(response);
                }
                resolve();
            });
            tweets = tweets.slice(0, top);
            if(tweets.length === 0) {
                clearInterval(self._shortPollingIntervalId);
                self._currFilterConfig = {
                    author: '',
                    dateFrom: null,
                    dateTo: null,
                    text: '',
                    hashtags: [],
                };
                self._tweetFeedView.display(false);
                self._headerView.display(self._user, true);
                document.getElementById('not-found-link').addEventListener('click', () => {
                    self._getFeed();
                    self._resetShortPollingInterval();
                });
            }
            else {
                const allTweetsShown = foundTweetsCount === tweets.length;
                tweets.sort((tweet1, tweet2) => tweet1.createdAt < tweet2.createdAt ? 1 : -1);
                const own = self._user ? self._getOwn(tweets) : new Array(tweets.length).fill(false);
                self._tweetFeedView.display(true, tweets, own, allTweetsShown, self._currFilterConfig, self._filtersDisplayed);
                self._headerView.display(self._user, false);
                self._filterView = new FilterView('filter-block');
                self._addTweetFeedEventListeners();
                self._addFilterEventListeners();
                self._currShownTweets = tweets.length;
                self._currFeed = tweets.slice();
                self._restoreFeedState(newTweetText, authorTextareaText, tweetTextTextareaText, hashtagsTextareaText, currActiveElementId);
                self._resetFilterRestoreBuffer();
                self._resetShortPollingInterval();
            }
        }
        catch(e) {
            this._displayErrorPage();
        }
    }

    _getValueToSave(element, field, defaultValue = '') {
        return element ? element[field] : defaultValue;
    }

    _restoreFeedState(newTweetText, authorTextareaText, tweetTextTextareaText, hashtagsTextareaText, currActiveElementId) {
        document.getElementById('new-tweet').value = newTweetText;
        document.getElementById('author-name-filter').value = authorTextareaText;
        document.getElementById('tweet-text-filter').value = tweetTextTextareaText;
        document.getElementById('hashtags-filter').value = hashtagsTextareaText;

        const selectedAuthorsList = document.getElementById('selected-authors-list');
        const selectedHashtagsList = document.getElementById('selected-hashtags-list');
        let authorsHintTextDisplayed = false;
        let hashtagsHintTextDisplayed = false;

        function addAuthorsHintText() {
            selectedAuthorsList.parentNode.appendChild(ViewUtils.newTag('p', { class: 'filter-hint-text', id: 'selected-authors-list-hint-text' }, 'Click on an author name to remove it from the filter list!'));
        }

        function addHashtagsHintText() {
            selectedHashtagsList.parentNode.appendChild(ViewUtils.newTag('p', { class: 'filter-hint-text', id: 'selected-hashtags-list-hint-text' }, 'Click on a hashtag to remove it from the filter list!'));
        }

        if(this._currFilterConfig.author) {
            authorsHintTextDisplayed = true;
            addAuthorsHintText();
            this._currFilterConfig.author.split(',').forEach((author) => {
                selectedAuthorsList.appendChild(ViewUtils.newTag('li', {}, author));
            })
        }
        if(this._filterRestoreBuffer.authors.length > 0) {
            if(!authorsHintTextDisplayed) addAuthorsHintText();
            this._filterRestoreBuffer.authors.forEach((author) => {
                selectedAuthorsList.appendChild(ViewUtils.newTag('li', {}, author));
            })
        }

        if(this._currFilterConfig.hashtags.length > 0) {
            hashtagsHintTextDisplayed = true;
            addHashtagsHintText();
            this._currFilterConfig.hashtags.forEach((hashtag) => {
                selectedHashtagsList.appendChild(ViewUtils.newTag('li', {}, hashtag));
            })
        }
        if(this._filterRestoreBuffer.hashtags.length > 0) {
            if(!hashtagsHintTextDisplayed) addHashtagsHintText();
            this._filterRestoreBuffer.hashtags.forEach((hashtag) => {
                selectedHashtagsList.appendChild(ViewUtils.newTag('li', {}, hashtag));
            })
        }

        if(this._filterRestoreBuffer.dateFrom) {
            const dateFromNumbers = ViewUtils.getDateNumbers(this._filterRestoreBuffer.dateFrom);
            document.getElementById('date-from').value = `${dateFromNumbers.year}-${dateFromNumbers.month}-${dateFromNumbers.day}`;
        }
        else if(this._currFilterConfig.dateFrom) {
            const dateFromNumbers = ViewUtils.getDateNumbers(this._currFilterConfig.dateFrom);
            document.getElementById('date-from').value = `${dateFromNumbers.year}-${dateFromNumbers.month}-${dateFromNumbers.day}`;
        }

        if(this._filterRestoreBuffer.dateTo) {
            const dateToNumbers = ViewUtils.getDateNumbers(this._filterRestoreBuffer.dateTo);
            document.getElementById('date-to').value = `${dateToNumbers.year}-${dateToNumbers.month}-${dateToNumbers.day}`;
        }
        else if(this._currFilterConfig.dateTo) {
            const dateToNumbers = ViewUtils.getDateNumbers(this._currFilterConfig.dateTo);
            document.getElementById('date-to').value = `${dateToNumbers.year}-${dateToNumbers.month}-${dateToNumbers.day}`;
        }

        if(currActiveElementId) document.getElementById(currActiveElementId).focus();
    }
    
    _showTweet(id) {
        clearInterval(this._shortPollingIntervalId);
        const tweet = this._currFeed.find((tweet) => tweet.id === id);
        if(tweet) {
            this._tweetView.display(tweet, tweet.author === this._user);
            this._addTweetEventListeners();
            this._currShownTweets = 0;
            this._headerView.display(this._user, true);
        }
        else {
            this._displayErrorPage();
        }
    }

    _toggleFilters() {
        if(this._filtersDisplayed) {
            this._filterView.hide();
            this._filtersDisplayed = false;
        }
        else {
            this._filterView.display();
            this._filtersDisplayed = true;
        }
    }

    _showLoginForm() {
        const self = this;

        self._displayAuthWindow(document.getElementById('main-container'), true);
        self._preventAuthTextareaLinebreaks();

        const form = document.getElementsByClassName('auth-window-form')[0];
        form.addEventListener('submit', async function(e) {
            e.preventDefault(); // чтобы не переходило на страницу с твитами само по себе
            const username = form.getElementsByClassName('username')[0].value;
            const password = form.getElementsByClassName('password')[0].value;
            try {
                const token = (await self._getResponseJSON(api.login(username, password))).token;
                if(token) {
                    self._setCurrentUser(username);
                    self._token = token;
                    window.localStorage.lastUser = username;
                    window.localStorage.token = token;
                }
                else {
                    alert('Incorrect username or password.');
                }
            }
            catch(e) {
                self._displayErrorPage();
            }
        });

        document.getElementById('view-password').addEventListener('click', () => {
            document.getElementsByClassName('auth-window-textarea')[1].classList.toggle('password');
        });

        document.getElementById('signup-link').addEventListener('click', () => {
            self._showSignupForm();
        });

        document.getElementById('main-page-link').addEventListener('click', () => {
            this._getFeed();
        });
    }

    _showSignupForm() {
        const self = this;

        self._displayAuthWindow(document.getElementById('main-container'), false);
        self._preventAuthTextareaLinebreaks();

        const form = document.getElementsByClassName('auth-window-form')[0];
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            const username = form.getElementsByClassName('username')[0].value;
            const password = form.getElementsByClassName('password')[0].value;
            const passwordConfirm = form.getElementsByClassName('confirm')[0].value;
            if(password !== passwordConfirm) {
                alert('The passwords don\'t match up. Make sure they are identical.');
                return;
            }
            try {
                const response = await api.register(username, password);
                if(response.ok) {
                    alert('Registered successfully!');
                    self._showLoginForm();
                }
                else if(response.status === 409) {
                    alert('Such a user already exists.');
                }
            }
            catch(e) {
                self._displayErrorPage();
            }
        });

        document.getElementById('view-password').addEventListener('click', () => {
            document.getElementsByClassName('auth-window-textarea')[1].classList.toggle('password');
        });

        document.getElementById('view-password-confirm').addEventListener('click', () => {
            document.getElementsByClassName('auth-window-textarea')[2].classList.toggle('password');
        });

        document.getElementById('login-link').addEventListener('click', () => {
            self._showLoginForm();
        });

        document.getElementById('main-page-link').addEventListener('click', () => {
            this._getFeed();
        });
    }

    _addHeaderEventListeners() {
        const self = this;

        document.getElementById('header-home-button').addEventListener('click', () => {
            self._getFeed();
            self._resetShortPollingInterval();
        });

        document.getElementById('header-login-button').addEventListener('click', (e) => {
            clearInterval(this._shortPollingIntervalId);
            if(!self._user) {
                self._showLoginForm();
            }
            else {
                self._setCurrentUser('');
                window.localStorage.lastUser = '';
                window.localStorage.lastUserPassword = '';
            }
        });
    }

    _addTweetFeedEventListeners() {
        const self = this;

        document.getElementsByClassName('filters-button')[0].addEventListener('click', () => {
            self._toggleFilters();
        });
        
        const tweetsSection = document.getElementsByClassName('tweets')[0];

        tweetsSection.addEventListener('click', (e) => {
            let target = e.target;
            if(!target) return;
            if(!self._isTweet(target)) target = target.parentElement;
            if(!self._isTweet(target)) return;
            self._showTweet(target.dataset.id);
        });

        const loadMoreButton = document.getElementsByClassName('load-more')[0];
        if(loadMoreButton) {
            loadMoreButton.addEventListener('click', () => {
                self._getFeed(0, self._currShownTweets + 10, self._currFilterConfig);
            });
        }  

        // this внутри ивента ссылается не на контроллер, поэтому bind
        tweetsSection.addEventListener('click', self._setOwnTweetButtonsEventListeners.bind(self));
        
        tweetsSection.addEventListener('click', (e) => {
            const target = e.target
            if(!target.classList.contains('hashtag')) return;
            self._currFilterConfig = {
                author: '',
                dateFrom: null,
                dateTo: null,
                text: '',
                hashtags: [ target.innerHTML ]
            }
            self._getFeed();
        });

        document.getElementById('new-tweet-button').addEventListener('click', () => {
            self._addTweet(document.getElementById('new-tweet').value);
        });
    }

    _addFilterEventListeners() {
        const self = this;

        const authorTextarea = document.getElementById('author-name-filter');
        const dateFilterBlock = document.getElementById('date-filter');
        const tweetTextTextarea = document.getElementById('tweet-text-filter');
        const hashtagsTextarea = document.getElementById('hashtags-filter');

        const selectedAuthorsList = document.getElementById('selected-authors-list');
        const selectedHashtagsList = document.getElementById('selected-hashtags-list');

        authorTextarea.addEventListener('keydown', (e) => {
            if(e.keyCode === 13) e.preventDefault();
        });

        hashtagsTextarea.addEventListener('keydown', (e) => {
            if(e.keyCode === 13) e.preventDefault();
        });

        const forbiddenSymbols = [ ' ', ',', '.', ';', '\n' ];

        authorTextarea.addEventListener('keyup', (e) => {
            if(e.keyCode !== 13) return;
            const value = authorTextarea.value;
            if(value.trim() === '') return;
            if(self._filterRestoreBuffer.authors.includes(value)) return;
            if(selectedAuthorsList.children.length === 0) {
                selectedAuthorsList.parentNode.appendChild(ViewUtils.newTag('p', { id: 'selected-authors-list-hint-text' }, 'Click on an author name to remove it from the filter list!'));
            }
            selectedAuthorsList.appendChild(ViewUtils.newTag('li', {}, value));
            self._filterRestoreBuffer.authors.push(value);
            authorTextarea.value = '';
        });

        hashtagsTextarea.addEventListener('keyup', (e) => {
            if(e.keyCode !== 13) return;
            let value = hashtagsTextarea.value;
            if(value[0] !== '#') value = `#${value}`;
            if(forbiddenSymbols.some((sym) => hashtagsTextarea.value.includes(sym))) {
                alert('Your hashtag contains a prohibited symbol.');
                return;
            }
            if(value.trim() === '') return;
            if(self._filterRestoreBuffer.hashtags.includes(value)) return;
            if(selectedHashtagsList.children.length === 0) {
                selectedHashtagsList.parentNode.appendChild(ViewUtils.newTag('p', { id: 'selected-hashtags-list-hint-text' }, 'Click on a hashtag to remove it from the filter list!'));
            }
            selectedHashtagsList.appendChild(ViewUtils.newTag('li', {}, value));
            self._filterRestoreBuffer.hashtags.push(value);
            hashtagsTextarea.value = '';
        });

        selectedAuthorsList.addEventListener('click', (e) => {
            const target = e.target;
            if(target.tagName !== 'LI') return;
            target.parentNode.removeChild(target);
            const currAuthors = self._filterRestoreBuffer.authors;
            currAuthors.splice(currAuthors.findIndex(author => author === target.innerHTML), 1);
            if(selectedAuthorsList.children.length === 0) {
                selectedAuthorsList.parentNode.removeChild(document.getElementById('selected-authors-list-hint-text'));
                // if(selectedAuthorsList.children.length === 0) {
                //     selectedAuthorsList.parentNode.removeChild(document.getElementById('selected-authors-list-hint-text'));
                // }
            }
        });

        selectedHashtagsList.addEventListener('click', (e) => {
            const target = e.target;
            if(target.tagName !== 'LI') return;
            target.parentNode.removeChild(target);
            const currHashtags = self._filterRestoreBuffer.hashtags;
            currHashtags.splice(currHashtags.findIndex(author => author === target.innerHTML), 1);
            if(selectedHashtagsList.children.length === 0) {
                selectedHashtagsList.parentNode.removeChild(document.getElementById('selected-hashtags-list-hint-text'));
                // if(selectedHashtagsList.children.length === 0) {
                //     selectedHashtagsList.parentNode.removeChild(document.getElementById('selected-hashtags-list-hint-text'));
                // }
            }
        });

        const dateFromInput = document.getElementById('date-from');
        dateFromInput.addEventListener('input', () => {
            this._filterRestoreBuffer.dateFrom = dateFromInput.valueAsDate;
        });

        const dateToInput = document.getElementById('date-to');
        dateToInput.addEventListener('input', () => {
            this._filterRestoreBuffer.dateTo = dateToInput.valueAsDate;
        });

        document.getElementById('filter-submit').addEventListener('click', () => {
            self._createFilterConfig(selectedAuthorsList, dateFilterBlock, tweetTextTextarea, selectedHashtagsList);
            self._resetFilterRestoreBuffer();
            self._getFeed();
        });

        document.getElementById('filter-clear').addEventListener('click', () => {
            authorTextarea.value = '';
            dateFilterBlock.getElementsByClassName('from')[0].getElementsByClassName('date-filter-lists')[0].children[0].value = '';
            dateFilterBlock.getElementsByClassName('to')[0].getElementsByClassName('date-filter-lists')[0].children[0].value = '';
            tweetTextTextarea.value = '';
            hashtagsTextarea.value = '';
            selectedAuthorsList.textContent = '';
            selectedHashtagsList.textContent = '';
            const authorsHintText = document.getElementById('selected-authors-list-hint-text');
            if(authorsHintText) selectedAuthorsList.parentNode.removeChild(authorsHintText);
            const hashtagsHintText = document.getElementById('selected-hashtags-list-hint-text');
            if(hashtagsHintText) selectedHashtagsList.parentNode.removeChild(hashtagsHintText);
            self._resetFilterConfig();
            self._getFeed();
        });
    }

    _addTweetEventListeners() {
        const self = this;

        const newCommentTextarea = document.getElementById('new-comment-textarea');
        document.getElementById('new-comment-submit').addEventListener('click', async function() {
            const tweetId = document.getElementsByClassName('tweet')[0].dataset.id;
            const commentText = newCommentTextarea.value;
            if(commentText.length > 280) {
                alert('There is something wrong with your comment. Make sure it has no more than 280 symbols long.');
                return;
            }
            try {
                const response = await api.addComment(tweetId, self._token, commentText);
                if(response.ok) 
                {
                    await self._getFeed(); // стоит обновить твит, вдруг кто-то написал коммент/отредактирвоал/удалил
                    self._showTweet(tweetId);
                }
                else {
                    // по какой бы то ни было причине, сервер возвращает 
                    // ошибку 500, если человек не залогинен, хотя должен
                    // возвращать 401. на сваггере тоже проверял, дело, как
                    // я понимаю, не в неправильном запросе, да и при попытке
                    // написать твит, будучи незалогиненным, всё работает, как
                    // нужно, хотя там та же логика, но сервер в случае чего 
                    // возвращает 401 (строка 284)

                    if(response.status === 500) self._showLoginForm();
                    else self._displayErrorPage();
                }
            }
            catch(e) {
                self._displayErrorPage();
            }
        });
        
        const tweet = document.getElementsByClassName('tweet')[0];

        tweet.addEventListener('click', self._setOwnTweetButtonsEventListeners.bind(self));
        tweet.addEventListener('click', (e) => {
            const target = e.target;
            if(!target.classList.contains('hashtag')) return;
            self._currFilterConfig = {
                author: '',
                dateFrom: null,
                dateTo: null,
                text: '',
                hashtags: [ target.innerHTML ],
            };
            self._resetShortPollingInterval();
            self._getFeed();
        });
    }

    _createFilterConfig(selectedAuthorsList, dateFilterBlock, tweetTextTextarea, selectedHashtagsList) {
        const from = dateFilterBlock.getElementsByClassName('from')[0].getElementsByClassName('date-filter-lists')[0];
        const dateFrom = from.children[0].valueAsDate;
        const to = dateFilterBlock.getElementsByClassName('to')[0].getElementsByClassName('date-filter-lists')[0];
        const dateTo = to.children[0].valueAsDate;

        let authorStr = [...selectedAuthorsList.children].map((li) => li.childNodes[0].data).filter(author => author !== '').join(',');
        const authorTextarea = document.getElementById('author-name-filter');
        if(authorTextarea.value) authorStr += `${authorStr ? ',' : ''}${authorTextarea.value}`; // добавляю запятую только если есть какие-то другие авторы
        const hashtagsArr = [...selectedHashtagsList.children].map((li) => li.childNodes[0].data);
        const hashtagsTextarea = document.getElementById('hashtags-filter');
        if(hashtagsTextarea.value) hashtagsArr.push(hashtagsTextarea.value);

        this._currFilterConfig = {
            author: authorStr,
            dateFrom: dateFrom,
            dateTo: dateTo,
            text: tweetTextTextarea.value,
            hashtags: hashtagsArr,
        };
    }

    _resetFilterConfig() {
        this._currFilterConfig = {
            author: '',
            dateFrom: null,
            dateTo: null,
            text: '',
            hashtags: [],
        }
    }

    _resetFilterRestoreBuffer() {
        this._filterRestoreBuffer = {
            authors: [],
            hashtags: [],
        }
    }

    _setOwnTweetButtonsEventListeners(e) {
        const target = e.target;
        if(!target.classList.contains('own-tweet-tool')) return;
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
                this._editTweet(tweetId, tweetEditTextarea.value);
                body.removeChild(tweetEditTextareaContainer);
            });
            document.getElementById('tweet-edit-cancel').addEventListener('click', () => {
                body.removeChild(tweetEditTextareaContainer);
            })
        }
        if(target.classList.contains('delete')) {
            const choice = confirm('Are you sure?');
            if(choice) {
                this._removeTweet(tweetId);
                this._getFeed(0, this._currShownTweets - 1);
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
        const passwordTextareaContainer = ViewUtils.newTag('div', { class: 'auth-window-textarea-container' });
        passwordTextareaContainer.appendChild(ViewUtils.newTag('input', { type: 'text', class: 'auth-window-textarea password', required: '', placeholder: 'Input password' }));
        passwordTextareaContainer.appendChild(ViewUtils.newTag('i', { class: 'fa-solid fa-eye auth-window-textarea-icon', id: 'view-password' }));
        form.appendChild(passwordTextareaContainer);
        if(!isLogin) {
            const passwordConfirmTextareaContainer = ViewUtils.newTag('div', { class: 'auth-window-textarea-container' });
            passwordConfirmTextareaContainer.appendChild(ViewUtils.newTag('input', { type: 'text', class: 'auth-window-textarea password confirm', required: '', placeholder: 'Confirm password' }));
            passwordConfirmTextareaContainer.appendChild(ViewUtils.newTag('i', { class: 'fa-solid fa-eye auth-window-textarea-icon', id: 'view-password-confirm' }));
            form.appendChild(passwordConfirmTextareaContainer);
        }
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

    _preventAuthTextareaLinebreaks() {
        [...document.getElementsByClassName('auth-window-textarea')].forEach(textarea => {
            textarea.addEventListener('keydown', e => {
                if(e.keyCode === 13) e.preventDefault();
            });
        })
    }

    _getOwn(tweets) {
        return tweets.map((tweet) => tweet.author === this._user);
    }

    _displayErrorPage() {
        clearInterval(this._shortPollingIntervalId);

        const mainContainer = document.getElementById('main-container')
        mainContainer.innerHTML = '';
        mainContainer.appendChild(ViewUtils.newTag('p', { class: 'error' }, 'Oh no! An error seems to have occurred.'));
        const linkToMainPage = ViewUtils.newTag('a', { class: 'not-found link', id: 'not-found-link' }, 'Return to main page');
        const self = this;
        linkToMainPage.addEventListener('click', () => {
            self._getFeed();
        });
        mainContainer.appendChild(linkToMainPage);
    }

    _isTweet(elem) {
        return elem.classList.contains('tweet');
    }

    async _restoreUser() {
        const lastUser = window.localStorage.lastUser;
        let token = window.localStorage.token;
        try {
            // тестовый твит, проверить, всё ещё валиден ли токен
            const response = await this._getResponseJSON(api.addTweet(token, '123'));
            if(response.statusCode === 401) {
                this._user = '';
                this._token = '';
            }
            else {
                await api.removeTweet(response.id, token);
                this._user = lastUser;
                this._token = token;
            }
            return Promise.resolve();
        }
        catch(e) {
            this._displayErrorPage();
        }
    }

    _resetShortPollingInterval() {
        clearInterval(this._shortPollingIntervalId);
        this._shortPollingIntervalId = setInterval(() => { this._getFeed(0, this._currShownTweets) }, 15000);
    }

    async _getResponseJSON(request) {
        return request.then(response => response.json());
    }
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
            body: method !== 'GET' ? JSON.stringify(bodyobj) : null,
        })
    }
}

if(!window.localStorage.lastUser) {
    window.localStorage.lastUser = '';
    window.localStorage.token = '';
}

const api = new TweetFeedApiService('https://jslabapi.datamola.com');
const controller = new Controller();