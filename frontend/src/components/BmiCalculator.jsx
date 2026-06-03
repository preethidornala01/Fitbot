import React, { useState, useEffect } from 'react';
import { Activity, ArrowRight, Scale, Ruler, TrendingUp, Heart, Info, RotateCcw } from 'lucide-react';

const BMI_CATEGORIES = [
  { label: 'Underweight', range: '< 18.5', color: '#3B82F6', bg: 'bg-blue-50/50', border: 'border-blue-100', text: 'text-blue-600' },
  { label: 'Normal', range: '18.5 – 24.9', color: '#8BA983', bg: 'bg-[#FAF8F4]', border: 'border-[#A8C3A0]/30', text: 'text-[#8BA983]' },
  { label: 'Overweight', range: '25 – 29.9', color: '#D98F5C', bg: 'bg-amber-50', border: 'border-amber-100', text: 'text-amber-600' },
  { label: 'Obese', range: '≥ 30', color: '#ef4444', bg: 'bg-rose-50', border: 'border-rose-100', text: 'text-rose-600' }
];

function getCategory(bmi) {
  if (bmi < 18.5) return BMI_CATEGORIES[0];
  if (bmi < 25) return BMI_CATEGORIES[1];
  if (bmi < 30) return BMI_CATEGORIES[2];
  return BMI_CATEGORIES[3];
}

function getAdvice(bmi) {
  if (bmi < 18.5) return "Your BMI indicates you are underweight. Focus on nutrient-dense foods, lean protein, and resistance training to build healthy mass.";
  if (bmi < 25) return "Excellent! Your BMI is in the healthy range. Maintain an active lifestyle and a balanced diet rich in whole foods.";
  if (bmi < 30) return "Your BMI falls in the overweight range. A combination of cardio, strength training, and a moderate calorie deficit can help.";
  return "Your BMI indicates obesity. Consult a healthcare provider for a safe, sustainable plan. Start with low-impact exercises and improved nutrition.";
}

function getIdealWeight(heightCm) {
  const hm = heightCm / 100;
  const low = (18.5 * hm * hm).toFixed(1);
  const high = (24.9 * hm * hm).toFixed(1);
  return { low, high };
}

