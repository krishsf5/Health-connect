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
  const [user, setUserState] = useState(() => {
    const u = localStorage.getItem("user");
    const parsedUser = u ? JSON.parse(u) : null;
    console.log('🔐 App initialized with user:', parsedUser);
    if (parsedUser) {
      console.log('👤 User role:', parsedUser.role);
    }
    return parsedUser;
  });
  
  // Wrapper to log user changes
  const setUser = (newUser) => {
    console.log('🔄 setUser called with:', newUser);
    if (newUser) {
      console.log('  ├─ Name:', newUser.name);
      console.log('  ├─ Email:', newUser.email);
      console.log('  ├─ Role:', newUser.role);
      console.log('  └─ Specialization:', newUser.specialization);
    }
    setUserState(newUser);
  };
  
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "system");

  const navigate = useNavigate();
  const location = useLocation();

  // Apply theme to html element and watch system preference
  useEffect(() => {
    const root = document.documentElement;
    const media = window.matchMedia('(prefers-color-scheme: dark)');

    const apply = () => {
      const systemDark = media.matches;
      const resolved = theme === 'system' ? (systemDark ? 'dark' : 'light') : theme;
      root.classList.toggle('dark', resolved === 'dark');
    };

    apply();
    localStorage.setItem('theme', theme);
    if (theme === 'system') {
      media.addEventListener('change', apply);
      return () => media.removeEventListener('change', apply);
    }
  }, [theme]);

  useEffect(() => {
    console.log('🚦 Route check:', {
      pathname: location.pathname,
      userRole: user?.role,
      userName: user?.name
    });

    // Allow both /doctor/create and /doctor-create for doctor registration
    if (location.pathname === "/doctor/create" || location.pathname === "/doctor-create") return;

    // Define valid routes for each user role
    const validPatientRoutes = ["/patient", "/patient/appointments", "/patient/messages", "/patient/reports", "/patient/settings"];
    const validDoctorRoutes = ["/doctor", "/doctor/appointments", "/doctor/messages", "/doctor/reports", "/doctor/settings"];
    const publicRoutes = ["/login", "/doctor/create", "/doctor-create"];

    if (user) {
      const validRoutes = user.role === "doctor" ? validDoctorRoutes : validPatientRoutes;
      console.log('✅ User logged in:', user.role);
      console.log('📍 Valid routes for', user.role + ':', validRoutes);
      console.log('🔍 Current path:', location.pathname);
      
      if (!validRoutes.includes(location.pathname)) {
        const redirectTo = user.role === "doctor" ? "/doctor" : "/patient";
        console.log('🔀 Redirecting to:', redirectTo);
        // Redirect to appropriate dashboard if on invalid route
        navigate(redirectTo);
      } else {
        console.log('✓ Path is valid for user role');
      }
    } else {
      console.log('❌ No user logged in');
      // Allow public routes (login, doctor creation)
      if (!publicRoutes.includes(location.pathname)) {
        console.log('🔀 Redirecting to login');
        // Everyone uses the same /login page - it routes based on role automatically
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

  const cycleTheme = () => {
    setTheme((t) => (t === 'light' ? 'dark' : t === 'dark' ? 'system' : 'light'));
  };
  const themeIcon = theme === 'system' ? 'Laptop' : theme === 'dark' ? 'Moon' : 'Sun';
  const themeLabel = theme === 'system' ? 'System' : theme === 'dark' ? 'Dark' : 'Light';

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

  const isDarkMode = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  return (
    <div className="flex h-screen dashboard-bg">
      {/* Sidebar */}
      <div className="sidebar flex flex-col">
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-3 sm:px-4 border-b border-gray-200 gap-2">
          <div className="flex items-center space-x-2 min-w-0 flex-1">
            <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <i data-lucide="heart-pulse" className="w-5 h-5 text-white"></i>
            </div>
            <span className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white whitespace-nowrap truncate">Health Connect</span>
          </div>
          <label className="theme-toggle" title={`Theme: ${themeLabel}`}>
            <input
              type="checkbox"
              checked={isDarkMode}
              readOnly
              className="sr-only"
            />
            <div
              className={`theme-toggle-track ${isDarkMode ? 'active' : ''}`}
              onClick={cycleTheme}
            >
              <div className={`theme-toggle-thumb ${isDarkMode ? 'active' : ''}`}>
                <i
                  data-lucide={themeIcon}
                  className="theme-toggle-icon w-3 h-3"
                ></i>
              </div>
            </div>
            <span className="hidden lg:inline ml-2 text-sm font-medium text-gray-700 dark:text-gray-200 cursor-pointer" onClick={cycleTheme}>
              {themeLabel}
            </span>
          </label>
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
              <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                <i data-lucide="user" className="w-4 h-4 text-gray-600 dark:text-gray-300"></i>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{user.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-300 capitalize">{user.role}</p>
              </div>
            </div>
          ) : (
            <div className="mb-3">
              <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-2">
                <i data-lucide="user" className="w-4 h-4 text-gray-500 dark:text-gray-400"></i>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-300 text-center">Guest</p>
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
            <Route path="/doctor/create" element={<DoctorCreate onLogin={setUser} />} />
            <Route path="/doctor-create" element={<DoctorCreate onLogin={setUser} />} />
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
