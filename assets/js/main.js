(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  function initMobileNav() {
    var toggle = document.querySelector("[data-mobile-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener("click", function () {
      panel.classList.toggle("is-open");
    });
  }

  function initHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var current = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        start();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(current - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(current + 1);
        start();
      });
    }

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function normalize(value) {
    return (value || "").toString().trim().toLowerCase();
  }

  function initFilters() {
    var toolbar = document.querySelector("[data-filter-toolbar]");
    var scope = document.querySelector("[data-filterable]");
    if (!toolbar || !scope) {
      return;
    }
    var search = toolbar.querySelector("[data-page-search]");
    var typeFilter = toolbar.querySelector("[data-type-filter]");
    var categoryFilter = toolbar.querySelector("[data-category-filter]");
    var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-movie-card]"));
    var params = new URLSearchParams(window.location.search);
    var initial = params.get("q");

    if (search && initial) {
      search.value = initial;
    }

    function apply() {
      var keyword = normalize(search ? search.value : "");
      var typeValue = normalize(typeFilter ? typeFilter.value : "");
      var categoryValue = normalize(categoryFilter ? categoryFilter.value : "");

      cards.forEach(function (card) {
        var title = normalize(card.getAttribute("data-title"));
        var tags = normalize(card.getAttribute("data-tags"));
        var type = normalize(card.getAttribute("data-type"));
        var category = normalize(card.getAttribute("data-category"));
        var matchedKeyword = !keyword || title.indexOf(keyword) > -1 || tags.indexOf(keyword) > -1 || category.indexOf(keyword) > -1 || type.indexOf(keyword) > -1;
        var matchedType = !typeValue || type === typeValue;
        var matchedCategory = !categoryValue || category === categoryValue;
        card.classList.toggle("is-hidden", !(matchedKeyword && matchedType && matchedCategory));
      });
    }

    if (search) {
      search.addEventListener("input", apply);
    }
    if (typeFilter) {
      typeFilter.addEventListener("change", apply);
    }
    if (categoryFilter) {
      categoryFilter.addEventListener("change", apply);
    }
    apply();
  }

  function attachStream(video, stream) {
    if (video.getAttribute("data-attached") === "1") {
      return;
    }
    video.setAttribute("data-attached", "1");

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = stream;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: false,
        backBufferLength: 90
      });
      hls.loadSource(stream);
      hls.attachMedia(video);
      video._hls = hls;
      return;
    }

    video.src = stream;
  }

  function initPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));
    players.forEach(function (player) {
      var video = player.querySelector("video[data-stream]");
      var overlay = player.querySelector(".player-overlay");
      if (!video) {
        return;
      }
      var stream = video.getAttribute("data-stream");

      function play() {
        if (!stream) {
          return;
        }
        attachStream(video, stream);
        video.controls = true;
        if (overlay) {
          overlay.classList.add("is-hidden");
        }
        var promise = video.play();
        if (promise && typeof promise.catch === "function") {
          promise.catch(function () {});
        }
      }

      if (overlay) {
        overlay.addEventListener("click", play);
      }
      video.addEventListener("click", function () {
        if (video.paused) {
          play();
        }
      });
    });
  }

  ready(function () {
    initMobileNav();
    initHero();
    initFilters();
    initPlayers();
  });
})();
