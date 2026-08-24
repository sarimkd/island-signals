"""Create the reproducible Island Signals analysis notebook."""

import ast
import contextlib
import io
import json
import os
from pathlib import Path


class NotebookV4:
    @staticmethod
    def new_notebook():
        return {"cells": [], "metadata": {}, "nbformat": 4, "nbformat_minor": 5}

    @staticmethod
    def new_markdown_cell(source):
        return {"cell_type": "markdown", "id": "", "metadata": {}, "source": source.splitlines(keepends=True)}

    @staticmethod
    def new_code_cell(source):
        return {"cell_type": "code", "id": "", "metadata": {}, "execution_count": None, "outputs": [], "source": source.splitlines(keepends=True)}


class NotebookFormat:
    v4 = NotebookV4()

    @staticmethod
    def write(notebook, path):
        path.write_text(json.dumps(notebook, indent=1), encoding="utf-8")


nbf = NotebookFormat()


ROOT = Path(__file__).resolve().parents[2]
OUTPUT = ROOT / "analysis" / "notebooks" / "pacific-climate-signals-analysis.ipynb"

nb = nbf.v4.new_notebook()
nb["metadata"]["kernelspec"] = {"display_name": "Python 3", "language": "python", "name": "python3"}
nb["metadata"]["language_info"] = {"name": "python", "version": "3"}

