export interface MetricTextMeasurement {
  availableWidth: number;
  naturalWidth: number;
}

/** All metrics use the size required by the widest value, preserving digits. */
export function fitMetricFontSize(measurements: readonly MetricTextMeasurement[], baseSize = 28) {
  return measurements.reduce((size, { availableWidth, naturalWidth }) => {
    if (availableWidth <= 0 || naturalWidth <= availableWidth)
      return size;
    return Math.min(size, Math.max(1, Math.floor((baseSize * availableWidth / naturalWidth) * 100) / 100));
  }, baseSize);
}
