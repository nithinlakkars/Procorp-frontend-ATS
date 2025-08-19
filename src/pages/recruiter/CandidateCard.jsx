import React, { useState, useEffect } from "react";
import { updateCandidateStatus } from "../../services"; // make sure it's defined

// ✅ Extracted helper function
const getStatusVariant = (status) => {
  switch (status) {
    // 🔹 Sales-specific statuses
    case "forwarded-to-sales":
      return "primary";
    case "on-hold":
      return "warning text-dark";

    // 🔹 Enum statuses
    case "L1-cleared":
      return "info"; // light blue
    case "selected":
      return "success"; // green
    case "rejected":
    case "internal-rejection":
      return "danger"; // red
    case "Waiting-for-update":
    case "Decision-pending":
      return "warning"; // yellow
    case "To-be-interviewed":
      return "primary"; // blue
    case "submitted":
    case "submitted-to-client":
      return "secondary"; // gray

    // 🔹 Fallback
    default:
      return "dark"; // default Bootstrap badge
  }
};


export default function CandidateCardList({ candidates = [], loadCandidates }) {
  const itemsPerPage = 5;
  const [currentPage, setCurrentPage] = useState(1);
  const [activeStatus, setActiveStatus] = useState({});

  useEffect(() => {
    const initialStatus = {};
    candidates.forEach((candidate) => {
      initialStatus[candidate._id] = candidate.isActive || false;
    });
    setActiveStatus(initialStatus);
  }, [candidates]);

  const toggleActive = (id) => {
    setActiveStatus((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

 const totalPages = Math.max(1, Math.ceil(candidates.length / itemsPerPage));
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentCandidates = candidates.slice(indexOfFirst, indexOfLast);

  const handlePrev = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
  const handleNext = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  const goToPage = (pageNum) => setCurrentPage(pageNum);

  return (
    <>
      {currentCandidates.map((candidate) => {
        const {
          _id,
          candidateId,
          name,
          role,
          email,
          phone,
          rate,
          currentLocation,
          relocation,
          passportnumber,
          Last4digitsofSSN,
          VisaStatus,
          LinkedinUrl,
          clientdetails,
          resumeUrls = [],
          requirementId = [],
          candidate_update,
        } = candidate;

        return (
          <div key={_id} className="card border-0 shadow-sm mb-4">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="card-title mb-0">{name}</h5>

                {/* ✅ Active Toggle */}
                <div className="form-check form-switch">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id={`activeSwitch-${_id}`}
                    checked={!!activeStatus[_id]}
                    onChange={() => toggleActive(_id)}
                  />
                  <label className="form-check-label" htmlFor={`activeSwitch-${_id}`}>
                    Active
                  </label>
                </div>
              </div>

              {/* ✅ Sales Status Display */}
              <p className="mt-2">
                <strong>Sales Status:</strong>{" "}
                <span className={`badge bg-${getStatusVariant(candidate_update)}`}>
                  {candidate_update || "Not Updated"}
                </span>
              </p>

              <p>
                <strong>Requirement ID{requirementId.length > 1 ? "s" : ""}:</strong>{" "}
                {requirementId.length > 0 ? requirementId.join(", ") : "N/A"}
              </p>
              <p><strong>Candidate ID:</strong> {candidateId || "N/A"}</p>
              <p><strong>Role:</strong> {role || "N/A"}</p>
              <p><strong>Email:</strong> {email || "N/A"}</p>
              <p><strong>Phone:</strong> {phone || "N/A"}</p>
              <p><strong>Rate:</strong> {rate || "N/A"}</p>
              <p><strong>Current Location:</strong> {currentLocation || "N/A"}</p>
              <p><strong>Relocation:</strong> {relocation || "N/A"}</p>
              <p><strong>Passport Number:</strong> {passportnumber || "N/A"}</p>
              <p><strong>Last 4 SSN:</strong> {Last4digitsofSSN || "N/A"}</p>
              <p><strong>Visa Status:</strong> {VisaStatus || "N/A"}</p>
              <p>
                <strong>LinkedIn:</strong>{" "}
                {LinkedinUrl ? (
                  <a href={LinkedinUrl} target="_blank" rel="noopener noreferrer">
                    {LinkedinUrl}
                  </a>
                ) : (
                  "N/A"
                )}
              </p>
              <p><strong>Client Details:</strong> {clientdetails || "N/A"}</p>

              {candidate.folderId ? (
                <a
                  href={`https://drive.google.com/drive/folders/${candidate.folderId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-sm btn-outline-success me-2 mb-2"
                >
                  📁 View candidate Folder
                </a>
              ) : (
                <p className="text-muted">No folder link available</p>
              )}

            </div>
          </div>
        );
      })}

      {/* Pagination */}
      <div className="d-flex justify-content-end mt-3">
        <nav>
          <ul className="pagination mb-0">
            <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
              <button className="page-link" onClick={handlePrev}>
                &laquo;
              </button>
            </li>

            {Array.from({ length: totalPages }, (_, i) => (
              <li key={i} className={`page-item ${currentPage === i + 1 ? "active" : ""}`}>
                <button className="page-link" onClick={() => goToPage(i + 1)}>
                  {i + 1}
                </button>
              </li>
            ))}

            <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
              <button className="page-link" onClick={handleNext}>
                &raquo;
              </button>
            </li>
          </ul>
        </nav>
      </div>

      
    </>
  );
}
