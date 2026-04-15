import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

export default function CarDetailsPage() {
  const { carId } = useParams();
  const navigate = useNavigate();
  const currentUserId = localStorage.getItem("publicUserId");
  
  const [expenses, setExpenses] = useState([]);
  const [isOwner, setIsOwner] = useState(false);
  
  const [expenseType, setExpenseType] = useState("Fuel");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [expenseDate, setExpenseDate] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [receipt, setReceipt] = useState(null);
  const [preview, setPreview] = useState(null);

  const [editingExpense, setEditingExpense] = useState(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const COLORS = {
    Fuel: "#FF6B6B",
    Service: "#4ECDC4",
    Insurance: "#45B7D1",
    Parts: "#96CEB4",
    Other: "#F9A826"
  };

  useEffect(() => {
    fetchExpenses();
  }, [carId]);

  const fetchExpenses = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`http://localhost:5000/api/expenses/${carId}`, {
        headers: token ? { "Authorization": `Bearer ${token}` } : {}
      });
      if (response.ok) {
        const data = await response.json();
        setExpenses(data.expenses || []);
        setIsOwner(data.isOwner || false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleFileChange = (e, isEdit = false) => {
    const file = e.target.files[0];
    if (file) {
      if (isEdit) {
        setEditingExpense({ ...editingExpense, newReceipt: file, preview: URL.createObjectURL(file) });
      } else {
        setReceipt(file);
        setPreview(URL.createObjectURL(file));
      }
    }
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const token = localStorage.getItem("token");
    const formData = new FormData();
    formData.append("car_id", carId);
    formData.append("expense_type", expenseType);
    formData.append("amount", amount);
    formData.append("description", description);
    formData.append("expense_date", expenseDate || new Date().toISOString().split('T')[0]);
    formData.append("is_public", isPublic);
    if (receipt) formData.append("receipt", receipt);

    try {
      const response = await fetch("http://localhost:5000/api/expenses", {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` },
        body: formData
      });
      if (response.ok) {
        const newExp = await response.json();
        setExpenses([newExp, ...expenses]);
        resetForm();
      }
    } catch (err) {
      setError("Failed to add expense");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateExpense = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const token = localStorage.getItem("token");
    const formData = new FormData();
    formData.append("expense_type", editingExpense.expense_type);
    formData.append("amount", editingExpense.amount);
    formData.append("description", editingExpense.description);
    formData.append("expense_date", editingExpense.expense_date.split('T')[0]);
    formData.append("is_public", editingExpense.is_public);
    if (editingExpense.newReceipt) formData.append("receipt", editingExpense.newReceipt);

    try {
      const response = await fetch(`http://localhost:5000/api/expenses/${editingExpense.id}`, {
        method: "PUT",
        headers: { "Authorization": `Bearer ${token}` },
        body: formData
      });
      if (response.ok) {
        const updated = await response.json();
        setExpenses(expenses.map(exp => exp.id === updated.id ? updated : exp));
        setEditingExpense(null);
      }
    } catch (err) {
      console.error(err);
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

  const resetForm = () => {
    setAmount("");
    setDescription("");
    setExpenseDate("");
    setReceipt(null);
    setPreview(null);
  };

  const chartData = Object.entries(
    expenses.reduce((acc, exp) => {
      acc[exp.expense_type] = (acc[exp.expense_type] || 0) + parseFloat(exp.amount);
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value }));

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip" style={{ backgroundColor: "#1e1e2e", border: "1px solid rgba(255, 255, 255, 0.1)", borderRadius: "8px", padding: "12px" }}>
          <p style={{ margin: 0, color: "#a6a6b5", fontSize: "0.85rem" }}>{payload[0].name}</p>
          <p style={{ margin: 0, color: "#ffffff", fontWeight: "bold" }}>{parseFloat(payload[0].value).toFixed(2)} zł</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="centered-content" style={{ maxWidth: "1000px" }}>
      <Link to={isOwner ? `/${currentUserId}/garage` : `/search`} className="back-link">
        ← {isOwner ? "Back to Garage" : "Back to Search"}
      </Link>

      <div className="car-details-header">
        <h2 style={{ fontSize: "2.5rem", marginBottom: "32px" }}>Car Expenses</h2>
      </div>

      <div className="car-details-wrapper" style={{ gridTemplateColumns: isOwner ? "350px 1fr" : "1fr" }}>
        {isOwner && (
          <div className="card" style={{ height: "fit-content" }}>
            <h3 className="add-car-title">Add New Expense</h3>
            <form onSubmit={handleAddExpense} className="column-form">
              <select value={expenseType} onChange={(e) => setExpenseType(e.target.value)} required>
                <option value="Fuel">Fuel</option>
                <option value="Service">Service</option>
                <option value="Insurance">Insurance</option>
                <option value="Parts">Parts</option>
                <option value="Other">Other</option>
              </select>
              <input type="number" step="0.01" placeholder="Amount (zł)" value={amount} onChange={(e) => setAmount(e.target.value)} required />
              <input type="text" placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
              <input type="date" value={expenseDate} onChange={(e) => setExpenseDate(e.target.value)} required />
              <div style={{ display: "flex", alignItems: "center", gap: "10px", margin: "8px 0" }}>
                <input type="checkbox" id="isPublic" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} style={{ width: "auto" }} />
                <label htmlFor="isPublic">Make Public</label>
              </div>
              <div className="file-input-wrapper">
                <input type="file" id="receipt-upload" accept="image/*" onChange={(e) => handleFileChange(e)} />
                <label htmlFor="receipt-upload" className="file-input-button">{receipt ? "Change Image" : "Upload Receipt"}</label>
              </div>
              {preview && <div className="image-preview-container"><img src={preview} className="image-preview" /><button type="button" className="remove-image-btn" onClick={() => { setReceipt(null); setPreview(null); }}>✕</button></div>}
              <button type="submit" disabled={isLoading}>{isLoading ? "Adding..." : "Add Expense"}</button>
            </form>
          </div>
        )}

        <div className="expense-content-right">
          {expenses.length > 0 && (
            <div className="card" style={{ padding: "24px", marginBottom: "24px", background: "var(--color-plum)" }}>
              <h3 style={{ margin: "0 0 16px 0", fontSize: "1.2rem" }}>Breakdown</h3>
              <div style={{ width: "100%", height: "250px" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={chartData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" stroke="none" isAnimationActive={false}>
                      {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[entry.name] || COLORS.Other} />)}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          <div className="expense-history-section">
            <h3 style={{ color: "var(--color-coral)", fontSize: "1.5rem", marginBottom: "24px" }}>History</h3>
            <div className="expense-history-list">
              {expenses.map((exp) => (
                <div key={exp.id} className="expense-history-item">
                  <div className="expense-info">
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span className="expense-type-badge">{exp.expense_type}</span>
                      {!exp.is_public && <span style={{ fontSize: "0.8rem", color: "var(--color-gray)" }}>(Private)</span>}
                    </div>
                    <p style={{ margin: "8px 0 4px 0", fontWeight: "500" }}>{exp.description}</p>
                    <span style={{ fontSize: "0.85rem", color: "var(--color-gray)" }}>{new Date(exp.expense_date).toLocaleDateString()}</span>
                    
                    <div style={{ display: "flex", gap: "12px", marginTop: "12px" }}>
                      {exp.image_url && <a href={`http://localhost:5000${exp.image_url}`} target="_blank" className="expense-image-btn" style={{fontSize: '0.8rem'}}>🖼️ Receipt</a>}
                      {isOwner && (
                        <>
                          <button onClick={() => setEditingExpense(exp)} style={{ background: "none", border: "none", color: "var(--color-gray)", cursor: "pointer", fontSize: "0.8rem" }}>✏️ Edit</button>
                          <button onClick={() => handleDeleteExpense(exp.id)} style={{ background: "none", border: "none", color: "var(--color-coral)", cursor: "pointer", fontSize: "0.8rem" }}>🗑️ Remove</button>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="expense-amount-large">{parseFloat(exp.amount).toFixed(2)} zł</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {editingExpense && (
        <div className="modal-overlay">
          <div className="modal-content card" style={{ maxWidth: "450px", width: "90%" }}>
            <h3>Edit Expense</h3>
            <form onSubmit={handleUpdateExpense} className="column-form">
              <select value={editingExpense.expense_type} onChange={(e) => setEditingExpense({...editingExpense, expense_type: e.target.value})}>
                <option value="Fuel">Fuel</option>
                <option value="Service">Service</option>
                <option value="Insurance">Insurance</option>
                <option value="Parts">Parts</option>
                <option value="Other">Other</option>
              </select>
              <input type="number" step="0.01" value={editingExpense.amount} onChange={(e) => setEditingExpense({...editingExpense, amount: e.target.value})} required />
              <input type="text" value={editingExpense.description} onChange={(e) => setEditingExpense({...editingExpense, description: e.target.value})} />
              <input type="date" value={editingExpense.expense_date.split('T')[0]} onChange={(e) => setEditingExpense({...editingExpense, expense_date: e.target.value})} required />
              
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <input type="checkbox" checked={editingExpense.is_public} onChange={(e) => setEditingExpense({...editingExpense, is_public: e.target.checked})} style={{ width: "auto" }} />
                <label>Make Public</label>
              </div>

              <div className="file-input-wrapper">
                <input type="file" id="edit-receipt" accept="image/*" onChange={(e) => handleFileChange(e, true)} />
                <label htmlFor="edit-receipt" className="file-input-button">Replace Receipt Image</label>
              </div>

              {(editingExpense.preview || editingExpense.image_url) && (
                <div style={{ position: "relative", marginTop: "10px" }}>
                  <img src={editingExpense.preview || `http://localhost:5000${editingExpense.image_url}`} style={{ width: "100%", borderRadius: "8px", height: "100px", objectFit: "cover" }} />
                </div>
              )}

              <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
                <button type="submit" style={{ flex: 1 }}>Save Changes</button>
                <button type="button" onClick={() => setEditingExpense(null)} style={{ flex: 1, background: "var(--color-bg)", border: "1px solid var(--color-gray)" }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}