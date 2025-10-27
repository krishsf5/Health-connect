import React, { useState, useEffect } from "react";

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

export default function MessagesPage({ user: currentUser }) {
  const [appointments, setAppointments] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const user = user();

  // Fetch messages for selected appointment
  const fetchMessages = async (appointmentId) => {
    try {
      const response = await fetch(
        `${API}/appointments/${appointmentId}/messages`,
        { headers: { Authorization: `Bearer ${token()}` }}
      );
      if (response.ok) {
        const data = await response.json();
        setMessages(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  useEffect(() => {
    fetchAppointmentsWithMessages();
  }, []);

  // Poll for new messages
  useEffect(() => {
    if (!selectedAppointment) return;
    
    fetchMessages(selectedAppointment._id);
    
    const interval = setInterval(() => {
      fetchMessages(selectedAppointment._id);
    }, 3000);
    
    return () => clearInterval(interval);
  }, [selectedAppointment]);

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
    if (!newMessage.trim() || sending) return;

    setSending(true);
    try {
      const response = await fetch(`${API}/appointments/${appointmentId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token()}`,
        },
        body: JSON.stringify({ text: newMessage.trim() }),
      });

      if (response.ok) {
        setNewMessage("");
        await fetchMessages(appointmentId);
      }
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setSending(false);
    }
  };

  const getDoctorName = (appointment) => {
    // This would need doctor info from the appointment
    return appointment.doctorName || "Healthcare Provider";
  };

  if (loading) {
    return (
      <div className="min-h-screen dashboard-bg p-8">
        <div className="max-w-6xl mx-auto">
          <div className="card p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-slate-400">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen dashboard-bg p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Messages</h1>
          <p className="text-gray-600 dark:text-slate-400">Chat with your {user?.role === 'doctor' ? 'patients' : 'doctors'}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Conversations List */}
          <div className="lg:col-span-1">
            <div className="card overflow-hidden">
              <div className="p-4 border-b border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Conversations</h2>
              </div>
              <div className="divide-y divide-gray-200 dark:divide-slate-700 max-h-[600px] overflow-y-auto">
                {appointments.length === 0 ? (
                  <div className="p-8 text-center">
                    <i data-lucide="message-circle" className="w-12 h-12 mx-auto mb-3 text-gray-400"></i>
                    <p className="text-sm text-gray-500 dark:text-slate-400">No appointments found</p>
                  </div>
                ) : (
                  appointments.map((appointment) => (
                    <div
                      key={appointment._id}
                      onClick={() => setSelectedAppointment(appointment)}
                      className={`p-4 cursor-pointer transition-colors ${
                        selectedAppointment?._id === appointment._id 
                          ? 'bg-teal-50 dark:bg-teal-900/20 border-l-4 border-teal-600' 
                          : 'hover:bg-gray-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-teal-100 dark:bg-teal-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                          <i data-lucide="user" className="w-6 h-6 text-teal-600 dark:text-teal-400"></i>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {user?.role === 'doctor' 
                              ? appointment.patient?.name || 'Patient'
                              : appointment.doctor?.name || 'Doctor'}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-slate-400">
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

          {/* Chat Panel */}
          <div className="lg:col-span-2">
            <div className="card h-[600px] flex flex-col">
              {selectedAppointment ? (
                <>
                  {/* Chat Header */}
                  <div className="p-4 border-b border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-teal-100 dark:bg-teal-900/30 rounded-full flex items-center justify-center">
                        <i data-lucide="user" className="w-6 h-6 text-teal-600 dark:text-teal-400"></i>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {user?.role === 'doctor' 
                            ? selectedAppointment.patient?.name || 'Patient'
                            : selectedAppointment.doctor?.name || 'Doctor'}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-slate-400">
                          Appointment: {new Date(selectedAppointment.datetime).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Messages Area */}
                  <div className="flex-1 p-4 overflow-y-auto bg-gray-50 dark:bg-slate-900/50">
                    {messages.length === 0 ? (
                      <div className="flex items-center justify-center h-full text-center">
                        <div>
                          <i data-lucide="message-circle" className="w-16 h-16 mx-auto mb-4 text-gray-400"></i>
                          <p className="text-gray-600 dark:text-slate-400 font-medium mb-2">No messages yet</p>
                          <p className="text-sm text-gray-500 dark:text-slate-500">Start the conversation below</p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {messages.map((msg, idx) => {
                          const isMyMessage = msg.author?._id === user?.id;
                          return (
                            <div key={idx} className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'}`}>
                              <div className={`max-w-[70%] ${isMyMessage ? 'order-2' : 'order-1'}`}>
                                <div className={`rounded-2xl px-4 py-2 ${
                                  isMyMessage 
                                    ? 'bg-teal-600 text-white' 
                                    : 'bg-white dark:bg-slate-800 text-gray-900 dark:text-white border border-gray-200 dark:border-slate-700'
                                }`}>
                                  <p className="text-sm">{msg.text}</p>
                                </div>
                                <div className={`mt-1 flex items-center gap-2 text-xs text-gray-500 dark:text-slate-500 ${isMyMessage ? 'justify-end' : 'justify-start'}`}>
                                  <span>{msg.author?.name || 'Unknown'}</span>
                                  <span>•</span>
                                  <span>{msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : 'Now'}</span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Message Input */}
                  <div className="p-4 border-t border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type your message..."
                        className="flex-1 border border-gray-300 dark:border-slate-600 rounded-lg px-4 py-2 bg-white dark:bg-slate-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
                        onKeyPress={(e) => e.key === 'Enter' && !sending && sendMessage(selectedAppointment._id)}
                        disabled={sending}
                      />
                      <button
                        onClick={() => sendMessage(selectedAppointment._id)}
                        disabled={sending || !newMessage.trim()}
                        className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                      >
                        {sending ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <i data-lucide="send" className="w-4 h-4"></i>
                        )}
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <i data-lucide="message-circle" className="w-20 h-20 mx-auto mb-4 text-gray-400"></i>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Select a Conversation</h3>
                    <p className="text-gray-600 dark:text-slate-400">Choose an appointment to start messaging</p>
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
