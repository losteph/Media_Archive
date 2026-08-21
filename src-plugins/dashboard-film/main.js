const { Plugin, ItemView } = require('obsidian');

const VIEW_TYPE_DASHBOARD = "dashboard-film-view";

class DashboardView extends ItemView {
    constructor(leaf, plugin) {
        super(leaf);
        this.plugin = plugin;
        this.myMoviesDataset = [];
        this.currentFilter = 'all';
        this.searchQuery = '';
        this.currentSort = 'ctime-desc'; 
    }

    getViewType() { return VIEW_TYPE_DASHBOARD; }
    getDisplayText() { return "Dashboard Film"; }

    async onOpen() {
        const container = this.containerEl.children[1];
        container.empty();

        // FIX MOBILE: Aggiunto flex-wrap e width:100% ai contenitori di ricerca per adattarli ai telefoni
        container.innerHTML = `
            <div id="mia-app-film" style="padding: 20px; max-width: 1200px; margin: 0 auto;">
                <header class="dashboard-header" style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--background-modifier-border); padding-bottom: 20px; margin-bottom: 20px; flex-wrap: wrap; gap: 15px;">
                    <div class="header-left">
                        <h1 style="margin:0;">🎬 My Movies</h1>
                        <p style="margin:5px 0 0 0; color:var(--text-muted);">Archivio film personale</p>
                    </div>
                    <div class="controls-container" style="display: flex; flex-direction: column; align-items: flex-end; gap: 10px;">
                       <div class="filter-container" style="display: flex; gap: 10px; flex-wrap: wrap; justify-content: flex-end;">
                            <button class="filter-btn active" id="btn-all" style="cursor:pointer; padding: 6px 16px; border-radius: 20px;">Tutti <span id="count-all"></span></button>
                            <button class="filter-btn" id="btn-watched" style="cursor:pointer; padding: 6px 16px; border-radius: 20px;">Visti <span id="count-watched"></span></button>
                            <button class="filter-btn" id="btn-watchlist" style="cursor:pointer; padding: 6px 16px; border-radius: 20px;">Da Vedere <span id="count-watchlist"></span></button>
                        </div>
                        <div class="search-sort-container" style="display: flex; gap: 10px; width: 100%; justify-content: flex-end;">
                            <input type="text" id="search-input" placeholder="Cerca film..." style="padding: 8px 12px; border-radius: 8px; width: 100%; max-width: 250px;">
                            <select id="sort-select" style="padding: 8px 12px; border-radius: 8px; width: 100%; max-width: 200px;">
                                <option value="ctime-desc">Data (Più recenti)</option>
                                <option value="ctime-asc">Data (Più vecchi)</option>
                                <option value="alpha-asc">Alfabetico (A - Z)</option>
                                <option value="alpha-desc">Alfabetico (Z - A)</option>
                                <option value="year-desc">Anno (Più recenti)</option>
                                <option value="year-asc">Anno (Più vecchi)</option>
                            </select>
                        </div>
                    </div>
                </header>
                <main id="moviesGrid" style="display: flex; flex-direction: column; gap: 0;"></main>
            </div>
        `;

        await this.loadMovies();
        this.renderGrid();
        this.setupListeners();

        this.registerEvent(this.app.metadataCache.on('changed', async () => {
            await this.loadMovies();
            this.renderGrid();
        }));
        this.registerEvent(this.app.vault.on('delete', async () => {
            await this.loadMovies();
            this.renderGrid();
        }));
        this.registerEvent(this.app.vault.on('rename', async () => {
            await this.loadMovies();
            this.renderGrid();
        }));
    }

