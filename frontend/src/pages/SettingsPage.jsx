import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function SettingsPage() {
  const navigate = useNavigate();
  
  const [publicId, setPublicId] = useState("");
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  
  const [profileMsg, setProfileMsg] = useState({ text: "", type: "" });
  const [passMsg, setPassMsg] = useState({ text: "", type: "" });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch("http://localhost:5000/api/settings/me", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setPublicId(data.public_user_id);
        if (data.avatar_url) {
          setAvatarPreview(`http://localhost:5000${data.avatar_url}`);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setProfileMsg({ text: "", type: "" });
    
    const token = localStorage.getItem("token");
    const formData = new FormData();
    formData.append("public_user_id", publicId);
    if (avatarFile) formData.append("avatar", avatarFile);

    try {
      const res = await fetch("http://localhost:5000/api/settings/profile", {
        method: "PUT",
        headers: { "Authorization": `Bearer ${token}` },
        body: formData
      });
      
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error);
      
      localStorage.setItem("publicUserId", data.public_user_id);
      setProfileMsg({ text: "Profile updated successfully!", type: "success" });
      
      setTimeout(() => window.location.reload(), 1000); 
    } catch (err) {
      setProfileMsg({ text: err.message, type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setPassMsg({ text: "", type: "" });

    const token = localStorage.getItem("token");
    try {
      const res = await fetch("http://localhost:5000/api/settings/password", {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` 
        },
        body: JSON.stringify({ currentPassword, newPassword })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      setPassMsg({ text: "Password changed successfully!", type: "success" });
      setCurrentPassword("");
      setNewPassword("");
    } catch (err) {
      setPassMsg({ text: err.message, type: "error" });
    }
  };

  return (
    <div className="centered-content" style={{ maxWidth: "600px" }}>
      <h2 style={{ fontSize: "2.5rem", marginBottom: "32px" }}>Settings</h2>

      <div className="card" style={{ marginBottom: "24px" }}>
        <h3 style={{ marginBottom: "24px", fontSize: "1.5rem" }}>Profile Information</h3>
        {profileMsg.text && (
          <div className="status-message" style={{ color: profileMsg.type === "error" ? "var(--color-coral)" : "#4ECDC4" }}>
            {profileMsg.text}
          </div>
        )}
        
        <form onSubmit={handleUpdateProfile} className="column-form">
          <div style={{ display: "flex", alignItems: "center", gap: "20px", marginBottom: "16px" }}>
            <div style={{ 
              width: "80px", height: "80px", borderRadius: "50%", background: "var(--color-plum)", 
              display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", border: "2px solid var(--color-coral)"
            }}>
              {avatarPreview ? (
                <img src={avatarPreview} alt="Avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <span style={{ fontSize: "2rem", fontWeight: "bold" }}>{publicId.charAt(0).toUpperCase()}</span>
              )}
            </div>
            <div className="file-input-wrapper" style={{ flex: 1 }}>
              <input type="file" id="avatar-upload" accept="image/*" onChange={handleAvatarChange} />
              <label htmlFor="avatar-upload" className="file-input-button" style={{ margin: 0 }}>
                Choose New Avatar
              </label>
            </div>
          </div>

          <label style={{ color: "var(--color-gray)", fontSize: "0.9rem", marginBottom: "-8px" }}>Public User ID (Searchable by others)</label>
          <input 
            type="text" 
            value={publicId} 
            onChange={(e) => setPublicId(e.target.value)} 
            required 
          />
          
          <button type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : "Save Profile"}
          </button>
        </form>
      </div>

      <div className="card">
        <h3 style={{ marginBottom: "24px", fontSize: "1.5rem" }}>Change Password</h3>
        {passMsg.text && (
          <div className="status-message" style={{ color: passMsg.type === "error" ? "var(--color-coral)" : "#4ECDC4" }}>
            {passMsg.text}
          </div>
        )}
        
        <form onSubmit={handleUpdatePassword} className="column-form">
          <input 
            type="password" 
            placeholder="Current Password" 
            value={currentPassword} 
            onChange={(e) => setCurrentPassword(e.target.value)} 
            required 
          />
          <input 
            type="password" 
            placeholder="New Password" 
            value={newPassword} 
            onChange={(e) => setNewPassword(e.target.value)} 
            required 
            minLength="6"
          />
          <button type="submit">Update Password</button>
        </form>
      </div>
    </div>
  );
}