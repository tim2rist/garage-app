import { Link, Route, Routes, useLocation } from "react-router-dom";
import LoginRegisterPage from "./pages/LoginRegisterPage";
import GaragePage from "./pages/GaragePage";
import CarDetailsPage from "./pages/CarDetailsPage";
import SearchUserPage from "./pages/SearchUserPage";
import ProfilePage from "./pages/ProfilePage";

export default function App() {
  const location = useLocation();
  const isHomePage = location.pathname === "/";

  return (
    <div className="app-wrapper">
      {!isHomePage && (
        <header className="top-header">
          <h1>Car Garage</h1>
          <nav className="desktop-nav">
            <Link to="/garage">Garage</Link>
            <Link to="/search">Search Users</Link>
          </nav>
        </header>
      )}

      <main className="container">
        <Routes>
          <Route path="/" element={<LoginRegisterPage />} />
          <Route path="/garage" element={<GaragePage />} />
          <Route path="/cars/:carId" element={<CarDetailsPage />} />
          <Route path="/search" element={<SearchUserPage />} />
          <Route path="/profile/:publicUserId" element={<ProfilePage />} />
        </Routes>
      </main>

      {!isHomePage && (
        <nav className="bottom-nav">
          <Link to="/garage">Garage</Link>
          <Link to="/search">Search</Link>
        </nav>
      )}
    </div>
  );
}