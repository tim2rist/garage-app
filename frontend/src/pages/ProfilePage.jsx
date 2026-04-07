import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { userApi } from "../api";

export default function ProfilePage() {
  const { publicUserId } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    userApi.get(`/users/profile/${publicUserId}`)
      .then((res) => {
        setProfile(res.data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [publicUserId]);

  if (loading) {
    return (
      <div className="page-loader">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="error-state">
        <h2>Profile not found</h2>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="profile-header">
        <div className="profile-avatar">
          {profile.user.publicUserId.charAt(0).toUpperCase()}
        </div>
        <h2>{profile.user.publicUserId}</h2>
      </div>

      <div className="profile-content">
        <h3 className="section-title">Garage</h3>
        
        {profile.cars && profile.cars.length > 0 ? (
          <div className="profile-cars-list">
            {profile.cars.map((car) => (
              <div key={car.id} className="profile-car-card">
                <div className="car-card-header">
                  <h4>{car.brand} {car.model}</h4>
                  <span className="car-year">{car.year || "N/A"}</span>
                </div>

                <div className="expenses-section">
                  <h5>Expenses</h5>
                  {car.expenses && car.expenses.length > 0 ? (
                    <ul className="expenses-list">
                      {car.expenses.map((expense) => (
                        <li key={expense.id} className="expense-item">
                          <div className="expense-info">
                            <span className="expense-type">{expense.expense_type}</span>
                            <span className="expense-desc">{expense.description}</span>
                          </div>
                          <span className="expense-amount">{expense.amount}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="no-expenses">No expenses recorded yet.</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="empty-state">This user has no cars in their garage.</p>
        )}
      </div>
    </div>
  );
}