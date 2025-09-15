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
import { updateCandidateFields } from "../../services"; // adjust path if needed
import { Form } from "react-bootstrap";




export default function RecruiterSubmit() {
  const [formData, setFormData] = useState({
    name: "",
    role: "",
    email: "",
    phone: "",
    // source: "",
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
    Documents: [],
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

      // Validate resumes
      if (!formData.resumes || formData.resumes.length === 0) {
        alert("Please upload at least one resume.");
        setLoading(false);
        return;
      }

      // Append resumes
      for (let i = 0; i < formData.resumes.length; i++) {
        data.append("resume", formData.resumes[i]);
      }

      // Append other fields
      Object.entries(formData).forEach(([key, value]) => {
        if (key === "resumes" || key === "forwardToLeads" || key === "workAuthorization") return;
        data.append(key, value);
      });

      // Work Authorization
      if (Array.isArray(formData.workAuthorization)) {
        data.append("workAuthorization", formData.workAuthorization.join(","));
      }

      // Forward to Leads
      if (formData.forwardToLeads && formData.forwardToLeads.length > 0) {
        formData.forwardToLeads.forEach((lead) => data.append("forwardToLeads[]", lead));
      }

      // Submit candidate
      const response = await submitCandidate(data);
      console.log("Submit response:", response);

      // ✅ Check for candidateId instead of candidate
      if (response?.candidateId) {
        setSubmittedCandidates((prev) => [
          {
            candidateId: response.candidateId,
            folderId: response.folderId,
            folderUrl: response.folderUrl,
            message: response.message,
          },
          ...prev,
        ]);

        alert(response.message || "✅ Candidate submitted successfully");
        setShowModal(false);
        setFormData({ ...formData, resumes: [] });
      } else {
        alert("❌ Submission failed. Please try again.");
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

      const processedCandidates = myCandidates
        .map((c) => ({
          ...c,
          isActive: typeof c.isActive === "boolean" ? c.isActive : true,
          interviewScheduled:
            typeof c.interviewScheduled === "boolean"
              ? c.interviewScheduled
              : false,
        }))
        // Sort newest first
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      setSubmittedCandidates(processedCandidates);

      const leadsData = await fetchSalesLeads();
      setLeads(leadsData || []);
    } catch (err) {
      console.error("❌ Failed to fetch data", err);
    }
  };

  const handleToggleActive = async (candidateId, newStatus) => {
    try {
      console.log("Updating active status for:", candidateId, "New:", newStatus);
      await updateCandidateFields(candidateId, { isActive: newStatus }); // pass string

      setSubmittedCandidates((prevCandidates) =>
        prevCandidates.map((candidate) =>
          candidate._id === candidateId
            ? { ...candidate, isActive: newStatus }
            : candidate
        )
      );

      console.log("✅ Active status updated locally and backend updated");
    } catch (error) {
      console.error("❌ Failed to update active status:", error);
    }
  };







  const onApplyClick = (reqId, requirementId, title, client) => {
    console.log("Apply Clicked", { reqId, requirementId, title, client });
    setShowFormId(reqId);
    setFormData((prev) => ({
      ...prev,
      requirementId,
      role: title,
      clientDetails: client,  // ✅ corrected
    }));
    setShowModal(true);
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

              {/* <div className="row g-3 mb-4">
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
              </div> */}

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
                            <th>Position</th>
                            <th>Client</th>
                            <th>Priority</th>
                            <th>Posted Date</th>
                            <th>Status</th>
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

                                  {/* ✅ Position column (Title + Location + Work Setting) */}
                                  <td>
                                    <button
                                      className="btn btn-link p-0 text-primary fw-semibold"
                                      onClick={() =>
                                        setExpandedReq(expandedReq === req._id ? null : req._id)
                                      }
                                    >
                                      {req.title || "Untitled"}
                                    </button>
                                    <div className="text-muted small">
                                      {(Array.isArray(req.locations)
                                        ? req.locations.join(", ")
                                        : req.locations) || "N/A"}{" "}
                                      | {req.workSetting || "N/A"}
                                    </div>
                                  </td>

                                  <td>{req.client || "N/A"}</td>
                                  <td>{req.priority || "N/A"}</td>
                                  <td>{new Date(req.createdAt).toLocaleDateString()}</td>
                                  <td>
                                    <span
                                      className={`badge ${req.requirementStatus === "closed"
                                        ? "bg-danger"
                                        : "bg-success"
                                        }`}
                                    >
                                      {req.requirementStatus?.toUpperCase() || "OPEN"}
                                    </span>
                                  </td>
                                  <td>{submissionCount}</td>
                                  <td>
                                    <button
                                      className="btn btn-sm btn-success"
                                      onClick={() =>
                                        onApplyClick(req._id, req.requirementId, req.title, req.client)
                                      }
                                    >
                                      Apply
                                    </button>
                                  </td>
                                </tr>

                                {/* Expanded Row → Hidden Fields */}
                                {expandedReq === req._id && (
                                  <tr>
                                    <td colSpan="8">
                                      <div className="p-3 bg-light rounded shadow-sm">
                                        <p>
                                          <strong>Employment Type:</strong>{" "}
                                          {req.employmentType || "N/A"}
                                        </p>
                                        <p>
                                          <strong>Duration:</strong>{" "}
                                          {req.duration || "N/A"}
                                        </p>
                                        <p>
                                          <strong>Rate:</strong>{" "}
                                          {req.rate || "N/A"}
                                        </p>
                                        <p>
                                          <strong>Work Authorization:</strong>{" "}
                                          {Array.isArray(req.workAuthorization)
                                            ? req.workAuthorization.join(", ")
                                            : req.workAuthorization || "N/A"}
                                        </p>
                                        <p>
                                          <strong>Created By:</strong>{" "}
                                          {req.createdBy || "N/A"}
                                        </p>
                                        <p>
                                          <strong>Primary Skills:</strong>{" "}
                                          {Array.isArray(req.primarySkills)
                                            ? req.primarySkills.join(", ")
                                            : req.primarySkills || "N/A"}
                                        </p>
                                        <p>
                                          <strong>Job Description:</strong>{" "}
                                          {req.description || "No description provided."}
                                        </p>
                                      </div>
                                    </td>
                                  </tr>
                                )}
                              </React.Fragment>
                            );
                          })}
                        </tbody>
                      </table>

                      {/* Pagination */}
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
                        <th>Requirement ID</th>
                        <th>Documents</th>
                        <th>Status</th>
                        <th>Submitted Date</th> {/* ✅ New column */}
                        <th>Active</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentSubmittedCandidates.map((candidate) => (
                        <React.Fragment key={candidate._id}>
                          <tr>
                            <td>{candidate.candidateId}</td>

                            {/* Name as expand/collapse button */}
                            <td>
                              <button
                                className="btn btn-link p-0 text-primary fw-semibold"
                                onClick={() =>
                                  setExpandedReq(
                                    expandedReq === candidate._id ? null : candidate._id
                                  )
                                }
                              >
                                {candidate.name}
                              </button>
                            </td>

                            <td>{candidate.role || "N/A"}</td>

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

                            {/* ✅ Submitted Date Column */}
                            <td>
                              {candidate.createdAt
                                ? new Date(candidate.createdAt).toISOString().split("T")[0]
                                : "N/A"}
                            </td>

                            {/* Active dropdown instead of checkbox */}
                            <td>
                              <Form.Select
                                size="sm"
                                value={candidate.isActive || "available"}
                                onChange={(e) =>
                                  handleToggleActive(candidate._id, e.target.value)
                                }
                              >
                                <option value="available">Available</option>
                                <option value="not available">Not Available</option>
                              </Form.Select>
                            </td>
                          </tr>

                          {/* Expanded Row with extra details */}
                          {expandedReq === candidate._id && (
                            <tr>
                              <td colSpan="9">
                                <div className="p-3 bg-light rounded shadow-sm">
                                  <p>
                                    <strong>Email:</strong> {candidate.email || "N/A"}
                                  </p>
                                  <p>
                                    <strong>Rate:</strong> {candidate.rate || "N/A"}
                                  </p>
                                  <p>
                                    <strong>Visa:</strong> {candidate.VisaStatus || "N/A"}
                                  </p>
                                  <p>
                                    <strong>Phone:</strong> {candidate.phone || "N/A"}
                                  </p>
                                  <p>
                                    <strong>Location:</strong>{" "}
                                    {candidate.currentLocation || "N/A"}
                                  </p>
                                  <p>
                                    <strong>Sales Update:</strong>{" "}
                                    {candidate.candidate_update || "Submitted"}
                                  </p>
                                  <p>
                                    <strong>Lead Update:</strong>{" "}
                                    {candidate.lead_update || "Pending"}
                                  </p>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      ))}
                    </tbody>
                  </table>

                  {/* Pagination Controls */}
                  <div className="d-flex justify-content-between align-items-center mt-2">
                    <div>
                      Showing {indexOfFirstSubmitted + 1}–
                      {Math.min(indexOfLastSubmitted, submittedCandidates.length)} of{" "}
                      {submittedCandidates.length} candidates
                    </div>
                    <div>
                      <button
                        className="btn btn-sm btn-outline-secondary me-2"
                        disabled={currentSubmittedPage === 1}
                        onClick={() => setCurrentSubmittedPage((prev) => prev - 1)}
                      >
                        ◀ Prev
                      </button>
                      <span>
                        Page {currentSubmittedPage} of {totalSubmittedPages}
                      </span>
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