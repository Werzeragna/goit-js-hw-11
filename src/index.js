import { renderPhotoCard } from './js/render-photo-card';
import './css/styles.css';
import Notiflix from 'notiflix';
import axios from 'axios';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const slb = new SimpleLightbox('.gallery a', {
  captionType: 'attr',
  captionsData: 'alt',
  captionPosition: 'bottom',
  captionDelay: 250,
  enableKeyboard: true,
  docClose: true,
  scaleImageToRatio: true,
});

const refs = {
  searchForm: document.querySelector('.search-form'),
  inputEl: document.querySelector('input'),
  galleryEl: document.querySelector('.gallery'),
  loadMoreBtnEl: document.querySelector('.load-more'),
};

refs.searchForm.addEventListener('submit', onFormSubmit);
refs.loadMoreBtnEl.addEventListener('click', onLoadMore);

let photosPerPage = 40;
let pageNum = 1;

function fetchUrl() {
  return `https://pixabay.com/api/?key=34293251-581ef66c68ad7ebfa4511ff3d&q=${refs.inputEl.value.trim()}&image-type=photo&orientation=horizontal&safesearch=true&per_page=${photosPerPage}&page=${pageNum}`;
}

async function onFormSubmit(event) {
  event.preventDefault();
  try {
    if (refs.inputEl.value.trim() === '') {
      clearGallery();
      refs.loadMoreBtnEl.classList.add('visually-hidden');
      Notiflix.Notify.info(
        'The input of search are empty. Please, type your request!'
      );
    } else {
      const response = await axios.get(fetchUrl());

      if (response.data.totalHits === 0) {
        Notiflix.Notify.failure(
          'Sorry, there are no images matching your search query. Please try again.'
        );
        refs.loadMoreBtnEl.classList.add('visually-hidden');
        clearGallery();
      } else {
        if (pageNum === 1 && event.submitter !== refs.loadMoreBtnEl) {
          clearGallery();
          refs.galleryEl.innerHTML = renderPhotoCard(response.data.hits);
        } else {
          refs.galleryEl.insertAdjacentHTML(
            'beforeend',
            renderPhotoCard(response.data.hits)
          );
        }

        slb.refresh();

        if (response.data.totalHits > photosPerPage) {
          refs.loadMoreBtnEl.classList.remove('visually-hidden');
        }

        if (pageNum === 1) {
          Notiflix.Notify.success(
            `Hooray! We found the ${response.data.totalHits} images of ${refs.inputEl.value}`
          );
        }
        slb.refresh();

        noMorePhotos(response);
      }
    }
  } catch (error) {
    Notiflix.Notify.failure(error);
  }
}

function onLoadMore(event) {
  pageNum += 1;
  onFormSubmit(event);
}

function clearGallery() {
  refs.galleryEl.innerHTML = '';
}

function noMorePhotos(response) {
  if (response.data.totalHits / (pageNum * photosPerPage) < 1 && pageNum > 1) {
    refs.loadMoreBtnEl.classList.add('visually-hidden');
    Notiflix.Notify.info(
      "We're sorry, but you've reached the end of search results."
    );
  }
}
