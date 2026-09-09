import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { AIInlineWidgets } from '../components/common/AIInlineWidgets';
import {
  Bot,
  Send,
  Mic,
  MicOff,
  Sparkles,
  Search,
  Laptop,
  Building2,
  User,
  DollarSign,
  BarChart3,
  ShieldCheck,
  FileText,
  Settings,
  Home,
  ThumbsUp,
  ThumbsDown,
  Plus,
  MapPin,
  ChevronRight,
  FileSpreadsheet,
  Zap,
  TrendingUp,
  Lock,
  Database,
  UserCheck,
  Store,
  Box,
  AlertTriangle,
  RefreshCw,
  Info,
  CheckCircle2,
  Target,
  Clock,
  Layers,
  MessageSquare,
  Activity
} from 'lucide-react';

const SUGGESTED_PROMPTS = [
  // Asset Queries
  {
    id: 'barcode_12345',
    tab: 'queries',
    text: 'Where is asset with barcode 12345?',
    icon: Search
  },
  {
    id: 'laptops',
    tab: 'queries',
    text: 'List all available laptops',
    icon: Laptop
  },
  {
    id: 'building_a',
    tab: 'queries',
    text: 'Show me equipment in Building A',
    icon: Building2
  },
  {
    id: 'asset_status',
    tab: 'queries',
    text: 'How many assets are currently in use?',
    icon: Activity
  },

  // Assignment & Location
  {
    id: 'custodian_bader',
    tab: 'assignment',
    text: 'What assets are assigned to Bader Al Kaabi?',
    icon: User
  },
  {
    id: 'unassigned',
    tab: 'assignment',
    text: 'Show all unassigned assets',
    icon: UserCheck
  },
  {
    id: 'floor_map',
    tab: 'assignment',
    text: 'Show assets on 2nd floor Building A',
    icon: MapPin
  },
  {
    id: 'transfer_history',
    tab: 'assignment',
    text: 'Recent custody transfers this week',
    icon: RefreshCw
  },

  // Financial & Depreciation
  {
    id: 'total_value',
    tab: 'financial',
    text: "What's the total value of IT equipment?",
    icon: DollarSign
  },
  {
    id: 'purchased_2024',
    tab: 'financial',
    text: 'Show assets purchased in 2024',
    icon: TrendingUp
  },
  {
    id: 'depreciation',
    tab: 'financial',
    text: 'Which assets will fully depreciate this year?',
    icon: BarChart3
  },

  // Audit & History
  {
    id: 'projector_moved',
    tab: 'audit',
    text: 'When was this projector last moved?',
    icon: Clock
  },
  {
    id: 'disposal_history',
    tab: 'audit',
    text: 'Show disposal history for Department 5',
    icon: ShieldCheck
  },
  {
    id: 'disposal_approval',
    tab: 'audit',
    text: 'Who approved this asset disposal?',
    icon: AlertTriangle
  },

  // Analytics
  {
    id: 'distribution',
    tab: 'analytics',
    text: 'Compare asset distribution across departments',
    icon: BarChart3
  },
  {
    id: 'top_custodian',
    tab: 'analytics',
    text: 'Which custodian manages the most equipment?',
    icon: User
  },
  {
    id: 'depreciation_summary',
    tab: 'analytics',
    text: 'Show depreciation summary by category',
    icon: TrendingUp
  },

  // Reports
  {
    id: 'generate_report',
    tab: 'reports',
    text: 'Generate monthly asset summary report',
    icon: FileText
  },
  {
    id: 'export_inventory',
    tab: 'reports',
    text: 'Export full inventory to Excel',
    icon: FileSpreadsheet
  },
  {
    id: 'compliance_report',
    tab: 'reports',
    text: 'Create compliance audit report',
    icon: ShieldCheck
  },

  // Settings
  {
    id: 'ai_preferences',
    tab: 'settings',
    text: 'Show my AI assistant preferences',
    icon: Settings
  },
  {
    id: 'notification_config',
    tab: 'settings',
    text: 'Configure asset alert notifications',
    icon: AlertTriangle
  }
];

const CATEGORY_TABS = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'queries', label: 'Asset Queries', icon: Search },
  { id: 'assignment', label: 'Assignment & Location', icon: Target },
  { id: 'financial', label: 'Financial & Depreciation', icon: DollarSign },
  { id: 'audit', label: 'Audit & History', icon: ShieldCheck },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'reports', label: 'Reports', icon: FileText },
  { id: 'settings', label: 'Settings', icon: Settings }
];

