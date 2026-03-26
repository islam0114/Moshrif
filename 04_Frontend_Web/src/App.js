import React, { useState, useEffect } from "react";
import { 
  BrowserRouter as Router, 
  Routes, 
  Route, 
  NavLink, 
  Navigate
} from "react-router-dom";
import { 
  LayoutDashboard, 
  RefreshCw,           
  BookOpen,           
  Database, 
  ShieldCheck, 
  Sun, 
  Moon, 
  Contrast,
  LogOut,
  UserCog,
  GraduationCap,
  Lock,
  ArrowLeft
} from "lucide-react";

// --- Page Imports ---
import Overview from "./pages/Overview";
import LiveMonitor from "./pages/LiveMonitor";
import Courses from "./pages/Courses";
import AdminPanel from "./pages/AdminPanel";
import LoadingScreen from "./components/LoadingScreen";

// --- Styles ---
import "./App.css";

// ==========================================
// 🔐 شاشة تسجيل الدخول
// ==========================================
const LoginPage = ({ onLogin, theme }) => {
  const [step, setStep] = useState(1); 
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleAdminSubmit = () => {
    if (password === "admin") {
      onLogin("admin");
    } else {
      setError("Invalid credentials. Please try again.");
    }
  };

  return (
    <div className={`theme-${theme} login-wrapper`}>
      <div className="login-screen">
        <div className="login-card fade-in">
          
          <div className="logo" style={{ justifyContent: 'center', marginBottom: '15px' }}>
            <ShieldCheck size={45} color="var(--accent)" /> 
            <span style={{color: "var(--text-p)", marginLeft: "12px", fontSize: "34px", fontWeight: "900", letterSpacing: "1px"}}>Moshrif</span>
          </div>
          
          {step === 1 ? (
            <div className="role-selector-container fade-in">
              <h2 style={{color: "var(--text-p)", fontSize: "20px", margin: "10px 0"}}>Select Portal Access</h2>
              <p style={{color: "var(--text-s)", fontSize: "14px", marginBottom: "25px"}}>Please authenticate with your designated role</p>
              
              <div className="role-selector">
                <button className="role-btn" onClick={() => setStep(2)}>
                  <div className="icon-circle"><UserCog size={32} /></div>
                  <span className="role-title">SYSTEM ADMIN</span>
                  <span className="role-desc">Full Database Access</span>
                </button>
                
                <button className="role-btn" onClick={() => onLogin("professor")}>
                  <div className="icon-circle"><GraduationCap size={32} /></div>
                  <span className="role-title">PROFESSOR</span>
                  <span className="role-desc">Courses & Attendance</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="pass-entry fade-in">
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '15px' }}>
                 <div className="icon-circle admin-icon"><Lock size={28} /></div>
              </div>
              <h2 style={{color: "var(--text-p)", fontSize: "22px", margin: "0 0 5px 0"}}>Admin Authentication</h2>
              <p style={{color: "var(--text-s)", fontSize: "14px", margin: "0 0 20px 0"}}>Enter root security password</p>
              
              <div className="input-group">
                <input 
                  type="password" 
                  placeholder="••••••••" 
                  value={password}
                  onChange={(e) => {setPassword(e.target.value); setError("");}}
                  onKeyPress={(e) => e.key === 'Enter' && handleAdminSubmit()}
                  style={{ borderColor: error ? "var(--danger)" : "var(--border)" }}
                />
              </div>
              
              {error && <span style={{color: "var(--danger)", fontSize: "13px", fontWeight: "bold", marginTop: "-10px"}}>{error}</span>}
              
              <button className="submit-btn" onClick={handleAdminSubmit}>VERIFY & LOGIN</button>
              <button className="back-btn" onClick={() => {setStep(1); setPassword(""); setError("");}}>
                <ArrowLeft size={16} /> Back to Roles
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 🌍 المحتوى الرئيسي
// ==========================================
const AppContent = ({ theme, setTheme, userRole, handleLogout }) => {
  return (
    <div className={`app-container theme-${theme}`}>
      <aside className="sidebar">
        <div className="logo">
          <ShieldCheck size={28} /> 
          <span>Moshrif</span>
        </div>

        <nav className="nav-menu">
          {userRole === "admin" && (
            <>
              <NavLink to="/" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
                <LayoutDashboard size={22} />
                <span>DASHBOARD</span>
              </NavLink>

              <NavLink to="/live" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
                <RefreshCw size={22} />
                <span>LIVE MONITOR</span>
              </NavLink>

              <NavLink to="/admin" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
                <Database size={22} />
                <span>ADMIN DB</span>
              </NavLink>
            </>
          )}

          {userRole === "professor" && (
            <NavLink to="/courses" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
              <BookOpen size={22} />
              <span>COURSES</span>
            </NavLink>
          )}
        </nav>

        <div className="sidebar-bottom">
          <button className="logout-btn" onClick={handleLogout}>
            <LogOut size={18} />
            <span>LOGOUT ({userRole.toUpperCase()})</span>
          </button>

          <div className="theme-switcher">
            <span className="theme-label">THEME</span>
            <div className="theme-buttons">
              <button className={`theme-btn ${theme === 'light' ? 'active' : ''}`} onClick={() => setTheme('light')}><Sun size={18} /></button>
              <button className={`theme-btn ${theme === 'medium' ? 'active' : ''}`} onClick={() => setTheme('medium')}><Contrast size={18} /></button>
              <button className={`theme-btn ${theme === 'dark' ? 'active' : ''}`} onClick={() => setTheme('dark')}><Moon size={18} /></button>
            </div>
          </div>
          <div className="status-footer">🟢 SYSTEM ONLINE</div>
        </div>
      </aside>

      <main className="content-area">
        <Routes>
          {userRole === "admin" && (
            <>
              <Route path="/" element={<Overview />} />
              <Route path="/live" element={<LiveMonitor />} />
              <Route path="/admin" element={<AdminPanel />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </>
          )}
          
          {userRole === "professor" && (
            <>
              <Route path="/courses" element={<Courses />} />
              <Route path="*" element={<Navigate to="/courses" replace />} />
            </>
          )}
        </Routes>
      </main>
    </div>
  );
};

// ==========================================
// 🚀 المكون الرئيسي
// ==========================================
function App() {
  const [theme, setTheme] = useState("dark");
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null); 
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    document.body.className = `theme-${theme}`;
  }, [theme]);

  useEffect(() => {
    const timer = setTimeout(() => { setLoading(false); }, 2500);
    return () => clearTimeout(timer);
  }, []);

  const handleLogin = (role) => {
    setUserRole(role);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserRole(null);
  };

  if (loading) return <LoadingScreen />;
  if (!isAuthenticated) return <LoginPage onLogin={handleLogin} theme={theme} />;

  return (
    <Router>
      <AppContent theme={theme} setTheme={setTheme} userRole={userRole} handleLogout={handleLogout} />
    </Router>
  );
}

export default App;