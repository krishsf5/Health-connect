import React, { useState, useEffect, useRef } from "react";
import Tesseract from "tesseract.js";
import Chart from "chart.js/auto";

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
const token = () => localStorage.getItem("token");
const user = () => JSON.parse(localStorage.getItem("user") || "null");

export default function PatientDashboard() {
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [lang, setLang] = useState(localStorage.getItem("lang") || "en");
  const [form, setForm] = useState({
    doctorId: "",
    reason: "",
    datetime: "",
    age: "",
    weight: "",
    severity: 0,
  });
  const [message, setMessage] = useState("");
  const [ocrText, setOcrText] = useState("");
  const [ocrImage, setOcrImage] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date().toISOString());

  const heartChartRef = useRef(null);

  const i18n = {
    en: {
      patient_dashboard: "Patient Dashboard",
      welcome: "Welcome back! Manage your health appointments and track your vitals.",
      book_appointment: "Book Appointment",
      select_doctor: "Select Doctor",
      reason: "Reason for visit",
      age: "Age",
      weight: "Weight (kg)",
      severity: "Severity of condition",
      selected_stars: (n) => `Selected: ${n} star(s)`,
      book_btn: "Book Appointment",
      upload_reports: "Upload Reports",
      current_appointments: "Current Appointments",
      history: "Appointment History",
      heart_rate: "Heart Rate Monitor",
      no_current: "No current appointments.",
      no_history: "No appointment history yet.",
      language: "Language",
      drag_drop: "Drag and drop your reports here, or click to select",
      browse_files: "Browse Files",
    },
    hi: {
      patient_dashboard: "रोगी डैशबोर्ड",
      welcome: "वापसी पर स्वागत है! अपनी अपॉइंटमेंट्स और सेहत की निगरानी करें।",
      book_appointment: "अपॉइंटमेंट बुक करें",
      select_doctor: "डॉक्टर चुनें",
      reason: "मुलाकात का कारण",
      age: "उम्र",
      weight: "वज़न (किग्रा)",
      severity: "स्थिति की गंभीरता",
      selected_stars: (n) => `चयनित: ${n} स्टार`,
      book_btn: "बुक करें",
      upload_reports: "रिपोर्ट अपलोड करें",
      current_appointments: "वर्तमान अपॉइंटमेंट्स",
      history: "अपॉइंटमेंट इतिहास",
      heart_rate: "हार्ट रेट मॉनिटर",
      no_current: "कोई वर्तमान अपॉइंटमेंट नहीं।",
      no_history: "अभी तक कोई इतिहास नहीं।",
      language: "भाषा",
      drag_drop: "अपनी रिपोर्ट्स को यहां ड्रैग और ड्रॉप करें, या चुनने के लिए क्लिक करें",
      browse_files: "फ़ाइलें ब्राउज़ करें",
    },
    mr: {
      patient_dashboard: "रुग्ण डॅशबोर्ड",
      welcome: "परत स्वागत! तुमच्या अपॉइंटमेंट्स आणि आरोग्याची नोंद ठेवा.",
      book_appointment: "अपॉइंटमेंट बुक करा",
      select_doctor: "डॉक्टर निवडा",
      reason: "भेटीचे कारण",
      age: "वय",
      weight: "वजन (किलो)",
      severity: "परिस्थितीची तीव्रता",
      selected_stars: (n) => `निवडले: ${n} तारे`,
      book_btn: "बुक करा",
      upload_reports: "रिपोर्ट अपलोड करा",
      current_appointments: "सध्याच्या अपॉइंटमेंट्स",
      history: "अपॉइंटमेंट इतिहास",
      heart_rate: "हार्ट रेट मॉनिटर",
      no_current: "सध्या कोणतीही अपॉइंटमेंट नाही.",
      no_history: "अजून इतिहास नाही.",
      language: "भाषा",
      drag_drop: "तुमच्या रिपोर्ट्सला येथे ड्रॅग आणि ड्रॉप करा, किंवा निवडण्यासाठी क्लिक करा",
      browse_files: "फायली ब्राउझ करा",
    },
  };

  const t = (key, ...args) => {
    const val = i18n[lang]?.[key];
    if (typeof val === "function") return val(...args);
    return val || i18n.en[key] || key;
  };

  // Fetch data
  const fetchData = async () => {
    try {
      // Fetch doctors
      const doctorsRes = await fetch(`${API}/appointments/doctors`, {
        headers: { Authorization: `Bearer ${token()}` },
      });
      if (doctorsRes.ok) {
        const doctorsData = await doctorsRes.json();
        setDoctors(Array.isArray(doctorsData) ? doctorsData : []);
      }

      // Fetch appointments
      const appointmentsRes = await fetch(`${API}/appointments/me`, {
        headers: { Authorization: `Bearer ${token()}` },
      });
      if (appointmentsRes.ok) {
        const appointmentsData = await appointmentsRes.json();
        setAppointments(Array.isArray(appointmentsData) ? appointmentsData : []);
        setLastUpdate(new Date().toISOString());
      }
    } catch (error) {
      console.error('Fetch error:', error);
    }
  };

  // Polling for updates (replaces Socket.IO)
  useEffect(() => {
    fetchData(); // Initial fetch

    const pollInterval = setInterval(async () => {
      try {
        const pollRes = await fetch(`${API}/appointments/poll?lastUpdate=${encodeURIComponent(lastUpdate)}`, {
          headers: { Authorization: `Bearer ${token()}` },
        });

        if (pollRes.ok) {
          const pollData = await pollRes.json();

          if (pollData.appointments && pollData.appointments.length > 0) {
            // Update appointments with new data
            setAppointments(prev => {
              const updated = [...prev];
              pollData.appointments.forEach(newAppt => {
                const existingIndex = updated.findIndex(a => a._id === newAppt._id);
                if (existingIndex >= 0) {
                  updated[existingIndex] = newAppt;
                } else {
                  updated.unshift(newAppt); // Add new appointments to top
                }
              });
              return updated;
            });

            if (pollData.appointments.some(a => a.patient?._id === user()?.id)) {
              setMessage("Your appointment was updated in real-time.");
              setTimeout(() => setMessage(""), 3000);
            }
          }

          setLastUpdate(pollData.timestamp);
        }
      } catch (error) {
        console.error('Polling error:', error);
      }
    }, 5000); // Poll every 5 seconds

    return () => clearInterval(pollInterval);
  }, [lastUpdate, lang]);

  // Chart setup
  useEffect(() => {
    if (!heartChartRef.current) return;
    const ctx = heartChartRef.current.getContext("2d");
    const chart = new Chart(ctx, {
      type: "line",
      data: {
        labels: ["10:00", "10:15", "10:30", "10:45", "11:00"],
        datasets: [
          {
            label: "Heart Rate (BPM)",
            data: [72, 75, 78, 76, 80],
            borderColor: "#0d9488",
            backgroundColor: "rgba(13, 148, 136, 0.1)",
            tension: 0.4,
            fill: true,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: {
          y: {
            grid: { color: "#f3f4f6" },
            ticks: { color: "#6b7280" }
          },
          x: {
            grid: { color: "#f3f4f6" },
            ticks: { color: "#6b7280" }
          }
        }
      },
    });

    return () => chart.destroy();
  }, []);

  // File handling
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setOcrImage(URL.createObjectURL(file));
      Tesseract.recognize(file, "eng").then(({ data: { text } }) => {
        setOcrText(text);
      });
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setOcrImage(URL.createObjectURL(file));
      Tesseract.recognize(file, "eng").then(({ data: { text } }) => {
        setOcrText(text);
      });
    }
  };

  // Form submission
  const submit = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      const res = await fetch(`${API}/appointments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token()}`,
        },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        const data = await res.json();
        setAppointments(prev => [data, ...prev]);
        setMessage("Appointment requested successfully.");
        setForm({
          doctorId: "",
          reason: "",
          datetime: "",
          age: "",
          weight: "",
          severity: 0,
        });
        // Refresh data after successful submission
        fetchData();
      } else {
        const errorData = await res.json();
        setMessage(errorData.message || "Failed");
      }
    } catch (error) {
      setMessage("Network error occurred");
    }
  };

  const renderStars = () => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((s) => (
          <span
            key={s}
            onClick={() => setForm({ ...form, severity: s })}
            className={`cursor-pointer text-2xl transition-colors ${
              form.severity >= s ? "text-teal-600" : "text-gray-300 hover:text-gray-400"
            }`}
          >
            {form.severity >= s ? "●" : "○"}
          </span>
        ))}
      </div>
    );
  };

  const list = Array.isArray(appointments) ? appointments : [];
  const currentAppointments = list.filter((a) =>
    a.status === "pending" || a.status === "accepted" || a.status === "rescheduled"
  );
  const historyAppointments = list.filter((a) =>
    a.status === "completed" || a.status === "declined"
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between" data-aos="fade-down">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('patient_dashboard')}</h1>
          <p className="text-gray-600 mt-1">{t('welcome')}</p>
        </div>
        <div className="flex items-center space-x-2">
          <label className="text-sm text-gray-600">{t('language')}:</label>
          <select
            value={lang}
            onChange={(e) => setLang(e.target.value)}
            className="border border-gray-300 px-3 py-2 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="en">English</option>
            <option value="hi">हिन्दी</option>
            <option value="mr">मराठी</option>
          </select>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Left Column - Main Actions */}
        <div className="xl:col-span-2 space-y-8">
          {/* Book Appointment Card */}
          <div className="card card-hover" data-aos="fade-up">
            <div className="flex items-center space-x-2 mb-6">
              <i data-lucide="calendar-plus" className="w-5 h-5 text-teal-600"></i>
              <h2 className="text-xl font-semibold text-gray-900">{t('book_appointment')}</h2>
            </div>
            <form onSubmit={submit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('select_doctor')}
                  </label>
                  <select
                    value={form.doctorId}
                    onChange={(e) => setForm({ ...form, doctorId: e.target.value })}
                    className="w-full border border-gray-300 px-3 py-2 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                    required
                  >
                    <option value="">{t('select_doctor')}</option>
                    {(Array.isArray(doctors) ? doctors : []).map((d) => (
                      <option key={d._id} value={d._id}>
                        {d.name} {d.specialization ? `- ${d.specialization}` : ''} ({d.email})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Appointment Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    value={form.datetime}
                    onChange={(e) => setForm({ ...form, datetime: e.target.value })}
                    className="w-full border border-gray-300 px-3 py-2 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('reason')}
                </label>
                <input
                  type="text"
                  placeholder={t('reason')}
                  value={form.reason}
                  onChange={(e) => setForm({ ...form, reason: e.target.value })}
                  className="w-full border border-gray-300 px-3 py-2 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('age')}
                  </label>
                  <input
                    type="number"
                    placeholder={t('age')}
                    value={form.age}
                    onChange={(e) => setForm({ ...form, age: e.target.value })}
                    className="w-full border border-gray-300 px-3 py-2 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                    required
                    min="1"
                    max="120"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('weight')}
                  </label>
                  <input
                    type="number"
                    placeholder={t('weight')}
                    value={form.weight}
                    onChange={(e) => setForm({ ...form, weight: e.target.value })}
                    className="w-full border border-gray-300 px-3 py-2 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                    required
                    min="2"
                    max="500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('severity')}
                  </label>
                  <div className="pt-2">
                    {renderStars()}
                    {form.severity > 0 && (
                      <p className="text-sm text-gray-600 mt-1">
                        {t('selected_stars', form.severity)}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <button type="submit" className="w-full btn-primary">
                <i data-lucide="calendar-plus" className="w-4 h-4 mr-2"></i>
                {t('book_btn')}
              </button>
            </form>
          </div>

          {/* Upload Reports Card */}
          <div className="card card-hover" data-aos="fade-up" data-aos-delay="100">
            <div className="flex items-center space-x-2 mb-6">
              <i data-lucide="upload" className="w-5 h-5 text-teal-600"></i>
              <h2 className="text-xl font-semibold text-gray-900">{t('upload_reports')}</h2>
            </div>

            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive
                  ? 'border-teal-400 bg-teal-50'
                  : 'border-gray-300 hover:border-teal-400 hover:bg-gray-50'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <i data-lucide="file-text" className="w-12 h-12 text-gray-400 mb-4"></i>
              <p className="text-gray-600 mb-2">{t('drag_drop')}</p>
              <label className="btn-primary cursor-pointer">
                <i data-lucide="folder-open" className="w-4 h-4 mr-2"></i>
                {t('browse_files')}
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="hidden"
                  accept="image/*,.pdf"
                />
              </label>
            </div>

            {ocrImage && (
              <div className="mt-4">
                <img
                  src={ocrImage}
                  alt="Preview"
                  className="w-32 h-32 object-cover rounded-lg border mx-auto mb-4"
                />
                <textarea
                  className="w-full h-40 border border-gray-300 rounded-lg p-3 text-sm bg-gray-50"
                  value={ocrText}
                  readOnly
                  placeholder="OCR text will appear here..."
                />
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Status and Monitoring */}
        <div className="space-y-8">
          {/* Current Appointments */}
          <div className="card card-hover" data-aos="fade-left">
            <div className="flex items-center space-x-2 mb-6">
              <i data-lucide="clock" className="w-5 h-5 text-teal-600"></i>
              <h2 className="text-xl font-semibold text-gray-900">{t('current_appointments')}</h2>
            </div>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {currentAppointments.map((a) => (
                <div key={a._id} className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">
                        {a.doctor?.name || "Doctor"}
                      </p>
                      <p className="text-sm text-gray-600">{a.reason}</p>
                      <p className="text-sm text-gray-600">
                        Severity: {"●".repeat(a.severity || 0)}
                      </p>
                    </div>
                    <span className="text-xs px-2 py-1 bg-teal-100 text-teal-700 rounded-full capitalize">
                      {a.status}
                    </span>
                  </div>
                  <p className="text-sm text-teal-600 font-medium">
                    {new Date(a.datetime).toLocaleString()}
                  </p>
                </div>
              ))}
              {currentAppointments.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-8">{t('no_current')}</p>
              )}
            </div>
          </div>

          {/* History */}
          <div className="card card-hover" data-aos="fade-left" data-aos-delay="100">
            <div className="flex items-center space-x-2 mb-6">
              <i data-lucide="history" className="w-5 h-5 text-teal-600"></i>
              <h2 className="text-xl font-semibold text-gray-900">{t('history')}</h2>
            </div>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {historyAppointments.map((a) => (
                <div key={a._id} className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">
                        {a.doctor?.name || "Doctor"}
                      </p>
                      <p className="text-sm text-gray-600">{a.reason}</p>
                    </div>
                    <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-full capitalize">
                      {a.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">
                    {new Date(a.datetime).toLocaleString()}
                  </p>
                </div>
              ))}
              {historyAppointments.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-8">{t('no_history')}</p>
              )}
            </div>
          </div>

          {/* Heart Rate Monitor */}
          <div className="card card-hover" data-aos="fade-left" data-aos-delay="200">
            <div className="flex items-center space-x-2 mb-6">
              <i data-lucide="heart" className="w-5 h-5 text-teal-600"></i>
              <h2 className="text-xl font-semibold text-gray-900">{t('heart_rate')}</h2>
            </div>
            <canvas ref={heartChartRef} height="200"></canvas>
          </div>
        </div>
      </div>

      {/* Success/Error Messages */}
      {message && (
        <div
          className={`fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg ${
            message.includes('success') ? 'bg-green-500' : 'bg-teal-600'
          } text-white font-medium`}
          data-aos="fade-up"
        >
          {message}
        </div>
      )}
    </div>
  );
}
