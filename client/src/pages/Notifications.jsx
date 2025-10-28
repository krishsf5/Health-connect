import React from "react";
import { useNavigate } from "react-router-dom";
import { useNotifications } from "../context/NotificationContext";
import { useLanguage } from "../context/LanguageContext";

const labels = {
  en: {
    title: "Notifications",
    unread: "Unread",
    read: "Read",
    mark_all: "Mark all as read",
    mark_read: "Mark as read",
    empty: "No notifications yet.",
    message: "Message",
    appointment: "Appointment",
    report: "Report",
    general: "General",
    view: "View",
  },
  hi: {
    title: "सूचनाएं",
    unread: "अपठित",
    read: "पढ़ा",
    mark_all: "सभी पढ़ा चिह्नित करें",
    mark_read: "पढ़ा चिह्नित करें",
    empty: "अभी कोई सूचना नहीं।",
    message: "संदेश",
    appointment: "अपॉइंटमेंट",
    report: "रिपोर्ट",
    general: "सामान्य",
    view: "देखें",
  },
  mr: {
    title: "सूचना",
    unread: "न वाचलेले",
    read: "वाचलेले",
    mark_all: "सर्व वाचले म्हणून चिन्हांकित करा",
    mark_read: "वाचले म्हणून चिन्हांकित करा",
    empty: "अजून कोणतीही सूचना नाही.",
    message: "संदेश",
    appointment: "अपॉइंटमेंट",
    report: "अहवाल",
    general: "सामान्य",
    view: "पहा",
  },
};

export default function NotificationsPage() {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const { lang } = useLanguage();
  const t = labels[lang] || labels.en;
  const navigate = useNavigate();

  const unread = notifications.filter((n) => !n.read);
  const read = notifications.filter((n) => n.read);

  const handleNavigate = (item) => {
    const appointmentId = item.data?.appointmentId;
    if (!appointmentId) return;
    const base = item.type === 'message' ? '/patient/messages' : '/doctor/messages';
    navigate(`${base}?appointmentId=${appointmentId}`);
  };

  const renderList = (items, title) => (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow border border-gray-100 dark:border-slate-700">
      <div className="px-4 py-3 border-b border-gray-100 dark:border-slate-700">
        <h2 className="text-sm font-semibold text-gray-800 dark:text-white uppercase tracking-wide">{title}</h2>
      </div>
      {items.length === 0 ? (
        <div className="px-4 py-8 text-center text-sm text-gray-500 dark:text-slate-400">{t.empty}</div>
      ) : (
        <ul className="divide-y divide-gray-100 dark:divide-slate-700">
          {items.map((item) => (
            <li
              key={item._id || item.id}
              className={`px-4 py-3 flex items-start gap-3 hover:bg-gray-50 dark:hover:bg-slate-700/60 transition ${
                !item.read ? 'bg-yellow-50/50 dark:bg-yellow-900/10' : ''
              }`}
              onClick={() => {
                if (!item.read) markAsRead(item._id || item.id);
                handleNavigate(item);
              }}
            >
              <div className="mt-1" title={item.type}>
                <i
                  data-lucide={item.type === 'message' ? 'message-circle' : item.type === 'appointment' ? 'calendar' : item.type === 'report' ? 'file-text' : 'bell'}
                  className="w-5 h-5 text-teal-600 dark:text-teal-300"
                ></i>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{item.title}</p>
                  <span className="ml-3 text-xs text-gray-500 dark:text-slate-400">
                    {item.createdAt ? new Date(item.createdAt).toLocaleString() : ""}
                  </span>
                </div>
                <p className="mt-1 text-sm text-gray-600 dark:text-slate-300 break-words whitespace-pre-wrap">
                  {item.body}
                </p>
              </div>
              {!item.read && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    markAsRead(item._id || item.id);
                  }}
                  className="ml-3 text-xs text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300"
                >
                  {t.mark_read}
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 p-6 lg:p-10">
      <div className="max-w-5xl mx-auto space-y-6">
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t.title}</h1>
            <p className="text-sm text-gray-500 dark:text-slate-400">{unreadCount} {t.unread}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={markAllAsRead}
              disabled={unreadCount === 0}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-teal-600 text-white hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t.mark_all}
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {renderList(unread, t.unread)}
          {renderList(read, t.read)}
        </div>
      </div>
    </div>
  );
}
