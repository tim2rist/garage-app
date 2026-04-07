import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { userApi } from "../api";

export default function ProfilePage() {
  const { publicUserId } = useParams();
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    userApi.get(`/users/profile/${publicUserId}`).then((res) => setProfile(res.data)).catch(() => {});
  }, [publicUserId]);

  if (!profile) return <p>Loading profile...</p>;

  return (
    <div>
      <h2>Profile: {profile.user.publicUserId}</h2>
      {profile.cars.map((car) => (
        <div key={car.id} className="card">
          <h3>{car.brand} {car.model} ({car.year || "n/a"})</h3>
          <ul>
            {car.expenses.map((expense) => (
              <li key={expense.id}>
                {expense.expense_type}: {expense.amount} - {expense.description}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
