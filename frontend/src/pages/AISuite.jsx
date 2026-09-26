import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bot,
  Send,
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
  Plus,
  MapPin,
  ChevronRight,
  TrendingUp,
  Database,
  Box,
  AlertTriangle,
  RefreshCw,
  CheckCircle2,
  Clock,
  Layers,
  ArrowRight,
  Camera,
  Paperclip,
  Trash2,
  ExternalLink,
  ChevronDown,
  Info,
  Wrench,
  Package,
  Cpu,
  Zap,
  Check,
  X,
  FileSpreadsheet,
  HelpCircle,
  Sliders,
  Award,
  AlertCircle
} from 'lucide-react';
import { api } from '../services/api';
import clsx from 'clsx';

// Pre-seeded AI Assistant Initial Chat Feed matching Screenshot 32
const INITIAL_CHAT_MESSAGES = [
  {
    id: 'msg-1',
    sender: 'bot',
    text: "Hello! I'm Asset360 AI Assistant. I can help you with asset information, maintenance planning, spare parts, reports and more. How can I assist you today?",
    timestamp: '10:25 AM'
  },
  {
    id: 'msg-2',
    sender: 'user',
    text: 'Show me the top 5 assets with highest maintenance cost in the last 6 months',
    timestamp: '10:25 AM'
  },
  {
    id: 'msg-3',
    sender: 'bot',
    text: 'Here are the top 5 assets with the highest maintenance cost in the last 6 months:',
    timestamp: '10:26 AM',
    tableData: [
      { id: 1, assetCode: 'AHU-001', assetName: 'Air Handling Unit - B1', category: 'HVAC', cost: '48,750' },
      { id: 2, assetCode: 'CH-002', assetName: 'Chiller - Plant Room', category: 'HVAC', cost: '42,300' },
      { id: 3, assetCode: 'GEN-001', assetName: 'Diesel Generator', category: 'Generators', cost: '36,120' },
      { id: 4, assetCode: 'LIFT-003', assetName: 'Passenger Lift - Tower A', category: 'Lifts', cost: '28,450' },
      { id: 5, assetCode: 'PUMP-007', assetName: 'Water Pump - STP', category: 'Pumps', cost: '24,800' }
    ],
    followUpText: 'Would you like me to show the detailed work orders or create a maintenance plan recommendation for these assets?'
  }
];

