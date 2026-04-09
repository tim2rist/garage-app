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
      setErrorMessage("Please enter a valid full email address.");
      setIsLoading(false);
      return;
    }
    
    const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";
    
    let payload;
    if (isLogin) {
      payload = { 
        identifier: loginMethod === "email" ? loginEmail : loginId, 
        password 
      };
    } else {
      payload = { email, password, username };
    }

    try {
      const response = await fetch(`http://localhost:5000${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Authentication failed");
      }

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
    <div className="auth-page-wrapper">
      <div className="auth-header">
        <h1>Car Garage</h1>
        <p>Manage your cars and track expenses easily</p>
      </div>

      <div className="auth-card-container">
        <div className="card auth-card">
          <h2 className="auth-card-title">
            {isLogin ? "Welcome Back" : "Create Account"}
          </h2>
          
          {errorMessage && (
            <div className="status-message" style={{ marginBottom: "16px", borderColor: "var(--color-coral)", color: "var(--color-coral)", background: "transparent" }}>
              {errorMessage}
            </div>
          )}
          
          {isLogin && (
            <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
              <button 
                type="button" 
                onClick={() => setLoginMethod("email")}
                style={{ 
                  flex: 1, 
                  background: loginMethod === "email" ? "var(--color-coral)" : "transparent",
                  color: loginMethod === "email" ? "#fff" : "var(--color-coral)", /* <-- Добавили цвет текста */
                  border: "1px solid var(--color-coral)",
                  padding: "8px",
                  fontSize: "0.9rem"
                }}
              >
                Email
              </button>
              <button 
                type="button" 
                onClick={() => setLoginMethod("id")}
                style={{ 
                  flex: 1, 
                  background: loginMethod === "id" ? "var(--color-coral)" : "transparent",
                  color: loginMethod === "id" ? "#fff" : "var(--color-coral)", /* <-- Добавили цвет текста */
                  border: "1px solid var(--color-coral)",
                  padding: "8px",
                  fontSize: "0.9rem"
                }}
              >
                Public ID
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="column-form auth-form">
            {!isLogin ? (
              <>
                <input
                  type="text"
                  placeholder="Username (Public ID)"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
                <input
                  type="email"
                  placeholder="Email address (e.g. user@gmail.com)"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </>
            ) : (
              <>
                {loginMethod === "email" ? (
                  <input
                    type="email"
                    placeholder="Enter your Email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    required
                  />
                ) : (
                  <input
                    type="text"
                    placeholder="Enter your Public ID"
                    value={loginId}
                    onChange={(e) => setLoginId(e.target.value)}
                    required
                  />
                )}
              </>
            )}
            
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            
            <button type="submit" disabled={isLoading}>
              {isLoading ? "Please wait..." : (isLogin ? "Login" : "Register")}
            </button>
          </form>

          <div className="auth-toggle">
            <p>
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button 
                type="button" 
                className="toggle-link-btn"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setErrorMessage("");
                  setPassword("");
                }}
              >
                {isLogin ? "Register here" : "Login here"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}