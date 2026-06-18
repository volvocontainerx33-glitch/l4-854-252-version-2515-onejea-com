(function () {
    function getAll(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function toggleMobileMenu() {
        var button = document.querySelector('[data-mobile-toggle]');
        var menu = document.querySelector('[data-mobile-menu]');
        if (!button || !menu) {
            return;
        }
        button.addEventListener('click', function () {
            var isOpen = menu.classList.toggle('is-open');
            button.classList.toggle('is-open', isOpen);
            button.setAttribute('aria-expanded', String(isOpen));
        });
    }

    function setupHero() {
        var hero = document.querySelector('[data-hero]');
        if (!hero) {
            return;
        }
        var slides = getAll('[data-hero-slide]', hero);
        var dots = getAll('[data-hero-dot]', hero);
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var index = 0;
        var timer;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                var active = slideIndex === index;
                slide.classList.toggle('is-active', active);
                slide.setAttribute('aria-hidden', String(!active));
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === index);
            });
        }

        function restart() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5000);
        }

        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
                restart();
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                restart();
            });
        }
        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener('click', function () {
                show(dotIndex);
                restart();
            });
        });

        show(0);
        restart();
    }

    function normalizeText(value) {
        return String(value || '').toLowerCase().trim();
    }

    function setupFilters() {
        getAll('[data-filter-area]').forEach(function (area) {
            var input = area.querySelector('[data-filter-input]');
            var buttons = getAll('[data-filter-button]', area);
            var cards = getAll('[data-filter-card]', area);
            var empty = area.querySelector('[data-empty-state]');
            var activeFilter = 'all';

            function matchesFilter(card) {
                if (activeFilter === 'all') {
                    return true;
                }
                if (activeFilter === 'movie') {
                    return normalizeText(card.getAttribute('data-type')).indexOf('电影') !== -1;
                }
                if (activeFilter === 'series') {
                    var typeValue = normalizeText(card.getAttribute('data-type'));
                    return typeValue.indexOf('剧') !== -1 || typeValue.indexOf('tv') !== -1;
                }
                if (activeFilter === 'recent') {
                    var yearValue = parseInt(card.getAttribute('data-year-number') || '0', 10);
                    return yearValue >= 2024;
                }
                return true;
            }

            function matchesKeyword(card) {
                var keyword = normalizeText(input ? input.value : '');
                if (!keyword) {
                    return true;
                }
                var haystack = normalizeText([
                    card.getAttribute('data-title'),
                    card.getAttribute('data-region'),
                    card.getAttribute('data-genre'),
                    card.getAttribute('data-tags'),
                    card.getAttribute('data-year')
                ].join(' '));
                return haystack.indexOf(keyword) !== -1;
            }

            function apply() {
                var visible = 0;
                cards.forEach(function (card) {
                    var show = matchesFilter(card) && matchesKeyword(card);
                    card.hidden = !show;
                    if (show) {
                        visible += 1;
                    }
                });
                if (empty) {
                    empty.classList.toggle('is-visible', visible === 0);
                }
            }

            if (input) {
                input.addEventListener('input', apply);
            }
            buttons.forEach(function (button) {
                button.addEventListener('click', function () {
                    activeFilter = button.getAttribute('data-filter-button') || 'all';
                    buttons.forEach(function (item) {
                        item.classList.toggle('is-active', item === button);
                    });
                    apply();
                });
            });
            apply();
        });
    }

    window.initMoviePlayer = function (videoId, sourceUrl, overlayId) {
        var video = document.getElementById(videoId);
        var overlay = document.getElementById(overlayId);
        var loaded = false;
        var hlsInstance = null;

        if (!video || !sourceUrl) {
            return;
        }

        function attachSource() {
            if (loaded) {
                return;
            }
            loaded = true;
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = sourceUrl;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(sourceUrl);
                hlsInstance.attachMedia(video);
            } else {
                video.src = sourceUrl;
            }
        }

        function playVideo() {
            attachSource();
            if (overlay) {
                overlay.classList.add('is-hidden');
            }
            video.controls = true;
            var action = video.play();
            if (action && typeof action.catch === 'function') {
                action.catch(function () {});
            }
        }

        if (overlay) {
            overlay.addEventListener('click', playVideo);
        }
        video.addEventListener('click', function () {
            if (video.paused) {
                playVideo();
            }
        });
        video.addEventListener('play', function () {
            if (overlay) {
                overlay.classList.add('is-hidden');
            }
        });
        window.addEventListener('beforeunload', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    };

    document.addEventListener('DOMContentLoaded', function () {
        toggleMobileMenu();
        setupHero();
        setupFilters();
    });
}());
