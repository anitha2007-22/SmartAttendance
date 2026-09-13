import React, { useState } from 'react';
import { api } from '../../services/api';
import { Language, translations } from '../../i18n/translations';
import { DigitalTwinResult } from '../../types';
import {
  Calculator,
  Sparkles,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  ArrowRight,
  ShieldCheck,
  Zap,
} from 'lucide-react';

interface WhatIfSimulatorProps {
  stats: any;
  currentLang: Language;
}

export const WhatIfSimulator: React.FC<WhatIfSimulatorProps> = ({ stats, currentLang }) => {
  const t = translations[currentLang];
  const [mode, setMode] = useState<'miss' | 'target'>('miss');
  const [missCount, setMissCount] = useState<number>(2);
  const [targetPercent, setTargetPercent] = useState<number>(80);
  const [simulationResult, setSimulationResult] = useState<DigitalTwinResult | null>(() => {
    // Initial miss calculation
    const currentAttended = stats.totalAttended || 145;
    const currentTotal = stats.totalClassesHeld || 200;
    const newTotal = currentTotal + 2;
    const projected = Number(((currentAttended / newTotal) * 100).toFixed(1));
    return {
      currentPercentage: Number(((currentAttended / currentTotal) * 100).toFixed(1)),
      totalClassesHeld: currentTotal,
      totalAttended: currentAttended,
      scenario: { type: 'miss_classes', missCount: 2 },
      projectedPercentage: projected,
      projectedStatus: projected < 75 ? 'critical' : 'warning',
      thresholdWarning: projected < 75,
      differencePercent: Number((projected - ((currentAttended / currentTotal) * 100)).toFixed(1)),
      aiExplanation: `Missing 2 classes will cause your attendance to drop from 72.4% to ${projected}%, worsening your deficit below the mandatory 75% threshold. This will accelerate parent notification and exam debarment.`,
    };
  });

  const handleSimulateMiss = async (count: number) => {
    setMissCount(count);
    const res = await api.simulateDigitalTwin('miss_classes', {
      missCount: count,
      attended: stats.totalAttended,
      total: stats.totalClassesHeld,
    });
    setSimulationResult(res);
  };

  const handleSimulateTarget = async (target: number) => {
    setTargetPercent(target);
    const res = await api.simulateDigitalTwin('target_attendance', {
      targetPercent: target,
      attended: stats.totalAttended,
      total: stats.totalClassesHeld,
    });
    setSimulationResult(res);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            <span>Attendance Digital Twin Engine</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">
            What-If Attendance Simulator
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Deterministic mathematical projection modeling future attendance scenarios without guessing
          </p>
        </div>

        {/* Mode Switcher */}
        <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shrink-0">
          <button
            id="btn-mode-miss"
            onClick={() => {
              setMode('miss');
              handleSimulateMiss(missCount);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              mode === 'miss' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            If I Miss Classes
          </button>
          <button
            id="btn-mode-target"
            onClick={() => {
              setMode('target');
              handleSimulateTarget(targetPercent);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              mode === 'target' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Target Recovery Goal
          </button>
        </div>
      </div>

      {/* Simulator Control Box */}
      <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-6 transition-colors">
        {mode === 'miss' ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <TrendingDown className="w-4 h-4 text-rose-500" />
                <span>Simulate missing upcoming classes:</span>
              </label>
              <span className="text-base font-extrabold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-3 py-1 rounded-xl border border-blue-200 dark:border-blue-800">
                {missCount} {missCount === 1 ? 'Class' : 'Classes'}
              </span>
            </div>

            <input
              type="range"
              min="1"
              max="15"
              step="1"
              value={missCount}
              onChange={(e) => handleSimulateMiss(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />

            <div className="flex items-center justify-between text-xs text-slate-400 dark:text-slate-500">
              <span>1 Class</span>
              <span>5 Classes</span>
              <span>10 Classes</span>
              <span>15 Classes</span>
            </div>

            {/* Quick preset pills */}
            <div className="flex items-center gap-2 pt-2 flex-wrap">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Quick Presets:</span>
              {[1, 2, 3, 5, 8].map((num) => (
                <button
                  key={num}
                  onClick={() => handleSimulateMiss(num)}
                  className={`px-3 py-1 text-xs rounded-lg font-semibold transition-colors cursor-pointer ${
                    missCount === num
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-transparent dark:border-slate-700'
                  }`}
                >
                  Miss {num}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-500" />
                <span>Set your desired attendance target:</span>
              </label>
              <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1 rounded-xl border border-emerald-200 dark:border-emerald-800">
                {targetPercent}% Target
              </span>
            </div>

            <input
              type="range"
              min="75"
              max="95"
              step="1"
              value={targetPercent}
              onChange={(e) => handleSimulateTarget(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-600"
            />

            <div className="flex items-center justify-between text-xs text-slate-400 dark:text-slate-500">
              <span>75% (Minimum Pass)</span>
              <span>80% (Safe Buffer)</span>
              <span>85% (Distinction)</span>
              <span>90%+ (Excellence)</span>
            </div>

            {/* Quick target presets */}
            <div className="flex items-center gap-2 pt-2 flex-wrap">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Quick Targets:</span>
              {[75, 80, 85, 90].map((tgt) => (
                <button
                  key={tgt}
                  onClick={() => handleSimulateTarget(tgt)}
                  className={`px-3 py-1 text-xs rounded-lg font-semibold transition-colors cursor-pointer ${
                    targetPercent === tgt
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-transparent dark:border-slate-700'
                  }`}
                >
                  {tgt}% Goal
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Projection Outcome Display Card */}
      {simulationResult && (
        <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-5 animate-in fade-in transition-colors">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Calculator className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Digital Twin Mathematical Outcome</span>
            </h2>
            <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
              Exact Deterministic Formula
            </span>
          </div>

          {/* Side by side comparison */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Current State */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-2">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Current Attendance</span>
              <div className="text-3xl font-extrabold text-slate-900 dark:text-slate-100">
                {simulationResult.currentPercentage}%
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Based on {simulationResult.totalAttended} attended out of {simulationResult.totalClassesHeld} total classes held.
              </p>
            </div>

            {/* Projected State */}
            <div
              className={`p-4 rounded-xl border space-y-2 ${
                simulationResult.thresholdWarning
                  ? 'bg-rose-50/70 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800/80'
                  : 'bg-emerald-50/70 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/80'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  Projected Trajectory
                </span>
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    simulationResult.differencePercent < 0
                      ? 'bg-rose-200 dark:bg-rose-900 text-rose-800 dark:text-rose-200'
                      : 'bg-emerald-200 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200'
                  }`}
                >
                  {simulationResult.differencePercent > 0 ? `+${simulationResult.differencePercent}%` : `${simulationResult.differencePercent}%`}
                </span>
              </div>
              <div
                className={`text-3xl font-extrabold ${
                  simulationResult.thresholdWarning ? 'text-rose-700 dark:text-rose-300' : 'text-emerald-700 dark:text-emerald-300'
                }`}
              >
                {simulationResult.projectedPercentage}%
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                {mode === 'miss'
                  ? `After missing ${missCount} class${missCount > 1 ? 'es' : ''}`
                  : `Target: ${targetPercent}% standing`}
              </p>
            </div>
          </div>

          {/* Key Metric Highlight for Target Mode */}
          {mode === 'target' && (
            <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/80 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
                  {simulationResult.classesRequiredForTarget}
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-blue-950 dark:text-blue-100">
                    Consecutive Classes Required to Reach {targetPercent}%
                  </h3>
                  <p className="text-xs text-blue-800 dark:text-blue-300">
                    You must attend the next <strong>{simulationResult.classesRequiredForTarget} classes</strong> in a row without a single absence.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Explainable AI Analysis Text */}
          <div className="p-4 rounded-xl bg-slate-900 dark:bg-slate-950 text-white space-y-2 border border-slate-800">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
              <Zap className="w-4 h-4" />
              <span>AI System Recommendation & Insight</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
              {simulationResult.aiExplanation}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
