import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { authHeader, garageApi } from "../api";

const BackIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12"/>
    <polyline points="12 19 5 12 12 5"/>
  </svg>
);

const ImageIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
    <circle cx="8.5" cy="8.5" r="1.5"/>
    <polyline points="21 15 16 10 5 21"/>
  </svg>
);

export default function CarDetailsPage() {
  const { carId } = useParams();
  const [expenses, setExpenses] = useState([]);
  const [form, setForm] = useState({
    expenseType: "fuel",
    customExpenseType: "",
    amount: "",
    description: "",
    expenseDate: ""
  });
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  async function loadExpenses() {
    try {
      const { data } = await garageApi.get(`/expenses/cars/${carId}`, { headers: authHeader() });
      setExpenses(data);
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    loadExpenses();
  }, [carId]);

  function handleImageChange(e) {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      setImage(null);
      setPreviewUrl(null);
    }
  }

  async function addExpense(e) {
    e.preventDefault();
    const body = new FormData();
    
    const finalExpenseType = form.expenseType === "custom" ? form.customExpenseType : form.expenseType;
    
    body.append("expenseType", finalExpenseType);
    body.append("amount", form.amount);
    body.append("description", form.description);
    body.append("expenseDate", form.expenseDate);
    if (image) body.append("image", image);

    try {
      await garageApi.post(`/expenses/cars/${carId}`, body, {
        headers: { ...authHeader(), "Content-Type": "multipart/form-data" }
      });
      setForm({ expenseType: "fuel", customExpenseType: "", amount: "", description: "", expenseDate: "" });
      setImage(null);
      setPreviewUrl(null);
      loadExpenses();
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <div>
      <Link to="/garage" className="back-link">
        <BackIcon /> Back to Garage
      </Link>
      
      <div className="car-details-header">
        <h2>Car Expenses</h2>
      </div>

      <div className="car-details-wrapper">
        <div className="expense-form-column">
          <div className="card">
            <h3 className="add-car-title">Add New Expense</h3>
            <form onSubmit={addExpense} className="column-form">
              <select 
                value={form.expenseType} 
                onChange={(e) => setForm({ ...form, expenseType: e.target.value })}
              >
                <option value="fuel">Fuel</option>
                <option value="service">Service</option>
                <option value="repair">Repair</option>
                <option value="insurance">Insurance</option>
                <option value="custom">Other (Custom)</option>
              </select>

              {form.expenseType === "custom" && (
                <input 
                  placeholder="Enter custom category" 
                  required
                  value={form.customExpenseType} 
                  onChange={(e) => setForm({ ...form, customExpenseType: e.target.value })} 
                />
              )}
              
              <input 
                placeholder="Amount (e.g. 50.00)" 
                required
                value={form.amount} 
                onChange={(e) => setForm({ ...form, amount: e.target.value })} 
              />
              
              <input 
                placeholder="Description" 
                required
                value={form.description} 
                onChange={(e) => setForm({ ...form, description: e.target.value })} 
              />
              
              <input 
                type="date" 
                required
                value={form.expenseDate} 
                onChange={(e) => setForm({ ...form, expenseDate: e.target.value })} 
              />
              
              <div className="file-input-wrapper">
                <label className="file-input-button">
                  {image ? image.name : "Upload Receipt/Image"}
                  <input 
                    type="file" 
                    onChange={handleImageChange} 
                    accept="image/*"
                  />
                </label>
                {previewUrl && (
                  <div className="image-preview-container">
                    <img src={previewUrl} alt="Preview" className="image-preview" />
                    <button 
                      type="button" 
                      className="remove-image-btn" 
                      onClick={() => {
                        setImage(null);
                        setPreviewUrl(null);
                      }}
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>

              <button type="submit">Add Expense</button>
            </form>
          </div>
        </div>

        <div className="expense-list-column">
          <h3 className="section-title">History</h3>
          {expenses.length === 0 ? (
            <p className="empty-state">No expenses recorded yet.</p>
          ) : (
            <div className="expense-history-list">
              {expenses.map((expense) => (
                <div key={expense.id} className="expense-history-item">
                  <div className="expense-main-info">
                    <span className="expense-type-badge">{expense.expense_type}</span>
                    <span className="expense-desc">{expense.description}</span>
                    <div className="expense-meta">
                      {expense.expense_date && <span>{new Date(expense.expense_date).toLocaleDateString()}</span>}
                    </div>
                  </div>
                  
                  <div className="expense-amount-large">
                    <span>{expense.amount}</span>
                    {expense.image_url && (
                      <a href={expense.image_url} target="_blank" rel="noreferrer" className="expense-image-btn">
                        <ImageIcon /> View
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}