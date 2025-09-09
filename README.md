# Medicinsk Quiz

En mobilanpassad, progress‑spårande quiz‑app byggd för GitHub Pages. Filtrerar automatiskt bort frågor med `uses_image: true` från `data/questions.yaml`.

## Funktioner
- Mobilförst UI (vertikalt) optimerad för Android.
- Minimalistiskt lila tema med fokusläge för frågor.
- Lokalt framsteg (localStorage): per fråga, per kategori, per dag.
- Rekommenderar svagaste tre kategorierna för fokuserad övning.
- Direkt återkoppling + förklaring efter svar.
- Offline-stöd via Service Worker.

## Struktur
```
index.html
styles.css
sw.js
manifest.webmanifest
src/
  dataLoader.js
  storage.js
  quizEngine.js
  ui.js
  main.js
data/questions.yaml
```

## Utökning
- Lägg till nya frågor i `data/questions.yaml` med samma struktur.
- Kategorifältet används för svaghetsanalys – håll namnen konsekventa.
- Fältet `correct_option_index` är 0-baserat i YAML.

## GitHub Pages deploy
Repo: `okface/iller2`. Aktivera Pages under Settings → Pages → Deploy from branch → `main` / root.
URL blir: https://okface.github.io/iller2/
(Om du redan har aktiverat: bara git add/commit/push.)

## Lokal test
Öppna `index.html` direkt eller kör en enkel statisk server (exempel Node):
```
npx serve .
```

## Rensa framsteg
På startsidan: "Återställ framsteg" (rensar localStorage nyckeln `medQuizProgress_v1`).

## Licens
MIT
