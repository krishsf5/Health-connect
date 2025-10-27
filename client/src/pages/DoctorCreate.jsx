import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

// Auto-detect API URL for both development and production
const getApiUrl = () => {
  // In production (Vercel), API routes are at the same domain with /api prefix
  if (typeof window !== 'undefined' && window.location.hostname.includes('vercel.app')) {
    return `${window.location.origin}/api`;
  }
  // For local development
  return import.meta.env.VITE_API_URL || "http://localhost:5000/api";
};

const API = getApiUrl();

export default function DoctorCreate({ onLogin }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      console.log('🏥 Creating doctor account...');
      console.log('📍 API URL:', API);
      console.log('📋 Request payload:', { name, email, specialization });
      
      const res = await fetch(`${API}/auth/register-doctor`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, specialization }),
      });
      
      console.log('📡 Response status:', res.status);
      const data = await res.json();
      console.log('📦 Response data:', data);
      
      if (!res.ok) throw new Error(data.message || "Failed");

      // If registration successful and returns token, log the user in
      if (data.token && data.user) {
        console.log('✅ Doctor registered successfully!');
        console.log('👤 User role:', data.user.role);
        console.log('🩺 Specialization:', data.user.specialization);
        
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        if (onLogin) {
          onLogin(data.user);
        }
        // Navigate to doctor dashboard
        navigate("/doctor");
        return;
      }

      setMessage("Doctor account created successfully. Please log in.");
    } catch (err) {
      console.error('❌ Doctor registration error:', err);
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center dashboard-bg px-4">
      <div className="card w-full max-w-md p-8">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-teal-600 rounded-2xl mb-4">
            <i data-lucide="user-plus" className="w-8 h-8 text-white"></i>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Create Doctor Account
          </h2>
          <p className="text-gray-600 dark:text-slate-300">Register as a medical professional</p>
        </div>

        {message && (
          <div className={`p-3 mb-4 rounded-lg border ${message.includes('success') || message.includes('successfully') ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300' : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300'}`}>
            <p className="text-sm text-center">{message}</p>
          </div>
        )}

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-1">Full Name</label>
            <input 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              className="w-full border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-2 bg-white dark:bg-slate-800 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none" 
              placeholder="Dr. John Doe"
              required 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-1">Email Address</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              className="w-full border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-2 bg-white dark:bg-slate-800 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none" 
              placeholder="doctor@example.com"
              required 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-1">Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              className="w-full border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-2 bg-white dark:bg-slate-800 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none" 
              placeholder="••••••••"
              required 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-1">Specialization</label>
            <input 
              value={specialization} 
              onChange={(e) => setSpecialization(e.target.value)} 
              className="w-full border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-2 bg-white dark:bg-slate-800 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none" 
              placeholder="e.g. Cardiology, Neurology, Pediatrics" 
              required 
            />
          </div>
          <button 
            disabled={loading} 
            className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Creating account...
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <i data-lucide="user-plus" className="w-4 h-4 mr-2"></i>
                Create Doctor Account
              </div>
            )}
          </button>
        </form>

        <p className="text-sm text-gray-600 dark:text-slate-400 text-center mt-6">
          Already have an account?{" "}
          <a href="/login" className="text-teal-600 dark:text-teal-400 hover:underline font-medium">
            Sign in here
          </a>
        </p>
      </div>
    </div>
  );
}


