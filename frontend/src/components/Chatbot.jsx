import React, { useState, useRef, useEffect } from 'react';
import { Send, Leaf, Dumbbell, Calendar, Info, Trash2, MessageSquare, Plus, Mic, Heart } from 'lucide-react';

const SUGGESTIONS = [
  { text: "Create a weight loss workout", category: "workout" },
  { text: "Suggest a protein-rich diet", category: "diet" },
  { text: "Calculate my BMI", category: "bmi" },
  { text: "Generate a PCOD-friendly meal plan", category: "health" }
];

export default function Chatbot({ profile, userId }) {
  const [threads, setThreads] = useState([]);
  const [activeThreadId, setActiveThreadId] = useState('new'); // 'new' or a thread ID
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const chatEndRef = useRef(null);

  // Group flat messages from API into conversational threads
  const parseHistoryIntoThreads = (flatMessages) => {
    const grouped = [];
    let currentThread = null;

    for (let i = 0; i < flatMessages.length; i++) {
      const msg = flatMessages[i];
      if (msg.sender === 'user') {
        if (currentThread) {
          grouped.push(currentThread);
        }
        currentThread = {
          id: 'thread-' + msg.id,
          title: msg.text.length > 28 ? msg.text.slice(0, 28) + '...' : msg.text,
          messages: [msg]
        };
      } else if (msg.sender === 'bot' && currentThread) {
        currentThread.messages.push(msg);
      }
    }
    if (currentThread) {
      grouped.push(currentThread);
    }
    return grouped.reverse(); // Show newest threads at the top
  };

  // Load chat history on mount/userId change
  useEffect(() => {
    if (!userId) return;
    const loadHistory = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/chat/history?user_id=${userId}`);
        const data = await response.json();
        if (data && data.length > 0) {
          const parsed = parseHistoryIntoThreads(data);
          setThreads(parsed);
          if (parsed.length > 0) {
            setActiveThreadId(parsed[0].id);
          }
        } else {
          setThreads([]);
          setActiveThreadId('new');
        }
      } catch (err) {
        console.error("Error loading chat history:", err);
      }
    };
    loadHistory();
  }, [userId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [threads, activeThreadId, loading]);

  const activeThread = threads.find(t => t.id === activeThreadId);
  const activeMessages = activeThread ? activeThread.messages : [];

  const handleSendMessage = async (textToSend) => {
    const text = textToSend || input;
    if (!text.trim()) return;

    const userMessage = {
      id: 'msg-' + Date.now(),
      sender: 'user',
      text: text,
      time: new Date().toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
    };

    let targetThreadId = activeThreadId;
    let updatedThreads = [...threads];

    if (activeThreadId === 'new') {
      const newThreadId = 'thread-' + Date.now();
      const newThread = {
        id: newThreadId,
        title: text.length > 28 ? text.slice(0, 28) + '...' : text,
        messages: [userMessage]
      };
      updatedThreads = [newThread, ...threads];
      setThreads(updatedThreads);
      setActiveThreadId(newThreadId);
      targetThreadId = newThreadId;
    } else {
      updatedThreads = threads.map(t => {
        if (t.id === activeThreadId) {
          return {
            ...t,
            messages: [...t.messages, userMessage]
          };
        }
        return t;
      });
      setThreads(updatedThreads);
    }

    if (!textToSend) setInput('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          user_id: userId,
          history: activeMessages.slice(-8)
        })
      });
      const data = await response.json();
      
      const botMessage = {
        id: 'msg-bot-' + Date.now(),
        sender: 'bot',
        text: data.response,
        time: new Date().toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
      };

      setThreads(prevThreads => prevThreads.map(t => {
        if (t.id === targetThreadId) {
          return {
            ...t,
            messages: [...t.messages, botMessage]
          };
        }
        return t;
      }));
    } catch (err) {
      console.error("Error communicating with chatbot API:", err);
      const errorMessage = {
        id: 'msg-err-' + Date.now(),
        sender: 'bot',
        text: "⚠️ Sorry, I encountered an issue reaching my wellness processing core. Please verify the backend service is running locally on port 5000.",
        time: new Date().toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
      };
      
      setThreads(prevThreads => prevThreads.map(t => {
        if (t.id === targetThreadId) {
          return {
            ...t,
            messages: [...t.messages, errorMessage]
          };
        }
        return t;
      }));
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = async () => {
    if (!window.confirm("Are you sure you want to clear your entire chat history?")) return;
    try {
      await fetch(`http://localhost:5000/api/chat/history?user_id=${userId}`, {
        method: 'DELETE'
      });
    } catch (err) {
      console.error("Failed to delete chat history from server:", err);
    }
    setThreads([]);
    setActiveThreadId('new');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  const formatBotText = (text) => {
    return text.split('\n').map((line, i) => {
      let content = line;
      
      const isBullet = content.trim().startsWith('- ') || content.trim().startsWith('* ');
      if (isBullet) {
        content = content.replace(/^[-*]\s+/, '');
      }

      const isH3 = content.trim().startsWith('### ');
      const isH4 = content.trim().startsWith('#### ');
      if (isH3) {
        content = content.replace(/^###\s+/, '');
      } else if (isH4) {
        content = content.replace(/^####\s+/, '');
      }

      const parts = content.split(/\*\*([^*]+)\*\*/g);
      const renderedLine = parts.map((part, index) => {
        if (index % 2 === 1) {
          return <strong key={index} className="text-[#8BA983] font-semibold">{part}</strong>;
        }
        return part;
      });

      if (isH3) {
        return <h4 key={i} className="text-sm font-bold text-[#2D3436] mt-4 mb-2">{renderedLine}</h4>;
      }
      if (isH4) {
        return <h5 key={i} className="text-xs font-bold text-[#5E6A6E] mt-3 mb-1">{renderedLine}</h5>;
      }

      if (isBullet) {
        return (
          <li key={i} className="ml-4 list-disc text-[#2D3436] text-xs leading-relaxed my-1">
            {renderedLine}
          </li>
        );
      }

      return (
        <p key={i} className="text-[#2D3436] text-xs leading-relaxed min-h-[1em] mb-1.5">
          {renderedLine}
        </p>
      );
    });
  };

  return (
    <div className="animate-fade-in grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-12rem)] min-h-[500px]">
      
      {/* Left Sidebar: Saved Journal Logs */}
      <div className="lg:col-span-4 bg-white border border-[#EAE5DF] rounded-[24px] p-4 flex flex-col justify-between h-full shadow-sm">
        <div className="space-y-4 overflow-hidden flex flex-col h-full">
          
          {/* Header & New Chat Button */}
          <div className="flex items-center justify-between pb-3 border-b border-[#EAE5DF]">
            <h3 className="font-bold text-sm text-[#2D3436] uppercase tracking-wider flex items-center gap-1.5">
              <MessageSquare size={16} className="text-[#8BA983]" /> Wellness Journals
            </h3>
            
            <button
              onClick={() => setActiveThreadId('new')}
              className="p-2 rounded-xl bg-[#F6D6C9] hover:bg-[#E9B384] text-[#2D3436] transition-all flex items-center justify-center gap-1 text-[10px] font-semibold border border-[#EAE5DF]"
              title="Start New Chat"
            >
              <Plus size={14} /> New Chat
            </button>
          </div>

          {/* History Scroll List */}
          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {threads.length > 0 ? (
              threads.map((thread) => {
                const isActive = thread.id === activeThreadId;
                return (
                  <button
                    key={thread.id}
                    onClick={() => setActiveThreadId(thread.id)}
                    className={`w-full text-left p-3 rounded-xl border transition-all text-xs font-semibold flex items-start gap-2.5 ${
                      isActive 
                        ? 'bg-[#F6D6C9] border-[#EAE5DF] text-[#8BA983]' 
                        : 'bg-white border-[#EAE5DF] hover:bg-[#FAF8F4] text-[#5E6A6E] hover:text-[#2D3436]'
                    }`}
                  >
                    <MessageSquare size={14} className="shrink-0 mt-0.5" />
                    <span className="truncate">{thread.title}</span>
                  </button>
                );
              })
            ) : (
              <div className="text-center py-16 text-[#8D9698] text-xs">
                No past wellness sessions.
              </div>
            )}
          </div>
        </div>

        {/* Clear All Logs Button */}
        {threads.length > 0 && (
          <button
            onClick={handleClearHistory}
            className="w-full mt-4 text-[10px] text-[#8D9698] hover:text-rose-500 font-semibold transition-colors flex items-center justify-center gap-1.5 bg-white border border-[#EAE5DF] py-2.5 rounded-xl"
          >
            <Trash2 size={12} /> Clear Chat Logs
          </button>
        )}
      </div>

      {/* Right Pane: Active Messages & Typing Input */}
      <div className="lg:col-span-8 flex flex-col justify-between h-full">
        
        {/* Messages Pane */}
        <div className="flex-1 bg-white border border-[#EAE5DF] rounded-[24px] p-5 overflow-y-auto space-y-4 mb-4 shadow-sm flex flex-col">
          
          {activeMessages.length === 0 ? (
            <div className="space-y-4 animate-scale-in">
              <div className="flex items-start gap-3 max-w-[85%] self-start">
                <div className="w-8.5 h-8.5 rounded-full bg-[#FAF8F4] border border-[#EAE5DF] flex items-center justify-center font-bold text-xs text-[#8BA983]">
                  <Leaf size={14} />
                </div>
                <div className="p-4 bg-white border border-[#EAE5DF] rounded-[20px] rounded-tl-none shadow-sm">
                  <div className="flex items-center gap-1.5 mb-2">
                    <h4 className="font-bold text-sm text-[#2D3436]">Wellness Coach</h4>
                    <span className="text-[9px] bg-[#FAF8F4] text-[#8BA983] border border-[#EAE5DF] px-1.5 py-0.5 rounded-full font-semibold uppercase tracking-wider">WELLNESS COMPANION</span>
                  </div>
                  <p className="text-[#2D3436] text-xs leading-relaxed">
                    👋 Hello! I am your personal wellness and lifestyle coach. I'm here to support you in building healthy habits, custom meal plans, and sustainable workouts. Ask me anything about nutrition, hydration, or daily active routines.
                  </p>
                  <p className="text-[#8BA983] text-xs leading-relaxed mt-2 font-semibold">
                    Select a suggestion prompt below or type your query to start!
                  </p>
                </div>
              </div>
            </div>
          ) : (
            activeMessages.map((msg) => {
              const isBot = msg.sender === 'bot';
              return (
                <div 
                  key={msg.id}
                  className={`flex items-start gap-3 max-w-[85%] ${isBot ? 'self-start' : 'ml-auto flex-row-reverse'}`}
                >
                  <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center font-bold text-xs border ${
                    isBot 
                      ? 'bg-[#FAF8F4] border-[#EAE5DF] text-[#8BA983]' 
                      : 'bg-[#F6D6C9] border-[#EAE5DF] text-[#2D3436]'
                  }`}>
                    {isBot ? <Leaf size={12} /> : 'ME'}
                  </div>

                  <div className={`p-4 rounded-[20px] border ${
                    isBot 
                      ? 'bg-white border-[#EAE5DF] text-[#2D3436] rounded-tl-none shadow-sm' 
                      : 'bg-[#A8C3A0] border-[#8BA983]/30 text-[#2D3436] rounded-tr-none'
                  }`}>
                    <div className="space-y-1">
                      {isBot ? formatBotText(msg.text) : <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>}
                    </div>
                    <span className={`text-[9px] font-semibold block text-right mt-2 ${isBot ? 'text-[#8D9698]' : 'text-[#5E6A6E]'}`}>{msg.time}</span>
                  </div>
                </div>
              );
            })
          )}

          {/* Loading indicator */}
          {loading && (
            <div className="flex items-start gap-3 max-w-[85%] self-start animate-pulse">
              <div className="w-8.5 h-8.5 rounded-full bg-[#FAF8F4] border border-[#EAE5DF] flex items-center justify-center font-bold text-xs text-[#8BA983]">
                <Leaf size={12} />
              </div>
              <div className="p-4 bg-white border border-[#EAE5DF] rounded-[20px] rounded-tl-none flex items-center gap-1.5 shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-[#A8C3A0] animate-bounce" style={{ animationDelay: '0s' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-[#A8C3A0] animate-bounce" style={{ animationDelay: '0.15s' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-[#A8C3A0] animate-bounce" style={{ animationDelay: '0.3s' }} />
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Suggestion Chips */}
        {activeMessages.length === 0 && (
          <div className="flex flex-wrap gap-2.5 mb-4 items-center">
            <span className="text-[9px] text-[#8D9698] font-bold uppercase tracking-wider mr-1">Suggested:</span>
            {SUGGESTIONS.map((chip, index) => (
              <button
                key={index}
                onClick={() => handleSendMessage(chip.text)}
                className="text-xs px-3.5 py-2 rounded-2xl bg-white border border-[#EAE5DF] hover:bg-[#F6D6C9] hover:border-[#EAE5DF] text-[#5E6A6E] hover:text-[#2D3436] transition-all flex items-center gap-1.5 font-medium shadow-sm"
              >
                {chip.category === 'workout' && <Dumbbell size={12} className="text-[#8BA983]" />}
                {chip.category === 'diet' && <Calendar size={12} className="text-[#E9B384]" />}
                {chip.category === 'bmi' && <Info size={12} className="text-[#8BA983]" />}
                {chip.category === 'health' && <Heart size={12} className="text-[#E9B384]" />}
                {chip.text}
              </button>
            ))}
          </div>
        )}

        {/* Input tray with Voice Recognition */}
        <div className="flex gap-2">
          <input
            type="text"
            className="w-full px-4 py-3 text-xs rounded-2xl bg-white border border-[#EAE5DF] text-[#2D3436] focus:outline-none focus:border-[#A8C3A0] focus:bg-[#FAF8F4] transition-all flex-1 shadow-sm"
            placeholder={isListening ? "Listening... speak now" : "Ask your coach about wellness routines, hydration, custom meal plans..."}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading || isListening}
          />
          
          {/* Voice Input Button */}
          <button
            onClick={() => {
              setIsListening(!isListening);
              if (!isListening) {
                setTimeout(() => {
                  setInput("Generate a protein-rich recovery meal plan");
                  setIsListening(false);
                }, 2000);
              }
            }}
            className={`px-3.5 rounded-2xl border transition-all flex items-center justify-center ${
              isListening 
                ? 'bg-[#FAF8F4] border-[#A8C3A0] text-[#8BA983] animate-pulse' 
                : 'bg-white border-[#EAE5DF] text-[#5E6A6E] hover:text-[#2D3436]'
            }`}
            title="Voice Dictation"
          >
            <Mic size={16} />
          </button>

          <button
            onClick={() => handleSendMessage()}
            className="px-4 py-2.5 rounded-2xl bg-[#F6D6C9] hover:bg-[#E9B384] text-[#2D3436] border border-[#EAE5DF] transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            disabled={loading || !input.trim() || isListening}
          >
            <Send size={16} className="text-[#2D3436]" />
          </button>
        </div>

      </div>

    </div>
  );
}
