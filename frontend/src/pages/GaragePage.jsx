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
          headers: {
            "Authorization": `Bearer ${token}`
          }
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

      if (!response.ok) {
        throw new Error(newCar.error || "Failed to add car");
      }

      setCars([newCar, ...cars]);
      setBrand("");
      setModel("");
      setYear("");
      setPlate("");
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="garage-page-wrapper">
      <div className="add-car-section">
        <div className="card add-car-card">
          <h3 className="add-car-title">Add New Vehicle</h3>
          
          {error && (
            <div className="status-message" style={{ marginBottom: "16px", borderColor: "var(--color-coral)", color: "var(--color-coral)", background: "transparent" }}>
              {error}
            </div>
          )}
          
          <form onSubmit={handleAddCar} className="column-form auth-form">
            <input
              type="text"
              placeholder="Brand (e.g., Toyota)"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              required
            />
            
            <input
              type="text"
              placeholder="Model (e.g., Corolla)"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              required
            />
            
            <div className="grid-2">
              <input
                type="number"
                placeholder="Year"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                required
              />
              <input
                type="text"
                placeholder="Plate Number"
                value={plate}
                onChange={(e) => setPlate(e.target.value)}
                required
              />
            </div>
            
            <button type="submit" disabled={isLoading}>
              {isLoading ? "Adding..." : "Add Car"}
            </button>
          </form>
        </div>
      </div>

      <div className="garage-header">
        <h2>My Vehicles</h2>
      </div>

      {cars.length > 0 ? (
        <div className="car-grid">
          {cars.map((car) => (
            <div key={car.id} className="car-grid-item">
              <Link to={`/cars/${car.id}`}>
                <h3 className="car-title">{car.brand} {car.model}</h3>
                <div className="car-details">
                  <span className="car-year">{car.year}</span>
                  <span className="car-plate">{car.plate_number}</span>
                </div>
              </Link>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <p>Your garage is empty. Add your first car above.</p>
        </div>
      )}
    </div>
  );
}