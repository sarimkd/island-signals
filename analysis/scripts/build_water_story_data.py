"""Build the small browser dataset used by the Island Signals water story."""

from __future__ import annotations

import json
from pathlib import Path

import numpy as np
import pandas as pd


ROOT = Path(__file__).resolve().parents[2]
SOURCE = ROOT / "data" / "source" / "challenge-2026"
PROCESSED = ROOT / "data" / "processed" / "water-story-data.js"

NAME_MAP = {
    "Micronesia (Federated States of)": "Federated States of Micronesia",
    "Micronesia, Federated State of": "Federated States of Micronesia",
}


def load_series(filename: str) -> pd.DataFrame:
    frame = pd.read_csv(SOURCE / filename)
    frame = frame.rename(
        columns={
            "Pacific Island Countries and territories": "territory",
            "TIME_PERIOD": "year",
            "OBS_VALUE": "value",
        }
    )
    frame["territory"] = frame["territory"].replace(NAME_MAP)
    frame["year"] = pd.to_numeric(frame["year"], errors="coerce")
    frame["value"] = pd.to_numeric(frame["value"], errors="coerce")
    return frame[["territory", "year", "value"]].dropna().sort_values(["territory", "year"])


def as_series(frame: pd.DataFrame) -> dict[str, list[list[float]]]:
    return {
        name: [[int(year), round(float(value), 2)] for year, value in group[["year", "value"]].to_numpy()]
        for name, group in frame.groupby("territory", sort=True)
    }


def slope(group: pd.DataFrame) -> float:
    return float(np.polyfit(group["year"], group["value"], 1)[0])


def build() -> dict:
    water = load_series("proportion-of-population-using-safely-managed-drinking-water-services.csv")
    stations = load_series("meteorological-monitoring-network.csv")
    rainfall = load_series("rainfall-anomalies.csv")
    sst = load_series("mean-sea-surface-temperature-anomalies.csv")
    sea_level = load_series("sea-level-anomalies.csv")

    water_2020 = water.loc[water["year"].eq(2020)].set_index("territory")["value"].to_dict()
    station_2026 = stations.loc[stations["year"].eq(2026)].set_index("territory")["value"].to_dict()
    rainfall_summary = rainfall.groupby("territory").apply(
        lambda group: pd.Series(
            {
                "trend": slope(group),
                "variability": group["value"].std(ddof=1),
                "largest_absolute_anomaly": group["value"].abs().max(),
            }
        ),
        include_groups=False,
    )
    sst_trends = sst.groupby("territory").apply(slope, include_groups=False)
    sea_level_trends = sea_level.groupby("territory").apply(slope, include_groups=False)

    result = {
        "safe_water_series": as_series(water),
        "safe_water_2020": {name: round(float(value), 2) for name, value in sorted(water_2020.items())},
        "station_series": as_series(stations),
        "station_2026": {name: int(value) for name, value in sorted(station_2026.items())},
        "rainfall_variability": {
            name: round(float(value), 3)
            for name, value in rainfall_summary["variability"].sort_index().items()
        },
        "summary": {
            "sst_territories": len(sst_trends),
            "sst_positive_trends": int(sum(sst_trends > 0)),
            "sea_level_territories": len(sea_level_trends),
            "sea_level_positive_trends": int(sum(sea_level_trends > 0)),
            "rainfall_territories": len(rainfall_summary),
            "rainfall_positive_trends": int(sum(rainfall_summary["trend"] > 0)),
            "rainfall_negative_trends": int(sum(rainfall_summary["trend"] < 0)),
            "water_territories_2020": len(water_2020),
            "water_2020_min": round(float(min(water_2020.values())), 2),
            "water_2020_max": round(float(max(water_2020.values())), 2),
            "water_2020_below_70": int(sum(value < 70 for value in water_2020.values())),
            "station_territories_2026": len(station_2026),
            "station_2026_zero": int(sum(value == 0 for value in station_2026.values())),
            "station_2026_one_or_less": int(sum(value <= 1 for value in station_2026.values())),
            "station_2026_min": int(min(station_2026.values())),
            "station_2026_max": int(max(station_2026.values())),
        },
    }

    PROCESSED.write_text(f"const WATER_STORY = {json.dumps(result, separators=(',', ':'))};\n", encoding="utf-8")
    return result


if __name__ == "__main__":
    data = build()
    print(json.dumps(data["summary"], indent=2))
