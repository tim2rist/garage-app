import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function LoginRegisterPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [loginMethod, setLoginMethod] = useState("email");
  const [loginId, setLoginId] = useState(""); 
  const [loginEmail, setLoginEmail] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  
  const navigate = useNavigate();

  const isValidEmail = (emailStr) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(emailStr);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");
    
    if (!isLogin && !isValidEmail(email)) {
      setErrorMessage("Please enter a valid email address.");
      setIsLoading(false);
      return;
    }
    
    const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";
    let payload = isLogin 
      ? { identifier: loginMethod === "email" ? loginEmail : loginId, password }
      : { email, password, username };

    try {
      const response = await fetch(`https://garage-app-8r7w.onrender.com${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Authentication failed");

      localStorage.setItem("token", data.token);
      localStorage.setItem("publicUserId", data.publicUserId);
      navigate(`/profile/${data.publicUserId}`);
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container" style={{ display: "flex", flexDirection: "column", justifyContent: "center", minHeight: "80vh" }}>
      <div className="auth-header" style={{ marginBottom: "32px" }}>
        <h1 style={{ fontSize: "2.5rem", fontWeight: "800", color: "var(--color-coral)", marginBottom: "8px" }}>Car Garage</h1>
        <p style={{ color: "var(--color-gray)", fontSize: "1rem" }}>Track expenses, manage your fleet</p>
      </div>

      <div className="card" style={{ padding: "24px", maxWidth: "400px", margin: "0 auto", width: "100%" }}>
        <h2 style={{ fontSize: "1.5rem", marginBottom: "24px", textAlign: "center" }}>
          {isLogin ? "Welcome Back" : "Create Account"}
        </h2>
        
        {errorMessage && (
          <div style={{ color: "var(--color-coral)", fontSize: "0.9rem", textAlign: "center", marginBottom: "16px", padding: "10px", border: "1px solid rgba(226, 104, 88, 0.2)", borderRadius: "8px" }}>
            {errorMessage}
          </div>
        )}
        
        {isLogin && (
          <div style={{ display: "flex", background: "rgba(0,0,0,0.2)", borderRadius: "12px", padding: "4px", marginBottom: "20px" }}>
            <button 
              type="button" 
              onClick={() => setLoginMethod("email")}
              style={{ 
                flex: 1, padding: "8px", fontSize: "0.85rem", borderRadius: "8px", boxShadow: "none", transform: "none",
                background: loginMethod === "email" ? "var(--color-coral)" : "transparent",
                color: loginMethod === "email" ? "#fff" : "var(--color-gray)"
              }}
            >Email</button>
            <button 
              type="button" 
              onClick={() => setLoginMethod("id")}
              style={{ 
                flex: 1, padding: "8px", fontSize: "0.85rem", borderRadius: "8px", boxShadow: "none", transform: "none",
                background: loginMethod === "id" ? "var(--color-coral)" : "transparent",
                color: loginMethod === "id" ? "#fff" : "var(--color-gray)"
              }}
            >Public ID</button>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {!isLogin ? (
            <>
              <input type="text" placeholder="Username (Public ID)" value={username} onChange={(e) => setUsername(e.target.value)} required style={{ padding: "14px" }} />
              <input type="email" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ padding: "14px" }} />
            </>
          ) : (
            <input 
              type={loginMethod === "email" ? "email" : "text"} 
              placeholder={loginMethod === "email" ? "Enter Email" : "Enter Public ID"} 
              value={loginMethod === "email" ? loginEmail : loginId} 
              onChange={(e) => loginMethod === "email" ? setLoginEmail(e.target.value) : setLoginId(e.target.value)} 
              required 
              style={{ padding: "14px" }}
            />
          )}
          
          <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ padding: "14px" }} />
          
          <button type="submit" disabled={isLoading} style={{ marginTop: "12px", padding: "14px" }}>
            {isLoading ? "Please wait..." : (isLogin ? "Sign In" : "Sign Up")}
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: "24px" }}>
          <p style={{ color: "var(--color-gray)", fontSize: "0.9rem" }}>
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <span 
              onClick={() => { setIsLogin(!isLogin); setErrorMessage(""); setPassword(""); }}
              style={{ color: "var(--color-coral)", fontWeight: "600", cursor: "pointer", textDecoration: "underline" }}
            >
              {isLogin ? "Register" : "Login"}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}