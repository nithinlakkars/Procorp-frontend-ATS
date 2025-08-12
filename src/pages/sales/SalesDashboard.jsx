import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import RequirementForm from "./RequirementForm";
import PostedRequirements from "./PostedRequirements";
import ForwardedCandidates from "./ForwardedCandidates";
import Navbar from "../../componenets/Navbar";
import { Button, Tab, Tabs } from "react-bootstrap";
import SalesMainDashboard from "./salesmaindashboard";
import { FaTachometerAlt, FaUserTie } from "react-icons/fa";

export default function SalesDashboard() {
  const [activeView, setActiveView] = useState("taLead"); // "dashboard" or "taLead"
  const [form, setForm] = useState({
    title: "",
    description: "",
    leadEmails: [],
    recruiterEmails: [],
    locations: [],
    employmentType: "",
    workSetting: "",
    rate: "",
    primarySkills: "",
    priority: "",
    client: "",
    workAuthorization: "",
  });

  const [showForm, setShowForm] = useState(false);
  const [locationSearch, setLocationSearch] = useState("");
  const [search, setSearch] = useState("");
  const [postedCount, setPostedCount] = useState(0);
  const [forwardedCount, setForwardedCount] = useState(0);
  const [activeTab, setActiveTab] = useState("requirements");

  const rateRanges = [
    "$40-45/hr", "$45-50/hr", "$50-55/hr", "$55-60/hr", "$60-65/hr", "$65-70/hr", "$70-75/hr",
    "$75-80/hr", "$80-85/hr", "$85-90/hr", "$90-95/hr",
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleMultiCheckbox = (field, value) => {
    setForm((prev) => {
      const current = prev[field];
      return {
        ...prev,
        [field]: current.includes(value)
          ? current.filter((v) => v !== value)
          : [...current, value],
      };
    });
  };

  return (
    <div className="d-flex min-vh-100">

      <div className="bg-light p-3 border-end d-flex flex-column" style={{ width: "240px" }}>
        <h5 className="text-primary fw-bold mb-4">ProCorp ATS</h5>
        <ul className="nav flex-column fw-semibold">
          <li className="nav-item mb-2">
            <button
              className={`nav-link btn text-start d-flex align-items-center gap-2 ${activeView === "dashboard" ? "text-primary fw-bold" : "text-dark"
                }`}
              onClick={() => setActiveView("dashboard")}
            >
              <FaTachometerAlt />
              Dashboard
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link btn text-start d-flex align-items-center gap-2 ${activeView === "taLead" ? "text-primary fw-bold" : "text-dark"
                }`}
              onClick={() => setActiveView("taLead")}
            >
              <FaUserTie />
              TA Sales
            </button>
          </li>
        </ul>

        {/* Footer user info */}
        <div className="mt-auto pt-5">
          <div className="d-flex align-items-center gap-2">
            {/* <div className="bg-primary text-white rounded-circle p-2">SM</div> */}
            {/* <div>
        <div className="fw-semibold">salesmanager</div>
        <div className="text-muted" style={{ fontSize: "0.8rem" }}>Account Manager</div>
      </div> */}
          </div>
        </div>
      </div>


      {/* Main Content */}
      <div className="flex-grow-1 bg-light">
        <Navbar />

        {activeView === "dashboard" ? (
          <SalesMainDashboard />
        ) : (
          <div className="container py-4">
            <h2 className="fw-bold mb-2">Sales Manager Dashboard</h2>
            <p className="text-muted mb-4">
              Manage clients, requirements, and candidate submissions
            </p>

            <Tabs
              activeKey={activeTab}
              onSelect={(k) => setActiveTab(k)}
              className="mb-4 fw-semibold"
            >
              <Tab eventKey="requirements" title="Requirements">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <Button
                    variant="primary"
                    onClick={() => setShowForm(true)}
                  >
                    <i className="bi bi-plus-square"></i> New Requirement
                  </Button>
                </div>

                {showForm && (
                  <div className="card mb-4 p-3 border border-primary rounded">
                    <RequirementForm
                      form={form}
                      setForm={setForm}
                      locationSearch={locationSearch}
                      setLocationSearch={setLocationSearch}
                      handleChange={handleChange}
                      handleMultiCheckbox={handleMultiCheckbox}
                      rateRanges={rateRanges}
                    />
                    <div className="text-end mt-2">
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => setShowForm(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}

                <PostedRequirements
                  onCountUpdate={setPostedCount}
                  search={search}
                  locationFilter={locationSearch}
                />
              </Tab>

              <Tab eventKey="submissions" title="Candidate Submissions">
                <ForwardedCandidates onCountUpdate={setForwardedCount} />
              </Tab>
            </Tabs>
          </div>
        )}
      </div>
    </div>
  );
}