nb["cells"] = [
    nbf.v4.new_markdown_cell(
        """# One ocean, unequal freshwater security

Pacific islands are surrounded by salt water, but homes, farms and public services depend on freshwater. **Island Signals** asks one question:

> What must Pacific islands know to protect freshwater as the ocean warms and rises?

Six official challenge datasets are used. Surface temperature provides context. The main evidence comes from sea-surface temperature, sea level, rainfall, safely managed drinking-water access and the meteorological monitoring network.

These comparisons do not form a causal model. They show a shared physical pressure alongside different freshwater conditions, service levels and formal observation."""
    ),
    nbf.v4.new_code_cell(
        """from pathlib import Path
import numpy as np
import pandas as pd

DATA_DIR = Path('data/source/challenge-2026')
OUTPUT_DIR = Path('analysis/outputs')
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

NAME_MAP = {
    'Micronesia (Federated States of)': 'Federated States of Micronesia',
    'Micronesia, Federated State of': 'Federated States of Micronesia',
}

def load_series(filename):
    frame = pd.read_csv(DATA_DIR / filename).rename(columns={
        'Pacific Island Countries and territories': 'territory',
        'TIME_PERIOD': 'year',
        'OBS_VALUE': 'value',
    })
    frame['territory'] = frame['territory'].replace(NAME_MAP)
    frame['year'] = pd.to_numeric(frame['year'], errors='coerce')
    frame['value'] = pd.to_numeric(frame['value'], errors='coerce')
    frame = frame[['territory', 'year', 'value']].dropna().sort_values(['territory', 'year'])
    duplicates = frame.duplicated(['territory', 'year']).sum()
    if duplicates:
        raise ValueError(f'{filename}: {duplicates} duplicate territory-year rows')
    return frame

def fitted_slope(group, multiplier=1):
    return np.polyfit(group['year'], group['value'], 1)[0] * multiplier

def trend_table(frame, multiplier=1):
    return (frame.groupby('territory')
        .apply(lambda group: pd.Series({
            'first_year': int(group.year.min()),
            'last_year': int(group.year.max()),
            'observations': len(group),
            'slope': fitted_slope(group, multiplier),
        }), include_groups=False)
        .reset_index())"""
    ),
    nbf.v4.new_markdown_cell(
        """## 1. The ocean is the common pressure

Sea-surface temperature and sea level answer different questions and use different units. Keeping them separate makes their shared direction more meaningful."""
    ),
    nbf.v4.new_code_cell(
        """surface = load_series('mean-surface-temperature-anomalies.csv')
sst = load_series('mean-sea-surface-temperature-anomalies.csv')
sea_level = load_series('sea-level-anomalies.csv')

surface_trends = trend_table(surface, 100).assign(indicator='Surface temperature', unit='°C per century')
sst_trends = trend_table(sst, 100).assign(indicator='Sea-surface temperature', unit='°C per century')
sea_level_trends = trend_table(sea_level, 1000).assign(indicator='Sea level', unit='millimetres per year')

ocean_summary = pd.concat([surface_trends, sst_trends, sea_level_trends], ignore_index=True)
(ocean_summary.groupby(['indicator', 'unit'])
 .agg(territories=('territory', 'nunique'), positive=('slope', lambda values: int((values > 0).sum())),
      minimum=('slope', 'min'), median=('slope', 'median'), maximum=('slope', 'max'))
 .round(3))"""
    ),
    nbf.v4.new_markdown_cell(
        """All 22 surface-temperature series have positive fitted trends. The 21 sea-surface-temperature series and 21 sea-level series also point upward. The direction is shared, but the result does not mean every year rose or every territory faces the same exposure. These records do not measure saltwater intrusion or aquifer condition."""
    ),
    nbf.v4.new_markdown_cell(
        """## 2. Rain is where the regional story breaks

Many island freshwater systems depend on rainfall. Two parts of the record matter here: the fitted direction from 1979 to 2025 and the size of the annual swings around the reference average."""
    ),
    nbf.v4.new_code_cell(
        """rainfall = load_series('rainfall-anomalies.csv')
rainfall_summary = (rainfall.groupby('territory')
    .apply(lambda group: pd.Series({
        'first_year': int(group.year.min()),
        'last_year': int(group.year.max()),
        'trend_per_year': fitted_slope(group),
        'annual_variability': group.value.std(ddof=1),
        'largest_absolute_anomaly': group.value.abs().max(),
    }), include_groups=False)
    .reset_index())

print('Upward fitted trends:', int((rainfall_summary.trend_per_year > 0).sum()))
print('Downward fitted trends:', int((rainfall_summary.trend_per_year < 0).sum()))
rainfall_summary.sort_values('annual_variability', ascending=False).head(8).round(2)"""
    ),
    nbf.v4.new_markdown_cell(
        """Fifteen fitted rainfall trends point upward and seven point downward. Annual variability also differs substantially. A Pacific average would hide the freshwater conditions that storage, drought and drainage decisions depend on. Neither direction is automatically good or bad.

**Peer-reviewed context.** White, Falkland and Redfern studied observations from Tarawa and Kiritimati, Kiribati, from 1951 to 2023. They found significant ocean warming but no significant long-term trend in annual rainfall. ENSO variability remained strong, and severe drought remained a freshwater challenge. Their study supports reading rainfall locally, but it is not part of the challenge-dataset calculation above. [White, Falkland and Redfern (2024)](https://doi.org/10.3390/atmos15060666)."""
    ),
    nbf.v4.new_markdown_cell(
        """## 3. Freshwater security begins from unequal access

The 2020 comparison keeps every territory in the same year. Safely managed drinking water means an improved source that is accessible on the premises, available when needed and free from contamination."""
    ),
    nbf.v4.new_code_cell(
        """safe_water = load_series('proportion-of-population-using-safely-managed-drinking-water-services.csv')
water_2020 = safe_water.loc[safe_water.year.eq(2020), ['territory', 'value']].sort_values('value')

print('Territories represented:', len(water_2020))
print('Range:', f'{water_2020.value.min():.2f}% to {water_2020.value.max():.2f}%')
print('Below 70%:', int((water_2020.value < 70).sum()))
water_2020"""
    ),
    nbf.v4.new_markdown_cell(
        """Access ranges from 48.11% to 100% across 19 territories, with three below 70%. This is the human stake in the investigation. It is also an existing service condition, not an outcome that can be attributed to the climate trends in this notebook."""
    ),
    nbf.v4.new_markdown_cell(
        """## 4. Local decisions need local observations

The official indicator counts fixed land climate-observation stations that comply with World Meteorological Organization standards. It does not include every instrument or source of weather information available to a territory."""
    ),
    nbf.v4.new_code_cell(
        """stations = load_series('meteorological-monitoring-network.csv')
stations_2026 = stations.loc[stations.year.eq(2026), ['territory', 'value']].sort_values('value')

print('Territories represented:', len(stations_2026))
print('Range:', f'{stations_2026.value.min():.0f} to {stations_2026.value.max():.0f} stations')
print('Reporting zero:', int((stations_2026.value == 0).sum()))
print('Reporting one or fewer:', int((stations_2026.value <= 1).sum()))
stations_2026"""
    ),
    nbf.v4.new_markdown_cell(
        """The 2026 comparison covers 18 territories and ranges from zero to eight compliant fixed land stations. Three report zero and five report one or fewer. Territory size, island dispersion and observing needs differ, so the count cannot judge adequacy. It does show that the formal observing base is uneven where local freshwater evidence matters most."""
    ),
    nbf.v4.new_markdown_cell(
        """## 5. What the four records say

The result is not simply that rainfall differs. The most local part of the freshwater problem is also the least uniform.

1. **Pressure:** every observed sea-surface-temperature and sea-level fitted trend points upward.
2. **Supply:** rainfall trends split and annual variability differs.
3. **Access:** safely managed drinking-water access spans 48.11% to 100% in the common 2020 comparison.
4. **Observation:** WMO-compliant fixed land station counts range from zero to eight among reporting territories.

The records point to a practical agenda: monitor coastal freshwater and rainfall, protect and extend safe-water services, and maintain the observing systems needed for early warning and long-term planning. Those priorities are suggested by the evidence; their effectiveness is not tested here.

Recent research supports the local part of that agenda. A study in Fiji, Vanuatu and Solomon Islands found that sustained rural water safety planning must be adapted to local governance, community management and ways of sharing knowledge. [Souter et al. (2024)](https://doi.org/10.2166/wh.2024.144).

> The ocean warning is shared. Freshwater security will be won or lost locally.

The next analysis needs aquifer condition, saltwater intrusion, drought, catchment storage, service reliability, demand and the geography of each observing network. Those records are necessary before judging network adequacy or choosing a local intervention.

### References

- White, I., Falkland, T. and Redfern, F. (2024). *Ocean Surface Warming and Long-Term Variability in Rainfall in Equatorial Pacific Atolls*. Atmosphere, 15(6), 666. https://doi.org/10.3390/atmos15060666
- Souter, R. T. C. et al. (2024). *Strengthening rural community water safety planning in Pacific Island countries: evidence and lessons from Solomon Islands, Vanuatu, and Fiji*. Journal of Water and Health, 22(3), 467–486. https://doi.org/10.2166/wh.2024.144"""
    ),
    nbf.v4.new_code_cell(
        """story_summary = (rainfall_summary
    .merge(water_2020.rename(columns={'value': 'safe_water_2020'}), on='territory', how='outer')
    .merge(stations_2026.rename(columns={'value': 'wmo_fixed_land_stations_2026'}), on='territory', how='outer'))
story_summary.to_csv(OUTPUT_DIR / 'water_story_summary.csv', index=False)
story_summary.sort_values('territory')"""
    ),
]

