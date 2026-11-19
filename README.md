# Leonida Trophy Guide — GTA VI (PS5)

[![make.fun](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01)
[![rank](https://make.fun/Maranatha99/gta6-trophy-guide-01/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01)
[![reward](https://make.fun/Maranatha99/gta6-trophy-guide-01/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01)

An offline guide and tracker for all **55 PlayStation 5 trophies** of Grand Theft Auto VI (1 platinum, 2 gold, 6 silver, 46 bronze), built for the [gta6-trophy-guide-01 bounty on make.fun](https://make.fun/bounty/gta6-trophy-guide-01).

## What it is

A static web app under `app/` — no build step, no network at runtime. Open `app/index.html` from any static server and it works with the network off.

- **Every trophy** with its official name, description and grade as PlayStation publishes them, plus a guide in our own words that cites its sources beside it (name + link per trophy, in `app/data/trophies.json`).
- **Tracker**: tick trophies off; progress saves in `localStorage` and can be exported to a JSON file and imported back.
- **Filters** by kind (story, missable, collectibles, activities, online) and by grade, plus search across names, descriptions, guides and sources.
- **Spoiler setting**: hides the names, descriptions and guides of story trophies until they are earned — mirroring how 28 of the 55 trophies stay hidden on PlayStation until earned.
- **Road to the Platinum**: a 7-stage roadmap built from the official descriptions (story chapters and missions, collectibles and counts, in what order), and a flag for the one missable trophy — **Positive Mental Attitude** (Lucia's balcony meditation spot in Chapter 1 disappears after the chapter; the game has no mission replay).

## Honesty note

The trophy list went public on 18 November 2026 (Exophase, reported by Push Square) and the game launched on 19 November 2026. For several hidden trophies no unlock method had been confirmed at launch; where that is the case the guide says so instead of inventing one. Guide text is original to this entry — sources are cited, never copied.

## Run it

```sh
node serve.ts        # serves app/ on http://localhost:8080
```

## Hand it in

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` copies `app/` and `screenshots/` to the output directory and writes `dossier.json` with the vendored make.fun library (`vendor/makefun-frontend.ts`, unchanged).

## License

MIT — see `LICENSE`.
