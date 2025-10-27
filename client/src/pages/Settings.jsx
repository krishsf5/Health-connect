import React, { useState, useEffect } from "react";
import NotificationToggle from "../components/NotificationToggle";

// Auto-detect API URL for both development and production
const getApiUrl = () => {
  if (typeof window !== 'undefined' && window.location.hostname.includes('vercel.app')) {
    return `${window.location.origin}/api`;
  }
  return import.meta.env.VITE_API_URL || "http://localhost:5000/api";
};

const API = getApiUrl();
const token = () => localStorage.getItem("token");
const user = () => JSON.parse(localStorage.getItem("user") || "null");

export default function SettingsPage({ user: currentUser }) {
  const [formData, setFormData] = useState({
    name: currentUser?.name || "",
    email: currentUser?.email || "",
    phone: currentUser?.phone || "",
    specialization: currentUser?.specialization || "",
    experience: currentUser?.experience || "",
  });
  const [preferences, setPreferences] = useState({
    language: localStorage.getItem("lang") || "en",
    notifications: {
      email: true,
      sms: false,
      push: true,
    },
    privacy: {
      profileVisible: true,
      showOnlineStatus: true,
    },
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const i18n = {
    en: {
      settings: "Settings",
      profile_settings: "Profile Settings",
      preferences: "Preferences",
      notifications: "Notifications",
      privacy: "Privacy",
      save_changes: "Save Changes",
      loading: "Loading...",
      success: "Settings updated successfully!",
      error: "Failed to update settings",
      name: "Full Name",
      email: "Email Address",
      phone: "Phone Number",
      specialization: "Specialization",
      experience: "Years of Experience",
      language: "Language",
      english: "English",
      hindi: "Hindi",
      marathi: "Marathi",
      email_notifications: "Email Notifications",
      sms_notifications: "SMS Notifications",
      push_notifications: "Push Notifications",
      profile_visible: "Profile Visible to Others",
      show_online: "Show Online Status",
      account_security: "Account Security",
      change_password: "Change Password",
      two_factor: "Two-Factor Authentication"
    },
    hi: {
      settings: "सेटिंग्स",
      profile_settings: "प्रोफ़ाइल सेटिंग्स",
      preferences: "प्राथमिकताएं",
      notifications: "सूचनाएं",
      privacy: "गोपनीयता",
      save_changes: "परिवर्तन सहेजें",
      loading: "लोड हो रहा है...",
      success: "सेटिंग्स सफलतापूर्वक अपडेट की गईं!",
      error: "सेटिंग्स अपडेट करने में विफल",
      name: "पूरा नाम",
      email: "ईमेल पता",
      phone: "फोन नंबर",
      specialization: "विशेषज्ञता",
      experience: "अनुभव के वर्ष",
      language: "भाषा",
      english: "अंग्रेजी",
      hindi: "हिंदी",
      marathi: "मराठी",
      email_notifications: "ईमेल सूचनाएं",
      sms_notifications: "SMS सूचनाएं",
      push_notifications: "पुश सूचनाएं",
      profile_visible: "प्रोफ़ाइल दूसरों को दिखाई दे",
      show_online: "ऑनलाइन स्थिति दिखाएं",
      account_security: "खाता सुरक्षा",
      change_password: "पासवर्ड बदलें",
      two_factor: "दो-कारक प्रमाणीकरण"
    },
    mr: {
      settings: "सेटिंग्स",
      profile_settings: "प्रोफाइल सेटिंग्स",
      preferences: "प्राधान्ये",
      notifications: "सूचना",
      privacy: "गोपनीयता",
      save_changes: "बदल जतन करा",
      loading: "लोड होत आहे...",
      success: "सेटिंग्स यशस्वीरीत्या अपडेट केल्या!",
      error: "सेटिंग्स अपडेट करण्यात अयशस्वी",
      name: "पूर्ण नाव",
      email: "ईमेल पत्ता",
      phone: "फोन नंबर",
      specialization: "विशेषीकरण",
      experience: "अनुभवाची वर्षे",
      language: "भाषा",
      english: "इंग्रजी",
      hindi: "हिंदी",
      marathi: "मराठी",
      email_notifications: "ईमेल सूचना",
      sms_notifications: "SMS सूचना",
      push_notifications: "पुश सूचना",
      profile_visible: "प्रोफाइल इतरांना दिसेल",
      show_online: "ऑनलाइन स्थिती दर्शवा",
      account_security: "खाते सुरक्षा",
      change_password: "पासवर्ड बदला",
      two_factor: "द्वि-घटक प्रमाणीकरण"
    }
  };

  const t = i18n[preferences.language] || i18n.en;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePreferenceChange = (category, key, value) => {
    setPreferences(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
  };

  const handleLanguageChange = (lang) => {
    setPreferences(prev => ({
      ...prev,
      language: lang
    }));
    localStorage.setItem("lang", lang);
    // Force page re-render with new language
    window.location.reload();
  };

  const handleSave = async () => {
    setLoading(true);
    setMessage("");

    try {
      // In a real app, this would update the user profile via API
      // For now, we'll just update localStorage
      const updatedUser = { ...currentUser, ...formData };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      localStorage.setItem("preferences", JSON.stringify(preferences));

      setMessage(t.success);
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      setMessage(t.error);
      setTimeout(() => setMessage(""), 3000);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-950 dark:to-slate-900 p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t.settings}</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage your account settings and preferences</p>
        </div>

        {message && (
          <div className={`mb-6 p-4 rounded-xl shadow-sm border ${
            message.includes('success') ? 'bg-green-50 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800' : 'bg-red-50 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800'
          }`}>
            {message}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Profile Settings */}
          <div className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 dark:border-slate-800">
            <div className="p-6 border-b border-gray-200/50 dark:border-slate-800">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{t.profile_settings}</h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  {t.name}
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 dark:border-slate-600 rounded-xl px-4 py-3 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  {t.email}
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 dark:border-slate-600 rounded-xl px-4 py-3 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  {t.phone}
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 dark:border-slate-600 rounded-xl px-4 py-3 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
                />
              </div>

              {currentUser?.role === 'doctor' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                      {t.specialization}
                    </label>
                    <input
                      type="text"
                      name="specialization"
                      value={formData.specialization}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 dark:border-slate-600 rounded-xl px-4 py-3 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                      {t.experience}
                    </label>
                    <input
                      type="number"
                      name="experience"
                      value={formData.experience}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 dark:border-slate-600 rounded-xl px-4 py-3 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Preferences */}
          <div className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 dark:border-slate-800">
            <div className="p-6 border-b border-gray-200/50 dark:border-slate-800">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{t.preferences}</h2>
            </div>
            <div className="p-6 space-y-6">
              {/* Language */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  {t.language}
                </label>
                <div className="space-y-2">
                  {[
                    { code: 'en', name: t.english },
                    { code: 'hi', name: t.hindi },
                    { code: 'mr', name: t.marathi }
                  ].map((lang) => (
                    <label key={lang.code} className="flex items-center">
                      <input
                        type="radio"
                        name="language"
                        value={lang.code}
                        checked={preferences.language === lang.code}
                        onChange={(e) => handleLanguageChange(e.target.value)}
                        className="mr-3"
                      />
                      {lang.name}
                    </label>
                  ))}
                </div>
              </div>

              {/* Notifications */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4">
                  {t.notifications}
                </label>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-800/50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <i data-lucide="mail" className="w-5 h-5 text-gray-400 dark:text-gray-500"></i>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{t.email_notifications}</span>
                    </div>
                    <NotificationToggle
                      checked={preferences.notifications.email}
                      onChange={(checked) => handlePreferenceChange('notifications', 'email', checked)}
                      label=""
                      icon="mail"
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-800/50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <i data-lucide="smartphone" className="w-5 h-5 text-gray-400 dark:text-gray-500"></i>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{t.sms_notifications}</span>
                    </div>
                    <NotificationToggle
                      checked={preferences.notifications.sms}
                      onChange={(checked) => handlePreferenceChange('notifications', 'sms', checked)}
                      label=""
                      icon="smartphone"
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-800/50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <i data-lucide="bell" className="w-5 h-5 text-gray-400 dark:text-gray-500"></i>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{t.push_notifications}</span>
                    </div>
                    <NotificationToggle
                      checked={preferences.notifications.push}
                      onChange={(checked) => handlePreferenceChange('notifications', 'push', checked)}
                      label=""
                      icon="bell"
                    />
                  </div>
                </div>
              </div>

              {/* Privacy */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4">
                  {t.privacy}
                </label>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-800/50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <i data-lucide="eye" className="w-5 h-5 text-gray-400 dark:text-gray-500"></i>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{t.profile_visible}</span>
                    </div>
                    <NotificationToggle
                      checked={preferences.privacy.profileVisible}
                      onChange={(checked) => handlePreferenceChange('privacy', 'profileVisible', checked)}
                      label=""
                      icon="eye"
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-800/50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <i data-lucide="circle" className="w-5 h-5 text-gray-400 dark:text-gray-500"></i>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{t.show_online}</span>
                    </div>
                    <NotificationToggle
                      checked={preferences.privacy.showOnlineStatus}
                      onChange={(checked) => handlePreferenceChange('privacy', 'showOnlineStatus', checked)}
                      label=""
                      icon="circle"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Security Section */}
        <div className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 dark:border-slate-800 mt-8">
          <div className="p-6 border-b border-gray-200/50 dark:border-slate-800">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{t.account_security}</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border border-gray-200 dark:border-slate-700 rounded-xl p-4 bg-gray-50/50 dark:bg-slate-800/50 hover:bg-gray-100/50 dark:hover:bg-slate-700/50 transition-colors duration-200">
                <div className="flex items-center space-x-3 mb-3">
                  <i data-lucide="lock" className="w-5 h-5 text-gray-400 dark:text-gray-500"></i>
                  <h3 className="font-medium text-gray-900 dark:text-white">{t.change_password}</h3>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Update your password to keep your account secure
                </p>
                <button className="text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 text-sm font-medium transition-colors duration-200">
                  Change Password →
                </button>
              </div>

              <div className="border border-gray-200 dark:border-slate-700 rounded-xl p-4 bg-gray-50/50 dark:bg-slate-800/50 hover:bg-gray-100/50 dark:hover:bg-slate-700/50 transition-colors duration-200">
                <div className="flex items-center space-x-3 mb-3">
                  <i data-lucide="shield" className="w-5 h-5 text-gray-400 dark:text-gray-500"></i>
                  <h3 className="font-medium text-gray-900 dark:text-white">{t.two_factor}</h3>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Add an extra layer of security to your account
                </p>
                <button className="text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 text-sm font-medium transition-colors duration-200">
                  Enable 2FA →
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="mt-8 flex justify-end">
          <button
            onClick={handleSave}
            disabled={loading}
            className="bg-gradient-to-r from-teal-600 to-teal-700 text-white px-8 py-4 rounded-xl hover:from-teal-700 hover:to-teal-800 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-teal-600 disabled:hover:to-teal-700 flex items-center space-x-3 shadow-lg hover:shadow-xl hover:scale-105"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>{t.loading}</span>
              </>
            ) : (
              <>
                <i data-lucide="save" className="w-5 h-5"></i>
                <span className="font-medium">{t.save_changes}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
