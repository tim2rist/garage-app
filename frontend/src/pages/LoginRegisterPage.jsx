import { useState } from "react";
import { authApi } from "../api";

export default function LoginRegisterPage() {
  const [registerForm, setRegisterForm] = useState({ email: "", password: "", publicUserId: "" });
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");

  async function handleRegister(e) {
    e.preventDefault();
    try {
      const { data } = await authApi.post("/auth/register", registerForm);
      localStorage.setItem("token", data.token);
      setMessage("Registered successfully.");
    } catch (error) {
      setMessage(error.response?.data?.message || "Registration failed");
    }
  }

  async function handleLogin(e) {
    e.preventDefault();
    try {
      const { data } = await authApi.post("/auth/login", loginForm);
      localStorage.setItem("token", data.token);
      setMessage("Logged in successfully.");
    } catch (error) {
      setMessage(error.response?.data?.message || "Login failed");
    }
  }

  return (
    <div className="auth-page-wrapper">
      <div className="auth-header">
        <h1>Car Garage</h1>
        <p>Manage your cars and track expenses easily</p>
      </div>

      <div className="grid-2">
        <div className="card">
          <form onSubmit={handleRegister}>
            <h2 className="auth-card-title">Create Account</h2>
            <input 
              placeholder="Email" 
              type="email"
              required
              value={registerForm.email} 
              onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })} 
            />
            <input 
              placeholder="Password" 
              type="password" 
              required
              value={registerForm.password} 
              onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })} 
            />
            <input 
              placeholder="Public Username (ID)" 
              required
              value={registerForm.publicUserId} 
              onChange={(e) => setRegisterForm({ ...registerForm, publicUserId: e.target.value })} 
            />
            <button type="submit">Register</button>
          </form>
        </div>

        <div className="card">
          <form onSubmit={handleLogin}>
            <h2 className="auth-card-title">Welcome Back</h2>
            <input 
              placeholder="Email" 
              type="email"
              required
              value={loginForm.email} 
              onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })} 
            />
            <input 
              placeholder="Password" 
              type="password" 
              required
              value={loginForm.password} 
              onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })} 
            />
            <button type="submit">Login</button>
          </form>
        </div>
      </div>

      {message && <div className="status-message">{message}</div>}
    </div>
  );
}