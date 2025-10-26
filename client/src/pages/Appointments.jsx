import React, { useState, useEffect } from "react";

// Auto-detect API URL for both development and production
const getApiUrl = () => {
  if (typeof window !== 'undefined' && window.location.hostname.includes('vercel.app')) {
    return `${window.location.origin}/api`;
  }
  return import.meta.env.VITE_API_URL || "http://localhost:5000";
};

const API = getApiUrl();
const token = () => localStorage.getItem("token");
const user = () => JSON.parse(localStorage.getItem("user") || "null");

export default function AppointmentsPage({ user: currentUser }) {
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lang, setLang] = useState(localStorage.getItem("lang") || "en");

  const i18n = {
    en: {
      appointments: "Appointments",
      my_appointments: "My Appointments",
      upcoming: "Upcoming Appointments",
      past: "Past Appointments",
      doctor: "Doctor",
      date: "Date & Time",
      reason: "Reason",
      status: "Status",
      no_appointments: "No appointments found",
      loading: "Loading...",
      pending: "Pending",
      confirmed: "Confirmed",
      completed: "Completed",
      cancelled: "Cancelled"
    },
    hi: {
      appointments: "अपॉइंटमेंट्स",
      my_appointments: "मेरे अपॉइंटमेंट्स",
      upcoming: "आगामी अपॉइंटमेंट्स",
      past: "पिछले अपॉइंटमेंट्स",
      doctor: "डॉक्टर",
      date: "दिनांक और समय",
      reason: "विजिट का कारण",
      status: "स्थिति",
      no_appointments: "कोई अपॉइंटमेंट नहीं मिला",
      loading: "लोड हो रहा है...",
      pending: "लंबित",
      confirmed: "पुष्टि की गई",
      completed: "पूर्ण",
      cancelled: "रद्द"
    },
    mr: {
      appointments: "अपॉइंटमेंट्स",
      my_appointments: "माझ्या अपॉइंटमेंट्स",
      upcoming: "आगामी अपॉइंटमेंट्स",
      past: "मागील अपॉइंटमेंट्स",
      doctor: "डॉक्टर",
      date: "दिनांक आणि वेळ",
      reason: "भेटीचे कारण",
      status: "स्थिती",
      no_appointments: "कोणतेही अपॉइंटमेंट सापडले नाहीत",
      loading: "लोड होत आहे...",
      pending: "प्रलंबित",
      confirmed: "पुष्टी केली",
      completed: "पूर्ण",
      cancelled: "रद्द केले"
    }
  };

  const t = i18n[lang] || i18n.en;

  useEffect(() => {
    fetchAppointments();
    fetchDoctors();
  }, []);

  const fetchAppointments = async () => {
    try {
      const response = await fetch(`${API}/appointments/me`, {
        headers: {
          Authorization: `Bearer ${token()}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setAppointments(data.appointments || []);
      }
    } catch (error) {
      console.error("Error fetching appointments:", error);
    }
    setLoading(false);
  };

  const fetchDoctors = async () => {
    try {
      const response = await fetch(`${API}/appointments/doctors`);
      if (response.ok) {
        const data = await response.json();
        setDoctors(data.doctors || []);
      }
    } catch (error) {
      console.error("Error fetching doctors:", error);
    }
  };

  const getDoctorName = (doctorId) => {
    const doctor = doctors.find(d => d._id === doctorId);
    return doctor ? doctor.name : "Unknown Doctor";
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "confirmed": return "bg-green-100 text-green-800";
      case "completed": return "bg-blue-100 text-blue-800";
      case "cancelled": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString(lang, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">{t.loading}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t.appointments}</h1>
          <p className="text-gray-600">{t.my_appointments}</p>
        </div>

        {/* Appointments List */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">{t.upcoming}</h2>
          </div>

          {appointments.length === 0 ? (
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i data-lucide="calendar" className="w-8 h-8 text-gray-400"></i>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">{t.no_appointments}</h3>
              <p className="text-gray-600">Book your first appointment to get started</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {appointments.map((appointment) => (
                <div key={appointment._id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-medium text-gray-900">
                          {getDoctorName(appointment.doctorId)}
                        </h3>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(appointment.status)}`}>
                          {t[appointment.status] || appointment.status}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                        <div className="flex items-center">
                          <i data-lucide="calendar" className="w-4 h-4 mr-2"></i>
                          {formatDate(appointment.datetime)}
                        </div>
                        <div className="flex items-center">
                          <i data-lucide="user" className="w-4 h-4 mr-2"></i>
                          {t.reason}: {appointment.reason}
                        </div>
                        <div className="flex items-center">
                          <i data-lucide="activity" className="w-4 h-4 mr-2"></i>
                          Age: {appointment.age} | Weight: {appointment.weight}kg
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Past Appointments */}
        <div className="bg-white rounded-lg shadow mt-8">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">{t.past}</h2>
          </div>
          <div className="p-8 text-center text-gray-500">
            <i data-lucide="clock" className="w-12 h-12 mx-auto mb-4"></i>
            <p>Past appointments will appear here</p>
          </div>
        </div>
      </div>
    </div>
  );
}
