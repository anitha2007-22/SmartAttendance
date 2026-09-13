import React from 'react';
import { SIH_SCENARIOS, DEMO_USERS } from '../../data/mockDatabase';
import { Language } from '../../i18n/translations';
import { User } from '../../types';
import {
  PlayCircle,
  QrCode,
  ShieldAlert,
  Brain,
  Calculator,
  Activity,
  WifiOff,
  History,
  X,
  ArrowRight,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';

interface SIHScenariosModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectScenario: (scenarioId: string) => void;
  currentLang: Language;
}

export const SIHScenariosModal: React.FC<SIHScenariosModalProps> = ({
  isOpen,
  onClose,
  onSelectScenario,
  currentLang,
}) => {
  if (!isOpen) return null;

  const getScenarioIcon = (id: string) => {
    switch (id) {
      case 'sc-dynamic-qr':
        return <QrCode className="w-5 h-5 text-blue-600" />;
      case 'sc-screenshot-block':
        return <ShieldAlert className="w-5 h-5 text-rose-600" />;
      case 'sc-impossible-geo':
        return <ShieldAlert className="w-5 h-5 text-purple-600" />;
      case 'sc-xai-risk':
        return <Brain className="w-5 h-5 text-amber-600" />;
      case 'sc-digital-twin':
        return <Calculator className="w-5 h-5 text-emerald-600" />;
      case 'sc-human-override':
        return <History className="w-5 h-5 text-indigo-600" />;
      case 'sc-offline-sync':
        return <WifiOff className="w-5 h-5 text-orange-600" />;
      default:
        return <Sparkles className="w-5 h-5 text-blue-600" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-5 max-h-[90vh] overflow-y-auto animate-in zoom-in-95">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white flex items-center justify-center shadow-xs">
              <PlayCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                Interactive Demonstration Scenarios
              </h2>
              <p className="text-xs text-slate-500">
                1-Click simulations to test and evaluate key attendance engine capabilities
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3">
          {SIH_SCENARIOS.map((scenario, idx) => (
            <div
              key={scenario.id}
              onClick={() => {
                onSelectScenario(scenario.id);
                onClose();
              }}
              className="p-4 rounded-xl border border-slate-200 hover:border-blue-500/60 hover:bg-blue-50/40 transition-all cursor-pointer group flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-slate-100 group-hover:bg-white border border-slate-200/80 shrink-0 mt-0.5">
                  {getScenarioIcon(scenario.id)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                      Scenario {idx + 1}
                    </span>
                    <span className="text-xs font-bold text-slate-900 group-hover:text-blue-700">
                      {scenario.title}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    {scenario.description}
                  </p>
                  <div className="text-[11px] text-emerald-700 font-semibold mt-1 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Outcome: {scenario.expectedOutcome}</span>
                  </div>
                </div>
              </div>

              <div className="self-end sm:self-center shrink-0">
                <span className="px-3 py-1.5 rounded-xl bg-blue-600 text-white font-bold text-xs shadow-xs group-hover:bg-blue-700 transition-colors flex items-center gap-1.5">
                  <span>Launch</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
