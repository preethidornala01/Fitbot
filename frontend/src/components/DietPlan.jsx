import React, { useState } from 'react';
import { Salad, Flame, Droplet, Wheat, Beef, Clock, Leaf, Info, Apple, Fish, Egg } from 'lucide-react';

const DIET_PLANS = [
  {
    id: 'balanced',
    label: 'Balanced Maintenance',
    icon: Salad,
    color: 'emerald',
    macros: { protein: 30, carbs: 40, fats: 30 },
    calories: 2200,
    meals: [
      { time: '7:30 AM', type: 'Breakfast', name: 'Oatmeal Power Bowl', items: 'Steel-cut oats, banana slices, almond butter, chia seeds, a splash of almond milk', cal: 420, protein: 18, carbs: 52, fats: 16 },
      { time: '10:00 AM', type: 'Snack', name: 'Greek Yogurt Parfait', items: 'Low-fat Greek yogurt, mixed berries, honey drizzle, granola topping', cal: 220, protein: 16, carbs: 28, fats: 6 },
      { time: '1:00 PM', type: 'Lunch', name: 'Grilled Chicken Quinoa Salad', items: 'Grilled chicken breast, quinoa, cucumber, cherry tomatoes, olive oil dressing, feta cheese', cal: 580, protein: 42, carbs: 48, fats: 18 },
      { time: '4:00 PM', type: 'Snack', name: 'Apple & Almond Butter', items: 'Sliced green apple with 2 tbsp natural almond butter', cal: 250, protein: 6, carbs: 24, fats: 16 },
      { time: '7:30 PM', type: 'Dinner', name: 'Salmon & Sweet Potato', items: 'Baked salmon fillet, roasted sweet potato wedges, steamed broccoli, lemon herb sauce', cal: 620, protein: 38, carbs: 46, fats: 22 },
      { time: '9:00 PM', type: 'Snack', name: 'Casein Protein Shake', items: 'Casein protein powder, almond milk, ice', cal: 140, protein: 24, carbs: 4, fats: 3 }
    ]
  },
  {
    id: 'high-protein',
    label: 'High Protein Builder',
    icon: Beef,
    color: 'cyan',
    macros: { protein: 45, carbs: 30, fats: 25 },
    calories: 2800,
    meals: [
      { time: '6:30 AM', type: 'Breakfast', name: 'Protein Scramble', items: '4 egg whites, 2 whole eggs, spinach, turkey sausage, whole wheat toast', cal: 520, protein: 46, carbs: 28, fats: 22 },
      { time: '9:30 AM', type: 'Snack', name: 'Whey Protein Smoothie', items: 'Whey isolate, banana, peanut butter, oats, milk', cal: 380, protein: 36, carbs: 32, fats: 12 },
      { time: '12:30 PM', type: 'Lunch', name: 'Double Chicken Rice Bowl', items: 'Grilled chicken thighs (200g), brown rice, black beans, avocado, salsa', cal: 720, protein: 56, carbs: 62, fats: 20 },
      { time: '3:30 PM', type: 'Snack', name: 'Cottage Cheese & Nuts', items: 'Low-fat cottage cheese, walnuts, dried cranberries', cal: 300, protein: 28, carbs: 16, fats: 14 },
      { time: '7:00 PM', type: 'Dinner', name: 'Steak & Vegetables', items: 'Lean sirloin steak (180g), roasted asparagus, mashed cauliflower, garlic butter', cal: 640, protein: 52, carbs: 18, fats: 28 },
      { time: '9:30 PM', type: 'Snack', name: 'Greek Yogurt Crunch', items: 'Greek yogurt, protein granola, dark chocolate chips', cal: 260, protein: 22, carbs: 24, fats: 8 }
    ]
  },
  {
    id: 'plant-based',
    label: 'Plant-Powered Lean',
    icon: Leaf,
    color: 'emerald',
    macros: { protein: 25, carbs: 50, fats: 25 },
    calories: 1900,
    meals: [
      { time: '7:00 AM', type: 'Breakfast', name: 'Avocado Toast & Smoothie', items: 'Whole grain toast, smashed avocado, hemp seeds, cherry tomatoes, green smoothie', cal: 380, protein: 14, carbs: 42, fats: 18 },
      { time: '10:00 AM', type: 'Snack', name: 'Trail Mix', items: 'Almonds, cashews, pumpkin seeds, dried mango, dark chocolate chips', cal: 200, protein: 8, carbs: 18, fats: 12 },
      { time: '1:00 PM', type: 'Lunch', name: 'Buddha Bowl', items: 'Roasted chickpeas, sweet potato, kale, tahini dressing, pickled onions, quinoa', cal: 520, protein: 22, carbs: 58, fats: 18 },
      { time: '4:00 PM', type: 'Snack', name: 'Hummus & Veggie Sticks', items: 'Homemade hummus, carrots, celery, bell pepper strips', cal: 180, protein: 8, carbs: 20, fats: 8 },
      { time: '7:00 PM', type: 'Dinner', name: 'Tofu Stir-Fry', items: 'Crispy tofu, brown rice noodles, mixed vegetables, soy ginger glaze, sesame seeds', cal: 480, protein: 24, carbs: 52, fats: 16 },
      { time: '9:00 PM', type: 'Snack', name: 'Banana Ice Cream', items: 'Frozen banana blend, cocoa powder, almond butter drizzle', cal: 160, protein: 4, carbs: 30, fats: 4 }
    ]
  },
  {
    id: 'keto',
    label: 'Ketogenic Fat Burner',
    icon: Flame,
    color: 'rose',
    macros: { protein: 25, carbs: 5, fats: 70 },
    calories: 1800,
    meals: [
      { time: '8:00 AM', type: 'Breakfast', name: 'Keto Eggs Benedict', items: 'Poached eggs, avocado halves, hollandaise sauce, smoked salmon, no bread', cal: 480, protein: 28, carbs: 4, fats: 38 },
      { time: '11:00 AM', type: 'Snack', name: 'Fat Bomb Bites', items: 'Coconut oil, cocoa, almond butter, stevia', cal: 180, protein: 4, carbs: 2, fats: 18 },
      { time: '1:30 PM', type: 'Lunch', name: 'Bacon Cheeseburger Lettuce Wrap', items: 'Grass-fed beef patty, cheddar cheese, bacon, lettuce wrap, pickles, mustard', cal: 520, protein: 36, carbs: 4, fats: 40 },
      { time: '4:00 PM', type: 'Snack', name: 'Cheese & Olives', items: 'Aged cheddar cubes, kalamata olives, macadamia nuts', cal: 200, protein: 10, carbs: 2, fats: 18 },
      { time: '7:30 PM', type: 'Dinner', name: 'Butter Garlic Shrimp', items: 'Sautéed shrimp in garlic butter, zucchini noodles, parmesan, side salad with olive oil', cal: 420, protein: 32, carbs: 6, fats: 30 }
    ]
  }
];

