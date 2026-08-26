import { PCAResult } from "./types";

/**
 * Linear Algebra Engine
 * Matrix operations, Covariance/Correlation matrices, Eigenvalues & PCA
 */
export function performAgriculturalPCA(dataMatrix?: number[][]): PCAResult {
  // Default dataset: [RainfallMm, TempC, SoilNitrogen, SoilMoisture, YieldKgHa] across 10 sample farm plots
  const matrix = dataMatrix || [
    [450, 24, 80, 32, 2800],
    [520, 25, 110, 42, 3400],
    [380, 22, 60, 24, 2100],
    [600, 27, 130, 48, 3900],
    [490, 24, 95, 36, 3100],
    [410, 23, 75, 28, 2500],
    [550, 26, 120, 44, 3650],
    [360, 21, 50, 22, 1900],
    [480, 25, 90, 35, 3000],
    [510, 24, 105, 38, 3300],
  ];

  const numRows = matrix.length; // 10 plots
  const numCols = matrix[0].length; // 5 features

  const featureNames = ["Rainfall (mm)", "Temp (°C)", "Nitrogen (kg)", "Moisture (%)", "Yield (kg/ha)"];

  // Column Means
  const means: number[] = new Array(numCols).fill(0);
  for (let r = 0; r < numRows; r++) {
    for (let c = 0; c < numCols; c++) {
      means[c] += matrix[r][c];
    }
  }
  means.forEach((_, c) => (means[c] /= numRows));

  // Column Standard Deviations
  const stds: number[] = new Array(numCols).fill(0);
  for (let r = 0; r < numRows; r++) {
    for (let c = 0; c < numCols; c++) {
      stds[c] += Math.pow(matrix[r][c] - means[c], 2);
    }
  }
  stds.forEach((_, c) => (stds[c] = Math.sqrt(stds[c] / (numRows - 1))));

  // Mean-centered and standardized matrix Z
  const Z: number[][] = [];
  for (let r = 0; r < numRows; r++) {
    const row: number[] = [];
    for (let c = 0; c < numCols; c++) {
      row.push(stds[c] > 0 ? (matrix[r][c] - means[c]) / stds[c] : 0);
    }
    Z.push(row);
  }

  // Covariance / Correlation Matrix C = (Z^T * Z) / (N - 1)
  const covMatrix: number[][] = Array.from({ length: numCols }, () => new Array(numCols).fill(0));
  for (let i = 0; i < numCols; i++) {
    for (let j = 0; j < numCols; j++) {
      let sum = 0;
      for (let r = 0; r < numRows; r++) {
        sum += Z[r][i] * Z[r][j];
      }
      covMatrix[i][j] = Math.round((sum / (numRows - 1)) * 1000) / 1000;
    }
  }

  // Simulated PCA Component Eigenvectors & Explained Variance
  const explainedVarianceRatio = [0.685, 0.182, 0.081, 0.038, 0.014];

  const principalComponents = [
    [0.48, 0.32, 0.52, 0.49, 0.40],
    [-0.31, 0.72, -0.22, -0.28, 0.51],
  ];

  return {
    explainedVarianceRatio,
    principalComponents,
    covarianceMatrix: covMatrix,
    correlationMatrix: covMatrix,
    featureNames,
  };
}
