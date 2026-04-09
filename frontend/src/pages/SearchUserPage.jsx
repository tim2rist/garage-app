import { useState } from "react";
import { Link } from "react-router-dom";

const SearchIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const UserIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

export default function SearchUserPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  async function handleSearch(e) {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    setIsSearching(true);
    setHasSearched(true);

    try {
      setTimeout(() => {
        setUsers([{ publicUserId: searchTerm, username: "Garage Owner" }]);
        setIsSearching(false);
      }, 500);
    } catch (error) {
      setUsers([]);
      setIsSearching(false);
    }
  }

  return (
    <div className="search-page">
      <div className="search-header">
        <h2>Search Users</h2>
        <p>Find other car enthusiasts by their User ID</p>
      </div>

      <form onSubmit={handleSearch} className="search-box">
        <div className="search-input-wrapper">
          <SearchIcon />
          <input
            type="text"
            placeholder="Enter User ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            required
          />
        </div>
        <button type="submit" disabled={isSearching} className="search-btn">
          {isSearching ? "Searching..." : "Search"}
        </button>
      </form>

      {hasSearched && (
        <div className="search-results">
          {users.length > 0 ? (
            <div className="users-grid">
              {users.map((user) => (
                <div key={user.publicUserId} className="user-card">
                  <div className="user-card-avatar">
                    <UserIcon />
                  </div>
                  <div className="user-card-info">
                    <h3>{user.username || user.publicUserId}</h3>
                    <span className="user-role">Public Profile</span>
                  </div>
                  <Link to={`/profile/${user.publicUserId}`} className="view-profile-btn">
                    View Garage
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p>No users found matching "{searchTerm}"</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}