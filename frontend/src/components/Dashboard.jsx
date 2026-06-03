import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Flame, 
  Compass, 
  ArrowRight, 
  Leaf, 
  User, 
  Dumbbell, 
  Calendar,
  Droplet,
  Footprints,
  Heart,
  Award,
  Zap,
  TrendingUp,
  Plus,
  RotateCcw,
  Smile
} from 'lucide-react';

const FITNESS_QUOTES = [
  "Your body can stand almost anything. It's your mind that you have to convince.",
  "Success isn't always about greatness. It's about consistency.",
  "The only bad workout is the one that didn't happen.",
  "Energy flows where attention goes. Focus on your strength today.",
  "Small daily improvements over time lead to stunning results."
];

export default function Dashboard({ profile, bmiRecord, setActiveTab, setProfile, userId }) {
  const [dailyTip, setDailyTip] = useState({ title: "Loading Tip...", content: "Fetching the daily tip to keep you healthy." });
  const [loadingTip, setLoadingTip] = useState(true);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [waterCups, setWaterCups] = useState(3); // Interactive: 3 cups drank (250ml each)
  const [challengeCompleted, setChallengeCompleted] = useState(false);
  const [randomQuote, setRandomQuote] = useState('');
  
  // Profile form state
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: 'Male',
    height: '',
    weight: '',
    activity_level: 'Moderate',
    goal: 'Maintain Weight'
  });

  useEffect(() => {
    // Set a random fitness quote
    const index = Math.floor(Math.random() * FITNESS_QUOTES.length);
    setRandomQuote(FITNESS_QUOTES[index]);

    fetch('http://localhost:5000/api/tips/daily')
      .then(res => {
        if (!res.ok) throw new Error("API error");
        return res.json();
      })
      .then(data => {
        setDailyTip(data);
        setLoadingTip(false);
      })
      .catch(err => {
        console.error("Error loading daily tip:", err);
        setDailyTip({
          title: "Stay Dynamic",
          content: "Remember to take dynamic stretching breaks every 45 minutes when working at a desk."
        });
        setLoadingTip(false);
      });
  }, []);

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || '',
        age: profile.age || '',
        gender: profile.gender || 'Male',
        height: profile.height || '',
        weight: profile.weight || '',
        activity_level: profile.activity_level || 'Moderate',
        goal: profile.goal || 'Maintain Weight'
      });
    }
  }, [profile]);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, user_id: userId })
      });
      const data = await response.json();
      setProfile(data.profile);
      setShowProfileModal(false);
    } catch (err) {
      console.error("Error updating profile:", err);
      setProfile(formData);
      setShowProfileModal(false);
    }
  };

  const getBmiStatusColor = (bmi) => {
    if (!bmi) return 'text-[#8D9698] bg-[#F5F2ED] border-[#EAE5DF]';
    if (bmi < 18.5) return 'text-blue-600 bg-blue-50 border-blue-100';
    if (bmi < 25) return 'text-[#8BA983] bg-[#FAF8F4] border-[#A8C3A0]/30'; // Normal Weight
    if (bmi < 30) return 'text-amber-600 bg-amber-50 border-amber-100';
    return 'text-red-600 bg-red-50 border-red-100';
  };

  // Mock data for the weight progress graph (SVG Line Chart)
  const weightHistory = [74.5, 73.2, 72.8, 71.4, 70.8, 70.0];
  const chartLabels = ["Dec", "Jan", "Feb", "Mar", "Apr", "May"];

  // SVG parameters
  const chartWidth = 500;
  const chartHeight = 150;
  const padding = 20;
  
  // Scale helper for weights (min 68, max 76)
  const minWeight = 68;
  const maxWeight = 76;
  
  const points = weightHistory.map((val, idx) => {
    const x = padding + (idx * (chartWidth - padding * 2)) / (weightHistory.length - 1);
    const y = chartHeight - padding - ((val - minWeight) * (chartHeight - padding * 2)) / (maxWeight - minWeight);
    return `${x},${y}`;
  }).join(' ');

  // SVG Area path closing at the bottom
  const areaPoints = `
    ${padding},${chartHeight - padding}
    ${points}
    ${chartWidth - padding},${chartHeight - padding}
  `;

  return (
    <div className="space-y-6">
      
      {/* Hero Welcome banner */}
      <div className="relative overflow-hidden rounded-[24px] p-6 lg:p-8 bg-white border border-[#EAE5DF] shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF8F4] border border-[#EAE5DF] text-[#8BA983] text-[10px] font-bold uppercase tracking-wider">
              <Leaf size={10} /> YOUR PERSONAL WELLNESS COMPANION
            </div>
            <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-[#2D3436]">
              Welcome back, <span className="text-[#8BA983]">{profile?.name || 'Athlete'}</span>
            </h1>
            <p className="text-[#5E6A6E] text-xs max-w-xl leading-relaxed">
              "{randomQuote}"
            </p>
          </div>
          
          <button 
            onClick={() => setShowProfileModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-[16px] bg-[#F6D6C9] hover:bg-[#E9B384] text-xs font-semibold text-[#2D3436] transition-all self-start lg:self-auto border border-[#EAE5DF]"
          >
            <User size={14} className="text-[#8BA983]" /> Edit Profile Details
          </button>
        </div>
      </div>

      {/* Grid: 4 Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Calories Burned card */}
        <div className="glass-panel p-5 flex items-center justify-between relative overflow-hidden">
          <div className="space-y-2">
            <span className="text-[10px] text-[#5E6A6E] font-bold uppercase tracking-wider block">Calories Burned</span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-[#2D3436]">480</span>
              <span className="text-[10px] text-[#8D9698] font-semibold">/ 600 kcal</span>
            </div>
            {/* Calories Progress bar */}
            <div className="w-36 h-1.5 bg-[#F5F2ED] rounded-full overflow-hidden">
              <div className="h-full bg-[#A8C3A0] rounded-full" style={{ width: '80%' }} />
            </div>
          </div>
          
          {/* Circular SVG Ring */}
          <div className="w-14 h-14 relative shrink-0">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="28" cy="28" r="22" stroke="#FAF8F4" strokeWidth="4" fill="transparent" />
              <circle cx="28" cy="28" r="22" stroke="#A8C3A0" strokeWidth="4" fill="transparent"
                strokeDasharray={2 * Math.PI * 22}
                strokeDashoffset={2 * Math.PI * 22 * (1 - 0.8)} 
                strokeLinecap="round"
              />
            </svg>
            <Flame className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-[#A8C3A0]" size={16} />
          </div>
        </div>

        {/* Daily Steps card */}
        <div className="glass-panel p-5 flex items-center justify-between relative overflow-hidden">
          <div className="space-y-2">
            <span className="text-[10px] text-[#5E6A6E] font-bold uppercase tracking-wider block">Daily Steps</span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-[#2D3436]">6,840</span>
              <span className="text-[10px] text-[#8D9698] font-semibold">/ 10k steps</span>
            </div>
            <div className="w-36 h-1.5 bg-[#F5F2ED] rounded-full overflow-hidden">
              <div className="h-full bg-[#E9B384] rounded-full" style={{ width: '68%' }} />
            </div>
          </div>
          
          <div className="w-14 h-14 relative shrink-0">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="28" cy="28" r="22" stroke="#FAF8F4" strokeWidth="4" fill="transparent" />
              <circle cx="28" cy="28" r="22" stroke="#E9B384" strokeWidth="4" fill="transparent"
                strokeDasharray={2 * Math.PI * 22}
                strokeDashoffset={2 * Math.PI * 22 * (1 - 0.68)} 
                strokeLinecap="round"
              />
            </svg>
            <Footprints className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-[#E9B384]" size={16} />
          </div>
        </div>

        {/* Workout Streak card */}
        <div className="glass-panel p-5 flex items-center justify-between relative overflow-hidden">
          <div className="space-y-2">
            <span className="text-[10px] text-[#5E6A6E] font-bold uppercase tracking-wider block">Workout Streak</span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-[#2D3436]">5 Days</span>
              <span className="text-[10px] text-[#8D9698] font-semibold">Active Streak</span>
            </div>
            <div className="flex gap-1">
              {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, idx) => (
                <span 
                  key={idx} 
                  className={`w-4.5 h-4.5 rounded-full text-[8px] font-bold flex items-center justify-center border ${
                    idx < 5 
                      ? 'bg-[#A8C3A0]/20 border-[#A8C3A0]/30 text-[#8BA983]' 
                      : 'bg-[#F5F2ED] border-[#EAE5DF] text-[#8D9698]'
                  }`}
                >
                  {day}
                </span>
              ))}
            </div>
          </div>
          
          <div className="w-12 h-12 rounded-[16px] bg-[#FAF8F4] border border-[#EAE5DF] flex items-center justify-center text-[#8BA983] shrink-0">
            <Heart size={22} />
          </div>
        </div>

        {/* Target Calorie Plan */}
        <div className="glass-panel p-5 flex items-center justify-between relative overflow-hidden">
          <div className="space-y-2">
            <span className="text-[10px] text-[#5E6A6E] font-bold uppercase tracking-wider block">Target Energy</span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-[#2D3436]">
                {profile?.goal === 'Weight Loss' ? '1,800' : profile?.goal === 'Weight Gain' ? '2,800' : '2,200'}
              </span>
              <span className="text-[10px] text-[#8D9698] font-semibold">kcal / day</span>
            </div>
            <span className="text-[10px] text-[#8BA983] font-bold block">{profile?.goal || 'Build Muscle'}</span>
          </div>
          
          <div className="w-12 h-12 rounded-[16px] bg-[#FAF8F4] border border-[#EAE5DF] flex items-center justify-center text-[#E9B384] shrink-0">
            <Activity size={22} />
          </div>
        </div>

      </div>

      {/* Grid: Health Tip & BMI Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Daily Tip Card */}
        <div className="lg:col-span-2 glass-panel p-6 flex flex-col justify-between relative overflow-hidden">
          <div>
            <div className="flex items-center gap-1.5 text-[#8BA983] text-xs font-bold mb-3 uppercase tracking-wider">
              <Leaf size={14} />
              <span>COACH RECOMMENDATION OF THE DAY</span>
            </div>
            <h3 className="text-lg font-bold text-[#2D3436] mb-2">{dailyTip.title}</h3>
            <p className="text-[#5E6A6E] text-xs leading-relaxed max-w-xl">{dailyTip.content}</p>
          </div>
          <div className="border-t border-[#EAE5DF] pt-4 mt-6 flex justify-between items-center text-[10px] text-[#8D9698] font-semibold">
            <span>UPDATED TODAY</span>
            <span className="text-[#8BA983]">DAILY MOTIVATIONAL TIP</span>
          </div>
        </div>

        {/* Quick BMI Summary Card */}
        <div className="glass-panel p-6 flex flex-col justify-between relative overflow-hidden">
          <div>
            <div className="flex items-center gap-1.5 text-[#E9B384] text-xs font-bold mb-3 uppercase tracking-wider">
              <Activity size={14} />
              <span>Body Mass Index Status</span>
            </div>
            {bmiRecord ? (
              <div className="space-y-3">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-[#2D3436]">{bmiRecord.bmi}</span>
                  <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase ${getBmiStatusColor(bmiRecord.bmi)} border`}>
                    {bmiRecord.classification}
                  </span>
                </div>
                <p className="text-[#5E6A6E] text-xs leading-relaxed">
                  Height: {bmiRecord.height} cm | Weight: {bmiRecord.weight} kg
                </p>
              </div>
            ) : (
              <div className="text-[#8D9698] text-xs py-4 leading-relaxed">
                No BMI records loaded. Calculate your Body Mass index to view health status indicators.
              </div>
            )}
          </div>
          <button 
            onClick={() => setActiveTab('bmi')}
            className="text-[#8BA983] hover:text-[#A8C3A0] text-xs font-semibold flex items-center gap-1 mt-6 self-start group transition-all"
          >
            Compute BMI <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

      {/* Grid: Graph, Hydration, Challenges */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Weight Progress graph (8 columns) */}
        <div className="lg:col-span-8 glass-panel p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp size={16} className="text-[#8BA983]" />
              <h3 className="font-bold text-sm text-[#2D3436] uppercase tracking-wider">Weight Telemetry (6 Months)</h3>
            </div>
            <span className="text-[10px] text-[#8D9698] font-bold uppercase">Target: 69.0 kg</span>
          </div>

          {/* SVG Line Graph */}
          <div className="w-full overflow-x-auto">
            <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="chartStroke" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#A8C3A0" />
                  <stop offset="100%" stopColor="#E9B384" />
                </linearGradient>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#A8C3A0" stopOpacity="0.15"/>
                  <stop offset="100%" stopColor="#FAF8F4" stopOpacity="0.0"/>
                </linearGradient>
              </defs>
              
              {/* Horizontal Grid lines */}
              {[70, 72, 74].map((gridVal, gIdx) => {
                const yVal = chartHeight - padding - ((gridVal - minWeight) * (chartHeight - padding * 2)) / (maxWeight - minWeight);
                return (
                  <g key={gIdx}>
                    <line x1={padding} y1={yVal} x2={chartWidth - padding} y2={yVal} stroke="#EAE5DF" strokeWidth="1" strokeDasharray="4 4" />
                    <text x={padding - 5} y={yVal + 3} fill="#8D9698" fontSize="8" fontWeight="bold" textAnchor="end">{gridVal}kg</text>
                  </g>
                );
              })}

              {/* Area path under the line */}
              <polygon points={areaPoints} fill="url(#chartGradient)" />

              {/* The line */}
              <polyline points={points} fill="none" stroke="url(#chartStroke)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

              {/* Data dots and labels */}
              {weightHistory.map((val, idx) => {
                const x = padding + (idx * (chartWidth - padding * 2)) / (weightHistory.length - 1);
                const y = chartHeight - padding - ((val - minWeight) * (chartHeight - padding * 2)) / (maxWeight - minWeight);
                return (
                  <g key={idx}>
                    <circle cx={x} cy={y} r="4" fill="#FFFFFF" stroke="#A8C3A0" strokeWidth="2" />
                    <text x={x} y={y - 8} fill="#2D3436" fontSize="8" fontWeight="bold" textAnchor="middle">{val}</text>
                    <text x={x} y={chartHeight - 4} fill="#8D9698" fontSize="8" fontWeight="bold" textAnchor="middle">{chartLabels[idx]}</text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Interactive Hydration Tracker (4 columns) */}
        <div className="lg:col-span-4 glass-panel p-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-[#2D3436] uppercase tracking-wider flex items-center gap-1.5">
                <Droplet size={16} className="text-[#E9B384]" /> Hydration Tracker
              </h3>
              <button 
                onClick={() => setWaterCups(0)}
                className="text-[#8D9698] hover:text-[#5E6A6E] transition-colors"
                title="Reset Hydration"
              >
                <RotateCcw size={12} />
              </button>
            </div>
            
            <div className="text-center py-4 space-y-2">
              <span className="text-4xl font-black text-[#2D3436]">{waterCups * 250} <span className="text-xs text-[#8D9698] font-bold">ml</span></span>
              <p className="text-[10px] text-[#5E6A6E]">Target intake: 2000 ml (8 cups)</p>
            </div>

            {/* Grid of cups */}
            <div className="grid grid-cols-8 gap-1.5 justify-center py-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <div 
                  key={i}
                  className={`h-7 rounded-lg border flex items-center justify-center transition-all ${
                    i < waterCups 
                      ? 'bg-[#E9B384]/20 border-[#E9B384]/40 text-[#E9B384] shadow-sm' 
                      : 'bg-[#FAF8F4] border-[#EAE5DF] text-[#8D9698]'
                  }`}
                >
                  <Droplet size={12} className={i < waterCups ? 'fill-[#E9B384]' : ''} />
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => setWaterCups(prev => Math.min(prev + 1, 8))}
            disabled={waterCups >= 8}
            className="w-full mt-4 flex items-center justify-center gap-1.5 py-2.5 rounded-[16px] bg-[#F6D6C9] hover:bg-[#E9B384] text-[#2D3436] text-xs font-semibold transition-all border border-[#EAE5DF] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus size={14} /> Log 250ml Water Cup
          </button>
        </div>

      </div>

      {/* Grid: Daily Challenge & Explore */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Daily Challenge Card (5 cols) */}
        <div className="lg:col-span-5 glass-panel p-6 flex flex-col justify-between relative overflow-hidden">
          <div className="space-y-4">
            <div className="flex items-center gap-1.5 text-[#E9B384] text-xs font-bold uppercase tracking-wider">
              <Award size={14} />
              <span>Daily Physical Quest</span>
            </div>
            
            <div className="p-4 rounded-2xl bg-[#FAF8F4] border border-[#EAE5DF] flex items-start gap-3">
              <input 
                type="checkbox" 
                checked={challengeCompleted}
                onChange={() => setChallengeCompleted(!challengeCompleted)}
                className="mt-1 w-4.5 h-4.5 rounded border-[#EAE5DF] text-[#8BA983] bg-white focus:ring-[#8BA983]"
                id="challenge-checkbox"
              />
              <label htmlFor="challenge-checkbox" className="cursor-pointer space-y-1">
                <span className={`text-xs font-bold block ${challengeCompleted ? 'line-through text-[#8D9698]' : 'text-[#2D3436]'}`}>
                  Perform 50 Jumping Jacks
                </span>
                <span className="text-[10px] text-[#5E6A6E] block">
                  Completing this daily challenge builds functional mobility and boosts cardiovascular speed.
                </span>
              </label>
            </div>
          </div>
          
          <div className="text-[10px] font-bold uppercase tracking-wider text-[#8D9698] mt-6 flex justify-between items-center">
            <span>EXP: +100 POINTS</span>
            {challengeCompleted && <span className="text-[#8BA983] flex items-center gap-1"><Zap size={10} /> COMPLETED</span>}
          </div>
        </div>

        {/* Quick Actions (7 cols) */}
        <div className="lg:col-span-7 glass-panel p-6 space-y-4">
          <h3 className="font-bold text-sm text-[#2D3436] uppercase tracking-wider">Explore Platform Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            <div 
              onClick={() => setActiveTab('chatbot')}
              className="p-4 rounded-2xl bg-[#FAF8F4] hover:bg-white border border-[#EAE5DF] hover:border-[#A8C3A0]/60 cursor-pointer group transition-all"
            >
              <div className="w-9 h-9 rounded-xl bg-[#A8C3A0]/10 flex items-center justify-center text-[#8BA983] mb-3">
                <Leaf size={16} />
              </div>
              <h4 className="font-bold text-xs text-[#2D3436] group-hover:text-[#8BA983] transition-colors">Wellness Coach</h4>
              <p className="text-[#5E6A6E] text-[10px] leading-relaxed mt-1">Get customized diet edits and workouts instantly.</p>
            </div>

            <div 
              onClick={() => setActiveTab('workout')}
              className="p-4 rounded-2xl bg-[#FAF8F4] hover:bg-white border border-[#EAE5DF] hover:border-[#E9B384]/60 cursor-pointer group transition-all"
            >
              <div className="w-9 h-9 rounded-xl bg-[#E9B384]/10 flex items-center justify-center text-[#E9B384] mb-3">
                <Dumbbell size={16} />
              </div>
              <h4 className="font-bold text-xs text-[#2D3436] group-hover:text-[#E9B384] transition-colors">Workout Splits</h4>
              <p className="text-[#5E6A6E] text-[10px] leading-relaxed mt-1">Check mobility drills and exercise splits.</p>
            </div>

            <div 
              onClick={() => setActiveTab('diet')}
              className="p-4 rounded-2xl bg-[#FAF8F4] hover:bg-white border border-[#EAE5DF] hover:border-[#A8C3A0]/60 cursor-pointer group transition-all"
            >
              <div className="w-9 h-9 rounded-xl bg-[#A8C3A0]/10 flex items-center justify-center text-[#8BA983] mb-3">
                <Calendar size={16} />
              </div>
              <h4 className="font-bold text-xs text-[#2D3436] group-hover:text-[#8BA983] transition-colors">Meal Calendars</h4>
              <p className="text-[#5E6A6E] text-[10px] leading-relaxed mt-1">Build macro ratios and track nutrient weights.</p>
            </div>

          </div>
        </div>

      </div>

      {/* Edit Profile Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#FAF8F4]/80 backdrop-blur-sm p-4">
          <div className="glass-panel w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto animate-scale-in">
            
            <div className="flex items-center justify-between pb-3 border-b border-[#EAE5DF] mb-4">
              <h2 className="text-lg font-bold text-[#2D3436] uppercase tracking-wider flex items-center gap-1.5">
                <User size={18} className="text-[#8BA983]" /> Athlete Setup
              </h2>
              <button 
                onClick={() => setShowProfileModal(false)}
                className="text-[#8D9698] hover:text-[#2D3436] font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] text-[#5E6A6E] font-bold uppercase tracking-wider">Full Name</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-2.5 text-xs rounded-xl bg-white border border-[#EAE5DF] text-[#2D3436] focus:outline-none focus:border-[#A8C3A0] focus:bg-[#FAF8F4] transition-all" 
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Preethi"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] text-[#5E6A6E] font-bold uppercase tracking-wider">Age</label>
                  <input 
                    type="number" 
                    className="w-full px-4 py-2.5 text-xs rounded-xl bg-white border border-[#EAE5DF] text-[#2D3436] focus:outline-none focus:border-[#A8C3A0] focus:bg-[#FAF8F4] transition-all" 
                    value={formData.age}
                    onChange={e => setFormData({ ...formData, age: e.target.value })}
                    placeholder="e.g. 24"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] text-[#5E6A6E] font-bold uppercase tracking-wider">Gender</label>
                  <select 
                    className="w-full px-4 py-2.5 text-xs rounded-xl bg-white border border-[#EAE5DF] text-[#2D3436] focus:outline-none focus:border-[#A8C3A0] focus:bg-[#FAF8F4] transition-all"
                    value={formData.gender}
                    onChange={e => setFormData({ ...formData, gender: e.target.value })}
                  >
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] text-[#5E6A6E] font-bold uppercase tracking-wider">Height (cm)</label>
                  <input 
                    type="number" 
                    className="w-full px-4 py-2.5 text-xs rounded-xl bg-white border border-[#EAE5DF] text-[#2D3436] focus:outline-none focus:border-[#A8C3A0] focus:bg-[#FAF8F4] transition-all" 
                    value={formData.height}
                    onChange={e => setFormData({ ...formData, height: e.target.value })}
                    placeholder="e.g. 165"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] text-[#5E6A6E] font-bold uppercase tracking-wider">Weight (kg)</label>
                  <input 
                    type="number" 
                    className="w-full px-4 py-2.5 text-xs rounded-xl bg-white border border-[#EAE5DF] text-[#2D3436] focus:outline-none focus:border-[#A8C3A0] focus:bg-[#FAF8F4] transition-all" 
                    value={formData.weight}
                    onChange={e => setFormData({ ...formData, weight: e.target.value })}
                    placeholder="e.g. 60"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] text-[#5E6A6E] font-bold uppercase tracking-wider">Activity Level</label>
                <select 
                  className="w-full px-4 py-2.5 text-xs rounded-xl bg-white border border-[#EAE5DF] text-[#2D3436] focus:outline-none focus:border-[#A8C3A0] focus:bg-[#FAF8F4] transition-all"
                  value={formData.activity_level}
                  onChange={e => setFormData({ ...formData, activity_level: e.target.value })}
                >
                  <option>Sedentary (little to no exercise)</option>
                  <option>Light (1-3 days/week)</option>
                  <option>Moderate (3-5 days/week)</option>
                  <option>Active (6-7 days/week)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] text-[#5E6A6E] font-bold uppercase tracking-wider">Fitness Goal</label>
                <select 
                  className="w-full px-4 py-2.5 text-xs rounded-xl bg-white border border-[#EAE5DF] text-[#2D3436] focus:outline-none focus:border-[#A8C3A0] focus:bg-[#FAF8F4] transition-all"
                  value={formData.goal}
                  onChange={e => setFormData({ ...formData, goal: e.target.value })}
                >
                  <option>Weight Loss</option>
                  <option>Maintain Weight</option>
                  <option>Weight Gain</option>
                  <option>Build Muscle</option>
                </select>
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-[#EAE5DF] mt-6">
                <button 
                  type="button" 
                  onClick={() => setShowProfileModal(false)}
                  className="px-4 py-2 rounded-[16px] bg-white border border-[#EAE5DF] text-[#5E6A6E] hover:text-[#2D3436] transition-all text-xs font-semibold"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 rounded-[16px] bg-[#F6D6C9] hover:bg-[#E9B384] text-[#2D3436] transition-all text-xs font-semibold border border-[#EAE5DF]"
                >
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
