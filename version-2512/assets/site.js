(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
        } else {
            document.addEventListener("DOMContentLoaded", fn);
        }
    }

    ready(function () {
        var toggle = document.querySelector("[data-mobile-toggle]");
        var menu = document.querySelector("[data-mobile-menu]");
        if (toggle && menu) {
            toggle.addEventListener("click", function () {
                menu.classList.toggle("open");
            });
        }

        var hero = document.querySelector("[data-hero]");
        if (hero) {
            var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
            var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
            var next = hero.querySelector("[data-hero-next]");
            var prev = hero.querySelector("[data-hero-prev]");
            var index = 0;
            var timer = null;

            function show(i) {
                if (!slides.length) {
                    return;
                }
                index = (i + slides.length) % slides.length;
                slides.forEach(function (slide, n) {
                    slide.classList.toggle("active", n === index);
                });
                dots.forEach(function (dot, n) {
                    dot.classList.toggle("active", n === index);
                });
            }

            function start() {
                stop();
                timer = window.setInterval(function () {
                    show(index + 1);
                }, 5000);
            }

            function stop() {
                if (timer) {
                    window.clearInterval(timer);
                    timer = null;
                }
            }

            if (next) {
                next.addEventListener("click", function () {
                    show(index + 1);
                    start();
                });
            }

            if (prev) {
                prev.addEventListener("click", function () {
                    show(index - 1);
                    start();
                });
            }

            dots.forEach(function (dot) {
                dot.addEventListener("click", function () {
                    show(Number(dot.getAttribute("data-hero-dot")) || 0);
                    start();
                });
            });

            hero.addEventListener("mouseenter", stop);
            hero.addEventListener("mouseleave", start);
            show(0);
            start();
        }

        var panels = Array.prototype.slice.call(document.querySelectorAll(".catalog-panel"));
        panels.forEach(function (panel) {
            var input = panel.querySelector("[data-search-input]");
            var typeFilter = panel.querySelector("[data-type-filter]");
            var yearFilter = panel.querySelector("[data-year-filter]");
            var regionFilter = panel.querySelector("[data-region-filter]");
            var scope = panel.parentElement || document;
            var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-card]"));
            var empty = panel.querySelector("[data-empty-state]");

            function filterCards() {
                var query = input ? input.value.trim().toLowerCase() : "";
                var type = typeFilter ? typeFilter.value : "";
                var year = yearFilter ? yearFilter.value : "";
                var region = regionFilter ? regionFilter.value : "";
                var visible = 0;

                cards.forEach(function (card) {
                    var text = card.getAttribute("data-search") || "";
                    var matchQuery = !query || text.indexOf(query) !== -1;
                    var matchType = !type || card.getAttribute("data-type") === type;
                    var matchYear = !year || card.getAttribute("data-year") === year;
                    var matchRegion = !region || card.getAttribute("data-region") === region;
                    var ok = matchQuery && matchType && matchYear && matchRegion;
                    card.classList.toggle("hidden", !ok);
                    if (ok) {
                        visible += 1;
                    }
                });

                if (empty) {
                    empty.classList.toggle("show", visible === 0);
                }
            }

            [input, typeFilter, yearFilter, regionFilter].forEach(function (control) {
                if (control) {
                    control.addEventListener("input", filterCards);
                    control.addEventListener("change", filterCards);
                }
            });
        });
    });
})();
