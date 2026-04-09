import { useState } from "react";
import { Link } from "react-router-dom";

export default function GaragePage() {
  const [cars, setCars] = useState([
    { id: "1", make: "Toyota", model: "Corolla", year: 2020, plate: "AB123CD" },
    { id: "2", make: "Honda", model: "Civic", year: 2018, plate: "XX999YY" }
  ]);
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");
  const [plate, setPlate] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleAddCar = (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    setTimeout(() => {
      const newCar = {
        id: Date.now().toString(),
        make,
        model,
        year,
        plate
      };
      setCars([newCar, ...cars]);
      setMake("");
      setModel("");
      setYear("");
      setPlate("");
      setIsLoading(false);
    }, 500);
  };

  return (
    <div className="garage-page-wrapper">
      <div className="add-car-section">
        <div className="card add-car-card">
          <h3 className="add-car-title">Add New Vehicle</h3>
          
          <form onSubmit={handleAddCar} className="column-form auth-form">
            <input
              type="text"
              placeholder="Brand (e.g., Toyota)"
              value={make}
              onChange={(e) => setMake(e.target.value)}
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
                <h3 className="car-title">{car.make} {car.model}</h3>
                <div className="car-details">
                  <span className="car-year">{car.year}</span>
                  <span className="car-plate">{car.plate}</span>
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