OUTPUT.parent.mkdir(parents=True, exist_ok=True)
for index, cell in enumerate(nb["cells"]):
    cell["id"] = f"island-signals-{index + 1:02d}"

namespace = {"__name__": "__main__"}
execution_count = 0
original_cwd = Path.cwd()
os.chdir(ROOT)
try:
    for cell in nb["cells"]:
        if cell["cell_type"] != "code":
            continue
        execution_count += 1
        source = "".join(cell["source"])
        tree = ast.parse(source)
        final_expression = tree.body.pop() if tree.body and isinstance(tree.body[-1], ast.Expr) else None
        stream = io.StringIO()
        with contextlib.redirect_stdout(stream):
            if tree.body:
                exec(compile(tree, str(OUTPUT), "exec"), namespace)
            result = eval(compile(ast.Expression(final_expression.value), str(OUTPUT), "eval"), namespace) if final_expression else None
        outputs = []
        if stream.getvalue():
            outputs.append({"name": "stdout", "output_type": "stream", "text": stream.getvalue().splitlines(keepends=True)})
        if result is not None:
            outputs.append({
                "data": {"text/plain": repr(result).splitlines(keepends=True)},
                "execution_count": execution_count,
                "metadata": {},
                "output_type": "execute_result",
            })
        cell["execution_count"] = execution_count
        cell["outputs"] = outputs
finally:
    os.chdir(original_cwd)

nbf.write(nb, OUTPUT)
print(OUTPUT)
