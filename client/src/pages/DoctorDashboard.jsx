import React, { useEffect, useState, useRef } from "react";
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

export default function DoctorDashboard() {
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [openNotes, setOpenNotes] = useState({});
  const [noteInputs, setNoteInputs] = useState({});
  const [openCall, setOpenCall] = useState(null);
  const [openChat, setOpenChat] = useState(null);
  const [chatInputs, setChatInputs] = useState({});
  const [lastUpdate, setLastUpdate] = useState(new Date().toISOString());

  const vitalsChartRef = useRef(null);
  const bpChartRef = useRef(null);

  // Helpers
  const isSameDay = (d1, d2) =>
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();

  const renderSeverity = (level) => (
    <span className="ml-2 text-red-500">{level} / 5</span>
  );

  // Fetch data and polling
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

      const res = await fetch(`${API}/appointments/me`, {
        headers: { Authorization: `Bearer ${token()}` },
      });
      if (res.ok) {
        const data = await res.json();
        setAppointments(Array.isArray(data) ? data : []);
        setLastUpdate(new Date().toISOString());
      }
    } catch (error) {
      console.error('Fetch error:', error);
    }
  };

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
            setAppointments(prev => {
              const updated = [...prev];
              pollData.appointments.forEach(newAppt => {
                const existingIndex = updated.findIndex(a => a._id === newAppt._id);
                if (existingIndex >= 0) {
                  updated[existingIndex] = newAppt;
                } else {
                  updated.unshift(newAppt);
                }
              });
              return updated;
            });
          }

          setLastUpdate(pollData.timestamp);
        }
      } catch (error) {
        console.error('Polling error:', error);
      }
    }, 5000);

    return () => clearInterval(pollInterval);
  }, [lastUpdate]);

  // Chart setup
  useEffect(() => {
    if (vitalsChartRef.current) {
      const ctx = vitalsChartRef.current.getContext("2d");
      const chart = new Chart(ctx, {
        type: "line",
        data: {
          labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
          datasets: [
            {
              label: "Heart Rate",
              data: [72, 75, 78, 76, 74, 80, 79],
              borderColor: "#0d9488",
              backgroundColor: "rgba(13, 148, 136, 0.1)",
              tension: 0.4,
            },
            {
              label: "Oxygen Level",
              data: [98, 97, 99, 98, 97, 98, 99],
              borderColor: "#059669",
              backgroundColor: "rgba(5, 150, 105, 0.1)",
              tension: 0.4,
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
    }
  }, []);

  useEffect(() => {
    if (bpChartRef.current) {
      const ctx = bpChartRef.current.getContext("2d");
      const chart = new Chart(ctx, {
        type: "bar",
        data: {
          labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
          datasets: [
            {
              label: "Systolic",
              data: [120, 118, 121, 119, 122, 120, 121],
              backgroundColor: "#0d9488",
            },
            {
              label: "Diastolic",
              data: [80, 78, 82, 79, 81, 80, 82],
              backgroundColor: "#14b8a6",
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
    }
  }, []);

  // Update appointment status
  const updateStatus = async (id, status, meetingLink) => {
    if (status === "accepted") {
      const today = new Date();
      const todaysAcceptedCount = appointments.filter(
        (a) => a.status === "accepted" && a.datetime && isSameDay(new Date(a.datetime), today)
      ).length;
      if (todaysAcceptedCount >= 10) {
        alert("Daily limit reached: Only 10 patients can be scheduled today.");
        return;
      }
    }

    let payload = { status };
    if (status === "accepted") {
      const room = `health-${id}`;
      payload.meetingLink = `jitsi:${room}`;
    }
    if (meetingLink && meetingLink.trim()) {
      payload.meetingLink = meetingLink.trim();
    }

    try {
      const res = await fetch(`${API}/appointments/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token()}`,
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();
        setAppointments(prev => prev.map(a => a._id === id ? data : a));
      }
    } catch (error) {
      console.error('Update status error:', error);
    }
  };

  const startVideoCall = () => {
    window.open("https://meet.google.com/new", "_blank");
  };

  const DAILY_LIMIT = 10;
  const today = new Date();
  const todaysAcceptedCount = appointments.filter(
    (a) => a.status === "accepted" && a.datetime && isSameDay(new Date(a.datetime), today)
  ).length;
  const remainingToday = Math.max(DAILY_LIMIT - todaysAcceptedCount, 0);
  const todaysCompletedCount = appointments.filter((a) => {
    if (a.status !== "completed") return false;
    const completedAt = a.updatedAt ? new Date(a.updatedAt) : (a.datetime ? new Date(a.datetime) : null);
    return completedAt ? isSameDay(completedAt, today) : false;
  }).length;

  const toggleNotes = (id) => {
    setOpenNotes(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const addNote = async (id) => {
    const text = (noteInputs[id] || "").trim();
    if (!text) return;

    try {
      const res = await fetch(`${API}/appointments/${id}/notes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token()}`,
        },
        body: JSON.stringify({ text }),
      });

      if (res.ok) {
        const data = await res.json();
        setAppointments(prev => prev.map(a => a._id === id ? data : a));
        setNoteInputs(prev => ({ ...prev, [id]: "" }));
        if (!openNotes[id]) {
          setOpenNotes(prev => ({ ...prev, [id]: true }));
        }
      }
    } catch (error) {
      console.error('Add note error:', error);
    }
  };

  const sendChat = async (id) => {
    const text = (chatInputs[id] || "").trim();
    if (!text) return;

    try {
      const res = await fetch(`${API}/appointments/${id}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token()}`,
        },
        body: JSON.stringify({ text }),
      });

      if (res.ok) {
        const data = await res.json();
        setAppointments(prev => prev.map(a => a._id === id ? data : a));
        setChatInputs(prev => ({ ...prev, [id]: "" }));
      }
    } catch (error) {
      console.error('Send chat error:', error);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between" data-aos="fade-down">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Doctor Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome {user()?.name}! Manage your appointments and patient care.</p>
        </div>
      </div>

      {/* Doctor Directory */}
      <div className="card card-hover" data-aos="fade-up">
        <div className="flex items-center space-x-2 mb-6">
          <i data-lucide="users" className="w-5 h-5 text-teal-600"></i>
          <h2 className="text-xl font-semibold text-gray-900">Doctor Directory</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {doctors.map((doctor) => (
            <div key={doctor._id} className="p-4 bg-gray-50 dark:bg-slate-800/50 rounded-lg border border-gray-200 dark:border-slate-700">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 bg-teal-100 dark:bg-teal-900/30 rounded-full flex items-center justify-center">
                  <i data-lucide="user" className="w-5 h-5 text-teal-600 dark:text-teal-400"></i>
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{doctor.name}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{doctor.specialization || 'General Medicine'}</p>
                </div>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">{doctor.email}</p>
              {doctor._id === user()?.id && (
                <span className="inline-block mt-2 px-2 py-1 text-xs bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400 rounded-full">
                  You
                </span>
              )}
            </div>
          ))}
          {doctors.length === 0 && (
            <div className="col-span-full text-center py-8">
              <i data-lucide="users" className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3"></i>
              <p className="text-gray-500 dark:text-gray-400">No doctors found</p>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Appointment Requests */}
          <div className="card card-hover" data-aos="fade-up">
            <div className="flex items-center space-x-2 mb-6">
              <i data-lucide="clock" className="w-5 h-5 text-teal-600"></i>
              <h2 className="text-xl font-semibold text-gray-900">Appointment Requests</h2>
            </div>
            <div className="space-y-4">
              {appointments
                .filter(a => a.status === "pending" || a.status === "rescheduled")
                .map((a) => (
                  <div key={a._id} className="p-4 bg-yellow-50 rounded-lg border-l-4 border-yellow-500">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-medium text-gray-900">{a.patient?.name || "Patient"}</p>
                        <p className="text-sm text-gray-600">Reason: {a.reason}</p>
                        <p className="text-sm text-gray-600">Age: {a.age} | Weight: {a.weight} kg</p>
                        <p className="text-sm text-gray-600">Severity: {renderSeverity(a.severity || 0)}</p>
                        <p className="text-sm text-yellow-600">{new Date(a.datetime).toLocaleString()}</p>
                      </div>
                      <span className="text-xs px-2 py-1 rounded bg-yellow-200 text-yellow-800">{a.status}</span>
                    </div>
                    <div className="flex space-x-2">
                      {a.status === "pending" && (
                        <button
                          onClick={() => updateStatus(a._id, "accepted")}
                          disabled={remainingToday === 0}
                          className={`btn-primary text-sm ${remainingToday === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          Accept
                        </button>
                      )}
                      <button
                        onClick={async () => {
                          const link = window.prompt("Optional: Paste new Google Meet link (leave blank to keep)") || "";
                          await updateStatus(a._id, "rescheduled", link.trim() || undefined);
                        }}
                        className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-1 rounded text-sm"
                      >
                        Reschedule
                      </button>
                      <button
                        onClick={() => setOpenChat(a._id)}
                        className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs transition ${
                          openChat === a._id
                            ? 'border-teal-600 bg-teal-600 text-white'
                            : 'border-teal-200 bg-teal-50 text-teal-700 hover:bg-teal-100'
                        }`}
                      >
                        <i data-lucide="message-circle" className="w-3 h-3"></i>
                        {openChat === a._id ? 'Chat Open' : 'Chat'}
                      </button>
                      <button
                        onClick={() => toggleNotes(a._id)}
                        className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-1 rounded text-sm"
                      >
                        Notes
                      </button>
                      <button
                        onClick={() => updateStatus(a._id, "declined")}
                        className="bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1 rounded text-sm"
                      >
                        Decline
                      </button>
                    </div>

                    {openNotes[a._id] && (
                      <div className="mt-3 border-t pt-3">
                        <h4 className="text-sm font-semibold mb-2">Notes</h4>
                        <div className="space-y-2 max-h-32 overflow-y-auto">
                          {(a.notes || []).map((n, idx) => (
                            <div key={idx} className="text-sm text-gray-700">
                              <span className="font-medium">Note:</span> {n.text}
                              <span className="ml-2 text-xs text-gray-500">
                                {n.createdAt ? new Date(n.createdAt).toLocaleString() : ''}
                              </span>
                            </div>
                          ))}
                          {(!a.notes || a.notes.length === 0) && (
                            <p className="text-sm text-gray-500">No notes yet.</p>
                          )}
                        </div>
                        <div className="mt-2 flex space-x-2">
                          <input
                            value={noteInputs[a._id] || ""}
                            onChange={(e) => setNoteInputs(prev => ({ ...prev, [a._id]: e.target.value }))}
                            placeholder="Add a note"
                            className="flex-1 border px-2 py-1 rounded text-sm"
                          />
                          <button
                            onClick={() => addNote(a._id)}
                            className="btn-primary px-3 py-1 text-sm"
                          >
                            Add
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
            </div>
          </div>

          {/* Live Call */}
          {openCall && (
            <div className="card card-hover" data-aos="zoom-in">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold">Live Call</h2>
                <button onClick={() => setOpenCall(null)} className="text-sm px-3 py-1 rounded bg-gray-100 hover:bg-gray-200">Close</button>
              </div>
              {(() => {
                const appt = appointments.find(x => x._id === openCall);
                if (!appt || !appt.meetingLink || !String(appt.meetingLink).startsWith('jitsi:')) return null;
                const room = String(appt.meetingLink).replace('jitsi:', '');
                return (
                  <div className="rounded overflow-hidden border">
                    <iframe
                      title={`call-${openCall}`}
                      src={`https://meet.jit.si/${room}`}
                      allow="camera; microphone; fullscreen; display-capture; autoplay"
                      className="w-full"
                      style={{ height: 480 }}
                    />
                  </div>
                );
              })()}
            </div>
          )}

          {/* Chat */}
          {openChat && (
            <div className="card card-hover" data-aos="fade-up">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold">Chat</h2>
                <button onClick={() => setOpenChat(null)} className="text-sm px-3 py-1 rounded bg-gray-100 hover:bg-gray-200">Close</button>
              </div>
              {(() => {
                const appt = appointments.find(x => x._id === openChat);
                if (!appt || appt.status === 'completed' || appt.status === 'declined') {
                  return <p className="text-sm text-gray-500">Chat closed for this appointment.</p>;
                }
                return (
                  <div>
                    <div className="space-y-1 max-h-64 overflow-y-auto border rounded p-3">
                      {(appt.messages || []).map((m, idx) => (
                        <div key={idx} className="text-sm text-gray-700">
                          <span className="text-gray-500 mr-1">
                            {m.createdAt ? new Date(m.createdAt).toLocaleTimeString() : ''}
                          </span>
                          {m.text}
                        </div>
                      ))}
                    </div>
                    <div className="mt-2 flex space-x-2">
                      <input
                        value={chatInputs[openChat] || ""}
                        onChange={(e) => setChatInputs(prev => ({ ...prev, [openChat]: e.target.value }))}
                        placeholder="Type a message"
                        className="flex-1 border px-2 py-1 rounded text-sm"
                      />
                      <button onClick={() => sendChat(openChat)} className="btn-primary px-3 py-1 text-sm">Send</button>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Today's Schedule */}
          {!openCall && !openChat && (
            <div className="card card-hover" data-aos="fade-left">
              <div className="mb-4">
                <div className="flex items-center space-x-2 mb-2">
                  <i data-lucide="calendar" className="w-5 h-5 text-teal-600"></i>
                  <h2 className="text-xl font-semibold">Today's Schedule</h2>
                </div>
                <div className="flex space-x-2">
                  <span className="px-2 py-1 rounded bg-teal-100 text-teal-700 text-sm">
                    {todaysAcceptedCount}/{DAILY_LIMIT} scheduled • {remainingToday} left today
                  </span>
                  <span className="px-2 py-1 rounded bg-emerald-100 text-emerald-700 text-sm">
                    {todaysCompletedCount} attended today
                  </span>
                </div>
              </div>
              <div className="space-y-3">
                {appointments
                  .filter(a => a.status === "accepted")
                  .map(a => (
                    <div key={a._id} className="p-3 bg-green-50 rounded-lg border-l-4 border-green-500">
                      <p className="font-medium">{a.patient?.name}</p>
                      <p className="text-sm text-gray-600">{a.reason}</p>
                      <p className="text-sm text-gray-600">Age: {a.age} | Weight: {a.weight} kg</p>
                      <p className="text-sm text-gray-600">Severity: {renderSeverity(a.severity || 0)}</p>
                      <p className="text-sm text-green-600">{new Date(a.datetime).toLocaleString()}</p>

                      {a.meetingLink && (
                        <div className="flex items-center space-x-2 mt-1">
                          {String(a.meetingLink).startsWith('jitsi:') ? (
                            <button
                              onClick={() => setOpenCall(a._id)}
                              className="text-xs px-2 py-1 rounded bg-teal-600 text-white hover:bg-teal-700"
                            >
                              Open Call
                            </button>
                          ) : (
                            <a
                              href={a.meetingLink}
                              target="_blank"
                              rel="noreferrer"
                              className="text-teal-600 hover:underline text-sm"
                            >
                              Join Meeting
                            </a>
                          )}
                          <button
                            onClick={() => setOpenChat(a._id)}
                            className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs transition ${
                              openChat === a._id
                                ? 'border-teal-600 bg-teal-600 text-white'
                                : 'border-teal-200 bg-teal-50 text-teal-700 hover:bg-teal-100'
                            }`}
                          >
                            <i data-lucide="message-circle" className="w-3 h-3"></i>
                            {openChat === a._id ? 'Chat Open' : 'Chat'}
                          </button>
                          <button
                            onClick={() => updateStatus(a._id, "completed")}
                            className="text-xs px-2 py-1 rounded bg-gray-200 hover:bg-gray-300"
                          >
                            Done
                          </button>
                        </div>
                      )}

                      <div className="mt-3">
                        <button
                          onClick={() => toggleNotes(a._id)}
                          className="text-xs px-2 py-1 rounded bg-gray-100 hover:bg-gray-200"
                        >
                          {openNotes[a._id] ? 'Hide Notes' : 'Show Notes'}
                        </button>
                        {openNotes[a._id] && (
                          <div className="mt-2">
                            <div className="space-y-2 max-h-32 overflow-y-auto">
                              {(a.notes || []).map((n, idx) => (
                                <div key={idx} className="text-sm text-gray-700">
                                  <span className="font-medium">Note:</span> {n.text}
                                  <span className="ml-2 text-xs text-gray-500">
                                    {n.createdAt ? new Date(n.createdAt).toLocaleString() : ''}
                                  </span>
                                </div>
                              ))}
                              {(!a.notes || a.notes.length === 0) && (
                                <p className="text-sm text-gray-500">No notes yet.</p>
                              )}
                            </div>
                            <div className="mt-2 flex space-x-2">
                              <input
                                value={noteInputs[a._id] || ""}
                                onChange={(e) => setNoteInputs(prev => ({ ...prev, [a._id]: e.target.value }))}
                                placeholder="Add a note"
                                className="flex-1 border px-2 py-1 rounded text-sm"
                              />
                              <button onClick={() => addNote(a._id)} className="btn-primary px-3 py-1 text-sm">Add</button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* History */}
          <div className="card card-hover" data-aos="fade-left" data-aos-delay="100">
            <div className="flex items-center space-x-2 mb-6">
              <i data-lucide="history" className="w-5 h-5 text-teal-600"></i>
              <h2 className="text-xl font-semibold">History</h2>
            </div>
            <div className="space-y-3">
              {appointments
                .filter(a => a.status === "completed" || a.status === "declined")
                .map(a => (
                  <div key={a._id} className="p-3 bg-gray-50 rounded-lg border-l-4 border-gray-400">
                    <p className="font-medium">{a.patient?.name}</p>
                    <p className="text-sm text-gray-600">{a.reason}</p>
                    <p className="text-sm text-gray-600">{new Date(a.datetime).toLocaleString()}</p>
                    <span className="text-xs uppercase">{a.status}</span>
                  </div>
                ))}
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 gap-6">
            <div className="card card-hover" data-aos="fade-left" data-aos-delay="200">
              <div className="flex items-center space-x-2 mb-6">
                <i data-lucide="heart" className="w-5 h-5 text-teal-600"></i>
                <h2 className="text-xl font-semibold">Patient Vitals</h2>
              </div>
              <canvas ref={vitalsChartRef} height="200"></canvas>
            </div>

            <div className="card card-hover" data-aos="fade-left" data-aos-delay="300">
              <div className="flex items-center space-x-2 mb-6">
                <i data-lucide="activity" className="w-5 h-5 text-teal-600"></i>
                <h2 className="text-xl font-semibold">Blood Pressure</h2>
              </div>
              <canvas ref={bpChartRef} height="200"></canvas>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card card-hover" data-aos="fade-left" data-aos-delay="400">
            <div className="flex items-center space-x-2 mb-6">
              <i data-lucide="zap" className="w-5 h-5 text-teal-600"></i>
              <h2 className="text-xl font-semibold">Quick Actions</h2>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={startVideoCall} className="p-3 bg-teal-100 hover:bg-teal-200 rounded-lg">
                <i data-lucide="video" className="w-6 h-6 text-teal-600 mb-2"></i>
                <p className="text-sm font-medium">Video Call</p>
              </button>
              <button className="p-3 bg-green-100 hover:bg-green-200 rounded-lg">
                <i data-lucide="file-text" className="w-6 h-6 text-green-600 mb-2"></i>
                <p className="text-sm font-medium">Reports</p>
              </button>
              <button className="p-3 bg-purple-100 hover:bg-purple-200 rounded-lg">
                <i data-lucide="prescription" className="w-6 h-6 text-purple-600 mb-2"></i>
                <p className="text-sm font-medium">E-Prescribe</p>
              </button>
              <button className="p-3 bg-red-100 hover:bg-red-200 rounded-lg">
                <i data-lucide="clipboard-list" className="w-6 h-6 text-red-600 mb-2"></i>
                <p className="text-sm font-medium">Notes</p>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
