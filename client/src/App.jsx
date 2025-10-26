import React, { useEffect, useState } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import Login from "./pages/Login";
import PatientDashboard from "./pages/PatientDashboard";
import DoctorDashboard from "./pages/DoctorDashboard";
import DoctorCreate from "./pages/DoctorCreate";
import Appointments from "./pages/Appointments";
import Messages from "./pages/Messages";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";

export default function App() {
  const [user, setUser] = useState(() => {
    const u = localStorage.getItem("user");
    return u ? JSON.parse(u) : null;
  });

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.pathname === "/doctor/create") return; // allow public doctor creation page

    // Define valid routes for each user role
    const validPatientRoutes = ["/patient", "/patient/appointments", "/patient/messages", "/patient/reports", "/patient/settings"];
    const validDoctorRoutes = ["/doctor", "/doctor/appointments", "/doctor/messages", "/doctor/reports", "/doctor/settings"];

    if (user) {
      const validRoutes = user.role === "doctor" ? validDoctorRoutes : validPatientRoutes;
      if (!validRoutes.includes(location.pathname)) {
        // Redirect to appropriate dashboard if on invalid route
        navigate(user.role === "doctor" ? "/doctor" : "/patient");
      }
    } else {
      // Only allow login and doctor creation for non-authenticated users
      if (location.pathname !== "/login" && location.pathname !== "/doctor/create") {
        navigate("/login");
      }
    }
  }, [user, location.pathname]);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    navigate("/login");
  };

  const navigation = [
    { name: 'Dashboard', href: user?.role === 'doctor' ? '/doctor' : '/patient', icon: 'LayoutDashboard' },
    { name: 'Appointments', href: user?.role === 'doctor' ? '/doctor/appointments' : '/patient/appointments', icon: 'Calendar' },
    { name: 'Messages', href: user?.role === 'doctor' ? '/doctor/messages' : '/patient/messages', icon: 'MessageCircle' },
    { name: 'Reports', href: user?.role === 'doctor' ? '/doctor/reports' : '/patient/reports', icon: 'FileText' },
    { name: 'Settings', href: user?.role === 'doctor' ? '/doctor/settings' : '/patient/settings', icon: 'Settings' },
  ];

  const isActiveRoute = (href) => {
    return location.pathname === href;
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="sidebar flex flex-col">
        {/* Logo */}
        <div className="flex items-center justify-center h-16 px-4 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center">
              <i data-lucide="heart-pulse" className="w-5 h-5 text-white"></i>
            </div>
            <span className="text-xl font-bold text-gray-900">Health Connect</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navigation.map((item) => (
            <a
              key={item.name}
              href={item.href}
              onClick={(e) => {
                e.preventDefault();
                navigate(item.href);
              }}
              className={`nav-link ${isActiveRoute(item.href) ? 'nav-link-active' : ''}`}
            >
              <i data-lucide={item.icon} className="w-5 h-5"></i>
              <span className="font-medium">{item.name}</span>
            </a>
          ))}
        </nav>

        {/* User section */}
        <div className="p-4 border-t border-gray-200">
          {user ? (
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                <i data-lucide="user" className="w-4 h-4 text-gray-600"></i>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
                <p className="text-xs text-gray-500 capitalize">{user.role}</p>
              </div>
            </div>
          ) : (
            <div className="mb-3">
              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-2">
                <i data-lucide="user" className="w-4 h-4 text-gray-500"></i>
              </div>
              <p className="text-xs text-gray-500 text-center">Guest</p>
            </div>
          )}

          {user && (
            <button
              onClick={logout}
              className="w-full btn-primary text-sm"
            >
              <i data-lucide="log-out" className="w-4 h-4 mr-2"></i>
              Logout
            </button>
          )}

          {!user && location.pathname !== "/login" && (
            <button
              onClick={() => navigate("/login")}
              className="w-full btn-primary text-sm"
            >
              <i data-lucide="log-in" className="w-4 h-4 mr-2"></i>
              Login
            </button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto p-8">
          <Routes>
            <Route path="/login" element={<Login onLogin={setUser} />} />
            <Route path="/doctor/create" element={<DoctorCreate />} />
            <Route path="/patient" element={<PatientDashboard user={user} />} />
            <Route path="/doctor" element={<DoctorDashboard user={user} />} />
            <Route path="/patient/appointments" element={<Appointments user={user} />} />
            <Route path="/doctor/appointments" element={<Appointments user={user} />} />
            <Route path="/patient/messages" element={<Messages user={user} />} />
            <Route path="/doctor/messages" element={<Messages user={user} />} />
            <Route path="/patient/reports" element={<Reports user={user} />} />
            <Route path="/doctor/reports" element={<Reports user={user} />} />
            <Route path="/patient/settings" element={<Settings user={user} />} />
            <Route path="/doctor/settings" element={<Settings user={user} />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
