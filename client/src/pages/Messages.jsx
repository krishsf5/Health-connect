import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";

// Auto-detect API URL for both development and production
const getApiUrl = () => {
  if (typeof window !== 'undefined' && window.location.hostname.includes('vercel.app')) {
    return `${window.location.origin}/api`;
  }
  return import.meta.env.VITE_API_URL || "http://localhost:5000/api";
};

const API = getApiUrl();
const token = () => localStorage.getItem("token");
const getUser = () => JSON.parse(localStorage.getItem("user") || "null");

export default function MessagesPage({ user: currentUser }) {
  const [searchParams] = useSearchParams();
  const [appointments, setAppointments] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showPast, setShowPast] = useState(false);
  const [unseenCounts, setUnseenCounts] = useState({});
  const user = getUser();

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
        
        // Mark messages as seen when viewing
        markMessagesAsSeen(appointmentId, data);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  // Mark messages as seen for this appointment
  const markMessagesAsSeen = (appointmentId, messageList) => {
    const seenMessages = JSON.parse(localStorage.getItem('seenMessages') || '{}');
    const userId = user?.id;
    
    if (!userId) return;
    
    if (!seenMessages[userId]) {
      seenMessages[userId] = {};
    }
    
    // Store all message IDs as seen for this appointment
    const messageIds = messageList.map(msg => msg.createdAt || msg._id);
    seenMessages[userId][appointmentId] = messageIds;
    
    localStorage.setItem('seenMessages', JSON.stringify(seenMessages));
    
    // Update unseen counts
    calculateUnseenCounts(appointments);
  };

  // Calculate unseen message counts for all appointments
  const calculateUnseenCounts = (appointmentList) => {
    const seenMessages = JSON.parse(localStorage.getItem('seenMessages') || '{}');
    const userId = user?.id;
    
    if (!userId) return;
    
    const counts = {};
    const userSeenMessages = seenMessages[userId] || {};
    
    appointmentList.forEach(appointment => {
      const messages = appointment.messages || [];
      const seenIds = userSeenMessages[appointment._id] || [];
      
      // Count messages not authored by current user and not seen
      const unseenCount = messages.filter(msg => {
        const isMyMessage = msg.author?._id === userId;
        const isSeen = seenIds.includes(msg.createdAt || msg._id);
        return !isMyMessage && !isSeen;
      }).length;
      
      if (unseenCount > 0) {
        counts[appointment._id] = unseenCount;
      }
    });
    
    setUnseenCounts(counts);
  };

  useEffect(() => {
    fetchAppointmentsWithMessages();
  }, []);

  // Auto-select appointment from URL parameter
  useEffect(() => {
    const appointmentId = searchParams.get('appointmentId');
    if (appointmentId && appointments.length > 0) {
      const appointment = appointments.find(a => a._id === appointmentId);
      if (appointment) {
        setSelectedAppointment(appointment);
        // If it's a past appointment, show past conversations
        if (appointment.status !== 'accepted') {
          setShowPast(true);
        }
      }
    }
  }, [searchParams, appointments]);

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
        // Filter for accepted appointments and appointments with messages
        const filtered = (Array.isArray(data) ? data : data.appointments || []).filter(appt => 
          appt.status === 'accepted' || 
          (appt.messages && appt.messages.length > 0)
        );
        setAppointments(filtered);
        
        // Calculate unseen message counts
        calculateUnseenCounts(filtered);
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
        // Refresh appointments to update message counts
        await fetchAppointmentsWithMessages();
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
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Conversations</h2>
                  <button
                    onClick={() => setShowPast(!showPast)}
                    className="text-xs px-2 py-1 rounded bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-slate-300 hover:bg-gray-300 dark:hover:bg-slate-600 transition-colors"
                  >
                    {showPast ? 'Active Only' : 'Show All'}
                  </button>
                </div>
              </div>
              <div className="divide-y divide-gray-200 dark:divide-slate-700 max-h-[600px] overflow-y-auto">
                {(() => {
                  const activeAppointments = appointments.filter(a => a.status === 'accepted');
                  const pastAppointments = appointments.filter(a => a.status !== 'accepted' && a.messages?.length > 0);
                  const displayAppointments = showPast ? appointments : activeAppointments;
                  
                  return displayAppointments.length === 0 ? (
                    <div className="p-8 text-center">
                      <i data-lucide="message-circle" className="w-12 h-12 mx-auto mb-3 text-gray-400"></i>
                      <p className="text-sm text-gray-500 dark:text-slate-400">
                        {showPast ? 'No conversations found' : 'No active conversations'}
                      </p>
                    </div>
                  ) : (
                    <>
                      {/* Active Conversations */}
                      {activeAppointments.length > 0 && (
                        <>
                          {activeAppointments.map((appointment) => (
                            <div
                              key={appointment._id}
                              onClick={() => setSelectedAppointment(appointment)}
                              className={`p-4 cursor-pointer transition-colors relative ${
                                selectedAppointment?._id === appointment._id 
                                  ? 'bg-teal-50 dark:bg-teal-900/20 border-l-4 border-teal-600' 
                                  : 'hover:bg-gray-50 dark:hover:bg-slate-800'
                              }`}
                            >
                              <div className="flex items-center space-x-3">
                                <div className="w-12 h-12 bg-gradient-to-br from-teal-400 to-teal-600 rounded-full flex items-center justify-center flex-shrink-0 relative shadow-md">
                                  <i data-lucide="user" className="w-6 h-6 text-white"></i>
                                  {unseenCounts[appointment._id] > 0 && (
                                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-semibold animate-pulse">
                                      {unseenCounts[appointment._id]}
                                    </span>
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                      {user?.role === 'doctor' 
                                        ? appointment.patient?.name || 'Patient'
                                        : appointment.doctor?.name || 'Doctor'}
                                    </p>
                                    <span className="text-xs px-1.5 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded">
                                      Active
                                    </span>
                                  </div>
                                  <p className="text-xs text-gray-500 dark:text-slate-400">
                                    {new Date(appointment.datetime).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </>
                      )}
                      
                      {/* Past Conversations (only if showPast is true) */}
                      {showPast && pastAppointments.length > 0 && (
                        <>
                          <div className="px-4 py-2 bg-gray-100 dark:bg-slate-800">
                            <p className="text-xs font-semibold text-gray-600 dark:text-slate-400 uppercase">Past Conversations</p>
                          </div>
                          {pastAppointments.map((appointment) => (
                            <div
                              key={appointment._id}
                              onClick={() => setSelectedAppointment(appointment)}
                              className={`p-4 cursor-pointer transition-colors relative opacity-75 ${
                                selectedAppointment?._id === appointment._id 
                                  ? 'bg-teal-50 dark:bg-teal-900/20 border-l-4 border-teal-600' 
                                  : 'hover:bg-gray-50 dark:hover:bg-slate-800'
                              }`}
                            >
                              <div className="flex items-center space-x-3">
                                <div className="w-12 h-12 bg-gradient-to-br from-gray-300 to-gray-500 dark:from-slate-600 dark:to-slate-700 rounded-full flex items-center justify-center flex-shrink-0 relative shadow-md">
                                  <i data-lucide="user" className="w-6 h-6 text-white"></i>
                                  {unseenCounts[appointment._id] > 0 && (
                                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-semibold">
                                      {unseenCounts[appointment._id]}
                                    </span>
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                      {user?.role === 'doctor' 
                                        ? appointment.patient?.name || 'Patient'
                                        : appointment.doctor?.name || 'Doctor'}
                                    </p>
                                    <span className="text-xs px-1.5 py-0.5 bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-400 rounded capitalize">
                                      {appointment.status}
                                    </span>
                                  </div>
                                  <p className="text-xs text-gray-500 dark:text-slate-400">
                                    {new Date(appointment.datetime).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </>
                      )}
                    </>
                  );
                })()}
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
                    {selectedAppointment.status === 'accepted' ? (
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
                          className="bg-teal-600 text-white w-10 h-10 rounded-full hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center shadow-md hover:shadow-lg active:scale-95"
                          title="Send message"
                        >
                          {sending ? (
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <svg 
                              xmlns="http://www.w3.org/2000/svg" 
                              viewBox="0 0 24 24" 
                              fill="none" 
                              stroke="currentColor" 
                              strokeWidth="2.5" 
                              strokeLinecap="round" 
                              strokeLinejoin="round" 
                              className="w-5 h-5 translate-x-0.5"
                            >
                              <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>
                            </svg>
                          )}
                        </button>
                      </div>
                    ) : (
                      <div className="text-center py-2">
                        <p className="text-sm text-gray-500 dark:text-slate-400">
                          <i data-lucide="lock" className="w-4 h-4 inline mr-1"></i>
                          This conversation is read-only. Appointment status: <span className="capitalize font-medium">{selectedAppointment.status}</span>
                        </p>
                      </div>
                    )}
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
