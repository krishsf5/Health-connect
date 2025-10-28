import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";

const getApiUrl = () => {
  if (typeof window !== "undefined" && window.location.hostname.includes("vercel.app")) {
    return `${window.location.origin}/api`;
  }
  return import.meta.env.VITE_API_URL || "http://localhost:5000/api";
};

const API = getApiUrl();
const token = () => localStorage.getItem("token");
const user = () => JSON.parse(localStorage.getItem("user") || "null");

const languages = {
  en: {
    title: "Patient Notes",
    description: "Create and manage notes for your patients in one place.",
    search_placeholder: "Search patients by name or email...",
    filter_all: "All Patients",
    filter_active: "Active",
    filter_history: "History",
    no_patients_found: "No patients found.",
    select_patient_prompt: "Select a patient to view notes.",
    add_note: "Add Note",
    add_note_placeholder: "Write your note...",
    add_note_title_placeholder: "Optional title",
    save: "Save",
    cancel: "Cancel",
    delete: "Delete",
    no_notes: "No notes yet.",
    created_at: (date) => `Created ${date}`,
    notes_for: (name) => `${name}'s Notes`,
    new_note: "New Note",
    loading: "Loading...",
    error_loading_notes: "Failed to load notes.",
  },
  hi: {
    title: "मरीज नोट्स",
    description: "अपने मरीजों के लिए नोट्स यहाँ प्रबंधित करें।",
    search_placeholder: "नाम या ईमेल से मरीज खोजें...",
    filter_all: "सभी",
    filter_active: "सक्रिय",
    filter_history: "इतिहास",
    no_patients_found: "कोई मरीज नहीं मिला।",
    select_patient_prompt: "नोट्स देखने के लिए मरीज चुनें।",
    add_note: "नोट जोड़ें",
    add_note_placeholder: "अपना नोट लिखें...",
    add_note_title_placeholder: "वैकल्पिक शीर्षक",
    save: "सहेजें",
    cancel: "रद्द करें",
    delete: "हटाएं",
    no_notes: "अभी कोई नोट नहीं।",
    created_at: (date) => `${date} को बनाया गया`,
    notes_for: (name) => `${name} के नोट्स`,
    new_note: "नया नोट",
    loading: "लोड हो रहा है...",
    error_loading_notes: "नोट्स लोड करने में असफल।",
  },
  mr: {
    title: "रुग्ण नोंदी",
    description: "आपल्या रुग्णांसाठी नोंदी येथे व्यवस्थापित करा.",
    search_placeholder: "नाव किंवा ईमेलने रुग्ण शोधा...",
    filter_all: "सर्व",
    filter_active: "सक्रिय",
    filter_history: "इतिहास",
    no_patients_found: "कोणताही रुग्ण सापडला नाही.",
    select_patient_prompt: "नोंदी पाहण्यासाठी रुग्ण निवडा.",
    add_note: "नोंद जोडा",
    add_note_placeholder: "आपली नोंद लिहा...",
    add_note_title_placeholder: "ऐच्छिक शीर्षक",
    save: "जतन करा",
    cancel: "रद्द करा",
    delete: "हटवा",
    no_notes: "अजून कोणतीही नोंद नाही.",
    created_at: (date) => `${date} रोजी तयार केले`,
    notes_for: (name) => `${name} यांच्या नोंदी`,
    new_note: "नवी नोंद",
    loading: "लोड होत आहे...",
    error_loading_notes: "नोंदी लोड करण्यात अयशस्वी.",
  },
};

