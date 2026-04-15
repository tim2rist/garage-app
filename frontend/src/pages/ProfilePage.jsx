import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

export default function ProfilePage() {
  const { publicUserId } = useParams();
  const [stats, setStats] = useState({ car_count: 0, total_expenses: 0 });
  const [cars, setCars] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const statsRes = await fetch(`http://localhost:5000/api/profile/stats/${publicUserId}`);
        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats(statsData);
        }

        const carsRes = await fetch(`http://localhost:5000/api/profile/cars/${publicUserId}`);
        if (carsRes.ok) {
          const carsData = await carsRes.json();
          setCars(carsData);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
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

      <h3 className="section-title">Stats</h3>
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

      <h3 className="section-title" style={{ marginTop: "16px" }}>Garage</h3>
      <div className="car-grid">
        {cars.map((car) => (
          <Link 
            to={`/cars/${car.id}`} 
            key={car.id} 
            className="car-grid-item" 
            style={{ 
              background: "var(--color-plum)", 
              border: "1px solid rgba(139, 66, 82, 0.4)", 
              borderRadius: "var(--border-radius)", 
              padding: "24px",
              textDecoration: "none",
              color: "inherit",
              display: "block",
              cursor: "pointer"
            }}
          >
            <div className="car-card-header">
              <span className="car-year">{car.year}</span>
            </div>
            <h3 className="car-title" style={{ marginTop: "12px", marginBottom: "0" }}>
              {car.make} {car.model}
            </h3>
          </Link>
        ))}
        {cars.length === 0 && (
          <p style={{ color: "var(--color-gray)" }}>No cars in this garage yet.</p>
        )}
      </div>
    </div>
  );
}