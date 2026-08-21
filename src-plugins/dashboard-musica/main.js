const { Plugin, ItemView } = require('obsidian');

const VIEW_TYPE_DASHBOARD_MUSICA = "dashboard-musica-view";

class DashboardMusicaView extends ItemView {
    constructor(leaf, plugin) {
        super(leaf);
        this.plugin = plugin;
        this.myMusicDataset = [];
        this.searchQuery = '';
        this.currentSort = 'ctime-desc'; 
    }

    getViewType() { return VIEW_TYPE_DASHBOARD_MUSICA; }
    getDisplayText() { return "Dashboard Musica"; }

    async onOpen() {
        const container = this.containerEl.children[1];
        container.empty();

        // FIX MOBILE: Aggiunto flex-wrap e width:100% all'header e alla barra di ricerca
        container.innerHTML = `
            <div id="mia-app-musica" style="padding: 20px; max-width: 1200px; margin: 0 auto;">
                <header class="dashboard-header" style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--background-modifier-border); padding-bottom: 20px; margin-bottom: 20px; flex-wrap: wrap; gap: 15px;">
                    <div class="header-left">
                        <h1 style="margin:0;">💿 My CDs</h1>
                        <p style="margin:5px 0 0 0; color:var(--text-muted);">Archivio CD e musica personale</p>
                    </div>
                    <div class="controls-container" style="display: flex; flex-direction: column; align-items: flex-end; gap: 10px; flex-grow: 1;">
                        <div class="toggles" style="display: flex; gap: 10px; justify-content: flex-end;">
                            <button id="btn-random" title="Album Casuale" style="cursor:pointer; padding: 8px 12px; border-radius: 8px; font-size: 1.2rem; background: var(--interactive-accent); border: none;">🎲</button>
                        </div>
                        <div class="search-sort-container" style="display: flex; gap: 10px; width: 100%; justify-content: flex-end;">
                            <input type="text" id="search-input" placeholder="Cerca album o artista..." style="padding: 8px 12px; border-radius: 8px; width: 100%; max-width: 250px;">
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
                <div style="margin-bottom: 15px; font-weight: bold; color: var(--text-muted);">
                    Totale Album: <span id="count-all">0</span>
                </div>
                <main id="musicGrid" style="display: flex; flex-direction: column; gap: 0;"></main>
            </div>
        `;

        await this.loadMusic();
        this.renderGrid();
        this.setupListeners();

        this.registerEvent(this.app.metadataCache.on('changed', async () => { await this.loadMusic(); this.renderGrid(); }));
        this.registerEvent(this.app.vault.on('delete', async () => { await this.loadMusic(); this.renderGrid(); }));
        this.registerEvent(this.app.vault.on('rename', async () => { await this.loadMusic(); this.renderGrid(); }));
    }

    async loadMusic() {
        const files = this.app.vault.getMarkdownFiles();
        this.myMusicDataset = [];

        for (const file of files) {
            // Isoliamo la ricerca: solo cartella "Musica", escludiamo i Modelli
            const percorso = file.path.toLowerCase();
            const nomeFile = file.basename.toLowerCase();
            
            if (!percorso.includes("musica") || percorso.includes("modelli") || nomeFile.includes("modello")) {
                continue;
            }

            const cache = this.app.metadataCache.getFileCache(file);
            const frontmatter = cache?.frontmatter;

            // Filtro: carichiamo solo i file che hanno il parametro "artista"
            if (frontmatter && frontmatter.artista) {
                this.myMusicDataset.push({
                    title: frontmatter.titolo_it || frontmatter.titolo_en || file.basename,
                    title_en: frontmatter.titolo_en || "",
                    artist: frontmatter.artista || "",
                    year: frontmatter.anno || "",
                    rating: parseInt(frontmatter.rating) || 0,
                    local_poster: frontmatter.locandina || "",
                    ctime: file.stat.ctime,
                    file: file
                });
            }
        }
    }

