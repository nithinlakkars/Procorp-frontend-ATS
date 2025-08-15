import React, { useState } from "react";

function RequirementCard({
  req,
  onApplyClick,
  expandedReq,
  setExpandedReq,
  submissionCount = 0,
}) {
  const handleCopyId = () => {
    if (req.requirementId) {
      navigator.clipboard.writeText(req.requirementId);
      alert("📋 Requirement ID copied to clipboard!");
    }
  };

  return (
    <div className="card shadow-sm border-success mb-3">
      <div className="card-body">
        <p
          className="mb-2 d-flex justify-content-between"
          style={{ fontSize: "0.9rem" }}
        >
          <span>
            <strong>Requirement ID:</strong>{" "}
            <span className="text-monospace">{req.requirementId || "—"}</span>
            {req.requirementId && (
              <button
                className="btn btn-sm btn-outline-secondary ms-2"
                title="Copy ID"
                onClick={handleCopyId}
              >
                📋
              </button>
            )}
          </span>
          <div className="d-flex flex-column align-items-end">
            <span className="text-success">
              <strong>Submissions:</strong> {submissionCount}
            </span>
            <span className={`badge ${req.status === "Closed" ? "bg-danger" : "bg-success"}`}>
              {req.status === "Closed" ? "Closed" : "Open"}
            </span>
          </div>

        </p>

        <h5
          className="card-title text-center"
          style={{
            fontSize: "1.5rem",
            fontWeight: 600,
            color: "#333",
            fontFamily: "Segoe UI, Roboto, sans-serif",
          }}
        >
          {req.title}
        </h5>

        <p>
          <strong>Location:</strong> {req.locations?.join(", ") || "N/A"}
        </p>
        <p>
          <strong>Rate:</strong> {req.rate || "N/A"}
        </p>
        <p>
          <strong>Duration:</strong> {req.duration || "N/A"}   {/* ✅ Added duration */}
        </p>
        <p>
          <strong>Priority:</strong>{" "}
          <span className="text-danger">{req.priority || "N/A"}</span>
        </p>
        <p>
          <strong>Skills:</strong> {req.primarySkills || "N/A"}
        </p>
        <p>
          <strong>Employment:</strong> {req.employmentType || "N/A"}
        </p>
        <p>
          <strong>Setting:</strong> {req.workSetting || "N/A"}
        </p>
        <p>
          <strong>Work Authorization:</strong>{" "}
          {{
            USC: "US Citizen",
            GC: "Green Card",
            H1B: "H1B",
            OPT: "OPT/CPT",
            Other: "Other",
          }[req.workAuthorization] || req.workAuthorization || "N/A"}
        </p>


        <button
          className="btn btn-sm btn-link p-0 text-primary"
          onClick={() =>
            setExpandedReq(expandedReq === req._id ? null : req._id)
          }
        >
          {expandedReq === req._id ? "Hide Description" : "View Description"}
        </button>

        {expandedReq === req._id && (
          <p className="mt-2">
            {req.description || "No description provided."}
          </p>
        )}

        <button
          className="btn btn-outline-primary btn-sm mt-2"
          onClick={() => onApplyClick(req._id, req.requirementId, req.title)}
        >
          Apply
        </button>
      </div>
    </div>
  );
}


export default function RequirementCardWithPagination({
  requirements,
  onApplyClick,
}) {
  const [expandedReq, setExpandedReq] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const requirementsPerPage = 5;

  const sortedRequirements = [...requirements].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );
  const totalPages = Math.ceil(sortedRequirements.length / requirementsPerPage);
  const startIndex = (currentPage - 1) * requirementsPerPage;
  const currentReqs = sortedRequirements.slice(
    startIndex,
    startIndex + requirementsPerPage
  );

  return (
    <>
      {/* Styled Section Heading */}
      <h2
        className="text-center mt-4 mb-3"
        style={{
          fontFamily: "Segoe UI, Roboto, sans-serif",
          fontWeight: 600,
          fontSize: "1.75rem",
          color: "#333",
        }}
      >
        Assigned Requirements
      // </h2>

      {currentReqs.map((req) => (
        <RequirementCard
          key={req._id}
          req={req}
          submissionCount={req.submissionCount || 0}
          onApplyClick={onApplyClick}
          expandedReq={expandedReq}
          setExpandedReq={setExpandedReq}
        />
      ))}

      <div className="d-flex justify-content-between align-items-center mt-3">
        <button
          className="btn btn-outline-secondary btn-sm"
          disabled={currentPage === 1}
          onClick={() => setCurrentPage(currentPage - 1)}
        >
          ⬅ Prev
        </button>
        <span>
          Page {currentPage} of {totalPages}
        </span>
        <button
          className="btn btn-outline-secondary btn-sm"
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage(currentPage + 1)}
        >
          Next ➔
        </button>
      </div>
    </>
  );
}