export function AISuite() {
  const navigate = useNavigate();

  // Chat Feed State
  const [messages, setMessages] = useState(INITIAL_CHAT_MESSAGES);
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const chatEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // Modals
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showOcrModal, setShowOcrModal] = useState(false);
  const [showDuplicatesModal, setShowDuplicatesModal] = useState(false);
  const [showPredictiveModal, setShowPredictiveModal] = useState(false);
  const [ocrImageName, setOcrImageName] = useState('');

  // AI Configuration Settings
  const [confidenceThreshold, setConfidenceThreshold] = useState(85);
  const [enableOcr, setEnableOcr] = useState(true);
  const [enablePredictive, setEnablePredictive] = useState(true);
  const [enableDuplicateDetection, setEnableDuplicateDetection] = useState(true);
  const [aiModel, setAiModel] = useState('Asset360-Enterprise-v4.2');

  const scrollToBottom = () => {
    setTimeout(() => {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isProcessing]);

  // Handle User Input Submission
  const handleSendMessage = (customQuery = null) => {
    const query = (customQuery || inputText).trim();
    if (!query) return;

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: timeStr
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsProcessing(true);

    // Simulate AI reasoning and intent recognition
    setTimeout(() => {
      let botResponse = generateAiResponse(query, timeStr);
      setMessages(prev => [...prev, botResponse]);
      setIsProcessing(false);
    }, 800);
  };

  // Conversational Intent Engine
  const generateAiResponse = (query, timestamp) => {
    const q = query.toLowerCase();

    // 1. Natural Language Asset Search
    if (q.includes('laptops') || q.includes('finance') || q.includes('four years') || q.includes('4 years')) {
      return {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        timestamp,
        text: 'Found 4 laptops assigned to Finance at Dubai HQ older than 4 years (Confidence: 96%):',
        tableData: [
          { id: 1, assetCode: 'AS-000102', assetName: 'Laptop - Dell Latitude 5410', category: 'Laptops', cost: 'AED 5,400', custodian: 'Sara Ali', age: '4.5 Yrs' },
          { id: 2, assetCode: 'AS-000108', assetName: 'Laptop - Lenovo ThinkPad T14', category: 'Laptops', cost: 'AED 6,100', custodian: 'Bader Al Kaabi', age: '4.2 Yrs' },
          { id: 3, assetCode: 'AS-000115', assetName: 'Laptop - HP EliteBook 840', category: 'Laptops', cost: 'AED 5,800', custodian: 'Fatima Noor', age: '4.8 Yrs' },
          { id: 4, assetCode: 'AS-000122', assetName: 'Laptop - Dell Latitude 5400', category: 'Laptops', cost: 'AED 4,900', custodian: 'Ahmed Khan', age: '4.9 Yrs' }
        ],
        followUpText: 'Confidence score 96%. All 4 laptops are candidate for refresh under Q4 IT Hardware Capital Plan.',
        actionLink: { text: 'View in Asset Register', path: '/assets?category=Laptops&department=Finance' }
      };
    }

    // 2. Maintenance & Repeated Failure Analysis
    if (q.includes('hvac') || q.includes('maintenance') || q.includes('chiller') || q.includes('fail')) {
      return {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        timestamp,
        text: 'HVAC Assets analysis & preventive maintenance schedule due this month:',
        tableData: [
          { id: 1, assetCode: 'CH-002', assetName: 'Chiller - Plant Room', category: 'HVAC', cost: '42,300', status: 'High Failure Risk (84%)' },
          { id: 2, assetCode: 'AHU-001', assetName: 'Air Handling Unit - B1', category: 'HVAC', cost: '48,750', status: 'PM Due Sep 18' },
          { id: 3, assetCode: 'FCU-104', assetName: 'Fan Coil Unit - 2F', category: 'HVAC', cost: '12,400', status: 'Vibration Alert' }
        ],
        followUpText: 'Chiller CH-002 has 4 breakdown work orders in 90 days. Recommended action: Perform bearing replacement & oil analysis.',
        actionLink: { text: 'Schedule Work Order', path: '/maintenance/create?assetId=CH-002' }
      };
    }

    // 3. Spare Parts & Low Stock Intelligence
    if (q.includes('spare') || q.includes('stock') || q.includes('filter') || q.includes('inventory')) {
      return {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        timestamp,
        text: 'Critical spare parts below reorder threshold for upcoming HVAC PM cycle:',
        tableData: [
          { id: 1, assetCode: 'SP-HVAC-001', assetName: 'Air Filters 24x24x2', category: 'Filters', cost: '5 Remaining (Min: 15)' },
          { id: 2, assetCode: 'SP-PUMP-004', assetName: 'Mechanical Shaft Seal 2"', category: 'Seals', cost: '2 Remaining (Min: 8)' },
          { id: 3, assetCode: 'SP-ELEC-012', assetName: 'Contactor 40A 3-Phase', category: 'Electrical', cost: '1 Remaining (Min: 5)' }
        ],
        followUpText: 'Recommended action: Create Reorder PO for 25 units of SP-HVAC-001 to prevent HVAC maintenance delay.',
        actionLink: { text: 'Open Reorder Planning', path: '/inventory/levels' }
      };
    }

    // 4. Verification Audit Exception Summary
    if (q.includes('dubai hq') || q.includes('audit') || q.includes('exception') || q.includes('missing')) {
      return {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        timestamp,
        text: 'Summary of Dubai HQ physical verification audit exceptions (AUD-2026-0008):',
        tableData: [
          { id: 1, assetCode: 'Not Found', assetName: '12 Missing Assets', category: 'Laptops, Chairs', cost: 'Dubai HQ Block B' },
          { id: 2, assetCode: 'Wrong Location', assetName: '10 Relocated Assets', category: 'Monitors, Tables', cost: 'Block B -> Block C' },
          { id: 3, assetCode: 'Damaged', assetName: '1 Fire Extinguisher', category: 'Safety', cost: 'Block A Lobby' }
        ],
        followUpText: 'Management conclusion: 92% audit completion rate. 12 assets flagged as missing require security access audit.',
        actionLink: { text: 'View Audit Execution', path: '/stocktakes/execution/AUD-2026-0008' }
      };
    }

    // Fallback Generic Intelligence Response
    return {
      id: `bot-${Date.now()}`,
      sender: 'bot',
      timestamp,
      text: `Asset360 AI Assistant analyzed query: "${query}". Here is the real-time record synthesis:`,
      tableData: [
        { id: 1, assetCode: 'AST-000123', assetName: 'Laptop - Dell Latitude 5440', category: 'IT Equipment', cost: 'Active' },
        { id: 2, assetCode: 'WO-2026-8841', assetName: 'Preventive Service - CH-002', category: 'Maintenance', cost: 'Scheduled' }
      ],
      followUpText: 'I can generate detailed reports, analyze failure probability, or check spare parts availability for this request.',
      actionLink: { text: 'Explore Reports Catalogue', path: '/reports' }
    };
  };

  const handleClearChat = () => {
    setMessages([INITIAL_CHAT_MESSAGES[0]]);
  };

  // OCR Label Photo Upload Simulation
  const handlePhotoUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setOcrImageName(file.name);
      setShowOcrModal(true);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-16">
      <div className="max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8 pt-5 space-y-5">

        {/* Top Header matching Screenshot 32 */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <span>AI Assistant</span>
              <span className="px-2 py-0.5 rounded-md bg-purple-100 text-[#6C2BD9] text-xs font-mono font-bold">
                Enterprise v4.2
              </span>
            </h1>
            <p className="text-xs text-slate-500">
              Your intelligent assistant for asset management, maintenance and inventory
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowSettingsModal(true)}
              className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-[#6C2BD9] bg-white border border-purple-200 rounded-lg hover:bg-purple-50 transition-colors cursor-pointer shadow-xs"
            >
              <Settings className="w-4 h-4 text-[#6C2BD9]" />
              <span>AI Settings</span>
            </button>
          </div>
        </div>

        {/* 4 Insight Stat Cards Row matching Screenshot 32 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: 12 AI Insights */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex items-center gap-4 hover:border-purple-300 transition-all cursor-pointer">
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-[#6C2BD9] flex items-center justify-center shrink-0">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-extrabold text-slate-900">12</span>
                <span className="text-xs font-bold text-slate-800">AI Insights</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">New insights this week</p>
            </div>
          </div>

          {/* Card 2: 8 Recommended Actions */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex items-center gap-4 hover:border-amber-300 transition-all cursor-pointer">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-extrabold text-slate-900">8</span>
                <span className="text-xs font-bold text-slate-800">Recommended Actions</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">Require attention</p>
            </div>
          </div>

          {/* Card 3: 23% Potential Cost Savings */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex items-center gap-4 hover:border-purple-300 transition-all cursor-pointer">
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-[#6C2BD9] flex items-center justify-center shrink-0">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-extrabold text-slate-900">23%</span>
                <span className="text-xs font-bold text-slate-800">Potential Cost Savings</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">Based on AI analysis</p>
            </div>
          </div>

          {/* Card 4: 15 hrs Estimated Time Saved */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex items-center gap-4 hover:border-emerald-300 transition-all cursor-pointer">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-extrabold text-slate-900">15 hrs</span>
                <span className="text-xs font-bold text-slate-800">Estimated Time Saved</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">This month</p>
            </div>
          </div>
        </div>

        {/* Main Workspace Split: Left Chat Window (~68% width) + Right Side Panels (~32% width) */}
        <div className="grid grid-cols-12 gap-6 items-start">

          {/* Left Chat Window (~68% width - 8 Cols) matching Screenshot 32 */}
          <div className="col-span-12 lg:col-span-8 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col min-h-[620px]">

            {/* Chat Window Header */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#6C2BD9] text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Asset360 AI Assistant</h3>
                  <p className="text-[11px] text-slate-500">
                    Ask questions, get insights and take action across your assets, maintenance and inventory.
                  </p>
                </div>
              </div>

              <button
                onClick={handleClearChat}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5 text-slate-400" />
                <span>Clear Chat</span>
              </button>
            </div>

            {/* Chat Conversation Messages Stream */}
            <div className="p-4 sm:p-5 flex-1 overflow-y-auto space-y-5 max-h-[520px]">
              {messages.map((msg) => (
                <div key={msg.id} className="space-y-3">
                  {msg.sender === 'user' ? (
                    /* User Message Bubble */
                    <div className="flex justify-end items-start gap-2.5">
                      <div className="bg-[#6C2BD9] text-white p-3.5 rounded-2xl rounded-tr-none text-xs font-medium max-w-lg shadow-xs leading-relaxed">
                        <p>{msg.text}</p>
                        <span className="text-[10px] text-purple-200 block text-right mt-1 font-mono">{msg.timestamp}</span>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs shrink-0">
                        JD
                      </div>
                    </div>
                  ) : (
                    /* Bot Message Bubble */
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#6C2BD9] text-white flex items-center justify-center shrink-0 shadow-xs">
                        <Bot className="w-4 h-4" />
                      </div>
                      <div className="flex-1 space-y-3 max-w-2xl">
                        <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl rounded-tl-none text-xs text-slate-800 leading-relaxed shadow-2xs space-y-3">
                          <p>{msg.text}</p>

                          {/* Embedded Data Table inside Bot Response */}
                          {msg.tableData && (
                            <div className="border border-slate-200 rounded-lg overflow-auto max-h-[250px] bg-white mt-2">
                              <table className="w-full text-left text-xs border-collapse">
                                <thead className="sticky top-0 z-10 bg-slate-50 text-slate-500 font-semibold text-[11px] border-b border-slate-200 shadow-2xs">
                                  <tr>
                                    <th className="py-2.5 px-3 w-8">#</th>
                                    <th className="py-2.5 px-3">Asset Code</th>
                                    <th className="py-2.5 px-3">Asset Name</th>
                                    <th className="py-2.5 px-3">Category</th>
                                    <th className="py-2.5 px-3 text-right">Maintenance Cost (AED)</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 font-medium">
                                  {msg.tableData.map((row) => (
                                    <tr key={row.id} className="hover:bg-slate-50/70">
                                      <td className="py-2.5 px-3 text-slate-400 text-[11px]">{row.id}</td>
                                      <td className="py-2.5 px-3 font-mono font-bold text-[#6C2BD9]">{row.assetCode}</td>
                                      <td className="py-2.5 px-3 text-slate-900">{row.assetName}</td>
                                      <td className="py-2.5 px-3 text-slate-600">{row.category}</td>
                                      <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">{row.cost}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}

                          {msg.followUpText && (
                            <p className="text-slate-600 font-medium pt-1 text-[11px]">{msg.followUpText}</p>
                          )}

                          {msg.actionLink && (
                            <div className="pt-2">
                              <button
                                onClick={() => navigate(msg.actionLink.path)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-50 text-[#6C2BD9] hover:bg-purple-100 text-xs font-semibold transition-colors cursor-pointer border border-purple-200"
                              >
                                <span>{msg.actionLink.text}</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono pl-1">{msg.timestamp}</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {isProcessing && (
                <div className="flex items-center gap-3 text-xs text-[#6C2BD9] font-medium p-3 bg-purple-50 rounded-xl border border-purple-200 w-fit">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Asset360 AI is querying module records &amp; computing confidence scores...</span>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Quick Prompt Pills Toolbar matching Screenshot 32 */}
            <div className="px-4 py-2 bg-slate-50/70 border-t border-slate-100 flex flex-wrap items-center gap-2 text-xs">
              <button
                onClick={() => handleSendMessage('Show preventive maintenance due this week')}
                className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-purple-300 text-slate-700 hover:text-[#6C2BD9] transition-colors cursor-pointer shadow-2xs text-[11px] font-medium"
              >
                Show preventive maintenance due this week
              </button>
              <button
                onClick={() => handleSendMessage('Check low stock spare parts')}
                className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-purple-300 text-slate-700 hover:text-[#6C2BD9] transition-colors cursor-pointer shadow-2xs text-[11px] font-medium"
              >
                Check low stock spare parts
              </button>
              <button
                onClick={() => handleSendMessage('Generate asset health report')}
                className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-purple-300 text-slate-700 hover:text-[#6C2BD9] transition-colors cursor-pointer shadow-2xs text-[11px] font-medium"
              >
                Generate asset health report
              </button>
              <button
                onClick={() => setShowDuplicatesModal(true)}
                className="px-3 py-1.5 rounded-lg bg-white border border-purple-200 text-[#6C2BD9] hover:bg-purple-50 transition-colors cursor-pointer shadow-2xs text-[11px] font-semibold flex items-center gap-1"
              >
                <span>Duplicate Audit</span>
                <ChevronDown className="w-3 h-3" />
              </button>
            </div>

            {/* Chat Input Bar matching Screenshot 32 */}
            <div className="p-4 border-t border-slate-200 bg-white rounded-b-xl">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2.5 rounded-lg text-slate-400 hover:text-[#6C2BD9] hover:bg-purple-50 transition-colors cursor-pointer"
                  title="Upload Manufacturer Label Photo for AI OCR"
                >
                  <Paperclip className="w-4 h-4" />
                </button>

                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Type your question here..."
                  className="flex-1 px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#6C2BD9]/20 focus:border-[#6C2BD9]"
                />

                <button
                  type="submit"
                  disabled={!inputText.trim() || isProcessing}
                  className="px-5 py-2.5 rounded-lg bg-[#6C2BD9] hover:bg-[#5b21b6] text-white text-xs font-semibold transition-colors cursor-pointer shadow-xs disabled:opacity-50 flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send</span>
                </button>
              </form>
            </div>

          </div>

          {/* Right Side Panels (~32% width - 4 Cols) matching Screenshot 32 */}
          <div className="col-span-12 lg:col-span-4 space-y-5">

            {/* 1. Recommended Actions Panel */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900">Recommended Actions</h3>
                <button
                  onClick={() => navigate('/maintenance')}
                  className="text-xs text-[#6C2BD9] hover:text-[#5b21b6] font-semibold cursor-pointer"
                >
                  View All
                </button>
              </div>

              <div className="space-y-2.5">
                {/* Action 1 */}
                <div
                  onClick={() => navigate('/inventory/levels')}
                  className="p-3 rounded-lg border border-slate-100 bg-slate-50/60 hover:bg-purple-50/40 hover:border-purple-200 transition-all cursor-pointer flex items-start justify-between gap-2"
                >
                  <div className="flex items-start gap-2.5">
                    <div className="w-7 h-7 rounded bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 mt-0.5">
                      <AlertTriangle className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">Reorder Air Filters (SP-HVAC-001)</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">Stock below reorder level (5 remaining)</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 shrink-0 self-center" />
                </div>

                {/* Action 2 */}
                <div
                  onClick={() => navigate('/maintenance/create?assetId=CH-002')}
                  className="p-3 rounded-lg border border-slate-100 bg-slate-50/60 hover:bg-purple-50/40 hover:border-purple-200 transition-all cursor-pointer flex items-start justify-between gap-2"
                >
                  <div className="flex items-start gap-2.5">
                    <div className="w-7 h-7 rounded bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 mt-0.5">
                      <RefreshCw className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">Schedule maintenance for Chiller CH-002</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">Based on usage pattern and runtime hours</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 shrink-0 self-center" />
                </div>

                {/* Action 3 */}
                <div
                  onClick={() => setShowPredictiveModal(true)}
                  className="p-3 rounded-lg border border-slate-100 bg-slate-50/60 hover:bg-purple-50/40 hover:border-purple-200 transition-all cursor-pointer flex items-start justify-between gap-2"
                >
                  <div className="flex items-start gap-2.5">
                    <div className="w-7 h-7 rounded bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                      <TrendingUp className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">Consider replacing Pump PUMP-004</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">High failure probability (78%)</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 shrink-0 self-center" />
                </div>

                {/* Action 4 */}
                <div
                  onClick={() => navigate('/maintenance')}
                  className="p-3 rounded-lg border border-slate-100 bg-slate-50/60 hover:bg-purple-50/40 hover:border-purple-200 transition-all cursor-pointer flex items-start justify-between gap-2"
                >
                  <div className="flex items-start gap-2.5">
                    <div className="w-7 h-7 rounded bg-purple-50 text-[#6C2BD9] flex items-center justify-center shrink-0 mt-0.5">
                      <FileText className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">Review 12 overdue work orders</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">Average overdue by 8 days</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 shrink-0 self-center" />
                </div>

                {/* Action 5 */}
                <div
                  onClick={() => navigate('/inventory')}
                  className="p-3 rounded-lg border border-slate-100 bg-slate-50/60 hover:bg-purple-50/40 hover:border-purple-200 transition-all cursor-pointer flex items-start justify-between gap-2"
                >
                  <div className="flex items-start gap-2.5">
                    <div className="w-7 h-7 rounded bg-purple-50 text-[#6C2BD9] flex items-center justify-center shrink-0 mt-0.5">
                      <Box className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">Slow moving spare parts</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">15 items not used in last 12 months</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 shrink-0 self-center" />
                </div>
              </div>
            </div>

            {/* 2. Recent AI Insights Panel */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900">Recent AI Insights</h3>
                <button
                  onClick={() => navigate('/reports')}
                  className="text-xs text-[#6C2BD9] hover:text-[#5b21b6] font-semibold cursor-pointer"
                >
                  View All
                </button>
              </div>

              <div className="space-y-3 text-xs">
                {/* Insight 1 */}
                <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2.5">
                  <div className="flex items-start gap-2.5">
                    <TrendingUp className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-slate-900">Energy consumption increased by 18%</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">HVAC assets in Tower A compared to last month</p>
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-400 whitespace-nowrap">02 Sep 2026</span>
                </div>

                {/* Insight 2 */}
                <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2.5">
                  <div className="flex items-start gap-2.5">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-slate-900">Unusual vibration detected</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">In Pump PUMP-003 based on sensor data</p>
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-400 whitespace-nowrap">01 Sep 2026</span>
                </div>

                {/* Insight 3 */}
                <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2.5">
                  <div className="flex items-start gap-2.5">
                    <Clock className="w-4 h-4 text-[#6C2BD9] shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-slate-900">3 assets likely to fail in next 30 days</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">Based on historical data and AI model</p>
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-400 whitespace-nowrap">30 Aug 2026</span>
                </div>

                {/* Insight 4 */}
                <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2.5">
                  <div className="flex items-start gap-2.5">
                    <Box className="w-4 h-4 text-[#6C2BD9] shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-slate-900">Optimize spare parts inventory</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">Potential 23% cost reduction identified</p>
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-400 whitespace-nowrap">28 Aug 2026</span>
                </div>

                {/* Insight 5 */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2.5">
                    <Sparkles className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-slate-900">Carbon footprint trend</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">10% reduction in emissions this quarter</p>
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-400 whitespace-nowrap">26 Aug 2026</span>
                </div>
              </div>
            </div>

            {/* 3. Quick Links Tile Panel */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 space-y-3">
              <h3 className="text-sm font-bold text-slate-900">Quick Links</h3>

              <div className="grid grid-cols-2 gap-3 text-center">
                <button
                  onClick={() => navigate('/reports')}
                  className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-purple-50 hover:border-purple-200 transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5"
                >
                  <FileText className="w-5 h-5 text-[#6C2BD9]" />
                  <span className="text-xs font-semibold text-slate-800">Generate Report</span>
                </button>

                <button
                  onClick={() => handleSendMessage('How can I optimize maintenance costs?')}
                  className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-purple-50 hover:border-purple-200 transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5"
                >
                  <Bot className="w-5 h-5 text-[#6C2BD9]" />
                  <span className="text-xs font-semibold text-slate-800">Ask a Question</span>
                </button>

                <button
                  onClick={() => navigate('/reports?category=analytics')}
                  className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-purple-50 hover:border-purple-200 transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5"
                >
                  <BarChart3 className="w-5 h-5 text-[#6C2BD9]" />
                  <span className="text-xs font-semibold text-slate-800">AI Analytics</span>
                </button>

                <button
                  onClick={() => setShowSettingsModal(true)}
                  className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-purple-50 hover:border-purple-200 transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5"
                >
                  <Settings className="w-5 h-5 text-[#6C2BD9]" />
                  <span className="text-xs font-semibold text-slate-800">Configure AI</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* MODAL 1: AI Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 max-w-lg w-full shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-[#6C2BD9]" />
                <h3 className="font-bold text-slate-900 text-base">Asset360 AI Configuration</h3>
              </div>
              <button onClick={() => setShowSettingsModal(false)} className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">AI Reasoning Engine Model</label>
                <select
                  value={aiModel}
                  onChange={(e) => setAiModel(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 font-mono text-xs focus:outline-none focus:border-[#6C2BD9]"
                >
                  <option value="Asset360-Enterprise-v4.2">Asset360-Enterprise-v4.2 (Fine-tuned for Industrial AM)</option>
                  <option value="Asset360-Predictive-v2.1">Asset360-Predictive-v2.1 (High Precision Failure Modeling)</option>
                  <option value="Asset360-Light-v1.0">Asset360-Light-v1.0 (Low-latency Query Engine)</option>
                </select>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="font-semibold text-slate-700">Minimum Confidence Threshold for Auto-Suggestions</label>
                  <span className="font-mono font-bold text-[#6C2BD9]">{confidenceThreshold}%</span>
                </div>
                <input
                  type="range"
                  min={50}
                  max={95}
                  value={confidenceThreshold}
                  onChange={(e) => setConfidenceThreshold(Number(e.target.value))}
                  className="w-full accent-[#6C2BD9] cursor-pointer"
                />
                <p className="text-[11px] text-slate-400 mt-1">Suggestions below this threshold require explicit manager review.</p>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-100">
                <label className="flex items-center justify-between font-semibold text-slate-700 cursor-pointer">
                  <span>Enable Photo Label OCR Extraction</span>
                  <input type="checkbox" checked={enableOcr} onChange={(e) => setEnableOcr(e.target.checked)} className="accent-[#6C2BD9] rounded" />
                </label>
                <label className="flex items-center justify-between font-semibold text-slate-700 cursor-pointer">
                  <span>Enable Real-time Duplicate Record Detection</span>
                  <input type="checkbox" checked={enableDuplicateDetection} onChange={(e) => setEnableDuplicateDetection(e.target.checked)} className="accent-[#6C2BD9] rounded" />
                </label>
                <label className="flex items-center justify-between font-semibold text-slate-700 cursor-pointer">
                  <span>Enable Predictive Maintenance Failure Risk Assessment</span>
                  <input type="checkbox" checked={enablePredictive} onChange={(e) => setEnablePredictive(e.target.checked)} className="accent-[#6C2BD9] rounded" />
                </label>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-3 text-right">
              <button
                onClick={() => setShowSettingsModal(false)}
                className="px-5 py-2 text-xs font-semibold bg-[#6C2BD9] text-white hover:bg-[#5b21b6] rounded-lg cursor-pointer shadow-xs"
              >
                Save AI Configuration
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Photo OCR Label Scanner Simulation */}
      {showOcrModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 max-w-xl w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-[#6C2BD9]" />
                <h3 className="font-bold text-slate-900 text-base">AI Label OCR &amp; Category Recommendation</h3>
              </div>
              <button onClick={() => setShowOcrModal(false)} className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-purple-50 rounded-xl border border-purple-200 text-xs space-y-1">
              <p className="font-bold text-[#6C2BD9]">Uploaded Image: {ocrImageName || 'label_photo.jpg'}</p>
              <p className="text-slate-600">AI OCR Extracted text with 94% confidence. Verify before saving to Master.</p>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-500 text-[11px] mb-1">Extracted Manufacturer</label>
                  <input type="text" defaultValue="Dell Inc." className="w-full p-2 bg-slate-50 border rounded font-semibold text-slate-900" />
                </div>
                <div>
                  <label className="block text-slate-500 text-[11px] mb-1">Extracted Model</label>
                  <input type="text" defaultValue="Latitude 5440" className="w-full p-2 bg-slate-50 border rounded font-semibold text-slate-900" />
                </div>
                <div>
                  <label className="block text-slate-500 text-[11px] mb-1">Extracted Serial Number</label>
                  <input type="text" defaultValue="75K3D24" className="w-full p-2 bg-slate-50 border rounded font-mono font-bold text-[#6C2BD9]" />
                </div>
                <div>
                  <label className="block text-slate-500 text-[11px] mb-1">Recommended Category (Confidence 94%)</label>
                  <input type="text" defaultValue="IT Equipment > Laptops" className="w-full p-2 bg-purple-50 border border-purple-200 rounded font-semibold text-[#6C2BD9]" />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button onClick={() => setShowOcrModal(false)} className="px-4 py-2 border rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50">
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowOcrModal(false);
                  navigate('/assets/new?serial=75K3D24&model=Latitude+5440&manufacturer=Dell');
                }}
                className="px-4 py-2 bg-[#6C2BD9] text-white rounded-lg text-xs font-semibold hover:bg-[#5b21b6]"
              >
                Confirm &amp; Open Registration Form
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Duplicate Detection Review */}
      {showDuplicatesModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 max-w-xl w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                <h3 className="font-bold text-slate-900 text-base">AI Duplicate Detection Audit</h3>
              </div>
              <button onClick={() => setShowDuplicatesModal(false)} className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs">
              <p className="font-bold text-amber-900">92% Potential Duplicate Detected</p>
              <p className="text-amber-700 mt-0.5">Match Reason: Identical Serial Number 75K3D24 and Manufacturer Dell Inc.</p>
            </div>

            <div className="border border-slate-200 rounded-lg overflow-auto max-h-[250px] text-xs">
              <table className="w-full text-left">
                <thead className="sticky top-0 z-10 bg-slate-50 border-b text-slate-500 shadow-2xs">
                  <tr>
                    <th className="p-2.5">Field</th>
                    <th className="p-2.5">Existing Record (AS-000123)</th>
                    <th className="p-2.5">Incoming Record</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  <tr><td className="p-2.5 text-slate-400">Serial No.</td><td className="p-2.5 font-mono text-[#6C2BD9]">75K3D24</td><td className="p-2.5 font-mono text-[#6C2BD9]">75K3D24</td></tr>
                  <tr><td className="p-2.5 text-slate-400">Manufacturer</td><td className="p-2.5">Dell Inc.</td><td className="p-2.5">Dell Inc.</td></tr>
                  <tr><td className="p-2.5 text-slate-400">Location</td><td className="p-2.5">Dubai HQ &gt; Block B &gt; 1F</td><td className="p-2.5">Dubai HQ &gt; Block B &gt; 2F</td></tr>
                </tbody>
              </table>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setShowDuplicatesModal(false)} className="px-4 py-2 border rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50">
                Cancel
              </button>
              <button onClick={() => { setShowDuplicatesModal(false); navigate('/assets/AS-000123'); }} className="px-4 py-2 bg-[#6C2BD9] text-white rounded-lg text-xs font-semibold hover:bg-[#5b21b6]">
                Open Existing Asset 360°
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: Predictive Risk Modal */}
      {showPredictiveModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-slate-900 text-base">Predictive Maintenance Analysis</h3>
              </div>
              <button onClick={() => setShowPredictiveModal(false)} className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-900 text-sm">Pump PUMP-004 Risk Assessment</span>
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                  78% Failure Probability (High Risk)
                </span>
              </div>
              <p className="text-slate-600">Contributing factors calculated from historical telemetry &amp; work orders:</p>
              <ul className="list-disc pl-4 space-y-1 text-slate-700">
                <li>Over 4,200 operating hours since last overhaul (Threshold: 4,000 hrs)</li>
                <li>Vibration telemetry increased by +24% over 14 days</li>
                <li>3 emergency corrective work orders logged in past 180 days</li>
              </ul>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setShowPredictiveModal(false)} className="px-4 py-2 border rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50">
                Close
              </button>
              <button onClick={() => { setShowPredictiveModal(false); navigate('/maintenance/create?assetId=PUMP-004'); }} className="px-4 py-2 bg-[#6C2BD9] text-white rounded-lg text-xs font-semibold hover:bg-[#5b21b6]">
                Schedule Replacement WO
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default AISuite;
