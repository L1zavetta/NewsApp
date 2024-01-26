// Custom Http Module
function customHttp() {
    return {
        get(url: string, cb: (error: Error | null, response: any) => void) {
            try {
                const xhr = new XMLHttpRequest();
                xhr.open('GET', url);
                xhr.addEventListener('load', () => {
                    if (Math.floor(xhr.status / 100) !== 2) {
                        cb(new Error(`Error. Status code: ${xhr.status}`), xhr);
                        return;
                    }
                    const response = JSON.parse(xhr.responseText);
                    cb(null, response);
                });

                xhr.addEventListener('error', () => {
                    cb(new Error(`Error. Status code: ${xhr.status}`), xhr);
                });

                xhr.send();
            } catch (error) {
                cb(error, null);
            }
        },
    };
}
// Init http module
const http = customHttp();

const newsService = (function () {
    const apiKey: string = 'ada52d8f21bc40a9baa08e4521ba492a';
    const apiUrl: string = 'https://newsapi.org/v2';

    return {
        topHeadlines(country = 'us', category: string, cb: (error: Error | null, response: any) => void) {
            http.get(`${apiUrl}/top-headlines?country=${country}&category=${category}&apiKey=${apiKey}`, cb);
        },
        everything(query: string, cb: (err: Error | null, response: any) => void) {
            http.get(`${apiUrl}/everything?q=${query}&apiKey=${apiKey}`, cb)
        },
    };
})();

const form = document.forms['newsControls'];
const countrySelect = form.elements['country'];
const categorySelect = form.elements['category'];
const searchInput = form.elements['search'];

form.addEventListener('submit', e => {
    e.preventDefault();
    loadNews();
})

//  init selects
document.addEventListener('DOMContentLoaded', function() {
    M.AutoInit();
    loadNews();
});

function loadNews() {
    showLoader();
    const country = countrySelect.value;
    const category = categorySelect.value;
    const searchText = searchInput.value;

    if (!searchText) {
        newsService.topHeadlines(country, category, onGetResponse);
    } else {
        newsService.everything(searchText, onGetResponse);
    }
}

function onGetResponse(err: Error | null, res: any) {
    removePreloader();

    if (err) {
        showAlert(err.message, 'error-msg');
        return;
    }

    if (!res.articles.length) {
        showAlert('There is no news');
        return;
    }
    renderNews(res.articles);
}

function renderNews(news: any[]) {
    const newsContainer = document.querySelector('.news-container .row') as HTMLDivElement;
    if (newsContainer.children.length) {
        clearContainer(newsContainer)
    }
    let fragment = '';

    news.forEach(newsItem => {
        const el = newsTemplate(newsItem);
        fragment += el;
    });

    newsContainer.insertAdjacentHTML('afterbegin', fragment)
}

function clearContainer(container: HTMLDivElement) {
    let child = container.lastElementChild;
    while (child) {
        container.removeChild(child);
        child = container.lastElementChild;
    }
}

function newsTemplate({urlToImage, title, url, description}) {
    return `
        <div class="col s12">
            <div class="card large">
                <div class="card-image">
                    <img src="${urlToImage || 'news.webp'}">
                    <span class="card-title col s12">${title || ''}</span>
                </div>
                <div class="card-content">
                    <p>${description || ''}</p>
                </div>
                <div class="card-action">
                    <a href="${url}">Read more</a>
                </div>
            </div>
        </div>
     `;
}

function showAlert(msg: string, type = 'success') {
    M.toast({html: msg, classes: type});
}

function showLoader() {
    document.body.insertAdjacentHTML(
        'afterbegin',
        `
         <div class="progress">
            <div class="indeterminate"></div>
         </div>
        `,
    );
}

function removePreloader() {
    const loader = document.querySelector('.progress');
    if (loader) {
        loader.remove();
    }
}
