---
titolo_it: "Avatar: The Last Airbender"
titolo_en: "Avatar: The Last Airbender"
anno: 2005-2008
status: watched
rating: 4
locandina: img_serie/avatar_airbender.webp
generi:
  - Action
  - Animation
  - Comedy
  - Fantasy
  - Superhero
  - Adventure
s1: "Book One: Water - 20/20"
s2: "Book Two: Earth - 20/20"
s3: "Book Three: Fire - 21/21"
---
![[img_serie/avatar_airbender.webp]]

**Ideatore:** [[Michael Dante DiMartino, Bryan Konietzko]]

**Cast:**
- [[Aang]]
- [[Katara]]
- [[Sokka]]
- [[Zuko]]
- [[Toph]]
- [[Mai]]
- [[Azula]]
- [[Uncle Iroh]]
- [[Suki]]
- [[Ty Lee]]


```dataviewjs
const p = dv.current();
let html = `<div style="margin-top: 15px; margin-bottom: 25px; padding: 20px; background: var(--background-secondary); border-radius: 8px; border: 1px solid var(--background-modifier-border); max-width: 450px;">
    <strong style="display: block; margin-bottom: 15px; color: var(--text-normal); font-size: 16px;">Avanzamento Stagioni</strong>`;

let trovato = false;
let status = p.status ? String(p.status).toLowerCase() : "";

// Controlla fino a 30 stagioni per sicurezza
for (let i = 1; i <= 30; i++) { 
    let seasonData = p["s" + i];
    
    if (seasonData) {
        trovato = true;
        let seasonStr = String(seasonData);
        let nomeStagione = `Stagione ${i}`; // Nome di default
        let epStr = seasonStr; // Progressi di default

        // Se c'è il simbolo "|" divide il nome dai progressi
        if (seasonStr.includes("|")) {
            let parts = seasonStr.split("|");
            nomeStagione = parts[0].trim();
            epStr = parts[1].trim();
        } 
        // Supporto alternativo se per sbaglio scrivi col trattino "-"
        else if (seasonStr.includes("-")) {
            let parts = seasonStr.split("-");
            nomeStagione = parts[0].trim();
            epStr = parts[1].trim();
        }

        // Estrapola episodi visti e totali
        let epParts = epStr.split("/");
        let w = parseInt(epParts[0]) || 0;
        let t = parseInt(epParts[1]) || 1;
        
        let perc = Math.min((w / t) * 100, 100).toFixed(1);
        
        // --- LOGICA DEI COLORI ---
        let barColor = '#3b82f6'; // BLU: In corso
        if (perc >= 100.0) {
            barColor = '#22c55e'; // VERDE: Completata
        } else if (status === 'stopped' || status === 'abbandonata') {
            barColor = '#ef4444'; // ROSSO: Interrotta
        }

        html += `
        <div style="margin-bottom: 12px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 4px; font-size: 13px;">
                <span style="color: var(--text-muted);"><strong>${nomeStagione}</strong></span>
                <span style="color: var(--text-muted);"><strong>${w} /${t}</strong> EP</span>
            </div>
            <div style="width: 100%; height: 6px; background-color: var(--background-modifier-border); border-radius: 3px; overflow: hidden;">
                <div style="width: ${perc}\%; height: 100\%; background-color:${barColor};"></div>
            </div>
        </div>`;
    }
}

html += `</div>`;

if (trovato) {
    dv.span(html);
} else {
    dv.paragraph("*Nessun progresso trovato. Aggiungi proprietà come 's1: 3/10' o 's1: Nome | 3/10'.*");
}
```

# Commento
Bellissimo Cartone.