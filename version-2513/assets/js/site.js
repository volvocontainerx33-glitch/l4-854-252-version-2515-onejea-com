(function () {
    function $(selector, scope) {
        return (scope || document).querySelector(selector);
    }

    function $all(selector, scope) {
        return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
    }

    function text(value) {
        return (value || "").toString().trim().toLowerCase();
    }

    function setupMenu() {
        var toggle = $('[data-menu-toggle]');
        var panel = $('[data-mobile-panel]');
        if (!toggle || !panel) {
            return;
        }
        toggle.addEventListener('click', function () {
            panel.classList.toggle('is-open');
        });
    }

    function setupSearchForms() {
        $all('[data-search-form]').forEach(function (form) {
            form.addEventListener('submit', function (event) {
                var input = form.querySelector('input[name="q"]');
                if (!input || !input.value.trim()) {
                    event.preventDefault();
                }
            });
        });
    }

    function setupHero() {
        var hero = $('[data-hero]');
        if (!hero) {
            return;
        }
        var slides = $all('.hero-slide', hero);
        var dots = $all('.hero-dot', hero);
        var prev = $('[data-hero-prev]', hero);
        var next = $('[data-hero-next]', hero);
        var index = 0;
        var timer;

        function setSlide(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('is-active', i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('is-active', i === index);
            });
        }

        function startTimer() {
            clearInterval(timer);
            timer = setInterval(function () {
                setSlide(index + 1);
            }, 5200);
        }

        dots.forEach(function (dot, i) {
            dot.addEventListener('click', function () {
                setSlide(i);
                startTimer();
            });
        });
        if (prev) {
            prev.addEventListener('click', function () {
                setSlide(index - 1);
                startTimer();
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                setSlide(index + 1);
                startTimer();
            });
        }
        if (slides.length) {
            setSlide(0);
            startTimer();
        }
    }

    function setupSearchPage() {
        var page = $('[data-search-page]');
        if (!page) {
            return;
        }
        var input = $('[data-search-input]', page);
        var count = $('[data-search-count]', page);
        var noResults = $('[data-no-results]', page);
        var cards = $all('.search-card', page);
        var params = new URLSearchParams(window.location.search);
        var initial = params.get('q') || '';
        if (input) {
            input.value = initial;
        }

        function applyFilter() {
            var query = text(input ? input.value : '');
            var visible = 0;
            cards.forEach(function (card) {
                var haystack = text(card.getAttribute('data-search') || card.textContent);
                var matched = !query || haystack.indexOf(query) !== -1;
                card.style.display = matched ? '' : 'none';
                if (matched) {
                    visible += 1;
                }
            });
            if (count) {
                count.textContent = visible;
            }
            if (noResults) {
                noResults.classList.toggle('is-visible', visible === 0);
            }
        }

        if (input) {
            input.addEventListener('input', applyFilter);
        }
        applyFilter();
    }

    function setupCategoryFilter() {
        var panel = $('[data-category-filter]');
        if (!panel) {
            return;
        }
        var input = $('[data-category-query]', panel);
        var region = $('[data-category-region]', panel);
        var year = $('[data-category-year]', panel);
        var count = $('[data-category-count]');
        var cards = $all('.movie-card[data-search]');

        function applyFilter() {
            var query = text(input ? input.value : '');
            var regionValue = text(region ? region.value : '');
            var yearValue = text(year ? year.value : '');
            var visible = 0;
            cards.forEach(function (card) {
                var haystack = text(card.getAttribute('data-search') || card.textContent);
                var matched = true;
                if (query && haystack.indexOf(query) === -1) {
                    matched = false;
                }
                if (regionValue && haystack.indexOf(regionValue) === -1) {
                    matched = false;
                }
                if (yearValue && haystack.indexOf(yearValue) === -1) {
                    matched = false;
                }
                card.style.display = matched ? '' : 'none';
                if (matched) {
                    visible += 1;
                }
            });
            if (count) {
                count.textContent = visible;
            }
        }

        [input, region, year].forEach(function (control) {
            if (control) {
                control.addEventListener('input', applyFilter);
                control.addEventListener('change', applyFilter);
            }
        });
        applyFilter();
    }

    document.addEventListener('DOMContentLoaded', function () {
        setupMenu();
        setupSearchForms();
        setupHero();
        setupSearchPage();
        setupCategoryFilter();
    });
})();
