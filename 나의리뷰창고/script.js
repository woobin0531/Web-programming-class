document.addEventListener('DOMContentLoaded', function () {
  const posters = document.querySelectorAll('.poster');
  posters.forEach(poster => setPosterClickEvent(poster));
  updateAllRatings();
  loadUserReviews();
});

function loadUserReviews() {
  if (localStorage.getItem('userReviews')) {
    const userReviews = JSON.parse(localStorage.getItem('userReviews'));
    userReviews.forEach(reviewData => {
      createPosterFromData(reviewData);
    });
  }
}

function saveUserReviews() {
  const userPosters = document.querySelectorAll('.poster.user-added');
  const reviewsData = [];
  userPosters.forEach(poster => {
    const reviewData = {
      title: poster.dataset.title,
      year: poster.dataset.year,
      review: poster.dataset.review,
      ost: poster.dataset.ost,
      rating: poster.dataset.rating,
      imageSrc: poster.querySelector('img').src
    };
    reviewsData.push(reviewData);
  });
  localStorage.setItem('userReviews', JSON.stringify(reviewsData));
}

function createPosterFromData(reviewData) {
  const newPoster = document.createElement('div');
  newPoster.className = 'poster user-added';
  newPoster.dataset.title = reviewData.title;
  newPoster.dataset.review = reviewData.review;
  newPoster.dataset.year = reviewData.year;
  newPoster.dataset.ost = reviewData.ost;
  newPoster.dataset.rating = reviewData.rating;
  newPoster.innerHTML = `
    <img src="${reviewData.imageSrc}" alt="${reviewData.title} 포스터">
    <div class="rating-view" data-rating="${reviewData.rating}"></div>
  `;
  const delBtn = document.createElement('button');
  delBtn.textContent = '삭제';
  delBtn.className = 'control-btn';
  delBtn.style.marginTop = '8px';
  delBtn.onclick = function () {
    newPoster.remove();
    document.getElementById('movie-info').style.display = 'none';
    saveUserReviews();
  };
  newPoster.appendChild(delBtn);
  setPosterClickEvent(newPoster);
  document.getElementById('gallery').appendChild(newPoster);
  updateRatingView(newPoster);
}

function setPosterClickEvent(poster) {
  const infoSection = document.getElementById('movie-info');
  const title = document.getElementById('info-title');
  const year = document.getElementById('info-year');
  const review = document.getElementById('info-review');
  const ost = document.getElementById('info-ost');
  const audioPlayer = document.getElementById('audio-player');
  const rating = document.getElementById('info-rating');
  poster.addEventListener('click', () => {
    title.textContent = poster.dataset.title;
    year.textContent = poster.dataset.year;
    review.textContent = poster.dataset.review;
    ost.href = poster.dataset.ost;
    ost.textContent = '링크 열기';
    rating.textContent = poster.dataset.rating ? '★'.repeat(poster.dataset.rating) : '-';
    if (poster.dataset.ost && !poster.dataset.ost.includes('youtube.com')) {
      audioPlayer.src = poster.dataset.ost;
      audioPlayer.style.display = 'block';
      audioPlayer.play();
    } else {
      audioPlayer.pause();
      audioPlayer.style.display = 'none';
    }
    infoSection.classList.remove('hidden');
    infoSection.style.display = 'block';
  });
}

function openUploadModal() {
  document.getElementById('upload-modal').classList.remove('hidden');
}

function closeUploadModal() {
  document.getElementById('upload-modal').classList.add('hidden');
}

function uploadPoster() {
  const fileInput = document.getElementById('upload-img');
  const title = document.getElementById('custom-title').value.trim();
  const review = document.getElementById('custom-review').value.trim();
  const year = document.getElementById('custom-year').value.trim();
  const ost = document.getElementById('custom-ost').value.trim();
  const rating = document.querySelector('input[name="custom-rating"]:checked')?.value;
  if (!fileInput.files[0]) return alert('이미지 파일을 업로드해주세요.');
  if (!title || !review || !year) return alert('제목, 리뷰, 연도는 필수 항목입니다.');
  if (!rating) return alert('별점을 선택해주세요.');
  const reader = new FileReader();
  reader.onload = function (e) {
    const reviewData = {
      title,
      year,
      review,
      ost,
      rating,
      imageSrc: e.target.result
    };
    createPosterFromData(reviewData);
    saveUserReviews();
    closeUploadModal();
  };
  reader.readAsDataURL(fileInput.files[0]);
  document.getElementById('upload-img').value = '';
  document.getElementById('custom-title').value = '';
  document.getElementById('custom-review').value = '';
  document.getElementById('custom-year').value = '';
  document.getElementById('custom-ost').value = '';
  document.querySelectorAll('input[name="custom-rating"]').forEach(r => r.checked = false);
}

function sortPosters(type) {
  const gallery = document.getElementById('gallery');
  const posters = Array.from(gallery.querySelectorAll('.poster'));
  posters.sort((a, b) => {
    if (type === 'title') {
      return a.dataset.title.localeCompare(b.dataset.title);
    } else if (type === 'year') {
      return parseInt(a.dataset.year) - parseInt(b.dataset.year);
    } else if (type === 'rating') {
      return parseInt(b.dataset.rating || 0) - parseInt(a.dataset.rating || 0);
    }
    return 0;
  });
  posters.forEach(p => gallery.appendChild(p));
}

function updateAllRatings() {
  document.querySelectorAll('.poster').forEach(updateRatingView);
}

function updateRatingView(poster) {
  const ratingDiv = poster.querySelector('.rating-view');
  if (ratingDiv) {
    const rating = poster.dataset.rating || 0;
    ratingDiv.textContent = '★'.repeat(rating) + '☆'.repeat(5 - rating);
  }
}
