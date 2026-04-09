import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function ProfilePage() {
  const { publicUserId } = useParams();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ car_count: 0, total_expenses: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/profile/stats/${publicUserId}`);
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (err) {
        console.error("Failed to fetch stats");
      }
    };
    fetchStats();
  }, [publicUserId]);

  return (
    <div className="profile-page">
      <div className="profile-header">
        <div className="profile-avatar">
          {publicUserId ? publicUserId.charAt(0).toUpperCase() : "?"}
        </div>
        <div>
          <h2>{publicUserId}</h2>
          <p style={{ color: "var(--color-gray)", margin: "4px 0 0 0" }}>Garage Owner</p>
        </div>
      </div>

      <h3 className="section-title">My Stats</h3>
      <div className="grid-2">
        <div className="card" style={{ textAlign: "center" }}>
          <h4 style={{ color: "var(--color-gray)", margin: "0 0 8px 0" }}>Total Vehicles</h4>
          <p style={{ fontSize: "2.5rem", margin: 0, fontWeight: "800", color: "var(--color-coral)" }}>
            {stats.car_count}
          </p>
        </div>
        <div className="card" style={{ textAlign: "center" }}>
          <h4 style={{ color: "var(--color-gray)", margin: "0 0 8px 0" }}>Total Expenses</h4>
          <p style={{ fontSize: "2.5rem", margin: 0, fontWeight: "800", color: "var(--color-coral)" }}>
            {parseFloat(stats.total_expenses).toLocaleString()} zł
          </p>
        </div>
      </div>
    </div>
  );
}