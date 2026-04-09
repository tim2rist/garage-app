import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";

export default function CarDetailsPage() {
  const { carId } = useParams();
  const navigate = useNavigate();
  const currentUserId = localStorage.getItem("publicUserId");
  
  const [expenses, setExpenses] = useState([]);
  const [expenseType, setExpenseType] = useState("Fuel");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [expenseDate, setExpenseDate] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchExpenses = async () => {
      const token = localStorage.getItem("token");
      if (!token) return navigate("/");

      try {
        const response = await fetch(`http://localhost:5000/api/expenses/${carId}`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        
        if (response.ok) {
          const data = await response.json();
          setExpenses(data);
        }
      } catch (err) {
        console.error("Failed to fetch expenses:", err);
      }
    };

    fetchExpenses();
  }, [carId, navigate]);

  const handleAddExpense = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const token = localStorage.getItem("token");

    try {
      const response = await fetch("http://localhost:5000/api/expenses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          car_id: carId,
          expense_type: expenseType,
          amount: parseFloat(amount),
          description,
          expense_date: expenseDate || new Date().toISOString().split('T')[0]
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to add expense");
      }

      const newExp = await response.json();
      setExpenses([newExp, ...expenses]);
      setAmount("");
      setDescription("");
      setExpenseDate("");
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // ФУНКЦИЯ УДАЛЕНИЯ ЧЕКА
  const handleDeleteExpense = async (id) => {
    if (!window.confirm("Delete this expense?")) return;
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`http://localhost:5000/api/expenses/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) setExpenses(expenses.filter(e => e.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="centered-content" style={{ maxWidth: "1000px" }}>
      <Link to={`/${currentUserId}/garage`} className="back-link">
        ← Back to Garage
      </Link>

      <div className="car-details-header">
        <h2 style={{ fontSize: "2.5rem", marginBottom: "32px" }}>Car Expenses</h2>
      </div>

      <div className="car-details-wrapper">
        <div className="card" style={{ height: "fit-content" }}>
          <h3 className="add-car-title" style={{ fontWeight: "700", marginBottom: "24px" }}>Add New Expense</h3>
          
          {error && <div className="status-message">{error}</div>}
          
          <form onSubmit={handleAddExpense} className="column-form">
            <select 
              value={expenseType} 
              onChange={(e) => setExpenseType(e.target.value)}
              required
            >
              <option value="Fuel">Fuel</option>
              <option value="Service">Service</option>
              <option value="Insurance">Insurance</option>
              <option value="Parts">Parts</option>
              <option value="Other">Other</option>
            </select>
            
            <input 
              type="number" 
              step="0.01"
              placeholder="Amount (e.g. 50.00)" 
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required 
            />
            
            <input 
              type="text" 
              placeholder="Description" 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            
            <input 
              type="date" 
              value={expenseDate}
              onChange={(e) => setExpenseDate(e.target.value)}
              required
            />
            
            <button type="button" className="file-input-button" style={{ marginTop: "8px", marginBottom: "8px" }}>
              Upload Receipt/Image
            </button>
            
            <button type="submit" disabled={isLoading}>
              {isLoading ? "Adding..." : "Add Expense"}
            </button>
          </form>
        </div>

        <div className="expense-history-section">
          <h3 style={{ color: "var(--color-coral)", fontSize: "1.5rem", marginTop: 0, marginBottom: "24px" }}>History</h3>
          
          {expenses.length > 0 ? (
            <div className="expense-history-list">
              {expenses.map((exp) => (
                <div key={exp.id} className="expense-history-item">
                  <div className="expense-info">
                    <span className="expense-type-badge">{exp.expense_type}</span>
                    <p style={{ margin: "8px 0 4px 0", fontWeight: "500" }}>{exp.description || "No description"}</p>
                    <span style={{ fontSize: "0.85rem", color: "var(--color-gray)" }}>
                      {new Date(exp.expense_date).toLocaleDateString()}
                    </span>
                    {/* КНОПКА УДАЛЕНИЯ */}
                    <button 
                      onClick={() => handleDeleteExpense(exp.id)}
                      style={{ background: "none", border: "none", color: "var(--color-coral)", cursor: "pointer", padding: 0, marginTop: "8px", width: "fit-content", boxShadow: "none", fontSize: "0.8rem" }}
                    >
                      Remove
                    </button>
                  </div>
                  <div className="expense-amount-large">
                    ${parseFloat(exp.amount).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: "var(--color-text)" }}>No expenses recorded yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}