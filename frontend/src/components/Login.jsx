import React, { useState } from 'react';
import { Leaf, ArrowRight, ShieldAlert, CheckCircle2, Mail, Lock } from 'lucide-react';
import { supabase } from '../supabaseClient';

export default function Login({ onGuestAccess }) {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [mode, setMode] = useState('signin'); // signin, signup, forgot
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleGoogleLogin = async () => {
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
          queryParams: {
            prompt: 'select_account'
          }
        }
      });
      if (error) throw error;
    } catch (err) {
      console.error("Google login failed:", err.message);
      setErrorMsg(err.message || 'Failed to initialize Google Sign-in. Please ensure Google Provider is configured in your Supabase Dashboard.');
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      if (mode === 'signin') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setSuccessMsg('Registration successful! Please check your email for confirmation.');
      } else if (mode === 'forgot') {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.origin
        });
        if (error) throw error;
        setSuccessMsg('Password reset link has been sent to your email.');
      }
    } catch (err) {
      console.error("Auth action failed:", err.message);
      setErrorMsg(err.message || 'Authentication failed. Please verify your details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-transparent text-[#2D3436] flex flex-col items-center justify-center relative overflow-hidden font-sans">
      <div className="w-full max-w-md p-8 mx-4 bg-white/90 backdrop-blur-md border border-[#EAE5DF] rounded-[24px] shadow-sm flex flex-col items-center relative">
        
        {/* Logo Header */}
        <div className="w-16 h-16 rounded-[20px] bg-[#A8C3A0] flex items-center justify-center mb-6 shadow-sm">
          <Leaf className="w-8 h-8 text-white animate-pulse" />
        </div>

        <h1 className="text-3xl font-bold tracking-tight mb-2 text-center text-[#2D3436]">
          FitBot
        </h1>
        <p className="text-[#5E6A6E] text-sm text-center mb-6 font-medium">
          {mode === 'signin' && 'Welcome back! Log in to continue.'}
          {mode === 'signup' && 'Create your account to start your wellness journey.'}
          {mode === 'forgot' && 'Reset your password to get back on track.'}
        </p>

        {/* Success Alert Box */}
        {successMsg && (
          <div className="w-full p-4 mb-6 bg-[#FAF8F4] border border-[#A8C3A0]/30 rounded-[16px] flex gap-3 items-start text-xs text-[#8BA983] font-medium animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-[#8BA983] flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-bold block mb-1">Success:</span>
              {successMsg}
            </div>
          </div>
        )}

        {/* Error Alert Box */}
        {errorMsg && (
          <div className="w-full p-4 mb-6 bg-rose-50 border border-rose-100 rounded-[16px] flex gap-3 items-start text-xs text-rose-600 font-medium animate-fadeIn">
            <ShieldAlert className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-bold block mb-1">Note:</span>
              {errorMsg}
            </div>
          </div>
        )}

        {/* Form Container */}
        {mode !== 'forgot' && (
          /* Sign In / Sign Up tabs */
          <div className="flex w-full bg-[#FAF8F4] border border-[#EAE5DF] rounded-2xl p-1 mb-6">
            <button
              onClick={() => { setMode('signin'); setErrorMsg(''); setSuccessMsg(''); }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                mode === 'signin' 
                  ? 'bg-white text-[#2D3436] border border-[#EAE5DF] shadow-sm' 
                  : 'text-[#5E6A6E] hover:text-[#2D3436]'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setMode('signup'); setErrorMsg(''); setSuccessMsg(''); }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                mode === 'signup' 
                  ? 'bg-white text-[#2D3436] border border-[#EAE5DF] shadow-sm' 
                  : 'text-[#5E6A6E] hover:text-[#2D3436]'
              }`}
            >
              Sign Up
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="w-full space-y-4">
          {/* Email input */}
          <div className="space-y-1.5 relative">
            <label className="text-[10px] text-[#5E6A6E] font-bold uppercase tracking-wider">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-[#8D9698]" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-3 text-xs rounded-xl bg-white border border-[#EAE5DF] text-[#2D3436] focus:outline-none focus:border-[#A8C3A0] focus:bg-[#FAF8F4] transition-all"
                placeholder="athlete@example.com"
              />
            </div>
          </div>

          {/* Password input */}
          {mode !== 'forgot' && (
            <div className="space-y-1.5 relative">
              <div className="flex justify-between items-center">
                <label className="text-[10px] text-[#5E6A6E] font-bold uppercase tracking-wider">Password</label>
                {mode === 'signin' && (
                  <button
                    type="button"
                    onClick={() => { setMode('forgot'); setErrorMsg(''); setSuccessMsg(''); }}
                    className="text-[10px] text-[#8BA983] hover:underline font-bold"
                  >
                    Forgot Password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-[#8D9698]" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 text-xs rounded-xl bg-white border border-[#EAE5DF] text-[#2D3436] focus:outline-none focus:border-[#A8C3A0] focus:bg-[#FAF8F4] transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-6 mt-2 bg-[#F6D6C9] hover:bg-[#E9B384] disabled:opacity-50 text-[#2D3436] font-bold rounded-2xl border border-[#EAE5DF] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-[#2D3436] border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <span>
                  {mode === 'signin' && 'Sign In'}
                  {mode === 'signup' && 'Sign Up'}
                  {mode === 'forgot' && 'Send Reset Link'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Back to Sign In Link */}
        {mode === 'forgot' && (
          <button
            onClick={() => { setMode('signin'); setErrorMsg(''); setSuccessMsg(''); }}
            className="mt-4 text-xs text-[#5E6A6E] hover:text-[#2D3436] transition-colors"
          >
            ← Back to Sign In
          </button>
        )}

        {/* Divider */}
        <div className="flex items-center w-full my-6">
          <div className="flex-1 border-t border-[#EAE5DF]"></div>
          <span className="px-3 text-[10px] text-[#8D9698] font-bold uppercase tracking-wider">or</span>
          <div className="flex-1 border-t border-[#EAE5DF]"></div>
        </div>

        {/* Google Login Button & Guest Login */}
        <div className="w-full space-y-4">
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full py-3.5 px-6 bg-white hover:bg-[#FAF8F4] border border-[#EAE5DF] disabled:opacity-50 text-[#2D3436] font-bold rounded-2xl transition-all duration-300 flex items-center justify-center gap-3 cursor-pointer shadow-sm"
          >
            <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>

          <button
            onClick={onGuestAccess}
            disabled={loading}
            className="w-full py-3.5 px-6 bg-white hover:bg-[#FAF8F4] text-[#5E6A6E] hover:text-[#2D3436] font-bold rounded-2xl transition-all duration-300 flex items-center justify-center gap-2 border border-[#EAE5DF] cursor-pointer group shadow-sm"
          >
            <span>Continue as Guest</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Footer info */}
        <div className="text-center text-[#8D9698] text-[10px] leading-relaxed mt-6">
          Secure authentication provided by Supabase. Guest mode saves data locally in your server files.
        </div>
      </div>
    </div>
  );
}
