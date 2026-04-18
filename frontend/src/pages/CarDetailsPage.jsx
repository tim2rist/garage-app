import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

const PencilIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 20h9"></path>
    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
  </svg>
);

const TrashIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"></polyline>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
  </svg>
);

const XIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

const PaperclipIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path>
  </svg>
);

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

  const [filterType, setFilterType] = useState("All");
  const [dateFilter, setDateFilter] = useState("All");
  const [editingExpense, setEditingExpense] = useState(null);
  const [viewingImage, setViewingImage] = useState(null);
  
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

    const container = document.querySelector('.container');
    if (container) {
      container.style.setProperty('max-width', '1400px', 'important');
    }

    return () => {
      if (container) {
        container.style.removeProperty('max-width');
      }
    };
  }, [carId]);

  const fetchExpenses = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`https://garage-app-8r7w.onrender.com/api/expenses/${carId}`, {
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
      const response = await fetch("https://garage-app-8r7w.onrender.com/api/expenses", {
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
      const response = await fetch(`https://garage-app-8r7w.onrender.com/api/expenses/${editingExpense.id}`, {
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
      const res = await fetch(`https://garage-app-8r7w.onrender.com/api/expenses/${id}`, {
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

  const filteredExpenses = expenses.filter(exp => {
    const matchType = filterType === "All" || exp.expense_type === filterType;
    
    let matchDate = true;
    if (dateFilter !== "All") {
      const expDate = new Date(exp.expense_date);
      const today = new Date();
      const pastDate = new Date();
      
      if (dateFilter === "7days") pastDate.setDate(today.getDate() - 7);
      else if (dateFilter === "30days") pastDate.setDate(today.getDate() - 30);
      else if (dateFilter === "1year") pastDate.setFullYear(today.getFullYear() - 1);
      
      matchDate = expDate >= pastDate;
    }

    return matchType && matchDate;
  });

  const chartData = Object.entries(
    filteredExpenses.reduce((acc, exp) => {
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
    <div className="car-details-root" style={{ width: "100%" }}>
      <style>{`
        .car-details-grid {
          display: grid;
          gap: 32px;
          align-items: start;
        }
        .add-form-col { order: 1; }
        .history-col { order: 2; }
        .chart-col { order: 3; }

        @media (min-width: 1200px) {
          .car-details-grid.is-owner {
            grid-template-columns: 320px minmax(0, 1fr) 300px;
          }
          .car-details-grid.not-owner {
            grid-template-columns: minmax(0, 1fr) 300px;
          }
          .sticky-col {
            position: sticky;
            top: 24px;
          }
        }
        @media (max-width: 1199px) {
          .car-details-grid {
            display: flex;
            flex-direction: column;
            align-items: center; 
          }
          .add-form-col, .chart-col, .history-col {
            width: 100%;
            max-width: 700px; 
          }
          .chart-col { order: 2; }
          .history-col { order: 3; }
          .sticky-col {
            position: static;
          }
        }
        .history-card-content {
          display: flex;
          justify-content: space-between;
          gap: 16px;
          align-items: flex-start;
        }
        .history-left {
          flex: 1 1 auto;
          min-width: 0; 
        }
        .history-right {
          flex: 0 0 auto;
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 12px;
          min-height: 80px;
          justify-content: space-between;
        }
        .image-viewer-close {
          position: absolute;
          top: -40px;
          right: 0;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: #fff;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
          padding: 0;
          box-shadow: none;
        }
        .image-viewer-close:hover {
          background: var(--color-coral);
          border-color: var(--color-coral);
          transform: scale(1.1);
        }
        .expense-thumbnail {
          width: 48px;
          height: 48px;
          object-fit: cover;
          border-radius: 8px;
          border: 1px solid var(--color-rose);
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .expense-thumbnail:hover {
          transform: scale(1.05);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        }
      `}</style>

      <Link to={isOwner ? `/${currentUserId}/garage` : `/search`} className="back-link">
        ← {isOwner ? "Back to Garage" : "Back to Search"}
      </Link>

      <div className="car-details-header" style={{ marginBottom: "32px", textAlign: "center" }}>
        <h2 style={{ fontSize: "2.5rem", margin: 0 }}>Car Expenses</h2>
      </div>

      <div className={`car-details-grid ${isOwner ? 'is-owner' : 'not-owner'}`}>
        
        {isOwner && (
          <div className="card sticky-col add-form-col" style={{ margin: 0 }}>
            <h3 className="add-car-title">Add New</h3>
            <form onSubmit={handleAddExpense} className="column-form" style={{ maxWidth: "100%" }}>
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
                <input type="checkbox" id="isPublic" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} style={{ width: "auto", margin: 0 }} />
                <label htmlFor="isPublic" style={{ fontSize: "0.9rem" }}>Make Public</label>
              </div>
              <div className="file-input-wrapper">
                <input type="file" id="receipt-upload" accept="image/*" onChange={(e) => handleFileChange(e)} />
                <label htmlFor="receipt-upload" className="file-input-button">{receipt ? "Change Image" : "Upload Attachment"}</label>
              </div>
              {preview && (
                <div className="image-preview-container">
                  <img src={preview} className="image-preview" />
                  <button type="button" className="remove-image-btn" onClick={() => { setReceipt(null); setPreview(null); }}>✕</button>
                </div>
              )}
              <button type="submit" disabled={isLoading}>{isLoading ? "Adding..." : "Add Expense"}</button>
            </form>
          </div>
        )}

        <div className="expense-history-section history-col" style={{ minWidth: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
            <h3 style={{ color: "var(--color-coral)", fontSize: "1.5rem", margin: 0 }}>History</h3>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              <select 
                value={dateFilter} 
                onChange={(e) => setDateFilter(e.target.value)}
                style={{ width: "auto", padding: "8px 32px 8px 12px", fontSize: "0.9rem", minWidth: "120px" }}
              >
                <option value="All">All Time</option>
                <option value="7days">Last 7 Days</option>
                <option value="30days">Last 30 Days</option>
                <option value="1year">Last Year</option>
              </select>
              <select 
                value={filterType} 
                onChange={(e) => setFilterType(e.target.value)}
                style={{ width: "auto", padding: "8px 32px 8px 12px", fontSize: "0.9rem", minWidth: "120px" }}
              >
                <option value="All">All Types</option>
                <option value="Fuel">Fuel</option>
                <option value="Service">Service</option>
                <option value="Insurance">Insurance</option>
                <option value="Parts">Parts</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="expense-history-list">
            {filteredExpenses.length > 0 ? (
              filteredExpenses.map((exp) => (
                <div key={exp.id} className="expense-history-item history-card-content">
                  <div className="history-left">
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", marginBottom: "8px" }}>
                      <span className="expense-type-badge">{exp.expense_type}</span>
                      {!exp.is_public && <span style={{ fontSize: "0.75rem", color: "var(--color-gray)", whiteSpace: "nowrap" }}>(Private)</span>}
                    </div>
                    <p style={{ margin: "0 0 4px 0", fontWeight: "600", color: "var(--color-text)", fontSize: "1.05rem", wordBreak: "break-word" }}>
                      {exp.description || "No description"}
                    </p>
                    <span style={{ fontSize: "0.85rem", color: "var(--color-gray)", display: "block" }}>
                      {new Date(exp.expense_date).toLocaleDateString()}
                    </span>
                    
                    {exp.image_url && (
                      <div 
                        style={{ marginTop: "12px", display: "inline-flex", alignItems: "center", gap: "12px", cursor: "pointer", background: "rgba(255,255,255,0.02)", padding: "4px 12px 4px 4px", borderRadius: "10px", border: "1px solid rgba(139, 66, 82, 0.2)" }}
                        onClick={() => setViewingImage(`https://garage-app-8r7w.onrender.com${exp.image_url}`)}
                      >
                        <img 
                          src={`https://garage-app-8r7w.onrender.com${exp.image_url}`} 
                          alt="Thumbnail" 
                          className="expense-thumbnail"
                        />
                        <span style={{ fontSize: "0.85rem", color: "var(--color-text)", display: "flex", alignItems: "center", gap: "6px", fontWeight: "500" }}>
                          <PaperclipIcon /> Attachment
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="history-right">
                    <div className="expense-amount-large" style={{ whiteSpace: "nowrap", fontSize: "1.1rem", fontWeight: "700" }}>
                      {parseFloat(exp.amount).toFixed(2)} zł
                    </div>
                    
                    {isOwner && (
                      <div style={{ display: "flex", gap: "16px", marginTop: "auto" }}>
                        <button 
                          onClick={() => setEditingExpense(exp)} 
                          style={{ background: "transparent", border: "none", color: "var(--color-gray)", padding: "4px", cursor: "pointer", width: "auto", boxShadow: "none" }}
                          onMouseEnter={(e) => e.currentTarget.style.color = "#4ECDC4"} 
                          onMouseLeave={(e) => e.currentTarget.style.color = "var(--color-gray)"}
                        >
                          <PencilIcon />
                        </button>
                        <button 
                          onClick={() => handleDeleteExpense(exp.id)} 
                          style={{ background: "transparent", border: "none", color: "var(--color-gray)", padding: "4px", cursor: "pointer", width: "auto", boxShadow: "none" }}
                          onMouseEnter={(e) => e.currentTarget.style.color = "var(--color-coral)"} 
                          onMouseLeave={(e) => e.currentTarget.style.color = "var(--color-gray)"}
                        >
                          <TrashIcon />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div style={{ textAlign: "center", padding: "40px", color: "var(--color-gray)", background: "rgba(0,0,0,0.1)", borderRadius: "12px" }}>
                No expenses found for this filter.
              </div>
            )}
          </div>
        </div>

        <div className="sticky-col chart-col">
          {filteredExpenses.length > 0 && (
            <div className="card" style={{ margin: 0, padding: "24px" }}>
              <h3 style={{ margin: "0 0 16px 0", fontSize: "1.2rem", textAlign: "center" }}>Breakdown</h3>
              <div style={{ width: "100%", height: "250px", overflow: "hidden" }}>
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
        </div>

      </div>

      {editingExpense && (
        <div className="modal-overlay">
          <div className="modal-content card" style={{ maxWidth: "450px", width: "90%", padding: "24px", margin: 0 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
              <h3 style={{ margin: 0, fontSize: "1.5rem" }}>Edit Expense</h3>
              <button 
                type="button" 
                onClick={() => setEditingExpense(null)} 
                style={{ background: "transparent", border: "none", color: "var(--color-gray)", padding: 0, cursor: "pointer", width: "auto", boxShadow: "none" }}
                onMouseEnter={(e) => e.currentTarget.style.color = "var(--color-coral)"} 
                onMouseLeave={(e) => e.currentTarget.style.color = "var(--color-gray)"}
              >
                <XIcon />
              </button>
            </div>
            
            <form onSubmit={handleUpdateExpense} className="column-form" style={{ maxWidth: "100%" }}>
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
                <input type="checkbox" checked={editingExpense.is_public} onChange={(e) => setEditingExpense({...editingExpense, is_public: e.target.checked})} style={{ width: "auto", margin: 0 }} />
                <label>Make Public</label>
              </div>

              <div className="file-input-wrapper">
                <input type="file" id="edit-receipt" accept="image/*" onChange={(e) => handleFileChange(e, true)} />
                <label htmlFor="edit-receipt" className="file-input-button">Replace Attachment</label>
              </div>

              {(editingExpense.preview || editingExpense.image_url) && (
                <div style={{ position: "relative", marginTop: "10px" }}>
                  <img src={editingExpense.preview || `http://localhost:5000${editingExpense.image_url}`} style={{ width: "100%", borderRadius: "8px", height: "100px", objectFit: "cover" }} />
                </div>
              )}

              <button type="submit" style={{ width: "100%", marginTop: "16px" }}>Save Changes</button>
            </form>
          </div>
        </div>
      )}

      {viewingImage && (
        <div className="modal-overlay" onClick={() => setViewingImage(null)} style={{ zIndex: 10000 }}>
          <div 
            className="modal-content" 
            style={{ position: "relative", maxWidth: "90vw", maxHeight: "90vh", display: "flex", justifyContent: "center", alignItems: "center", background: "transparent", border: "none", padding: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              type="button" 
              className="image-viewer-close"
              onClick={() => setViewingImage(null)} 
            >
              <XIcon />
            </button>
            <img 
              src={viewingImage} 
              alt="Attachment Full Size" 
              style={{ maxWidth: "100%", maxHeight: "85vh", borderRadius: "12px", objectFit: "contain", background: "var(--color-navy)", border: "1px solid rgba(139, 66, 82, 0.5)", boxShadow: "0 24px 48px rgba(0,0,0,0.5)" }} 
            />
          </div>
        </div>
      )}
    </div>
  );
}