// Animated radial gauge for BMI display
function BmiGauge({ bmi }) {
  // Gauge spans from 10 to 40 BMI
  const minBmi = 10;
  const maxBmi = 40;
  const clampedBmi = Math.max(minBmi, Math.min(maxBmi, bmi));
  const percentage = (clampedBmi - minBmi) / (maxBmi - minBmi);

  // Arc parameters (semicircle, 180 degrees)
  const size = 260;
  const cx = size / 2;
  const cy = size / 2 + 10;
  const radius = 100;
  const startAngle = Math.PI; // 180deg (left)
  const needleAngle = startAngle - percentage * Math.PI;

  // Arc path for background
  const arcPath = (startDeg, endDeg) => {
    const x1 = cx + radius * Math.cos(startDeg);
    const y1 = cy - radius * Math.sin(startDeg);
    const x2 = cx + radius * Math.cos(endDeg);
    const y2 = cy - radius * Math.sin(endDeg);
    const largeArc = Math.abs(startDeg - endDeg) > Math.PI ? 1 : 0;
    return `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 0 ${x2} ${y2}`;
  };

  // Needle endpoint
  const needleLength = radius - 15;
  const needleX = cx + needleLength * Math.cos(needleAngle);
  const needleY = cy - needleLength * Math.sin(needleAngle);

  const cat = getCategory(bmi);

  return (
    <div className="relative flex flex-col items-center">
      <svg width={size} height={size / 2 + 40} viewBox={`0 0 ${size} ${size / 2 + 40}`} className="overflow-visible">
        <defs>
          <linearGradient id="gaugeGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#3B82F6" />
            <stop offset="33%" stopColor="#8BA983" />
            <stop offset="66%" stopColor="#D98F5C" />
            <stop offset="100%" stopColor="#ef4444" />
          </linearGradient>
        </defs>

        {/* Background arc track */}
        <path d={arcPath(Math.PI, 0)} fill="none" stroke="#FAF8F4" strokeWidth="18" strokeLinecap="round" />

        {/* Colored gradient arc */}
        <path d={arcPath(Math.PI, 0)} fill="none" stroke="url(#gaugeGrad)" strokeWidth="14" strokeLinecap="round" opacity="0.8" />

        {/* Tick labels */}
        {[10, 18.5, 25, 30, 40].map((val, i) => {
          const pct = (val - minBmi) / (maxBmi - minBmi);
          const angle = Math.PI - pct * Math.PI;
          const labelR = radius + 22;
          const lx = cx + labelR * Math.cos(angle);
          const ly = cy - labelR * Math.sin(angle);
          return (
            <text key={i} x={lx} y={ly} textAnchor="middle" dominantBaseline="middle" fontSize="9" fontWeight="bold" fill="#8D9698">
              {val}
            </text>
          );
        })}

        {/* Needle */}
        <line
          x1={cx} y1={cy} x2={needleX} y2={needleY}
          stroke={cat.color} strokeWidth="3" strokeLinecap="round"
          style={{ transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)' }}
        />

        {/* Center dot */}
        <circle cx={cx} cy={cy} r="6" fill={cat.color} />
        <circle cx={cx} cy={cy} r="3" fill="#FFFFFF" />

        {/* BMI Value text */}
        <text x={cx} y={cy + 28} textAnchor="middle" fontSize="28" fontWeight="700" fill="#2D3436">
          {bmi}
        </text>
        <text x={cx} y={cy + 42} textAnchor="middle" fontSize="10" fontWeight="700" fill={cat.color}>
          {cat.label.toUpperCase()}
        </text>
      </svg>
    </div>
  );
}

export default function BmiCalculator({ onBmiCalculated, history, setHistory, userId }) {
  const [unit, setUnit] = useState('metric'); // metric | imperial
  const [height, setHeight] = useState(170);
  const [weight, setWeight] = useState(70);
  const [heightFt, setHeightFt] = useState(5);
  const [heightIn, setHeightIn] = useState(7);
  const [weightLbs, setWeightLbs] = useState(154);
  const [result, setResult] = useState(null);

  // Load BMI history on mount/userId change
  useEffect(() => {
    if (!userId) return;
    fetch(`http://localhost:5000/api/bmi/history?user_id=${userId}`)
      .then(res => res.json())
      .then(data => {
        if (data && data.length > 0) {
          setHistory(data);
          // Load last result
          const last = data[0];
          setResult({
            bmi: parseFloat(last.bmi),
            classification: last.classification,
            weight: last.weight,
            height: last.height
          });
        } else {
          setHistory([]);
          setResult(null);
        }
      })
      .catch(err => console.error("Error loading BMI history:", err));
  }, [userId]);

  const handleCalculate = async () => {
    let h = height;
    let w = weight;

    if (unit === 'imperial') {
      h = (heightFt * 12 + heightIn) * 2.54; // to cm
      w = weightLbs * 0.453592; // to kg
    }

    const heightM = h / 100;
    const bmi = parseFloat((w / (heightM * heightM)).toFixed(2));
    const cat = getCategory(bmi);

    const record = { bmi, classification: cat.label, weight: parseFloat(w.toFixed(1)), height: parseFloat(h.toFixed(1)) };
    setResult(record);

    if (onBmiCalculated) onBmiCalculated(record);

    // Save to backend
    try {
      const response = await fetch('http://localhost:5000/api/bmi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ weight: w, height: h, user_id: userId })
      });
      const data = await response.json();
      setHistory(prev => [data.record || record, ...prev]);
    } catch (err) {
      console.error("Error saving BMI:", err);
      setHistory(prev => [{ ...record, id: 'local-' + Date.now(), created_at: new Date().toISOString() }, ...prev]);
    }
  };

  const ideal = getIdealWeight(unit === 'imperial' ? (heightFt * 12 + heightIn) * 2.54 : height);

  return (
    <div className="space-y-6">

      {/* Page Header */}
      <div className="space-y-1">
        <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-[#2D3436]">BMI Calculator</h1>
        <p className="text-xs text-[#5E6A6E] max-w-xl">Compute your Body Mass Index to understand your weight classification and receive tailored health suggestions.</p>
      </div>

      {/* Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Left: Input Form */}
        <div className="lg:col-span-5 glass-panel p-6 space-y-6">

          {/* Unit Toggle */}
          <div className="flex items-center gap-2 p-1 rounded-xl bg-[#FAF8F4] border border-[#EAE5DF] w-fit">
            <button
              onClick={() => setUnit('metric')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                unit === 'metric' ? 'bg-white text-[#8BA983] border border-[#EAE5DF] shadow-sm' : 'text-[#5E6A6E] border border-transparent hover:text-[#2D3436]'
              }`}
            >
              Metric (kg/cm)
            </button>
            <button
              onClick={() => setUnit('imperial')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                unit === 'imperial' ? 'bg-white text-[#E9B384] border border-[#EAE5DF] shadow-sm' : 'text-[#5E6A6E] border border-transparent hover:text-[#2D3436]'
              }`}
            >
              Imperial (lbs/ft)
            </button>
          </div>

          {/* Height Slider */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-[10px] text-[#5E6A6E] font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Ruler size={12} className="text-[#8BA983]" /> Height
              </label>
              <span className="text-xs font-bold text-[#2D3436]">
                {unit === 'metric' ? `${height} cm` : `${heightFt}' ${heightIn}"`}
              </span>
            </div>
            {unit === 'metric' ? (
              <input 
                type="range" min="100" max="220" value={height}
                onChange={e => setHeight(parseInt(e.target.value))}
                className="w-full h-2 rounded-full appearance-none cursor-pointer bg-[#F5F2ED] accent-[#8BA983]"
              />
            ) : (
              <div className="flex gap-3">
                <div className="flex-1 space-y-1">
                  <span className="text-[9px] text-[#8D9698] font-bold">Feet</span>
                  <input 
                    type="range" min="3" max="7" value={heightFt}
                    onChange={e => setHeightFt(parseInt(e.target.value))}
                    className="w-full h-2 rounded-full appearance-none cursor-pointer bg-[#F5F2ED] accent-[#8BA983]"
                  />
                </div>
                <div className="flex-1 space-y-1">
                  <span className="text-[9px] text-[#8D9698] font-bold">Inches</span>
                  <input 
                    type="range" min="0" max="11" value={heightIn}
                    onChange={e => setHeightIn(parseInt(e.target.value))}
                    className="w-full h-2 rounded-full appearance-none cursor-pointer bg-[#F5F2ED] accent-[#8BA983]"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Weight Slider */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-[10px] text-[#5E6A6E] font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Scale size={12} className="text-[#E9B384]" /> Weight
              </label>
              <span className="text-xs font-bold text-[#2D3436]">
                {unit === 'metric' ? `${weight} kg` : `${weightLbs} lbs`}
              </span>
            </div>
            {unit === 'metric' ? (
              <input 
                type="range" min="30" max="200" value={weight}
                onChange={e => setWeight(parseInt(e.target.value))}
                className="w-full h-2 rounded-full appearance-none cursor-pointer bg-[#F5F2ED] accent-[#E9B384]"
              />
            ) : (
              <input 
                type="range" min="60" max="440" value={weightLbs}
                onChange={e => setWeightLbs(parseInt(e.target.value))}
                className="w-full h-2 rounded-full appearance-none cursor-pointer bg-[#F5F2ED] accent-[#E9B384]"
              />
            )}
          </div>

          {/* Calculate Button */}
          <button
            onClick={handleCalculate}
            className="w-full py-3 rounded-2xl bg-[#F6D6C9] hover:bg-[#E9B384] text-[#2D3436] text-xs font-semibold border border-[#EAE5DF] transition-all flex items-center justify-center gap-2 shadow-sm"
          >
            <Activity size={16} /> Calculate BMI
          </button>

          {/* Ideal Weight Range */}
          <div className="p-4 rounded-xl bg-[#FAF8F4] border border-[#EAE5DF] space-y-1.5">
            <span className="text-[10px] text-[#5E6A6E] font-bold uppercase tracking-wider block">Ideal Weight Range (for your height)</span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-[#8BA983]">{ideal.low} kg</span>
              <span className="text-[#8D9698]">—</span>
              <span className="text-sm font-bold text-[#8BA983]">{ideal.high} kg</span>
            </div>
          </div>
        </div>

        {/* Right: Results Display */}
        <div className="lg:col-span-7 space-y-6">

          {/* Gauge Card */}
          <div className="glass-panel p-6 flex flex-col items-center justify-center relative overflow-hidden">
            {result ? (
              <>
                <BmiGauge bmi={result.bmi} />
                <p className="text-xs text-[#5E6A6E] text-center max-w-sm mt-4 leading-relaxed">
                  {getAdvice(result.bmi)}
                </p>
              </>
            ) : (
              <div className="text-center py-12 space-y-3">
                <Activity size={48} className="mx-auto text-[#8D9698]" />
                <p className="text-xs text-[#5E6A6E] font-semibold">Adjust the sliders and press <span className="text-[#8BA983]">Calculate BMI</span> to generate results.</p>
              </div>
            )}
          </div>

          {/* BMI Category Reference Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {BMI_CATEGORIES.map((cat, idx) => {
              const isActive = result && getCategory(result.bmi).label === cat.label;
              return (
                <div 
                  key={idx} 
                  className={`p-3.5 rounded-xl border text-center transition-all ${
                    isActive 
                      ? `${cat.bg} ${cat.border} ${cat.text} shadow-sm font-semibold` 
                      : 'bg-white border-[#EAE5DF] text-[#8D9698]'
                  }`}
                >
                  <span className="text-[10px] font-bold uppercase tracking-wider block">{cat.label}</span>
                  <span className="text-xs font-bold block mt-1">{cat.range}</span>
                </div>
              );
            })}
          </div>

        </div>

      </div>

      {/* BMI History */}
      {history && history.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#2D3436] uppercase tracking-wider flex items-center gap-1.5">
              <TrendingUp size={14} className="text-[#8BA983]" /> Calculation History
            </h3>
            <button 
              onClick={() => setHistory([])}
              className="text-[10px] text-[#8D9698] hover:text-[#5E6A6E] flex items-center gap-1 font-bold transition-colors"
            >
              <RotateCcw size={10} /> Clear
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {history.slice(0, 6).map((rec, idx) => {
              const cat = getCategory(rec.bmi);
              return (
                <div key={idx} className="glass-panel p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg ${cat.bg} ${cat.border} border flex items-center justify-center`}>
                      <Heart size={14} className={cat.text} />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-[#2D3436] block">{rec.bmi}</span>
                      <span className={`text-[10px] font-semibold ${cat.text}`}>{rec.classification || cat.label}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-[#5E6A6E] font-medium block">{rec.weight} kg · {rec.height} cm</span>
                    {rec.created_at && (
                      <span className="text-[9px] text-[#8D9698] font-medium block">
                        {new Date(rec.created_at).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Health Tip */}
      <div className="glass-panel p-5 flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-[#FAF8F4] border border-[#EAE5DF] flex items-center justify-center text-[#E9B384] shrink-0">
          <Info size={18} />
        </div>
        <div>
          <h4 className="text-xs font-bold text-[#2D3436]">Understanding BMI Limitations</h4>
          <p className="text-[10px] text-[#5E6A6E] leading-relaxed">BMI does not differentiate between muscle and fat mass. Athletes with high muscle mass may show elevated BMI values despite low body fat. Consider using body fat percentage and waist-to-hip ratio for a more complete picture.</p>
        </div>
      </div>

    </div>
  );
}
