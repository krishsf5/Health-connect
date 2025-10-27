import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

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
      const res = await fetch(`${API}/auth/register-doctor`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, specialization }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed");

      // If registration successful and returns token, log the user in
      if (data.token && data.user) {
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
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-50 to-sky-100 px-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-lg p-8">
        <h2 className="text-xl font-semibold text-gray-700 mb-4 text-center">
          Create doctor account
        </h2>

        {message && (
          <p className="text-sm mb-3 text-center {res?.ok ? 'text-green-600' : 'text-red-600'}">{message}</p>
        )}

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Specialization</label>
            <input value={specialization} onChange={(e) => setSpecialization(e.target.value)} className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g. Cardiologist" required />
          </div>
          <button disabled={loading} className="w-full py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition">
            {loading ? 'Please wait...' : 'Create'}
          </button>
        </form>
      </div>
    </div>
  );
}


