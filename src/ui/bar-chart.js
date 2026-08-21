import rough from "roughjs";
import { formatTick, niceDomain } from "../core/math.js";

const SVG_NS = "http://www.w3.org/2000/svg";
const SHORT_NAMES = new Map([
  ["Federated States of Micronesia", "Micronesia, Fed. Sts."],
  ["Northern Mariana Islands", "N. Mariana Islands"],
]);

function svgText(text, x, y, className, anchor = "start") {
  const node = document.createElementNS(SVG_NS, "text");
  node.textContent = text;
  node.setAttribute("x", x);
  node.setAttribute("y", y);
  node.setAttribute("text-anchor", anchor);
  node.setAttribute("class", className);
  return node;
}

export function renderHorizontalBarChart({ dom, metric, rows, selectedTerritory, onSelect }) {
  const selectedValue = metric.value(selectedTerritory);
  dom.chartTitle.textContent = metric.title;
  dom.chartSubtitle.textContent = `${metric.subtitle}. Units: ${metric.unit}.`;
  dom.chartNote.textContent = metric.note;
  dom.selectedReading.replaceChildren();
  const reading = document.createElement("strong");
  reading.textContent = Number.isFinite(selectedValue) ? metric.format(selectedValue) : "n/a";
  const readingLabel = document.createElement("span");
  readingLabel.textContent = Number.isFinite(selectedValue) ? selectedTerritory : `No observation for ${selectedTerritory}`;
  dom.selectedReading.append(reading, readingLabel);

  const width = 820;
  const height = 430;
  const margin = { top: 13, right: 88, bottom: 40, left: 172 };
  const plotWidth = width - margin.left - margin.right;
  const plotHeight = height - margin.top - margin.bottom;
  const values = rows.map((row) => row.value);
  const scale = niceDomain(Math.min(0, ...values), Math.max(0, ...values), 5);
  const x = (value) => margin.left + ((value - scale.min) / (scale.max - scale.min)) * plotWidth;
  const zeroX = x(0);
  const rowHeight = plotHeight / Math.max(rows.length, 1);
  const barHeight = Math.max(6.5, Math.min(14.5, rowHeight * .6));
  const ticks = Array.from({ length: scale.count + 1 }, (_, index) => scale.min + index * scale.step);

  dom.chart.replaceChildren();
  dom.chart.setAttribute("viewBox", `0 0 ${width} ${height}`);
  const sketch = rough.svg(dom.chart);
  ticks.forEach((tick, index) => {
    const tx = x(tick);
    dom.chart.append(sketch.line(tx, margin.top, tx, height - margin.bottom, {
      seed: 500 + index,
      stroke: Math.abs(tick) < scale.step * .01 ? "rgba(38,69,63,.58)" : "rgba(38,69,63,.14)",
      strokeWidth: Math.abs(tick) < scale.step * .01 ? 1.35 : .75,
      roughness: .75,
      bowing: .6,
    }));
    dom.chart.append(svgText(formatTick(tick), tx, height - 15, "chart-tick", "middle"));
  });

  rows.forEach((row, index) => {
    const group = document.createElementNS(SVG_NS, "g");
    group.classList.add("chart-row");
    if (row.name === selectedTerritory) group.classList.add("is-selected");
    group.dataset.territory = row.name;
    group.setAttribute("tabindex", "0");
    group.setAttribute("role", "button");
    group.setAttribute("aria-label", `${row.name}: ${metric.format(row.value)}`);
    const y = margin.top + index * rowHeight + rowHeight * .5;
    const valueX = x(row.value);
    const barX = Math.min(zeroX, valueX);
    const barWidth = Math.max(2, Math.abs(valueX - zeroX));
    const color = row.value < 0 && metric.negativeColor ? metric.negativeColor : metric.color;
    const label = SHORT_NAMES.get(row.name) || row.name;
    group.append(svgText(label, margin.left - 11, y + 3.6, "chart-label", "end"));
    const bar = sketch.rectangle(barX, y - barHeight * .5, barWidth, barHeight, {
      seed: 800 + index,
      stroke: row.name === selectedTerritory ? "#234c43" : color,
      strokeWidth: row.name === selectedTerritory ? 2 : 1.05,
      fill: color,
      fillStyle: "solid",
      roughness: 1.05,
      bowing: 1.2,
    });
    bar.classList.add("chart-bar");
    group.append(bar);
    group.append(svgText(metric.format(row.value), row.value >= 0 ? valueX + 6 : valueX - 6, y + 3.2, "chart-value", row.value >= 0 ? "start" : "end"));
    dom.chart.append(group);
  });
  dom.chart.append(svgText(metric.unit, margin.left + plotWidth * .5, height - 1, "chart-tick", "middle"));

  dom.chart.querySelectorAll(".chart-row").forEach((group) => {
    const name = group.dataset.territory;
    const value = metric.value(name);
    const choose = () => onSelect(name);
    group.addEventListener("click", choose);
    group.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") { event.preventDefault(); choose(); }
    });
    group.addEventListener("pointerenter", () => {
      dom.tooltip.replaceChildren();
      const strong = document.createElement("strong");
      strong.textContent = name;
      dom.tooltip.append(strong, document.createTextNode(metric.format(value)));
      dom.tooltip.hidden = false;
    });
    group.addEventListener("pointermove", (event) => {
      const bounds = dom.chartFrame.getBoundingClientRect();
      dom.tooltip.style.left = `${Math.max(70, Math.min(bounds.width - 70, event.clientX - bounds.left))}px`;
      dom.tooltip.style.top = `${Math.max(55, event.clientY - bounds.top)}px`;
    });
    group.addEventListener("pointerleave", () => { dom.tooltip.hidden = true; });
  });
}
