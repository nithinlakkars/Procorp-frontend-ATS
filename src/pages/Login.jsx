import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import { loginUser } from "../services";

export default function Login() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setErrorMsg("");

  try {
    const res = await loginUser(formData);
    if (res.status) {
      alert(res.message || "✅ Login successful");
      const { role, token, email } = res;

      sessionStorage.setItem("token", token);
      sessionStorage.setItem("role", role);
      sessionStorage.setItem("user", JSON.stringify({ email })); // ✅ FIXED

      if (role === "recruiter") navigate("/recruitersubmit");
      else if (role === "lead") navigate("/LeadDashboard");
      else if (role === "admin") navigate("/salesDashboard");
      else navigate("/");
    } else {
      alert(res.error || "❌ Login failed");
      return;
    }
  } catch (err) {
    setErrorMsg(
      err.response?.data?.error || "❌ Login failed. Please try again."
    );
  }
};


  return (
    <div className="container mt-5" style={{ maxWidth: "500px" }}>
      <h2 className="text-center mb-4">Login</h2>

      {errorMsg && <div className="alert alert-danger">{errorMsg}</div>}

      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label>Email</label>
          <input
            type="email"
            name="email"
            className="form-control"
            placeholder="Enter email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-3">
          <label>Password</label>
          <input
            type="password"
            name="password"
            className="form-control"
            placeholder="Enter password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>

        <button type="submit" className="btn btn-primary w-100">
          Login
        </button>
      </form>

      <div className="text-center mt-3">
        <span>Don't have an account? </span>
        <Link to="/register">Register here</Link>
      </div>
    </div>
  );
}
