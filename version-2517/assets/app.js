(function () {
  var menu = document.querySelector('.menu-toggle');
  var panel = document.querySelector('.mobile-panel');
  if (menu && panel) {
    menu.addEventListener('click', function () {
      panel.classList.toggle('open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dots button'));
  if (slides.length > 1) {
    var current = 0;
    var show = function (index) {
      slides[current].classList.remove('active');
      if (dots[current]) {
        dots[current].classList.remove('active');
      }
      current = index;
      slides[current].classList.add('active');
      if (dots[current]) {
        dots[current].classList.add('active');
      }
    };
    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        show(index);
      });
    });
    setInterval(function () {
      show((current + 1) % slides.length);
    }, 5200);
  }

  var filterForm = document.querySelector('[data-filter-form]');
  if (filterForm) {
    var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card'));
    var empty = document.querySelector('.empty-state');
    var apply = function () {
      var keyword = (filterForm.querySelector('[name="q"]') || {}).value || '';
      var region = (filterForm.querySelector('[name="region"]') || {}).value || '';
      var type = (filterForm.querySelector('[name="type"]') || {}).value || '';
      var year = (filterForm.querySelector('[name="year"]') || {}).value || '';
      keyword = keyword.trim().toLowerCase();
      var shown = 0;
      cards.forEach(function (card) {
        var hay = [card.dataset.title, card.dataset.region, card.dataset.type, card.dataset.year, card.dataset.genre, card.dataset.tags].join(' ').toLowerCase();
        var ok = true;
        if (keyword && hay.indexOf(keyword) === -1) {
          ok = false;
        }
        if (region && card.dataset.region !== region) {
          ok = false;
        }
        if (type && card.dataset.type !== type) {
          ok = false;
        }
        if (year && card.dataset.year !== year) {
          ok = false;
        }
        card.style.display = ok ? '' : 'none';
        if (ok) {
          shown += 1;
        }
      });
      if (empty) {
        empty.style.display = shown ? 'none' : 'block';
      }
    };
    filterForm.addEventListener('input', apply);
    filterForm.addEventListener('submit', function (event) {
      event.preventDefault();
      apply();
    });
    var params = new URLSearchParams(location.search);
    if (params.get('q') && filterForm.querySelector('[name="q"]')) {
      filterForm.querySelector('[name="q"]').value = params.get('q');
    }
    apply();
  }
})();

function initPlayer(source) {
  var video = document.getElementById('movie-video');
  var overlay = document.getElementById('player-overlay');
  if (!video || !overlay || !source) {
    return;
  }
  var started = false;
  var start = function () {
    if (started) {
      video.play();
      return;
    }
    started = true;
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      video.addEventListener('loadedmetadata', function () {
        video.play();
      }, { once: true });
    } else if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls();
      hls.loadSource(source);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
        video.play();
      });
    } else {
      video.src = source;
      video.play();
    }
    overlay.classList.add('hidden');
    video.setAttribute('controls', 'controls');
  };
  overlay.addEventListener('click', start);
}
