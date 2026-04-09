import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ProfilePage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");

  useEffect(() => {
    const storedId = localStorage.getItem("publicUserId");
    const token = localStorage.getItem("token");
    
    if (!token || !storedId) {
      navigate("/");
    } else {
      setUsername(storedId);
    }
  }, [navigate]);

  return (
    <div className="profile-page">
      <div className="profile-header">
        <div className="profile-avatar">
          {username ? username.charAt(0).toUpperCase() : "?"}
        </div>
        <div>
          <h2>{username}</h2>
          <p style={{ color: "var(--color-gray)", margin: "4px 0 0 0" }}>Garage Owner</p>
        </div>
      </div>

      <h3 className="section-title">My Stats</h3>
      <div className="grid-2">
        <div className="card" style={{ textAlign: "center" }}>
          <h4 style={{ color: "var(--color-gray)", margin: "0 0 8px 0" }}>Total Cars</h4>
          <p style={{ fontSize: "2.5rem", margin: 0, fontWeight: "800", color: "var(--color-coral)" }}>0</p>
        </div>
        <div className="card" style={{ textAlign: "center" }}>
          <h4 style={{ color: "var(--color-gray)", margin: "0 0 8px 0" }}>Total Expenses</h4>
          <p style={{ fontSize: "2.5rem", margin: 0, fontWeight: "800", color: "var(--color-coral)" }}>$0</p>
        </div>
      </div>
    </div>
  );
}