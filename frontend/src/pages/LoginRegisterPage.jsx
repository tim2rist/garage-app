import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function LoginRegisterPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      setTimeout(() => {
        localStorage.setItem("token", "dummy_token");
        localStorage.setItem("publicUserId", username || email.split('@')[0]);
        navigate("/garage");
      }, 800);
    } catch (error) {
      console.error("Auth failed", error);
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
          
          <form onSubmit={handleSubmit} className="column-form auth-form">
            {!isLogin && (
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            )}
            
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            
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
                onClick={() => setIsLogin(!isLogin)}
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