    async loadMovies() {
        const files = this.app.vault.getMarkdownFiles();
        this.myMoviesDataset = [];

        for (const file of files) {
            // 1. Mettiamo tutto in minuscolo per evitare errori di battitura (es. "Film" vs "film")
            const percorso = file.path.toLowerCase();
            const nomeFile = file.basename.toLowerCase();

            // 2. Filtro Cartella e Modelli
            const èNellaCartellaFilm = percorso.includes("film");
            const èUnModello = percorso.includes("modelli") || nomeFile.includes("modello");

            // Se non è nella cartella film o se è un modello, salta al prossimo file
            if (!èNellaCartellaFilm || èUnModello) {
                continue;
            }

            const cache = this.app.metadataCache.getFileCache(file);
            const frontmatter = cache?.frontmatter;

            // 3. Filtro Frontmatter (Doppia sicurezza: scarta SerieTV, Libri e Musica)
            if (frontmatter && (frontmatter.titolo_it || frontmatter.titolo_en)) {
                
                // Se per caso finisce un'altra tipologia di media nella cartella, la blocca
                if (frontmatter.s1 !== undefined || frontmatter.autore || frontmatter.artista) {
                    continue; 
                }

                this.myMoviesDataset.push({
                    title: frontmatter.titolo_it || frontmatter.titolo_en || file.basename,
                    title_en: frontmatter.titolo_en || "",
                    year: parseInt(frontmatter.anno) || 0,
                    status: frontmatter.status ? frontmatter.status.toLowerCase() : "watchlist",
                    rating: parseInt(frontmatter.rating) || 0,
                    local_poster: frontmatter.locandina || "",
                    ctime: file.stat.ctime,
                    file: file
                });
            }
        }
    }
    renderGrid() {
        const grid = this.containerEl.querySelector('#moviesGrid');
        grid.innerHTML = '';
        
        let filtered = [...this.myMoviesDataset];

        if (this.currentFilter !== 'all') {
            filtered = filtered.filter(m => m.status === this.currentFilter);
        }
        
        if (this.searchQuery.trim() !== '') {
            filtered = filtered.filter(m => 
                m.title.toLowerCase().includes(this.searchQuery) || 
                m.title_en.toLowerCase().includes(this.searchQuery)
            );
        }

        filtered.sort((a, b) => {
            switch(this.currentSort) {
                case 'alpha-asc': return a.title.localeCompare(b.title);
                case 'alpha-desc': return b.title.localeCompare(a.title);
                case 'year-desc': return b.year - a.year;
                case 'year-asc': return a.year - b.year;
                case 'ctime-asc': return a.ctime - b.ctime;
                case 'ctime-desc': 
                default: return b.ctime - a.ctime;
            }
        });

        const countAll = this.containerEl.querySelector('#count-all');
        const countWatched = this.containerEl.querySelector('#count-watched');
        const countWatchlist = this.containerEl.querySelector('#count-watchlist');
        
        if(countAll) countAll.innerText = `(${this.myMoviesDataset.length})`;
        if(countWatched) countWatched.innerText = `(${this.myMoviesDataset.filter(m => m.status === 'watched').length})`;
        if(countWatchlist) countWatchlist.innerText = `(${this.myMoviesDataset.filter(m => m.status === 'watchlist').length})`;

        if (filtered.length === 0) {
            grid.innerHTML = '<div style="padding: 50px; text-align: center; color: var(--text-muted);">Nessun film trovato.</div>';
            return;
        }

        filtered.forEach((movie) => {
            const row = document.createElement('div');
            
            row.style.display = 'flex';
            row.style.alignItems = 'center';
            row.style.padding = '10px 0';
            row.style.borderBottom = '1px solid var(--background-modifier-border)';
            row.style.gap = '15px'; 
            
            const stars = movie.rating > 0 ? '⭐'.repeat(movie.rating) : '-';
            const imagePath = movie.local_poster ? this.app.vault.adapter.getResourcePath(movie.local_poster) : '';
            
            const posterHTML = imagePath 
                ? `<img src="${imagePath}" style="width:50px; height:75px; min-width:50px; object-fit:cover; border-radius:4px; margin:0; padding:0; display:block;" alt="Poster">`
                : `<div style="width:50px; height:75px; min-width:50px; background:var(--background-modifier-border); border-radius:4px; display:flex; align-items:center; justify-content:center; font-size:10px;">No Img</div>`;

            // Aggiunta la classe "mobile-rating" per far restringere le stelle sul telefono
            row.innerHTML = `
                <div style="flex-shrink: 0; width: 50px;">
                    ${posterHTML}
                </div>
                
                <div style="flex-grow: 1; display: flex; align-items: baseline; gap: 8px; overflow: hidden; flex-wrap: wrap;">
                    <a class="list-title" style="cursor:pointer; font-weight:bold; font-size:16px; color:var(--text-normal); text-decoration:none;">${movie.title}</a>
                    <span style="color:var(--text-muted); font-size:14px; white-space:nowrap;">(${movie.year})</span>
                </div>
                
                <div class="mobile-rating" style="flex-shrink: 0; min-width: 80px; text-align: right; color: #fbbf24; font-size: 14px; letter-spacing: 2px; white-space:nowrap;">
                    ${stars}
                </div>
            `;

            const titleLink = row.querySelector('.list-title');
            titleLink.onmouseover = () => { titleLink.style.color = "var(--interactive-accent)"; titleLink.style.textDecoration = "underline"; };
            titleLink.onmouseout = () => { titleLink.style.color = "var(--text-normal)"; titleLink.style.textDecoration = "none"; };
            titleLink.onclick = () => {
                this.app.workspace.getLeaf(false).openFile(movie.file);
            };

            grid.appendChild(row);
        });
    }

    setupListeners() {
        const searchInput = this.containerEl.querySelector('#search-input');
        searchInput.addEventListener('input', (e) => {
            this.searchQuery = e.target.value.toLowerCase();
            this.renderGrid();
        });

        const sortSelect = this.containerEl.querySelector('#sort-select');
        sortSelect.addEventListener('change', (e) => {
            this.currentSort = e.target.value;
            this.renderGrid();
        });

        const btns = ['all', 'watched', 'watchlist'];
        btns.forEach(id => {
            const btn = this.containerEl.querySelector(`#btn-${id}`);
            if (btn) {
                btn.addEventListener('click', () => {
                    btns.forEach(b => {
                        const otherBtn = this.containerEl.querySelector(`#btn-${b}`);
                        if (otherBtn) {
                            otherBtn.style.backgroundColor = "var(--background-secondary)";
                            otherBtn.style.color = "var(--text-normal)";
                        }
                    });
                    btn.style.backgroundColor = "var(--interactive-accent)";
                    btn.style.color = "var(--text-on-accent)";
                    this.currentFilter = id;
                    this.renderGrid();
                });
            }
        });
    }
}

module.exports = class DashboardPlugin extends Plugin {
    async onload() {
        this.registerView(VIEW_TYPE_DASHBOARD, (leaf) => new DashboardView(leaf, this));
        this.addRibbonIcon('clapperboard', 'Apri Dashboard Film', () => {
            this.attivaDashboard();
        });
    }

    async attivaDashboard() {
        const { workspace } = this.app;
        let leaf = workspace.getLeavesOfType(VIEW_TYPE_DASHBOARD)[0];
        if (!leaf) {
            leaf = workspace.getLeaf(true);
            await leaf.setViewState({ type: VIEW_TYPE_DASHBOARD, active: true });
        }
        workspace.revealLeaf(leaf);
    }
}