(function () {
    function escapeHtml(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function createCard(movie) {
        var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
            return '<span>' + escapeHtml(tag) + '</span>';
        }).join('');

        return [
            '<a class="movie-card" href="' + escapeHtml(movie.href) + '">',
            '    <div class="poster-wrap">',
            '        <img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
            '        <div class="poster-gradient"></div>',
            '        <div class="poster-play" aria-hidden="true">▶</div>',
            '        <div class="poster-badges">',
            '            <span class="badge badge-red">' + escapeHtml(movie.year) + '</span>',
            '            <span class="badge badge-dark">' + escapeHtml(movie.type) + '</span>',
            '        </div>',
            '    </div>',
            '    <div class="card-body">',
            '        <h3>' + escapeHtml(movie.title) + '</h3>',
            '        <p>' + escapeHtml(movie.oneLine) + '</p>',
            '        <div class="card-meta">',
            '            <span>' + escapeHtml(movie.category) + '</span>',
            '            <span>' + escapeHtml(movie.region) + '</span>',
            '        </div>',
            '        <div class="mini-tags">' + tags + '</div>',
            '    </div>',
            '</a>'
        ].join('
');
    }

    function normalize(value) {
        return String(value || '').toLowerCase();
    }

    document.addEventListener('DOMContentLoaded', function () {
        var input = document.querySelector('[data-search-input]');
        var yearSelect = document.querySelector('[data-search-year]');
        var regionSelect = document.querySelector('[data-search-region]');
        var typeSelect = document.querySelector('[data-search-type]');
        var results = document.querySelector('[data-search-results]');
        var count = document.querySelector('[data-search-count]');
        var movies = window.MOVIES || [];
        var params = new URLSearchParams(window.location.search);

        if (!input || !results) {
            return;
        }

        input.value = params.get('q') || '';

        function selected(select) {
            return select ? select.value : '';
        }

        function render() {
            var query = normalize(input.value.trim());
            var year = selected(yearSelect);
            var region = selected(regionSelect);
            var type = selected(typeSelect);
            var filtered = movies.filter(function (movie) {
                var haystack = normalize([
                    movie.title,
                    movie.region,
                    movie.type,
                    movie.year,
                    movie.genre,
                    movie.category,
                    movie.oneLine,
                    (movie.tags || []).join(' ')
                ].join(' '));

                return (!query || haystack.indexOf(query) !== -1)
                    && (!year || String(movie.year) === year)
                    && (!region || movie.region === region)
                    && (!type || movie.type === type);
            });

            var visible = filtered.slice(0, 120);
            results.innerHTML = visible.map(createCard).join('
');

            if (count) {
                count.textContent = '找到 ' + filtered.length + ' 部影片';
            }
        }

        [input, yearSelect, regionSelect, typeSelect].forEach(function (control) {
            if (control) {
                control.addEventListener('input', render);
                control.addEventListener('change', render);
            }
        });

        render();
    });
})();
