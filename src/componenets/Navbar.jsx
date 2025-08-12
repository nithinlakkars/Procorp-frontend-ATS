import React from "react";
import { useNavigate } from "react-router-dom";
import procorp_logo from "../assets/procorp_logo.jpeg";

const Navbar = () => {
  const navigate = useNavigate();

  const logout = () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("role");
    sessionStorage.removeItem("user");
    navigate("/");
  };

  return (
    <nav className="navbar navbar-light bg-light">
      <div className="container-fluid d-flex justify-content-between align-items-center">
        <div className="d-flex align-items-center">
          {/* <img src={procorp_logo} alt="ProCorp Logo" height={50} />
          <span className="ms-2 d-flex align-items-baseline" style={{ fontWeight: "bold", fontSize: "2rem" }}>
            <span style={{ color: "black" }}>Pro</span>
            <span style={{ color: "black" }}>Corp</span>
            <span className="ms-2" style={{ fontSize: "2rem", color: "black" }}>ATS</span>
          </span> */}
        </div>

        <button
          className="btn btn-outline-danger"
          type="button"
          onClick={logout}
        >
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
