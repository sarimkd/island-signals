import rough from "roughjs";
import { formatTick, niceDomain } from "../core/math.js";

const SVG_NS = "http://www.w3.org/2000/svg";

function textNode(text, x, y, className, anchor = "start") {
  const node = document.createElementNS(SVG_NS, "text");
  node.textContent = text;
  node.setAttribute("x", x);
  node.setAttribute("y", y);
  node.setAttribute("text-anchor", anchor);
  node.setAttribute("class", className);
  return node;
}

function renderMap({ dom, metric, territories, selectedTerritory, coords, onSelect }) {
  const width = 820;
  const height = 430;
  const sketch = rough.svg(dom.chart);
  const rows = territories.map((name) => ({ name, value: metric.value(name), coord: coords[name] })).filter((row) => row.coord && Number.isFinite(row.value));
  const values = rows.map((row) => row.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const longitude = (value) => value < 0 ? value + 360 : value;
  const x = (lon) => 54 + ((longitude(lon) - 130) / 105) * 712;
  const y = (lat) => 48 + ((20 - lat) / 52) * 326;

  dom.chartTitle.textContent = `Where ${metric.label.toLowerCase()} sits across the Pacific`;
  dom.chartSubtitle.textContent = "A schematic Pacific-centred map. Dot size shows the fitted value; position is geographic.";
  dom.chartNote.textContent = "The map is deliberately schematic. Use the labelled values for comparison, not island area.";
  dom.chart.replaceChildren();
  dom.chart.setAttribute("viewBox", `0 0 ${width} ${height}`);
  dom.chart.append(sketch.rectangle(35, 28, 750, 360, { seed: 401, stroke: "#6d9eaa", strokeWidth: 1.2, roughness: 1.5, bowing: 1.3, fill: "rgba(104,181,196,.08)", fillStyle: "hachure", hachureGap: 12 }));
  [-20, 0, 20].forEach((lat, index) => dom.chart.append(sketch.line(38, y(lat), 782, y(lat), { seed: 420 + index, stroke: "rgba(49,94,84,.18)", strokeWidth: .8, roughness: 1.2 })));
  rows.forEach((row, index) => {
    const ratio = max === min ? .5 : (row.value - min) / (max - min);
    const radius = 5 + ratio * 9;
    const selected = row.name === selectedTerritory;
    const dot = sketch.circle(x(row.coord[1]), y(row.coord[0]), radius * 2, {
      seed: 500 + index,
      stroke: selected ? "#173f3a" : metric.color,
      strokeWidth: selected ? 2.4 : 1.2,
      fill: row.value < 0 && metric.negativeColor ? metric.negativeColor : metric.color,
      fillStyle: "solid",
      roughness: 1.2,
    });
    dot.classList.add("map-dot");
    dot.setAttribute("tabindex", "0");
    dot.setAttribute("role", "button");
    dot.setAttribute("aria-label", `${row.name}: ${metric.format(row.value)}`);
    const choose = () => onSelect(row.name);
    dot.addEventListener("click", choose);
    dot.addEventListener("keydown", (event) => { if (event.key === "Enter" || event.key === " ") choose(); });
    dom.chart.append(dot);
    if (selected) {
      dom.chart.append(textNode(row.name, x(row.coord[1]), y(row.coord[0]) - radius - 10, "chart-map-label", "middle"));
      dom.chart.append(textNode(metric.format(row.value), x(row.coord[1]), y(row.coord[0]) + radius + 17, "chart-value", "middle"));
    }
  });
}

function renderSeries({ dom, metric, stationId, selectedTerritory, data }) {
  const series = stationId === "rain" ? data.extra[selectedTerritory]?.rainfall_series
    : stationId === "life" ? data.redlist_series[selectedTerritory]
      : data.extra[selectedTerritory]?.sea_level_series;
  const rows = (series || []).filter((point) => Number.isFinite(point[0]) && Number.isFinite(point[1]));
  const width = 820;
  const height = 430;
  const margin = { top: 34, right: 38, bottom: 48, left: 76 };
  const values = rows.map((point) => point[1]);
  const domain = niceDomain(Math.min(...values), Math.max(...values), 5);
  const firstYear = rows[0]?.[0] || 0;
  const lastYear = rows.at(-1)?.[0] || 1;
  const x = (year) => margin.left + ((year - firstYear) / Math.max(1, lastYear - firstYear)) * (width - margin.left - margin.right);
  const y = (value) => margin.top + ((domain.max - value) / Math.max(.0001, domain.max - domain.min)) * (height - margin.top - margin.bottom);
  const sketch = rough.svg(dom.chart);

  dom.chartTitle.textContent = `${selectedTerritory}, year by year`;
  dom.chartSubtitle.textContent = stationId === "rain" ? "Annual rainfall anomaly" : stationId === "life" ? "Red List Index" : "Satellite-era sea-level anomaly";
  dom.chartNote.textContent = "The uneven line is the annual record. The chapter overview summarises its overall direction.";
  dom.chart.replaceChildren();
  dom.chart.setAttribute("viewBox", `0 0 ${width} ${height}`);
  if (!rows.length) {
    dom.chart.append(textNode("No annual series is available for this selection.", width / 2, height / 2, "chart-empty", "middle"));
    return;
  }
  Array.from({ length: domain.count + 1 }, (_, index) => domain.min + domain.step * index).forEach((tick, index) => {
    dom.chart.append(sketch.line(margin.left, y(tick), width - margin.right, y(tick), { seed: 620 + index, stroke: "rgba(49,94,84,.16)", strokeWidth: .8, roughness: .9 }));
    dom.chart.append(textNode(formatTick(tick), margin.left - 12, y(tick) + 4, "chart-tick", "end"));
  });
  const path = rows.map((point, index) => `${index ? "L" : "M"}${x(point[0]).toFixed(2)} ${y(point[1]).toFixed(2)}`).join(" ");
  dom.chart.append(sketch.path(path, { seed: 700, stroke: metric.color, strokeWidth: 2.8, roughness: 1.05, bowing: .8 }));
  rows.filter((_point, index) => index % Math.max(1, Math.floor(rows.length / 7)) === 0 || index === rows.length - 1).forEach((point, index) => {
    dom.chart.append(sketch.circle(x(point[0]), y(point[1]), 5.5, { seed: 750 + index, stroke: metric.color, fill: "#fbfaf2", fillStyle: "solid", roughness: .8 }));
  });
  [firstYear, Math.round((firstYear + lastYear) / 2), lastYear].forEach((year) => dom.chart.append(textNode(year, x(year), height - 18, "chart-tick", "middle")));
}

export function renderNotebookDetail(options) {
  const { dom, stationId, metric, selectedTerritory, territories, data, onSelect } = options;
  const value = metric.value(selectedTerritory);
  dom.selectedReading.replaceChildren();
  const reading = document.createElement("strong");
  reading.textContent = Number.isFinite(value) ? metric.format(value) : "n/a";
  const label = document.createElement("span");
  label.textContent = selectedTerritory;
  dom.selectedReading.append(reading, label);
  if (stationId === "land" || (stationId === "ocean" && metric.label.includes("surface"))) {
    renderMap({ ...options, territories, selectedTerritory, coords: data.coords, onSelect });
  } else {
    renderSeries({ ...options, selectedTerritory, data });
  }
}