const colorMap = {
  emerald: { bg: 'bg-[#FAF8F4]', border: 'border-[#A8C3A0]/30', text: 'text-[#8BA983]', ring: '#8BA983' },
  cyan:    { bg: 'bg-blue-50/50',    border: 'border-blue-100',    text: 'text-blue-600',    ring: '#3B82F6' },
  rose:    { bg: 'bg-rose-50/50',    border: 'border-rose-100',    text: 'text-rose-600',    ring: '#f43f5e' }
};

// Circular progress ring component
function MacroRing({ percentage, color, label, grams, size = 72 }) {
  const radius = (size - 10) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - percentage / 100);
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative" style={{ width: size, height: size }}>
        <svg className="w-full h-full transform -rotate-90">
          <circle cx={size / 2} cy={size / 2} r={radius} stroke="#FAF8F4" strokeWidth="5" fill="transparent" />
          <circle cx={size / 2} cy={size / 2} r={radius} stroke={color} strokeWidth="5" fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.6s ease' }}
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-[#2D3436]">{percentage}%</span>
      </div>
      <span className="text-[10px] text-[#5E6A6E] font-bold uppercase tracking-wider">{label}</span>
      <span className="text-[10px] text-[#8D9698] font-semibold">{grams}g</span>
    </div>
  );
}

// Meal type icon mapping
function MealIcon({ type }) {
  switch (type) {
    case 'Breakfast': return <Egg size={14} className="text-amber-500" />;
    case 'Lunch': return <Fish size={14} className="text-blue-500" />;
    case 'Dinner': return <Flame size={14} className="text-rose-500" />;
    case 'Snack': return <Apple size={14} className="text-[#8BA983]" />;
    default: return <Salad size={14} className="text-[#8D9698]" />;
  }
}

