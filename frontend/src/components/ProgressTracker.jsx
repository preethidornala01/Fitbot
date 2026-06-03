import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Dumbbell, 
  Flame, 
  Calendar, 
  Activity, 
  Sparkles, 
  RotateCcw,
  Info
} from 'lucide-react';

const WORKOUT_SPLITS = ['Push', 'Pull', 'Legs', 'Full Body', 'Cardio', 'Active Rest', 'Rest'];

export default function ProgressTracker({ profile, history, setHistory }) {
  const [loading, setLoading] = useState(true);
  const [caloriesLogged, setCaloriesLogged] = useState(0);
  const [activeTab, setActiveTab] = useState('weight'); // weight | workouts | nutrition

  // Interactive Workout Log state
  const [weeklyWorkouts, setWeeklyWorkouts] = useState(() => {
    const saved = localStorage.getItem('fitbot_weekly_workouts');
    if (saved) return JSON.parse(saved);
    return [
      { day: 'Mon', completed: true, split: 'Push' },
      { day: 'Tue', completed: true, split: 'Pull' },
      { day: 'Wed', completed: false, split: 'Rest' },
      { day: 'Thu', completed: true, split: 'Legs' },
      { day: 'Fri', completed: false, split: 'Cardio' },
      { day: 'Sat', completed: false, split: 'Rest' },
      { day: 'Sun', completed: false, split: 'Rest' }
    ];
  });

  useEffect(() => {
    localStorage.setItem('fitbot_weekly_workouts', JSON.stringify(weeklyWorkouts));
  }, [weeklyWorkouts]);

  // Load calorie logs from localStorage
  useEffect(() => {
    const today = new Date().toDateString();
    const savedCal = localStorage.getItem(`fitbot_calories_${today}`);
    if (savedCal) {
      setCaloriesLogged(parseInt(savedCal));
    } else {
      setCaloriesLogged(1250); // Default starting point
    }
    setLoading(false);
  }, []);

  const handleLogCalories = (amount) => {
    const newVal = Math.max(0, caloriesLogged + amount);
    setCaloriesLogged(newVal);
    const today = new Date().toDateString();
    localStorage.setItem(`fitbot_calories_${today}`, newVal.toString());
  };

  const handleToggleWorkout = (idx) => {
    setWeeklyWorkouts(prev => prev.map((w, i) => {
      if (i === idx) {
        const nextCompleted = !w.completed;
        return {
          ...w,
          completed: nextCompleted,
          split: nextCompleted ? 'Full Body' : 'Rest'
        };
      }
      return w;
    }));
  };

  const handleSplitChange = (idx, splitVal) => {
    setWeeklyWorkouts(prev => prev.map((w, i) => {
      if (i === idx) {
        return { ...w, split: splitVal, completed: splitVal !== 'Rest' };
      }
      return w;
    }));
  };

  // Calorie calculations based on profile
  const getTargetCalories = () => {
    if (!profile) return 2200;
    if (profile.goal === 'Weight Loss') return 1800;
    if (profile.goal === 'Weight Gain') return 2800;
    return 2200;
  };

  const targetCal = getTargetCalories();
  const calPercent = Math.min(100, Math.round((caloriesLogged / targetCal) * 100));

  // Dynamic macros breakdown based on goals
  const getMacroSplit = () => {
    const goal = profile?.goal || 'Build Muscle';
    if (goal === 'Weight Loss') {
      return { carb: 35, protein: 45, fat: 20 };
    }
    if (goal === 'Weight Gain' || goal === 'Build Muscle') {
      return { carb: 50, protein: 30, fat: 20 };
    }
    return { carb: 40, protein: 30, fat: 30 };
  };

  const macros = getMacroSplit();
  const carbGrams = Math.round((caloriesLogged * (macros.carb / 100)) / 4);
  const proteinGrams = Math.round((caloriesLogged * (macros.protein / 100)) / 4);
  const fatGrams = Math.round((caloriesLogged * (macros.fat / 100)) / 9);

  // SVG Chart Setup for weight trends
  const chartWidth = 600;
  const chartHeight = 220;
  const padding = 35;

  const getChartData = () => {
    if (!history || history.length === 0) {
      return [
        { weight: 70, date: 'N/A', bmi: 22.8 },
        { weight: 70.5, date: 'N/A', bmi: 23.0 },
        { weight: 71.0, date: 'N/A', bmi: 23.2 },
        { weight: 71.2, date: 'N/A', bmi: 23.3 }
      ];
    }
    return [...history].reverse().map(rec => ({
      weight: parseFloat(rec.weight),
      bmi: parseFloat(rec.bmi),
      date: rec.created_at ? new Date(rec.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'Today'
    }));
  };

  const chartData = getChartData();

  // Find min and max for scaling
  const weights = chartData.map(d => d.weight);
  const minW = Math.max(0, Math.min(...weights) - 2);
  const maxW = Math.max(...weights) + 2;

  const pointsW = chartData.map((d, idx) => {
    const x = padding + (idx * (chartWidth - padding * 2)) / Math.max(1, chartData.length - 1);
    const y = chartHeight - padding - ((d.weight - minW) * (chartHeight - padding * 2)) / Math.max(1, maxW - minW);
    return `${x},${y}`;
  }).join(' ');

  const areaPointsW = chartData.length > 0 ? `
    ${padding},${chartHeight - padding}
    ${pointsW}
    ${chartWidth - padding},${chartHeight - padding}
  ` : '';

  const completedWorkoutsCount = weeklyWorkouts.filter(w => w.completed && w.split !== 'Rest').length;
  const workoutConsistency = Math.round((completedWorkoutsCount / 7) * 100);

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Page Title */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-[#2D3436] flex items-center gap-2">
            <TrendingUp size={24} className="text-[#8BA983]" /> Progress Telemetry
          </h1>
          <p className="text-xs text-[#5E6A6E] max-w-xl">
            Evaluate physiological metrics, workout splits consistency, and nutritional calorie counts in real-time.
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#FAF8F4] border border-[#EAE5DF] self-stretch md:self-auto">
          <button
            onClick={() => setActiveTab('weight')}
            className={`flex-1 md:flex-initial px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'weight' 
                ? 'bg-white text-[#8BA983] border border-[#EAE5DF] shadow-sm' 
                : 'text-[#5E6A6E] hover:text-[#2D3436] border border-transparent'
            }`}
          >
            Weight Trend
          </button>
          <button
            onClick={() => setActiveTab('workouts')}
            className={`flex-1 md:flex-initial px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'workouts' 
                ? 'bg-white text-[#8BA983] border border-[#EAE5DF] shadow-sm' 
                : 'text-[#5E6A6E] hover:text-[#2D3436] border border-transparent'
            }`}
          >
            Workout Splits
          </button>
          <button
            onClick={() => setActiveTab('nutrition')}
            className={`flex-1 md:flex-initial px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'nutrition' 
                ? 'bg-white text-[#8BA983] border border-[#EAE5DF] shadow-sm' 
                : 'text-[#5E6A6E] hover:text-[#2D3436] border border-transparent'
            }`}
          >
            Nutrition Logs
          </button>
        </div>
      </div>

      {/* Grid: 3 Quick Summary Telemetry Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Card 1: Current weight */}
        <div className="glass-panel p-5 flex items-center justify-between relative overflow-hidden group">
          <div className="space-y-2">
            <span className="text-[10px] text-[#8D9698] font-bold uppercase tracking-wider block">Current Weight</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-bold text-[#2D3436]">
                {history && history.length > 0 ? history[0].weight : profile?.weight || '--'}
              </span>
              <span className="text-xs text-[#5E6A6E] font-bold">kg</span>
            </div>
            <span className="text-[10px] text-[#8BA983] font-bold block flex items-center gap-1">
              <Activity size={10} /> BMI: {history && history.length > 0 ? history[0].bmi : '--'}
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-[#FAF8F4] border border-[#EAE5DF] flex items-center justify-center text-[#8BA983] shrink-0">
            <TrendingUp size={22} />
          </div>
        </div>

        {/* Card 2: Weekly Workout Consistency */}
        <div className="glass-panel p-5 flex items-center justify-between relative overflow-hidden group">
          <div className="space-y-2">
            <span className="text-[10px] text-[#8D9698] font-bold uppercase tracking-wider block">Workout Consistency</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-bold text-[#2D3436]">{workoutConsistency}%</span>
              <span className="text-xs text-[#5E6A6E] font-bold">this week</span>
            </div>
            <span className="text-[10px] text-[#8BA983] font-bold block">
              {completedWorkoutsCount} of 7 sessions logged
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-[#FAF8F4] border border-[#EAE5DF] flex items-center justify-center text-[#8BA983] shrink-0">
            <Dumbbell size={22} />
          </div>
        </div>

        {/* Card 3: Daily Calorie Target */}
        <div className="glass-panel p-5 flex items-center justify-between relative overflow-hidden group">
          <div className="space-y-2">
            <span className="text-[10px] text-[#8D9698] font-bold uppercase tracking-wider block">Daily Calories Intake</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-bold text-[#2D3436]">{caloriesLogged}</span>
              <span className="text-xs text-[#5E6A6E] font-semibold">/ {targetCal} kcal</span>
            </div>
            <div className="w-36 h-1.5 bg-[#FAF8F4] rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-[#E9B384] to-[#F6D6C9] rounded-full" style={{ width: `${calPercent}%` }} />
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-[#FAF8F4] border border-[#EAE5DF] flex items-center justify-center text-[#E9B384] shrink-0">
            <Flame size={22} />
          </div>
        </div>

      </div>

      {/* Main View Display Panels */}
      {activeTab === 'weight' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* SVG Telemetry Chart */}
          <div className="lg:col-span-2 glass-panel p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-[#2D3436] uppercase tracking-wider flex items-center gap-1.5">
                <TrendingUp size={16} className="text-[#8BA983]" /> Weight Tracking Timeline
              </h3>
              <span className="text-[10px] text-[#8D9698] font-bold uppercase">
                {chartData.length} records active
              </span>
            </div>

            {/* Chart Area */}
            <div className="w-full">
              {chartData.length > 1 ? (
                <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-full overflow-visible">
                  <defs>
                    <linearGradient id="weightGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#A8C3A0" stopOpacity="0.2"/>
                      <stop offset="100%" stopColor="#A8C3A0" stopOpacity="0.0"/>
                    </linearGradient>
                  </defs>

                  {/* Grid Lines */}
                  {Array.from({ length: 5 }).map((_, gIdx) => {
                    const gridVal = minW + (gIdx * (maxW - minW)) / 4;
                    const yVal = chartHeight - padding - ((gridVal - minW) * (chartHeight - padding * 2)) / (maxW - minW);
                    return (
                      <g key={gIdx}>
                        <line x1={padding} y1={yVal} x2={chartWidth - padding} y2={yVal} stroke="#EAE5DF" strokeWidth="1" strokeDasharray="3 3" />
                        <text x={padding - 8} y={yVal + 3} fill="#8D9698" fontSize="8" fontWeight="bold" textAnchor="end">
                          {gridVal.toFixed(1)} kg
                        </text>
                      </g>
                    );
                  })}

                  {/* Gradient Area under curve */}
                  <polygon points={areaPointsW} fill="url(#weightGrad)" />

                  {/* Trend line */}
                  <polyline points={pointsW} fill="none" stroke="#8BA983" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

                  {/* Data Dots & Labels */}
                  {chartData.map((d, idx) => {
                    const x = padding + (idx * (chartWidth - padding * 2)) / (chartData.length - 1);
                    const y = chartHeight - padding - ((d.weight - minW) * (chartHeight - padding * 2)) / (maxW - minW);
                    return (
                      <g key={idx}>
                        <circle cx={x} cy={y} r="5" fill="#FFFFFF" stroke="#8BA983" strokeWidth="2" />
                        <text x={x} y={y - 10} fill="#2D3436" fontSize="8" fontWeight="bold" textAnchor="middle">
                          {d.weight} kg
                        </text>
                        <text x={x} y={chartHeight - 12} fill="#8D9698" fontSize="8" fontWeight="bold" textAnchor="middle">
                          {d.date}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              ) : (
                <div className="text-center py-20 text-[#8D9698] text-xs">
                  Compute BMI multiple times to generate weight tracking trends.
                </div>
              )}
            </div>
          </div>

          {/* BMI Status and History stats */}
          <div className="glass-panel p-6 space-y-6">
            <h3 className="font-bold text-sm text-[#2D3436] uppercase tracking-wider flex items-center gap-1.5">
              <Activity size={16} className="text-[#8BA983]" /> BMI Distribution Analysis
            </h3>

            {history && history.length > 0 ? (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-[#FAF8F4] border border-[#EAE5DF] space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-[#8D9698] font-bold uppercase">Latest BMI</span>
                    <span className="text-xs text-[#5E6A6E] font-bold">{new Date(history[0].created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-[#2D3436]">{history[0].bmi}</span>
                    <span className="text-xs text-[#8BA983] font-bold px-2 py-0.5 rounded-full bg-[#FAF8F4] border border-[#A8C3A0]/30">
                      {history[0].classification}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-[10px] text-[#8D9698] font-bold uppercase tracking-wider block">Historical Records</span>
                  <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
                    {history.slice(0, 4).map((rec, i) => (
                      <div key={i} className="flex justify-between items-center py-2 border-b border-[#EAE5DF] text-xs font-semibold">
                        <span className="text-[#5E6A6E]">{rec.weight} kg · {rec.height} cm</span>
                        <span className="text-[#8BA983] font-bold">{rec.bmi} BMI</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-[#8D9698] text-xs">
                No BMI calculations recorded. Use the BMI calculator to display body metrics.
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'workouts' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Weekly Workouts Log Sheet */}
          <div className="lg:col-span-8 glass-panel p-6 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-[#EAE5DF]">
              <h3 className="font-bold text-sm text-[#2D3436] uppercase tracking-wider flex items-center gap-1.5">
                <Calendar size={16} className="text-[#8BA983]" /> Weekly Workout Split Schedule
              </h3>
              <span className="text-[10px] text-[#8D9698] font-bold uppercase">
                Interactive logs
              </span>
            </div>

            <div className="space-y-4">
              {weeklyWorkouts.map((w, idx) => (
                <div 
                  key={idx} 
                  className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all ${
                    w.completed 
                      ? 'bg-[#FAF8F4] border-[#A8C3A0]/30 text-[#8BA983]' 
                      : 'bg-white border-[#EAE5DF] text-[#8D9698]'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <input 
                      type="checkbox"
                      checked={w.completed}
                      onChange={() => handleToggleWorkout(idx)}
                      className="w-5 h-5 rounded border-[#EAE5DF] text-[#8BA983] bg-white focus:ring-[#8BA983]"
                    />
                    <div>
                      <span className="text-sm font-bold text-[#2D3436]">{w.day}</span>
                      <span className="text-[10px] text-[#5E6A6E] block font-semibold mt-0.5">
                        {w.completed ? 'Workout Session Complete' : 'Rest Day Scheduled'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-[#8D9698] font-bold uppercase tracking-wider">Split:</span>
                    <select
                      value={w.split}
                      onChange={(e) => handleSplitChange(idx, e.target.value)}
                      className="px-3 py-1.5 text-xs rounded-lg bg-white border border-[#EAE5DF] focus:outline-none focus:border-[#8BA983] text-[#2D3436]"
                    >
                      {WORKOUT_SPLITS.map((split, sIdx) => (
                        <option key={sIdx} value={split}>{split}</option>
                      ))}
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Workout Stats & Tips */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* consistency ring */}
            <div className="glass-panel p-6 flex flex-col items-center justify-center text-center space-y-4">
              <h4 className="font-bold text-xs text-[#5E6A6E] uppercase tracking-wider">Consistency Score</h4>
              
              <div className="w-28 h-28 relative">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="56" cy="56" r="46" stroke="#FAF8F4" strokeWidth="8" fill="transparent" />
                  <circle cx="56" cy="56" r="46" stroke="#8BA983" strokeWidth="8" fill="transparent"
                    strokeDasharray={2 * Math.PI * 46}
                    strokeDashoffset={2 * Math.PI * 46 * (1 - (completedWorkoutsCount / 7))} 
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dashoffset 0.5s ease-in-out' }}
                  />
                </svg>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <span className="text-2xl font-bold text-[#2D3436]">{completedWorkoutsCount}</span>
                  <span className="text-xs text-[#8D9698] block font-bold">/ 7 days</span>
                </div>
              </div>

              <p className="text-[10px] text-[#5E6A6E] max-w-[180px]">
                Maintain 4 sessions per week for metabolic efficiency. Keep it up!
              </p>
            </div>

            {/* Coach tips */}
            <div className="glass-panel p-5 space-y-3 relative overflow-hidden">
              <div className="flex items-center gap-1 text-[#8BA983] text-xs font-bold uppercase tracking-wider">
                <Sparkles size={14} className="animate-pulse" />
                <span>Coach Recommendation</span>
              </div>
              <h5 className="text-xs font-bold text-[#2D3436]">Active Recovery</h5>
              <p className="text-[10px] text-[#5E6A6E] leading-relaxed">
                If you choose 'Active Rest', limit intensity to 50% HR max. Foam rolling and slow walking stimulate micro-recovery in tears.
              </p>
            </div>

          </div>
        </div>
      )}

      {activeTab === 'nutrition' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Calorie Calculator Tray */}
          <div className="lg:col-span-8 glass-panel p-6 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-[#EAE5DF]">
              <h3 className="font-bold text-sm text-[#2D3436] uppercase tracking-wider flex items-center gap-1.5">
                <Flame size={16} className="text-[#E9B384]" /> Daily Calorie Energy Budget
              </h3>
              <span className="text-[10px] text-[#8D9698] font-bold uppercase">
                Goal: {profile?.goal || 'Build Muscle'}
              </span>
            </div>

            <div className="text-center py-8 space-y-3 relative overflow-hidden bg-[#FAF8F4] rounded-2xl border border-[#EAE5DF]">
              <span className="text-5xl font-bold text-[#2D3436] tracking-tight">
                {caloriesLogged} <span className="text-lg text-[#8D9698]">kcal</span>
              </span>
              <p className="text-xs text-[#5E6A6E] font-semibold">
                Daily Budget: <span className="text-[#2D3436]">{targetCal} kcal</span>
              </p>
              
              {/* Progress bar */}
              <div className="w-64 h-2 bg-[#EAE5DF] rounded-full mx-auto overflow-hidden">
                <div className="h-full bg-gradient-to-r from-[#E9B384] to-[#F6D6C9] rounded-full transition-all duration-500" style={{ width: `${calPercent}%` }} />
              </div>
            </div>

            {/* Quick logs controls */}
            <div className="space-y-3">
              <span className="text-[10px] text-[#8D9698] font-bold uppercase tracking-wider block">Log Nutrition Meal</span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <button
                  onClick={() => handleLogCalories(150)}
                  className="p-3 rounded-xl bg-white hover:bg-[#FAF8F4] border border-[#EAE5DF] text-[#2D3436] hover:text-[#2D3436] hover:border-[#8BA983] transition-all text-xs font-bold shadow-sm"
                >
                  +150 kcal <span className="text-[9px] text-[#8D9698] block font-normal mt-0.5">Snack / Fruit</span>
                </button>
                <button
                  onClick={() => handleLogCalories(350)}
                  className="p-3 rounded-xl bg-white hover:bg-[#FAF8F4] border border-[#EAE5DF] text-[#2D3436] hover:text-[#2D3436] hover:border-[#8BA983] transition-all text-xs font-bold shadow-sm"
                >
                  +350 kcal <span className="text-[9px] text-[#8D9698] block font-normal mt-0.5">Light Breakfast</span>
                </button>
                <button
                  onClick={() => handleLogCalories(650)}
                  className="p-3 rounded-xl bg-white hover:bg-[#FAF8F4] border border-[#EAE5DF] text-[#2D3436] hover:text-[#2D3436] hover:border-[#8BA983] transition-all text-xs font-bold shadow-sm"
                >
                  +650 kcal <span className="text-[9px] text-[#8D9698] block font-normal mt-0.5">Full Lunch / Meal</span>
                </button>
                <button
                  onClick={() => handleLogCalories(-200)}
                  disabled={caloriesLogged === 0}
                  className="p-3 rounded-xl bg-white hover:bg-rose-50 border border-[#EAE5DF]/80 text-[#8D9698] hover:text-rose-500 hover:border-rose-100 transition-all text-xs font-bold disabled:opacity-30 disabled:cursor-not-allowed shadow-sm"
                >
                  -200 kcal <span className="text-[9px] text-rose-300 block font-normal mt-0.5">Adjust / Remove</span>
                </button>
              </div>
            </div>
          </div>

          {/* Macro Breakdown */}
          <div className="lg:col-span-4 glass-panel p-6 space-y-6">
            <h3 className="font-bold text-sm text-[#2D3436] uppercase tracking-wider flex items-center gap-1.5">
              <Activity size={16} className="text-[#E9B384]" /> Target Macro Ratios
            </h3>

            <div className="space-y-4">
              
              {/* Protein split */}
              <div className="space-y-2">
                <div className="flex justify-between items-baseline text-xs">
                  <span className="font-bold text-[#2D3436] flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#8BA983]" /> Protein
                  </span>
                  <span className="text-[#5E6A6E] font-bold">{proteinGrams}g <span className="text-[10px] text-[#8D9698]">({macros.protein}%)</span></span>
                </div>
                <div className="w-full h-2 bg-[#FAF8F4] rounded-full overflow-hidden">
                  <div className="h-full bg-[#8BA983] rounded-full" style={{ width: `${macros.protein}%` }} />
                </div>
              </div>

              {/* Carbs split */}
              <div className="space-y-2">
                <div className="flex justify-between items-baseline text-xs">
                  <span className="font-bold text-[#2D3436] flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#E9B384]" /> Carbohydrates
                  </span>
                  <span className="text-[#5E6A6E] font-bold">{carbGrams}g <span className="text-[10px] text-[#8D9698]">({macros.carb}%)</span></span>
                </div>
                <div className="w-full h-2 bg-[#FAF8F4] rounded-full overflow-hidden">
                  <div className="h-full bg-[#E9B384] rounded-full" style={{ width: `${macros.carb}%` }} />
                </div>
              </div>

              {/* Fats split */}
              <div className="space-y-2">
                <div className="flex justify-between items-baseline text-xs">
                  <span className="font-bold text-[#2D3436] flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-400" /> Fats
                  </span>
                  <span className="text-[#5E6A6E] font-bold">{fatGrams}g <span className="text-[10px] text-[#8D9698]">({macros.fat}%)</span></span>
                </div>
                <div className="w-full h-2 bg-[#FAF8F4] rounded-full overflow-hidden">
                  <div className="h-full bg-blue-400 rounded-full" style={{ width: `${macros.fat}%` }} />
                </div>
              </div>

            </div>

            <div className="p-4 rounded-xl bg-[#FAF8F4] border border-[#EAE5DF] text-[10px] text-[#5E6A6E] leading-relaxed">
              <Info size={14} className="inline mr-1 text-[#8BA983]" /> These macros are balanced dynamically based on your profile goal (**{profile?.goal || 'Build Muscle'}**). Try to hit your protein targets daily.
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
