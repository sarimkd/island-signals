# Island Signals

Island Signals is an interactive entry for the Pacific DataViz Challenge 2026. The story follows Malia through a Pacific village as she investigates a basic island tension: salt water is everywhere, but usable freshwater is limited and unevenly secured.

The investigation asks one question:

**What must Pacific islands know to protect freshwater as the ocean warms and rises?**

Sea-surface temperature and sea level trend upward in every observed territory. Rainfall, the freshwater source many islands depend on, splits between upward and downward trends. Safely managed drinking-water access ranges from 48.11% to 100% in the common 2020 comparison, while the 2026 formal observing record ranges from zero to eight compliant fixed land stations.

The finding is not simply that rainfall differs. The shared ocean pressure meets unequal freshwater conditions, unequal access and uneven formal observation. The analysis does not claim that the climate trends caused current drinking-water access.

Each chapter remains locked until its guide has been found.

## Open the project

The entry is a static website. Start a local server from the repository root:

```bash
python3 -m http.server 8001
```

Then visit `http://localhost:8001`.

The calculations can be reviewed in [`analysis/notebooks/pacific-climate-signals-analysis.ipynb`](analysis/notebooks/pacific-climate-signals-analysis.ipynb). The notebook reads the official CSV files and reproduces the figures shown in the field notebook.

## Hosting

The project can be published directly from the repository root with GitHub Pages. It uses browser-side HTML, CSS and JavaScript and does not require a server or database.

## Credits

Created by Sarim Khan for the Pacific DataViz Challenge 2026.

Data supplied through the challenge and the Pacific Data Hub. 3D assets by Kenney. Built with Three.js and Rough.js.

Freshwater context: [Pacific Data Hub SDG 6](https://pacificdata.org/dashboard/sdg-6-clean-water-and-sanitation) and [Pacific Community coastal aquifer work](https://spc.int/updates/news/media-release/2024/06/pacific-island-atolls-fixed-on-water-security).

Peer-reviewed context:

- White, I., Falkland, T. and Redfern, F. (2024). [Ocean Surface Warming and Long-Term Variability in Rainfall in Equatorial Pacific Atolls](https://doi.org/10.3390/atmos15060666). The study uses 1951 to 2023 observations from Tarawa and Kiritimati, Kiribati.
- Souter, R. T. C. et al. (2024). [Strengthening rural community water safety planning in Pacific Island countries](https://doi.org/10.2166/wh.2024.144). The study covers Fiji, Vanuatu and Solomon Islands.
