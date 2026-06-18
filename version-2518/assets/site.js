const ready = (callback) => {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', callback);
  } else {
    callback();
  }
};

const goSearch = (form) => {
  const input = form.querySelector('input[name="q"]');
  const value = input ? input.value.trim() : '';
  if (!value) {
    return false;
  }
  window.location.href = `./search.html?q=${encodeURIComponent(value)}`;
  return true;
};

const setupNavigation = () => {
  const toggle = document.querySelector('[data-mobile-toggle]');
  const panel = document.querySelector('[data-mobile-panel]');
  if (toggle && panel) {
    toggle.addEventListener('click', () => {
      panel.classList.toggle('is-open');
    });
  }

  document.querySelectorAll('[data-search-form]').forEach((form) => {
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      goSearch(form);
    });
  });
};

const setupHero = () => {
  const hero = document.querySelector('[data-hero]');
  if (!hero) {
    return;
  }
  const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
  const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
  const prev = hero.querySelector('[data-hero-prev]');
  const next = hero.querySelector('[data-hero-next]');
  if (!slides.length) {
    return;
  }
  let index = 0;
  let timer = null;

  const show = (nextIndex) => {
    index = (nextIndex + slides.length) % slides.length;
    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle('is-active', slideIndex === index);
    });
    dots.forEach((dot, dotIndex) => {
      dot.classList.toggle('is-active', dotIndex === index);
    });
  };

  const start = () => {
    timer = window.setInterval(() => show(index + 1), 5200);
  };

  const restart = () => {
    if (timer) {
      window.clearInterval(timer);
    }
    start();
  };

  prev && prev.addEventListener('click', () => {
    show(index - 1);
    restart();
  });

  next && next.addEventListener('click', () => {
    show(index + 1);
    restart();
  });

  dots.forEach((dot, dotIndex) => {
    dot.addEventListener('click', () => {
      show(dotIndex);
      restart();
    });
  });

  start();
};

const textOf = (element, name) => (element.dataset[name] || '').toLowerCase();

const setupCategoryTools = () => {
  document.querySelectorAll('[data-filter-bar]').forEach((bar) => {
    const section = bar.closest('section');
    const list = section ? section.querySelector('[data-card-list]') : null;
    if (!list) {
      return;
    }
    const input = bar.querySelector('[data-filter-input]');
    const select = bar.querySelector('[data-sort-select]');
    const buttons = Array.from(bar.querySelectorAll('[data-view-button]'));
    const cards = Array.from(list.querySelectorAll('.movie-card'));

    const applyFilter = () => {
      const value = input ? input.value.trim().toLowerCase() : '';
      cards.forEach((card) => {
        const haystack = textOf(card, 'haystack');
        card.hidden = value && !haystack.includes(value);
      });
    };

    const applySort = () => {
      const mode = select ? select.value : 'default';
      const sorted = cards.slice().sort((a, b) => {
        if (mode === 'score') {
          return Number(b.dataset.score || 0) - Number(a.dataset.score || 0);
        }
        if (mode === 'year') {
          return Number(b.dataset.year || 0) - Number(a.dataset.year || 0);
        }
        if (mode === 'title') {
          return (a.dataset.title || '').localeCompare(b.dataset.title || '', 'zh-CN');
        }
        return cards.indexOf(a) - cards.indexOf(b);
      });
      sorted.forEach((card) => list.appendChild(card));
    };

    input && input.addEventListener('input', applyFilter);
    select && select.addEventListener('change', () => {
      applySort();
      applyFilter();
    });

    buttons.forEach((button) => {
      button.addEventListener('click', () => {
        buttons.forEach((item) => item.classList.remove('is-active'));
        button.classList.add('is-active');
        list.classList.toggle('is-list', button.dataset.viewButton === 'list');
      });
    });
  });
};

const cardTemplate = (item) => `
<a class="movie-card" href="${item.url}" data-title="${item.title}" data-year="${item.year}" data-score="${item.score}" data-haystack="${item.haystack}">
  <span class="poster-frame">
    <img src="${item.cover}" alt="${item.title}" loading="lazy">
    <span class="poster-shade"></span>
    <span class="type-badge">${item.type}</span>
    <span class="year-badge">${item.year}</span>
    <span class="play-hover">▶</span>
  </span>
  <span class="movie-info">
    <strong>${item.title}</strong>
    <em>${item.region} · ${item.genre}</em>
    <span class="card-desc">${item.desc}</span>
    <span class="card-meta"><i>★ ${item.score}</i><i>${item.heat}</i></span>
  </span>
</a>`;

const setupSearchPage = () => {
  const container = document.getElementById('search-results');
  if (!container || !window.SEARCH_INDEX) {
    return;
  }
  const params = new URLSearchParams(window.location.search);
  const query = (params.get('q') || '').trim();
  const title = document.querySelector('[data-search-title]');
  const forms = document.querySelectorAll('.search-page-form input[name="q"], .header-search input[name="q"], .mobile-search input[name="q"]');
  forms.forEach((input) => {
    input.value = query;
  });
  if (!query) {
    return;
  }
  const lower = query.toLowerCase();
  const results = window.SEARCH_INDEX.filter((item) => item.haystack.toLowerCase().includes(lower)).slice(0, 120);
  if (title) {
    title.textContent = results.length ? `“${query}”相关内容` : `未找到“${query}”`;
  }
  container.innerHTML = results.length ? results.map(cardTemplate).join('') : '<p class="empty-text">没有匹配内容，请尝试其他关键词。</p>';
};

export function initPlayer(options) {
  const video = document.getElementById(options.videoId);
  const button = document.getElementById(options.buttonId);
  const overlay = document.getElementById(options.overlayId);
  if (!video) {
    return;
  }

  let prepared = false;
  let hls = null;

  const attach = () => {
    if (prepared) {
      return;
    }
    prepared = true;
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = options.url;
    } else if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
      hls.loadSource(options.url);
      hls.attachMedia(video);
    } else {
      video.src = options.url;
    }
  };

  const play = () => {
    attach();
    if (overlay) {
      overlay.classList.add('is-hidden');
    }
    const request = video.play();
    if (request && typeof request.catch === 'function') {
      request.catch(() => {});
    }
  };

  if (button) {
    button.addEventListener('click', (event) => {
      event.stopPropagation();
      play();
    });
  }
  if (overlay) {
    overlay.addEventListener('click', play);
  }
  video.addEventListener('click', () => {
    if (video.paused) {
      play();
    }
  });
  window.addEventListener('pagehide', () => {
    if (hls) {
      hls.destroy();
      hls = null;
    }
  });
}

ready(() => {
  setupNavigation();
  setupHero();
  setupCategoryTools();
  setupSearchPage();
});
