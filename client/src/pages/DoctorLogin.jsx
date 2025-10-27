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

export default function DoctorLogin({ onLogin }) {
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [experience, setExperience] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [lang, setLang] = useState(localStorage.getItem("lang") || "en");

  const navigate = useNavigate();

  const i18n = {
    en: {
      doctor_portal: "Doctor Portal",
      doctor_login: "Doctor Login",
      doctor_signup: "Doctor Registration",
      welcome_doctor: "Welcome to the Health Connect Doctor Portal",
      login_description: "Access your doctor dashboard to manage appointments and patients",
      signup_description: "Join our network of healthcare professionals",
      full_name: "Full Name",
      email: "Email Address",
      password: "Password",
      specialization: "Medical Specialization",
      experience: "Years of Experience",
      sign_in: "Sign In",
      create_account: "Create Doctor Account",
      already_account: "Already have an account?",
      no_account: "Don't have a doctor account?",
      sign_in_instead: "Sign in instead",
      create_one: "Create one here",
      select_specialization: "Select your specialization",
      back_to_patient: "← Back to Patient Portal",
      terms: "By continuing, you agree to our Terms of Service and Privacy Policy"
    },
    hi: {
      doctor_portal: "डॉक्टर पोर्टल",
      doctor_login: "डॉक्टर लॉगिन",
      doctor_signup: "डॉक्टर पंजीकरण",
      welcome_doctor: "हेल्थ कनेक्ट डॉक्टर पोर्टल में आपका स्वागत है",
      login_description: "अपॉइंटमेंट्स और मरीजों को प्रबंधित करने के लिए अपने डॉक्टर डैशबोर्ड में पहुंचें",
      signup_description: "हमारे स्वास्थ्य पेशेवरों के नेटवर्क में शामिल हों",
      full_name: "पूरा नाम",
      email: "ईमेल पता",
      password: "पासवर्ड",
      specialization: "चिकित्सा विशेषज्ञता",
      experience: "अनुभव के वर्ष",
      sign_in: "साइन इन",
      create_account: "डॉक्टर खाता बनाएं",
      already_account: "क्या आपके पास पहले से खाता है?",
      no_account: "डॉक्टर खाता नहीं है?",
      sign_in_instead: "इसके बजाय साइन इन करें",
      create_one: "यहां बनाएं",
      select_specialization: "अपनी विशेषज्ञता चुनें",
      back_to_patient: "← मरीज पोर्टल पर वापस जाएं",
      terms: "जारी रखकर, आप हमारी सेवा की शर्तों और गोपनीयता नीति से सहमत होते हैं"
    },
    mr: {
      doctor_portal: "डॉक्टर पोर्टल",
      doctor_login: "डॉक्टर लॉगिन",
      doctor_signup: "डॉक्टर नोंदणी",
      welcome_doctor: "हेल्थ कनेक्ट डॉक्टर पोर्टलमध्ये आपले स्वागत",
      login_description: "अपॉइंटमेंट्स आणि रुग्णांचे व्यवस्थापन करण्यासाठी आपल्या डॉक्टर डॅशबोर्डमध्ये प्रवेश करा",
      signup_description: "आमच्या आरोग्य व्यावसायिकांच्या नेटवर्कमध्ये सामील व्हा",
      full_name: "पूर्ण नाव",
      email: "ईमेल पत्ता",
      password: "पासवर्ड",
      specialization: "वैद्यकीय विशेषीकरण",
      experience: "अनुभवाची वर्षे",
      sign_in: "साइन इन",
      create_account: "डॉक्टर खाते तयार करा",
      already_account: "आधीच खाते आहे?",
      no_account: "डॉक्टर खाते नाही?",
      sign_in_instead: "त्याऐवजी साइन इन करा",
      create_one: "येथे तयार करा",
      select_specialization: "आपली विशेषीकरण निवडा",
      back_to_patient: "← रुग्ण पोर्टलवर परत जा",
      terms: "सुरू ठेवून, आपण आमच्या सेवा अटी आणि गोपनीयता धोरणाशी सहमत होता"
    }
  };

  const t = i18n[lang] || i18n.en;

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Use dedicated doctor registration endpoint for registration
      const endpoint = mode === 'register' ? 'register-doctor' : 'login';
      const payload = mode === "register"
        ? { name, email, password, specialization, experience: parseInt(experience) }
        : { email, password };

      console.log('🏥 Doctor Login/Register:', {
        mode,
        endpoint: `${API}/auth/${endpoint}`,
        payload: mode === 'register' ? { name, email, specialization } : { email }
      });

      const res = await fetch(`${API}/auth/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed");

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      onLogin(data.user);

      // Navigate to appropriate dashboard based on user role
      if (data.user.role === "doctor") {
        navigate("/doctor");
      } else {
        navigate("/patient");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-teal-600 rounded-2xl mb-4">
            <i data-lucide="stethoscope" className="w-8 h-8 text-white"></i>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">{t.doctor_portal}</h1>
          <p className="text-gray-600 mt-2">
            {mode === "login" ? t.login_description : t.signup_description}
          </p>
        </div>

        {/* Login/Register Card */}
        <div className="card card-hover">
          {/* Mode Tabs */}
          <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setMode("login")}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                mode === "login"
                  ? "bg-white text-teal-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {t.doctor_login}
            </button>
            <button
              onClick={() => setMode("register")}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                mode === "register"
                  ? "bg-white text-teal-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {t.doctor_signup}
            </button>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={submit} className="space-y-4">
            {mode === "register" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t.full_name}
                </label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full border border-gray-300 px-3 py-2 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="Enter your full name"
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t.email}
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-gray-300 px-3 py-2 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="doctor@example.com"
                required
              />
            </div>

            {mode === "register" && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t.specialization}
                  </label>
                  <select
                    value={specialization}
                    onChange={(e) => setSpecialization(e.target.value)}
                    className="w-full border border-gray-300 px-3 py-2 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                    required
                  >
                    <option value="">{t.select_specialization}</option>
                    <option value="General Medicine">General Medicine</option>
                    <option value="Cardiology">Cardiology</option>
                    <option value="Dermatology">Dermatology</option>
                    <option value="Neurology">Neurology</option>
                    <option value="Orthopedics">Orthopedics</option>
                    <option value="Pediatrics">Pediatrics</option>
                    <option value="Psychiatry">Psychiatry</option>
                    <option value="Surgery">Surgery</option>
                    <option value="Gynecology">Gynecology</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t.experience}
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="50"
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                    className="w-full border border-gray-300 px-3 py-2 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="5"
                    required
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t.password}
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-gray-300 px-3 py-2 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="Enter your password"
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
                  Please wait...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <i data-lucide={mode === "login" ? "log-in" : "user-plus"} className="w-4 h-4 mr-2"></i>
                  {mode === "login" ? t.sign_in : t.create_account}
                </div>
              )}
            </button>
          </form>

          {/* Switch mode */}
          <div className="mt-6 text-center">
            {mode === "login" ? (
              <p className="text-sm text-gray-600">
                {t.no_account}{" "}
                <button
                  onClick={() => setMode("register")}
                  className="text-teal-600 hover:text-teal-700 font-medium"
                >
                  {t.create_one}
                </button>
              </p>
            ) : (
              <p className="text-sm text-gray-600">
                {t.already_account}{" "}
                <button
                  onClick={() => setMode("login")}
                  className="text-teal-600 hover:text-teal-700 font-medium"
                >
                  {t.sign_in_instead}
                </button>
              </p>
            )}
          </div>
        </div>

        {/* Back to Patient Portal */}
        <div className="text-center mt-6">
          <button
            onClick={() => navigate("/login")}
            className="text-sm text-gray-500 hover:text-gray-700 flex items-center justify-center mx-auto"
          >
            <i data-lucide="arrow-left" className="w-4 h-4 mr-1"></i>
            {t.back_to_patient}
          </button>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-xs text-gray-500">
            {t.terms}
          </p>
        </div>
      </div>
    </div>
  );
}
