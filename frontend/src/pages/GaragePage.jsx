import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { authHeader, garageApi } from "../api";

export default function GaragePage() {
  const [cars, setCars] = useState([]);
  const [form, setForm] = useState({ brand: "", model: "", year: "", plateNumber: "" });

  async function loadCars() {
    const { data } = await garageApi.get("/cars", { headers: authHeader() });
    setCars(data);
  }

  useEffect(() => {
    loadCars().catch(() => {});
  }, []);

  async function addCar(e) {
    e.preventDefault();
    await garageApi.post("/cars", form, { headers: authHeader() });
    setForm({ brand: "", model: "", year: "", plateNumber: "" });
    loadCars();
  }

  return (
    <div>
      <h2>My Garage</h2>
      <form onSubmit={addCar} className="row-form">
        <input placeholder="Brand" value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} />
        <input placeholder="Model" value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} />
        <input placeholder="Year" value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} />
        <input placeholder="Plate number" value={form.plateNumber} onChange={(e) => setForm({ ...form, plateNumber: e.target.value })} />
        <button type="submit">Add Car</button>
      </form>
      <ul>
        {cars.map((car) => (
          <li key={car.id}>
            <Link to={`/cars/${car.id}`}>{car.brand} {car.model} ({car.year || "n/a"})</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
