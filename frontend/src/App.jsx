import { useEffect, useState } from "react";
import { Link, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import LoginRegisterPage from "./pages/LoginRegisterPage";
import GaragePage from "./pages/GaragePage";
import CarDetailsPage from "./pages/CarDetailsPage";
import SearchUserPage from "./pages/SearchUserPage";
import ProfilePage from "./pages/ProfilePage";

const SunIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
  </svg>
);

const MoonIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
  </svg>
);

const LogoutIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
);

export default function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const isHomePage = location.pathname === "/";

  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    if (isDark) {
      document.body.classList.remove("light-theme");
    } else {
      document.body.classList.add("light-theme");
    }
  }, [isDark]);

  function handleLogout() {
    localStorage.removeItem("token");
    navigate("/");
  }

  return (
    <div className="app-wrapper">
      {!isHomePage && (
        <aside className="sidebar">
          <div className="sidebar-header">
            <h1>Car Garage</h1>
          </div>
          
          <nav className="sidebar-nav">
            <Link to="/garage">My Garage</Link>
            <Link to="/search">Search Users</Link>
          </nav>

          <div className="sidebar-footer">
            <button 
              className="theme-toggle-btn icon-only-btn" 
              onClick={() => setIsDark(!isDark)}
            >
              {isDark ? <SunIcon /> : <MoonIcon />}
            </button>
            <button className="logout-btn icon-only-btn" onClick={handleLogout}>
              <LogoutIcon />
            </button>
          </div>
        </aside>
      )}

      <main className="main-content">
        <div className="container">
          <Routes>
            <Route path="/" element={<LoginRegisterPage />} />
            <Route path="/garage" element={<GaragePage />} />
            <Route path="/cars/:carId" element={<CarDetailsPage />} />
            <Route path="/search" element={<SearchUserPage />} />
            <Route path="/profile/:publicUserId" element={<ProfilePage />} />
          </Routes>
        </div>
      </main>

      {!isHomePage && (
        <nav className="bottom-nav">
          <Link to="/garage">Garage</Link>
          <Link to="/search">Search</Link>
          <button className="mobile-icon-btn" onClick={() => setIsDark(!isDark)}>
            {isDark ? <SunIcon /> : <MoonIcon />}
          </button>
          <button className="mobile-icon-btn" onClick={handleLogout}>
            <LogoutIcon />
          </button>
        </nav>
      )}
    </div>
  );
}