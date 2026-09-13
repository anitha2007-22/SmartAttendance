import React, { useState, useRef, useEffect } from 'react';
import { api } from '../../services/api';
import { Language, translations } from '../../i18n/translations';
import {
  Bot,
  Sparkles,
  Send,
  X,
  User,
  ArrowRight,
  TrendingDown,
  Calculator,
  ShieldCheck,
  Building,
  RotateCw,
} from 'lucide-react';

interface AICopilotDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentLang: Language;
  onNavigateToWhatIf?: () => void;
  onNavigateToRisk?: () => void;
  onNavigateToScan?: () => void;
}

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  suggestedActions?: { label: string; action: string }[];
}

export const AICopilotDrawer: React.FC<AICopilotDrawerProps> = ({
  isOpen,
  onClose,
  currentLang,
  onNavigateToWhatIf,
  onNavigateToRisk,
  onNavigateToScan,
}) => {
  const t = translations[currentLang];
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'msg-1',
      sender: 'ai',
      text: 'Hello! I am your Smart Attendance Intelligence Copilot. You can ask me anything about attendance thresholds, risk predictions, proxy anomaly diagnosis, or What-If recovery strategies.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestedActions: [
        { label: 'Why is Arun Kumar at risk?', action: 'risk_arun' },
        { label: 'How many DBMS classes needed for 80%?', action: 'whatif_dbms' },
        { label: 'Explain the Madurai proxy anomaly', action: 'proxy_madurai' },
        { label: 'What is our college average attendance?', action: 'college_avg' },
      ],
    },
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || inputQuery;
    if (!textToSend.trim() || isLoading) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setIsLoading(true);

    try {
      const response = await api.queryCopilot(textToSend);
      const aiMsg: Message = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: response.answer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedActions: response.suggestedFollowups.map((s) => ({
          label: s,
          action: 'followup',
        })),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-err-${Date.now()}`,
          sender: 'ai',
          text: 'I encountered an issue processing your query. Please ensure your backend is active.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleActionClick = (action: string, label: string) => {
    if (action === 'whatif_dbms' && onNavigateToWhatIf) {
      onNavigateToWhatIf();
      onClose();
      return;
    }
    if (action === 'risk_arun' && onNavigateToRisk) {
      onNavigateToRisk();
      onClose();
      return;
    }
    handleSend(label);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg h-full shadow-2xl flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-gradient-to-r from-blue-900 to-indigo-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/60 border border-blue-400/30 flex items-center justify-center text-white">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold">Attendance Copilot</h2>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5" />
                  AI Ready
                </span>
              </div>
              <p className="text-[11px] text-blue-200">
                Grounded on Institutional Attendance Data & Smart Attendance Engine
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-blue-200 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message Log */}
        <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-4 bg-slate-50/50">
          {messages.map((msg) => {
            const isAI = msg.sender === 'ai';
            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isAI ? 'justify-start' : 'justify-end'} animate-in fade-in`}
              >
                {isAI && (
                  <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 mt-1 shadow-xs">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed ${
                    isAI
                      ? 'bg-white border border-slate-200 text-slate-800 shadow-xs'
                      : 'bg-blue-600 text-white shadow-xs'
                  }`}
                >
                  <p className="whitespace-pre-line">{msg.text}</p>

                  {/* Suggested Followups */}
                  {msg.suggestedActions && msg.suggestedActions.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-slate-100 space-y-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        Quick Inquiries:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {msg.suggestedActions.map((action, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleActionClick(action.action, action.label)}
                            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 font-medium text-[11px] transition-colors border border-slate-200/80 cursor-pointer flex items-center gap-1"
                          >
                            <span>{action.label}</span>
                            <ArrowRight className="w-2.5 h-2.5 text-blue-500" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <span
                    className={`text-[9px] block text-right mt-1.5 ${
                      isAI ? 'text-slate-400' : 'text-blue-200'
                    }`}
                  >
                    {msg.timestamp}
                  </span>
                </div>

                {!isAI && (
                  <div className="w-8 h-8 rounded-xl bg-slate-800 text-white flex items-center justify-center shrink-0 mt-1">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}

          {isLoading && (
            <div className="flex gap-3 justify-start animate-in fade-in">
              <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center gap-2 text-xs text-slate-500">
                <div className="w-2 h-2 rounded-full bg-blue-600 animate-bounce" />
                <div className="w-2 h-2 rounded-full bg-blue-600 animate-bounce [animation-delay:0.2s]" />
                <div className="w-2 h-2 rounded-full bg-blue-600 animate-bounce [animation-delay:0.4s]" />
                <span className="ml-1">Analyzing institutional database...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Footer */}
        <div className="p-4 border-t border-slate-200 bg-white space-y-2">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Ask Copilot about debarment, risk, digital twin..."
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              className="flex-1 p-2.5 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
            <button
              type="submit"
              disabled={isLoading || !inputQuery.trim()}
              className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white shadow-xs transition-colors cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

          <p className="text-[10px] text-center text-slate-400">
            Smart Attendance Copilot utilizes deterministic mathematics + Gemini model integration.
          </p>
        </div>
      </div>
    </div>
  );
};