export function AISuite() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('queries');
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [loading, setLoading] = useState(false);

  // Chat Conversation History
  const [messages, setMessages] = useState([
    {
      id: 'demo-msg-1',
      sender: 'user',
      text: 'Where is asset with barcode 12345?',
      timestamp: '10:30 AM'
    },
    {
      id: 'demo-msg-2',
      sender: 'bot',
      text: 'Asset with barcode 12345 is currently located at:',
      timestamp: '10:30 AM',
      widgetType: 'ASSET_LOCATION'
    }
  ]);

  // Active Query Results State (Initial default to Location Barcode 12345)
  const [activeResult, setActiveResult] = useState({
    title: 'Asset with barcode 12345 is currently located at:',
    widgetType: 'ASSET_LOCATION',
    apiData: []
  });

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
    scrollToBottom();
  }, [messages, loading]);

  const toggleSpeechRecognition = () => {
    if (isListening) {
      setIsListening(false);
    } else {
      setIsListening(true);
      setTimeout(() => {
        setInputText('Where is asset with barcode 12345?');
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
      const apiRes = await api.post('/ai/assistant', { prompt: textToSend }).catch(() => null);

      let botResponseWidget = 'DEFAULT_RESULTS';
      const lower = textToSend.toLowerCase();

      if (lower.includes('barcode') || lower.includes('12345') || lower.includes('where is asset')) {
        botResponseWidget = 'ASSET_LOCATION';
      } else if (lower.includes('laptop') || lower.includes('available')) {
        botResponseWidget = 'INVENTORY_AVAILABLE';
      } else if (lower.includes('total value') || lower.includes('value of it equipment')) {
        botResponseWidget = 'FINANCIAL_VALUE';
      } else if (lower.includes('purchased in') || lower.includes('assets purchased')) {
        botResponseWidget = 'FINANCIAL_PURCHASED';
      } else if (lower.includes('depreciat') || lower.includes('fully depreciate')) {
        botResponseWidget = 'FINANCIAL_DEPRECIATION';
      } else if (lower.includes('projector') || lower.includes('last moved')) {
        botResponseWidget = 'AUDIT_MOVEMENT';
      } else if (lower.includes('disposal history') || lower.includes('disposal') && lower.includes('department')) {
        botResponseWidget = 'AUDIT_DISPOSAL';
      } else if (lower.includes('approved') || lower.includes('approval') || lower.includes('who approved')) {
        botResponseWidget = 'AUDIT_APPROVAL';
      } else if (lower.includes('distribution') || lower.includes('across departments')) {
        botResponseWidget = 'ANALYTICS_DISTRIBUTION';
      } else if (lower.includes('custodian manages') || lower.includes('most equipment')) {
        botResponseWidget = 'ANALYTICS_CUSTODIAN';
      } else if (lower.includes('depreciation summary') || lower.includes('depreciation') && lower.includes('category')) {
        botResponseWidget = 'ANALYTICS_DEPRECIATION_SUMMARY';
      } else if (lower.includes('building') || lower.includes('equipment')) {
        botResponseWidget = 'BUILDING_EQUIPMENT';
      } else if (lower.includes('bader') || lower.includes('custodian') || lower.includes('assigned')) {
        botResponseWidget = 'CUSTODIAN_ASSIGNMENT';
      }

      setTimeout(() => {
        const titleText = getBotIntroText(botResponseWidget, textToSend);
        const botMsg = {
          id: Date.now() + '-bot',
          sender: 'bot',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          text: titleText,
          widgetType: botResponseWidget
        };
        setMessages(prev => [...prev, botMsg]);
        setActiveResult({
          title: titleText,
          widgetType: botResponseWidget,
          apiData: apiRes?.records || []
        });
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

  const handleNewConversation = () => {
    setMessages([]);
  };

  const handleExportExcel = (dataList, filename = 'Asset_360_Report.csv') => {
    const headers = ['Asset Name', 'Barcode', 'Category', 'Location', 'Status', 'Assigned On'];
    const sampleRows = dataList && dataList.length > 0 ? dataList : [
      ['Dell Latitude 5420', 'LAP10023', 'Laptop', 'Building A – 2nd Floor', 'In Use', '12 May 2025'],
      ['HP LaserJet Pro M404', 'PRN10012', 'Printer', 'Building A – 2nd Floor', 'In Use', '10 May 2025'],
      ['Samsung 55" TV', 'DISP10003', 'Display', 'Building C – Room 201', 'In Use', '08 May 2025'],
      ['Logitech MeetUp', 'CAM10007', 'Camera', 'Building C – Room 202', 'In Use', '05 May 2025'],
      ['APC Back-UPS 1100', 'POW10022', 'Power', 'Building A – Server Room', 'In Use', '02 May 2025']
    ];

    const rows = Array.isArray(sampleRows[0])
      ? sampleRows
      : sampleRows.map(item => [
          item.name || item.description,
          item.barcode || item.tagNumber,
          item.category || 'Equipment',
          item.location || 'Building A',
          item.status || 'In Use',
          item.assignedOn || '12 May 2025'
        ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-12 select-none w-full">
      {/* 1. TOP FULL-WIDTH PROMO HERO BANNER */}
      <div className="w-full bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-xs space-y-6">
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl -z-0 pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-brand-600 flex items-center justify-center text-white font-black text-2xl shadow-md shadow-brand-500/25">
                A
              </div>
              <div>
                <span className="font-extrabold text-slate-900 text-lg tracking-tight block leading-tight">Asset 360°</span>
                <span className="text-[10px] uppercase tracking-widest text-brand-600 font-bold">ASSET MANAGEMENT SOFTWARE</span>
              </div>
            </div>

            <div>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 leading-tight">
                Asset 360° <span className="text-brand-600">AI Assistant</span>
              </h1>
              <p className="text-sm font-bold text-slate-600 mt-1">
                Your Intelligent Partner for Smarter Asset Management
              </p>
            </div>
          </div>

          <p className="text-xs text-slate-500 max-w-xl leading-relaxed">
            Ask questions. Get answers. Take action. Asset 360° AI Assistant helps you find information, analyze data, and make smarter decisions <span className="text-brand-600 font-semibold">— instantly.</span>
          </p>
        </div>

        {/* 6 Feature Badges Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-2 relative z-10">
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full border border-brand-500/40 bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">
              <Search className="w-3.5 h-3.5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">Natural Queries</h4>
              <p className="text-[9px] text-slate-500">Ask in simple words</p>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full border border-brand-500/40 bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">
              <Zap className="w-3.5 h-3.5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">Instant Answers</h4>
              <p className="text-[9px] text-slate-500">Accurate results fast</p>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full border border-brand-500/40 bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">
              <BarChart3 className="w-3.5 h-3.5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">Smart Analytics</h4>
              <p className="text-[9px] text-slate-500">Visual decision data</p>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full border border-brand-500/40 bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">
              <Lock className="w-3.5 h-3.5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">Secure & Reliable</h4>
              <p className="text-[9px] text-slate-500">Enterprise security</p>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full border border-brand-500/40 bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">
              <Database className="w-3.5 h-3.5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">Connected Data</h4>
              <p className="text-[9px] text-slate-500">Real-time system data</p>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full border border-brand-500/40 bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">Actionable Insights</h4>
              <p className="text-[9px] text-slate-500">From data to decisions</p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. FULL-WIDTH WORKBENCH & CATEGORY NAVIGATOR */}
      <div className="w-full bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs flex flex-col">
        
        {/* Top Header of Chat Container */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-brand-600 flex items-center justify-center text-white font-black text-lg sm:text-xl shadow-xs">
              A
            </div>
            <div>
              <h2 className="text-xs sm:text-sm font-extrabold text-slate-900 flex items-center gap-1.5 leading-tight">
                AMS <span className="text-brand-600">AI Assistant</span>
              </h2>
              <p className="text-[10px] sm:text-[11px] text-slate-500">Your Asset Management Assistant</p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={handleNewConversation}
              className="px-2.5 sm:px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
            >
              <span className="hidden sm:inline">New Conversation</span>
              <span className="sm:hidden">New</span>
              <Plus className="w-3.5 h-3.5 text-brand-600" />
            </button>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600">
              <User className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
        </div>

        {/* Workbench Body (Responsive Horizontal Tabs on Mobile, Sub-Sidebar on Desktop) */}
        <div className="flex-1 flex flex-col md:flex-row min-h-0">
          
          {/* Sub-Sidebar Navigation */}
          <div className="w-full md:w-48 lg:w-56 p-2 md:p-3 bg-slate-50 border-b md:border-b-0 md:border-r border-slate-200 flex flex-row md:flex-col overflow-x-auto md:overflow-y-auto shrink-0 gap-1.5 md:gap-1 scrollbar-none md:scrollbar-thin">
            {CATEGORY_TABS.map((tab) => {
              const TabIcon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3.5 py-2.5 rounded-xl text-xs flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap shrink-0 md:w-full ${
                    isActive
                      ? 'bg-brand-600 text-white font-extrabold shadow-sm'
                      : 'text-slate-800 font-extrabold hover:text-slate-950 hover:bg-slate-200/70 border border-slate-200 bg-white'
                  }`}
                >
                  <TabIcon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-brand-600'}`} />
                  <span className="leading-tight">{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Right Content View (Expanded Width) */}
          <div className="flex-1 flex flex-col justify-between bg-slate-50/50 p-3 sm:p-5 space-y-4 sm:space-y-5 min-w-0">
            
            {/* Chat Stream & Widget Area */}
            <div ref={chatContainerRef} className="h-[480px] sm:h-[540px] max-h-[68vh] overflow-y-auto space-y-4 sm:space-y-5 pr-1.5 sm:pr-2 scrollbar-thin flex-1">
              
              {/* 1. GREETING SPEECH BUBBLE WITH ROBOT AVATAR */}
              <div className="flex items-start gap-2.5 sm:gap-4">
                <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-full bg-brand-600 text-white flex items-center justify-center font-black shrink-0 shadow-md border-2 border-white">
                  <Bot className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                </div>

                <div className="flex-1 bg-white border border-brand-200 rounded-2xl p-3 sm:p-4.5 shadow-xs relative">
                  <h3 className="font-extrabold text-slate-900 text-xs sm:text-sm mb-1">
                    Hello! I'm your Asset 360° AI Assistant.
                  </h3>
                  <p className="text-[11px] sm:text-xs text-slate-600 font-medium leading-relaxed">
                    Ask me anything about your assets, locations, assignments, value, depreciation, audits and more.
                  </p>
                </div>
              </div>

              {/* 2. CONVERSATION LOG WITH INLINE RESULT CARDS */}
              {messages.map((msg, idx) => {
                return (
                  <div key={msg.id} className="space-y-2 pt-1">
                    {msg.sender === 'user' ? (
                      <div className="flex justify-end">
                        <div className="bg-brand-600 text-white font-bold px-4 py-2.5 rounded-2xl rounded-tr-none text-xs shadow-xs max-w-xl space-y-1">
                          <div>{msg.text}</div>
                          <div className="text-[9px] text-brand-100 font-semibold text-right">{msg.timestamp} ✓✓</div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-xl bg-brand-600 text-white flex items-center justify-center font-bold shrink-0 shadow-xs">
                          <Bot className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1 space-y-2 min-w-0">
                          <div className="text-xs text-slate-900 leading-relaxed font-semibold bg-white border border-slate-200 p-3 rounded-2xl rounded-tl-none shadow-xs">
                            {msg.text}
                          </div>

                          {/* Render Rich Custom Data Card Inline in Chat Feed */}
                          {msg.widgetType && (
                            <AIInlineWidgets
                              widgetType={msg.widgetType}
                              onNavigate={(path) => navigate(path)}
                            />
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* 3. RELATED PROMPT SUGGESTIONS CARD */}
              {(() => {
                const filteredPrompts = activeTab === 'home'
                  ? SUGGESTED_PROMPTS
                  : SUGGESTED_PROMPTS.filter(p => p.tab === activeTab);
                const activeTabLabel = CATEGORY_TABS.find(t => t.id === activeTab)?.label || 'All';

                return filteredPrompts.length > 0 ? (
                  <div className="bg-white border border-brand-200/80 rounded-2xl p-4 sm:p-5 space-y-3.5 shadow-xs my-4 overflow-hidden">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                      <h4 className="text-xs sm:text-sm font-black text-slate-950 tracking-tight flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-brand-600 animate-pulse shrink-0" />
                        <span>
                          {activeTab === 'home'
                            ? 'Suggested Prompts & Related Questions:'
                            : `${activeTabLabel} — Related Prompts & Suggestions:`}
                        </span>
                      </h4>
                      <span className="text-[11px] text-slate-600 font-bold shrink-0 bg-slate-100 px-3 py-1 rounded-full border border-slate-200 self-start sm:self-auto">
                        Click any option to query
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {filteredPrompts.map((prompt) => {
                        const IconComponent = prompt.icon;
                        return (
                          <button
                            key={prompt.id}
                            onClick={() => handleSendPrompt(prompt.text)}
                            className="w-full flex items-center gap-3 p-3 rounded-xl bg-slate-50/80 hover:bg-brand-50/80 border border-slate-200 hover:border-brand-400 transition-all text-left group cursor-pointer shadow-2xs hover:shadow-xs"
                          >
                            <div className="p-2 rounded-lg bg-brand-100 text-brand-700 group-hover:bg-brand-600 group-hover:text-white transition-colors shrink-0">
                              <IconComponent className="w-4 h-4" />
                            </div>
                            <span className="text-xs font-extrabold text-slate-800 group-hover:text-brand-900 transition-colors leading-snug">
                              {prompt.text}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : null;
              })()}

              {loading && (
                <div className="flex items-center gap-2.5 text-xs text-brand-600 font-semibold p-3 bg-white rounded-xl border border-brand-200">
                  <RefreshCw className="w-4 h-4 animate-spin text-brand-600" /> Asset 360° AI is processing query...
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input Bar */}
            <div className="pt-2">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendPrompt();
                }}
                className="flex items-center gap-2 bg-white p-2.5 rounded-2xl border border-slate-200 focus-within:border-brand-500 transition-all shadow-xs"
              >
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Type your question here..."
                  className="flex-1 bg-transparent px-4 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none"
                />
                
                <button
                  type="button"
                  onClick={toggleSpeechRecognition}
                  className={`p-2 rounded-xl transition-colors ${
                    isListening ? 'text-rose-600 animate-pulse bg-rose-50' : 'text-slate-400 hover:text-slate-600'
                  }`}
                  title="Voice input"
                >
                  {isListening ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                </button>

                <button
                  type="submit"
                  disabled={!inputText.trim() || loading}
                  className="w-10 h-10 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold flex items-center justify-center shadow-xs transition-all disabled:opacity-50 shrink-0 cursor-pointer"
                >
                  <Send className="w-4 h-4 text-white" />
                </button>
              </form>
            </div>

          </div>
        </div>
      </div>

      {/* 4. FULL-WIDTH BOTTOM FEATURE FOOTER BANNER */}
      <div className="w-full bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-xs">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          
          {/* 5 Value Pillars */}
          <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
            <div className="flex items-start gap-3 p-2">
              <div className="w-8 h-8 rounded-full border border-slate-200 bg-slate-50 text-slate-700 flex items-center justify-center shrink-0 font-bold">
                <Target className="w-4 h-4 text-brand-600" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">Save Time</h4>
                <p className="text-[10px] text-slate-500 mt-0.5">Find information in seconds</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-2">
              <div className="w-8 h-8 rounded-full border border-slate-200 bg-slate-50 text-slate-700 flex items-center justify-center shrink-0 font-bold">
                <Sparkles className="w-4 h-4 text-brand-600" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">Improve Accuracy</h4>
                <p className="text-[10px] text-slate-500 mt-0.5">AI powered insights you trust</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-2">
              <div className="w-8 h-8 rounded-full border border-slate-200 bg-slate-50 text-slate-700 flex items-center justify-center shrink-0 font-bold">
                <TrendingUp className="w-4 h-4 text-brand-600" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">Optimize Assets</h4>
                <p className="text-[10px] text-slate-500 mt-0.5">Better visibility. Better use.</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-2">
              <div className="w-8 h-8 rounded-full border border-slate-200 bg-slate-50 text-slate-700 flex items-center justify-center shrink-0 font-bold">
                <ShieldCheck className="w-4 h-4 text-brand-600" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">Ensure Compliance</h4>
                <p className="text-[10px] text-slate-500 mt-0.5">Complete audit trails</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-2">
              <div className="w-8 h-8 rounded-full border border-slate-200 bg-slate-50 text-slate-700 flex items-center justify-center shrink-0 font-bold">
                <UserCheck className="w-4 h-4 text-brand-600" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">Empower Everyone</h4>
                <p className="text-[10px] text-slate-500 mt-0.5">IT, Finance, Operations & beyond</p>
              </div>
            </div>
          </div>

          {/* Callout Badge on Right */}
          <div className="lg:col-span-4 bg-brand-600 rounded-2xl p-5 text-white flex items-center gap-4 shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-white text-brand-600 flex items-center justify-center shrink-0 shadow-xs">
              <Bot className="w-7 h-7" />
            </div>
            <div>
              <h4 className="text-sm font-black tracking-tight leading-snug text-white">
                Ask. Analyze. Act.
              </h4>
              <p className="text-xs font-semibold text-brand-100 mt-0.5">
                All with Asset 360° AI Assistant.
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
