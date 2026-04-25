import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

export default function ProfilePage() {
  const { publicUserId } = useParams();
  const [stats, setStats] = useState({ car_count: 0, total_expenses: 0, avatar_url: null });
  const [cars, setCars] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const statsRes = await fetch(`https://garage-app-8r7w.onrender.com/api/profile/stats/${publicUserId}`);
        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats(statsData || { car_count: 0, total_expenses: 0, avatar_url: null });
        }

        const carsRes = await fetch(`https://garage-app-8r7w.onrender.com/api/profile/cars/${publicUserId}`);
        if (carsRes.ok) {
          const carsData = await carsRes.json();
          setCars(carsData || []);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, [publicUserId]);

  return (
    <div className="container profile-page">
      <div className="profile-header">
        <div className="profile-avatar" style={{ overflow: "hidden", padding: 0 }}>
          {stats?.avatar_url ? (
            <img 
              src={`https://garage-app-8r7w.onrender.com${stats.avatar_url}`} 
              alt="Avatar" 
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} 
            />
          ) : (
            publicUserId ? publicUserId.charAt(0).toUpperCase() : "?"
          )}
        </div>
        <div>
          <h2>{publicUserId}</h2>
          <p style={{ color: "var(--color-gray)" }}>Garage Owner</p>
        </div>
      </div>

      <h3 className="section-title" style={{ marginTop: "16px" }}>My Garage</h3>
      <div className="car-grid">
        {cars.map((car) => (
          <Link 
            to={`/cars/${car.id}`} 
            key={car.id} 
            className="car-grid-item flicker-in" 
            style={{ 
              background: "var(--color-plum)", 
              border: "1px solid rgba(139, 66, 82, 0.4)", 
              borderRadius: "var(--border-radius)", 
              padding: "20px",
              textDecoration: "none",
              color: "inherit",
              display: "block",
              cursor: "pointer",
              marginBottom: "12px"
            }}
          >
            <div className="car-card-header">
              <span className="car-year" style={{ color: "var(--color-gray)", fontSize: "0.85rem" }}>{car.year}</span>
            </div>
            <h3 className="car-title" style={{ marginTop: "10px", marginBottom: "0", fontSize: "1.2rem" }}>
              {car.make} {car.model}
            </h3>
          </Link>
        ))}
        {cars.length === 0 && (
          <p style={{ color: "var(--color-gray)" }}>No cars in this garage yet.</p>
        )}
      </div>

      <h3 className="section-title" style={{ marginTop: "24px" }}>Stats</h3>
      <div className="grid-2">
        <div className="card" style={{ textAlign: "center", padding: "20px" }}>
          <h4 style={{ color: "var(--color-gray)", margin: "0 0 8px 0", fontSize: "1rem" }}>Total Vehicles</h4>
          <p style={{ fontSize: "2.5rem", margin: 0, fontWeight: "800", color: "var(--color-coral)" }}>
            {stats?.car_count || 0}
          </p>
        </div>
        <div className="card" style={{ textAlign: "center", padding: "20px" }}>
          <h4 style={{ color: "var(--color-gray)", margin: "0 0 8px 0", fontSize: "1rem" }}>Total Expenses</h4>
          <p style={{ fontSize: "2.5rem", margin: 0, fontWeight: "800", color: "var(--color-coral)" }}>
            {parseFloat(stats?.total_expenses || 0).toLocaleString()} zł
          </p>
        </div>
      </div>
    </div>
  );
}