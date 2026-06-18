(function () {
    window.initMoviePlayer = function (options) {
        var video = document.getElementById(options.videoId);
        var overlay = document.getElementById(options.overlayId);
        var source = options.source;
        var loaded = false;
        var hlsInstance = null;

        function load() {
            if (!video || loaded) {
                return;
            }
            loaded = true;
            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);
            } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
            } else {
                video.src = source;
            }
        }

        function play() {
            if (!video) {
                return;
            }
            load();
            video.controls = true;
            if (overlay) {
                overlay.classList.add('is-hidden');
            }
            var promise = video.play();
            if (promise && promise.catch) {
                promise.catch(function () {
                    if (overlay) {
                        overlay.classList.remove('is-hidden');
                    }
                });
            }
        }

        if (overlay) {
            overlay.addEventListener('click', play);
        }
        if (video) {
            video.addEventListener('click', function () {
                if (video.paused) {
                    play();
                }
            });
        }
        window.addEventListener('pagehide', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    };
})();
