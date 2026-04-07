import { useState } from "react";
import { Link } from "react-router-dom";
import { userApi } from "../api";

export default function SearchUserPage() {
  const [q, setQ] = useState("");
  const [users, setUsers] = useState([]);

  async function search() {
    const { data } = await userApi.get(`/users/search?q=${encodeURIComponent(q)}`);
    setUsers(data);
  }

  return (
    <div>
      <h2>Search Users</h2>
      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by userId" />
      <button onClick={search}>Search</button>
      <ul>
        {users.map((u) => (
          <li key={u.public_user_id}>
            <Link to={`/profile/${u.public_user_id}`}>{u.public_user_id}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
