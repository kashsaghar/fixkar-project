// src/pages/Auth.jsx
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { authAPI } from "../utils/api";

const Auth = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || "/";

  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    role: "seeker",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // If user already logged in, redirect away from auth page
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user) navigate("/");
  }, [navigate]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const toggleForm = () => {
    setIsLogin((s) => !s);
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isLogin) {
        // LOGIN: only email + password
        const { email, password } = formData;
        const data = await authAPI.login(email, password);

        // data expected: { token, user: { id, name, email, role } }
        if (!data || !data.token) throw new Error("Invalid server response");

        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));

        // redirect by role or return path
        if (data.user?.role === "admin") {
          navigate("/admin");
        } else {
          // if user was trying to access protected page, go back to it
          navigate(from);
        }
      } else {
        // REGISTER: only seeker/provider allowed from UI
        if (formData.role === "admin") {
          setError("Admin account cannot be created from registration.");
          setLoading(false);
          return;
        }

        const data = await authAPI.register({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          phone: formData.phone,
          role: formData.role,
        });

        if (!data || !data.token) throw new Error("Invalid server response");

        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));

        // After register, redirect to homepage (never admin)
        navigate("/");
      }
    } catch (err) {
      // err may be object from backend, support both shapes
      const msg =
        err?.message ||
        (err?.message ? err.message : err?.message ?? JSON.stringify(err));
      setError(err?.message || err?.error || "An error occurred");
      console.error("Auth error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form-container">
        <h2>{isLogin ? "Login" : "Register"}</h2>

        {error && (
          <div className="error-message" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <>
              <div className="form-group">
                <label>Name</label>
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Phone</label>
                <input
                  name="phone"
                  type="tel"
                  pattern="03[0-9]{9}"
                  placeholder="e.g. 03001234567"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Role</label>
                <select
                  className="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  required
                >
                  <option value="seeker">Service Seeker</option>
                  <option value="provider">Service Provider</option>
                </select>
              </div>
            </>
          )}

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? "Processing..." : isLogin ? "Login" : "Register"}
          </button>
        </form>

        <p className="toggle-form">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button type="button" onClick={toggleForm} className="link-like">
            {isLogin ? "Register" : "Login"}
          </button>
        </p>
      </div>
    </div>
  );
};

export default Auth;
