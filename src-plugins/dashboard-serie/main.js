const { Plugin, ItemView } = require('obsidian');

const VIEW_TYPE_DASHBOARD_SERIE = "dashboard-serie-view";

class DashboardSerieView extends ItemView {
    constructor(leaf, plugin) {
        super(leaf);
        this.plugin = plugin;
        this.mySeriesDataset = [];
        this.currentFilter = 'all';
        this.searchQuery = '';
        this.currentSort = 'ctime-desc'; 
    }

    getViewType() { return VIEW_TYPE_DASHBOARD_SERIE; }
    getDisplayText() { return "Dashboard Serie TV"; }

    async onOpen() {
        const container = this.containerEl.children[1];
        container.empty();

        // Ho ripristinato esattamente i tuoi stili inline dell'header
        container.innerHTML = `
            <div id="mia-app-serie" style="padding: 20px; max-width: 1200px; margin: 0 auto;">
                <header class="dashboard-header" style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--background-modifier-border); padding-bottom: 20px; margin-bottom: 20px; flex-wrap: wrap; gap: 15px;">
                    <div class="header-left">
                        <h1 style="margin:0;">📺 My Series</h1>
                        <p style="margin:5px 0 0 0; color:var(--text-muted);">Archivio Serie TV personale</p>
                    </div>
                    <div class="controls-container" style="display: flex; flex-direction: column; align-items: flex-end; gap: 10px;">
                       <div class="filter-container" style="display: flex; gap: 10px; flex-wrap: wrap; justify-content: flex-end;">
                            <button class="filter-btn active" id="btn-all" style="cursor:pointer; padding: 6px 16px; border-radius: 20px;">Tutte <span id="count-all"></span></button>
                            <button class="filter-btn" id="btn-watchlist" style="cursor:pointer; padding: 6px 16px; border-radius: 20px;">Da Vedere <span id="count-watchlist"></span></button>
                            <button class="filter-btn" id="btn-ongoing" style="cursor:pointer; padding: 6px 16px; border-radius: 20px;">In Corso <span id="count-ongoing"></span></button>
                            <button class="filter-btn" id="btn-watched" style="cursor:pointer; padding: 6px 16px; border-radius: 20px;">Completate <span id="count-watched"></span></button>
                            <button class="filter-btn" id="btn-stopped" style="cursor:pointer; padding: 6px 16px; border-radius: 20px;">Interrotte <span id="count-stopped"></span></button>
                        </div>
                        <div class="search-sort-container" style="display: flex; gap: 10px; width: 100%; justify-content: flex-end;">
                            <input type="text" id="search-input" placeholder="Cerca serie..." style="padding: 8px 12px; border-radius: 8px; width: 100%; max-width: 250px;">
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
                <main id="seriesGrid" style="display: flex; flex-direction: column; gap: 0;"></main>
            </div>
        `;

        await this.loadSeries();
        this.renderGrid();
        this.setupListeners();

        this.registerEvent(this.app.metadataCache.on('changed', async () => { await this.loadSeries(); this.renderGrid(); }));
        this.registerEvent(this.app.vault.on('delete', async () => { await this.loadSeries(); this.renderGrid(); }));
        this.registerEvent(this.app.vault.on('rename', async () => { await this.loadSeries(); this.renderGrid(); }));
    }

