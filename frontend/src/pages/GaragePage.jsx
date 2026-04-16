import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function GaragePage() {
  const [cars, setCars] = useState([]);
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");
  const [plate, setPlate] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCars = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/");
        return;
      }

      try {
        const response = await fetch("http://localhost:5000/api/cars", {
          headers: { "Authorization": `Bearer ${token}` }
        });

        if (!response.ok) throw new Error("Failed to fetch cars");
        const data = await response.json();
        setCars(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchCars();
  }, [navigate]);

  const handleAddCar = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    const token = localStorage.getItem("token");

    try {
      const response = await fetch("http://localhost:5000/api/cars", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          brand,
          model,
          year: parseInt(year),
          plate_number: plate
        })
      });

      const newCar = await response.json();
      if (!response.ok) throw new Error(newCar.error || "Failed to add car");

      setCars([newCar, ...cars]);
      setBrand(""); setModel(""); setYear(""); setPlate("");
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container garage-page">
      <div className="garage-header" style={{ textAlign: 'center', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '2rem', margin: 0 }}>My Vehicles</h2>
        <p style={{ color: 'var(--color-gray)', marginTop: '4px' }}>Manage your personal fleet</p>
      </div>

      <div className="card" style={{ marginBottom: '40px', padding: '20px' }}>
        <h3 style={{ fontSize: '1.2rem', marginBottom: '16px', color: 'var(--color-coral)' }}>Add New Vehicle</h3>
        {error && (
          <div style={{ color: 'var(--color-coral)', fontSize: '0.9rem', marginBottom: '12px' }}>{error}</div>
        )}
        <form onSubmit={handleAddCar} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div className="grid-2">
            <input type="text" placeholder="Brand" value={brand} onChange={(e) => setBrand(e.target.value)} required />
            <input type="text" placeholder="Model" value={model} onChange={(e) => setModel(e.target.value)} required />
          </div>
          <div className="grid-2">
            <input type="number" placeholder="Year" value={year} onChange={(e) => setYear(e.target.value)} required />
            <input type="text" placeholder="Plate" value={plate} onChange={(e) => setPlate(e.target.value)} required />
          </div>
          <button type="submit" disabled={isLoading} style={{ marginTop: '8px' }}>
            {isLoading ? "Adding..." : "Add to Garage"}
          </button>
        </form>
      </div>

      <div className="car-grid">
        {cars.map((car) => (
          <div key={car.id} className="car-grid-item flicker-in" style={{ marginBottom: '12px' }}>
            <Link to={`/cars/${car.id}`} style={{ 
              display: 'block', 
              textDecoration: 'none', 
              background: 'var(--color-plum)', 
              padding: '20px', 
              borderRadius: 'var(--border-radius)',
              border: '1px solid rgba(139, 66, 82, 0.4)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--color-text)' }}>{car.brand} {car.model}</h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--color-coral)', fontWeight: '700', background: 'rgba(226, 104, 88, 0.1)', padding: '4px 8px', borderRadius: '4px' }}>
                  {car.plate_number}
                </span>
              </div>
              <p style={{ margin: '8px 0 0 0', color: 'var(--color-gray)', fontSize: '0.9rem' }}>Year: {car.year}</p>
            </Link>
          </div>
        ))}
      </div>

      {cars.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--color-gray)' }}>
          Your garage is empty. Add your first car above.
        </div>
      )}
    </div>
  );
}