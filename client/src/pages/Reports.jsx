import React, { useState, useEffect, useRef } from "react";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

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

export default function ReportsPage({ user: currentUser }) {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lang, setLang] = useState(localStorage.getItem("lang") || "en");
  const [selectedPeriod, setSelectedPeriod] = useState("6months");

  const i18n = {
    en: {
      reports: "Reports",
      health_analytics: "Health Analytics",
      appointment_history: "Appointment History",
      health_metrics: "Health Metrics",
      loading: "Loading...",
      appointments_over_time: "Appointments Over Time",
      appointment_status: "Appointment Status Distribution",
      health_score: "Health Score",
      last_updated: "Last updated",
      no_data: "No data available",
      excellent: "Excellent",
      good: "Good",
      fair: "Fair",
      poor: "Poor"
    },
    hi: {
      reports: "रिपोर्ट्स",
      health_analytics: "स्वास्थ्य विश्लेषण",
      appointment_history: "अपॉइंटमेंट इतिहास",
      health_metrics: "स्वास्थ्य मेट्रिक्स",
      loading: "लोड हो रहा है...",
      appointments_over_time: "समय के साथ अपॉइंटमेंट्स",
      appointment_status: "अपॉइंटमेंट स्थिति वितरण",
      health_score: "स्वास्थ्य स्कोर",
      last_updated: "अंतिम अपडेट",
      no_data: "कोई डेटा उपलब्ध नहीं",
      excellent: "उत्कृष्ट",
      good: "अच्छा",
      fair: "ठीक",
      poor: "खराब"
    },
    mr: {
      reports: "अहवाल",
      health_analytics: "आरोग्य विश्लेषण",
      appointment_history: "अपॉइंटमेंट इतिहास",
      health_metrics: "आरोग्य मेट्रिक्स",
      loading: "लोड होत आहे...",
      appointments_over_time: "वेळेनुसार अपॉइंटमेंट्स",
      appointment_status: "अपॉइंटमेंट स्थिती वितरण",
      health_score: "आरोग्य स्कोर",
      last_updated: "शेवटचे अपडेट",
      no_data: "कोणताही डेटा उपलब्ध नाही",
      excellent: "उत्कृष्ट",
      good: "चांगले",
      fair: "ठीक",
      poor: "वाईट"
    }
  };

  const t = i18n[lang] || i18n.en;

  useEffect(() => {
    fetchAppointments();
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

  // Generate mock data for charts
  const generateChartData = () => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
    const appointmentCounts = [2, 1, 3, 2, 1, 4];

    return months.map((month, index) => ({
      month,
      appointments: appointmentCounts[index]
    }));
  };

  const getStatusDistribution = () => {
    const statusCounts = { pending: 0, confirmed: 0, completed: 0, cancelled: 0 };

    appointments.forEach(apt => {
      if (statusCounts.hasOwnProperty(apt.status)) {
        statusCounts[apt.status]++;
      }
    });

    return Object.entries(statusCounts).map(([status, count]) => ({
      name: t[status] || status,
      value: count,
      color: status === 'completed' ? '#10B981' :
             status === 'confirmed' ? '#3B82F6' :
             status === 'pending' ? '#F59E0B' : '#EF4444'
    }));
  };

  const getHealthScore = () => {
    // Mock health score based on appointment frequency and completion
    const completedCount = appointments.filter(apt => apt.status === 'completed').length;
    const totalCount = appointments.length;

    if (totalCount === 0) return 0;

    const completionRate = completedCount / totalCount;
    return Math.round(completionRate * 100);
  };

  const getHealthScoreColor = (score) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    if (score >= 40) return "text-orange-600";
    return "text-red-600";
  };

  const getHealthScoreLabel = (score) => {
    if (score >= 80) return t.excellent;
    if (score >= 60) return t.good;
    if (score >= 40) return t.fair;
    return t.poor;
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t.reports}</h1>
          <p className="text-gray-600">{t.health_analytics}</p>
        </div>

        {/* Health Score Card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className={`text-4xl font-bold ${getHealthScoreColor(getHealthScore())}`}>
              {getHealthScore()}%
            </div>
            <div className="text-gray-600 mt-2">{t.health_score}</div>
            <div className="text-sm text-gray-500 mt-1">
              {getHealthScoreLabel(getHealthScore())}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="text-4xl font-bold text-teal-600">
              {appointments.length}
            </div>
            <div className="text-gray-600 mt-2">Total Appointments</div>
            <div className="text-sm text-gray-500 mt-1">
              {t.last_updated}: {new Date().toLocaleDateString()}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="text-4xl font-bold text-blue-600">
              {appointments.filter(apt => apt.status === 'completed').length}
            </div>
            <div className="text-gray-600 mt-2">Completed</div>
            <div className="text-sm text-gray-500 mt-1">
              {appointments.length > 0
                ? Math.round((appointments.filter(apt => apt.status === 'completed').length / appointments.length) * 100)
                : 0}% completion rate
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Appointments Over Time */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                {t.appointments_over_time}
              </h2>
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="border border-gray-300 rounded px-3 py-1 text-sm"
              >
                <option value="6months">Last 6 Months</option>
                <option value="12months">Last 12 Months</option>
                <option value="year">This Year</option>
              </select>
            </div>
            <div className="h-64">
              {appointments.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={generateChartData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="appointments"
                      stroke="#14B8A6"
                      strokeWidth={2}
                      dot={{ fill: '#14B8A6' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <div className="text-center">
                    <i data-lucide="bar-chart" className="w-12 h-12 mx-auto mb-2"></i>
                    <p>{t.no_data}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Status Distribution */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {t.appointment_status}
            </h2>
            <div className="h-64">
              {appointments.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={getStatusDistribution()}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {getStatusDistribution().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <div className="text-center">
                    <i data-lucide="pie-chart" className="w-12 h-12 mx-auto mb-2"></i>
                    <p>{t.no_data}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Appointment History Table */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">{t.appointment_history}</h2>
          </div>

          {appointments.length === 0 ? (
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i data-lucide="file-text" className="w-8 h-8 text-gray-400"></i>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">{t.no_data}</h3>
              <p className="text-gray-600">Complete some appointments to see your health reports</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Doctor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Reason
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {appointments.map((appointment) => (
                    <tr key={appointment._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(appointment.datetime).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        Healthcare Provider
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {appointment.reason}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          appointment.status === 'completed' ? 'bg-green-100 text-green-800' :
                          appointment.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                          appointment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {t[appointment.status] || appointment.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
