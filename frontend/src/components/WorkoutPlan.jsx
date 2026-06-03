import React, { useState } from 'react';
import { Dumbbell, Clock, Flame, ChevronDown, ChevronUp, Check, Zap, Target, TrendingUp, RotateCcw, Award, Play, Pause, Timer } from 'lucide-react';

const WORKOUT_SPLITS = [
  {
    id: 'push',
    label: 'Push Day',
    subtitle: 'Chest · Shoulders · Triceps',
    difficulty: 'Intermediate',
    duration: '55 min',
    calories: '380 kcal',
    color: 'emerald',
    warmUp: 'Arm circles (30s each direction) → Band pull-aparts (15 reps) → Push-up to downward dog (8 reps)',
    exercises: [
      { name: 'Barbell Bench Press', sets: '4 × 8-10', muscle: 'Chest', rest: '90s', tip: 'Keep shoulder blades retracted and arch the upper back slightly for stability.' },
      { name: 'Incline Dumbbell Press', sets: '3 × 10-12', muscle: 'Upper Chest', rest: '75s', tip: 'Set bench at 30-35° angle. Control the eccentric for 2 seconds.' },
      { name: 'Overhead Press', sets: '4 × 8-10', muscle: 'Shoulders', rest: '90s', tip: 'Brace your core and avoid arching the lower back. Push directly overhead.' },
      { name: 'Cable Lateral Raises', sets: '3 × 12-15', muscle: 'Side Delts', rest: '60s', tip: 'Lead with the elbow, keep a slight bend in the arm throughout.' },
      { name: 'Tricep Rope Pushdown', sets: '3 × 12-15', muscle: 'Triceps', rest: '60s', tip: 'Spread the rope at the bottom of the movement and squeeze the triceps.' },
      { name: 'Overhead Tricep Extension', sets: '3 × 10-12', muscle: 'Long Head Triceps', rest: '60s', tip: 'Keep elbows pointed forward. Use a dumbbell or EZ bar.' }
    ]
  },
  {
    id: 'pull',
    label: 'Pull Day',
    subtitle: 'Back · Biceps · Rear Delts',
    difficulty: 'Intermediate',
    duration: '50 min',
    calories: '360 kcal',
    color: 'cyan',
    warmUp: 'Cat-cow stretch (10 reps) → Scapular pull-ups (8 reps) → Band face pulls (15 reps)',
    exercises: [
      { name: 'Deadlift', sets: '4 × 6-8', muscle: 'Full Back', rest: '120s', tip: 'Hinge at the hips, keep a neutral spine. Drive through the heels.' },
      { name: 'Lat Pulldown', sets: '4 × 10-12', muscle: 'Lats', rest: '75s', tip: 'Pull the bar to your upper chest, squeeze the lats at the bottom.' },
      { name: 'Seated Cable Row', sets: '3 × 10-12', muscle: 'Mid-Back', rest: '75s', tip: 'Keep chest upright and pull elbows past your torso.' },
      { name: 'Face Pulls', sets: '3 × 15-18', muscle: 'Rear Delts', rest: '60s', tip: 'High cable position. Pull towards your forehead and externally rotate.' },
      { name: 'Barbell Curls', sets: '3 × 10-12', muscle: 'Biceps', rest: '60s', tip: 'Keep elbows pinned at your sides. No swinging.' },
      { name: 'Hammer Curls', sets: '3 × 12-15', muscle: 'Brachialis', rest: '60s', tip: 'Neutral grip targets the brachialis for wider-looking arms.' }
    ]
  },
  {
    id: 'legs',
    label: 'Leg Day',
    subtitle: 'Quads · Hamstrings · Glutes · Calves',
    difficulty: 'Advanced',
    duration: '60 min',
    calories: '450 kcal',
    color: 'emerald',
    warmUp: 'Bodyweight squats (15 reps) → Walking lunges (10 each) → Leg swings (15 each leg)',
    exercises: [
      { name: 'Barbell Back Squat', sets: '4 × 8-10', muscle: 'Quads / Glutes', rest: '120s', tip: 'Break at the hips and knees simultaneously. Go to parallel or below.' },
      { name: 'Romanian Deadlift', sets: '4 × 10-12', muscle: 'Hamstrings', rest: '90s', tip: 'Keep the bar close to your shins. Feel the hamstring stretch.' },
      { name: 'Leg Press', sets: '3 × 12-15', muscle: 'Quads', rest: '90s', tip: 'Place feet shoulder-width apart, do not lock out knees at the top.' },
      { name: 'Walking Lunges', sets: '3 × 12 each', muscle: 'Glutes / Quads', rest: '75s', tip: 'Take a long stride and drive through the front heel.' },
      { name: 'Leg Curl Machine', sets: '3 × 12-15', muscle: 'Hamstrings', rest: '60s', tip: 'Control the negative for 2-3 seconds for extra time under tension.' },
      { name: 'Standing Calf Raise', sets: '4 × 15-20', muscle: 'Calves', rest: '45s', tip: 'Full range of motion — stretch at the bottom, squeeze at the top.' }
    ]
  },
  {
    id: 'full-body',
    label: 'Full Body Conditioning',
    subtitle: 'Compound Movements · HIIT',
    difficulty: 'Beginner',
    duration: '40 min',
    calories: '320 kcal',
    color: 'amber',
    warmUp: 'Jumping jacks (30s) → High knees (30s) → Arm circles (20s each direction)',
    exercises: [
      { name: 'Goblet Squat', sets: '3 × 12', muscle: 'Quads / Core', rest: '60s', tip: 'Hold a dumbbell at your chest. Keep elbows inside your knees.' },
      { name: 'Dumbbell Bench Press', sets: '3 × 12', muscle: 'Chest', rest: '60s', tip: 'Press the dumbbells up and slightly inward at the top.' },
      { name: 'Bent-Over Row', sets: '3 × 12', muscle: 'Back', rest: '60s', tip: 'Hinge forward at 45 degrees, pull the weight to your hip crease.' },
      { name: 'Dumbbell Shoulder Press', sets: '3 × 12', muscle: 'Shoulders', rest: '60s', tip: 'Sit tall with back support, press directly overhead.' },
      { name: 'Plank Hold', sets: '3 × 45s', muscle: 'Core', rest: '45s', tip: 'Engage glutes and core. Don\'t let your hips sag or pike.' },
      { name: 'Burpees', sets: '3 × 10', muscle: 'Full Body', rest: '60s', tip: 'Explosive jump at the top, controlled landing into the push-up.' }
    ]
  }
];

