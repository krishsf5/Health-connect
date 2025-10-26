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

export default function MessagesPage({ user: currentUser }) {
  const [appointments, setAppointments] = useState([]);
  const [messages, setMessages] = useState({});
  const [newMessage, setNewMessage] = useState("");
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lang, setLang] = useState(localStorage.getItem("lang") || "en");

  const i18n = {
    en: {
      messages: "Messages",
      appointment_messages: "Appointment Messages",
      select_appointment: "Select an appointment to view messages",
      no_appointments: "No appointments with messages found",
      loading: "Loading...",
      send_message: "Send Message",
      type_message: "Type your message...",
      no_messages: "No messages yet",
      start_conversation: "Start a conversation with your healthcare provider"
    },
    hi: {
      messages: "संदेश",
      appointment_messages: "अपॉइंटमेंट संदेश",
      select_appointment: "संदेश देखने के लिए अपॉइंटमेंट चुनें",
      no_appointments: "संदेशों के साथ कोई अपॉइंटमेंट नहीं मिला",
      loading: "लोड हो रहा है...",
      send_message: "संदेश भेजें",
      type_message: "अपना संदेश टाइप करें...",
      no_messages: "अभी तक कोई संदेश नहीं",
      start_conversation: "अपने स्वास्थ्य सेवा प्रदाता के साथ बातचीत शुरू करें"
    },
    mr: {
      messages: "संदेश",
      appointment_messages: "अपॉइंटमेंट संदेश",
      select_appointment: "संदेश पाहण्यासाठी अपॉइंटमेंट निवडा",
      no_appointments: "संदेशांसह कोणतेही अपॉइंटमेंट सापडले नाहीत",
      loading: "लोड होत आहे...",
      send_message: "संदेश पाठवा",
      type_message: "आपला संदेश टाइप करा...",
      no_messages: "अद्याप कोणतेही संदेश नाहीत",
      start_conversation: "आपल्या आरोग्य सेवा प्रदात्यासोबत संभाषण सुरू करा"
    }
  };

  const t = i18n[lang] || i18n.en;

  useEffect(() => {
    fetchAppointmentsWithMessages();
  }, []);

  const fetchAppointmentsWithMessages = async () => {
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

  const sendMessage = async (appointmentId) => {
    if (!newMessage.trim()) return;

    try {
      const response = await fetch(`${API}/appointments/${appointmentId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token()}`,
        },
        body: JSON.stringify({ text: newMessage }),
      });

      if (response.ok) {
        setNewMessage("");
        // Refresh messages for this appointment
        await fetchMessagesForAppointment(appointmentId);
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const fetchMessagesForAppointment = async (appointmentId) => {
    // This would need a GET endpoint for messages
    // For now, we'll simulate with the send message functionality
  };

  const getDoctorName = (appointment) => {
    // This would need doctor info from the appointment
    return appointment.doctorName || "Healthcare Provider";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
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
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t.messages}</h1>
          <p className="text-gray-600">{t.appointment_messages}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Appointments List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Appointments</h2>
              </div>
              <div className="divide-y divide-gray-200">
                {appointments.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    <i data-lucide="message-circle" className="w-8 h-8 mx-auto mb-2"></i>
                    <p>{t.no_appointments}</p>
                  </div>
                ) : (
                  appointments.map((appointment) => (
                    <div
                      key={appointment._id}
                      onClick={() => setSelectedAppointment(appointment)}
                      className={`p-4 cursor-pointer hover:bg-gray-50 ${
                        selectedAppointment?._id === appointment._id ? 'bg-teal-50 border-l-4 border-teal-600' : ''
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
                          <i data-lucide="user" className="w-5 h-5 text-teal-600"></i>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {getDoctorName(appointment)}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(appointment.datetime).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Messages Panel */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow h-96 flex flex-col">
              {selectedAppointment ? (
                <>
                  {/* Chat Header */}
                  <div className="p-4 border-b border-gray-200">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
                        <i data-lucide="user" className="w-5 h-5 text-teal-600"></i>
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {getDoctorName(selectedAppointment)}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {new Date(selectedAppointment.datetime).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Messages Area */}
                  <div className="flex-1 p-4 overflow-y-auto">
                    <div className="text-center text-gray-500 py-8">
                      <i data-lucide="message-circle" className="w-12 h-12 mx-auto mb-4"></i>
                      <p className="text-lg font-medium mb-2">{t.no_messages}</p>
                      <p className="text-sm">{t.start_conversation}</p>
                    </div>
                  </div>

                  {/* Message Input */}
                  <div className="p-4 border-t border-gray-200">
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder={t.type_message}
                        className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        onKeyPress={(e) => e.key === 'Enter' && sendMessage(selectedAppointment._id)}
                      />
                      <button
                        onClick={() => sendMessage(selectedAppointment._id)}
                        className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors"
                      >
                        <i data-lucide="send" className="w-4 h-4"></i>
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <i data-lucide="message-circle" className="w-16 h-16 mx-auto mb-4"></i>
                    <h3 className="text-lg font-medium mb-2">Select an Appointment</h3>
                    <p className="text-sm">{t.select_appointment}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