    renderGrid() {
        const grid = this.containerEl.querySelector('#musicGrid');
        grid.innerHTML = '';
        
        let filtered = [...this.myMusicDataset];

        if (this.searchQuery.trim() !== '') {
            filtered = filtered.filter(m => 
                m.title.toLowerCase().includes(this.searchQuery) || 
                m.title_en.toLowerCase().includes(this.searchQuery) ||
                m.artist.toLowerCase().includes(this.searchQuery)
            );
        }

        filtered.sort((a, b) => {
            switch(this.currentSort) {
                case 'alpha-asc': return a.title.localeCompare(b.title);
                case 'alpha-desc': return b.title.localeCompare(a.title);
                case 'year-desc': 
                    const yDescA = parseInt(a.year.toString().substring(0, 4)) || 0;
                    const yDescB = parseInt(b.year.toString().substring(0, 4)) || 0;
                    return yDescB - yDescA;
                case 'year-asc': 
                    const yAscA = parseInt(a.year.toString().substring(0, 4)) || 0;
                    const yAscB = parseInt(b.year.toString().substring(0, 4)) || 0;
                    return yAscA - yAscB;
                case 'ctime-asc': return a.ctime - b.ctime;
                case 'ctime-desc': default: return b.ctime - a.ctime;
            }
        });

        const countAll = this.containerEl.querySelector('#count-all');
        if(countAll) countAll.innerText = this.myMusicDataset.length;

        if (filtered.length === 0) {
            grid.innerHTML = '<div style="padding: 50px; text-align: center; color: var(--text-muted);">Nessun album trovato.</div>';
            return;
        }

        filtered.forEach((album) => {
            const row = document.createElement('div');
            
            row.style.display = 'flex';
            row.style.alignItems = 'center';
            row.style.padding = '10px 0';
            row.style.borderBottom = '1px solid var(--background-modifier-border)';
            row.style.gap = '15px'; 
            
            const stars = album.rating > 0 ? '⭐'.repeat(album.rating) : '-';
            const imagePath = album.local_poster ? this.app.vault.adapter.getResourcePath(album.local_poster) : '';
            
            const posterHTML = imagePath 
                ? `<img src="${imagePath}" style="width:50px; height:50px; min-width:50px; object-fit:cover; border-radius:4px; margin:0; padding:0; display:block;" alt="Poster">`
                : `<div style="width:50px; height:50px; min-width:50px; background:var(--background-modifier-border); border-radius:4px; display:flex; align-items:center; justify-content:center; font-size:10px;">No Img</div>`;

            // Aggiunta classe "mobile-rating" alle stelle
            row.innerHTML = `
                <div style="flex-shrink: 0; width: 50px;">
                    ${posterHTML}
                </div>
                
                <div style="flex-grow: 1; display: flex; align-items: baseline; gap: 8px; overflow: hidden; flex-wrap: wrap;">
                    <a class="list-title" style="cursor:pointer; font-weight:bold; font-size:16px; color:var(--text-normal); text-decoration:none;">${album.title}</a>
                    <span style="color:var(--interactive-accent); font-size:14px; font-style: italic;">[${album.artist}]</span>
                    <span style="color:var(--text-muted); font-size:14px; white-space:nowrap;">(${album.year})</span>
                </div>
                
                <div class="mobile-rating" style="flex-shrink: 0; min-width: 80px; text-align: right; color: #fbbf24; font-size: 14px; letter-spacing: 2px; white-space:nowrap;">
                    ${stars}
                </div>
            `;

            const titleLink = row.querySelector('.list-title');
            titleLink.onmouseover = () => { titleLink.style.textDecoration = "underline"; };
            titleLink.onmouseout = () => { titleLink.style.textDecoration = "none"; };
            titleLink.onclick = () => {
                this.app.workspace.getLeaf(false).openFile(album.file);
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

        const btnRandom = this.containerEl.querySelector('#btn-random');
        if (btnRandom) {
            btnRandom.addEventListener('click', () => {
                if (this.myMusicDataset.length > 0) {
                    const randomIndex = Math.floor(Math.random() * this.myMusicDataset.length);
                    const randomAlbum = this.myMusicDataset[randomIndex];
                    this.app.workspace.getLeaf(false).openFile(randomAlbum.file);
                }
            });
        }
    }
}

module.exports = class DashboardMusicaPlugin extends Plugin {
    async onload() {
        this.registerView(VIEW_TYPE_DASHBOARD_MUSICA, (leaf) => new DashboardMusicaView(leaf, this));
        this.addRibbonIcon('disc', 'Apri Musica', () => {
            this.attivaDashboard();
        });
    }

    async attivaDashboard() {
        const { workspace } = this.app;
        let leaf = workspace.getLeavesOfType(VIEW_TYPE_DASHBOARD_MUSICA)[0];
        if (!leaf) {
            leaf = workspace.getLeaf(true);
            await leaf.setViewState({ type: VIEW_TYPE_DASHBOARD_MUSICA, active: true });
        }
        workspace.revealLeaf(leaf);
    }
}