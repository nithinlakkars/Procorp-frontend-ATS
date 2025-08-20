import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { FaTachometerAlt, FaUserTie } from "react-icons/fa";
import LeadPostedRequirements from "./LeadPostedRequirements";
import NewRequirementsSection from "./NewRequirementsSection";
import SubmittedCandidates from "./SubmittedCandidates";
import RequirementHistory from "./RequirementHistory";
import Newrequirmentform from "./newrequirmentform";
import LeadMainDashboard from "./leadmaindashboard";
import {
  fetchCandidates,
  fetchUnassignedRequirements,
  fetchRecruiters,
  forwardCandidateToSales,
  fetchAllRequirements, // 
} from "../../services";
import Navbar from "../../componenets/Navbar";

export default function LeadsDashboard() {
  const [requirements, setRequirements] = useState([]);
  const [recruiters, setRecruiters] = useState([]);
  const [message, setMessage] = useState("");
  const [activeSection, setActiveSection] = useState("newRequirements");
  const [candidates, setCandidates] = useState([]);
  const [leadEmail, setLeadEmail] = useState("");
  const [forwardedCount, setForwardedCount] = useState(0);
  const [selectedView, setSelectedView] = useState("accountManager");
  const [postedReqCount, setPostedReqCount] = useState(0);

  const [form, setForm] = useState({
    title: "",
    description: "",
    leadEmails: [],
    recruiterEmails: [],
    locations: [],
    employmentType: "",
    workSetting: "",
    duration: "",
    rate: "",
    primarySkills: "",
  });

  const [locationSearch, setLocationSearch] = useState("");

  const rateRanges = [
    "$40-45/hr", "$45-50/hr", "$50-55/hr", "$55-60/hr", "$60-65/hr",
    "$65-70/hr", "$70-75/hr", "$75-80/hr", "$80-85/hr", "$85-90/hr", "$90-95/hr",
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleMultiCheckbox = (field, value) => {
    setForm((prev) => {
      const arr = Array.isArray(prev[field]) ? prev[field] : [];
      return arr.includes(value)
        ? { ...prev, [field]: arr.filter((item) => item !== value) }
        : { ...prev, [field]: [...arr, value] };
    });
  };

  useEffect(() => {
    const user = sessionStorage.getItem("user");
    setLeadEmail(user);
    loadAllData(user);
  }, []);

  const loadAllData = async (userEmail) => {
    try {
      const [candidatesRes, unassignedReqsRes, recruitersRes, postedRes] = await Promise.all([
        fetchCandidates(),
        fetchUnassignedRequirements(),
        fetchRecruiters(),
        fetchAllRequirements(),// ✅ get requirements created by this lead
      ]);

      // Normalize
      const unassignedData = Array.isArray(unassignedReqsRes)
        ? unassignedReqsRes
        : unassignedReqsRes?.data || [];

      const candidatesList = candidatesRes?.candidates || [];
      const postedData = Array.isArray(postedRes?.data)
        ? postedRes.data
        : Array.isArray(postedRes)
          ? postedRes
          : [];

      setCandidates(candidatesList);
      setRequirements(unassignedData);
      setRecruiters(recruitersRes?.data || []);
      setPostedReqCount(postedData.length);

      const forwarded = candidatesList.filter((c) => c.status === "forwarded-to-sales");
      setForwardedCount(forwarded.length);
    } catch (error) {
      console.error("❌ Initial data load error:", error.response?.data || error);
      setMessage("❌ Failed to load initial data");
    }
  };

  const loadCandidates = async () => {
    try {
      const response = await fetchCandidates();
      if (response && Array.isArray(response.candidates)) {
        setCandidates(response.candidates);
        const forwarded = response.candidates.filter((c) => c.status === "forwarded-to-sales");
        setForwardedCount(forwarded.length);
      } else {
        setCandidates([]);
        setForwardedCount(0);
      }
    } catch (err) {
      console.error("❌ Error loading candidates:", err);
      setCandidates([]);
      setForwardedCount(0);
    }
  };

  const refreshRequirements = async () => {
    try {
      const res = await fetchUnassignedRequirements();
      setRequirements(res?.data || []);
    } catch (error) {
      console.error("❌ Failed to refresh requirements:", error.response?.data || error);
      setMessage("❌ Failed to refresh requirements");
    }
  };

  return (
    <div className="d-flex" style={{ minHeight: "100vh" }}>
      {/* Sidebar */}
      <div className="bg-light border-end p-3 d-flex flex-column" style={{ width: "240px" }}>
        <h4 className="fw-bold text-primary mb-4 text-center">ProCorp ATS</h4>

        <div
          className={`d-flex align-items-center mb-3 p-2 rounded ${selectedView === "dashboard" ? "bg-primary text-white" : ""}`}
          onClick={() => setSelectedView("dashboard")}
          style={{ cursor: "pointer" }}
        >
          <FaTachometerAlt className="me-2" />
          Dashboard
        </div>

        <div
          className={`d-flex align-items-center mb-3 p-2 rounded ${selectedView === "accountManager" ? "bg-primary text-white" : ""}`}
          onClick={() => setSelectedView("accountManager")}
          style={{ cursor: "pointer" }}
        >
          <FaUserTie className="me-2" />
          TA Lead
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-grow-1">
        {selectedView === "dashboard" ? (
          <LeadMainDashboard />
        ) : (
          <div className="container-fluid">
            <Navbar />
            <main className="col-12 px-md-4 py-4">
              <div className="p-4">
                <h2 className="fw-bold">Talent Acquisition Lead</h2>
                <div className="text-muted">Manage requirements and assign them to recruiters</div>
              </div>

              {/* Stats */}
              <div className="row mb-4 text-center justify-content-center">
                <div className="col-md-3">
                  <div className="card border-0 shadow-sm">
                    <div className="card-body">
                      <div className="text-muted mb-1">New Requirements</div>
                      <div className="h3 fw-bold">{requirements.length}</div>
                    </div>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="card border-0 shadow-sm">
                    <div className="card-body">
                      <div className="text-muted mb-1">Posted Requirements</div>
                      <div className="h3 fw-bold">{postedReqCount}</div>
                    </div>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="card border-0 shadow-sm">
                    <div className="card-body">
                      <div className="text-muted mb-1">Submitted Candidates</div>
                      <div className="h3 fw-bold">{candidates.length}</div>
                    </div>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="card border-0 shadow-sm">
                    <div className="card-body">
                      <div className="text-muted mb-1">Forwarded to Sales</div>
                      <div className="h3 fw-bold">{forwardedCount}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <ul className="nav nav-tabs mb-4">
                <li className="nav-item">
                  <button
                    className={`nav-link ${activeSection === "newRequirements" ? "active" : ""}`}
                    onClick={() => setActiveSection("newRequirements")}
                  >
                    New Requirements
                  </button>
                </li>
                <li className="nav-item">
                  <button
                    className={`nav-link ${activeSection === "newRequirementForm" ? "active" : ""}`}
                    onClick={() => setActiveSection("newRequirementForm")}
                  >
                    Post New Requirement
                  </button>
                </li>
                <li className="nav-item">
                  <button
                    className={`nav-link ${activeSection === "leadPostedRequirements" ? "active" : ""}`}
                    onClick={() => setActiveSection("leadPostedRequirements")}
                  >
                    Posted Requirements
                  </button>
                </li>
                <li className="nav-item">
                  <button
                    className={`nav-link ${activeSection === "submittedCandidates" ? "active" : ""}`}
                    onClick={() => setActiveSection("submittedCandidates")}
                  >
                    Submitted Candidates
                  </button>
                </li>
                <li className="nav-item">
                  <button
                    className={`nav-link ${activeSection === "requirementHistory" ? "active" : ""}`}
                    onClick={() => setActiveSection("requirementHistory")}
                  >
                    History
                  </button>
                </li>
              </ul>

              {message && (
                <div className={`alert ${message.startsWith("❌") ? "alert-danger" : "alert-success"} text-center`}>
                  {message}
                </div>
              )}

              {activeSection === "newRequirementForm" && (
                <Newrequirmentform
                  form={form}
                  setForm={setForm}
                  locationSearch={locationSearch}
                  setLocationSearch={setLocationSearch}
                  recruiters={recruiters}
                  setMessage={setMessage}
                  handleChange={handleChange}
                  handleMultiCheckbox={handleMultiCheckbox}
                  rateRanges={rateRanges}
                />
              )}

              {activeSection === "leadPostedRequirements" && (
                <LeadPostedRequirements
                  leadEmail={leadEmail}
                  onCountUpdate={setPostedReqCount}
                />
              )}

              {activeSection === "newRequirements" && (
                <NewRequirementsSection
                  requirements={requirements}
                  recruiters={recruiters}
                  leadEmail={leadEmail}
                  setMessage={setMessage}
                  refreshRequirements={refreshRequirements}
                />
              )}

              {activeSection === "submittedCandidates" && (
                <SubmittedCandidates
                  candidates={candidates}
                  forwardCandidateToSales={forwardCandidateToSales}
                  setCandidates={setCandidates}
                  leadEmail={leadEmail}
                  setMessage={setMessage}
                  loadCandidates={loadCandidates}
                />
              )}

              {activeSection === "requirementHistory" && <RequirementHistory />}
            </main>
          </div>
        )}
      </div>
    </div>
  );
}
