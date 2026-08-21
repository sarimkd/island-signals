export function niceDomain(rawMin, rawMax, desiredTicks) {
  if (!Number.isFinite(rawMin) || !Number.isFinite(rawMax)) return { min: 0, max: 1, step: .2, count: 5 };
  if (rawMin === rawMax) rawMax = rawMin + 1;
  const rough = (rawMax - rawMin) / desiredTicks;
  const power = 10 ** Math.floor(Math.log10(rough));
  const fraction = rough / power;
  const niceFraction = fraction <= 1 ? 1 : fraction <= 2 ? 2 : fraction <= 5 ? 5 : 10;
  const step = niceFraction * power;
  const min = Math.floor(rawMin / step) * step;
  const max = Math.ceil(rawMax / step) * step;
  return { min, max, step, count: Math.round((max - min) / step) };
}

export function formatTick(value) {
  if (Math.abs(value) >= 10) return value.toFixed(0);
  if (Math.abs(value) >= 1) return value.toFixed(1).replace(/\.0$/, "");
  return value.toFixed(2).replace(/0+$/, "").replace(/\.$/, "");
}

export function signed(value, digits) {
  if (!Number.isFinite(value)) return "n/a";
  if (Math.abs(value) < 10 ** (-digits) * .5) return (0).toFixed(digits);
  return `${value > 0 ? "+" : "−"}${Math.abs(value).toFixed(digits)}`;
}

export function linearSlope(series) {
  if (!series || series.length < 2) return NaN;
  const meanX = series.reduce((sum, row) => sum + row[0], 0) / series.length;
  const meanY = series.reduce((sum, row) => sum + row[1], 0) / series.length;
  const denominator = series.reduce((sum, row) => sum + (row[0] - meanX) ** 2, 0);
  if (!denominator) return NaN;
  return series.reduce((sum, row) => sum + (row[0] - meanX) * (row[1] - meanY), 0) / denominator;
}

export function dampAngle(current, target, smoothing, delta) {
  let difference = (target - current + Math.PI) % (Math.PI * 2) - Math.PI;
  if (difference < -Math.PI) difference += Math.PI * 2;
  return current + difference * (1 - Math.exp(-smoothing * delta));
}
