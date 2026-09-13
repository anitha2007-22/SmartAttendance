import { DigitalTwinResult } from '../types';

export function calculateMissScenario(
  currentAttended: number,
  currentTotal: number,
  missCount: number,
  targetThreshold: number = 75
): DigitalTwinResult {
  const newTotal = currentTotal + missCount;
  const newAttended = currentAttended;
  const currentPercent = Number(((currentAttended / currentTotal) * 100).toFixed(1));
  const projectedPercent = Number(((newAttended / newTotal) * 100).toFixed(1));
  const diff = Number((projectedPercent - currentPercent).toFixed(1));
  
  let projectedStatus: 'healthy' | 'warning' | 'critical' = 'healthy';
  if (projectedPercent < targetThreshold) {
    projectedStatus = 'critical';
  } else if (projectedPercent < targetThreshold + 5) {
    projectedStatus = 'warning';
  }

  const thresholdWarning = projectedPercent < targetThreshold;
  
  let aiExplanation = '';
  if (thresholdWarning) {
    aiExplanation = `Missing ${missCount} class${missCount > 1 ? 'es' : ''} will cause your attendance to plummet from ${currentPercent}% to ${projectedPercent}%, breaching the mandatory ${targetThreshold}% threshold. This will trigger automated parent notification and potential semester exam debarment.`;
  } else if (projectedStatus === 'warning') {
    aiExplanation = `Missing ${missCount} class${missCount > 1 ? 'es' : ''} will bring your attendance down to ${projectedPercent}%, putting you in the critical warning buffer zone (${targetThreshold}% - ${targetThreshold + 5}%).`;
  } else {
    aiExplanation = `Missing ${missCount} class${missCount > 1 ? 'es' : ''} will adjust your attendance from ${currentPercent}% to ${projectedPercent}%. You remain safely above the ${targetThreshold}% requirement.`;
  }

  return {
    currentPercentage: currentPercent,
    totalClassesHeld: currentTotal,
    totalAttended: currentAttended,
    scenario: {
      type: 'miss_classes',
      missCount,
    },
    projectedPercentage: projectedPercent,
    projectedStatus,
    thresholdWarning,
    differencePercent: diff,
    aiExplanation,
  };
}

export function calculateTargetScenario(
  currentAttended: number,
  currentTotal: number,
  targetPercent: number = 80
): DigitalTwinResult {
  const currentPercent = Number(((currentAttended / currentTotal) * 100).toFixed(1));
  const T = targetPercent / 100;
  
  let classesRequired = 0;
  if (currentPercent < targetPercent) {
    // (currentAttended + k) / (currentTotal + k) >= T
    // currentAttended + k >= T*currentTotal + T*k
    // k*(1 - T) >= T*currentTotal - currentAttended
    // k >= (T*currentTotal - currentAttended) / (1 - T)
    const numerator = T * currentTotal - currentAttended;
    const denominator = 1 - T;
    if (denominator > 0) {
      classesRequired = Math.max(0, Math.ceil(numerator / denominator));
    }
  }

  // Max classes you can afford to miss while maintaining >= targetThreshold
  const minRequiredThreshold = 75;
  const T_min = minRequiredThreshold / 100;
  let maxClassesCanMiss = 0;
  if (currentPercent >= minRequiredThreshold) {
    // currentAttended / (currentTotal + m) >= T_min
    // currentTotal + m <= currentAttended / T_min
    // m <= (currentAttended / T_min) - currentTotal
    maxClassesCanMiss = Math.max(0, Math.floor(currentAttended / T_min - currentTotal));
  }

  const projectedTotal = currentTotal + classesRequired;
  const projectedAttended = currentAttended + classesRequired;
  const projectedPercent = Number(((projectedAttended / projectedTotal) * 100).toFixed(1));

  let aiExplanation = '';
  if (classesRequired === 0) {
    aiExplanation = `You already meet or exceed the ${targetPercent}% target with your current ${currentPercent}% attendance rate. You can safely afford to miss up to ${maxClassesCanMiss} future classes while remaining above the mandatory ${minRequiredThreshold}% threshold.`;
  } else {
    aiExplanation = `To climb from ${currentPercent}% to ${targetPercent}%, you must attend the next ${classesRequired} consecutive classes without a single absence. Each attended class adds approximately +${((1 / (currentTotal + 1)) * 100).toFixed(1)}% to your overall standing.`;
  }

  return {
    currentPercentage: currentPercent,
    totalClassesHeld: currentTotal,
    totalAttended: currentAttended,
    scenario: {
      type: 'target_attendance',
      targetPercent,
    },
    projectedPercentage: projectedPercent,
    projectedStatus: targetPercent >= 75 ? 'healthy' : 'warning',
    thresholdWarning: false,
    differencePercent: Number((projectedPercent - currentPercent).toFixed(1)),
    classesRequiredForTarget: classesRequired,
    maxClassesCanMiss,
    aiExplanation,
  };
}
