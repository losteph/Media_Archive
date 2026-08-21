# 🗄️ My Archive Vault (Obsidian)

Questo Vault è il database multimediale definitivo per tracciare Film, Serie TV, Libri e Musica. 
Utilizza 4 plugin personalizzati in JavaScript per generare Dashboard visive dinamiche, interamente basate sui file Markdown locali.

## 📂 Struttura del Vault

Il Vault deve mantenere questa struttura rigorosa per far funzionare correttamente le Dashboard e le locandine:

- `Film/` (File .md dei film)
- `SerieTV/` (File .md delle serie)
- `Libri/` (File .md dei libri)
- `Musica/` (File .md degli album)
- `img_film/` (Locandine Film)
- `img_serie/` (Copertine Serie TV)
- `img_libri/` (Copertine Libri)
- `img_musica/` (Copertine CD/Album)
- `Modelli/` (Contiene i file template usati da Obsidian per creare nuove schede)
- `.obsidian/plugins/` (Contiene i 4 plugin in JS personalizzati)

Scaricare inoltre il plugin Dataview ed abilitare le queries JS per avere la grafica del progresso nelle stagioni di una SerieTV

---

## 🔄 Sincronizzazione (Manuale)

La sincronizzazione è gestita al 100% in modo manuale per avere il controllo totale sui file, senza processi in background. Puoi effettuarla caricando il Vault su Github, su Google Drive, iCloud, OneDrive, Obsidian Sync, etc.

**Da PC a Drive (esempio):**
1. Apri Google Drive da web o da cartella locale.
2. Trascina l'intera cartella del Vault. Drive sovrascriverà i file esistenti aggiornandoli.

**Da Telefono a Drive:**
1. Apri l'app nativa **Archivio** (e collegala al drive, se non è già collegata).
2. Copia/Incolla l'intera cartella dal telefono al Cloud (o viceversa). Le modifiche (aggiunta o modifica di singoli file) verranno sovrascritte automaticamente sui file con lo stesso nome.

---

## 🏷️ Glossario degli "Status"

Lo `status` inserito nelle proprietà (YAML) in cima ad ogni file determina in quale scheda della Dashboard finirà l'elemento. I termini da usare (tutti in minuscolo) sono:

| Film | Libri | Serie TV | Significato |
| :--- | :--- | :--- | :--- |
| `watched` | `read` | `watched` | Completato (Visto/Letto) |
| `watchlist` | `wishlist` | `watchlist` | Da iniziare |
| - | `reading` | `ongoing` | Attualmente in corso |
| - | `stopped` | `stopped` | Abbandonato / Interrotto |

*(Nota: La sezione Musica non usa stati, si basa esclusivamente sul `rating` in stelle da 0 a 5).*

---
## TAMPLATE
### Passo 1: Crea una nota vuota

Clicca sull'icona **"Nuova nota"** (il simbolo del foglio con il "+") in alto a sinistra su Obsidian, oppure usa la scorciatoia da tastiera `Ctrl + N` (Windows) o `Cmd + N` (Mac).

### Passo 2: Dai il titolo al file

Come primissima cosa, scrivi il titolo della nota in alto (es. `Il Gladiatore (2000)` oppure `Dune`). Ricorda che questo sarà il nome ufficiale del file.

### Passo 3: Inserisci il Modello

Ora che hai il tuo foglio bianco aperto, hai due modi velocissimi per incollare la struttura:

- **Metodo col mouse:** Guarda il menu verticale all'estrema sinistra di Obsidian. Cerca l'icona con **due foglietti sovrapposti** (se ci passi sopra col cursore esce scritto _"Insert template"_ o _"Inserisci modello"_). Cliccala.
- **Metodo con la tastiera:** Premi `Ctrl + P` (o `Cmd + P` su Mac) per aprire la barra dei comandi di Obsidian. Scrivi la parola **"template"** e premi Invio.

### Passo 4: Scegli la categoria

Ti apparirà subito un piccolo elenco con i file che hai salvato nella tua cartella `Modelli` (es. _Modello Film_, _Modello Libri_, _Modello SerieTV). Clicca su quello che ti serve in quel momento.

### Passo 5: Compila i dati!

In un millisecondo, Obsidian incollerà tutta la struttura pre-fatta (inclusi i trattini `---` per le proprietà, i link `[[]]` vuoti e i riquadri HTML per le serie). Non ti resta che riempire i campi vuoti, spostare la nota nella cartella giusta (es. metterla in `Film/`, `SerieTV/`) e la tua Dashboard si aggiornerà all'istante!

---

# DOCUMENTAZIONE: Media Dashboards per Obsidian

