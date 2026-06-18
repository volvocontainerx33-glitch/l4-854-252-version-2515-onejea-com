(function () {
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    ready(function () {
        var menuButton = document.querySelector('.mobile-menu-button');
        var mobilePanel = document.querySelector('.mobile-panel');

        if (menuButton && mobilePanel) {
            menuButton.addEventListener('click', function () {
                var isOpen = mobilePanel.classList.toggle('is-open');
                menuButton.setAttribute('aria-expanded', String(isOpen));
            });
        }

        document.querySelectorAll('[data-hero]').forEach(function (hero) {
            var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
            var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
            var prev = hero.querySelector('[data-hero-prev]');
            var next = hero.querySelector('[data-hero-next]');
            var index = 0;
            var timer = null;

            function show(nextIndex) {
                if (!slides.length) {
                    return;
                }

                index = (nextIndex + slides.length) % slides.length;

                slides.forEach(function (slide, slideIndex) {
                    slide.classList.toggle('is-active', slideIndex === index);
                });

                dots.forEach(function (dot, dotIndex) {
                    dot.classList.toggle('is-active', dotIndex === index);
                });
            }

            function move(step) {
                show(index + step);
            }

            function start() {
                stop();
                timer = window.setInterval(function () {
                    move(1);
                }, 5000);
            }

            function stop() {
                if (timer) {
                    window.clearInterval(timer);
                    timer = null;
                }
            }

            if (prev) {
                prev.addEventListener('click', function () {
                    move(-1);
                    start();
                });
            }

            if (next) {
                next.addEventListener('click', function () {
                    move(1);
                    start();
                });
            }

            dots.forEach(function (dot, dotIndex) {
                dot.addEventListener('click', function () {
                    show(dotIndex);
                    start();
                });
            });

            hero.addEventListener('mouseenter', stop);
            hero.addEventListener('mouseleave', start);
            show(0);
            start();
        });

        document.querySelectorAll('[data-catalog]').forEach(function (catalog) {
            var searchInput = catalog.querySelector('[data-filter-search]');
            var yearSelect = catalog.querySelector('[data-filter-year]');
            var regionSelect = catalog.querySelector('[data-filter-region]');
            var typeSelect = catalog.querySelector('[data-filter-type]');
            var cards = Array.prototype.slice.call(catalog.querySelectorAll('.catalog-card'));
            var empty = catalog.querySelector('[data-empty]');

            function selected(select) {
                return select ? select.value.trim() : '';
            }

            function applyFilter() {
                var query = searchInput ? searchInput.value.trim().toLowerCase() : '';
                var year = selected(yearSelect);
                var region = selected(regionSelect);
                var type = selected(typeSelect);
                var visibleCount = 0;

                cards.forEach(function (card) {
                    var text = [
                        card.getAttribute('data-title') || '',
                        card.getAttribute('data-tags') || '',
                        card.getAttribute('data-region') || '',
                        card.getAttribute('data-type') || '',
                        card.getAttribute('data-year') || ''
                    ].join(' ').toLowerCase();
                    var matchesQuery = !query || text.indexOf(query) !== -1;
                    var matchesYear = !year || card.getAttribute('data-year') === year;
                    var matchesRegion = !region || card.getAttribute('data-region') === region;
                    var matchesType = !type || card.getAttribute('data-type') === type;
                    var visible = matchesQuery && matchesYear && matchesRegion && matchesType;

                    card.style.display = visible ? '' : 'none';
                    if (visible) {
                        visibleCount += 1;
                    }
                });

                if (empty) {
                    empty.hidden = visibleCount !== 0;
                }
            }

            [searchInput, yearSelect, regionSelect, typeSelect].forEach(function (control) {
                if (control) {
                    control.addEventListener('input', applyFilter);
                    control.addEventListener('change', applyFilter);
                }
            });

            applyFilter();
        });

        document.querySelectorAll('.player-box').forEach(function (box) {
            var video = box.querySelector('video');
            var button = box.querySelector('.player-overlay');
            var streamUrl = box.getAttribute('data-stream');
            var hls = null;
            var bound = false;

            if (!video || !button || !streamUrl) {
                return;
            }

            function bindStream() {
                if (bound) {
                    return;
                }

                bound = true;

                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = streamUrl;
                    return;
                }

                if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls({
                        maxBufferLength: 30,
                        enableWorker: true
                    });
                    hls.attachMedia(video);
                    hls.on(window.Hls.Events.MEDIA_ATTACHED, function () {
                        hls.loadSource(streamUrl);
                    });
                    hls.on(window.Hls.Events.ERROR, function (event, data) {
                        if (data && data.fatal) {
                            try {
                                hls.destroy();
                            } catch (error) {
                                hls = null;
                            }
                            video.src = streamUrl;
                        }
                    });
                    return;
                }

                video.src = streamUrl;
            }

            function showButton() {
                button.hidden = false;
                box.classList.remove('is-playing');
            }

            function hideButton() {
                button.hidden = true;
                box.classList.add('is-playing');
            }

            function playVideo() {
                bindStream();
                video.controls = true;
                var playRequest = video.play();

                if (playRequest && typeof playRequest.then === 'function') {
                    playRequest.then(hideButton).catch(showButton);
                } else {
                    hideButton();
                }
            }

            button.addEventListener('click', playVideo);
            video.addEventListener('click', function () {
                if (video.paused) {
                    playVideo();
                }
            });
            video.addEventListener('play', hideButton);
            video.addEventListener('pause', function () {
                if (!video.ended) {
                    showButton();
                }
            });
        });
    });
})();
