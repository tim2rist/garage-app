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
      const res = await fetch(`http://localhost:5000/api/profile/search/${searchTerm}`);
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      } else {
        setUsers([]);
      }
    } catch (error) {
      console.error(error);
      setUsers([]);
    } finally {
      setIsSearching(false);
    }
  }

  return (
    <div className="container search-page">
      <div className="search-header" style={{ textAlign: 'center', marginBottom: '32px' }}>
        <h2 style={{ fontSize: '2rem', margin: 0 }}>Community</h2>
        <p style={{ color: 'var(--color-gray)', marginTop: '4px' }}>Search for other garage owners</p>
      </div>

      <form onSubmit={handleSearch} className="search-box">
        <div className="search-input-wrapper">
          <SearchIcon />
          <input
            type="text"
            placeholder="User ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            required
          />
        </div>
        <button type="submit" disabled={isSearching} className="search-btn">
          {isSearching ? "..." : "Find"}
        </button>
      </form>

      {hasSearched && (
        <div className="search-results">
          {users.length > 0 ? (
            <div className="users-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {users.map((user) => (
                <div key={user.public_user_id} className="card flicker-in" style={{ padding: '16px', textAlign: 'center', margin: 0, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{ 
                    width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(226, 104, 88, 0.1)', 
                    display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px', overflow: 'hidden' 
                  }}>
                    {user.avatar_url ? (
                      <img src={`http://localhost:5000${user.avatar_url}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <UserIcon />
                    )}
                  </div>
                  <h3 style={{ fontSize: '1rem', margin: '0 0 4px 0', color: 'var(--color-text)', wordBreak: 'break-all' }}>{user.public_user_id}</h3>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-gray)', marginBottom: '16px', display: 'block' }}>Enthusiast</span>
                  <Link to={`/profile/${user.public_user_id}`} style={{ 
                    textDecoration: 'none', background: 'var(--color-coral)', color: '#fff', 
                    padding: '8px 12px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: '700', width: '100%' 
                  }}>
                    Garage
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', color: 'var(--color-gray)', padding: '40px 0' }}>
              No owners found with that ID
            </div>
          )}
        </div>
      )}
    </div>
  );
}