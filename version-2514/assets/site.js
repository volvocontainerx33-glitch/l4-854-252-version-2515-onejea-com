(function() {
    function selectAll(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function normalize(text) {
        return (text || "").toString().trim().toLowerCase();
    }

    function initMenu() {
        var toggle = document.querySelector("[data-mobile-toggle]");
        var menu = document.querySelector("[data-mobile-menu]");
        if (!toggle || !menu) {
            return;
        }
        toggle.addEventListener("click", function() {
            menu.classList.toggle("open");
        });
    }

    function initSearchForms() {
        selectAll("[data-search-form]").forEach(function(form) {
            form.addEventListener("submit", function(event) {
                event.preventDefault();
                var input = form.querySelector("input[name='q']");
                var value = input ? input.value.trim() : "";
                var target = "search.html";
                if (value) {
                    target += "?q=" + encodeURIComponent(value);
                }
                window.location.href = target;
            });
        });
    }

    function initHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = selectAll(".hero-slide", hero);
        var dots = selectAll(".hero-dot", hero);
        var prev = hero.querySelector("[data-hero-prev]");
        var next = hero.querySelector("[data-hero-next]");
        var current = 0;
        var timer;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function(slide, i) {
                slide.classList.toggle("active", i === current);
            });
            dots.forEach(function(dot, i) {
                dot.classList.toggle("active", i === current);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function() {
                show(current + 1);
            }, 5600);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
            }
        }

        dots.forEach(function(dot, index) {
            dot.addEventListener("click", function() {
                show(index);
                start();
            });
        });
        if (prev) {
            prev.addEventListener("click", function() {
                show(current - 1);
                start();
            });
        }
        if (next) {
            next.addEventListener("click", function() {
                show(current + 1);
                start();
            });
        }
        hero.addEventListener("mouseenter", stop);
        hero.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    function initCardFilter() {
        var input = document.querySelector("[data-card-search]");
        if (!input) {
            return;
        }
        var cards = selectAll(".filter-card");
        var empty = document.querySelector("[data-empty]");
        var params = new URLSearchParams(window.location.search);
        var initial = params.get("q") || "";
        if (initial && input.hasAttribute("data-sync-query")) {
            input.value = initial;
        }

        function apply() {
            var value = normalize(input.value);
            var visible = 0;
            cards.forEach(function(card) {
                var haystack = normalize(card.getAttribute("data-search-text"));
                var matched = !value || haystack.indexOf(value) !== -1;
                card.style.display = matched ? "" : "none";
                if (matched) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.classList.toggle("show", visible === 0);
            }
        }

        input.addEventListener("input", apply);
        apply();
    }

    function initMoviePlayer(videoId, buttonId, streamUrl) {
        var video = document.getElementById(videoId);
        var button = document.getElementById(buttonId);
        if (!video || !button || !streamUrl) {
            return;
        }
        var shell = button.closest(".player-shell");
        var ready = false;
        var hlsInstance = null;

        function bind() {
            if (ready) {
                return;
            }
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = streamUrl;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(streamUrl);
                hlsInstance.attachMedia(video);
            } else {
                video.src = streamUrl;
            }
            ready = true;
        }

        function play() {
            bind();
            video.controls = true;
            if (shell) {
                shell.classList.add("is-playing");
            }
            button.hidden = true;
            var result = video.play();
            if (result && typeof result.catch === "function") {
                result.catch(function() {
                    video.controls = true;
                });
            }
        }

        button.addEventListener("click", play);
        video.addEventListener("click", function() {
            if (video.paused) {
                play();
            }
        });
        window.addEventListener("pagehide", function() {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    }

    window.initMoviePlayer = initMoviePlayer;

    document.addEventListener("DOMContentLoaded", function() {
        initMenu();
        initSearchForms();
        initHero();
        initCardFilter();
    });
})();
