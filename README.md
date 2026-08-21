# Island Signals

Island Signals is an interactive entry for the Pacific DataViz Challenge 2026. The story follows Malia through a Pacific village as she meets four field guides and records what the supplied climate and biodiversity data show.

The investigation asks one question:

**Which changes are shared across Pacific territories, and which need local answers?**

The field notebook examines land temperature, sea-surface temperature, sea level, rainfall and the Red List Index. Each chapter remains locked until its guide has been found.

## Open the project

The entry is a static website. Start a local server from the repository root:

```bash
python3 -m http.server 8001
```

Then visit `http://localhost:8001`.

The calculations can be reviewed in [`analysis/notebooks/pacific-climate-signals-analysis.ipynb`](analysis/notebooks/pacific-climate-signals-analysis.ipynb).

## Hosting

The project can be published directly from the repository root with GitHub Pages. It uses browser-side HTML, CSS and JavaScript and does not require a server or database.

## Credits

Created by Sarim Khan for the Pacific DataViz Challenge 2026.

Data supplied through the challenge and the Pacific Data Hub. 3D assets by Kenney. Built with Three.js and Rough.js.
