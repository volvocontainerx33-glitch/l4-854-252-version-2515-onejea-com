(function () {
    var mobileButton = document.querySelector('[data-menu-toggle]');
    var mobilePanel = document.querySelector('[data-mobile-panel]');

    if (mobileButton && mobilePanel) {
        mobileButton.addEventListener('click', function () {
            mobilePanel.classList.toggle('is-open');
        });
    }

    function setupHero() {
        var slider = document.querySelector('[data-hero-slider]');
        if (!slider) {
            return;
        }

        var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
        var current = 0;
        var timer = null;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
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

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                show(index);
                start();
            });
        });

        slider.addEventListener('mouseenter', stop);
        slider.addEventListener('mouseleave', start);
        start();
    }

    function setupFilters() {
        var forms = Array.prototype.slice.call(document.querySelectorAll('[data-filter-form]'));

        forms.forEach(function (form) {
            var scope = form.parentElement || document;
            var input = form.querySelector('[data-search-input]');
            var select = form.querySelector('[data-category-select]');
            var emptyState = scope.querySelector('[data-empty-state]');
            var items = Array.prototype.slice.call(scope.querySelectorAll('.searchable-item'));

            function apply() {
                var keyword = input ? input.value.trim().toLowerCase() : '';
                var category = select ? select.value : '';
                var visible = 0;

                items.forEach(function (item) {
                    var text = (item.getAttribute('data-search') || '').toLowerCase();
                    var itemCategory = item.getAttribute('data-category') || '';
                    var keywordMatch = !keyword || text.indexOf(keyword) !== -1;
                    var categoryMatch = !category || itemCategory === category;
                    var match = keywordMatch && categoryMatch;

                    item.hidden = !match;
                    if (match) {
                        visible += 1;
                    }
                });

                if (emptyState) {
                    emptyState.hidden = visible !== 0;
                }
            }

            if (input) {
                input.addEventListener('input', apply);
            }

            if (select) {
                select.addEventListener('change', apply);
            }
        });
    }

    function setupPlayers() {
        var blocks = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));
        var Hls = window.Hls;

        blocks.forEach(function (block) {
            var video = block.querySelector('video');
            var cover = block.querySelector('.player-cover');
            var stream = video ? video.getAttribute('data-stream') : '';
            var attached = false;
            var hls = null;

            if (!video || !stream) {
                return;
            }

            function attach() {
                if (attached) {
                    return;
                }

                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = stream;
                } else if (Hls && Hls.isSupported()) {
                    hls = new Hls({
                        enableWorker: true,
                        lowLatencyMode: true,
                        backBufferLength: 90
                    });
                    hls.loadSource(stream);
                    hls.attachMedia(video);
                } else {
                    video.src = stream;
                }

                attached = true;
            }

            function play() {
                attach();
                if (cover) {
                    cover.classList.add('is-hidden');
                }

                var result = video.play();
                if (result && typeof result.catch === 'function') {
                    result.catch(function () {
                        if (cover) {
                            cover.classList.remove('is-hidden');
                        }
                    });
                }
            }

            if (cover) {
                cover.addEventListener('click', play);
            }

            video.addEventListener('click', function () {
                if (video.paused) {
                    play();
                }
            });

            video.addEventListener('play', function () {
                if (cover) {
                    cover.classList.add('is-hidden');
                }
            });

            video.addEventListener('ended', function () {
                if (hls && typeof hls.stopLoad === 'function') {
                    hls.stopLoad();
                }
            });
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        setupHero();
        setupFilters();
        setupPlayers();
    });
}());
