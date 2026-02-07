
// Ranks for Psi-Hitting (Positive Z) and Psi-Missing (Negative Z)
export type PsiRank = {
  title: string;
  tier: 'HITTING' | 'MISSING' | 'BASELINE';
  description: string;
  color: string; // Tailwind color class
  minZ?: number; // Lower bound (inclusive)
  maxZ?: number; // Upper bound (inclusive for negative)
};

export const PSI_RANKS: PsiRank[] = [
  // PSI-HITTING (Positive)
  { title: "The Oracl e", tier: 'HITTING', description: "World Class Anomaly (1 in 31,000+).", color: "text-amber-400", minZ: 4.0 },
  { title: "The Medium", tier: 'HITTING', description: "Highly Significant (1 in 740).", color: "text-purple-400", minZ: 3.0 },
  { title: "The Clairvoyant", tier: 'HITTING', description: "Statistically Significant (p < 0.05).", color: "text-indigo-400", minZ: 1.96 },
  { title: "The Channel", tier: 'HITTING', description: "Tapping into something real (1 in 20).", color: "text-blue-400", minZ: 1.65 },
  { title: "The Adept", tier: 'HITTING', description: "Finding flow. Beating odds of 1 in 6.", color: "text-emerald-400", minZ: 1.0 },
  { title: "The Spark", tier: 'HITTING', description: "Pulse of intuition. Nudging past average.", color: "text-teal-400", minZ: 0.5 },
  { title: "The Initiate", tier: 'HITTING', description: "Above baseline. Better than random.", color: "text-slate-200", minZ: 0.0 },

  // PSI-MISSING (Negative)
  // Ordered by severity (logic below finds the 'deepest' match)
  { title: "The Void", tier: 'MISSING', description: "World Class Anomaly. Total suppression.", color: "text-slate-600", maxZ: -4.0 },
  { title: "The Shadow", tier: 'MISSING', description: "Highly Significant Displacement. Inverted.", color: "text-fuchsia-500", maxZ: -3.0 },
  { title: "Reality Inversion", tier: 'MISSING', description: "Significant Avoidance. Flipping the signal.", color: "text-rose-500", maxZ: -2.0 },
  { title: "Cognitive Dissonance", tier: 'MISSING', description: "Dodging targets. Logic fighting gut.", color: "text-red-400", maxZ: -1.0 },
  { title: "Signal Noise", tier: 'MISSING', description: "Drifting. Intuition active but unfocused.", color: "text-orange-400", maxZ: -0.5 },
  { title: "Desynchronized", tier: 'MISSING', description: "Just below baseline. Stop over-analyzing.", color: "text-slate-400", maxZ: -0.0000001 }
];

/**
 * Calculates the Z-score for a binomial distribution.
 * @param hits Number of successful guesses
 * @param trials Total number of attempts
 * @param chance Probability of success (0 to 1, e.g., 0.25 for 1 in 4)
 * @returns Z-score
 */
export function calculateZScore(hits: number, trials: number, chance: number): number {
  if (trials === 0) return 0;
  
  const p = chance;
  const q = 1 - p;
  const mean = trials * p;
  const stdDev = Math.sqrt(trials * p * q);
  
  if (stdDev === 0) return 0; // Avoid division by zero
  
  return (hits - mean) / stdDev;
}

/**
 * Gets the rank based on Z-score.
 */
export function getPsiRank(z: number): PsiRank {
  // Handle positive/baseline
  if (z >= 0) {
    for (const rank of PSI_RANKS) {
      if (rank.minZ !== undefined && z >= rank.minZ) {
        return rank;
      }
    }
    return PSI_RANKS.find(r => r.title === "The Initiate")!; 
  }
  
  // Handle negative
  // We want to find the "deepest" negative rank that applies.
  // The list has "Desynchronized" (< 0), "Signal Noise" (<= -0.5), etc.
  // We should match the most extreme condition first if we iterate, or sort.
  // Let's filter for negatives and sort by maxZ ascending (most negative first)
  const negativeRanks = PSI_RANKS.filter(r => r.maxZ !== undefined).sort((a, b) => (a.maxZ!) - (b.maxZ!));
  
  for (const rank of negativeRanks) {
    if (z <= rank.maxZ!) {
      return rank;
    }
  }
  
  // If it's negative but not <= -0.5, it falls into Desynchronized (z < 0)
  return PSI_RANKS.find(r => r.title === "Desynchronized")!;
}

export function formatProbability(p: number): string {
    if (p <= 0) return "0%";
    const oneIn = Math.round(1 / p);
    return `1 in ${oneIn}`;
}

const erf = (x: number) => {
  const a1 =  0.254829592;
  const a2 = -0.284496736;
  const a3 =  1.421413741;
  const a4 = -1.453152027;
  const a5 =  1.061405429;
  const p  =  0.3275911;
  const sign = (x < 0) ? -1 : 1;
  x = Math.abs(x);
  const t = 1.0 / (1.0 + p * x);
  const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
  return sign * y;
};

export function calculatePValue(z: number): string {
  if (Math.abs(z) < 0.01) return "1 in 2"; // Baseline

  // Two-tailed p-value? Or one-tailed? 
  // Usually for "hitting", we want one-tailed. Z=4.0 is significant.
  // Original code used: 0.5 * (1 - erf(Math.abs(z) / Math.sqrt(2)))
  // This is one-tailed for the tail beyond Z.

  const pValue = 0.5 * (1 - erf(Math.abs(z) / Math.sqrt(2)));
  if (pValue <= 0) return "1 in ∞"; 
  const oneInX = 1 / pValue;
  
  if (oneInX > 1000000) return `1 in ${(oneInX / 1000000).toFixed(1)}M`;
  if (oneInX > 1000) return `1 in ${(oneInX / 1000).toFixed(1)}k`;
  if (oneInX < 2) return "1 in 2";
  return `1 in ${Math.round(oneInX)}`;
}