    async loadSeries() {
        const files = this.app.vault.getMarkdownFiles();
        this.mySeriesDataset = [];

        for (const file of files) {
            // FIX DEFINITIVO BUG MODELLO E CARTELLA:
            // 1. Deve essere dentro la cartella SerieTV
            // 2. Il nome del file NON deve contenere la parola "Modello"
            if (!file.path.includes("SerieTV") || file.basename.includes("Modello")) {
                continue; 
            }

            const cache = this.app.metadataCache.getFileCache(file);
            const frontmatter = cache?.frontmatter;

            // Riconosce la serie se c'è "s1" o se la locandina ha "serie"
            const isSerie = frontmatter && (
                frontmatter.s1 !== undefined || 
                (frontmatter.locandina && frontmatter.locandina.includes('serie'))
            );

            if (isSerie) {
                this.mySeriesDataset.push({
                    title: frontmatter.titolo_it || frontmatter.titolo_en || file.basename,
                    title_en: frontmatter.titolo_en || "",
                    year: frontmatter.anno || "",
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
        const grid = this.containerEl.querySelector('#seriesGrid');
        grid.innerHTML = '';
        
        let filtered = [...this.mySeriesDataset];

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
                case 'year-desc': return (parseInt(b.year) || 0) - (parseInt(a.year) || 0);
                case 'year-asc': return (parseInt(a.year) || 0) - (parseInt(b.year) || 0);
                case 'ctime-asc': return a.ctime - b.ctime;
                case 'ctime-desc': default: return b.ctime - a.ctime;
            }
        });

        const countAll = this.containerEl.querySelector('#count-all');
        const countWatchlist = this.containerEl.querySelector('#count-watchlist');
        const countOngoing = this.containerEl.querySelector('#count-ongoing');
        const countWatched = this.containerEl.querySelector('#count-watched');
        const countStopped = this.containerEl.querySelector('#count-stopped');
        
        if(countAll) countAll.innerText = `(${this.mySeriesDataset.length})`;
        if(countWatchlist) countWatchlist.innerText = `(${this.mySeriesDataset.filter(m => m.status === 'watchlist').length})`;
        if(countOngoing) countOngoing.innerText = `(${this.mySeriesDataset.filter(m => m.status === 'ongoing').length})`;
        if(countWatched) countWatched.innerText = `(${this.mySeriesDataset.filter(m => m.status === 'watched').length})`;
        if(countStopped) countStopped.innerText = `(${this.mySeriesDataset.filter(m => m.status === 'stopped').length})`;

        if (filtered.length === 0) {
            grid.innerHTML = '<div style="padding: 50px; text-align: center; color: var(--text-muted);">Nessuna Serie TV trovata.</div>';
            return;
        }

        filtered.forEach((serie) => {
            const row = document.createElement('div');
            
            // QUESTO È ESATTAMENTE IL TUO CODICE ORIGINALE PER GLI STILI DELLA RIGA
            row.style.display = 'flex';
            row.style.alignItems = 'center';
            row.style.padding = '10px 0';
            row.style.borderBottom = '1px solid var(--background-modifier-border)';
            row.style.gap = '15px'; 
            
            const stars = serie.rating > 0 ? '⭐'.repeat(serie.rating) : '-';
            const imagePath = serie.local_poster ? this.app.vault.adapter.getResourcePath(serie.local_poster) : '';
            
            const posterHTML = imagePath 
                ? `<img src="${imagePath}" style="width:50px; height:75px; min-width:50px; object-fit:cover; border-radius:4px; margin:0; padding:0; display:block;" alt="Poster">`
                : `<div style="width:50px; height:75px; min-width:50px; background:var(--background-modifier-border); border-radius:4px; display:flex; align-items:center; justify-content:center; font-size:10px;">No Img</div>`;

            // STRUTTURA ESATTA ORIGINALE (Ho aggiunto solo la classe "mobile-rating" alle stelle per rimpicciolirle su cell)
            row.innerHTML = `
                <div style="flex-shrink: 0; width: 50px;">
                    ${posterHTML}
                </div>
                
                <div style="flex-grow: 1; display: flex; align-items: baseline; gap: 8px; overflow: hidden; flex-wrap: wrap;">
                    <a class="list-title" style="cursor:pointer; font-weight:bold; font-size:16px; color:var(--text-normal); text-decoration:none;">${serie.title}</a>
                    <span style="color:var(--text-muted); font-size:14px; white-space:nowrap;">(${serie.year})</span>
                </div>
                
                <div class="mobile-rating" style="flex-shrink: 0; min-width: 80px; text-align: right; color: #fbbf24; font-size: 14px; letter-spacing: 2px; white-space:nowrap;">
                    ${stars}
                </div>
            `;

            const titleLink = row.querySelector('.list-title');
            titleLink.onmouseover = () => { titleLink.style.textDecoration = "underline"; };
            titleLink.onmouseout = () => { titleLink.style.textDecoration = "none"; };
            titleLink.onclick = () => {
                this.app.workspace.getLeaf(false).openFile(serie.file);
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

        const btns = ['all', 'watchlist', 'ongoing', 'watched', 'stopped'];
        btns.forEach(id => {
            const btn = this.containerEl.querySelector(`#btn-${id}`);
            if(btn) {
                btn.addEventListener('click', () => {
                    btns.forEach(b => {
                        const otherBtn = this.containerEl.querySelector(`#btn-${b}`);
                        if(otherBtn) {
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

module.exports = class DashboardSeriePlugin extends Plugin {
    async onload() {
        this.registerView(VIEW_TYPE_DASHBOARD_SERIE, (leaf) => new DashboardSerieView(leaf, this));
        this.addRibbonIcon('tv', 'Apri Serie TV', () => {
            this.attivaDashboard();
        });
    }

    async attivaDashboard() {
        const { workspace } = this.app;
        let leaf = workspace.getLeavesOfType(VIEW_TYPE_DASHBOARD_SERIE)[0];
        if (!leaf) {
            leaf = workspace.getLeaf(true);
            await leaf.setViewState({ type: VIEW_TYPE_DASHBOARD_SERIE, active: true });
        }
        workspace.revealLeaf(leaf);
    }
}