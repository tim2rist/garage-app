import { useEffect, useState } from "react";
import { Link, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import LoginRegisterPage from "./pages/LoginRegisterPage";
import GaragePage from "./pages/GaragePage";
import CarDetailsPage from "./pages/CarDetailsPage";
import SearchUserPage from "./pages/SearchUserPage";
import ProfilePage from "./pages/ProfilePage";
import SettingsPage from "./pages/SettingsPage";

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

const ProfileIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);

const GarageIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2-2H5a2 2 0 0 1-2-2z"/>
    <polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
);

const SearchIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/>
    <line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);

const SettingsIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3"/>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
  </svg>
);

export default function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const isHomePage = location.pathname === "/";
  const currentUserId = localStorage.getItem("publicUserId") || "user";

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
    localStorage.removeItem("publicUserId");
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
            {currentUserId !== "user" && <Link to={`/profile/${currentUserId}`}>My Profile</Link>}
            <Link to={`/${currentUserId}/garage`}>My Garage</Link>
            <Link to="/search">Search Users</Link>
            <Link to="/settings">Settings</Link>
          </nav>

          <div className="sidebar-footer">
            <button className="theme-toggle-btn icon-only-btn" onClick={() => setIsDark(!isDark)}>
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
            <Route path="/:userId/garage" element={<GaragePage />} />
            <Route path="/cars/:carId" element={<CarDetailsPage />} />
            <Route path="/search" element={<SearchUserPage />} />
            <Route path="/profile/:publicUserId" element={<ProfilePage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </div>
      </main>

      {!isHomePage && (
        <nav className="bottom-nav">
          {currentUserId !== "user" && (
            <Link to={`/profile/${currentUserId}`} className="mobile-nav-item">
              <ProfileIcon />
              <span>Profile</span>
            </Link>
          )}
          
          <Link to={`/${currentUserId}/garage`} className="mobile-nav-item">
            <GarageIcon />
            <span>Garage</span>
          </Link>
          
          <Link to="/search" className="mobile-nav-item">
            <SearchIcon />
            <span>Search</span>
          </Link>

          <Link to="/settings" className="mobile-nav-item">
            <SettingsIcon />
            <span>Settings</span>
          </Link>
          
          <button className="mobile-nav-item" onClick={() => setIsDark(!isDark)}>
            {isDark ? <SunIcon /> : <MoonIcon />}
            <span>Theme</span>
          </button>
          
          <button className="mobile-nav-item" onClick={handleLogout}>
            <LogoutIcon />
            <span>Exit</span>
          </button>
        </nav>
      )}
    </div>
  );
}