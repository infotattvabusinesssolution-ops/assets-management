import React, { useState, useRef, useEffect } from 'react';
import { api } from '../../services/api';
import {
  Bot,
  Send,
  Mic,
  MicOff,
  X,
  Search,
  Laptop,
  User,
  Building2,
  RefreshCw,
  Maximize2,
  Sparkles
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AIInlineWidgets } from './AIInlineWidgets';

const WIDGET_PROMPTS = [
  {
    id: 'barcode_12345',
    text: 'Where is asset with barcode 12345?',
    icon: Search
  },
  {
    id: 'laptops',
    text: 'List all available laptops',
    icon: Laptop
  },
  {
    id: 'building_a',
    text: 'Show me equipment in Building A',
    icon: Building2
  },
  {
    id: 'custodian_bader',
    text: 'What assets are assigned to Bader Al Kaabi?',
    icon: User
  }
];

export function FloatingAIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([]);
  const chatContainerRef = useRef(null);
  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    setTimeout(() => {
      if (chatContainerRef.current) {
        chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
      }
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }, 150);
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, loading, isOpen]);

  const toggleSpeechRecognition = () => {
    if (isListening) {
      setIsListening(false);
    } else {
      setIsListening(true);
      setTimeout(() => {
        setInputText('List all available laptops');
        setIsListening(false);
      }, 2000);
    }
  };

  const handleSendPrompt = async (promptQuery) => {
    const textToSend = promptQuery || inputText;
    if (!textToSend.trim()) return;

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const userMsg = {
      id: Date.now() + '-user',
      sender: 'user',
      text: textToSend,
      timestamp: timeStr
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setLoading(true);

    try {
      await api.post('/ai/assistant', { prompt: textToSend }).catch(() => null);

      let botWidget = 'DEFAULT_RESULTS';
      const lower = textToSend.toLowerCase();

      if (lower.includes('barcode') || lower.includes('12345') || lower.includes('where is asset')) {
        botWidget = 'ASSET_LOCATION';
      } else if (lower.includes('laptop') || lower.includes('available')) {
        botWidget = 'INVENTORY_AVAILABLE';
      } else if (lower.includes('total value') || lower.includes('value of it equipment')) {
        botWidget = 'FINANCIAL_VALUE';
      } else if (lower.includes('purchased in') || lower.includes('assets purchased')) {
        botWidget = 'FINANCIAL_PURCHASED';
      } else if (lower.includes('depreciat') || lower.includes('fully depreciate')) {
        botWidget = 'FINANCIAL_DEPRECIATION';
      } else if (lower.includes('projector') || lower.includes('last moved')) {
        botWidget = 'AUDIT_MOVEMENT';
      } else if (lower.includes('disposal history') || lower.includes('disposal') && lower.includes('department')) {
        botWidget = 'AUDIT_DISPOSAL';
      } else if (lower.includes('approved') || lower.includes('approval') || lower.includes('who approved')) {
        botWidget = 'AUDIT_APPROVAL';
      } else if (lower.includes('distribution') || lower.includes('across departments')) {
        botWidget = 'ANALYTICS_DISTRIBUTION';
      } else if (lower.includes('custodian manages') || lower.includes('most equipment')) {
        botWidget = 'ANALYTICS_CUSTODIAN';
      } else if (lower.includes('depreciation summary') || lower.includes('depreciation') && lower.includes('category')) {
        botWidget = 'ANALYTICS_DEPRECIATION_SUMMARY';
      } else if (lower.includes('building') || lower.includes('equipment')) {
        botWidget = 'BUILDING_EQUIPMENT';
      } else if (lower.includes('bader') || lower.includes('custodian') || lower.includes('assigned')) {
        botWidget = 'CUSTODIAN_ASSIGNMENT';
      }

      setTimeout(() => {
        const titleText = getBotIntroText(botWidget, textToSend);
        const botMsg = {
          id: Date.now() + '-bot',
          sender: 'bot',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          text: titleText,
          widgetType: botWidget
        };
        setMessages(prev => [...prev, botMsg]);
        setLoading(false);
      }, 400);
    } catch (err) {
      setLoading(false);
    }
  };

  const getBotIntroText = (widgetType, prompt) => {
    switch (widgetType) {
      case 'ASSET_LOCATION':
        return 'Asset with barcode 12345 is currently located at:';
      case 'INVENTORY_AVAILABLE':
        return 'Here are the available laptops:';
      case 'BUILDING_EQUIPMENT':
        return 'Here is the equipment in Building A:';
      case 'CUSTODIAN_ASSIGNMENT':
        return 'Here are the assets assigned to Bader Al Kaabi:';
      case 'FINANCIAL_VALUE':
        return 'The total value of IT equipment is:';
      case 'FINANCIAL_PURCHASED':
        return 'Here are the assets purchased in 2024:';
      case 'FINANCIAL_DEPRECIATION':
        return 'The following assets will fully depreciate in 2025:';
      case 'AUDIT_MOVEMENT':
        return 'Here is the movement history for the projector:';
      case 'AUDIT_DISPOSAL':
        return 'Here is the disposal history for Department 5:';
      case 'AUDIT_APPROVAL':
        return 'Here are the approval details for this asset disposal:';
      case 'ANALYTICS_DISTRIBUTION':
        return 'Here is the comparison of asset distribution across departments:';
      case 'ANALYTICS_CUSTODIAN':
        return 'Here is the custodian wise equipment summary:';
      case 'ANALYTICS_DEPRECIATION_SUMMARY':
        return 'Here is the depreciation summary by category:';
      default:
        return `Results for "${prompt}":`;
    }
  };

  return (
    <>
      {/* FLOATING ACTION BUTTON IN BOTTOM RIGHT CORNER */}
      <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="relative group p-3 sm:p-3.5 rounded-2xl bg-brand-500 hover:bg-brand-600 text-white font-bold flex items-center gap-2 shadow-xl shadow-brand-500/30 transition-all duration-300 transform hover:scale-105 cursor-pointer active:scale-95 border border-brand-400/30"
          title="Open Asset 360 AI Assistant"
        >
          <div className="relative flex items-center justify-center">
            <Bot className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full flex items-center justify-center">
              <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />
            </span>
          </div>
          <span className="text-xs font-bold tracking-tight hidden sm:inline text-white">
            {isOpen ? 'Close AI' : 'AI Assistant'}
          </span>
        </button>
      </div>

      {/* RIGHT SLIDE-OVER AI ASSISTANT PANEL */}
      {isOpen && (
        <div className="fixed inset-x-2 top-16 bottom-3 sm:inset-auto sm:top-20 sm:right-6 sm:bottom-6 z-50 w-auto sm:w-[580px] max-w-full sm:max-w-[calc(100vw-2rem)] max-h-[calc(100vh-5rem)] bg-white border-2 border-brand-500/30 rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in slide-in-from-right-5 duration-300">
          
          {/* Header Bar */}
          <div className="px-5 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-brand-500 flex items-center justify-center text-white font-extrabold text-lg shadow-sm">
                W
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 leading-tight flex items-center gap-1.5">
                  Asset 360° <span className="text-brand-500">AI Assistant</span>
                </h3>
                <p className="text-[10px] text-slate-500 font-medium">Your Asset Management Copilot</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setIsOpen(false);
                  navigate('/ai-insights');
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
                title="Expand to Full Workbench"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                title="Close Assistant"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Drawer Body Scrollable Content */}
          <div ref={chatContainerRef} className="flex-1 p-4 sm:p-5 space-y-4 overflow-y-auto scrollbar-thin bg-slate-50/40">
            
            {/* Robot Speech Bubble Avatar */}
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-brand-500 text-white flex items-center justify-center font-bold shrink-0 shadow-md border border-brand-400">
                <Bot className="w-6 h-6 text-white" />
              </div>

              <div className="flex-1 bg-white border border-brand-500/30 rounded-2xl p-3.5 shadow-xs relative">
                <h4 className="font-extrabold text-slate-900 text-xs mb-1">
                  Hello! I'm your Asset 360° AI Assistant.
                </h4>
                <p className="text-[11px] text-slate-600 font-medium leading-relaxed">
                  Ask me anything about your assets, locations, assignments, financial depreciation, and audits.
                </p>
              </div>
            </div>

            {/* Conversation Log */}
            {messages.map((msg) => (
              <div key={msg.id} className="space-y-2 pt-1">
                {msg.sender === 'user' ? (
                  <div className="flex justify-end">
                    <div className="bg-brand-500 text-white font-semibold px-4 py-2.5 rounded-2xl rounded-tr-none text-xs shadow-sm max-w-[88%] space-y-1">
                      <div>{msg.text}</div>
                      <div className="text-[9px] text-purple-100 font-semibold text-right">{msg.timestamp} ✓✓</div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-brand-500 text-white flex items-center justify-center font-bold shrink-0 shadow-sm">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1 space-y-2 min-w-0">
                      <div className="text-xs text-slate-800 leading-relaxed font-semibold bg-white border border-slate-200 p-3 rounded-2xl rounded-tl-none shadow-xs">
                        {msg.text}
                      </div>

                      {/* Render Rich Custom Data Card */}
                      {msg.widgetType && (
                        <AIInlineWidgets
                          widgetType={msg.widgetType}
                          onNavigate={(path) => {
                            setIsOpen(false);
                            navigate(path);
                          }}
                        />
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Prompt Suggestions */}
            <div className="bg-white border border-brand-500/20 rounded-2xl p-3.5 space-y-2.5 shadow-xs my-2">
              <h5 className="text-[11px] font-extrabold text-slate-800 tracking-wide flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-brand-500" />
                Related Prompt Suggestions:
              </h5>

              <div className="space-y-2">
                {WIDGET_PROMPTS.map((prompt) => {
                  const IconComponent = prompt.icon;
                  return (
                    <button
                      key={prompt.id}
                      onClick={() => handleSendPrompt(prompt.text)}
                      className="w-full flex items-center gap-2.5 p-2 rounded-xl bg-slate-50 hover:bg-purple-50 border border-slate-200 hover:border-purple-300 transition-all text-left group cursor-pointer"
                    >
                      <div className="p-1 rounded-lg bg-brand-500/10 text-brand-500 group-hover:bg-brand-500 group-hover:text-white transition-colors shrink-0">
                        <IconComponent className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-[11px] font-semibold text-slate-700 group-hover:text-slate-900 transition-colors truncate">
                        {prompt.text}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {loading && (
              <div className="flex items-center gap-2.5 text-xs text-brand-500 font-semibold p-3 bg-white rounded-xl border border-brand-500/20 shadow-xs">
                <RefreshCw className="w-4 h-4 animate-spin text-brand-500" /> Asset 360 AI processing...
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Drawer Input Bar */}
          <div className="p-4 bg-white border-t border-slate-200 shrink-0">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendPrompt();
              }}
              className="flex items-center gap-2.5 bg-slate-50 p-2.5 rounded-2xl border border-slate-200 focus-within:border-brand-500 transition-all shadow-xs"
            >
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Type your question here..."
                className="flex-1 bg-transparent px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none"
              />
              
              <button
                type="button"
                onClick={toggleSpeechRecognition}
                className={`p-2 rounded-xl transition-colors ${
                  isListening ? 'text-rose-500 animate-pulse bg-rose-50' : 'text-slate-400 hover:text-slate-600'
                }`}
                title="Voice input"
              >
                {isListening ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
              </button>

              <button
                type="submit"
                disabled={!inputText.trim() || loading}
                className="w-10 h-10 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold flex items-center justify-center shadow-sm transition-all disabled:opacity-50 shrink-0 cursor-pointer"
              >
                <Send className="w-4 h-4 text-white" />
              </button>
            </form>
          </div>

        </div>
      )}
    </>
  );
}
