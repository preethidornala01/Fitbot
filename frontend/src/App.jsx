import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  MessageSquare, 
  Activity, 
  Salad, 
  Dumbbell, 
  Leaf, 
  Trophy, 
  Bell, 
  Search, 
  Sun, 
  Moon, 
  TrendingUp, 
  Settings, 
  ChevronRight,
  Menu,
  X,
  LogOut
} from 'lucide-react';
import Dashboard from './components/Dashboard';
import Chatbot from './components/Chatbot';
import BmiCalculator from './components/BmiCalculator';
import DietPlan from './components/DietPlan';
import WorkoutPlan from './components/WorkoutPlan';
import ProgressTracker from './components/ProgressTracker';
import SettingsView from './components/Settings';
import Login from './components/Login';
import ResetPassword from './components/ResetPassword';
import { supabase } from './supabaseClient';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [profile, setProfile] = useState(null);
  const [bmiRecord, setBmiRecord] = useState(null);
  const [history, setHistory] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false); // Default to light mode
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isRecoveringPassword, setIsRecoveringPassword] = useState(false);

  // Auth states
  const [session, setSession] = useState(null);
  const [isGuest, setIsGuest] = useState(false);
  const [loadingSession, setLoadingSession] = useState(true);

  // Listen to Auth State Transitions
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoadingSession(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      if (session) {
        setIsGuest(false);
      }
      if (event === 'PASSWORD_RECOVERY') {
        setIsRecoveringPassword(true);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const userId = session ? session.user.id : (isGuest ? 'user-default' : null);

  // Fetch profile and history when userId changes
  useEffect(() => {
    if (!userId) return;

    fetch(`http://localhost:5000/api/profile?user_id=${userId}`)
      .then(res => res.json())
      .then(data => {
        if (data && data.user_id) {
          setProfile(data);
        } else {
          setProfile({
            name: session ? (session.user.user_metadata?.full_name || session.user.email.split('@')[0]) : "Athlete",
            age: 24,
            gender: "Male",
            height: 175,
            weight: 70,
            activity_level: "Moderate",
            goal: "Build Muscle"
          });
        }
      })
      .catch(err => {
        console.warn("Using local fallback profile:", err.message);
        setProfile({
          name: session ? (session.user.user_metadata?.full_name || session.user.email.split('@')[0]) : "Athlete",
          age: 24,
          gender: "Male",
          height: 175,
          weight: 70,
          activity_level: "Moderate",
          goal: "Build Muscle"
        });
      });

    // Fetch BMI history globally
    fetch(`http://localhost:5000/api/bmi/history?user_id=${userId}`)
      .then(res => res.json())
      .then(data => {
        if (data && data.length > 0) {
          setHistory(data);
          setBmiRecord({
            bmi: parseFloat(data[0].bmi),
            classification: data[0].classification,
            weight: data[0].weight,
            height: data[0].height
          });
        } else {
          setHistory([]);
          setBmiRecord(null);
        }
      })
      .catch(err => {
        console.warn("Error loading history globally:", err.message);
        setHistory([]);
        setBmiRecord(null);
      });
  }, [userId, session]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setIsGuest(false);
    setProfile(null);
    setBmiRecord(null);
    setHistory([]);
  };

  const handleBmiCalculated = (record) => {
    setBmiRecord(record);
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'chatbot', label: 'Wellness Coach', icon: MessageSquare },
    { id: 'workout', label: 'Workouts', icon: Dumbbell },
    { id: 'diet', label: 'Diet Plans', icon: Salad },
    { id: 'bmi', label: 'BMI Calculator', icon: Activity },
    { id: 'progress', label: 'Progress Tracker', icon: TrendingUp },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  if (loadingSession) {
    return (
      <div className="min-h-screen bg-[#FAF8F4] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#A8C3A0] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (isRecoveringPassword) {
    return (
      <ResetPassword 
        onPasswordUpdated={() => setIsRecoveringPassword(false)}
        onCancel={async () => {
          await supabase.auth.signOut();
          setIsRecoveringPassword(false);
        }}
      />
    );
  }

  if (!userId) {
    return <Login onGuestAccess={() => setIsGuest(true)} />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-transparent text-[#2D3436] font-sans relative overflow-hidden">
      
      {/* Sticky Top Navbar */}
      <header className="sticky top-0 z-40 w-full bg-white border-b border-[#EAE5DF] px-4 lg:px-8 py-3.5 flex items-center justify-between">
        
        {/* Left: Brand logo */}
        <div className="flex items-center gap-3">
          {/* Mobile hamburger menu toggle */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-1.5 rounded-lg bg-[#F5F2ED] border border-[#EAE5DF] text-[#5E6A6E] hover:text-[#2D3436]"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-[#A8C3A0] flex items-center justify-center text-white">
              <Leaf size={18} />
            </div>
            <div>
              <h2 className="font-bold text-base tracking-tight leading-none text-[#2D3436] font-heading">FitBot</h2>
              <span className="text-[10px] text-[#8BA983] font-semibold tracking-wider uppercase mt-0.5 block">WELLNESS & FITNESS COACH</span>
            </div>
          </div>
        </div>

        {/* Center: Search Bar */}
        <div className="hidden md:flex items-center w-72 lg:w-96 relative">
          <Search size={16} className="absolute left-3.5 text-[#8D9698]" />
          <input
            type="text"
            placeholder="Search workouts, meals, advice..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-[#F5F2ED] border border-[#EAE5DF] focus:outline-none focus:border-[#A8C3A0] focus:bg-white text-[#2D3436] placeholder-[#8D9698] transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Right: Controls & Profile */}
        <div className="flex items-center gap-3 lg:gap-4">
          
          {/* Notifications */}
          <button 
            className="p-2 rounded-xl bg-[#F5F2ED] hover:bg-white border border-[#EAE5DF] text-[#5E6A6E] hover:text-[#2D3436] transition-all flex items-center justify-center relative"
            title="Notifications"
          >
            <Bell size={16} />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[#E9B384]" />
          </button>

          {/* User Profile avatar */}
          {profile && (
            <div className="flex items-center gap-2.5 pl-1.5 border-l border-[#EAE5DF]">
              <div className="w-8.5 h-8.5 rounded-xl bg-[#A8C3A0] p-[1.5px]">
                <div className="w-full h-full bg-white rounded-[10px] flex items-center justify-center text-[#8BA983] font-bold text-xs uppercase">
                  {profile.name ? profile.name.slice(0, 2) : 'AT'}
                </div>
              </div>
              <div className="hidden lg:block text-left">
                <span className="text-xs font-bold block text-[#2D3436] leading-none mb-0.5">{profile.name}</span>
                <span className="text-[10px] text-[#5E6A6E] block leading-none font-medium">{profile.goal || 'General Health'}</span>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Body container */}
      <div className="flex-1 flex relative">
        
        {/* Left Sidebar Navigation (Desktop) */}
        <aside className="hidden lg:flex w-64 bg-[#F5F2ED] border-r border-[#EAE5DF] flex-col justify-between p-5 shrink-0 z-10">
          <div className="space-y-6">
            
            {/* Quick Profile Panel */}
            {profile && (
              <div className="p-4 rounded-2xl bg-white border border-[#EAE5DF] flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#A8C3A0]/10 border border-[#A8C3A0]/20 flex items-center justify-center text-[#8BA983] font-bold text-sm uppercase">
                  {profile.name ? profile.name.slice(0, 2) : 'AT'}
                </div>
                <div className="overflow-hidden">
                  <span className="text-xs font-bold block text-[#2D3436] truncate leading-none mb-1">{profile.name}</span>
                  <span className="text-[10px] text-[#5E6A6E] block font-semibold truncate leading-none uppercase tracking-wide">{profile.goal || 'General Health'}</span>
                </div>
              </div>
            )}

            {/* Navigation links */}
            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-[#F6D6C9] border border-[#EAE5DF] text-[#8BA983]'
                        : 'text-[#5E6A6E] hover:text-[#2D3436] hover:bg-[#FAF8F4] border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon size={16} className={isActive ? 'text-[#8BA983]' : 'text-[#5E6A6E]'} />
                      <span>{item.label}</span>
                    </div>
                    {isActive && <ChevronRight size={12} className="text-[#8BA983]" />}
                  </button>
                );
              })}
            </nav>

            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-xs font-semibold text-rose-500 hover:bg-rose-50/50 border border-transparent hover:border-rose-100 transition-all cursor-pointer"
            >
              <LogOut size={16} className="text-rose-500" />
              <span>Log Out</span>
            </button>
          </div>

          {/* Sidebar Footer */}
          <div className="pt-4 border-t border-[#EAE5DF] flex items-center justify-between text-[11px] text-[#8D9698] font-medium">
            <span>Your Wellness Companion</span>
          </div>
        </aside>

        {/* Mobile Navigation Drawer Overlay */}
        {mobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-30 bg-black/60 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)}>
            <aside 
              className="absolute left-0 top-0 h-full w-64 bg-[#F5F2ED] p-5 flex flex-col justify-between border-r border-[#EAE5DF] animate-slide-in"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="space-y-6 mt-16">
                <nav className="space-y-1.5">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setActiveTab(item.id);
                          setMobileMenuOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-xs font-semibold transition-all ${
                          isActive
                            ? 'bg-[#F6D6C9] border border-[#EAE5DF] text-[#8BA983]'
                            : 'text-[#5E6A6E] hover:text-[#2D3436] hover:bg-[#FAF8F4] border border-transparent'
                        }`}
                      >
                        <Icon size={16} className={isActive ? 'text-[#8BA983]' : 'text-[#5E6A6E]'} />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </nav>

                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-xs font-semibold text-rose-500 hover:bg-rose-50/50 border border-transparent hover:border-rose-100 transition-all cursor-pointer"
                >
                  <LogOut size={16} className="text-rose-500" />
                  <span>Log Out</span>
                </button>
              </div>

              <div className="pt-4 border-t border-[#EAE5DF] flex items-center justify-between text-[11px] text-[#8D9698] font-medium">
                <span>Your Wellness Companion</span>
              </div>
            </aside>
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto max-h-[calc(100vh-68px)]">
          <div className="max-w-6xl mx-auto">
            {activeTab === 'dashboard' && (
              <Dashboard 
                profile={profile} 
                bmiRecord={bmiRecord} 
                setActiveTab={setActiveTab} 
                setProfile={setProfile}
                userId={userId}
              />
            )}

            {activeTab === 'chatbot' && (
              <Chatbot profile={profile} userId={userId} />
            )}

            {activeTab === 'bmi' && (
              <BmiCalculator 
                onBmiCalculated={handleBmiCalculated} 
                history={history}
                setHistory={setHistory}
                userId={userId}
              />
            )}

            {activeTab === 'diet' && (
              <DietPlan />
            )}

            {activeTab === 'workout' && (
              <WorkoutPlan />
            )}

            {/* Real panels for settings & progress */}
            {activeTab === 'progress' && (
              <ProgressTracker 
                profile={profile}
                history={history}
                setHistory={setHistory}
                userId={userId}
              />
            )}

            {activeTab === 'settings' && (
              <SettingsView 
                profile={profile}
                setProfile={setProfile}
                isDarkMode={isDarkMode}
                setIsDarkMode={setIsDarkMode}
                userId={userId}
              />
            )}
          </div>
        </main>

      </div>

    </div>
  );
}
