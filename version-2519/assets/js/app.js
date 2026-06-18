(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function normalize(value) {
    return (value || "").toString().trim().toLowerCase();
  }

  ready(function () {
    var navToggle = document.querySelector("[data-nav-toggle]");
    var nav = document.querySelector("[data-nav]");
    var quickSearch = document.querySelector(".quick-search");

    if (navToggle && nav) {
      navToggle.addEventListener("click", function () {
        nav.classList.toggle("is-open");
        if (quickSearch) {
          quickSearch.classList.toggle("is-open");
        }
      });
    }

    document.querySelectorAll("img[data-fallback]").forEach(function (img) {
      img.addEventListener("error", function () {
        img.classList.add("is-missing");
        img.removeAttribute("src");
      });
    });

    setupHero();
    setupFilters();
    setupPlayers();
  });

  function setupHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }

    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var index = 0;
    var timer = null;

    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.setAttribute("aria-pressed", i === index ? "true" : "false");
      });
    }

    function start() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
        start();
      });
    });

    if (slides.length > 1) {
      start();
    }
  }

  function setupFilters() {
    document.querySelectorAll("[data-filter-scope]").forEach(function (scope) {
      var input = scope.querySelector("[data-filter-input]");
      var year = scope.querySelector("[data-filter-year]");
      var type = scope.querySelector("[data-filter-type]");
      var category = scope.querySelector("[data-filter-category]");
      var list = document.querySelector("[data-filter-list]");
      var empty = document.querySelector("[data-empty-state]");
      var params = new URLSearchParams(window.location.search);

      if (input && params.get("q")) {
        input.value = params.get("q");
      }

      function apply() {
        var query = normalize(input && input.value);
        var selectedYear = normalize(year && year.value);
        var selectedType = normalize(type && type.value);
        var selectedCategory = normalize(category && category.value);
        var visible = 0;

        if (!list) {
          return;
        }

        list.querySelectorAll("[data-filter-item]").forEach(function (item) {
          var haystack = normalize([
            item.getAttribute("data-title"),
            item.getAttribute("data-year"),
            item.getAttribute("data-type"),
            item.getAttribute("data-region"),
            item.getAttribute("data-genre"),
            item.getAttribute("data-tags"),
            item.textContent
          ].join(" "));
          var ok = true;

          if (query && haystack.indexOf(query) === -1) {
            ok = false;
          }
          if (selectedYear && normalize(item.getAttribute("data-year")) !== selectedYear) {
            ok = false;
          }
          if (selectedType && normalize(item.getAttribute("data-type")) !== selectedType) {
            ok = false;
          }
          if (selectedCategory && haystack.indexOf(selectedCategory) === -1) {
            ok = false;
          }

          item.classList.toggle("is-hidden", !ok);
          if (ok) {
            visible += 1;
          }
        });

        if (empty) {
          empty.hidden = visible !== 0;
        }
      }

      [input, year, type, category].forEach(function (control) {
        if (control) {
          control.addEventListener("input", apply);
          control.addEventListener("change", apply);
        }
      });

      apply();
    });
  }

  function setupPlayers() {
    document.querySelectorAll(".video-shell").forEach(function (shell) {
      var video = shell.querySelector("video");
      var button = shell.querySelector(".play-overlay");

      if (!video || !button) {
        return;
      }

      function loadAndPlay() {
        var hlsUrl = video.getAttribute("data-hls");
        var mp4Url = video.getAttribute("data-mp4");

        if (!video.dataset.loaded) {
          if (window.Hls && window.Hls.isSupported && window.Hls.isSupported() && hlsUrl && window.location.protocol !== "file:") {
            var hls = new window.Hls({
              enableWorker: true,
              lowLatencyMode: true
            });
            hls.loadSource(hlsUrl);
            hls.attachMedia(video);
            hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
              video.play().catch(function () {});
            });
            video._hls = hls;
          } else if (hlsUrl && video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = hlsUrl;
          } else if (mp4Url) {
            video.src = mp4Url;
          }
          video.dataset.loaded = "true";
        }

        shell.classList.add("is-playing");
        video.play().catch(function () {});
      }

      button.addEventListener("click", loadAndPlay);
      video.addEventListener("play", function () {
        shell.classList.add("is-playing");
      });
      video.addEventListener("pause", function () {
        if (video.currentTime === 0 || video.ended) {
          shell.classList.remove("is-playing");
        }
      });
    });
  }
})();
