import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { authHeader, garageApi } from "../api";

export default function GaragePage() {
  const [cars, setCars] = useState([]);
  const [form, setForm] = useState({ brand: "", model: "", year: "", plateNumber: "" });

  async function loadCars() {
    try {
      const { data } = await garageApi.get("/cars", { headers: authHeader() });
      setCars(data);
    } catch (error) {
      console.error("Failed to load cars", error);
    }
  }

  useEffect(() => {
    loadCars();
  }, []);

  async function addCar(e) {
    e.preventDefault();
    try {
      await garageApi.post("/cars", form, { headers: authHeader() });
      setForm({ brand: "", model: "", year: "", plateNumber: "" });
      loadCars();
    } catch (error) {
      console.error("Failed to add car", error);
    }
  }

  return (
    <div>
      <div className="garage-header">
        <h2>My Garage</h2>
      </div>

      <div className="card add-car-card">
        <h3 className="add-car-title">Add New Vehicle</h3>
        <form onSubmit={addCar} className="row-form">
          <input 
            placeholder="Brand" 
            required
            value={form.brand} 
            onChange={(e) => setForm({ ...form, brand: e.target.value })} 
          />
          <input 
            placeholder="Model" 
            required
            value={form.model} 
            onChange={(e) => setForm({ ...form, model: e.target.value })} 
          />
          <input 
            placeholder="Year" 
            type="number"
            value={form.year} 
            onChange={(e) => setForm({ ...form, year: e.target.value })} 
          />
          <input 
            placeholder="Plate number" 
            value={form.plateNumber} 
            onChange={(e) => setForm({ ...form, plateNumber: e.target.value })} 
          />
          <button type="submit">Add Car</button>
        </form>
      </div>

      {cars.length === 0 ? (
        <div style={{ textAlign: "center", color: "var(--color-gray)", padding: "40px" }}>
          <p>Your garage is empty. Add a car above.</p>
        </div>
      ) : (
        <ul className="car-grid">
          {cars.map((car) => (
            <li key={car.id} className="car-grid-item">
              <Link to={`/cars/${car.id}`}>
                <h4 className="car-title">{car.brand} {car.model}</h4>
                <div className="car-details">
                  <span>Year: {car.year || "N/A"}</span>
                  {car.plateNumber && <span className="car-plate">{car.plateNumber}</span>}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}