const difficultyColors = {
  Beginner: 'bg-[#FAF8F4] text-[#8BA983] border-[#A8C3A0]/30',
  Intermediate: 'bg-amber-50 text-amber-600 border-amber-100',
  Advanced: 'bg-rose-50 text-rose-600 border-rose-100'
};

const splitColorMap = {
  emerald: { bg: 'bg-[#FAF8F4]', border: 'border-[#A8C3A0]/30', text: 'text-[#8BA983]', ring: '#8BA983' },
  cyan: { bg: 'bg-blue-50/50', border: 'border-blue-100', text: 'text-blue-600', ring: '#3B82F6' },
  amber: { bg: 'bg-[#FAF8F4]', border: 'border-[#E9B384]/20', text: 'text-[#D98F5C]', ring: '#E9B384' }
};

export default function WorkoutPlan() {
  const [activeSplit, setActiveSplit] = useState('push');
  const [checked, setChecked] = useState({});
  const [expandedIdx, setExpandedIdx] = useState(null);
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);

  const split = WORKOUT_SPLITS.find(s => s.id === activeSplit);
  const colors = splitColorMap[split.color] || splitColorMap['emerald'];
  const completedCount = split.exercises.filter((_, i) => checked[`${activeSplit}-${i}`]).length;
  const progress = Math.round((completedCount / split.exercises.length) * 100);

  // Timer logic
  React.useEffect(() => {
    let interval;
    if (timerRunning) {
      interval = setInterval(() => setTimerSeconds(s => s + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timerRunning]);

  const formatTime = (totalSec) => {
    const m = Math.floor(totalSec / 60).toString().padStart(2, '0');
    const s = (totalSec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const toggleCheck = (key) => {
    setChecked(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="space-y-6">

      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-[#2D3436]">Workout Plans</h1>
          <p className="text-xs text-[#5E6A6E] max-w-xl">Select a training split and complete each exercise. Track your progress and time your rest periods.</p>
        </div>

        {/* Session Timer Widget */}
        <div className="flex items-center gap-3 self-start lg:self-auto">
          <div className="glass-panel px-4 py-2.5 flex items-center gap-3">
            <Timer size={16} className="text-[#8BA983]" />
            <span className="text-lg font-mono font-bold text-[#2D3436] tracking-wider">{formatTime(timerSeconds)}</span>
            <button 
              onClick={() => setTimerRunning(!timerRunning)}
              className={`p-1.5 rounded-lg border transition-all ${
                timerRunning 
                  ? 'bg-rose-50 border-rose-100 text-rose-600' 
                  : 'bg-[#FAF8F4] border-[#EAE5DF] text-[#8BA983]'
              }`}
            >
              {timerRunning ? <Pause size={14} /> : <Play size={14} />}
            </button>
            <button 
              onClick={() => { setTimerRunning(false); setTimerSeconds(0); }}
              className="p-1.5 rounded-lg bg-white border border-[#EAE5DF] text-[#8D9698] hover:text-[#2D3436] transition-all"
            >
              <RotateCcw size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Split Selector Tabs */}
      <div className="flex flex-wrap gap-3">
        {WORKOUT_SPLITS.map(s => {
          const isActive = activeSplit === s.id;
          const c = splitColorMap[s.color] || splitColorMap['emerald'];
          return (
            <button
              key={s.id}
              onClick={() => { setActiveSplit(s.id); setExpandedIdx(null); }}
              className={`flex flex-col items-start px-4 py-3 rounded-xl text-xs font-bold transition-all border ${
                isActive
                  ? `${c.bg} ${c.border} ${c.text} shadow-sm`
                  : 'bg-white border-[#EAE5DF] text-[#5E6A6E] hover:text-[#2D3436] hover:bg-[#FAF8F4]'
              }`}
            >
              <span className="font-bold">{s.label}</span>
              <span className={`text-[9px] font-semibold mt-0.5 ${isActive ? 'opacity-90' : 'text-[#8D9698]'}`}>{s.subtitle}</span>
            </button>
          );
        })}
      </div>

      {/* Progress + Meta Info Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Progress Card */}
        <div className="lg:col-span-4 glass-panel p-6 flex flex-col items-center justify-center gap-4 relative overflow-hidden">
          {/* Circular completion ring */}
          <div className="relative" style={{ width: 110, height: 110 }}>
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="55" cy="55" r="45" stroke="#FAF8F4" strokeWidth="8" fill="transparent" />
              <circle cx="55" cy="55" r="45" stroke={colors.ring} strokeWidth="8" fill="transparent"
                strokeDasharray={2 * Math.PI * 45}
                strokeDashoffset={2 * Math.PI * 45 * (1 - progress / 100)}
                strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 0.5s ease' }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold text-[#2D3436]">{progress}%</span>
              <span className="text-[9px] text-[#8D9698] font-bold">COMPLETE</span>
            </div>
          </div>

          <p className="text-[10px] text-[#5E6A6E] text-center font-semibold">
            {completedCount} of {split.exercises.length} exercises logged
          </p>

          {completedCount === split.exercises.length && (
            <div className="flex items-center gap-1.5 text-[#8BA983] text-xs font-bold animate-pulse">
              <Award size={14} /> SPLIT COMPLETE!
            </div>
          )}
        </div>

        {/* Split Meta Cards */}
        <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="glass-panel p-4 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl ${colors.bg} ${colors.border} border flex items-center justify-center`}>
              <Clock size={18} className={colors.text} />
            </div>
            <div>
              <span className="text-[10px] text-[#8D9698] font-bold uppercase tracking-wider block">Duration</span>
              <span className="text-sm font-bold text-[#2D3436]">{split.duration}</span>
            </div>
          </div>

          <div className="glass-panel p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FAF8F4] border border-[#EAE5DF] flex items-center justify-center">
              <Flame size={18} className="text-[#D98F5C]" />
            </div>
            <div>
              <span className="text-[10px] text-[#8D9698] font-bold uppercase tracking-wider block">Est. Burn</span>
              <span className="text-sm font-bold text-[#2D3436]">{split.calories}</span>
            </div>
          </div>

          <div className="glass-panel p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white border border-[#EAE5DF] flex items-center justify-center">
              <Target size={18} className="text-[#8BA983]" />
            </div>
            <div>
              <span className="text-[10px] text-[#8D9698] font-bold uppercase tracking-wider block">Difficulty</span>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${difficultyColors[split.difficulty]}`}>{split.difficulty}</span>
            </div>
          </div>
        </div>

      </div>

      {/* Warm-Up Section */}
      <div className="glass-panel p-5 flex items-start gap-4">
        <div className="w-9 h-9 rounded-xl bg-[#FAF8F4] border border-[#EAE5DF] flex items-center justify-center text-[#E9B384] shrink-0">
          <Zap size={16} />
        </div>
        <div>
          <h4 className="text-xs font-bold text-[#2D3436] mb-1">Warm-Up Routine</h4>
          <p className="text-[10px] text-[#5E6A6E] leading-relaxed">{split.warmUp}</p>
        </div>
      </div>

      {/* Exercise List */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-[#2D3436] uppercase tracking-wider">Exercise Checklist</h3>

        {split.exercises.map((ex, idx) => {
          const key = `${activeSplit}-${idx}`;
          const isDone = checked[key];
          const isExpanded = expandedIdx === idx;

          return (
            <div key={idx} className={`glass-panel overflow-hidden transition-all ${isDone ? 'opacity-60' : ''}`}>
              <div className="p-4 flex items-center gap-4 cursor-pointer" onClick={() => setExpandedIdx(isExpanded ? null : idx)}>
                
                {/* Checkbox */}
                <button
                  onClick={(e) => { e.stopPropagation(); toggleCheck(key); }}
                  className={`w-6 h-6 rounded-lg border shrink-0 flex items-center justify-center transition-all ${
                    isDone 
                      ? `${colors.bg} ${colors.border} ${colors.text}` 
                      : 'bg-white border-[#EAE5DF] text-[#8D9698] hover:border-[#8BA983]'
                  }`}
                >
                  {isDone && <Check size={14} />}
                </button>

                {/* Name + muscle */}
                <div className="flex-1 min-w-0">
                  <h4 className={`text-xs font-bold ${isDone ? 'line-through text-[#8D9698]' : 'text-[#2D3436]'}`}>{ex.name}</h4>
                  <span className="text-[10px] text-[#8D9698] font-semibold">{ex.muscle}</span>
                </div>

                {/* Sets + Rest */}
                <div className="flex items-center gap-3 shrink-0">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${colors.bg} ${colors.border} border ${colors.text}`}>{ex.sets}</span>
                  <span className="text-[10px] text-[#8D9698] font-bold flex items-center gap-1"><Clock size={10} /> {ex.rest}</span>
                  {isExpanded ? <ChevronUp size={14} className="text-[#8D9698]" /> : <ChevronDown size={14} className="text-[#8D9698]" />}
                </div>
              </div>

              {/* Expanded tip section */}
              {isExpanded && (
                <div className="px-5 pb-4 pt-1 border-t border-[#FAF8F4]">
                  <p className="text-[10px] text-[#5E6A6E] leading-relaxed flex items-start gap-1.5">
                    <TrendingUp size={12} className="text-[#8BA983] shrink-0 mt-0.5" />
                    <span><strong className="text-[#8BA983]">Form Tip:</strong> {ex.tip}</span>
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

    </div>
  );
}
