import React, { useState } from 'react';
import { Leaf, ArrowRight, ShieldAlert, CheckCircle2, Lock } from 'lucide-react';
import { supabase } from '../supabaseClient';

export default function ResetPassword({ onPasswordUpdated, onCancel }) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      setErrorMsg("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      
      setSuccessMsg("Your password has been successfully updated!");
      setTimeout(() => {
        onPasswordUpdated();
      }, 2500);
    } catch (err) {
      console.error("Failed to update password:", err.message);
      setErrorMsg(err.message || "Failed to update password. Link may have expired.");
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
          Reset Password
        </h1>
        <p className="text-[#5E6A6E] text-sm text-center mb-6 font-medium">
          Create a new strong password for your FitBot account.
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
              <span className="font-bold block mb-1">Update Failed:</span>
              {errorMsg}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="w-full space-y-4">
          {/* Password Input */}
          <div className="space-y-1.5 relative">
            <label className="text-[10px] text-[#5E6A6E] font-bold uppercase tracking-wider">New Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-[#8D9698]" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-3 text-xs rounded-xl bg-white border border-[#EAE5DF] text-[#2D3436] focus:outline-none focus:border-[#A8C3A0] focus:bg-[#FAF8F4] transition-all"
                placeholder="New Password (min 6 characters)"
              />
            </div>
          </div>

          {/* Confirm Password Input */}
          <div className="space-y-1.5 relative">
            <label className="text-[10px] text-[#5E6A6E] font-bold uppercase tracking-wider">Confirm New Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-[#8D9698]" />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-3 text-xs rounded-xl bg-white border border-[#EAE5DF] text-[#2D3436] focus:outline-none focus:border-[#A8C3A0] focus:bg-[#FAF8F4] transition-all"
                placeholder="Confirm New Password"
              />
            </div>
          </div>

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
                <span>Update Password</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <button
          onClick={onCancel}
          className="mt-6 text-xs text-[#5E6A6E] hover:text-[#2D3436] transition-colors"
        >
          Cancel & Return
        </button>

      </div>
    </div>
  );
}
