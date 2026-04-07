import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { authHeader, garageApi } from "../api";

export default function CarDetailsPage() {
  const { carId } = useParams();
  const [expenses, setExpenses] = useState([]);
  const [form, setForm] = useState({
    expenseType: "fuel",
    amount: "",
    description: "",
    expenseDate: ""
  });
  const [image, setImage] = useState(null);

  async function loadExpenses() {
    const { data } = await garageApi.get(`/expenses/cars/${carId}`, { headers: authHeader() });
    setExpenses(data);
  }

  useEffect(() => {
    loadExpenses().catch(() => {});
  }, [carId]);

  async function addExpense(e) {
    e.preventDefault();
    const body = new FormData();
    body.append("expenseType", form.expenseType);
    body.append("amount", form.amount);
    body.append("description", form.description);
    body.append("expenseDate", form.expenseDate);
    if (image) body.append("image", image);

    await garageApi.post(`/expenses/cars/${carId}`, body, {
      headers: { ...authHeader(), "Content-Type": "multipart/form-data" }
    });
    setForm({ expenseType: "fuel", amount: "", description: "", expenseDate: "" });
    setImage(null);
    loadExpenses();
  }

  return (
    <div>
      <h2>Car Expenses</h2>
      <form onSubmit={addExpense} className="column-form">
        <select value={form.expenseType} onChange={(e) => setForm({ ...form, expenseType: e.target.value })}>
          <option value="fuel">fuel</option>
          <option value="service">service</option>
          <option value="repair">repair</option>
          <option value="insurance">insurance</option>
        </select>
        <input placeholder="Amount" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
        <input placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        <input type="date" value={form.expenseDate} onChange={(e) => setForm({ ...form, expenseDate: e.target.value })} />
        <input type="file" onChange={(e) => setImage(e.target.files[0])} />
        <button type="submit">Add Expense</button>
      </form>

      <ul>
        {expenses.map((expense) => (
          <li key={expense.id}>
            <strong>{expense.expense_type}</strong> - {expense.amount} - {expense.description}
            {expense.image_url && (
              <div>
                <a href={expense.image_url} target="_blank" rel="noreferrer">Image</a>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
