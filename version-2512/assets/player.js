(function () {
    function initMoviePlayer(url, videoId, buttonId, messageId) {
        var video = document.getElementById(videoId);
        var button = document.getElementById(buttonId);
        var message = document.getElementById(messageId);
        var hls = null;
        var attached = false;

        function showMessage(text) {
            if (!message) {
                return;
            }
            message.textContent = text;
            message.classList.add("show");
        }

        function hideMessage() {
            if (message) {
                message.classList.remove("show");
                message.textContent = "";
            }
        }

        function attach() {
            if (!video || attached) {
                return;
            }
            attached = true;
            hideMessage();

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = url;
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    backBufferLength: 90
                });
                hls.loadSource(url);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.ERROR, function (event, data) {
                    if (!data || !data.fatal) {
                        return;
                    }
                    if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                        hls.startLoad();
                        return;
                    }
                    if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                        hls.recoverMediaError();
                        return;
                    }
                    showMessage("播放暂时不可用，请稍后再试");
                });
                return;
            }

            showMessage("播放暂时不可用，请稍后再试");
        }

        function play() {
            if (!video) {
                return;
            }
            attach();
            var promise = video.play();
            if (promise && typeof promise.catch === "function") {
                promise.catch(function () {
                    showMessage("点击播放器继续观看");
                });
            }
        }

        if (button) {
            button.addEventListener("click", function () {
                if (button) {
                    button.classList.add("is-hidden");
                }
                play();
            });
        }

        if (video) {
            video.addEventListener("click", function () {
                if (video.paused) {
                    if (button) {
                        button.classList.add("is-hidden");
                    }
                    play();
                } else {
                    video.pause();
                }
            });
            video.addEventListener("play", function () {
                hideMessage();
                if (button) {
                    button.classList.add("is-hidden");
                }
            });
            video.addEventListener("ended", function () {
                if (button) {
                    button.classList.remove("is-hidden");
                }
            });
        }

        window.addEventListener("beforeunload", function () {
            if (hls) {
                hls.destroy();
            }
        });
    }

    window.initMoviePlayer = initMoviePlayer;
})();
