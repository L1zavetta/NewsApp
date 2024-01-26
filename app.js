// Custom Http Module
function customHttp() {
    return {
        get: function (url, cb) {
            try {
                var xhr_1 = new XMLHttpRequest();
                xhr_1.open('GET', url);
                xhr_1.addEventListener('load', function () {
                    if (Math.floor(xhr_1.status / 100) !== 2) {
                        cb("Error. Status code: ".concat(xhr_1.status), xhr_1);
                        return;
                    }
                    var response = JSON.parse(xhr_1.responseText);
                    cb(null, response);
                });
                xhr_1.addEventListener('error', function () {
                    cb("Error. Status code: ".concat(xhr_1.status), xhr_1);
                });
                xhr_1.send();
            }
            catch (error) {
                cb(error);
            }
        },
        post: function (url, body, headers, cb) {
            try {
                var xhr_2 = new XMLHttpRequest();
                xhr_2.open('POST', url);
                xhr_2.addEventListener('load', function (e) {
                    if (Math.floor(xhr_2.status / 100) !== 2) {
                        cb("Error. Status code: ".concat(xhr_2.status), xhr_2);
                        return;
                    }
                    var response = JSON.parse(xhr_2.responseText);
                    cb(null, response);
                });
                xhr_2.addEventListener('error', function () {
                    cb("Error. Status code: ".concat(xhr_2.status), xhr_2);
                });
                if (headers) {
                    Object.entries(headers).forEach(function (_a) {
                        var key = _a[0], value = _a[1];
                        xhr_2.setRequestHeader(key, value);
                    });
                }
                xhr_2.send(JSON.stringify(body));
            }
            catch (error) {
                cb(error);
            }
        },
    };
}
// Init http module
var http = customHttp();
var newsService = (function () {
    var apiKey = 'ada52d8f21bc40a9baa08e4521ba492a';
    var apiUrl = 'https://newsapi.org/v2';
    return {
        topHeadlines: function (country, category, cb) {
            if (country === void 0) { country = 'us'; }
            http.get("".concat(apiUrl, "/top-headlines?country=").concat(country, "&category=").concat(category, "&apiKey=").concat(apiKey), cb);
        },
        everything: function (query, cb) {
            http.get("".concat(apiUrl, "/everything?q=").concat(query, "&apiKey=").concat(apiKey), cb);
        },
    };
})();
var form = document.forms['newsControls'];
var countrySelect = form.elements['country'];
var categorySelect = form.elements['category'];
var searchInput = form.elements['search'];
form.addEventListener('submit', function (e) {
    e.preventDefault();
    loadNews();
});
//  init selects
document.addEventListener('DOMContentLoaded', function () {
    M.AutoInit();
    loadNews();
});
function loadNews() {
    showLoader();
    var country = countrySelect.value;
    var category = categorySelect.value;
    var searchText = searchInput.value;
    if (!searchText) {
        newsService.topHeadlines(country, category, onGetResponse);
    }
    else {
        newsService.everything(searchText, onGetResponse);
    }
}
function onGetResponse(err, res) {
    removePreloader();
    if (err) {
        showAlert(err, 'error-msg');
        return;
    }
    if (!res.articles.length) {
        showAlert('There is no news');
        return;
    }
    renderNews(res.articles);
}
function renderNews(news) {
    var newsContainer = document.querySelector('.news-container .row');
    if (newsContainer.children.length) {
        clearContainer(newsContainer);
    }
    var fragment = '';
    news.forEach(function (newsItem) {
        var el = newsTemplate(newsItem);
        fragment += el;
    });
    newsContainer.insertAdjacentHTML('afterbegin', fragment);
}
function clearContainer(container) {
    var child = container.lastElementChild;
    while (child) {
        container.removeChild(child);
        child = container.lastElementChild;
    }
}
function newsTemplate(_a) {
    var urlToImage = _a.urlToImage, title = _a.title, url = _a.url, description = _a.description;
    return "\n        <div class=\"col s12\">\n            <div class=\"card large\">\n                <div class=\"card-image\">\n                    <img src=\"".concat(urlToImage || 'news.webp', "\">\n                    <span class=\"card-title col s12\">").concat(title || '', "</span>\n                </div>\n                <div class=\"card-content\">\n                    <p>").concat(description || '', "</p>\n                </div>\n                <div class=\"card-action\">\n                    <a href=\"").concat(url, "\">Read more</a>\n                </div>\n            </div>\n        </div>\n     ");
}
function showAlert(msg, type) {
    if (type === void 0) { type = 'success'; }
    M.toast({ html: msg, classes: type });
}
function showLoader() {
    document.body.insertAdjacentHTML('afterbegin', "\n         <div class=\"progress\">\n            <div class=\"indeterminate\"></div>\n         </div>\n        ");
}
function removePreloader() {
    var loader = document.querySelector('.progress');
    if (loader) {
        loader.remove();
    }
}