## Plugin 
Sono stati sviluppati 4 plugin custom per Obsidian (Film, SerieTV, Musica, Libri) che sono basati su ItemView (dell'API ufficiale).

- Li ho pensati per avere interfacce visive accattivanti (stile "Netflix", "Spotify"), con l'aggiunta di vari filtri di ricerca, ordinamento personalizzato, copertine grafiche. Mantenendo però i dati in formato markdown locale (puro e proprietario).
- I plugin sfruttano l'evento app.metadataCache di Obsidian e leggono in tempo reale i file nel Vault intercettando i metadata (yaml).
- Per evitare bug ogni plugin scansiona esclusivamente la cartella di competenza e scarta i vari modelli in cartelle non pertinenti.

## Struttura delle Cartelle
I plugin dipendono da una rigida organizzazione delle cartelle. I file `.md` **devono** essere creati in:
- 📁 `Film`
- 📁 `SerieTV`
- 📁 `Musica`
- 📁 `Libri`
- 📁 `Modelli` (dove risiedono i template).

## Compilazione dei file
Affinché i plugin peschino le info corrette, l'intestazione YAML in cima al file .md deve rispettare queste chiavi:
- **Film:** Necessita di `titolo_it` (o `titolo_en`), `anno`, `status` (watchlist, watched), `rating`, e `locandina`.
- **Libri:** Necessita di `autore` (chiave discriminante per il plugin), `status` (read, reading, wishlist, stopped),  e `locandina`.
- **Musica:** Necessita di `artista` (chiave discriminante) e `locandina` possibilmente quadrata.
- **SerieTV:** Necessita di `titolo_it` (o `titolo_en`), `anno`, `status` (watchlist, watched, ongoing, stopped), `rating`, e `locandina`.

> **Nota sulle Locandine:** Il parametro `locandina:` punta a un'immagine locale nel Vault (es. `img_serie/nome.jpg`). I plugin usano `vault.adapter.getResourcePath` per renderizzarla.

### Gestione Avanzata (solo SerieTV) tramite DataviewJS

Le Serie TV usano un sistema ibrido. Nel frontmatter non usiamo liste complesse, ma un campo univoco per stagione per permettere la modifica rapida in _Live Preview_ senza toccare il codice:

- `s1: 3/10` (Stagione 1, 3 episodi visti su 10).
- `s2: NomeSeason | current_ep/tot_ep` (Formato con nome della stagione separato dal simbolo `|`).

**l blocco Dataview:** All'interno del file della Serie TV è presente uno script `dataviewjs`. Questo script legge dinamicamente le variabili `s1`, `s2`, ecc., e disegna una barra di avanzamento grafica.

- **Verde:** Completata (es. 9/9).
- **Blu:** In corso.
- **Rosso:** Interrotta (se lo `status` globale della nota è impostato su `stopped`).

### Guida Dataview

Plugin utilizzato e fondamentale per il corretto funzionamento delle grafiche di avanzamento dinamiche delle SerieTV e per eventuali tabelle auto-generanti per il Casto, è obbligatorio utilizzare il plugin community Dataview.

Installazione semplice dalle impostazioni di Obsidian

Una volta scaricato però nelle impostazioni del plugin è cruciale attivare la spunta su "Enable JavaScript Queries" 

Senza Dataview vedremo solo blocchi di codici grezzo invece delle grafiche di avanzamento serie o delle tabelle per gli attori.

---
## Graph View
se vuoi filtrare tutto (escludendo vari file particolari ad esempio il `README` o varie cartelle intere ad esempio `Modelli`) si segna nel filtro:

```
-path:Modelli -file:README
```
si può usare senza il meno magari per filtrare SOLO una categoria, ad esempio solo i film si possono vedere così:
```
path:Film
```

## Pagine per il Cast
I link inseriti in un file che puntano a pagine inesistenti (file ancora non creato) si chiamano _Nodi Irrisolti_. 
- **Vantaggio:** compaiono comunque nella Graph View, e puoi capire che film ha fatto Nolan (anche se la paggina non esiste)

Ha senso poi magari creare i link, in modo che si auto-compilino, incollando il mini-codice Dataview standard al suo interno (sfruttando `this.file.name`), il codice legge il titolo della nota (es. BRAD PITT) e cercherà in automatico in tutto il Vault ogni volta che il file viene aperto.

Tramite il Modello Cast si può fare ciò!

Se un domani si aggiunge un nuovo File con quel collegamento viene aggiornata la tabella da sola.

---

> Questi file poi puoi raggrupparli tutti insieme in una cartella chiamata `Cast` magari.


## Utilizzi Futuri
Obsidian dovrebbe reggere tranquillamente Vault anche con 50.000 o 100.000 file quindi se magari si vedranno in 50 anni 5000 film/serie/libri comunque regge, e considerando circa 5kb per file di testo e 50kb ad immagine il peso totale del Vault sarà di circa 275MB (molto contenuto...)

---

#### MORE GRAPH VIEW

Possiamo assegnare colori specifici creando i Gruppi

- Apri la Graph View e clicca sull'icona dell'ingranaggio (Impostazioni) in alto a destra.
- Apri la sezione **Gruppi** (Groups) e clicca su "Nuovo Gruppo".
- Inserisci le stesse logiche di ricerca che abbiamo usato per nascondere i file, ma questa volta assegna un colore cliccando sul pallino colorato a destra della barra di ricerca:
(esempi)
    - Scrivi `path:Film` e scegli il **Rosso**.
    - Scrivi `path:SerieTV` e scegli l'**Azzurro/Blu**.
    - Scrivi `path:Libri` e scegli il **Verde**.
    - Scrivi `path:Musica` e scegli il **Viola**.
    - Scrivi `path:Persone` (o Cast) e scegli il **Giallo** o l'**Arancione**.

- In questo modo, al colpo d'occhio, la tua mappa neurale sarà uno spettacolo ordinatissimo e facile da navigare.

---

**Le Proprietà Native:** Specifica di attivare l'opzione nativa di Obsidian **Proprietà del documento** (Properties view) nelle impostazioni principali (Opzioni Principali > Editor > Properties in Document > Visible). 
Questo rende i metadati in cima al file belli da vedere e modificabili senza toccare il codice sorgente.