export default function DietPlan() {
  const [activePlan, setActivePlan] = useState('balanced');
  const plan = DIET_PLANS.find(p => p.id === activePlan);
  const colors = colorMap[plan.color] || colorMap['emerald'];
  const Icon = plan.icon;

  // Compute totals
  const totalCal = plan.meals.reduce((s, m) => s + m.cal, 0);
  const totalProtein = plan.meals.reduce((s, m) => s + m.protein, 0);
  const totalCarbs = plan.meals.reduce((s, m) => s + m.carbs, 0);
  const totalFats = plan.meals.reduce((s, m) => s + m.fats, 0);

  return (
    <div className="space-y-6">

      {/* Page Header */}
      <div className="space-y-1">
        <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-[#2D3436]">Nutrition & Diet Plans</h1>
        <p className="text-xs text-[#5E6A6E] max-w-xl">Select a dietary framework below to view the full day schedule, nutrient targets, and portion recommendations.</p>
      </div>

      {/* Diet Plan Selector Tabs */}
      <div className="flex flex-wrap gap-3">
        {DIET_PLANS.map(p => {
          const PIcon = p.icon;
          const isActive = activePlan === p.id;
          const c = colorMap[p.color] || colorMap['emerald'];
          return (
            <button
              key={p.id}
              onClick={() => setActivePlan(p.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all border ${
                isActive
                  ? `${c.bg} ${c.border} ${c.text} shadow-sm`
                  : 'bg-white border-[#EAE5DF] text-[#5E6A6E] hover:text-[#2D3436] hover:bg-[#FAF8F4]'
              }`}
            >
              <PIcon size={14} />
              {p.label}
            </button>
          );
        })}
      </div>

      {/* Top Info Row: Calorie target + Macro Rings */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Calories Summary Card */}
        <div className="lg:col-span-5 glass-panel p-6 flex flex-col justify-between relative overflow-hidden">
          <div className="space-y-4">
            <div className={`flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider ${colors.text}`}>
              <Icon size={14} />
              <span>{plan.label}</span>
            </div>

            {/* Calorie Progress Ring */}
            <div className="flex items-center gap-6">
              <div className="relative" style={{ width: 110, height: 110 }}>
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="55" cy="55" r="45" stroke="#FAF8F4" strokeWidth="8" fill="transparent" />
                  <circle cx="55" cy="55" r="45" stroke={colors.ring} strokeWidth="8" fill="transparent"
                    strokeDasharray={2 * Math.PI * 45}
                    strokeDashoffset={2 * Math.PI * 45 * (1 - Math.min(totalCal / plan.calories, 1))}
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dashoffset 0.6s ease' }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-lg font-bold text-[#2D3436]">{totalCal}</span>
                  <span className="text-[9px] text-[#8D9698] font-bold">/ {plan.calories} kcal</span>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-bold text-[#2D3436]">Daily Calorie Target</h3>
                <p className="text-[10px] text-[#5E6A6E] leading-relaxed">This plan targets {plan.calories} kcal distributed across {plan.meals.length} scheduled meals with a {plan.macros.protein}/{plan.macros.carbs}/{plan.macros.fats} macro split.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Macro Distribution Rings */}
        <div className="lg:col-span-7 glass-panel p-6">
          <h3 className="text-xs font-bold text-[#2D3436] uppercase tracking-wider mb-5">Macronutrient Distribution</h3>
          <div className="flex items-center justify-around">
            <MacroRing percentage={plan.macros.protein} color="#3B82F6" label="Protein" grams={totalProtein} />
            <MacroRing percentage={plan.macros.carbs} color="#8BA983" label="Carbs" grams={totalCarbs} />
            <MacroRing percentage={plan.macros.fats} color="#E9B384" label="Fats" grams={totalFats} />
            <MacroRing percentage={Math.round((totalCal / plan.calories) * 100)} color={colors.ring} label="Total Kcal" grams={totalCal} size={80} />
          </div>
        </div>

      </div>

      {/* Meals Timeline */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-[#2D3436] uppercase tracking-wider">Full Day Meal Schedule</h3>

        <div className="space-y-3">
          {plan.meals.map((meal, idx) => (
            <div key={idx} className="glass-panel p-5 flex flex-col lg:flex-row lg:items-center gap-4 relative overflow-hidden group hover:bg-[#FAF8F4] transition-all">
              
              {/* Time Column */}
              <div className="flex items-center gap-3 lg:w-36 shrink-0">
                <div className={`w-9 h-9 rounded-xl ${colors.bg} ${colors.border} border flex items-center justify-center`}>
                  <MealIcon type={meal.type} />
                </div>
                <div>
                  <span className="text-[10px] text-[#8D9698] font-bold uppercase tracking-wider block">{meal.type}</span>
                  <span className="text-xs text-[#2D3436] font-bold flex items-center gap-1"><Clock size={10} className="text-[#8D9698]" /> {meal.time}</span>
                </div>
              </div>

              {/* Name + Items */}
              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-bold text-[#2D3436] mb-0.5">{meal.name}</h4>
                <p className="text-[10px] text-[#5E6A6E] leading-relaxed truncate lg:whitespace-normal">{meal.items}</p>
              </div>

              {/* Macro Badges */}
              <div className="flex items-center gap-2 shrink-0 flex-wrap">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-[#EAE5DF] text-[10px] font-bold text-[#2D3436]">
                  <Flame size={10} className="text-rose-500" /> {meal.cal} kcal
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50/50 border border-blue-100 text-[10px] font-bold text-blue-600">
                  <Beef size={10} /> {meal.protein}g P
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#FAF8F4] border border-[#A8C3A0]/30 text-[10px] font-bold text-[#8BA983]">
                  <Wheat size={10} /> {meal.carbs}g C
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#FAF8F4] border border-[#E9B384]/20 text-[10px] font-bold text-[#D98F5C]">
                  <Droplet size={10} /> {meal.fats}g F
                </span>
              </div>

            </div>
          ))}
        </div>
      </div>

      {/* Nutrition Tips Footer */}
      <div className="glass-panel p-5 flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-[#FAF8F4] border border-[#EAE5DF] flex items-center justify-center text-[#8BA983] shrink-0">
          <Info size={18} />
        </div>
        <div>
          <h4 className="text-xs font-bold text-[#2D3436]">Pro Tip</h4>
          <p className="text-[10px] text-[#5E6A6E] leading-relaxed">Eating within a consistent 8-10 hour window each day supports your circadian rhythm and can improve metabolic efficiency by up to 15%.</p>
        </div>
      </div>

    </div>
  );
}
