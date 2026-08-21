---
titolo_it: JoJo's Bizarre Adventure
titolo_en: JoJo's Bizarre Adventure
anno: 2012-Present
status: ongoing
rating: 5
locandina: img_serie/jojo_bizarre_adventure.jpg
generi:
  - Anime
  - Action
  - Comedy
  - Horror
  - Adventure
  - Supernatural
  - Fantasy
  - Drama
  - Sci-Fi
s1: "Part1: Phantom Blood | 9/9"
s2: "Part 2: Battle Tendency | 17/17"
s3: "Part 3: tardust Crusaders | 48/48"
s4: "Part 4: Diamond is Umbreakable | 39/39"
s5: "Part 5: Golden Wind | 39/39"
s6: "Part 6: Stone Ocean | 38/38"
s7: "Part 7: Steel Ball Run | 1/2"
---
![[img_serie/jojo_bizarre_adventure.jpg]]

**Ideatore:** [[Hirohiko Araki]]

**Cast:**
- [[Jonathan Joestar]]
- [[Dio Brando]]
- [[Roberti E.O. Speedwagon]]
- [[Will A. Zeppeli]]
- [[Erina Pendleton]]
- [[Joseph Joestar]]
- [[Lisa Lisa]]
- [[Caesar Zeppeli]]
- [[Rudol von Stroheim]]
- [[Wamuu]]
- [[Kars]]
- [[Esidisi]]
- [[Santana]]
- [[Jotaro Kujo]]
- [[Muhammad Avdol]]
- [[Noriaki Kakyoin]]
- [[Jean Pierre Polnareff]]
- [[Iggy]]
- [[Josuke Higashikata]]
- [[Koichi Hirose]]
- [[Yoshikage Kira]]
- [[Okuyasu Nijimura]]
- [[Rohan Kishibe]]
- [[Giorno Giovanna]]
- [[Bruno Bucciarati]]
- [[Leone Abbacchio]]
- [[Guido Mista]]
- [[Narancia Ghirga]]
- [[Pannacotta Fugo]]
- [[Trish Una]]
- [[Diavolo]]
- [[Jolyne Cujoh]]
- [[Ermes Costello]]
- [[Foo FIghter]]
- [[Weather Report]]
- [[Narcisio Anasui]]
- [[Emporio]]
- [[Enrico Pucci]]
- [[Johnny Joestar]]
- [[Gyro Zeppeli]]
- [[Lucy Steel]]
- [[Funny Valentine]]
- [[Diego Brando]]


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


