import React, { useEffect, useState } from "react";
import { fetchAllLeadRequirements, getAllCandidates } from "../../services";

export default function RequirementHistory() {
  const [allReqs, setAllReqs] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedId, setExpandedId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const requirementsPerPage = 5;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = sessionStorage.getItem("token");
      if (!token) throw new Error("No token found in session storage.");

      // ✅ Fetch all requirements assigned + created + admin posted
      const [leadRequirements, candidatesRes] = await Promise.all([
        fetchAllLeadRequirements(),
        getAllCandidates(),
      ]);

      const requirements = Array.isArray(leadRequirements)
        ? leadRequirements
        : leadRequirements?.data || [];

      const candidates = Array.isArray(candidatesRes?.candidates)
        ? candidatesRes.candidates
        : candidatesRes?.data?.candidates || [];

      // Map candidate submissions to requirement IDs
      const submissionMap = {};
      candidates.forEach((candidate) => {
        const reqIds = Array.isArray(candidate.requirementId)
          ? candidate.requirementId
          : [candidate.requirementId];

        reqIds.forEach((reqId) => {
          const trimmed = reqId?.trim?.();
          if (trimmed) submissionMap[trimmed] = (submissionMap[trimmed] || 0) + 1;
        });
      });

      // Attach submission count
      const enrichedReqs = requirements.map((req) => {
        const reqId = req.requirementId?.trim?.();
        const count = submissionMap[reqId] || 0;
        return { ...req, submissionCount: count };
      });

      setAllReqs(enrichedReqs);
    } catch (err) {
      console.error("❌ Initial data load error:", err);
      setError(err.message || "Failed to fetch requirements.");
    } finally {
      setLoading(false);
    }
  };

  const indexOfLastReq = currentPage * requirementsPerPage;
  const indexOfFirstReq = indexOfLastReq - requirementsPerPage;
  const currentReqs = allReqs.slice(indexOfFirstReq, indexOfLastReq);
  const totalPages = Math.ceil(allReqs.length / requirementsPerPage);

  const handlePageChange = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) setCurrentPage(pageNumber);
  };

  const toggleExpand = (id) => {
    setExpandedId((prevId) => (prevId === id ? null : id));
  };

  // 👇 Helper to label who created it
  const getCreatedByLabel = (req) => {
    if (req.createdByRole === "admin") {
      return `Admin: ${req.createdBy}`;
    } else if (req.createdByRole === "lead") {
      return `Lead: ${req.createdBy}`;
    }
    return `User: ${req.createdBy}`;
  };

  return (
    <section>
      {loading && <p>Loading requirements...</p>}
      {error && <p className="text-danger">{error}</p>}
      {!loading && !error && currentReqs.length === 0 && (
        <p className="text-muted">No requirements in history.</p>
      )}

      {!loading &&
        !error &&
        currentReqs.map((req) => (
          <div key={req._id} className="card mb-3 border-secondary shadow-sm">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <button
                  className="btn btn-link text-decoration-none fw-bold text-primary p-0"
                  onClick={() => toggleExpand(req._id)}
                >
                  {req.title || "Untitled Requirement"}
                </button>
                <div className="d-flex align-items-center gap-2">
                  <span className="badge bg-success">{req.submissionCount} submitted</span>
                  <span
                    className={`badge ${
                      req.requirementStatus === "closed" ? "bg-danger" : "bg-success"
                    }`}
                  >
                    {req.requirementStatus === "closed" ? "Closed" : "Open"}
                  </span>
                </div>
              </div>

              {expandedId === req._id && (
                <div className="mt-3 text-muted">
                  <strong>Description:</strong>
                  <p>{req.description || "No description available."}</p>
                  <small>
                    <strong>Requirement ID:</strong>{" "}
                    <span className="text-dark">{req.requirementId || "N/A"}</span>
                    <br />
                    {/* ✅ Now shows Admin OR Lead clearly */}
                    <strong>Created By:</strong> {getCreatedByLabel(req)} <br />
                    <strong>Lead Assigned:</strong>{" "}
                    {Array.isArray(req.leadAssignedTo)
                      ? req.leadAssignedTo.join(", ")
                      : req.leadAssignedTo || "—"}{" "}
                    <br />
                    <strong>Recruiters:</strong>{" "}
                    {Array.isArray(req.recruiterAssignedTo)
                      ? req.recruiterAssignedTo.join(", ")
                      : req.recruiterAssignedTo || "—"}{" "}
                  </small>
                </div>
              )}
            </div>
          </div>
        ))}

      {!loading && !error && currentReqs.length > 0 && (
        <div className="d-flex justify-content-center align-items-center mt-3">
          <button
            className="btn btn-outline-primary btn-sm me-2"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            ◀ Previous
          </button>
          <span className="mx-2">
            Page {currentPage} of {totalPages}
          </span>
          <button
            className="btn btn-outline-primary btn-sm ms-2"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next ▶
          </button>
        </div>
      )}
    </section>
  );
}
