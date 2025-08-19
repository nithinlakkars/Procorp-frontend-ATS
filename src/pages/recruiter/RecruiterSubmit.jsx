import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import {
  submitCandidate,
  getAssignedRequirements,
  getRecruiterCandidates,
  fetchSalesLeads,
} from "../../services";
import Navbar from "../../componenets/Navbar";
import RecruiterMainDashboard from "./recruitermaindashboard";
import { FaTachometerAlt, FaUserTie } from "react-icons/fa";
import SubmitCandidateModal from "./SubmitCandidateForm"; // ✅ adjust path if needed
import { updateCandidateActiveStatus } from "../../services";


export default function RecruiterSubmit() {
  const [formData, setFormData] = useState({
    name: "",
    role: "",
    email: "",
    phone: "",
    source: "",
    currentLocation: "",
    rate: "",
    relocation: "",
    passportNumber: "",
    last4SSN: "",
    VisaStatus: "",
    linkedinUrl: "",
    clientDetails: "",
    forwardToLeads: [],
    addedBy: "",
    requirementId: "",
    resumes: [],
    salesStatus: "",
    workAuthorization: [],
  });

  const [resume, setResume] = useState([]);
  const [message, setMessage] = useState("");
  const [submittedCandidates, setSubmittedCandidates] = useState([]);
  const [requirements, setRequirements] = useState([]);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showFormId, setShowFormId] = useState(null);
  const [expandedReq, setExpandedReq] = useState(null);
  const [activeSection, setActiveSection] = useState("assignedRequirements");
  const [currentPage, setCurrentPage] = useState(1);
  const [requirementsPage, setRequirementsPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentSubmittedPage, setCurrentSubmittedPage] = useState(1);
  const [selectedRequirement, setSelectedRequirement] = useState(null);
  const [activeTab, setActiveTab] = useState("accountManager");
  const [showModal, setShowModal] = useState(false);




  const submittedItemsPerPage = 5;
  const itemsPerPage = 5;
  const requirementsPerPage = 7;
  const userData = sessionStorage.getItem("user");
  const userEmail = userData ? JSON.parse(userData).email : "";

  const handleSubmitCandidate = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = new FormData();

      // Append resume files
      if (formData.resumes.length === 0) {
        alert("Please upload at least one resume.");
        setLoading(false);
        return;
      }

      for (let i = 0; i < formData.resumes.length; i++) {
        data.append("resume", formData.resumes[i]);
      }

      // Append other form fields
      data.append("name", formData.name);
      data.append("email", formData.email);
      data.append("phone", formData.phone);
      data.append("source", formData.source);
      data.append("requirementId", formData.requirementId);
      data.append("currentLocation", formData.currentLocation);
      data.append("rate", formData.rate);
      data.append("relocation", formData.relocation);
      data.append("passportNumber", formData.passportNumber);
      data.append("last4SSN", formData.last4SSN);
      data.append("visaStatus", formData.visaStatus);
      data.append("linkedinUrl", formData.linkedinUrl);
      data.append("clientDetails", formData.clientDetails);
      data.append("role", formData.role);
      data.append("isActive", true); // Default to true
      data.append("salesStatus", formData.salesStatus);
      if (Array.isArray(formData.workAuthorization)) {
        data.append("workAuthorization", formData.workAuthorization.join(","));
      } else {
        data.append("workAuthorization", formData.workAuthorization || "");
      }

      // Append selected leads
      if (formData.forwardToLeads && formData.forwardToLeads.length > 0) {
        formData.forwardToLeads.forEach((leadEmail) =>
          data.append("forwardToLeads[]", leadEmail)
        );
      }

      const response = await submitCandidate(data); // ← Your service function

      console.log("📦 Full Backend Response:", response); //

      if (response?.candidate) {
        alert("❌ Submission failed. Please try again.");

        setShowModal(false);
        await fetchData(); // Refresh list
      } else {
        alert("✅ Candidate submitted successfully");
      }
    } catch (error) {
      console.error("Error submitting candidate:", error);
      alert("❌ Error while submitting candidate.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!userEmail) return;
    setFormData((prev) => ({ ...prev, addedBy: userEmail }));
    fetchData();
  }, [userEmail]);
  const fetchData = async () => {
    try {
      const reqRes = await getAssignedRequirements(userEmail);
      const reqs = Array.isArray(reqRes?.data) ? reqRes.data : [];
      setRequirements(reqs);

      const candidatesRes = await getRecruiterCandidates(userEmail);
      const myCandidates = Array.isArray(candidatesRes)
        ? candidatesRes.filter(
          (c) => c.addedBy?.toLowerCase() === userEmail.toLowerCase()
        )
        : [];

      const processedCandidates = myCandidates.map((c) => ({
        ...c,
        isActive: typeof c.isActive === "boolean" ? c.isActive : true,
        interviewScheduled:
          typeof c.interviewScheduled === "boolean"
            ? c.interviewScheduled
            : false,
      }));

      setSubmittedCandidates(processedCandidates);

      const leadsData = await fetchSalesLeads();
      setLeads(leadsData || []);
    } catch (err) {
      console.error("❌ Failed to fetch data", err);
    }
  };
  const handleToggleActive = async (candidateId, currentStatus) => {
    try {
      console.log("Toggling active status for:", candidateId, "Current:", currentStatus);
      await updateCandidateActiveStatus(candidateId, !currentStatus);
      console.log("✅ Backend updated active status");

      setSubmittedCandidates((prevCandidates) => {
        const updated = prevCandidates.map((candidate) =>
          candidate._id === candidateId
            ? { ...candidate, isActive: !currentStatus }
            : candidate
        );
        console.log("🧠 Updated local state:", updated);
        return updated;
      });
    } catch (error) {
      console.error("❌ Failed to update active status:", error);
    }
  };





  const onApplyClick = (reqId, requirementId, title) => {
    console.log("Apply Clicked", { reqId, requirementId, title }); // ✅ Helpful Debug
    setShowFormId(reqId);
    setFormData((prev) => ({
      ...prev,
      requirementId: requirementId,
      role: title,
    }));
    setShowModal(true); // ✅ THIS makes the modal appear
  };




  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleFileChange = (e) =>
    setFormData((prev) => ({
      ...prev,
      resumes: Array.from(e.target.files), // ✅ This is what your formData expects
    }));

  const handleLeadSelect = (leadEmail) => {
    setFormData((prev) => ({
      ...prev,
      forwardToLeads: prev.forwardToLeads.includes(leadEmail)
        ? prev.forwardToLeads.filter((email) => email !== leadEmail)
        : [...(prev.forwardToLeads || []), leadEmail],
    }));
  };

  const totalPages = Math.ceil(submittedCandidates.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentCandidates = submittedCandidates.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalSubmittedPages = Math.ceil(submittedCandidates.length / submittedItemsPerPage);
  const indexOfFirstSubmitted = (currentSubmittedPage - 1) * submittedItemsPerPage;
  const indexOfLastSubmitted = indexOfFirstSubmitted + submittedItemsPerPage;
  const currentSubmittedCandidates = submittedCandidates.slice(indexOfFirstSubmitted, indexOfLastSubmitted);

  const filteredRequirements = requirements.filter((req) =>
    req.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalReqPages = Math.ceil(
    filteredRequirements.length / requirementsPerPage
  );
  const indexOfLastReq = requirementsPage * requirementsPerPage;
  const indexOfFirstReq = indexOfLastReq - requirementsPerPage;
  const currentRequirements = filteredRequirements.slice(
    indexOfFirstReq,
    indexOfLastReq
  );
  // Place this helper function at the top of your component, above the return(...)
  const getStatusVariant = (status) => {
    switch (status) {
      case "Interview Scheduled":
      case "Shortlisted":
        return "bg-success";
      case "Rejected":
      case "No Show":
        return "bg-danger";
      case "Submitted":
        return "bg-primary";
      case "Interview In Progress":
        return "bg-warning text-dark";
      default:
        return "bg-secondary";
    }
  };

  return (
    <div className="d-flex" style={{ height: "100vh" }}>
      <SubmitCandidateModal
        show={showModal}
        handleClose={() => setShowModal(false)}
        formData={formData}
        loading={loading}
        handleChange={handleChange}
        handleFileChange={handleFileChange}
        handleSubmit={handleSubmitCandidate} // ✅ define this function if not present
        requirement={selectedRequirement}
        leads={leads}
        handleLeadSelect={handleLeadSelect}
      />

      <div
        className="bg-light border-end p-3 d-flex flex-column"
        style={{ width: "240px" }}
      >
        <h4 className="fw-bold text-primary mb-4">ProCorp ATS</h4>

        <div
          className={`d-flex align-items-center mb-3 p-2 rounded ${activeTab === "dashboard" ? "bg-primary text-white" : ""
            }`}
          onClick={() => setActiveTab("dashboard")}
          style={{ cursor: "pointer" }}
        >
          <FaTachometerAlt className="me-2" />
          Dashboard
        </div>

        <div
          className={`d-flex align-items-center mb-3 p-2 rounded ${activeTab === "accountManager" ? "bg-primary text-white" : ""
            }`}
          onClick={() => setActiveTab("accountManager")}
          style={{ cursor: "pointer" }}
        >
          <FaUserTie className="me-2" />
          TA Recruiter
        </div>

        <div className="mt-auto pt-5 text-center">
          {/* <div
            className="bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center"
            style={{ width: 40, height: 40 }}
          >
            TA
          </div> */}
          {/* <div className="small mt-1">TA Recruiter</div>
          <div className="text-muted" style={{ fontSize: "12px" }}>
            TA Recruiter
          </div> */}
        </div>
      </div>

      <div className="flex-grow-1 overflow-auto">
        {activeTab === "dashboard" ? (
          <RecruiterMainDashboard />
        ) : (
          <>
            <Navbar />
            <div className="p-4">
              <h2 className="fw-bold">Talent Acquisition Recruiter</h2>
              <p className="text-muted">Source candidates for assigned requirements</p>

              <div className="row g-3 mb-4">
                <div className="col-md-6">
                  <div className="card shadow-sm text-center p-3">
                    <div className="text-muted">Assigned Requirements</div>
                    <h3>{requirements.length}</h3>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="card shadow-sm text-center p-3">
                    <div className="text-muted">Submissions</div>
                    <h3>{submittedCandidates.length}</h3>

                  </div>
                </div>
              </div>

              <ul className="nav nav-tabs mb-4">
                <li className="nav-item">
                  <button
                    className={`nav-link ${activeSection === "assignedRequirements" ? "active" : ""}`}
                    onClick={() => setActiveSection("assignedRequirements")}
                  >
                    Requirements
                  </button>
                </li>
                <li className="nav-item">
                  <button
                    className={`nav-link ${activeSection === "submittedCandidates" ? "active" : ""}`}
                    onClick={() => setActiveSection("submittedCandidates")}
                  >
                    Submissions
                  </button>
                </li>
              </ul>


              <div className="d-flex align-items-center mb-3">
                <input
                  type="text"
                  className="form-control me-2"
                  placeholder="🔍 Search requirements..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {activeSection === "assignedRequirements" && (
                <>
                  {filteredRequirements.length === 0 ? (
                    <p>No matching requirements found.</p>
                  ) : (
                    <div className="table-responsive">
                      <table className="table no-vertical-borders">
                        <thead className="table-light">
                          <tr>
                            <th>Requirement ID</th>
                            <th>Title</th>
                            <th>Client</th>
                            <th>Location</th>
                            <th>Rate</th>
                            <th>Duration</th> {/* ✅ New column */}
                            <th>Priority</th>
                            <th>Employment Type</th>
                            <th>Work Authorization</th>
                            <th>Work Setting</th>
                            <th>Posted Date</th>
                            <th>Status</th>
                            <th>Created By</th>
                            <th>Submitted Candidates</th>
                            <th>Actions</th>
                          </tr>
                        </thead>

                        <tbody>
                          {currentRequirements.map((req) => {
                            const submissionCount = submittedCandidates.filter(
                              (candidate) =>
                                String(candidate.requirementId)?.trim() ===
                                String(req.requirementId)?.trim()
                            ).length;

                            return (
                              <React.Fragment key={req._id}>
                                <tr>
                                  <td>{req.requirementId}</td>
                                  <td>{req.title}</td>
                                  <td>{req.client || "N/A"}</td>
                                  <td>{req.locations?.join(", ")}</td>
                                  <td>{req.rate || "N/A"}</td>
                                  <td>{req.duration || "N/A"}</td> {/* ✅ Duration value */}
                                  <td>{req.priority || "N/A"}</td>
                                  <td>{req.employmentType}</td>
                                  <td>
                                    {Array.isArray(req.workAuthorization)
                                      ? req.workAuthorization.join(", ")
                                      : req.workAuthorization}
                                  </td>
                                  <td>{req.workSetting}</td>
                                  <td>{new Date(req.createdAt).toLocaleDateString()}</td>
                                  <td>
                                    <span
                                      className={`badge ${req.status === "closed" ? "bg-danger" : "bg-success"
                                        }`}
                                    >
                                      {req.requirementStatus?.toUpperCase() || "OPEN"}
                                    </span>
                                  </td>
                                  <td>{req.createdBy}</td>
                                  <td>{submissionCount}</td>
                                  <td>
                                    <button
                                      className="btn btn-sm btn-primary"
                                      onClick={() =>
                                        setExpandedReq(
                                          expandedReq === req._id ? null : req._id
                                        )
                                      }
                                    >
                                      {expandedReq === req._id ? "Hide" : "View"}
                                    </button>
                                  </td>
                                </tr>

                                {expandedReq === req._id && (
                                  <tr>
                                    <td colSpan="14">
                                      <div className="p-2">
                                        <p>
                                          <strong>Skills:</strong> {req.primarySkills}
                                        </p>
                                        <p>
                                          <strong>Description:</strong> {req.description}
                                        </p>
                                        <button
                                          className="btn btn-outline-success btn-sm"
                                          onClick={() =>
                                            onApplyClick(
                                              req._id,
                                              req.requirementId,
                                              req.title
                                            )
                                          }
                                        >
                                          Apply
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                )}
                              </React.Fragment>
                            );
                          })}
                        </tbody>
                      </table>

                      <div className="d-flex justify-content-between align-items-center mt-2">
                        <div>
                          Showing {indexOfFirstReq + 1}–
                          {Math.min(indexOfLastReq, filteredRequirements.length)} of{" "}
                          {filteredRequirements.length} requirements
                        </div>
                        <div>
                          <button
                            className="btn btn-sm btn-outline-secondary me-2"
                            disabled={requirementsPage === 1}
                            onClick={() => setRequirementsPage((prev) => prev - 1)}
                          >
                            ◀ Prev
                          </button>
                          <span>
                            Page {requirementsPage} of {totalReqPages}
                          </span>
                          <button
                            className="btn btn-sm btn-outline-secondary ms-2"
                            disabled={requirementsPage === totalReqPages}
                            onClick={() => setRequirementsPage((prev) => prev + 1)}
                          >
                            Next ▶
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* <li className="nav-item">
                  <button
                    className={`nav-link ${
                      activeSection === "submittedCandidates" ? "active" : ""
                    }`}
                    onClick={() => setActiveSection("submittedCandidates")}
                  >
                    Submissions
                  </button>
                </li>
               */}

              {activeSection === "submittedCandidates" && (
                <div className="table-responsive">
                  <table className="table">
                    <thead className="table-light">
                      <tr>
                        <th>Candidate ID</th>
                        <th>Name</th>
                        <th>Role</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>Rate</th>
                        <th>Location</th>
                        <th>Visa</th>
                        <th>Requirement ID</th>
                        <th>Resume</th>
                        <th>Status</th>
                        <th>Active</th>
                        <th>Sales Update</th>
                        <th>Lead Status</th> {/* New column */}
                      </tr>
                    </thead>
                    <tbody>
                      {currentSubmittedCandidates.map((candidate) => (
                        <tr key={candidate._id}>
                          <td>{candidate.candidateId}</td>
                          <td>{candidate.name}</td>
                          <td>{candidate.role}</td>
                          <td>{candidate.email}</td>
                          <td>{candidate.phone}</td>
                          <td>{candidate.rate}</td>
                          <td>{candidate.currentLocation}</td>
                          <td>{candidate.VisaStatus}</td>
                          <td>
                            {Array.isArray(candidate.requirementId)
                              ? candidate.requirementId.join(", ")
                              : candidate.requirementId}
                          </td>
                          <td>
                            {candidate.resumeUrls && candidate.resumeUrls.length > 0 ? (
                              <a
                                href={candidate.resumeUrls[0]}
                                target="_blank"
                                rel="noreferrer"
                                className="btn btn-sm btn-outline-success"
                              >
                                📁 View documents
                              </a>
                            ) : (
                              "No Folder"
                            )}
                          </td>
                          <td>{candidate.status || "Submitted"}</td>
                          <td>
                            <input
                              type="checkbox"
                              checked={!!candidate.isActive}
                              onChange={() => handleToggleActive(candidate._id, candidate.isActive ?? false)}
                            />
                          </td>
                          <td>
                            <span className={`badge ${getStatusVariant(candidate.candidate_update)}`}>
                              {candidate.candidate_update || "Submitted"}
                            </span>
                          </td>
                          <td>
                            <span className={`badge ${getStatusVariant(candidate.lead_update)}`}>
                              {candidate.lead_update || "Pending"} {/* Lead status */}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* Pagination Controls */}
                  <div className="d-flex justify-content-between align-items-center mt-2">
                    <div>
                      Showing {indexOfFirstSubmitted + 1}–{Math.min(indexOfLastSubmitted, submittedCandidates.length)} of {submittedCandidates.length} candidates
                    </div>
                    <div>
                      <button
                        className="btn btn-sm btn-outline-secondary me-2"
                        disabled={currentSubmittedPage === 1}
                        onClick={() => setCurrentSubmittedPage((prev) => prev - 1)}
                      >
                        ◀ Prev
                      </button>
                      <span>Page {currentSubmittedPage} of {totalSubmittedPages}</span>
                      <button
                        className="btn btn-sm btn-outline-secondary ms-2"
                        disabled={currentSubmittedPage === totalSubmittedPages}
                        onClick={() => setCurrentSubmittedPage((prev) => prev + 1)}
                      >
                        Next ▶
                      </button>
                    </div>
                  </div>
                </div>
              )}



            </div>
          </>
        )}
      </div>
    </div>
  );

}