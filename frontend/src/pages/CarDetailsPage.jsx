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
  
  const [receipt, setReceipt] = useState(null);
  const [preview, setPreview] = useState(null);
  
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
        console.error(err);
      }
    };

    fetchExpenses();
  }, [carId, navigate]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setReceipt(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const token = localStorage.getItem("token");

    const formData = new FormData();
    formData.append("car_id", carId);
    formData.append("expense_type", expenseType);
    formData.append("amount", amount);
    formData.append("description", description);
    formData.append("expense_date", expenseDate || new Date().toISOString().split('T')[0]);
    
    if (receipt) {
      formData.append("receipt", receipt);
    }

    try {
      const response = await fetch("http://localhost:5000/api/expenses", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        },
        body: formData
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
      setReceipt(null);
      setPreview(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

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
              placeholder="Amount (e.g. 50.00 zł)" 
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
            
            <div className="file-input-wrapper">
              <input 
                type="file" 
                id="receipt-upload"
                accept="image/*"
                onChange={handleFileChange}
              />
              <label htmlFor="receipt-upload" className="file-input-button" style={{ marginTop: "8px", marginBottom: "8px" }}>
                {receipt ? "Change Image" : "Upload Receipt/Image"}
              </label>
            </div>

            {preview && (
              <div className="image-preview-container">
                <img src={preview} alt="Receipt preview" className="image-preview" />
                <button 
                  type="button" 
                  className="remove-image-btn" 
                  onClick={() => { setReceipt(null); setPreview(null); }}
                >
                  ✕
                </button>
              </div>
            )}
            
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
                    <span style={{ fontSize: "0.85rem", color: "var(--color-gray)", display: "block", marginBottom: "8px" }}>
                      {new Date(exp.expense_date).toLocaleDateString()}
                    </span>
                    
                    {exp.image_url && (
                      <a 
                        href={`http://localhost:5000${exp.image_url}`} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="expense-image-btn"
                        style={{ display: "inline-flex", width: "fit-content", marginBottom: "8px" }}
                      >
                        🖼️ View Receipt
                      </a>
                    )}

                    <button 
                      onClick={() => handleDeleteExpense(exp.id)}
                      style={{ background: "none", border: "none", color: "var(--color-coral)", cursor: "pointer", padding: 0, width: "fit-content", boxShadow: "none", fontSize: "0.8rem" }}
                    >
                      Remove
                    </button>
                  </div>
                  <div className="expense-amount-large">
                    {parseFloat(exp.amount).toFixed(2)} zł
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