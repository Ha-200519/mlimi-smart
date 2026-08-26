export interface StatisticalSummary {
  count: number;
  mean: number;
  median: number;
  variance: number;
  standardDeviation: number;
  coefficientOfVariationPercent: number;
  p25: number;
  p75: number;
  min: number;
  max: number;
  confidenceInterval95: { lower: number; upper: number };
}

/**
 * Robust Statistical Analysis Functions
 */
export function calculateStatistics(data: number[]): StatisticalSummary {
  if (!data || data.length === 0) {
    return {
      count: 0,
      mean: 0,
      median: 0,
      variance: 0,
      standardDeviation: 0,
      coefficientOfVariationPercent: 0,
      p25: 0,
      p75: 0,
      min: 0,
      max: 0,
      confidenceInterval95: { lower: 0, upper: 0 },
    };
  }

  const N = data.length;
  const sorted = [...data].sort((a, b) => a - b);

  const sum = data.reduce((a, b) => a + b, 0);
  const mean = sum / N;

  const median = N % 2 === 0 ? (sorted[N / 2 - 1] + sorted[N / 2]) / 2 : sorted[Math.floor(N / 2)];

  const variance = data.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / (N > 1 ? N - 1 : 1);
  const stdDev = Math.sqrt(variance);

  const cv = mean !== 0 ? (stdDev / Math.abs(mean)) * 100 : 0;

  const getPercentile = (p: number) => {
    const idx = (p / 100) * (N - 1);
    const lower = Math.floor(idx);
    const upper = Math.ceil(idx);
    const weight = idx - lower;
    return sorted[lower] * (1 - weight) + sorted[upper] * weight;
  };

  const p25 = getPercentile(25);
  const p75 = getPercentile(75);

  const marginOfError = 1.96 * (stdDev / Math.sqrt(N));
  const lowerCI = mean - marginOfError;
  const upperCI = mean + marginOfError;

  return {
    count: N,
    mean: Math.round(mean * 100) / 100,
    median: Math.round(median * 100) / 100,
    variance: Math.round(variance * 100) / 100,
    standardDeviation: Math.round(stdDev * 100) / 100,
    coefficientOfVariationPercent: Math.round(cv * 10) / 10,
    p25: Math.round(p25 * 100) / 100,
    p75: Math.round(p75 * 100) / 100,
    min: sorted[0],
    max: sorted[N - 1],
    confidenceInterval95: {
      lower: Math.round(lowerCI * 100) / 100,
      upper: Math.round(upperCI * 100) / 100,
    },
  };
}
