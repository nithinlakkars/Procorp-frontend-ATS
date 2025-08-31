import React, { useState, useEffect } from "react";
import { updateCandidateFields } from "../../services"; // make sure this exists

// ✅ Helper to map status to Bootstrap badge variant
const getStatusVariant = (status) => {
  switch (status) {
    case "forwarded-to-sales": return "primary";
    case "on-hold": return "warning text-dark";
    case "L1-cleared": return "info";
    case "selected": return "success";
    case "rejected":
    case "internal-rejection": return "danger";
    case "Waiting-for-update":
    case "Decision-pending": return "warning";
    case "To-be-interviewed": return "primary";
    case "submitted":
    case "submitted-to-client": return "secondary";
    default: return "dark";
  }
};

export default function CandidateCardList({ candidates = [], loadCandidates }) {
  const itemsPerPage = 5;
  const [currentPage, setCurrentPage] = useState(1);
  const [activeStatus, setActiveStatus] = useState({});

  // Initialize activeStatus from candidates
  useEffect(() => {
    const initialStatus = {};
    candidates.forEach((candidate) => {
      initialStatus[candidate._id] = candidate.isActive || "not available";
    });
    setActiveStatus(initialStatus);
  }, [candidates]);

  // ✅ Handle active status change
  const handleToggleActive = async (candidateId, newStatus) => {
    try {
      console.log("Updating active status for:", candidateId, "New:", newStatus);
      await updateCandidateFields(candidateId, { isActive: newStatus });

      setActiveStatus((prev) => ({
        ...prev,
        [candidateId]: newStatus,
      }));

      console.log("✅ Active status updated locally and backend updated");
    } catch (error) {
      console.error("❌ Failed to update active status:", error);
    }
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
          folderId,
        } = candidate;

        return (
          <div key={_id} className="card border-0 shadow-sm mb-4">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="card-title mb-0">{name}</h5>

                {/* ✅ Active Status Dropdown */}
                <div>
                  <select
                    className="form-select form-select-sm"
                    value={activeStatus[_id] || "not available"}
                    onChange={(e) => handleToggleActive(_id, e.target.value)}
                  >
                    <option value="available">Available</option>
                    <option value="not available">Not Available</option>
                  </select>
                </div>
              </div>

              {/* ✅ Sales Status */}
              <p className="mt-2">
                <strong>Sales Status:</strong>{" "}
                <span className={`badge bg-${getStatusVariant(candidate_update)}`}>
                  {candidate_update || "Not Updated"}
                </span>
              </p>

              {/* Candidate Info */}
              <p><strong>Requirement ID{requirementId.length > 1 ? "s" : ""}:</strong> {requirementId.length ? requirementId.join(", ") : "N/A"}</p>
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
              <p><strong>LinkedIn:</strong> {LinkedinUrl ? <a href={LinkedinUrl} target="_blank" rel="noopener noreferrer">{LinkedinUrl}</a> : "N/A"}</p>
              <p><strong>Client Details:</strong> {clientdetails || "N/A"}</p>

              {folderId ? (
                <a
                  href={`https://drive.google.com/drive/folders/${folderId}`}
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
              <button className="page-link" onClick={handlePrev}>&laquo;</button>
            </li>
            {Array.from({ length: totalPages }, (_, i) => (
              <li key={i} className={`page-item ${currentPage === i + 1 ? "active" : ""}`}>
                <button className="page-link" onClick={() => goToPage(i + 1)}>{i + 1}</button>
              </li>
            ))}
            <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
              <button className="page-link" onClick={handleNext}>&raquo;</button>
            </li>
          </ul>
        </nav>
      </div>
    </>
  );
}