export default function DoctorNotes() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("active");
  const [notes, setNotes] = useState([]);
  const [loadingNotes, setLoadingNotes] = useState(false);
  const [notesError, setNotesError] = useState("");
  const [newNote, setNewNote] = useState({ title: "", content: "" });
  const [saving, setSaving] = useState(false);
  const [deletingNoteId, setDeletingNoteId] = useState(null);
  const { lang, setLang } = useLanguage();

  const t = useMemo(() => languages[lang] || languages.en, [lang]);

  useEffect(() => {
    fetchPatients();
  }, []);

  useEffect(() => {
    filterPatients();
  }, [patients, search, filter]);

  useEffect(() => {
    if (selectedPatient) {
      loadNotes(selectedPatient._id);
      setSearchParams({ patientId: selectedPatient._id }, { replace: true });
    } else {
      setNotes([]);
    }
  }, [selectedPatient]);

  useEffect(() => {
    const paramId = searchParams.get("patientId");
    if (paramId && patients.length > 0) {
      const match = patients.find((p) => p._id === paramId);
      if (match && (!selectedPatient || selectedPatient._id !== paramId)) {
        setSelectedPatient(match);
      }
    }
  }, [searchParams, patients]);

  const fetchPatients = async () => {
    try {
      const res = await fetch(`${API}/appointments/me`, {
        headers: { Authorization: `Bearer ${token()}` },
      });
      if (res.ok) {
        const data = await res.json();
        const appts = Array.isArray(data) ? data : data.appointments || [];
        const map = new Map();
        appts.forEach((appt) => {
          if (!appt.patient) return;
          const entry = map.get(appt.patient._id) || {
            ...appt.patient,
            hasActive: false,
            hasHistory: false,
            latestAppointment: null,
          };
          if (appt.status === "accepted" || appt.status === "pending" || appt.status === "rescheduled") {
            entry.hasActive = true;
          }
          if (appt.status === "completed" || appt.status === "declined") {
            entry.hasHistory = true;
          }
          const apptDate = appt.datetime ? new Date(appt.datetime) : null;
          if (apptDate && (!entry.latestAppointment || apptDate > entry.latestAppointment)) {
            entry.latestAppointment = apptDate;
          }
          map.set(appt.patient._id, entry);
        });
        const patientsList = Array.from(map.values()).sort((a, b) => {
          const dateA = a.latestAppointment ? a.latestAppointment.getTime() : 0;
          const dateB = b.latestAppointment ? b.latestAppointment.getTime() : 0;
          return dateB - dateA;
        });
        setPatients(patientsList);
        const paramId = searchParams.get("patientId");
        if (paramId) {
          const matched = patientsList.find((p) => p._id === paramId);
          if (matched) {
            setSelectedPatient(matched);
          } else if (patientsList.length > 0) {
            setSelectedPatient(patientsList[0]);
            setSearchParams({}, { replace: true });
          } else {
            setSelectedPatient(null);
          }
        } else if (!selectedPatient && patientsList.length > 0) {
          setSelectedPatient(patientsList[0]);
        }
      }
    } catch (error) {
      console.error("Fetch patients error:", error);
    }
  };

  const filterPatients = () => {
    let list = patients;
    if (filter === "active") {
      list = list.filter((p) => p.hasActive);
    } else if (filter === "history") {
      list = list.filter((p) => p.hasHistory);
    }
    if (search.trim()) {
      const term = search.toLowerCase();
      list = list.filter(
        (p) =>
          (p.name && p.name.toLowerCase().includes(term)) ||
          (p.email && p.email.toLowerCase().includes(term))
      );
    }
    setFilteredPatients(list);
    if (list.length === 0) {
      setSelectedPatient(null);
      setSearchParams({}, { replace: true });
    } else if (selectedPatient && !list.find((p) => p._id === selectedPatient._id)) {
      const next = list[0];
      setSelectedPatient(next);
      setSearchParams(next ? { patientId: next._id } : {}, { replace: true });
    }
  };

  const loadNotes = async (patientId) => {
    setLoadingNotes(true);
    setNotesError("");
    try {
      const res = await fetch(`${API}/patient-notes/patient/${patientId}`, {
        headers: { Authorization: `Bearer ${token()}` },
      });
      if (res.ok) {
        const data = await res.json();
        setNotes(Array.isArray(data) ? data : []);
      } else {
        setNotes([]);
        setNotesError(t.error_loading_notes);
      }
    } catch (error) {
      console.error("Load notes error:", error);
      setNotes([]);
      setNotesError(t.error_loading_notes);
    } finally {
      setLoadingNotes(false);
    }
  };

  const handleSaveNote = async () => {
    if (!selectedPatient) return;
    const content = newNote.content.trim();
    if (!content) return;
    setSaving(true);
    try {
      const res = await fetch(`${API}/patient-notes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token()}`,
        },
        body: JSON.stringify({
          patientId: selectedPatient._id,
          title: newNote.title?.trim() || undefined,
          content,
        }),
      });
      if (res.ok) {
        const created = await res.json();
        setNotes((prev) => [created, ...prev]);
        setNewNote({ title: "", content: "" });
      }
    } catch (error) {
      console.error("Save note error:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteNote = async (noteId) => {
    if (!noteId || !selectedPatient) return;
    setDeletingNoteId(noteId);
    try {
      const res = await fetch(`${API}/patient-notes/${noteId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token()}` },
      });
      if (res.ok) {
        setNotes((prev) => prev.filter((n) => n._id !== noteId));
      }
    } catch (error) {
      console.error("Delete note error:", error);
    } finally {
      setDeletingNoteId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 p-6 lg:p-10">
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t.title}</h1>
            <p className="text-gray-600 dark:text-slate-400">{t.description}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setLang("en")}
              className={`px-3 py-1 rounded ${
                lang === "en"
                  ? "bg-teal-600 text-white"
                  : "bg-gray-200 text-gray-700 dark:bg-slate-700 dark:text-slate-200"
              }`}
            >
              EN
            </button>
            <button
              onClick={() => setLang("hi")}
              className={`px-3 py-1 rounded ${
                lang === "hi"
                  ? "bg-teal-600 text-white"
                  : "bg-gray-200 text-gray-700 dark:bg-slate-700 dark:text-slate-200"
              }`}
            >
              हिं
            </button>
            <button
              onClick={() => setLang("mr")}
              className={`px-3 py-1 rounded ${
                lang === "mr"
                  ? "bg-teal-600 text-white"
                  : "bg-gray-200 text-gray-700 dark:bg-slate-700 dark:text-slate-200"
              }`}
            >
              म
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <aside className="lg:col-span-1 bg-white dark:bg-slate-800 rounded-2xl shadow">
            <div className="p-4 border-b border-gray-200 dark:border-slate-700">
              <div className="relative">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={t.search_placeholder}
                  className="w-full border border-gray-300 dark:border-slate-600 rounded-lg pl-10 pr-4 py-2 bg-white dark:bg-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500"
                />
                <i data-lucide="search" className="w-5 h-5 text-gray-400 absolute left-3 top-2.5"></i>
              </div>
              <div className="flex gap-2 mt-4 text-sm">
                <button
                  onClick={() => setFilter("active")}
                  className={`flex-1 px-3 py-1.5 rounded-lg ${
                    filter === "active"
                      ? "bg-teal-600 text-white"
                      : "bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300"
                  }`}
                >
                  {t.filter_active}
                </button>
                <button
                  onClick={() => setFilter("history")}
                  className={`flex-1 px-3 py-1.5 rounded-lg ${
                    filter === "history"
                      ? "bg-teal-600 text-white"
                      : "bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300"
                  }`}
                >
                  {t.filter_history}
                </button>
                <button
                  onClick={() => setFilter("all")}
                  className={`flex-1 px-3 py-1.5 rounded-lg ${
                    filter === "all"
                      ? "bg-teal-600 text-white"
                      : "bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300"
                  }`}
                >
                  {t.filter_all}
                </button>
              </div>
            </div>
            <div className="max-h-[60vh] overflow-y-auto divide-y divide-gray-200 dark:divide-slate-700">
              {filteredPatients.length === 0 ? (
                <div className="p-6 text-center text-sm text-gray-500 dark:text-slate-400">
                  {t.no_patients_found}
                </div>
              ) : (
                filteredPatients.map((patient) => (
                  <button
                    key={patient._id}
                    onClick={() => {
                      setSelectedPatient(patient);
                      setSearchParams({ patientId: patient._id }, { replace: true });
                    }}
                    className={`w-full text-left p-4 transition ${
                      selectedPatient?._id === patient._id
                        ? "bg-teal-50 dark:bg-teal-900/20 border-l-4 border-teal-600"
                        : "hover:bg-gray-50 dark:hover:bg-slate-700"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-teal-400 to-teal-600 rounded-full flex items-center justify-center text-white shadow">
                        <i data-lucide="user" className="w-5 h-5"></i>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{patient.name}</p>
                        <p className="text-xs text-gray-500 dark:text-slate-400">{patient.email}</p>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </aside>

          <section className="lg:col-span-2 space-y-6">
            {!selectedPatient ? (
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow p-10 text-center text-gray-500 dark:text-slate-400">
                <i data-lucide="notebook" className="w-12 h-12 mx-auto mb-4"></i>
                <p>{t.select_patient_prompt}</p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow p-6">
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                        {t.notes_for(selectedPatient.name || "Patient")}
                      </h2>
                      <p className="text-sm text-gray-500 dark:text-slate-400">
                        {selectedPatient.email}
                      </p>
                    </div>
                    <div className="w-full md:w-80 bg-gray-50 dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-700 p-4 space-y-2">
                      <h3 className="text-sm font-medium text-gray-700 dark:text-slate-200 flex items-center gap-2">
                        <i data-lucide="plus-circle" className="w-4 h-4"></i>
                        {t.new_note}
                      </h3>
                      <input
                        value={newNote.title}
                        onChange={(e) => setNewNote((prev) => ({ ...prev, title: e.target.value }))}
                        placeholder={t.add_note_title_placeholder}
                        className="w-full border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-2 bg-white dark:bg-slate-900 dark:text-white text-sm"
                      />
                      <textarea
                        value={newNote.content}
                        onChange={(e) => setNewNote((prev) => ({ ...prev, content: e.target.value }))}
                        placeholder={t.add_note_placeholder}
                        rows={3}
                        className="w-full border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-2 bg-white dark:bg-slate-900 dark:text-white text-sm resize-none"
                      ></textarea>
                      <button
                        onClick={handleSaveNote}
                        disabled={saving || !newNote.content.trim()}
                        className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-teal-600 text-white hover:bg-teal-700 disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        <i data-lucide="save" className="w-4 h-4"></i>
                        {saving ? t.loading : t.add_note}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow p-6">
                  {loadingNotes ? (
                    <div className="flex items-center justify-center text-gray-500 dark:text-slate-400 gap-2">
                      <i data-lucide="loader" className="w-5 h-5 animate-spin"></i>
                      <span>{t.loading}</span>
                    </div>
                  ) : notesError ? (
                    <div className="text-sm text-red-500">{notesError}</div>
                  ) : notes.length === 0 ? (
                    <div className="text-center text-gray-500 dark:text-slate-400 py-10">
                      <i data-lucide="notebook" className="w-10 h-10 mx-auto mb-3"></i>
                      <p>{t.no_notes}</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {notes.map((note) => (
                        <div key={note._id} className="border border-gray-200 dark:border-slate-700 rounded-xl p-4 bg-gray-50 dark:bg-slate-900">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              {note.title && (
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                                  {note.title}
                                </h3>
                              )}
                              <p className="text-sm text-gray-700 dark:text-slate-300 whitespace-pre-wrap">
                                {note.content}
                              </p>
                              <p className="mt-2 text-xs text-gray-500 dark:text-slate-500">
                                {t.created_at(note.createdAt ? new Date(note.createdAt).toLocaleString() : "")}
                              </p>
                            </div>
                            <button
                              onClick={() => handleDeleteNote(note._id)}
                              disabled={deletingNoteId === note._id}
                              className="text-red-500 hover:text-red-600 text-sm"
                            >
                              {deletingNoteId === note._id ? (
                                <i data-lucide="loader" className="w-4 h-4 animate-spin"></i>
                              ) : (
                                <i data-lucide="trash-2" className="w-4 h-4"></i>
                              )}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
