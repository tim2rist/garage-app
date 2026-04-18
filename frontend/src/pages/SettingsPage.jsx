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
      const res = await fetch("https://garage-app-8r7w.onrender.com/api/settings/me", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setPublicId(data.public_user_id);
        if (data.avatar_url) {
          setAvatarPreview(`https://garage-app-8r7w.onrender.com${data.avatar_url}`);
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
      const res = await fetch("https://garage-app-8r7w.onrender.com/api/settings/profile", {
        method: "PUT",
        headers: { "Authorization": `Bearer ${token}` },
        body: formData
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      localStorage.setItem("publicUserId", data.public_user_id);
      setProfileMsg({ text: "Profile updated!", type: "success" });
      setTimeout(() => window.location.reload(), 800);
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
      const res = await fetch("https://garage-app-8r7w.onrender.com/api/settings/password", {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` 
        },
        body: JSON.stringify({ currentPassword, newPassword })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setPassMsg({ text: "Password changed!", type: "success" });
      setCurrentPassword("");
      setNewPassword("");
    } catch (err) {
      setPassMsg({ text: err.message, type: "error" });
    }
  };

  return (
    <div className="container" style={{ paddingBottom: '40px' }}>
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <h2 style={{ fontSize: '2rem', margin: 0 }}>Settings</h2>
        <p style={{ color: 'var(--color-gray)', marginTop: '4px' }}>Personalize your garage profile</p>
      </div>

      <div className="card" style={{ padding: '24px', marginBottom: '20px' }}>
        <h3 style={{ fontSize: '1.2rem', marginBottom: '20px', color: 'var(--color-coral)' }}>Profile Info</h3>
        
        {profileMsg.text && (
          <div style={{ 
            textAlign: 'center', padding: '10px', borderRadius: '8px', marginBottom: '16px', fontSize: '0.9rem',
            background: profileMsg.type === 'error' ? 'rgba(226, 104, 88, 0.1)' : 'rgba(78, 205, 196, 0.1)',
            color: profileMsg.type === 'error' ? 'var(--color-coral)' : '#4ECDC4',
            border: `1px solid ${profileMsg.type === 'error' ? 'var(--color-coral)' : '#4ECDC4'}`
          }}>
            {profileMsg.text}
          </div>
        )}

        <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <div style={{ 
              width: '100px', height: '100px', borderRadius: '50%', background: 'var(--color-navy)', 
              display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', border: '3px solid var(--color-coral)'
            }}>
              {avatarPreview ? (
                <img src={avatarPreview} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <span style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--color-coral)' }}>
                  {publicId ? publicId.charAt(0).toUpperCase() : "?"}
                </span>
              )}
            </div>
            <input type="file" id="avatar-upload" accept="image/*" onChange={handleAvatarChange} style={{ display: 'none' }} />
            <label htmlFor="avatar-upload" style={{ color: 'var(--color-coral)', fontSize: '0.9rem', fontWeight: '600', cursor: 'pointer' }}>
              Change Photo
            </label>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.8rem', color: 'var(--color-gray)', paddingLeft: '4px' }}>Public User ID</label>
            <input type="text" value={publicId} onChange={(e) => setPublicId(e.target.value)} required />
          </div>
          
          <button type="submit" disabled={isLoading} style={{ marginTop: '8px' }}>
            {isLoading ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>

      <div className="card" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1.2rem', marginBottom: '20px', color: 'var(--color-coral)' }}>Security</h3>
        
        {passMsg.text && (
          <div style={{ 
            textAlign: 'center', padding: '10px', borderRadius: '8px', marginBottom: '16px', fontSize: '0.9rem',
            background: passMsg.type === 'error' ? 'rgba(226, 104, 88, 0.1)' : 'rgba(78, 205, 196, 0.1)',
            color: passMsg.type === 'error' ? 'var(--color-coral)' : '#4ECDC4',
            border: `1px solid ${passMsg.type === 'error' ? 'var(--color-coral)' : '#4ECDC4'}`
          }}>
            {passMsg.text}
          </div>
        )}

        <form onSubmit={handleUpdatePassword} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <input type="password" placeholder="Current Password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required />
          <input type="password" placeholder="New Password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required minLength="6" />
          <button type="submit" style={{ marginTop: '8px', background: 'transparent', border: '1px solid var(--color-coral)', color: 'var(--color-coral)' }}>
            Update Password
          </button>
        </form>
      </div>
    </div>
  );
}