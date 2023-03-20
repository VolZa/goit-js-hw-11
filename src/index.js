import axios from 'axios';
import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

//елементи html розмітки
const refs = {
  formEl: document.querySelector('.search-form'),
  inputEl: document.querySelector('input'),
  galleryEl: document.querySelector('.gallery'),
  btnLoadMoreEl: document.querySelector('.load-more'),
};

let page = 1; // початкове значення page = 1 

refs.btnLoadMoreEl.style.display = 'none'; // кнопка невидима
refs.formEl.addEventListener('submit', onSearch); // слухаю форму пошуку 

refs.btnLoadMoreEl.addEventListener('click', onBtnLoadMore); // слухаю клік по кнопці loadMore

function onSearch(evt) {
  evt.preventDefault(); // відміна дефолтної поведінки браузера
  refs.galleryEl.innerHTML = ''; // очищення попереднього вмісту галереї
  const inputName = refs.inputEl.value.trim(); // обрізання зовнішніх пробілів

    if (inputName !== '') { //рядок пошуку НЕ порожній:
    pixabay(inputName); // отримати зображення

  } else {
    refs.btnLoadMoreEl.style.display = 'none';

    // Message by Notiflix:  НЕ знайдено жодного зображення
    return Notiflix.Notify.failure(
      'Sorry, there are no images matching your search query. Please try again.'
    );
  }
}

// дії кнопки LoadMore
function onBtnLoadMore() {
  const inputName = refs.inputEl.value.trim();
  page += 1; // додаємо +1 сторінку яка має +40 картинок
  pixabay(inputName, page); // завантаження зображень
}

// отримання зображень
async function pixabay(name, page) {
  const API_URL = 'https://pixabay.com/api/';

  // параметри запиту на бекенд
  const options = {
    params: {
      key: '34570673-a928ca7849cd54fe4c6ccdb59', // мій ключ з https://pixabay.com/api/docs/
      q: name,
      image_type: 'photo',
      orientation: 'horizontal',
      safesearch: 'true',
      page: page,
      per_page: 40,
    },
  };

  try {
    // отримання відповіді-результату від бекенду
    const response = await axios.get(API_URL, options);

    // сповіщення notiflix
    notification(
      response.data.hits.length, // довжина всіх знайдених зображень
      response.data.total // отримання кількості
    );

    createMarkup(response.data); // рендер розмітки на сторінку
  } catch (error) {
    console.log(error);
  }
}

//створення html розмітки
function createMarkup(arr) {
  const markup = arr.hits
    .map(
      item =>
        `<a class="photo-link" href="${item.largeImageURL}">
            <div class="photo-card">
            <div class="photo">
            <img src="${item.webformatURL}" alt="${item.tags}" loading="lazy"/>
            </div>
                    <div class="info">
                        <p class="info-item">
                            <b>Likes</b>
                            ${item.likes}
                        </p>
                        <p class="info-item">
                            <b>Views</b>
                            ${item.views}
                        </p>
                        <p class="info-item">
                            <b>Comments</b>
                            ${item.comments}
                        </p>
                        <p class="info-item">
                            <b>Downloads</b>
                            ${item.downloads}
                        </p>
                    </div>
            </div>
        </a>`
    )
    .join(''); // сполучення рядків всіх об'єктів (всіх картинок)
  refs.galleryEl.insertAdjacentHTML('beforeend', markup); // вставка розмітки в html
  simpleLightBox.refresh(); // оновлення слайдера-зображень
}

//модалка слайдера-зображень
const simpleLightBox = new SimpleLightbox('.gallery a', {
  captionsData: 'alt', 
  captionDelay: 250, 
});

//сповіщення notiflix
function notification(length, totalHits) {
  if (length === 0) {

      // НЕ знайдено жодного зображення
    Notiflix.Notify.failure(
      'Sorry, there are no images matching your search query. Please try again.'
    );
    return;
  }

  if (page === 1) {
    refs.btnLoadMoreEl.style.display = 'flex'; //кнопка loadMore видима

    //кількість знайдених зобрежнь
    Notiflix.Notify.success(`Hooray! We found ${totalHits} images.`);
  }

  if (length < 40) {
    refs.btnLoadMoreEl.style.display = 'none'; // ховаємо кнопку loadMore

      //виведено всі наявні зображення
      Notiflix.Notify.info(
      "We're sorry, but you've reached the end of search results."
    );
  }
}